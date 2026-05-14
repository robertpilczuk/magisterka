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

ALL_OCCUPATIONS = list(range(21))


def build_feature_vector(user_row, movie_row, user_avg, movie_avg, movie_count):
    """Buduje wektor cech dla pary (użytkownik, film)."""
    features = {}
    features["age"] = user_row["age"]
    features["gender_encoded"] = 1 if user_row["gender"] == "M" else 0
    features["user_avg_rating"] = user_avg
    features["movie_avg_rating"] = movie_avg
    features["movie_rating_count"] = movie_count

    import re

    match = re.search(r"\((\d{4})\)", movie_row["title"])
    features["year"] = float(match.group(1)) if match else 1995.0

    movie_genres = movie_row["genres"].split("|")
    for g in ALL_GENRES:
        features[g] = 1 if g in movie_genres else 0

    for occ in ALL_OCCUPATIONS:
        features[f"occ_{occ}"] = 1 if user_row["occupation"] == occ else 0

    return [features.get(col, 0) for col in FEATURE_COLS]


def _get_movie_stats(ratings, movie_stats=None):
    """Zwraca statystyki filmów — z cache lub oblicza od nowa."""
    if movie_stats is not None:
        return movie_stats
    return ratings.groupby("movieId")["rating"].agg(["mean", "count"])


def get_recommendations(userId, ratings, movies, users, top_n=10, movie_stats=None):
    user_row = users[users["userId"] == userId].iloc[0]
    user_avg = ratings[ratings["userId"] == userId]["rating"].mean()

    rated_movies = set(ratings[ratings["userId"] == userId]["movieId"])
    ms = _get_movie_stats(ratings, movie_stats)

    unrated = movies[~movies["movieId"].isin(rated_movies)].copy()

    # wektoryzacja
    unrated = unrated.merge(
        ms.rename(columns={"mean": "movie_avg_rating", "count": "movie_rating_count"}),
        left_on="movieId",
        right_index=True,
        how="left",
    )
    unrated["movie_avg_rating"] = unrated["movie_avg_rating"].fillna(3.5)
    unrated["movie_rating_count"] = unrated["movie_rating_count"].fillna(0)
    unrated["age"] = user_row["age"]
    unrated["gender_encoded"] = 1 if user_row["gender"] == "M" else 0
    unrated["user_avg_rating"] = user_avg

    import re

    unrated["year"] = (
        unrated["title"].str.extract(r"\((\d{4})\)").astype(float).fillna(1995.0)
    )

    for g in ALL_GENRES:
        unrated[g] = unrated["genres"].str.contains(g, regex=False).astype(int)

    for occ in ALL_OCCUPATIONS:
        unrated[f"occ_{occ}"] = 1 if user_row["occupation"] == occ else 0

    X = scaler.transform(pd.DataFrame(unrated[FEATURE_COLS].fillna(0)))
    predicted_ratings = np.clip(lr.predict(X), 1.0, 5.0)

    unrated["predicted_rating"] = predicted_ratings
    top = unrated.nlargest(top_n, "predicted_rating")
    return top[["movieId", "title", "genres", "predicted_rating"]].to_dict(
        orient="records"
    )


def get_validation(userId, ratings, movies, users, movie_stats=None):
    user_row = users[users["userId"] == userId].iloc[0]
    user_ratings = ratings[ratings["userId"] == userId].merge(movies, on="movieId")

    user_avg = user_ratings["rating"].mean()
    ms = _get_movie_stats(ratings, movie_stats)

    vectors = []
    for _, row in user_ratings.iterrows():
        mid = row["movieId"]
        m_avg = ms.loc[mid, "mean"] if mid in ms.index else 3.5
        m_count = ms.loc[mid, "count"] if mid in ms.index else 0
        vectors.append(build_feature_vector(user_row, row, user_avg, m_avg, m_count))

    X = scaler.transform(pd.DataFrame(vectors, columns=FEATURE_COLS))
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
                "genres": row["genres"],
                "actual": int(actual[i]),
                "predicted": round(float(predicted[i]), 2),
            }
            for i, (_, row) in enumerate(user_ratings.head(20).iterrows())
        ],
    }


def get_recommendations_logistic(
    userId, ratings, movies, users, top_n=10, movie_stats=None
):
    log_reg = joblib.load(os.path.join(MODEL_DIR, "logistic_model.pkl"))

    user_row = users[users["userId"] == userId].iloc[0]
    user_avg = ratings[ratings["userId"] == userId]["rating"].mean()

    rated_movies = set(ratings[ratings["userId"] == userId]["movieId"])
    ms = _get_movie_stats(ratings, movie_stats)

    unrated = movies[~movies["movieId"].isin(rated_movies)].copy()

    # wektoryzacja
    unrated = unrated.merge(
        ms.rename(columns={"mean": "movie_avg_rating", "count": "movie_rating_count"}),
        left_on="movieId",
        right_index=True,
        how="left",
    )
    unrated["movie_avg_rating"] = unrated["movie_avg_rating"].fillna(3.5)
    unrated["movie_rating_count"] = unrated["movie_rating_count"].fillna(0)
    unrated["age"] = user_row["age"]
    unrated["gender_encoded"] = 1 if user_row["gender"] == "M" else 0
    unrated["user_avg_rating"] = user_avg

    import re

    unrated["year"] = (
        unrated["title"].str.extract(r"\((\d{4})\)").astype(float).fillna(1995.0)
    )

    for g in ALL_GENRES:
        unrated[g] = unrated["genres"].str.contains(g, regex=False).astype(int)

    for occ in ALL_OCCUPATIONS:
        unrated[f"occ_{occ}"] = 1 if user_row["occupation"] == occ else 0

    X = scaler.transform(pd.DataFrame(unrated[FEATURE_COLS].fillna(0)))
    probabilities = log_reg.predict_proba(X)[:, 1]

    unrated["like_probability"] = probabilities
    top = unrated.nlargest(top_n, "like_probability")
    return (
        top[["movieId", "title", "genres", "like_probability"]]
        .assign(like_probability=lambda x: x["like_probability"].round(4))
        .to_dict(orient="records")
    )


def get_similar_users(gender=None, age=None, occupation=None, limit=20):
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
    from data_loader import load_data

    ratings, movies, users = load_data()

    rated_ids = [r["movieId"] for r in user_ratings_input]
    user_avg = np.mean([r["rating"] for r in user_ratings_input])

    user_row = pd.Series(
        {
            "userId": -1,
            "gender": gender,
            "age": age,
            "occupation": occupation,
            "zip": "00000",
        }
    )

    unrated = movies[~movies["movieId"].isin(rated_ids)].copy()
    ms = ratings.groupby("movieId")["rating"].agg(["mean", "count"])

    vectors = []
    for _, movie_row in unrated.iterrows():
        mid = movie_row["movieId"]
        m_avg = ms.loc[mid, "mean"] if mid in ms.index else 3.5
        m_count = ms.loc[mid, "count"] if mid in ms.index else 0
        vectors.append(
            build_feature_vector(user_row, movie_row, user_avg, m_avg, m_count)
        )

    X = scaler.transform(pd.DataFrame(vectors, columns=FEATURE_COLS))
    pred_linear = np.clip(lr.predict(X), 1.0, 5.0)

    import json

    threshold_path = os.path.join(MODEL_DIR, "optimal_threshold.json")
    optimal_threshold = 0.5
    if os.path.exists(threshold_path):
        with open(threshold_path) as f:
            optimal_threshold = json.load(f)["optimal_threshold"]

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
        return [
            {
                "movieId": int(r["movieId"]),
                "title": r["title"],
                "genres": r["genres"],
                score_type: round(float(r[score_col]), 4),
            }
            for _, r in df.iterrows()
        ]

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


def get_user_comparison(
    userId1, userId2, ratings, movies, users, top_n=10, movie_stats=None
):
    recs1 = get_recommendations(
        userId1, ratings, movies, users, top_n=20, movie_stats=movie_stats
    )
    recs2 = get_recommendations(
        userId2, ratings, movies, users, top_n=20, movie_stats=movie_stats
    )

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
    user_ratings = (
        ratings[ratings["userId"] == userId]
        .merge(movies[["movieId", "title", "genres"]], on="movieId")
        .sort_values("rating", ascending=False)
    )

    def to_list(df, n=50):
        return (
            df[["movieId", "title", "genres", "rating"]]
            .head(n)
            .to_dict(orient="records")
        )

    lubi = user_ratings[user_ratings["rating"] >= 4]
    srednie = user_ratings[user_ratings["rating"] == 3]
    slabe = user_ratings[user_ratings["rating"] <= 2]

    from collections import Counter

    all_genres = []
    for g in lubi["genres"]:
        all_genres.extend(g.split("|"))
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


def get_recommendation_explanation(
    userId, movieId, ratings, movies, users, movie_stats=None
):
    user_row = users[users["userId"] == userId].iloc[0]
    movie_row = movies[movies["movieId"] == movieId].iloc[0]

    user_avg = ratings[ratings["userId"] == userId]["rating"].mean()
    ms = _get_movie_stats(ratings, movie_stats)
    m_avg = ms.loc[movieId, "mean"] if movieId in ms.index else 3.5
    m_count = ms.loc[movieId, "count"] if movieId in ms.index else 0

    vec = build_feature_vector(user_row, movie_row, user_avg, m_avg, m_count)
    X_raw = pd.DataFrame([vec], columns=FEATURE_COLS)
    X_scaled = scaler.transform(X_raw)

    contributions = X_scaled[0] * lr.coef_
    feature_contributions = sorted(
        zip(FEATURE_COLS, contributions), key=lambda x: abs(x[1]), reverse=True
    )

    FEATURE_LABELS = {
        "age": "Wiek użytkownika",
        "gender_encoded": "Płeć użytkownika",
        "user_avg_rating": "Średnia ocen użytkownika",
        "movie_avg_rating": "Popularność filmu",
        "movie_rating_count": "Liczba ocen filmu",
        "year": "Rok produkcji",
    }

    top3 = []
    for feat, contrib in feature_contributions:
        if feat.startswith("occ_"):
            continue
        top3.append(
            {
                "feature": FEATURE_LABELS.get(feat, feat),
                "contribution": round(float(contrib), 3),
                "direction": "+" if contrib > 0 else "-",
            }
        )
        if len(top3) == 3:
            break

    return {"movieId": movieId, "title": movie_row["title"], "top_features": top3}
