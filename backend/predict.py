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

    X = X = scaler.transform(pd.DataFrame(vectors, columns=FEATURE_COLS))
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


def get_recommendations_logistic(userId, ratings, movies, users, top_n=10):
    """Rekomendacje na podstawie regresji logistycznej (prawdopodobieństwo polubienia)."""
    log_reg = joblib.load(os.path.join(MODEL_DIR, "logistic_model.pkl"))

    user_row = users[users["userId"] == userId].iloc[0]
    rated_movies = set(ratings[ratings["userId"] == userId]["movieId"])
    unrated = movies[~movies["movieId"].isin(rated_movies)].copy()
    user_avg = ratings[ratings["userId"] == userId]["rating"].mean()
    movie_stats = ratings.groupby("movieId")["rating"].agg(["mean", "count"])

    vectors = []
    for _, movie_row in unrated.iterrows():
        mid = movie_row["movieId"]
        m_avg = movie_stats.loc[mid, "mean"] if mid in movie_stats.index else 3.5
        m_count = movie_stats.loc[mid, "count"] if mid in movie_stats.index else 0
        vec = build_feature_vector(user_row, movie_row, user_avg, m_avg, m_count)
        vectors.append(vec)

    X = X = scaler.transform(pd.DataFrame(vectors, columns=FEATURE_COLS))
    probabilities = log_reg.predict_proba(X)[:, 1]

    unrated = unrated.copy()
    unrated["like_probability"] = probabilities
    top = unrated.nlargest(top_n, "like_probability")

    return (
        top[["movieId", "title", "genres", "like_probability"]]
        .assign(like_probability=lambda x: x["like_probability"].round(4))
        .to_dict(orient="records")
    )


def get_similar_users(gender=None, age=None, occupation=None, limit=20):
    """Zwraca listę użytkowników pasujących do filtrów demograficznych."""
    from data_loader import load_data

    ratings, movies, users = load_data()

    filtered = users.copy()

    if gender is not None:
        filtered = filtered[filtered["gender"] == gender]
    if age is not None:
        filtered = filtered[filtered["age"] == age]
    if occupation is not None:
        filtered = filtered[filtered["occupation"] == occupation]

    if len(filtered) == 0:
        return []

    # dodaj statystyki
    user_stats = (
        ratings.groupby("userId")["rating"].agg(["count", "mean"]).reset_index()
    )
    user_stats.columns = ["userId", "ratingsCount", "avgRating"]

    filtered = filtered.merge(user_stats, on="userId", how="left")
    filtered = filtered.sort_values("ratingsCount", ascending=False).head(limit)

    return (
        filtered[["userId", "gender", "age", "occupation", "ratingsCount", "avgRating"]]
        .fillna(0)
        .to_dict(orient="records")
    )


def get_new_user_recommendations(
    user_ratings_input, age=25, gender="M", occupation=4, top_n=10
):
    """
    Generuje rekomendacje dla nowego użytkownika na podstawie
    kilku ocen które właśnie wystawił — cold start onboarding.

    user_ratings_input: lista słowników [{movieId: int, rating: float}]
    """
    from data_loader import load_data

    ratings, movies, users = load_data()

    # zbuduj tymczasowy profil użytkownika
    rated_ids = [r["movieId"] for r in user_ratings_input]
    rated_dict = {r["movieId"]: r["rating"] for r in user_ratings_input}
    user_avg = np.mean([r["rating"] for r in user_ratings_input])

    # tymczasowy wiersz użytkownika
    user_row = pd.Series(
        {
            "userId": -1,
            "gender": gender,
            "age": age,
            "occupation": occupation,
            "zip": "00000",
        }
    )

    # filmy których user jeszcze nie oceniał
    unrated = movies[~movies["movieId"].isin(rated_ids)].copy()
    movie_stats = ratings.groupby("movieId")["rating"].agg(["mean", "count"])

    vectors = []
    for _, movie_row in unrated.iterrows():
        mid = movie_row["movieId"]
        m_avg = movie_stats.loc[mid, "mean"] if mid in movie_stats.index else 3.5
        m_count = movie_stats.loc[mid, "count"] if mid in movie_stats.index else 0
        vec = build_feature_vector(user_row, movie_row, user_avg, m_avg, m_count)
        vectors.append(vec)

    X = scaler.transform(pd.DataFrame(vectors, columns=FEATURE_COLS))

    # regresja liniowa
    pred_linear = np.clip(lr.predict(X), 1.0, 5.0)

    # regresja logistyczna z optymalnym progiem
    import json, os

    threshold_path = os.path.join(MODEL_DIR, "optimal_threshold.json")
    if os.path.exists(threshold_path):
        with open(threshold_path) as f:
            threshold_data = json.load(f)
        optimal_threshold = threshold_data["optimal_threshold"]
    else:
        optimal_threshold = 0.5

    log_reg_model = joblib.load(os.path.join(MODEL_DIR, "logistic_model.pkl"))
    pred_log_proba = log_reg_model.predict_proba(X)[:, 1]

    unrated = unrated.copy()
    unrated["predicted_rating"] = pred_linear
    unrated["like_probability"] = pred_log_proba
    unrated["combined_score"] = (pred_linear / 5.0) * 0.5 + pred_log_proba * 0.5

    top_linear = unrated.nlargest(top_n, "predicted_rating")
    top_logistic = unrated.nlargest(top_n, "like_probability")
    top_combined = unrated.nlargest(top_n, "combined_score")

    def to_records(df, score_col, score_type):
        rows = []
        for _, r in df.iterrows():
            rows.append(
                {
                    "movieId": int(r["movieId"]),
                    "title": r["title"],
                    "genres": r["genres"],
                    score_type: round(float(r[score_col]), 4),
                }
            )
        return rows

    return {
        "user_profile": {
            "age": age,
            "gender": gender,
            "occupation": occupation,
            "ratingsGiven": len(user_ratings_input),
            "avgRating": round(float(user_avg), 2),
        },
        "optimal_threshold": optimal_threshold,
        "linear": to_records(top_linear, "predicted_rating", "predicted_rating"),
        "logistic": to_records(top_logistic, "like_probability", "like_probability"),
        "combined": to_records(top_combined, "combined_score", "combined_score"),
    }


def get_user_comparison(userId1, userId2, ratings, movies, users, top_n=10):
    """Porównuje rekomendacje dla dwóch użytkowników."""

    recs1 = get_recommendations(userId1, ratings, movies, users, top_n=20)
    recs2 = get_recommendations(userId2, ratings, movies, users, top_n=20)

    ids1 = {r["movieId"] for r in recs1}
    ids2 = {r["movieId"] for r in recs2}

    common_ids = ids1 & ids2
    only1 = [r for r in recs1 if r["movieId"] in ids1 - ids2][:top_n]
    only2 = [r for r in recs2 if r["movieId"] in ids2 - ids1][:top_n]
    common = [r for r in recs1 if r["movieId"] in common_ids][:top_n]

    def user_summary(uid):
        u = users[users["userId"] == uid].iloc[0]
        ur = ratings[ratings["userId"] == uid]
        return {
            "userId": uid,
            "gender": u["gender"],
            "age": int(u["age"]),
            "occupation": int(u["occupation"]),
            "ratingsCount": len(ur),
            "avgRating": round(float(ur["rating"].mean()), 2),
        }

    return {
        "user1": user_summary(userId1),
        "user2": user_summary(userId2),
        "onlyForUser1": only1,
        "onlyForUser2": only2,
        "common": common,
        "similarityPct": round(len(common_ids) / 20 * 100, 1),
    }


def get_user_taste_profile(userId, ratings, movies):
    """Zwraca filmy użytkownika podzielone na trzy kategorie:
    lubi (4-5), średnie (3), słabe (1-2)."""

    user_ratings = (
        ratings[ratings["userId"] == userId]
        .merge(movies[["movieId", "title", "genres"]], on="movieId")
        .sort_values("rating", ascending=False)
    )

    def to_list(df, n=8):
        return (
            df[["movieId", "title", "genres", "rating"]]
            .head(n)
            .to_dict(orient="records")
        )

    lubi = user_ratings[user_ratings["rating"] >= 4]
    srednie = user_ratings[user_ratings["rating"] == 3]
    slabe = user_ratings[user_ratings["rating"] <= 2]

    # top gatunki
    all_genres = []
    for g in lubi["genres"]:
        all_genres.extend(g.split("|"))
    from collections import Counter

    top_genres = [g for g, _ in Counter(all_genres).most_common(5)]

    return {
        "userId": userId,
        "topGenres": top_genres,
        "lubi": to_list(lubi),
        "srednie": to_list(srednie),
        "slabe": to_list(slabe.sort_values("rating")),
        "stats": {
            "lubiCount": len(lubi),
            "srednieCount": len(srednie),
            "slabeCount": len(slabe),
            "total": len(user_ratings),
        },
    }
