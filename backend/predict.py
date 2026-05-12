import numpy as np
import pandas as pd
import joblib
import os

MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")

# wczytaj artefakty raz przy starcie
lr = joblib.load(os.path.join(MODEL_DIR, "linear_model.pkl"))
scaler = joblib.load(os.path.join(MODEL_DIR, "scaler.pkl"))
FEATURE_COLS = joblib.load(os.path.join(MODEL_DIR, "feature_cols.pkl"))

ALL_GENRES = [
    "Action",
    "Adventure",
    "Animation",
    "Children's",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Fantasy",
    "Film-Noir",
    "Horror",
    "Musical",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Thriller",
    "War",
    "Western",
]

ALL_OCCUPATIONS = list(range(21))  # 0–20


def build_feature_vector(user_row, movie_row, user_avg, movie_avg, movie_count):
    """Buduje wektor cech dla pary (użytkownik, film)."""
    features = {}

    # cechy użytkownika
    features["age"] = user_row["age"]
    features["gender_encoded"] = 1 if user_row["gender"] == "M" else 0
    features["user_avg_rating"] = user_avg
    features["movie_avg_rating"] = movie_avg
    features["movie_rating_count"] = movie_count

    # rok z tytułu
    import re

    match = re.search(r"\((\d{4})\)", movie_row["title"])
    features["year"] = float(match.group(1)) if match else 1995.0

    # gatunki (one-hot)
    movie_genres = movie_row["genres"].split("|")
    for g in ALL_GENRES:
        features[g] = 1 if g in movie_genres else 0

    # zawód (one-hot)
    for occ in ALL_OCCUPATIONS:
        features[f"occ_{occ}"] = 1 if user_row["occupation"] == occ else 0

    # zwróć w kolejności FEATURE_COLS
    return [features.get(col, 0) for col in FEATURE_COLS]


def get_recommendations(userId, ratings, movies, users, top_n=10):
    """Zwraca top_n rekomendacji dla danego użytkownika."""

    user_row = users[users["userId"] == userId].iloc[0]

    # filmy których user jeszcze nie oceniał
    rated_movies = set(ratings[ratings["userId"] == userId]["movieId"])
    unrated = movies[~movies["movieId"].isin(rated_movies)].copy()

    # statystyki agregowane
    user_avg = ratings[ratings["userId"] == userId]["rating"].mean()
    movie_stats = ratings.groupby("movieId")["rating"].agg(["mean", "count"])

    # buduj wektory cech dla wszystkich nieocenionych filmów
    vectors = []
    for _, movie_row in unrated.iterrows():
        mid = movie_row["movieId"]
        m_avg = movie_stats.loc[mid, "mean"] if mid in movie_stats.index else 3.5
        m_count = movie_stats.loc[mid, "count"] if mid in movie_stats.index else 0
        vec = build_feature_vector(user_row, movie_row, user_avg, m_avg, m_count)
        vectors.append(vec)

    X = scaler.transform(np.array(vectors))
    predicted_ratings = lr.predict(X)
    predicted_ratings = np.clip(predicted_ratings, 1.0, 5.0)

    unrated = unrated.copy()
    unrated["predicted_rating"] = predicted_ratings
    top = unrated.nlargest(top_n, "predicted_rating")

    return top[["movieId", "title", "genres", "predicted_rating"]].to_dict(
        orient="records"
    )


def get_validation(userId, ratings, movies, users):
    """Porównuje przewidywane vs rzeczywiste oceny dla danego użytkownika."""

    user_row = users[users["userId"] == userId].iloc[0]
    user_ratings = ratings[ratings["userId"] == userId].merge(movies, on="movieId")

    user_avg = user_ratings["rating"].mean()
    movie_stats = ratings.groupby("movieId")["rating"].agg(["mean", "count"])

    vectors = []
    for _, row in user_ratings.iterrows():
        mid = row["movieId"]
        m_avg = movie_stats.loc[mid, "mean"] if mid in movie_stats.index else 3.5
        m_count = movie_stats.loc[mid, "count"] if mid in movie_stats.index else 0
        vec = build_feature_vector(user_row, row, user_avg, m_avg, m_count)
        vectors.append(vec)

    X = scaler.transform(np.array(vectors))
    predicted = np.clip(lr.predict(X), 1.0, 5.0)
    actual = user_ratings["rating"].values

    rmse = float(np.sqrt(np.mean((actual - predicted) ** 2)))
    mae = float(np.mean(np.abs(actual - predicted)))

    return {
        "userId": userId,
        "rmse": round(rmse, 4),
        "mae": round(mae, 4),
        "count": len(actual),
        "samples": [
            {
                "title": row["title"],
                "actual": int(actual[i]),
                "predicted": round(float(predicted[i]), 2),
            }
            for i, (_, row) in enumerate(user_ratings.head(20).iterrows())
        ],
    }
