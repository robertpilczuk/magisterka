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
