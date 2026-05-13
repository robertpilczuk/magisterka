from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from data_loader import load_data
from predict import get_recommendations, get_validation, get_recommendations_logistic

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
from pydantic import BaseModel
from typing import List, Optional

print("Wczytywanie danych książkowych...")
books_ratings, books_books, books_users = load_books_data()


class BookUserRating(BaseModel):
    isbn: str
    rating: float


class NewBookUserRequest(BaseModel):
    ratings: List[BookUserRating]
    age: Optional[int] = 25


@app.get("/books/recommend/{userId}")
def books_recommend(userId: int, top_n: int = 10):
    if userId not in books_users["userId"].values:
        raise HTTPException(
            status_code=404,
            detail=f"Użytkownik {userId} nie istnieje w datasecie książek",
        )
    results = get_book_recommendations(
        userId, books_ratings, books_books, books_users, top_n
    )
    return {"userId": userId, "recommendations": results}


@app.get("/books/recommend-logistic/{userId}")
def books_recommend_logistic(userId: int, top_n: int = 10):
    if userId not in books_users["userId"].values:
        raise HTTPException(
            status_code=404,
            detail=f"Użytkownik {userId} nie istnieje w datasecie książek",
        )
    results = get_book_recommendations_logistic(
        userId, books_ratings, books_books, books_users, top_n
    )
    return {"userId": userId, "recommendations": results}


@app.get("/books/validate/{userId}")
def books_validate(userId: int):
    if userId not in books_users["userId"].values:
        raise HTTPException(
            status_code=404,
            detail=f"Użytkownik {userId} nie istnieje w datasecie książek",
        )
    return get_book_validation(userId, books_ratings, books_books, books_users)


@app.get("/books/user/{userId}")
def books_user_info(userId: int):
    if userId not in books_users["userId"].values:
        raise HTTPException(
            status_code=404,
            detail=f"Użytkownik {userId} nie istnieje w datasecie książek",
        )
    user = books_users[books_users["userId"] == userId].iloc[0]
    user_ratings = books_ratings[books_ratings["userId"] == userId]
    return {
        "userId": userId,
        "age": round(float(user["age"])),
        "ratingsCount": len(user_ratings),
        "avgRating": round(float(user_ratings["rating"].mean()), 2),
    }


@app.post("/books/recommend-new-user")
def books_recommend_new_user(request: NewBookUserRequest):
    if len(request.ratings) < 3:
        raise HTTPException(status_code=400, detail="Podaj minimum 3 oceny książek")
    ratings_input = [{"isbn": r.isbn, "rating": r.rating} for r in request.ratings]
    return get_new_user_book_recommendations(ratings_input, request.age)
