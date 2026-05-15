# 18. Optymalizacja wydajności — caching i wektoryzacja

## Problem

Przed optymalizacją czas generowania rekomendacji wynosił:
- Filmy: ~1,2 sekundy
- Książki: ~2,7 sekundy

Główne wąskie gardła:
1. **`groupby` przy każdym zapytaniu** — `ratings.groupby("movieId")["rating"].agg(["mean", "count"])` 
   na 1M rekordach było wywoływane 5 razy przy każdym zapytaniu filmowym
2. **Iteracja `for` po wszystkich przedmiotach** — pętla po ~3 800 filmach lub ~13 600 książkach
   budująca wektory cech jeden po drugim

---

## Rozwiązanie 1 — Prekompilacja statystyk (caching)

Statystyki agregowane są obliczane raz przy starcie serwera i przechowywane w pamięci RAM:

```python
# main.py — przy starcie
print("Obliczanie statystyk filmów...")
movie_stats_cache = ratings.groupby("movieId")["rating"].agg(["mean", "count"])

print("Obliczanie statystyk książek...")
books_stats_cache = books_ratings.groupby("isbn")["rating"].agg(["mean", "count"])
```

Cache jest przekazywany do funkcji predykcji jako opcjonalny parametr:

```python
def get_recommendations(userId, ratings, movies, users, top_n=10, movie_stats=None):
    ms = _get_movie_stats(ratings, movie_stats)  # używa cache lub oblicza od nowa
```

Funkcja pomocnicza `_get_movie_stats` / `_get_book_stats` zapewnia backwards compatibility —
jeśli cache nie jest przekazany (np. w testach jednostkowych), statystyki są obliczane lokalnie.

---

## Rozwiązanie 2 — Wektoryzacja

Zastąpienie pętli `for` operacjami macierzowymi na DataFrame.

### Przed (iteracja):

```python
vectors = []
for _, movie_row in unrated.iterrows():
    mid = movie_row["movieId"]
    m_avg   = movie_stats.loc[mid, "mean"]  if mid in movie_stats.index else 3.5
    m_count = movie_stats.loc[mid, "count"] if mid in movie_stats.index else 0
    vec = build_feature_vector(user_row, movie_row, user_avg, m_avg, m_count)
    vectors.append(vec)
```

### Po (wektoryzacja):

```python
unrated = unrated.merge(
    ms.rename(columns={"mean": "movie_avg_rating", "count": "movie_rating_count"}),
    left_on="movieId", right_index=True, how="left"
)
unrated["age"]             = user_row["age"]
unrated["gender_encoded"]  = 1 if user_row["gender"] == "M" else 0
unrated["user_avg_rating"] = user_avg
unrated["year"] = unrated["title"].str.extract(r'\((\d{4})\)').astype(float).fillna(1995.0)

for g in ALL_GENRES:
    unrated[g] = unrated["genres"].str.contains(g, regex=False).astype(int)

for occ in ALL_OCCUPATIONS:
    unrated[f"occ_{occ}"] = 1 if user_row["occupation"] == occ else 0

X = scaler.transform(pd.DataFrame(unrated[FEATURE_COLS].fillna(0)))
```

Kluczowa zmiana: zamiast budować wektor cech dla każdego filmu osobno,
wypełniamy całą macierz cech naraz przez operacje na kolumnach DataFrame.
pandas wykonuje te operacje w zoptymalizowanym C/NumPy — znacznie szybciej
niż pętla Pythona.

---

## Wyniki optymalizacji

| Endpoint | Przed | Po | Przyrost |
|----------|-------|-----|---------|
| `GET /recommend/1` | 1,162s | 0,089s | **13x szybciej** |
| `GET /books/recommend/99` | 2,703s | 0,142s | **19x szybciej** |

Pomiar: `time curl -s "http://localhost:8000/recommend/1" > /dev/null`

---

## Wpływ na testy jednostkowe

Zmiana sygnatury funkcji (dodanie parametru `movie_stats=None`) jest backwards compatible —
istniejące testy jednostkowe działają bez modyfikacji, ponieważ domyślna wartość `None`
powoduje obliczenie statystyk lokalnie (jak przed optymalizacją).

---

## Uwagi implementacyjne

- `fillna(0)` przed `scaler.transform()` — kolumna `year` może być NaN dla filmów/książek
  bez roku w tytule. Wartość 0 po skalowaniu jest bezpiecznym fallbackiem.
- `user_stats_cache` (średnia ocen per-użytkownik) — wczytywany przy starcie, używany
  w endpointach wymagających szybkiego dostępu do profilu użytkownika.
- Wektoryzacja gatunków: `str.contains(g, regex=False)` jest szybsze niż `apply(lambda...)`
  bo operuje na całej kolumnie naraz.
