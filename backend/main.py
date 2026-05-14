from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from data_loader import load_data
import pandas as pd
from predict import (
    get_recommendations,
    get_validation,
    get_recommendations_logistic,
    get_recommendation_explanation,
)
import random

app = FastAPI(title="Film Recommender API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# wczytaj dane raz przy starcie
print("Wczytywanie danych...")
ratings, movies, users = load_data()
print(
    f"Dane wczytane: {len(ratings)} ocen, {len(movies)} filmów, {len(users)} użytkowników"
)


@app.get("/")
def root():
    return {"status": "ok", "message": "Film Recommender API działa"}


@app.get("/recommend/{userId}")
def recommend(userId: int, top_n: int = 10):
    if userId not in users["userId"].values:
        raise HTTPException(status_code=404, detail=f"Użytkownik {userId} nie istnieje")
    results = get_recommendations(userId, ratings, movies, users, top_n)
    return {"userId": userId, "recommendations": results}


@app.get("/validate/{userId}")
def validate(userId: int):
    if userId not in users["userId"].values:
        raise HTTPException(status_code=404, detail=f"Użytkownik {userId} nie istnieje")
    return get_validation(userId, ratings, movies, users)


@app.get("/user/{userId}")
def user_info(userId: int):
    if userId not in users["userId"].values:
        raise HTTPException(status_code=404, detail=f"Użytkownik {userId} nie istnieje")
    user = users[users["userId"] == userId].iloc[0]
    user_ratings = ratings[ratings["userId"] == userId]
    return {
        "userId": userId,
        "gender": user["gender"],
        "age": int(user["age"]),
        "occupation": int(user["occupation"]),
        "ratingsCount": len(user_ratings),
        "avgRating": round(float(user_ratings["rating"].mean()), 2),
    }


@app.get("/recommend-logistic/{userId}")
def recommend_logistic(userId: int, top_n: int = 10):
    if userId not in users["userId"].values:
        raise HTTPException(status_code=404, detail=f"Użytkownik {userId} nie istnieje")
    results = get_recommendations_logistic(userId, ratings, movies, users, top_n)
    return {"userId": userId, "recommendations": results}


from predict import (
    get_recommendations,
    get_validation,
    get_recommendations_logistic,
    get_similar_users,
    get_new_user_recommendations,
    get_user_comparison,
)
from pydantic import BaseModel
from typing import List, Optional


class UserRating(BaseModel):
    movieId: int
    rating: float


class NewUserRequest(BaseModel):
    ratings: List[UserRating]
    age: Optional[int] = 25
    gender: Optional[str] = "M"
    occupation: Optional[int] = 4


@app.get("/similar-users")
def similar_users(
    gender: str = None, age: int = None, occupation: int = None, limit: int = 20
):
    results = get_similar_users(gender, age, occupation, limit)
    return {"count": len(results), "users": results}


@app.post("/recommend-new-user")
def recommend_new_user(request: NewUserRequest):
    if len(request.ratings) < 3:
        raise HTTPException(status_code=400, detail="Podaj minimum 3 oceny filmów")
    ratings_input = [
        {"movieId": r.movieId, "rating": r.rating} for r in request.ratings
    ]
    return get_new_user_recommendations(
        ratings_input, request.age, request.gender, request.occupation
    )


@app.get("/compare-users/{userId1}/{userId2}")
def compare_users(userId1: int, userId2: int):
    for uid in [userId1, userId2]:
        if uid not in users["userId"].values:
            raise HTTPException(
                status_code=404, detail=f"Użytkownik {uid} nie istnieje"
            )
    return get_user_comparison(userId1, userId2, ratings, movies, users)


from predict import (
    get_recommendations,
    get_validation,
    get_recommendations_logistic,
    get_similar_users,
    get_new_user_recommendations,
    get_user_comparison,
    get_user_taste_profile,
)


@app.get("/user-taste/{userId}")
def user_taste(userId: int):
    if userId not in users["userId"].values:
        raise HTTPException(status_code=404, detail=f"Użytkownik {userId} nie istnieje")
    return get_user_taste_profile(userId, ratings, movies)


# ─── BOOKS ───────────────────────────────────────────────────────────────────
from data_loader_books import load_books_data
from predict_books import (
    get_book_recommendations,
    get_book_recommendations_logistic,
    get_book_validation,
    get_new_user_book_recommendations,
)

print("Wczytywanie danych książkowych...")
books_ratings, books_books, books_users = load_books_data()


class BookUserRating(BaseModel):
    isbn: str
    rating: float


class NewBookUserRequest(BaseModel):
    ratings: List[BookUserRating]
    age: Optional[int] = 25


def _check_book_user(userId: int):
    if userId not in books_ratings["userId"].values:
        raise HTTPException(
            status_code=404,
            detail=f"User {userId} not found in books dataset",
        )


@app.get("/books/user/{userId}")
def books_user_info(userId: int):
    _check_book_user(userId)
    user = books_users[books_users["userId"] == userId]
    user_ratings = books_ratings[books_ratings["userId"] == userId]
    age = float(user.iloc[0]["age"]) if len(user) > 0 else 30.0
    avg = user_ratings["rating"].mean()
    return {
        "userId": userId,
        "age": round(age),
        "ratingsCount": len(user_ratings),
        "avgRating": round(float(avg), 2) if not pd.isna(avg) else 0.0,
    }


@app.get("/books/recommend/{userId}")
def books_recommend(userId: int, top_n: int = 10):
    _check_book_user(userId)
    results = get_book_recommendations(
        userId, books_ratings, books_books, books_users, top_n
    )
    return {"userId": userId, "recommendations": results}


@app.get("/books/recommend-logistic/{userId}")
def books_recommend_logistic(userId: int, top_n: int = 10):
    _check_book_user(userId)
    results = get_book_recommendations_logistic(
        userId, books_ratings, books_books, books_users, top_n
    )
    return {"userId": userId, "recommendations": results}


@app.get("/books/validate/{userId}")
def books_validate(userId: int):
    _check_book_user(userId)
    return get_book_validation(userId, books_ratings, books_books, books_users)


@app.post("/books/recommend-new-user")
def books_recommend_new_user(request: NewBookUserRequest):
    if len(request.ratings) < 3:
        raise HTTPException(status_code=400, detail="Minimum 3 book ratings required")
    ratings_input = [{"isbn": r.isbn, "rating": r.rating} for r in request.ratings]
    return get_new_user_book_recommendations(ratings_input, request.age)


@app.get("/books/similar-users")
def books_similar_users(
    age_min: int = None, age_max: int = None, min_ratings: int = None, limit: int = 20
):
    filtered = books_users[
        books_users["userId"].isin(books_ratings["userId"].unique())
    ].copy()

    user_stats = (
        books_ratings.groupby("userId")["rating"].agg(["count", "mean"]).reset_index()
    )
    user_stats.columns = ["userId", "ratingsCount", "avgRating"]
    filtered = filtered.merge(user_stats, on="userId", how="inner")

    if age_min is not None:
        filtered = filtered[filtered["age"] >= age_min]
    if age_max is not None:
        filtered = filtered[filtered["age"] <= age_max]
    if min_ratings is not None:
        filtered = filtered[filtered["ratingsCount"] >= min_ratings]

    if len(filtered) == 0:
        return {"count": 0, "users": []}

    filtered = filtered.sort_values("ratingsCount", ascending=False).head(limit)

    return {
        "count": len(filtered),
        "users": [
            {
                "userId": int(row["userId"]),
                "age": int(row["age"]),
                "ratingsCount": int(row["ratingsCount"]),
                "avgRating": round(float(row["avgRating"]), 2),
            }
            for _, row in filtered.iterrows()
        ],
    }


@app.get("/books/user-taste/{userId}")
def books_user_taste(userId: int):
    _check_book_user(userId)

    user_ratings = (
        books_ratings[books_ratings["userId"] == userId]
        .merge(books_books[["isbn", "title", "author"]], on="isbn")
        .sort_values("rating", ascending=False)
    )

    lubi = user_ratings[user_ratings["rating"] >= 8]
    srednie = user_ratings[user_ratings["rating"].between(5, 7)]
    slabe = user_ratings[user_ratings["rating"] <= 4]

    def to_list(df, n=50):
        return (
            df[["isbn", "title", "author", "rating"]].head(n).to_dict(orient="records")
        )

    return {
        "userId": userId,
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


@app.get("/books/random-user")
def books_random_user():
    available = books_ratings["userId"].unique().tolist()
    return {"userId": int(random.choice(available))}


@app.get("/explain/{userId}/{movieId}")
def explain(userId: int, movieId: int):
    if userId not in users["userId"].values:
        raise HTTPException(status_code=404, detail=f"User {userId} not found")
    return get_recommendation_explanation(userId, movieId, ratings, movies, users)
