"""
Testy jednostkowe dla modułu predict_books.py
Testowane funkcje:
- build_feature_vector()
- get_book_recommendations()
- get_book_validation()
"""

import pytest
import numpy as np
import pandas as pd
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from predict_books import build_feature_vector, FEATURE_COLS

# ─── Fixtures ─────────────────────────────────────────────────────────────────


@pytest.fixture
def sample_ratings():
    return pd.DataFrame(
        {
            "userId": [99, 99, 99, 100, 100, 101, 101, 101],
            "isbn": ["AAA", "BBB", "CCC", "AAA", "DDD", "BBB", "CCC", "DDD"],
            "rating": [9.0, 7.0, 8.0, 6.0, 9.0, 5.0, 8.0, 7.0],
        }
    )


@pytest.fixture
def sample_books():
    return pd.DataFrame(
        {
            "isbn": ["AAA", "BBB", "CCC", "DDD", "EEE"],
            "title": ["Book A", "Book B", "Book C", "Book D", "Book E"],
            "author": ["Author A", "Author B", "Author C", "Author D", "Author E"],
            "year": [2001.0, 1995.0, 2010.0, 1988.0, 2005.0],
            "publisher": ["Pub A", "Pub B", "Pub C", "Pub D", "Pub E"],
        }
    )


@pytest.fixture
def sample_users():
    return pd.DataFrame(
        {
            "userId": [99, 100, 101],
            "age": [30.0, 45.0, 25.0],
        }
    )


@pytest.fixture
def sample_book_stats(sample_ratings):
    return sample_ratings.groupby("isbn")["rating"].agg(["mean", "count"])


# ─── Testy build_feature_vector ───────────────────────────────────────────────


class TestBuildFeatureVector:

    def test_returns_list(self):
        vec = build_feature_vector(30.0, 7.5, 8.0, 100, 2001.0)
        assert isinstance(vec, list)

    def test_correct_length(self):
        vec = build_feature_vector(30.0, 7.5, 8.0, 100, 2001.0)
        assert len(vec) == len(FEATURE_COLS)

    def test_age_preserved(self):
        vec = build_feature_vector(35.0, 7.5, 8.0, 100, 2001.0)
        age_idx = FEATURE_COLS.index("age")
        assert vec[age_idx] == 35.0

    def test_user_avg_preserved(self):
        vec = build_feature_vector(30.0, 6.5, 8.0, 100, 2001.0)
        idx = FEATURE_COLS.index("user_avg_rating")
        assert vec[idx] == 6.5

    def test_book_avg_preserved(self):
        vec = build_feature_vector(30.0, 7.5, 9.2, 100, 2001.0)
        idx = FEATURE_COLS.index("book_avg_rating")
        assert vec[idx] == 9.2

    def test_book_count_preserved(self):
        vec = build_feature_vector(30.0, 7.5, 8.0, 250, 2001.0)
        idx = FEATURE_COLS.index("book_rating_count")
        assert vec[idx] == 250

    def test_year_preserved(self):
        vec = build_feature_vector(30.0, 7.5, 8.0, 100, 1999.0)
        idx = FEATURE_COLS.index("year")
        assert vec[idx] == 1999.0

    def test_no_nan_values(self):
        vec = build_feature_vector(30.0, 7.5, 8.0, 100, 2001.0)
        assert not any(v != v for v in vec)

    def test_all_numeric(self):
        vec = build_feature_vector(30.0, 7.5, 8.0, 100, 2001.0)
        for v in vec:
            assert isinstance(v, (int, float))


# ─── Testy get_book_recommendations ──────────────────────────────────────────


class TestGetBookRecommendations:

    def test_returns_list(
        self, sample_ratings, sample_books, sample_users, sample_book_stats
    ):
        from predict_books import get_book_recommendations

        result = get_book_recommendations(
            99,
            sample_ratings,
            sample_books,
            sample_users,
            top_n=2,
            book_stats=sample_book_stats,
        )
        assert isinstance(result, list)

    def test_correct_top_n(
        self, sample_ratings, sample_books, sample_users, sample_book_stats
    ):
        from predict_books import get_book_recommendations

        result = get_book_recommendations(
            99,
            sample_ratings,
            sample_books,
            sample_users,
            top_n=2,
            book_stats=sample_book_stats,
        )
        assert len(result) <= 2

    def test_result_has_required_keys(
        self, sample_ratings, sample_books, sample_users, sample_book_stats
    ):
        from predict_books import get_book_recommendations

        result = get_book_recommendations(
            99,
            sample_ratings,
            sample_books,
            sample_users,
            top_n=2,
            book_stats=sample_book_stats,
        )
        if result:
            for rec in result:
                assert "isbn" in rec
                assert "title" in rec
                assert "author" in rec
                assert "predicted_rating" in rec

    def test_predicted_rating_in_range(
        self, sample_ratings, sample_books, sample_users, sample_book_stats
    ):
        from predict_books import get_book_recommendations

        result = get_book_recommendations(
            99,
            sample_ratings,
            sample_books,
            sample_users,
            top_n=5,
            book_stats=sample_book_stats,
        )
        for rec in result:
            assert 1.0 <= rec["predicted_rating"] <= 10.0

    def test_no_already_rated_books(
        self, sample_ratings, sample_books, sample_users, sample_book_stats
    ):
        from predict_books import get_book_recommendations

        rated_by_99 = set(sample_ratings[sample_ratings["userId"] == 99]["isbn"])
        result = get_book_recommendations(
            99,
            sample_ratings,
            sample_books,
            sample_users,
            top_n=10,
            book_stats=sample_book_stats,
        )
        for rec in result:
            assert rec["isbn"] not in rated_by_99

    def test_sorted_by_predicted_rating(
        self, sample_ratings, sample_books, sample_users, sample_book_stats
    ):
        from predict_books import get_book_recommendations

        result = get_book_recommendations(
            99,
            sample_ratings,
            sample_books,
            sample_users,
            top_n=5,
            book_stats=sample_book_stats,
        )
        ratings_list = [r["predicted_rating"] for r in result]
        assert ratings_list == sorted(ratings_list, reverse=True)


# ─── Testy get_book_recommendations_logistic ─────────────────────────────────


class TestGetBookRecommendationsLogistic:

    def test_returns_list(
        self, sample_ratings, sample_books, sample_users, sample_book_stats
    ):
        from predict_books import get_book_recommendations_logistic

        result = get_book_recommendations_logistic(
            99,
            sample_ratings,
            sample_books,
            sample_users,
            top_n=2,
            book_stats=sample_book_stats,
        )
        assert isinstance(result, list)

    def test_result_has_like_probability(
        self, sample_ratings, sample_books, sample_users, sample_book_stats
    ):
        from predict_books import get_book_recommendations_logistic

        result = get_book_recommendations_logistic(
            99,
            sample_ratings,
            sample_books,
            sample_users,
            top_n=2,
            book_stats=sample_book_stats,
        )
        if result:
            assert "like_probability" in result[0]

    def test_like_probability_in_range(
        self, sample_ratings, sample_books, sample_users, sample_book_stats
    ):
        from predict_books import get_book_recommendations_logistic

        result = get_book_recommendations_logistic(
            99,
            sample_ratings,
            sample_books,
            sample_users,
            top_n=5,
            book_stats=sample_book_stats,
        )
        for rec in result:
            assert 0.0 <= rec["like_probability"] <= 1.0

    def test_no_already_rated_books(
        self, sample_ratings, sample_books, sample_users, sample_book_stats
    ):
        from predict_books import get_book_recommendations_logistic

        rated_by_99 = set(sample_ratings[sample_ratings["userId"] == 99]["isbn"])
        result = get_book_recommendations_logistic(
            99,
            sample_ratings,
            sample_books,
            sample_users,
            top_n=10,
            book_stats=sample_book_stats,
        )
        for rec in result:
            assert rec["isbn"] not in rated_by_99


# ─── Testy get_book_validation ───────────────────────────────────────────────


class TestGetBookValidation:

    def test_returns_dict_with_required_keys(
        self, sample_ratings, sample_books, sample_users, sample_book_stats
    ):
        from predict_books import get_book_validation

        result = get_book_validation(
            99, sample_ratings, sample_books, sample_users, book_stats=sample_book_stats
        )
        assert "userId" in result
        assert "rmse" in result
        assert "mae" in result
        assert "count" in result
        assert "samples" in result

    def test_rmse_non_negative(
        self, sample_ratings, sample_books, sample_users, sample_book_stats
    ):
        from predict_books import get_book_validation

        result = get_book_validation(
            99, sample_ratings, sample_books, sample_users, book_stats=sample_book_stats
        )
        assert result["rmse"] >= 0

    def test_mae_non_negative(
        self, sample_ratings, sample_books, sample_users, sample_book_stats
    ):
        from predict_books import get_book_validation

        result = get_book_validation(
            99, sample_ratings, sample_books, sample_users, book_stats=sample_book_stats
        )
        assert result["mae"] >= 0

    def test_count_matches_user_ratings(
        self, sample_ratings, sample_books, sample_users, sample_book_stats
    ):
        from predict_books import get_book_validation

        result = get_book_validation(
            99, sample_ratings, sample_books, sample_users, book_stats=sample_book_stats
        )
        expected = len(sample_ratings[sample_ratings["userId"] == 99])
        assert result["count"] == expected

    def test_empty_user_returns_zero_metrics(
        self, sample_ratings, sample_books, sample_users, sample_book_stats
    ):
        from predict_books import get_book_validation

        # dodaj usera 999 do sample_users ale bez ocen w ratings
        users_with_999 = pd.concat(
            [sample_users, pd.DataFrame({"userId": [999], "age": [30.0]})]
        ).reset_index(drop=True)
        result = get_book_validation(
            999,
            sample_ratings,
            sample_books,
            users_with_999,
            book_stats=sample_book_stats,
        )
        assert result["count"] == 0
        assert result["rmse"] == 0.0
        assert result["mae"] == 0.0

    def test_samples_have_required_keys(
        self, sample_ratings, sample_books, sample_users, sample_book_stats
    ):
        from predict_books import get_book_validation

        result = get_book_validation(
            99, sample_ratings, sample_books, sample_users, book_stats=sample_book_stats
        )
        for s in result["samples"]:
            assert "title" in s
            assert "author" in s
            assert "actual" in s
            assert "predicted" in s
