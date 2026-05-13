# 12. Per-user temporal split — podział danych uwzględniający czas

## Co zostało zmienione

Zastąpiono losowy podział danych (80/20 `random_state=42`) podziałem
temporalnym per-użytkownik. Dla każdego użytkownika ostatnie 20% jego ocen
(posortowanych po czasie) trafia do zbioru testowego, a pierwsze 80% do
treningowego.

---

## Dlaczego poprzedni podział był problematyczny

### Losowy podział 80/20

Poprzednia wersja dzieliła cały zbiór danych losowo:

```python
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
```

**Problem:** oceny jednego użytkownika mogły trafiać jednocześnie do zbioru
treningowego i testowego. Oznaczało to, że model podczas treningu "widział"
część historii użytkownika, a następnie był testowany na innej części tej
samej historii — ale z różnych momentów czasowych wymieszanych losowo.

To tak jakby uczyć się do egzaminu z losowo wybranych stron podręcznika,
a potem być sprawdzanym z innych losowo wybranych stron — niekoniecznie
"późniejszych" w sensie logiki nauki.

### Per-user temporal split

Nowe podejście sortuje oceny każdego użytkownika chronologicznie
(od najstarszej do najnowszej) i traktuje ostatnie 20% jako "przyszłość"
której model nie mógł widzieć podczas treningu.

To realistyczny scenariusz: model uczy się na tym co użytkownik oglądał
w przeszłości i przewiduje co będzie mu się podobać w przyszłości.

---

## Implementacja

### Zmiana 1 — dodanie `timestamp` do `df_model`

W `02_preprocessing.ipynb`, linia budująca `df_model` została rozszerzona
o kolumnę `timestamp`:

```python
# przed:
df_model = df[FEATURE_COLS + [TARGET_COL, 'userId', 'movieId']].copy()

# po:
df_model = df[FEATURE_COLS + [TARGET_COL, 'userId', 'movieId', 'timestamp']].copy()
```

`timestamp` to liczba sekund od 1 stycznia 1970 (format Unix). Wyższa wartość
oznacza późniejszą datę. Kolumna była obecna w surowych danych (`ratings.dat`)
ale wcześniej była pomijana przy budowaniu zbioru cech.

### Zmiana 2 — nowa logika podziału

```python
# sortowanie każdego użytkownika po czasie
df_model_sorted = df_model.sort_values(['userId', 'timestamp'])

train_rows = []
test_rows = []

for user_id, group in df_model_sorted.groupby('userId'):
    n = len(group)
    split_idx = int(n * 0.8)           # punkt podziału: 80% treningu
    train_rows.append(group.iloc[:split_idx])   # "przeszłość"
    test_rows.append(group.iloc[split_idx:])    # "przyszłość"

train_df = pd.concat(train_rows).reset_index(drop=True)
test_df  = pd.concat(test_rows).reset_index(drop=True)

X_train = train_df[FEATURE_COLS]
y_train = train_df[TARGET_COL]
X_test  = test_df[FEATURE_COLS]
y_test  = test_df[TARGET_COL]
```

**Co robi każda linia:**

- `sort_values(['userId', 'timestamp'])` — sortuje najpierw po użytkowniku,
  a w ramach każdego użytkownika po czasie (od najstarszej do najnowszej oceny)
- `groupby('userId')` — iteruje po każdym użytkowniku osobno
- `int(n * 0.8)` — oblicza punkt podziału: dla użytkownika z 200 ocenami
  to będzie ocena nr 160
- `group.iloc[:split_idx]` — pierwsze 80% ocen (trening)
- `group.iloc[split_idx:]` — ostatnie 20% ocen (test)
- `pd.concat(train_rows)` — łączy wiersze wszystkich użytkowników w jeden DataFrame

---

## Wyniki po re-treningu

### Rozmiary zbiorów

| Zbiór | Liczba rekordów | Liczba użytkowników |
|-------|----------------|---------------------|
| Train | 797 758 | 6 040 |
| Test  | 202 451 | 6 040 |

Wszyscy 6 040 użytkowników mają dane w obu zbiorach — każdy ma co najmniej
kilka ocen treningowych i testowych.

### Metryki modeli

| Model | RMSE | MAE | R² |
|-------|------|-----|----|
| Baseline (średnia) | 1.2163 | 0.9733 | 0.0000 |
| Regresja liniowa | 0.9120 | 0.7177 | 0.3520 |
| Ridge | 0.9120 | 0.7177 | 0.3520 |
| Lasso | 0.9129 | 0.7192 | 0.3508 |

### Interpretacja metryk

**RMSE (Root Mean Squared Error)** — pierwiastek ze średniego kwadratu błędu.
Mówi o ile przeciętnie (w skali 1–5) przewidywana ocena różni się od
rzeczywistej. RMSE = 0.912 oznacza że model myli się średnio o ~0.9 punktu
w skali 1–5 (czyli ~1.8 punktu w skali 1–10).

**MAE (Mean Absolute Error)** — średni bezwzględny błąd. Podobny do RMSE
ale mniej wrażliwy na duże błędy. MAE = 0.718 oznacza że typowa różnica
między przewidywaną a rzeczywistą oceną to 0.72 punktu.

**R²** — współczynnik determinacji. Mówi jaki procent zmienności ocen model
potrafi wyjaśnić. R² = 0.352 oznacza że model wyjaśnia 35.2% zmienności —
co jest przyzwoitym wynikiem dla tak prostego modelu na danych z preferencjami
ludzkimi (które są z natury trudno przewidywalne).

**Baseline** — model który zawsze przewiduje średnią ocenę ze zbioru
treningowego. Służy jako punkt odniesienia — regresja liniowa musi być lepsza
od baseline żeby miała sens.

### Porównanie z poprzednim podziałem

Metryki są bardzo zbliżone do poprzednich (losowy split dawał podobne wartości).
To dobry znak — oznacza że model nie był przeuczony na konkretnych użytkownikach.
Kluczowa różnica jest **metodologiczna**, nie numeryczna:

- **Poprzedni split:** model mógł "widzieć przyszłość" użytkownika podczas
  treningu (losowe mieszanie ocen z różnych dat)
- **Nowy split:** model uczy się wyłącznie na przeszłości i jest testowany
  na przyszłości — tak jak działa w rzeczywistym systemie rekomendacji

---

## Znaczenie dla pracy magisterskiej

Per-user temporal split jest mocniejszym argumentem metodologicznym z kilku
powodów:

1. **Brak wycieku danych** (data leakage) — model nie ma dostępu do informacji
   z przyszłości podczas treningu
2. **Realistyczna ewaluacja** — odzwierciedla rzeczywisty scenariusz użycia:
   system rekomendacji zawsze przewiduje "co będzie" na podstawie "co było"
3. **Standardowe podejście** — temporal split jest zalecany w literaturze
   naukowej dla systemów rekomendacji (por. Netflix Prize evaluation protocol)

Wyniki można teraz cytować w pracy jako uczciwe i metodologicznie poprawne.
