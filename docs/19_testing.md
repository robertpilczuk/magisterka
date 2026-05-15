# 19. Testy jakości oprogramowania

## Podsumowanie

| Kategoria | Plik | Liczba testów | Narzędzie |
|-----------|------|---------------|-----------|
| Jednostkowe backend — filmy | `tests/test_predict.py` | 29 | pytest |
| Jednostkowe backend — książki | `tests/test_predict_books.py` | 24 | pytest |
| Integracyjne API | `tests/test_api.py` | 46 | pytest + FastAPI TestClient |
| Jednostkowe frontend | `src/*.test.jsx`, `src/components/*.test.jsx` | 35 | Vitest + RTL |
| **Łącznie** | | **134** | |

Wszystkie 134 testy zaliczone (passed).

---

## Backend — testy jednostkowe filmowe (`test_predict.py`)

### `TestBuildFeatureVector` (17 testów)

Testuje funkcję `build_feature_vector(user_row, movie_row, user_avg, movie_avg, movie_count)`.

Sprawdzane właściwości:
- Zwraca listę długości `len(FEATURE_COLS)` (45)
- Płeć M → `gender_encoded = 1`, płeć F → `gender_encoded = 0`
- Wiek, średnie ocen i liczba ocen są zachowywane bez zmian
- Rok jest poprawnie wyciągany z tytułu `"Film (1995)"` → `1995.0`
- Brak roku w tytule → fallback `1995.0`
- Gatunek obecny w filmie → `1` w odpowiedniej kolumnie one-hot
- Gatunek nieobecny → `0`
- Zawód `4` → `occ_4 = 1`, wszystkie inne `occ_* = 0`
- Brak wartości NaN w wektorze
- Wszystkie wartości numeryczne

### `TestGetRecommendations` (6 testów)

- Zwraca listę
- Długość ≤ top_n
- Każdy wynik ma klucze: movieId, title, genres, predicted_rating
- predicted_rating ∈ [1.0, 5.0]
- Brak filmów już ocenionych przez użytkownika
- Wyniki posortowane malejąco po predicted_rating

### `TestGetValidation` (6 testów)

- Zwraca słownik z kluczami: userId, rmse, mae, count, samples
- RMSE ≥ 0, MAE ≥ 0
- count = liczba ocen użytkownika
- Próbki mają klucze: title, genres, actual, predicted
- Rzeczywiste oceny w próbce zgodne z danymi wejściowymi

---

## Backend — testy jednostkowe książkowe (`test_predict_books.py`)

### `TestBuildFeatureVector` (9 testów)

Analogiczne do filmowych, ale dla 5 cech (age, user_avg_rating, book_avg_rating, book_rating_count, year).

### `TestGetBookRecommendations` (6 testów)

Analogiczne do filmowych — zakres predicted_rating ∈ [1.0, 10.0] (skala 1–10).

### `TestGetBookRecommendationsLogistic` (4 testy)

- Zwraca listę z kluczem `like_probability`
- like_probability ∈ [0.0, 1.0]
- Brak już ocenionych książek

### `TestGetBookValidation` (6 testów)

Analogiczne do filmowych + test pustego użytkownika (count=0, rmse=0.0, mae=0.0).

---

## Backend — testy integracyjne (`test_api.py`)

Używają `FastAPI TestClient` który symuluje HTTP bez uruchamiania serwera:

```python
from fastapi.testclient import TestClient
from main import app
client = TestClient(app)
```

### Testowane endpointy i scenariusze

| Klasa | Endpointy | Testy |
|-------|-----------|-------|
| `TestRoot` | `GET /` | status 200, json.status == "ok" |
| `TestUserEndpoint` | `GET /user/{id}` | 200/404, struktura odpowiedzi |
| `TestRecommendEndpoint` | `GET /recommend/{id}` | 200/404, top_n, zakres ocen |
| `TestRecommendLogisticEndpoint` | `GET /recommend-logistic/{id}` | like_probability ∈ [0,1] |
| `TestValidateEndpoint` | `GET /validate/{id}` | metryki nieujemne |
| `TestSimilarUsersEndpoint` | `GET /similar-users` | filtrowanie po płci |
| `TestNewUserEndpoint` | `POST /recommend-new-user` | 200 / 400 przy <3 ocenach |
| `TestUserTasteEndpoint` | `GET /user-taste/{id}` | lubi/srednie/slabe/stats |
| `TestExplainEndpoint` | `GET /explain/{id}/{movieId}` | 3 cechy z direction +/- |
| `TestBooksEndpoints` | `/books/*` | random-user, recommend, 400 przy <3 ocenach |

### Instalacja zależności

```bash
pip install httpx --break-system-packages
```

`httpx` jest wymagany przez `starlette.testclient` (dependency FastAPI TestClient).

---

## Frontend — testy jednostkowe

### Konfiguracja

**`frontend/vite.config.js`** — dodano sekcję `test`:
```js
test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
}
```

**`frontend/src/test/setup.js`**:
```js
import '@testing-library/jest-dom'
```

**`frontend/package.json`** — nowe skrypty:
```json
"test": "vitest",
"test:run": "vitest run"
```

### Instalacja

```bash
npm install --save-dev vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

### Pliki testowe i ich zakres

**`src/components/SearchBar.test.jsx`** (7 testów)
- Renderuje input i przycisk
- Błąd przy ID < 1 lub > 6040
- Wywołuje onSearch z poprawnym ID
- Działa na Enter
- Nie wywołuje onSearch dla innych klawiszy

**`src/components/GenreFilter.test.jsx`** (7 testów)
- 18 przycisków gatunków + 2 kontrolne = 20 przycisków
- Toggle gatunku — dodaje/usuwa z selected
- "Pokaż wszystkie" czyści selekcję
- "Ukryj wszystkie" zaznacza wszystkie 18 gatunków
- Licznik ukrytych gatunków

**`src/components/RecommendationCard.test.jsx`** (7 testów)
- Renderuje tytuł, rank, ocenę (linear) lub prawdopodobieństwo (logistic)
- Gatunki z separatorem ` · `
- Brak przycisku "Dlaczego?" bez userId
- Przycisk "Dlaczego?" gdy userId przekazany

**`src/components/Spinner.Tooltip.test.jsx`** (8 testów)
- Spinner: renderuje, respektuje size i color
- Tooltip: renderuje children, ukryty domyślnie, widoczny po mouseEnter, ukryty po mouseLeave

**`src/LangContext.test.jsx`** (6 testów)
- Domyślny język PL
- Przełączanie EN i z powrotem do PL
- `t()` zwraca tłumaczenie PL/EN
- `t()` zwraca klucz jako fallback gdy tłumaczenie nie istnieje

### Uruchamianie testów

```bash
# wszystkie testy (watch mode)
cd frontend && npm test

# jednorazowe uruchomienie
cd frontend && npm run test:run

# backend
cd backend && python -m pytest tests/ -v

# backend — jeden plik
cd backend && python -m pytest tests/test_predict.py -v
```

---

## Wzorzec pomocniczy w testach frontendowych

Komponenty używające `useLang()` wymagają owinięcia w `<LangProvider>`:

```jsx
function renderWithLang(ui) {
    return render(<LangProvider>{ui}</LangProvider>)
}

it('renders button', () => {
    renderWithLang(<SearchBar onSearch={() => {}} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
})
```
