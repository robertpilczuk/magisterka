# 16. Backend — Książki (Book-Crossing)

## Co zostało zbudowane

Kompletny backend dla datasetu książkowego oparty na tych samych wzorcach co backend filmowy.
Nowe pliki: `data_loader_books.py`, `predict_books.py` oraz sekcja `# ─── BOOKS ───` w `main.py`.

---

## Pliki

### `backend/data_loader_books.py`

Wczytuje i czyści dane Book-Crossing przy starcie serwera.

```python
DATA_DIR = os.environ.get("DATA_DIR_BOOKS", os.path.join(..., "..", "data", "books"))
```

Zmienna środowiskowa `DATA_DIR_BOOKS` umożliwia nadpisanie ścieżki — niezbędne w Dockerze
gdzie dane są montowane jako volume pod `/app/data/books`.

**Kroki czyszczenia:**
- Separator `;` i encoding `latin-1` (pliki Book-Crossing zawierają znaki spoza ASCII)
- Usunięcie ocen zerowych (implicit feedback — brak jawnej oceny)
- Konwersja `age` na numeryczną (`pd.to_numeric`, errors='coerce'), wypełnienie medianą, clip(5, 90)
- Konwersja `year` na numeryczną, usunięcie wartości poza zakresem 1800–2024
- Filtrowanie użytkowników z < 20 ocenami (MIN_USER_RATINGS = 20)
- Filtrowanie książek z < 5 ocenami (MIN_BOOK_RATINGS = 5)
- `low_memory=False` przy wczytywaniu Users.csv (mieszane typy w kolumnie User-ID)

### `backend/predict_books.py`

Moduł predykcji dla książek. Analogiczny do `predict.py` ale z 5 cechami zamiast 45.

**Cechy modelu książkowego:**
| Cecha | Opis |
|-------|------|
| `age` | Wiek użytkownika |
| `user_avg_rating` | Średnia ocen użytkownika |
| `book_avg_rating` | Średnia ocen książki |
| `book_rating_count` | Liczba ocen książki |
| `year` | Rok wydania książki |

**Kluczowe funkcje:**

```python
def _get_book_stats(ratings, book_stats=None):
    """Cache-aware: używa przekazanego book_stats lub oblicza od nowa."""

def get_book_recommendations(userId, ratings, books, users, top_n=10, book_stats=None)
def get_book_recommendations_logistic(userId, ratings, books, users, top_n=10, book_stats=None)
def get_book_validation(userId, ratings, books, users, book_stats=None)
def get_new_user_book_recommendations(ratings_input, age=25, top_n=10)
```

**Wektoryzacja** — zamiast pętli `for` zastosowano operację `merge` DataFrame:

```python
unrated = unrated.merge(
    bs.rename(columns={"mean": "book_avg_rating", "count": "book_rating_count"}),
    left_on="isbn", right_index=True, how="left"
)
unrated["age"] = user_age
unrated["user_avg_rating"] = user_avg
```

Wektoryzacja przyspieszyła generowanie rekomendacji z ~2,7s do ~0,14s (19x).

**fillna(0)** przed `scaler.transform()` — kolumna `year` może zawierać NaN dla książek
bez roku wydania. Wartość 0 po skalowaniu odpowiada mniej więcej medianie roku.

---

## Endpointy `/books/*`

Wszystkie endpointy książkowe mają prefix `/books/` i analogiczną logikę do filmowych.

| Endpoint | Opis |
|----------|------|
| `GET /books/user/{userId}` | Profil użytkownika (wiek, liczba ocen, średnia) |
| `GET /books/recommend/{userId}` | Rekomendacje regresja liniowa |
| `GET /books/recommend-logistic/{userId}` | Rekomendacje regresja logistyczna |
| `GET /books/validate/{userId}` | Walidacja modelu — RMSE, MAE, próbka |
| `GET /books/user-taste/{userId}` | Profil czytelniczy: lubi (≥8) / neutralne (5–7) / nie lubi (≤4) |
| `GET /books/similar-users` | Filtrowanie po wieku i aktywności |
| `GET /books/random-user` | Losowy userId z dostępnych w datasecie |
| `POST /books/recommend-new-user` | Cold start — ocen min. 3 książki wg ISBN |

**Helper `_check_book_user`** — sprawdza czy userId istnieje w `books_ratings`
(nie w `books_users`, bo nie wszyscy użytkownicy mają oceny po filtracji).

**Cache przy starcie:**
```python
books_ratings, books_books, books_users = load_books_data()
books_stats_cache = books_ratings.groupby("isbn")["rating"].agg(["mean", "count"])
```
`books_stats_cache` jest przekazywany do wszystkich funkcji predykcji jako parametr `book_stats`.

---

## Filtr podobnych czytelników (`/books/similar-users`)

Filtrowanie po:
- `age_min`, `age_max` — zakres wieku (predefiniowane zakresy: <18, 18–25, 26–35, ...)
- `min_ratings` — minimalna liczba ocen (20, 50, 100, 200, 500+)

Dataset Book-Crossing ma tylko kolumnę `age` (brak płci i zawodu jak w MovieLens).

---

## Specyfika skali ocen

Book-Crossing używa skali 1–10, MovieLens skali 1–5. Wpływ na:
- `np.clip(lr.predict(X), 1.0, 10.0)` zamiast `1.0, 5.0`
- Binaryzacja dla regresji logistycznej: próg 7/10 (zamiast 4/5)
- Walidacja: progi dla lubi/neutralne/nie lubi: ≥8 / 5–7 / ≤4
