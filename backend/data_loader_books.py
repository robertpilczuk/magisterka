import pandas as pd
import os

DATA_DIR = os.environ.get(
    "DATA_DIR_BOOKS", os.path.join(os.path.dirname(__file__), "..", "data", "books")
)


def load_books_data():
    print("Wczytywanie danych książkowych...")

    ratings = pd.read_csv(
        os.path.join(DATA_DIR, "Ratings.csv"), sep=";", encoding="latin-1"
    )
    books = pd.read_csv(
        os.path.join(DATA_DIR, "Books.csv"),
        sep=";",
        encoding="latin-1",
        on_bad_lines="skip",
    )
    users = pd.read_csv(
        os.path.join(DATA_DIR, "Users.csv"), sep=";", encoding="latin-1"
    )

    ratings.columns = ["userId", "isbn", "rating"]
    books.columns = ["isbn", "title", "author", "year", "publisher"]
    users.columns = ["userId", "age"]

    # usuń implicit feedback
    ratings = ratings[ratings["rating"] > 0].copy()

    # wyczyść wiek
    users["age"] = pd.to_numeric(users["age"], errors="coerce")
    users["age"] = users["age"].fillna(users["age"].median()).clip(5, 90)

    # wyczyść rok
    books["year"] = pd.to_numeric(books["year"], errors="coerce")
    books["year"] = books["year"].where(
        (books["year"] >= 1800) & (books["year"] <= 2024)
    )
    books["year"] = books["year"].fillna(books["year"].median())

    # filtruj aktywnych użytkowników i popularne książki
    user_counts = ratings["userId"].value_counts()
    book_counts = ratings["isbn"].value_counts()
    active_users = user_counts[user_counts >= 5].index
    pop_books = book_counts[book_counts >= 5].index

    ratings = ratings[
        ratings["userId"].isin(active_users) & ratings["isbn"].isin(pop_books)
    ].copy()

    print(
        f"Dane książkowe wczytane: {len(ratings)} ocen, {len(books)} książek, {len(users)} użytkowników"
    )
    return ratings, books, users
