"""
Testy integracyjne dla FastAPI endpoints.
Używają TestClient który uruchamia aplikację in-memory bez potrzeby
uruchamiania serwera — każde zapytanie jest obsługiwane bezpośrednio.
"""

import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from main import app

client = TestClient(app)


# ─── Root ─────────────────────────────────────────────────────────────────────


class TestRoot:

    def test_root_returns_200(self):
        res = client.get("/")
        assert res.status_code == 200

    def test_root_returns_ok_status(self):
        res = client.get("/")
        assert res.json()["status"] == "ok"


# ─── /user/{userId} ───────────────────────────────────────────────────────────


class TestUserEndpoint:

    def test_valid_user_returns_200(self):
        res = client.get("/user/1")
        assert res.status_code == 200

    def test_invalid_user_returns_404(self):
        res = client.get("/user/99999")
        assert res.status_code == 404

    def test_user_response_has_required_keys(self):
        res = client.get("/user/1")
        data = res.json()
        assert "userId" in data
        assert "gender" in data
        assert "age" in data
        assert "occupation" in data
        assert "ratingsCount" in data
        assert "avgRating" in data

    def test_user_id_matches(self):
        res = client.get("/user/1")
        assert res.json()["userId"] == 1

    def test_gender_is_valid(self):
        res = client.get("/user/1")
        assert res.json()["gender"] in ["M", "F"]

    def test_ratings_count_positive(self):
        res = client.get("/user/1")
        assert res.json()["ratingsCount"] > 0


# ─── /recommend/{userId} ──────────────────────────────────────────────────────


class TestRecommendEndpoint:

    def test_valid_user_returns_200(self):
        res = client.get("/recommend/1")
        assert res.status_code == 200

    def test_invalid_user_returns_404(self):
        res = client.get("/recommend/99999")
        assert res.status_code == 404

    def test_response_has_recommendations_key(self):
        res = client.get("/recommend/1")
        assert "recommendations" in res.json()

    def test_default_top_n_is_10(self):
        res = client.get("/recommend/1")
        assert len(res.json()["recommendations"]) == 10

    def test_custom_top_n(self):
        res = client.get("/recommend/1?top_n=5")
        assert len(res.json()["recommendations"]) == 5

    def test_recommendation_has_required_keys(self):
        res = client.get("/recommend/1")
        rec = res.json()["recommendations"][0]
        assert "movieId" in rec
        assert "title" in rec
        assert "genres" in rec
        assert "predicted_rating" in rec

    def test_predicted_rating_in_range(self):
        res = client.get("/recommend/1")
        for rec in res.json()["recommendations"]:
            assert 1.0 <= rec["predicted_rating"] <= 5.0


# ─── /recommend-logistic/{userId} ────────────────────────────────────────────


class TestRecommendLogisticEndpoint:

    def test_valid_user_returns_200(self):
        res = client.get("/recommend-logistic/1")
        assert res.status_code == 200

    def test_invalid_user_returns_404(self):
        res = client.get("/recommend-logistic/99999")
        assert res.status_code == 404

    def test_response_has_recommendations_key(self):
        res = client.get("/recommend-logistic/1")
        assert "recommendations" in res.json()

    def test_recommendation_has_like_probability(self):
        res = client.get("/recommend-logistic/1")
        rec = res.json()["recommendations"][0]
        assert "like_probability" in rec

    def test_like_probability_in_range(self):
        res = client.get("/recommend-logistic/1")
        for rec in res.json()["recommendations"]:
            assert 0.0 <= rec["like_probability"] <= 1.0


# ─── /validate/{userId} ───────────────────────────────────────────────────────


class TestValidateEndpoint:

    def test_valid_user_returns_200(self):
        res = client.get("/validate/1")
        assert res.status_code == 200

    def test_invalid_user_returns_404(self):
        res = client.get("/validate/99999")
        assert res.status_code == 404

    def test_response_has_metrics(self):
        res = client.get("/validate/1")
        data = res.json()
        assert "rmse" in data
        assert "mae" in data
        assert "count" in data
        assert "samples" in data

    def test_rmse_non_negative(self):
        res = client.get("/validate/1")
        assert res.json()["rmse"] >= 0

    def test_mae_non_negative(self):
        res = client.get("/validate/1")
        assert res.json()["mae"] >= 0


# ─── /similar-users ───────────────────────────────────────────────────────────


class TestSimilarUsersEndpoint:

    def test_returns_200(self):
        res = client.get("/similar-users")
        assert res.status_code == 200

    def test_filter_by_gender(self):
        res = client.get("/similar-users?gender=M")
        data = res.json()
        assert data["count"] > 0
        for u in data["users"]:
            assert u["gender"] == "M"

    def test_response_has_count_and_users(self):
        res = client.get("/similar-users")
        assert "count" in res.json()
        assert "users" in res.json()


# ─── /recommend-new-user ──────────────────────────────────────────────────────


class TestNewUserEndpoint:

    def test_valid_request_returns_200(self):
        res = client.post(
            "/recommend-new-user",
            json={
                "ratings": [
                    {"movieId": 1, "rating": 5.0},
                    {"movieId": 2, "rating": 3.0},
                    {"movieId": 3, "rating": 4.0},
                ],
                "age": 25,
                "gender": "M",
                "occupation": 4,
            },
        )
        assert res.status_code == 200

    def test_too_few_ratings_returns_400(self):
        res = client.post(
            "/recommend-new-user",
            json={
                "ratings": [{"movieId": 1, "rating": 5.0}],
                "age": 25,
                "gender": "M",
                "occupation": 4,
            },
        )
        assert res.status_code == 400

    def test_response_has_linear_logistic_combined(self):
        res = client.post(
            "/recommend-new-user",
            json={
                "ratings": [
                    {"movieId": 1, "rating": 5.0},
                    {"movieId": 2, "rating": 3.0},
                    {"movieId": 3, "rating": 4.0},
                ],
                "age": 25,
                "gender": "M",
                "occupation": 4,
            },
        )
        data = res.json()
        assert "linear" in data
        assert "logistic" in data
        assert "combined" in data


# ─── /user-taste/{userId} ─────────────────────────────────────────────────────


class TestUserTasteEndpoint:

    def test_valid_user_returns_200(self):
        res = client.get("/user-taste/1")
        assert res.status_code == 200

    def test_invalid_user_returns_404(self):
        res = client.get("/user-taste/99999")
        assert res.status_code == 404

    def test_response_has_taste_keys(self):
        res = client.get("/user-taste/1")
        data = res.json()
        assert "lubi" in data
        assert "srednie" in data
        assert "slabe" in data
        assert "stats" in data


# ─── /explain/{userId}/{movieId} ─────────────────────────────────────────────


class TestExplainEndpoint:

    def test_valid_request_returns_200(self):
        res = client.get("/explain/1/1")
        assert res.status_code == 200

    def test_invalid_user_returns_404(self):
        res = client.get("/explain/99999/1")
        assert res.status_code == 404

    def test_response_has_top_features(self):
        res = client.get("/explain/1/1")
        data = res.json()
        assert "top_features" in data
        assert len(data["top_features"]) == 3

    def test_features_have_direction(self):
        res = client.get("/explain/1/1")
        for f in res.json()["top_features"]:
            assert f["direction"] in ["+", "-"]


# ─── /books/* ────────────────────────────────────────────────────────────────


class TestBooksEndpoints:

    def test_books_random_user_returns_200(self):
        res = client.get("/books/random-user")
        assert res.status_code == 200
        assert "userId" in res.json()

    def test_books_valid_user_returns_200(self):
        res = client.get("/books/random-user")
        uid = res.json()["userId"]
        res2 = client.get(f"/books/user/{uid}")
        assert res2.status_code == 200

    def test_books_invalid_user_returns_404(self):
        res = client.get("/books/user/999999999")
        assert res.status_code == 404

    def test_books_recommend_returns_recommendations(self):
        res = client.get("/books/similar-users?min_ratings=50&limit=1")
        users = res.json()["users"]
        if not users:
            pytest.skip("Brak użytkowników z min 50 ocen")
        uid = users[0]["userId"]
        res2 = client.get(f"/books/recommend/{uid}")
        assert res2.status_code == 200
        assert "recommendations" in res2.json()

    def test_books_similar_users_returns_200(self):
        res = client.get("/books/similar-users")
        assert res.status_code == 200
        assert "users" in res.json()

    def test_books_new_user_too_few_ratings(self):
        res = client.post(
            "/books/recommend-new-user",
            json={"ratings": [{"isbn": "0316769177", "rating": 8.0}], "age": 25},
        )
        assert res.status_code == 400

    def test_books_new_user_valid_request(self):
        res = client.post(
            "/books/recommend-new-user",
            json={
                "ratings": [
                    {"isbn": "0316769177", "rating": 8.0},
                    {"isbn": "0061096229", "rating": 9.0},
                    {"isbn": "0743273567", "rating": 7.0},
                ],
                "age": 25,
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "linear" in data
        assert "logistic" in data
