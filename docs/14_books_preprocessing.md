# 14. Preprocessing danych — Książki (Book-Crossing)

## Co zostało zbudowane

Notebook `06_books_preprocessing.ipynb` przygotowuje dane z datasetu Book-Crossing
do trenowania modelu predykcji książek. Pipeline jest analogiczny do preprocessingu
filmów (`02_preprocessing.ipynb`) — ten sam schemat działania, inne dane wejściowe.

---

## Dataset Book-Crossing

### Źródło
Book-Crossing Dataset — zebrany przez Cai-Nicolas Ziegler w 2004 roku
ze społeczności Book-Crossing (bookcrossing.com).

### Pliki
| Plik | Zawartość | Rozmiar |
|------|-----------|---------|
| `Ratings.csv` | Oceny użytkowników | 1 149 780 rekordów |
| `Books.csv` | Metadane książek | 271 379 książek |
| `Users.csv` | Dane demograficzne | 278 858 użytkowników |

### Separator
Pliki używają separatora `;` (średnik) zamiast standardowego `,` (przecinek).
Parametr `sep=';'` jest wymagany przy wczytywaniu.

### Kodowanie znaków
Parametr `encoding='latin-1'` jest konieczny — pliki zawierają znaki spoza
standardowego ASCII (np. litery akcentowane w tytułach książek różnych języków).

---

## Problem z ocenami zerowymi

Dataset Book-Crossing ma specyficzną właściwość: ocena `0` nie oznacza
"bardzo złej książki" — oznacza **brak oceny** (implicit feedback).
Użytkownik miał kontakt z książką (np. ją przeczytał) ale nie wystawił
jawnej oceny numerycznej.

```
Rozkład ocen przed filtrowaniem:
0  → 716 109 rekordów  (62% wszystkich!)
8  → 103 736
10 → 78 610
7  → 76 457
...
```

Oceny zerowe zostają usunięte — nie niosą informacji o preferencjach.
Po filtrowaniu zostaje **433 671 prawdziwych ocen** w skali 1–10.

---

## Kroki preprocessingu

### 1. Ujednolicenie nazw kolumn

Oryginalne nazwy kolumn używają myślników i wielkich liter
(`User-ID`, `Book-Title`). Zamieniamy na snake_case:

```python
ratings.columns = ['userId', 'isbn', 'rating']
books.columns   = ['isbn', 'title', 'author', 'year', 'publisher']
users.columns   = ['userId', 'age']
```

### 2. Usunięcie ocen zerowych

```python
ratings = ratings[ratings['rating'] > 0].copy()
```

### 3. Czyszczenie wieku użytkowników

Kolumna `age` w pliku Users.csv:
- zawiera wartości tekstowe (wymaga konwersji `pd.to_numeric`)
- ma brakujące wartości (`NaN`) — wypełniane medianą
- zawiera nierealistyczne wartości (0, 244) — przycinane do zakresu 5–90

```python
users['age'] = pd.to_numeric(users['age'], errors='coerce')
median_age   = users['age'].median()
users['age'] = users['age'].fillna(median_age).clip(5, 90)
```

### 4. Czyszczenie roku wydania książek

Kolumna `year` w pliku Books.csv:
- zawiera błędne wartości tekstowe (np. `'DK'`, `'0'`)
- zawiera lata spoza sensownego zakresu (np. 2030, 9999)
- konwertujemy na liczby, wartości poza 1800–2024 zastępujemy medianą

```python
books['year'] = pd.to_numeric(books['year'], errors='coerce')
books['year'] = books['year'].where(
    (books['year'] >= 1800) & (books['year'] <= 2024)
)
books['year'] = books['year'].fillna(books['year'].median())
```

### 5. Filtrowanie aktywnych użytkowników i popularnych książek

Użytkownicy z mniej niż 5 ocenami i książki z mniej niż 5 ocenami
zostają usunięte. Powody:

- **Użytkownicy z małą liczbą ocen** — model nie ma wystarczającego sygnału
  żeby nauczyć się ich preferencji. Jeden lub dwa oceny to za mało.
- **Rzadkie książki** — model nie może się nauczyć cech książki która
  ma tylko 1–2 oceny — za mało danych statystycznych.
- **Redukcja szumu** — duża liczba rzadkich przypadków pogarsza metryki
  bez wnoszenia wartości predykcyjnej.

Próg 5 to kompromis — wyższy próg daje lepszy model ale mniejszy dataset.

### 6. Łączenie tabel (merge)

Trzy tabele łączone są w jedną przez `inner join`:

```
Ratings ──(userId)──► Users
        ──(isbn)───► Books
```

`inner join` oznacza że zachowujemy tylko rekordy które mają dopasowanie
we wszystkich trzech tabelach. Rekordy bez dopasowania (np. ocena dla książki
której nie ma w Books.csv) zostają usunięte.

### 7. Statystyki agregowane

Dla każdego użytkownika i każdej książki obliczamy:

| Cecha | Opis |
|-------|------|
| `user_avg_rating` | Średnia ocen użytkownika — jego ogólna "hojność" w ocenianiu |
| `book_avg_rating` | Średnia ocen książki — jej ogólna popularność |
| `book_rating_count` | Liczba ocen książki — jej popularność ilościowa |

Te cechy pomagają modelowi uwzględnić efekty demograficzne:
użytkownik który zawsze daje 9–10 będzie miał wysokie `user_avg_rating`,
co model uwzględni przy predykcji.

---

## Zbiór cech (Feature Engineering)

W przeciwieństwie do filmów, dataset książkowy nie zawiera gatunków —
używamy cech demograficznych i statystycznych:

| Cecha | Typ | Opis |
|-------|-----|------|
| `age` | Numeryczna | Wiek użytkownika (5–90) |
| `user_avg_rating` | Numeryczna | Średnia ocen użytkownika |
| `book_avg_rating` | Numeryczna | Średnia ocen książki |
| `book_rating_count` | Numeryczna | Liczba ocen książki |
| `year` | Numeryczna | Rok wydania książki |

**Zmienna docelowa:** `rating` — ocena którą użytkownik wystawił książce (1–10)

Mniej cech niż dla filmów (5 vs 45) — brak gatunków, płci, zawodu.
Wpłynie to na metryki modelu (niższe R²) ale model pozostaje poprawny metodologicznie.

---

## Podział danych

Dataset Book-Crossing **nie zawiera kolumny timestamp** — nie możemy wykonać
temporalnego podziału per-user jak dla filmów.

Używamy losowego podziału per-user z `shuffle`:

```python
for user_id, group in df_model.groupby('userId'):
    group     = shuffle(group, random_state=42)
    split_idx = int(len(group) * 0.8)
    train_rows.append(group.iloc[:split_idx])
    test_rows.append(group.iloc[split_idx:])
```

Każdy użytkownik ma 80% swoich ocen w treningu i 20% w teście.
`random_state=42` zapewnia reprodukowalność wyników.

### Wyniki podziału

| Zbiór | Rekordy | Użytkownicy |
|-------|---------|-------------|
| Train | 106 302 | wszyscy |
| Test  | 33 097  | wszyscy |
| Łącznie | 139 399 | — |

---

## Skalowanie cech (StandardScaler)

Cechy mają różne zakresy:
- `age` → 5–90
- `book_rating_count` → 5–kilka tysięcy
- `year` → 1800–2024

StandardScaler przekształca każdą cechę do średniej=0 i odchylenia standardowego=1.
Dzięki temu model traktuje wszystkie cechy jednakowo — żadna nie dominuje
tylko dlatego że ma większe wartości liczbowe.

**Ważna zasada:** scaler jest dopasowywany (`fit`) TYLKO na danych treningowych.
Dane testowe są tylko transformowane (`transform`) — bez ponownego dopasowania.
Zapobiega to wyciekowi informacji z danych testowych do modelu.

---

## Porównanie z preprocessingiem filmów

| Aspekt | Filmy (MovieLens) | Książki (Book-Crossing) |
|--------|-------------------|------------------------|
| Skala ocen | 1–5 | 1–10 |
| Liczba cech | 45 | 5 |
| Gatunki | ✅ one-hot encoding | ❌ brak |
| Płeć użytkownika | ✅ | ❌ brak |
| Zawód użytkownika | ✅ one-hot (21 zawodów) | ❌ brak |
| Timestamp | ✅ temporal split | ❌ losowy split |
| Implicit feedback | ❌ brak | ✅ usunięte zera |
| Rozmiar po czyszczeniu | ~1M ocen | ~139k ocen |

---

## Zapisane pliki

### Dane przetworzone (`data/books_processed/`)
| Plik | Zawartość |
|------|-----------|
| `df_model_books.csv` | Pełna tabela z cechami i metadanymi |
| `X_train_books.csv` | Cechy zbioru treningowego (przeskalowane) |
| `X_test_books.csv` | Cechy zbioru testowego (przeskalowane) |
| `y_train_books.csv` | Oceny zbioru treningowego |
| `y_test_books.csv` | Oceny zbioru testowego |

### Artefakty modelu (`backend/model_books/`)
| Plik | Zawartość |
|------|-----------|
| `scaler_books.pkl` | Wytrenowany StandardScaler |
| `feature_cols_books.pkl` | Lista nazw cech (kolejność musi być zachowana) |
