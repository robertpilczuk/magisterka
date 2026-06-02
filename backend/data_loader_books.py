import pandas as pd
import os

DATA_DIR = os.environ.get(
    "DATA_DIR_BOOKS", os.path.join(os.path.dirname(__file__), "..", "data", "books")
)
PROCESSED_DIR = os.environ.get(
    "DATA_DIR_BOOKS_PROCESSED",
    os.path.join(os.path.dirname(__file__), "..", "data", "books_processed"),
)


def load_books_data():
    print("Wczytywanie danych książkowych...")

    # Oceny: dokładnie ten sam zbiór, na którym wytrenowano modele (96 059 rekordów).
    # Pochodzi z notebooka 06_books_preprocessing.ipynb (filtr: użytkownicy >= 20 ocen
    # i książki >= 5 ocen, a następnie inner-join z metadanymi). Serwowanie predykcji
    # na tym samym zbiorze gwarantuje, że statystyki agregowane (book_avg_rating,
    # book_rating_count, user_avg_rating) odpowiadają rozkładowi, na którym dopasowano
    # scaler i modele — wcześniej loader filtrował surowe dane progiem >= 5 (152 280
    # rekordów), co dawało cechy spoza rozkładu treningowego.
    df_model = pd.read_csv(
        os.path.join(PROCESSED_DIR, "df_model_books.csv"), dtype={"isbn": str}
    )
    ratings = df_model[["userId", "isbn", "rating"]].copy()

    # Metadane książek (tytuł, autor, rok wydania) — z surowego pliku Book-Crossing.
    books = pd.read_csv(
        os.path.join(DATA_DIR, "Books.csv"),
        sep=";",
        encoding="latin-1",
        on_bad_lines="skip",
    )
    books.columns = ["isbn", "title", "author", "year", "publisher"]
    books["isbn"] = books["isbn"].astype(str)
    books["year"] = pd.to_numeric(books["year"], errors="coerce")
    books["year"] = books["year"].where(
        (books["year"] >= 1800) & (books["year"] <= 2024)
    )
    books["year"] = books["year"].fillna(books["year"].median())

    # Dane użytkowników (wiek) — z surowego pliku, czyszczone tak jak w preprocessingu.
    users = pd.read_csv(
        os.path.join(DATA_DIR, "Users.csv"),
        sep=";",
        encoding="latin-1",
        low_memory=False,
    )
    users.columns = ["userId", "age"]
    # userId w surowym pliku bywa wczytywany jako tekst ("1", "2", ...), podczas gdy
    # oceny i parametr ścieżki w API są liczbami całkowitymi. Bez ujednolicenia typu
    # wyszukiwanie users["userId"] == userId zawsze zwracało pusty wynik (psuło
    # /books/recommend, /books/similar-users i wymuszało domyślny wiek w /books/user).
    users["userId"] = pd.to_numeric(users["userId"], errors="coerce")
    users = users.dropna(subset=["userId"]).copy()
    users["userId"] = users["userId"].astype(int)
    users["age"] = pd.to_numeric(users["age"], errors="coerce")
    users["age"] = users["age"].fillna(users["age"].median()).clip(5, 90)

    print(
        f"Dane książkowe wczytane: {len(ratings)} ocen (zbiór treningowy), "
        f"{len(books)} książek (metadane), {len(users)} użytkowników (metadane)"
    )
    return ratings, books, users
