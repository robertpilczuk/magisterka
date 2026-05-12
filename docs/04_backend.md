# Dokumentacja — Backend FastAPI
## Plik: backend/main.py, backend/predict.py, backend/data_loader.py

---

## Architektura backendu — przegląd

Backend to serwer API napisany w **FastAPI** — nowoczesnym frameworku webowym dla Pythona.
Jego jedynym zadaniem jest:
1. Wczytać dane i modele przy starcie
2. Odpowiadać na zapytania HTTP z frontendu
3. Zwracać wyniki predykcji w formacie JSON

```
Frontend (React)
      ↓ HTTP GET
FastAPI (main.py)
      ↓ wywołuje funkcje
predict.py          ← używa wytrenowanych modeli (.pkl)
data_loader.py      ← dostarcza dane (.dat)
```

---

## Dlaczego FastAPI a nie Flask czy Django?

| Cecha | FastAPI | Flask | Django |
|-------|---------|-------|--------|
| Szybkość działania | bardzo wysoka | średnia | średnia |
| Automatyczna dokumentacja API | ✅ (Swagger UI) | ❌ | ❌ |
| Walidacja typów danych | ✅ | ❌ | ❌ |
| Prostota kodu | wysoka | wysoka | niska |
| Idealne dla | API + ML | proste API | pełne aplikacje webowe |

FastAPI automatycznie generuje dokumentację pod adresem `http://localhost:8000/docs`
— można tam testować endpointy bez pisania kodu.

---

## data_loader.py — wczytywanie danych

### Cel pliku

Odpowiedzialność tego modułu jest jedna: wczytać trzy pliki `.dat` z MovieLens
i zwrócić je jako DataFrame pandas. Separacja tej logiki do osobnego pliku
sprawia że `main.py` i `predict.py` są czystsze i łatwiejsze do testowania.

### Kluczowy fragment kodu

```python
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
```

`__file__` to ścieżka do aktualnego pliku (`data_loader.py`).
`os.path.dirname(__file__)` to folder w którym leży plik (`backend/`).
`'..'` cofa się o jeden poziom wyżej (do `magisterka/`).
Wynikiem jest ścieżka do folderu `data/` niezależna od miejsca uruchomienia serwera.

### Dlaczego wczytujemy dane raz przy starcie a nie przy każdym zapytaniu?

```python
# w main.py — wykonuje się RAZ przy starcie
ratings, movies, users = load_data()
```

Wczytanie 1 miliona wierszy z dysku zajmuje ~2–3 sekundy. Gdybyśmy wczytywali
dane przy każdym zapytaniu HTTP, każda rekomendacja czekałaby 2–3 sekundy tylko
na wczytanie danych. Wczytanie raz i trzymanie w pamięci RAM sprawia że
zapytania odpowiadają w milisekundach.

---

## predict.py — logika predykcji

### Wczytanie modeli przy starcie modułu

```python
lr      = joblib.load(os.path.join(MODEL_DIR, 'linear_model.pkl'))
scaler  = joblib.load(os.path.join(MODEL_DIR, 'scaler.pkl'))
FEATURE_COLS = joblib.load(os.path.join(MODEL_DIR, 'feature_cols.pkl'))
```

Modele są wczytywane **raz przy imporcie modułu** — nie przy każdym wywołaniu funkcji.
`joblib.load` deserializuje obiekty Python z pliku binarnego `.pkl` —
przywraca dokładnie ten sam obiekt który był zapisany po treningu w notebooku.

**Dlaczego `FEATURE_COLS` jest zapisana i wczytywana?**
Model regresji liniowej oczekuje cech w ściśle określonej kolejności.
Jeśli podczas treningu kolejność kolumn była:
`[age, gender_encoded, year, ..., Action, Adventure, ..., occ_0, occ_1, ...]`
to aplikacja musi dostarczyć cechy w dokładnie tej samej kolejności.
`FEATURE_COLS` gwarantuje tę spójność.

### build_feature_vector() — budowanie wektora cech

```python
def build_feature_vector(user_row, movie_row, user_avg, movie_avg, movie_count):
```

Ta funkcja to **kluczowe ogniwo** między danymi a modelem. Robi dokładnie
to samo co notebook `02_preprocessing.ipynb` — ale dla pojedynczej pary
(użytkownik, film) zamiast dla całego miliona wierszy.

**Parametry:**
- `user_row` — jeden wiersz z tabeli `users` (wiek, płeć, zawód)
- `movie_row` — jeden wiersz z tabeli `movies` (tytuł, gatunki)
- `user_avg` — średnia ocen tego użytkownika (obliczona z `ratings`)
- `movie_avg` — średnia ocen tego filmu (obliczona z `ratings`)
- `movie_count` — liczba ocen tego filmu (obliczona z `ratings`)

**Jak budowany jest wektor:**

```python
features['age']             = user_row['age']           # wiek bez zmian
features['gender_encoded']  = 1 if user_row['gender'] == 'M' else 0  # M=1, F=0
features['user_avg_rating'] = user_avg                  # user bias
features['movie_avg_rating']= movie_avg                 # item bias
features['movie_rating_count'] = movie_count            # popularność
```

Rok wyciągamy regexem — tak samo jak w preprocessingu:
```python
match = re.search(r'\((\d{4})\)', movie_row['title'])
features['year'] = float(match.group(1)) if match else 1995.0
```

Gatunki jako one-hot (18 kolumn binarnych):
```python
movie_genres = movie_row['genres'].split('|')
for g in ALL_GENRES:
    features[g] = 1 if g in movie_genres else 0
```

Zawód jako one-hot (21 kolumn binarnych):
```python
for occ in ALL_OCCUPATIONS:
    features[f'occ_{occ}'] = 1 if user_row['occupation'] == occ else 0
```

Na końcu zwracamy wartości w kolejności z `FEATURE_COLS`:
```python
return [features.get(col, 0) for col in FEATURE_COLS]
```

**Dlaczego `features.get(col, 0)` a nie `features[col]`?**
`.get(col, 0)` zwraca 0 jeśli klucz nie istnieje zamiast rzucać błędem.
Zabezpieczenie przed sytuacją gdy nowy film ma gatunek którego nie ma w liście.

### get_recommendations() — generowanie rekomendacji

```python
def get_recommendations(userId, ratings, movies, users, top_n=10):
```

**Krok 1 — filtrowanie filmów już ocenionych:**
```python
rated_movies = set(ratings[ratings['userId'] == userId]['movieId'])
unrated = movies[~movies['movieId'].isin(rated_movies)].copy()
```

Używamy `set()` zamiast listy bo sprawdzanie przynależności (`in`) dla zbioru
jest operacją O(1) — błyskawiczną. Dla listy byłoby O(n) — wolną.
Operator `~` to negacja — daje filmy których movieId NIE MA w zbiorze ocenionych.

**Krok 2 — statystyki agregowane:**
```python
movie_stats = ratings.groupby('movieId')['rating'].agg(['mean', 'count'])
```

Obliczamy średnią i liczbę ocen dla każdego filmu raz — wyniki są używane
dla wszystkich nieocenionych filmów w pętli.

**Krok 3 — budowanie macierzy cech:**
```python
for _, movie_row in unrated.iterrows():
    vec = build_feature_vector(user_row, movie_row, user_avg, m_avg, m_count)
    vectors.append(vec)

X = scaler.transform(np.array(vectors))
```

Dla każdego nieocenionego filmu budujemy wektor cech, a następnie skalujemy
całą macierz `scaler.transform()` — tym samym scalerem co w preprocessingu.
**Używamy `transform()` a nie `fit_transform()`** — nie uczymy się nowych
parametrów skalowania, używamy tych z treningu.

**Krok 4 — predykcja i sortowanie:**
```python
predicted_ratings = lr.predict(X)
predicted_ratings = np.clip(predicted_ratings, 1.0, 5.0)
```

`lr.predict(X)` zwraca przewidywane oceny dla wszystkich filmów naraz.
`np.clip(1.0, 5.0)` przycina wartości do zakresu 1–5 — regresja liniowa
może czasem przewidzieć wartości poza skalą (np. 5.8 lub 0.3).

```python
unrated['predicted_rating'] = predicted_ratings
top = unrated.nlargest(top_n, 'predicted_rating')
```

`nlargest(10, 'predicted_rating')` zwraca 10 filmów z najwyższą przewidywaną
oceną — to są nasze rekomendacje.

### get_validation() — walidacja modelu

```python
def get_validation(userId, ratings, movies, users):
```

Ta funkcja służy do **prezentacji jakości modelu** — pokazuje jak dobrze
model przewiduje oceny dla filmów które użytkownik już ocenił (i które są
w zbiorze testowym lub treningowym).

**Różnica względem get_recommendations():**
- `get_recommendations()` → filmy których user NIE oceniał (predykcja)
- `get_validation()` → filmy które user JUŻ oceniał (weryfikacja)

Zwraca RMSE i MAE dla konkretnego użytkownika — pozwala zobaczyć w UI
czy model jest dokładny dla tego konkretnego człowieka.

---

## main.py — serwer API

### CORS Middleware

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**CORS** (Cross-Origin Resource Sharing) to mechanizm bezpieczeństwa przeglądarek
który domyślnie blokuje zapytania HTTP między różnymi domenami/portami.

Frontend React działa na `http://localhost:3000`.
Backend FastAPI działa na `http://localhost:8000`.
To różne porty — przeglądarka bez CORS zablokowałaby zapytania frontendu do backendu.

`allow_origins=["*"]` zezwala na zapytania z każdego źródła.
W produkcji zastąpilibyśmy `"*"` konkretną domeną frontendu ze względów bezpieczeństwa.
Na potrzeby projektu lokalnego `"*"` jest standardowym rozwiązaniem.

### Endpointy API

#### GET `/`
```python
@app.get("/")
def root():
    return {"status": "ok", "message": "Film Recommender API działa"}
```

Endpoint diagnostyczny — szybki sposób sprawdzenia czy serwer działa.
Analogia: "ping" w sieci komputerowej.

#### GET `/recommend/{userId}`
```python
@app.get("/recommend/{userId}")
def recommend(userId: int, top_n: int = 10):
```

Główny endpoint rekomendacji.

`{userId}` w ścieżce to **path parameter** — wartość przekazana bezpośrednio
w URL: `/recommend/42` → `userId=42`.

`top_n: int = 10` to **query parameter** z wartością domyślną:
`/recommend/42?top_n=20` zwróci 20 rekomendacji zamiast 10.

Walidacja przed predykcją:
```python
if userId not in users['userId'].values:
    raise HTTPException(status_code=404, detail=f"Użytkownik {userId} nie istnieje")
```

HTTP 404 (Not Found) to standardowy kod odpowiedzi gdy zasób nie istnieje.
FastAPI automatycznie serializuje wyjątek do odpowiedzi JSON:
```json
{"detail": "Użytkownik 9999 nie istnieje"}
```

#### GET `/validate/{userId}`
```python
@app.get("/validate/{userId}")
def validate(userId: int):
```

Zwraca porównanie przewidywanych vs rzeczywistych ocen dla danego użytkownika.
Używany przez frontend do wyświetlenia wykresu walidacji i metryk RMSE/MAE.
To endpoint "naukowy" — pokazuje jakość modelu, nie rekomendacje.

#### GET `/user/{userId}`
```python
@app.get("/user/{userId}")
def user_info(userId: int):
```

Zwraca profil demograficzny użytkownika. Frontend używa go żeby wyświetlić
kontekst: "Rekomendacje dla użytkownika nr 42 (M, 25 lat, programista, 
średnia ocen: 3.8, liczba ocen: 127)".

---

## Przepływ danych — pełny schemat

```
Użytkownik wpisuje userId w UI
        ↓
React wysyła GET /recommend/{userId}
        ↓
FastAPI odbiera zapytanie
        ↓
Walidacja: czy userId istnieje?
        ↓ tak
get_recommendations(userId, ratings, movies, users)
        ↓
Pobierz profil użytkownika z users DataFrame
        ↓
Znajdź filmy nieocenione przez użytkownika
        ↓
Dla każdego filmu: build_feature_vector()
        ↓
scaler.transform(wektory)   ← ten sam scaler co w treningu
        ↓
lr.predict(X)               ← wytrenowany model regresji liniowej
        ↓
np.clip(wyniki, 1.0, 5.0)   ← przytnij do skali 1–5
        ↓
nlargest(10)                ← top 10 filmów
        ↓
FastAPI serializuje do JSON
        ↓
React odbiera i wyświetla rekomendacje
```

---

## Połączenie z modelem — dlaczego predict.py wie jak budować cechy?

To kluczowe pytanie dla spójności całego systemu.

Model regresji liniowej podczas treningu "nauczył się" zależności między
wektorem ~47 liczb a oceną 1–5. Nie wie nic o filmach, użytkownikach ani
gatunkach — widzi tylko liczby.

`predict.py` musi dostarczyć dokładnie te same liczby w dokładnie tej samej
kolejności co podczas treningu. Dlatego:

1. `FEATURE_COLS` z treningu → zapisany jako `feature_cols.pkl` → wczytany w `predict.py`
2. `scaler` z treningu → zapisany jako `scaler.pkl` → wczytany w `predict.py`
3. Logika `build_feature_vector()` → odzwierciedla dokładnie preprocessing z `02_preprocessing.ipynb`

Jeśli którykolwiek z tych elementów byłby niespójny, model dawałby bezsensowne wyniki.
Ta spójność między treningiem a inferencją (zastosowaniem modelu) to jedna
z najczęstszych pułapek w projektach ML.

---

*Dokumentacja wygenerowana dla backendu FastAPI*
*Projekt: Wykorzystanie regresji liniowej w procesie predykcyjnym doboru treści audiowizualnych*
