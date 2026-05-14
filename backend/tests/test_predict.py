"""
Testy jednostkowe dla modułu predict.py
Testowane funkcje:
- build_feature_vector()
- get_recommendations()
- get_validation()
"""
import pytest
import numpy as np
import pandas as pd
import sys
import os

# dodaj backend do path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from predict import build_feature_vector, FEATURE_COLS


# ─── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture
def sample_user_row():
    return pd.Series({
        'userId': 1,
        'gender': 'M',
        'age': 25,
        'occupation': 4,
        'zip': '12345'
    })

@pytest.fixture
def sample_user_row_female():
    return pd.Series({
        'userId': 2,
        'gender': 'F',
        'age': 35,
        'occupation': 7,
        'zip': '54321'
    })

@pytest.fixture
def sample_movie_row():
    return pd.Series({
        'movieId': 1,
        'title': 'Toy Story (1995)',
        'genres': 'Animation|Children\'s|Comedy'
    })

@pytest.fixture
def sample_movie_row_action():
    return pd.Series({
        'movieId': 260,
        'title': 'Star Wars: Episode IV (1977)',
        'genres': 'Action|Adventure|Sci-Fi'
    })

@pytest.fixture
def sample_ratings():
    return pd.DataFrame({
        'userId': [1, 1, 1, 2, 2, 3],
        'movieId': [1, 2, 3, 1, 4, 2],
        'rating': [5.0, 3.0, 4.0, 2.0, 5.0, 4.0],
        'timestamp': [1000, 1001, 1002, 1003, 1004, 1005]
    })

@pytest.fixture
def sample_movies():
    return pd.DataFrame({
        'movieId': [1, 2, 3, 4],
        'title': ['Toy Story (1995)', 'Jumanji (1995)', 'Matrix (1999)', 'Gladiator (2000)'],
        'genres': ["Animation|Children's|Comedy", 'Adventure|Fantasy', 'Action|Sci-Fi', 'Action|Drama']
    })

@pytest.fixture
def sample_users():
    return pd.DataFrame({
        'userId': [1, 2, 3],
        'gender': ['M', 'F', 'M'],
        'age': [25, 35, 45],
        'occupation': [4, 7, 1],
        'zip': ['11111', '22222', '33333']
    })


# ─── Testy build_feature_vector ───────────────────────────────────────────────

class TestBuildFeatureVector:

    def test_returns_list(self, sample_user_row, sample_movie_row):
        """Funkcja powinna zwrócić listę."""
        vec = build_feature_vector(sample_user_row, sample_movie_row, 4.0, 3.5, 100)
        assert isinstance(vec, list)

    def test_correct_length(self, sample_user_row, sample_movie_row):
        """Długość wektora powinna być równa liczbie cech."""
        vec = build_feature_vector(sample_user_row, sample_movie_row, 4.0, 3.5, 100)
        assert len(vec) == len(FEATURE_COLS)

    def test_gender_male_encoded_as_1(self, sample_user_row, sample_movie_row):
        """Płeć M powinna być zakodowana jako 1."""
        vec = build_feature_vector(sample_user_row, sample_movie_row, 4.0, 3.5, 100)
        gender_idx = FEATURE_COLS.index('gender_encoded')
        assert vec[gender_idx] == 1

    def test_gender_female_encoded_as_0(self, sample_user_row_female, sample_movie_row):
        """Płeć F powinna być zakodowana jako 0."""
        vec = build_feature_vector(sample_user_row_female, sample_movie_row, 4.0, 3.5, 100)
        gender_idx = FEATURE_COLS.index('gender_encoded')
        assert vec[gender_idx] == 0

    def test_age_preserved(self, sample_user_row, sample_movie_row):
        """Wiek użytkownika powinien być zachowany."""
        vec = build_feature_vector(sample_user_row, sample_movie_row, 4.0, 3.5, 100)
        age_idx = FEATURE_COLS.index('age')
        assert vec[age_idx] == 25

    def test_user_avg_rating_preserved(self, sample_user_row, sample_movie_row):
        """Średnia ocen użytkownika powinna być zachowana."""
        vec = build_feature_vector(sample_user_row, sample_movie_row, 4.2, 3.5, 100)
        avg_idx = FEATURE_COLS.index('user_avg_rating')
        assert vec[avg_idx] == 4.2

    def test_movie_avg_rating_preserved(self, sample_user_row, sample_movie_row):
        """Średnia ocen filmu powinna być zachowana."""
        vec = build_feature_vector(sample_user_row, sample_movie_row, 4.0, 3.8, 100)
        avg_idx = FEATURE_COLS.index('movie_avg_rating')
        assert vec[avg_idx] == 3.8

    def test_movie_count_preserved(self, sample_user_row, sample_movie_row):
        """Liczba ocen filmu powinna być zachowana."""
        vec = build_feature_vector(sample_user_row, sample_movie_row, 4.0, 3.5, 250)
        count_idx = FEATURE_COLS.index('movie_rating_count')
        assert vec[count_idx] == 250

    def test_year_extracted_from_title(self, sample_user_row, sample_movie_row):
        """Rok powinien być wyciągnięty z tytułu (1995)."""
        vec = build_feature_vector(sample_user_row, sample_movie_row, 4.0, 3.5, 100)
        year_idx = FEATURE_COLS.index('year')
        assert vec[year_idx] == 1995.0

    def test_year_fallback_when_missing(self, sample_user_row):
        """Gdy brak roku w tytule, powinien być użyty fallback 1995.0."""
        movie_no_year = pd.Series({
            'movieId': 99,
            'title': 'Unknown Movie',
            'genres': 'Drama'
        })
        vec = build_feature_vector(sample_user_row, movie_no_year, 4.0, 3.5, 100)
        year_idx = FEATURE_COLS.index('year')
        assert vec[year_idx] == 1995.0

    def test_genre_one_hot_animation(self, sample_user_row, sample_movie_row):
        """Film z gatunkiem Animation powinien mieć 1 w odpowiedniej kolumnie."""
        vec = build_feature_vector(sample_user_row, sample_movie_row, 4.0, 3.5, 100)
        anim_idx = FEATURE_COLS.index('Animation')
        assert vec[anim_idx] == 1

    def test_genre_one_hot_action_absent(self, sample_user_row, sample_movie_row):
        """Film bez gatunku Action powinien mieć 0 w kolumnie Action."""
        vec = build_feature_vector(sample_user_row, sample_movie_row, 4.0, 3.5, 100)
        action_idx = FEATURE_COLS.index('Action')
        assert vec[action_idx] == 0

    def test_genre_one_hot_action_present(self, sample_user_row, sample_movie_row_action):
        """Film z gatunkiem Action powinien mieć 1 w kolumnie Action."""
        vec = build_feature_vector(sample_user_row, sample_movie_row_action, 4.0, 3.5, 100)
        action_idx = FEATURE_COLS.index('Action')
        assert vec[action_idx] == 1

    def test_occupation_one_hot_correct(self, sample_user_row, sample_movie_row):
        """Zawód 4 (student) powinien mieć 1 w kolumnie occ_4."""
        vec = build_feature_vector(sample_user_row, sample_movie_row, 4.0, 3.5, 100)
        occ_idx = FEATURE_COLS.index('occ_4')
        assert vec[occ_idx] == 1

    def test_occupation_one_hot_others_zero(self, sample_user_row, sample_movie_row):
        """Inne zawody powinny mieć 0."""
        vec = build_feature_vector(sample_user_row, sample_movie_row, 4.0, 3.5, 100)
        for i in range(21):
            if i != 4:
                occ_idx = FEATURE_COLS.index(f'occ_{i}')
                assert vec[occ_idx] == 0

    def test_no_nan_values(self, sample_user_row, sample_movie_row):
        """Wektor nie powinien zawierać wartości NaN."""
        vec = build_feature_vector(sample_user_row, sample_movie_row, 4.0, 3.5, 100)
        assert not any(v != v for v in vec)  # NaN != NaN

    def test_all_numeric(self, sample_user_row, sample_movie_row):
        """Wszystkie wartości powinny być numeryczne."""
        vec = build_feature_vector(sample_user_row, sample_movie_row, 4.0, 3.5, 100)
        for v in vec:
            assert isinstance(v, (int, float))


# ─── Testy get_recommendations ────────────────────────────────────────────────

class TestGetRecommendations:

    def test_returns_list(self, sample_ratings, sample_movies, sample_users):
        """Funkcja powinna zwrócić listę."""
        from predict import get_recommendations
        result = get_recommendations(1, sample_ratings, sample_movies, sample_users, top_n=2)
        assert isinstance(result, list)

    def test_correct_top_n(self, sample_ratings, sample_movies, sample_users):
        """Liczba rekomendacji nie powinna przekraczać top_n."""
        from predict import get_recommendations
        result = get_recommendations(1, sample_ratings, sample_movies, sample_users, top_n=2)
        assert len(result) <= 2

    def test_result_has_required_keys(self, sample_ratings, sample_movies, sample_users):
        """Każdy wynik powinien mieć klucze movieId, title, genres, predicted_rating."""
        from predict import get_recommendations
        result = get_recommendations(1, sample_ratings, sample_movies, sample_users, top_n=2)
        if result:
            for rec in result:
                assert 'movieId' in rec
                assert 'title' in rec
                assert 'genres' in rec
                assert 'predicted_rating' in rec

    def test_predicted_rating_in_range(self, sample_ratings, sample_movies, sample_users):
        """Przewidywane oceny powinny być w zakresie 1–5."""
        from predict import get_recommendations
        result = get_recommendations(1, sample_ratings, sample_movies, sample_users, top_n=5)
        for rec in result:
            assert 1.0 <= rec['predicted_rating'] <= 5.0

    def test_no_already_rated_movies(self, sample_ratings, sample_movies, sample_users):
        """Rekomendacje nie powinny zawierać filmów już ocenionych przez użytkownika."""
        from predict import get_recommendations
        rated_by_user1 = set(sample_ratings[sample_ratings['userId'] == 1]['movieId'])
        result = get_recommendations(1, sample_ratings, sample_movies, sample_users, top_n=10)
        for rec in result:
            assert rec['movieId'] not in rated_by_user1

    def test_sorted_by_predicted_rating(self, sample_ratings, sample_movies, sample_users):
        """Rekomendacje powinny być posortowane malejąco po predicted_rating."""
        from predict import get_recommendations
        result = get_recommendations(1, sample_ratings, sample_movies, sample_users, top_n=5)
        ratings_list = [r['predicted_rating'] for r in result]
        assert ratings_list == sorted(ratings_list, reverse=True)


# ─── Testy get_validation ─────────────────────────────────────────────────────

class TestGetValidation:

    def test_returns_dict_with_required_keys(self, sample_ratings, sample_movies, sample_users):
        """Wynik walidacji powinien zawierać klucze userId, rmse, mae, count, samples."""
        from predict import get_validation
        result = get_validation(1, sample_ratings, sample_movies, sample_users)
        assert 'userId' in result
        assert 'rmse' in result
        assert 'mae' in result
        assert 'count' in result
        assert 'samples' in result

    def test_rmse_non_negative(self, sample_ratings, sample_movies, sample_users):
        """RMSE powinno być nieujemne."""
        from predict import get_validation
        result = get_validation(1, sample_ratings, sample_movies, sample_users)
        assert result['rmse'] >= 0

    def test_mae_non_negative(self, sample_ratings, sample_movies, sample_users):
        """MAE powinno być nieujemne."""
        from predict import get_validation
        result = get_validation(1, sample_ratings, sample_movies, sample_users)
        assert result['mae'] >= 0

    def test_count_matches_user_ratings(self, sample_ratings, sample_movies, sample_users):
        """count powinien odpowiadać liczbie ocen użytkownika."""
        from predict import get_validation
        result = get_validation(1, sample_ratings, sample_movies, sample_users)
        user_ratings_count = len(sample_ratings[sample_ratings['userId'] == 1])
        assert result['count'] == user_ratings_count

    def test_samples_have_required_keys(self, sample_ratings, sample_movies, sample_users):
        """Każda próbka powinna mieć klucze title, genres, actual, predicted."""
        from predict import get_validation
        result = get_validation(1, sample_ratings, sample_movies, sample_users)
        for s in result['samples']:
            assert 'title' in s
            assert 'genres' in s
            assert 'actual' in s
            assert 'predicted' in s

    def test_actual_ratings_correct(self, sample_ratings, sample_movies, sample_users):
        """Rzeczywiste oceny w próbce powinny odpowiadać danym wejściowym."""
        from predict import get_validation
        result = get_validation(1, sample_ratings, sample_movies, sample_users)
        actual_ratings = {s['actual'] for s in result['samples']}
        expected = set(sample_ratings[sample_ratings['userId'] == 1]['rating'].astype(int))
        assert actual_ratings == expected
