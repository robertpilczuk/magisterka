import pandas as pd
import os

DATA_DIR = os.environ.get(
    "DATA_DIR", os.path.join(os.path.dirname(__file__), "..", "data")
)


def load_data():
    ratings = pd.read_csv(
        os.path.join(DATA_DIR, "ratings.dat"),
        sep="::",
        engine="python",
        names=["userId", "movieId", "rating", "timestamp"],
    )
    movies = pd.read_csv(
        os.path.join(DATA_DIR, "movies.dat"),
        sep="::",
        engine="python",
        names=["movieId", "title", "genres"],
        encoding="latin-1",
    )
    users = pd.read_csv(
        os.path.join(DATA_DIR, "users.dat"),
        sep="::",
        engine="python",
        names=["userId", "gender", "age", "occupation", "zip"],
    )
    return ratings, movies, users
