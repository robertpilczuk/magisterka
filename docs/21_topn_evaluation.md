# 21. Ewaluacja top-N — weryfikacja predykcji modelu

## Cel i motywacja

Standardowa walidacja modelu regresji (RMSE, MAE, R²) mierzy dokładność
przewidywanej oceny numerycznej — o ile punktów model myli się przewidując
ocenę użytkownika. To wartościowa metryka, ale nie odpowiada bezpośrednio
na pytanie które jest kluczowe z perspektywy systemu rekomendacyjnego:

> **"Czy model poleca filmy które użytkownik rzeczywiście polubi?"**

Ewaluacja top-N (ang. *top-N evaluation*) odpowiada wprost na to pytanie.
Zamiast mierzyć dokładność przewidywanej oceny, mierzy **skuteczność
rankingowania i filtrowania treści** — czy filmy ocenione przez model jako
"warte obejrzenia" rzeczywiście trafiają w gust użytkownika.

Jest to silniejszy dowód jakości modelu, bo symuluje rzeczywisty scenariusz
użycia systemu rekomendacyjnego: użytkownik dostaje listę propozycji i
decyduje które z nich mu się podobały.

---

## Metodologia

### Podział danych

Ewaluacja opiera się na temporalnym podziale danych per-użytkownik
(ang. *per-user temporal split*) zastosowanym w notebooku
`02_preprocessing.ipynb`:

- **Zbiór treningowy** (`train_with_ids.csv`) — pierwsze 80% ocen każdego
  użytkownika posortowanych chronologicznie. Model uczy się na tych danych.
- **Zbiór testowy** (`test_with_ids.csv`) — ostatnie 20% ocen każdego
  użytkownika. To "przyszłość" której model nie widział podczas treningu.

Pliki zawierają kolumny `userId`, `movieId`, wszystkie cechy (`FEATURE_COLS`)
oraz ocenę rzeczywistą (`rating`). Dzięki temu możliwe jest odtworzenie
który film należy do którego użytkownika i kiedy go ocenił.

### Procedura ewaluacji

Dla danego użytkownika procedura przebiega następująco:

1. **Wczytanie danych treningowych i testowych** dla tego użytkownika
2. **Wygenerowanie kandydatów** — filmy których użytkownik **nie ocenił
   w zbiorze treningowym** (to są filmy które mógłby zobaczyć "w przyszłości")
3. **Filtrowanie do zbioru testowego** — ze wszystkich kandydatów
   pozostawiamy tylko te filmy które użytkownik **faktycznie ocenił**
   w zbiorze testowym. Dzięki temu wiemy jaka była jego rzeczywista reakcja.
4. **Predykcja oceny** — dla każdego filmu z filtru model regresji liniowej
   przewiduje ocenę (1–5)
5. **Binaryzacja** — zarówno przewidywana jak i rzeczywista ocena jest
   binaryzowana: ≥4.0 = "polubił" (klasa 1), <4.0 = "nie polubił" (klasa 0)
6. **Obliczenie metryk** — Precision, Recall, F1, RMSE, MAE na zbiorze testowym

### Dlaczego próg 4.0?

Próg 4.0 w skali 1–5 odpowiada ocenie "dobry" lub "bardzo dobry" — górne
40% skali. W datasecie MovieLens 1M rozkład ocen jest lewostronnie skośny
(użytkownicy oceniają hojnie), więc próg 4.0 skutecznie oddziela filmy
które użytkownik polubił od tych które ocenił neutralnie lub negatywnie.

Alternatywnie można by użyć progu 3.5 (mediana), ale 4.0 jest bardziej
konserwatywy i lepiej odpowiada intuicji "polecam ten film".

---

## Implementacja backendu

### Plik `backend/predict.py` — funkcja `get_topn_evaluation`

```python
def get_topn_evaluation(userId, ratings, movies, users, top_n=10, movie_stats=None):
```

**Parametry:**
- `userId` — ID użytkownika do ewaluacji
- `ratings`, `movies`, `users` — pełne datasety (wczytane przy starcie serwera)
- `top_n` — liczba rekomendacji (domyślnie 10, ale ewaluacja działa na
  wszystkich filmach testowych)
- `movie_stats` — prekompilowane statystyki (cache)

**Kroki implementacji:**

```python
# 1. Wczytaj podział train/test z metadanymi
train_df = pd.read_csv(os.path.join(data_dir, "train_with_ids.csv"))
test_df  = pd.read_csv(os.path.join(data_dir, "test_with_ids.csv"))

# 2. Filtruj do konkretnego użytkownika
user_train = train_df[train_df["userId"] == userId]
user_test  = test_df[test_df["userId"] == userId]

# 3. Pobierz filmy ze zbioru testowego z datasetu filmowego
test_movies = movies[movies["movieId"].isin(user_test["movieId"])].copy()

# 4. Wektoryzacja — buduj macierz cech dla filmów testowych
test_movies = test_movies.merge(ms.rename(...), left_on="movieId", ...)
test_movies["age"]             = user_row["age"]
test_movies["gender_encoded"]  = 1 if user_row["gender"] == "M" else 0
test_movies["user_avg_rating"] = user_avg
# ... one-hot encoding gatunków i zawodów

# 5. Predykcja
X = scaler.transform(pd.DataFrame(test_movies[FEATURE_COLS].fillna(0)))
test_movies["predicted_rating"] = np.clip(lr.predict(X), 1.0, 5.0)

# 6. Połącz z rzeczywistymi ocenami i oblicz metryki
actual_ratings = dict(zip(user_test["movieId"], user_test["rating"]))
liked_threshold = 4.0

hits      = sum(1 for r in results if r["hit"])
precision = hits / n_pred  if n_pred  > 0 else 0.0
recall    = hits / n_liked if n_liked > 0 else 0.0
f1        = 2 * precision * recall / (precision + recall) if ... else 0.0
```

### Endpoint `/evaluate/{userId}`

```python
@app.get("/evaluate/{userId}")
def evaluate_topn(userId: int, top_n: int = 10):
    _check_user(userId)
    return get_topn_evaluation(
        userId, ratings, movies, users, top_n,
        movie_stats=movie_stats_cache
    )
```

**Przykładowa odpowiedź:**
```json
{
  "userId": 1,
  "test_count": 11,
  "n_liked_by_user": 9,
  "n_model_recommends": 8,
  "hits": 6,
  "precision": 0.75,
  "recall": 0.6667,
  "f1": 0.7059,
  "rmse_on_test": 0.8827,
  "mae_on_test": 0.65,
  "liked_threshold": 4.0,
  "recommendations": [
    {
      "rank": 1,
      "movieId": 745,
      "title": "Close Shave, A (1995)",
      "genres": "Animation|Comedy|Thriller",
      "predicted_rating": 5.0,
      "actual_rating": 3.0,
      "model_recommends": true,
      "user_liked": false,
      "hit": false
    },
    ...
  ]
}
```

---

## Metryki ewaluacji

### Precision (Precyzja)

```
Precision = hits / n_model_recommends
```

Ile z filmów które model polecił (predicted_rating ≥ 4.0) użytkownik
faktycznie polubił (actual_rating ≥ 4.0).

**Przykład:** model polecił 8 filmów, 6 z nich użytkownik polubił →
Precision = 6/8 = 0.75 = 75%.

**Interpretacja:** wysoka precyzja oznacza że gdy model poleca film,
można mu ufać. Niska precyzja oznacza dużo "fałszywych alarmów" —
model poleca filmy których użytkownik nie lubi.

### Recall (Czułość)

```
Recall = hits / n_liked_by_user
```

Ile z filmów które użytkownik lubił (actual_rating ≥ 4.0) model
zdołał zidentyfikować jako warte polecenia.

**Przykład:** użytkownik polubił 9 filmów, model polecił 6 z nich →
Recall = 6/9 = 0.667 = 66.7%.

**Interpretacja:** wysoki recall oznacza że model nie przeoczy filmów
które spodobałyby się użytkownikowi. Niski recall oznacza dużo "przeoczeń"
— polubiane filmy pozostają nieodkryte.

### F1-score

```
F1 = 2 × (Precision × Recall) / (Precision + Recall)
```

Harmoniczna średnia precyzji i czułości. Penalizuje modele które
osiągają dobry wynik na jednej metryce kosztem drugiej.

**Przykład:** Precision=0.75, Recall=0.667 → F1 = 0.706.

**Interpretacja skali F1:**
- F1 ≥ 0.7 → dobry wynik (kolor zielony w UI)
- F1 ∈ [0.5, 0.7) → średni wynik (kolor żółty)
- F1 < 0.5 → słaby wynik (kolor czerwony)

### RMSE i MAE na zbiorze testowym

Analogiczne do walidacji modelu, ale obliczone wyłącznie na filmach
ze zbioru testowego danego użytkownika. Pozwala porównać dokładność
numeryczną predykcji na "przyszłych" ocenach z globalnym RMSE modelu.

---

## Implementacja frontendu

### Komponent `EvaluationChart.jsx`

Komponent otrzymuje obiekt `evaluation` z odpowiedzi API i renderuje:

1. **Baner informacyjny** — próg polubienia, liczba filmów testowych,
   liczba polubień i poleceń
2. **Sześć kart metryk** — Trafienia, Precyzja, Czułość, F1, RMSE, MAE.
   Każda karta owinięta w `<Tooltip>` z wyjaśnieniem metryki.
3. **Pasek F1-score** — wizualizacja wyniku z oceną słowną
   (Dobry/Średni/Słaby)
4. **Tabela filmów testowych** — każdy wiersz pokazuje:
   - Tytuł i gatunek
   - Przewidywaną ocenę (niebieski = model poleca, szary = nie poleca)
   - Rzeczywistą ocenę (zielony = polubił, czerwony = nie polubił)
   - Czy model polecił (✅ Tak / — Nie)
   - Czy user polubił (✅ Tak / — Nie)
   - Wynik: 🎯 Trafienie / ❌ Fałszywy alarm / ⚠️ Przeoczenie / —
5. **Legenda** — wyjaśnienie symboli

**Kolorowanie wierszy:**
- Zielone tło — trafienie (model polecił + user polubił)
- Czerwone tło — fałszywy alarm (model polecił, user nie polubił)
- Żółte tło — przeoczenie (model nie polecił, user polubił)
- Szare tło — oboje zgodni że film niepolubiany

### Integracja z App.jsx

```jsx
// Stan
const [evaluation, setEvaluation] = useState(null)

// Funkcja pobierająca ewaluację
async function fetchEvaluation(id, n = topN) {
    try {
        const res = await axios.get(`${API}/evaluate/${id}?top_n=${n}`)
        setEvaluation(res.data)
    } catch (err) {
        console.error('Błąd ewaluacji:', err)
    }
}

// Wywołanie w fetchAll (po pobraniu profilu i rekomendacji)
fetchEvaluation(id, n)

// Render
<EvaluationChart evaluation={evaluation} />
```

Ewaluacja jest pobierana równolegle z innymi danymi użytkownika —
nie blokuje wyświetlania profilu i rekomendacji.

---

## Wyniki dla przykładowych użytkowników

| userId | Test filmów | Polubił | Model polecił | Trafienia | Precision | Recall | F1 |
|--------|-------------|---------|---------------|-----------|-----------|--------|----|
| 1 | 11 | 9 | 8 | 6 | 0.750 | 0.667 | 0.706 |

Wyniki różnią się między użytkownikami w zależności od:
- Liczby ocen treningowych (więcej = lepszy model)
- Specyfiki preferencji (unikalne gusta = trudniejsza predykcja)
- Liczby filmów testowych (mniej = większa losowość metryk)

---

## Znaczenie dla pracy magisterskiej

Ewaluacja top-N dostarcza **bezpośredniego, wizualnego dowodu** skuteczności
modelu który można zaprezentować komisji podczas obrony:

- Czarno na białym widać które filmy model polecił i czy trafił
- Metryki (Precision, Recall, F1) są standardowymi miarami w literaturze
  systemów rekomendacyjnych
- Możliwość interaktywnego sprawdzenia dowolnego użytkownika z datasetu
- Wyniki potwierdzają że model jest lepszy niż losowe rekomendacje
  (losowy model osiągałby Precision ≈ proporcja lubianych filmów ≈ 0.40)

---

## Ograniczenia

1. **Mała próba testowa** — średnio ~11 filmów testowych na użytkownika
   (20% z min. 53 ocen). Przy tak małej próbie metryki mają duże odchylenie
   — F1=0.70 dla jednego użytkownika nie jest reprezentatywne dla wszystkich.
   Globalny RMSE=0.912 jest bardziej wiarygodny bo obliczony na 202 451
   rekordach.

2. **Brak cold start w ewaluacji** — ewaluacja działa tylko dla użytkowników
   z historią ocen w zbiorze treningowym. Nowi użytkownicy (cold start)
   nie mają zbioru testowego.

3. **Próg 4.0 jest arbitralny** — zmiana progu na 3.5 lub 4.5 istotnie
   wpłynęłaby na wyniki. Optymalny próg mógłby być wyznaczany per-użytkownik
   na podstawie jego rozkładu ocen.
