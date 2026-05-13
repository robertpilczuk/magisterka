import numpy as np
import pandas as pd
import joblib
import os
import json

MODEL_DIR = os.path.join(os.path.dirname(__file__), "model_books")

lr = joblib.load(os.path.join(MODEL_DIR, "linear_model_books.pkl"))
scaler = joblib.load(os.path.join(MODEL_DIR, "scaler_books.pkl"))
log_reg = joblib.load(os.path.join(MODEL_DIR, "logistic_model_books.pkl"))
FEATURE_COLS = joblib.load(os.path.join(MODEL_DIR, "feature_cols_books.pkl"))

threshold_path = os.path.join(MODEL_DIR, "optimal_threshold_books.json")
with open(threshold_path) as f:
    OPTIMAL_THRESHOLD = json.load(f)["optimal_threshold"]


def build_feature_vector(user_age, user_avg, book_avg, book_count, year):
    features = {
        "age": user_age,
        "user_avg_rating": user_avg,
        "book_avg_rating": book_avg,
        "book_rating_count": book_count,
        "year": year,
    }
    return [features.get(col, 0) for col in FEATURE_COLS]


def get_book_recommendations(userId, ratings, books, users, top_n=10):
    user_row = users[users["userId"] == userId].iloc[0]
    user_age = float(user_row["age"])
    user_avg = ratings[ratings["userId"] == userId]["rating"].mean()

    rated_isbns = set(ratings[ratings["userId"] == userId]["isbn"])
    book_stats = ratings.groupby("isbn")["rating"].agg(["mean", "count"])
    popular_isbns = set(book_stats.index)

    unrated = books[
        books["isbn"].isin(popular_isbns) & ~books["isbn"].isin(rated_isbns)
    ].copy()

    vectors = []
    for _, book_row in unrated.iterrows():
        isbn = book_row["isbn"]
        b_avg = book_stats.loc[isbn, "mean"]
        b_count = book_stats.loc[isbn, "count"]
        year = float(book_row["year"]) if pd.notna(book_row["year"]) else 1995.0
        vectors.append(build_feature_vector(user_age, user_avg, b_avg, b_count, year))

    X = scaler.transform(pd.DataFrame(vectors, columns=FEATURE_COLS))
    predicted = np.clip(lr.predict(X), 1.0, 10.0)

    unrated = unrated.copy()
    unrated["predicted_rating"] = predicted
    top = unrated.nlargest(top_n, "predicted_rating")
    return top[["isbn", "title", "author", "predicted_rating"]].to_dict(
        orient="records"
    )


def get_book_recommendations_logistic(userId, ratings, books, users, top_n=10):
    user_row = users[users["userId"] == userId].iloc[0]
    user_age = float(user_row["age"])
    user_avg = ratings[ratings["userId"] == userId]["rating"].mean()

    rated_isbns = set(ratings[ratings["userId"] == userId]["isbn"])
    book_stats = ratings.groupby("isbn")["rating"].agg(["mean", "count"])
    popular_isbns = set(book_stats.index)

    unrated = books[
        books["isbn"].isin(popular_isbns) & ~books["isbn"].isin(rated_isbns)
    ].copy()

    vectors = []
    for _, book_row in unrated.iterrows():
        isbn = book_row["isbn"]
        b_avg = book_stats.loc[isbn, "mean"]
        b_count = book_stats.loc[isbn, "count"]
        year = float(book_row["year"]) if pd.notna(book_row["year"]) else 1995.0
        vectors.append(build_feature_vector(user_age, user_avg, b_avg, b_count, year))

    X = scaler.transform(pd.DataFrame(vectors, columns=FEATURE_COLS))
    probabilities = log_reg.predict_proba(X)[:, 1]

    unrated = unrated.copy()
    unrated["like_probability"] = probabilities
    top = unrated.nlargest(top_n, "like_probability")
    return (
        top[["isbn", "title", "author", "like_probability"]]
        .assign(like_probability=lambda x: x["like_probability"].round(4))
        .to_dict(orient="records")
    )


def get_book_validation(userId, ratings, books, users):
    user_row = users[users["userId"] == userId].iloc[0]
    user_age = float(user_row["age"])

    user_ratings = ratings[ratings["userId"] == userId].merge(
        books[["isbn", "title", "author"]], on="isbn"
    )
    user_avg = user_ratings["rating"].mean()
    book_stats = ratings.groupby("isbn")["rating"].agg(["mean", "count"])

    vectors = []
    for _, row in user_ratings.iterrows():
        isbn = row["isbn"]
        b_avg = book_stats.loc[isbn, "mean"] if isbn in book_stats.index else 5.0
        b_count = book_stats.loc[isbn, "count"] if isbn in book_stats.index else 0
        vectors.append(build_feature_vector(user_age, user_avg, b_avg, b_count, 1995.0))

    X = scaler.transform(pd.DataFrame(vectors, columns=FEATURE_COLS))
    predicted = np.clip(lr.predict(X), 1.0, 10.0)
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
                "author": row["author"],
                "actual": int(actual[i]),
                "predicted": round(float(predicted[i]), 2),
            }
            for i, (_, row) in enumerate(user_ratings.head(20).iterrows())
        ],
    }


def get_new_user_book_recommendations(ratings_input, age=25, top_n=10):
    from data_loader_books import load_books_data

    ratings, books, users = load_books_data()

    rated_isbns = [r["isbn"] for r in ratings_input]
    user_avg = np.mean([r["rating"] for r in ratings_input])
    user_age = float(age)

    book_stats = ratings.groupby("isbn")["rating"].agg(["mean", "count"])
    popular_isbns = set(book_stats.index)
    unrated = books[
        books["isbn"].isin(popular_isbns) & ~books["isbn"].isin(rated_isbns)
    ].copy()

    vectors = []
    for _, book_row in unrated.iterrows():
        isbn = book_row["isbn"]
        b_avg = book_stats.loc[isbn, "mean"]
        b_count = book_stats.loc[isbn, "count"]
        year = float(book_row["year"]) if pd.notna(book_row["year"]) else 1995.0
        vectors.append(build_feature_vector(user_age, user_avg, b_avg, b_count, year))

    X = scaler.transform(pd.DataFrame(vectors, columns=FEATURE_COLS))

    pred_linear = np.clip(lr.predict(X), 1.0, 10.0)
    pred_log_proba = log_reg.predict_proba(X)[:, 1]

    unrated = unrated.copy()
    unrated["predicted_rating"] = pred_linear
    unrated["like_probability"] = pred_log_proba
    unrated["combined_score"] = (pred_linear / 10.0) * 0.5 + pred_log_proba * 0.5

    top_linear = unrated.nlargest(top_n, "predicted_rating")
    top_logistic = unrated.nlargest(top_n, "like_probability")
    top_combined = unrated.nlargest(top_n, "combined_score")

    def to_records(df, score_col, score_type):
        return [
            {
                "isbn": r["isbn"],
                "title": r["title"],
                "author": r["author"],
                score_type: round(float(r[score_col]), 4),
            }
            for _, r in df.iterrows()
        ]

    return {
        "user_profile": {
            "age": age,
            "ratingsGiven": len(ratings_input),
            "avgRating": round(float(user_avg), 2),
        },
        "optimal_threshold": OPTIMAL_THRESHOLD,
        "linear": to_records(top_linear, "predicted_rating", "predicted_rating"),
        "logistic": to_records(top_logistic, "like_probability", "like_probability"),
        "combined": to_records(top_combined, "combined_score", "combined_score"),
    }
