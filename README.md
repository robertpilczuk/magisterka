# 🎬 Film & Book Recommender
### Predykcja doboru treści z wykorzystaniem regresji liniowej

Projekt badawczy zrealizowany w ramach pracy magisterskiej.
System rekomendacji oparty na regresji liniowej i logistycznej,
trenowany na dwóch zbiorach danych: **MovieLens 1M** (filmy) oraz **Book-Crossing** (książki).

---

## Spis treści

- [Opis projektu](#opis-projektu)
- [Stack technologiczny](#stack-technologiczny)
- [Struktura projektu](#struktura-projektu)
- [Wymagania](#wymagania)
- [Instalacja i uruchomienie](#instalacja-i-uruchomienie)
- [Endpointy API](#endpointy-api)
- [Notebooki](#notebooki)
- [Testy](#testy)
- [Dokumentacja](#dokumentacja)
- [Zbiory danych](#zbiory-danych)

---

## Opis projektu

System rekomendacji treści, który dla dwóch domen (filmy i książki):

- **Przewiduje oceny** — regresja liniowa (filmy: skala 1–5, książki: skala 1–10)
- **Klasyfikuje** czy użytkownik polubi treść (próg binaryzacji) — regresja logistyczna z optymalizacją progu decyzyjnego
- **Porównuje** oba podejścia interaktywnie
- **Analizuje** jakość modelu per-użytkownik i per-grupa demograficzna
- **Wyjaśnia** rekomendacje przez wkład poszczególnych cech (interpretowalność modelu liniowego)
- Obsługuje **cold start** — rekomendacje dla nowych użytkowników spoza bazy
- Udostępnia **ewaluację top-N** (Precision / Recall / F1) dla wybranych użytkowników

Praca weryfikuje tezę, że regresja liniowa jest optymalnym modelem predykcji treści.
Wyniki nie potwierdziły tej tezy w sformułowaniu kategorycznym — wskazały natomiast
regresję liniową jako **użyteczny, interpretowalny model bazowy**, a regresję logistyczną
z optymalizacją progu jako bardziej skuteczne podejście dla zadania klasyfikacji binarnej.

---

## Stack technologiczny

| Warstwa | Technologie |
|---------|-------------|
| **Analiza danych** | Python, pandas, numpy, Jupyter Notebook |
| **Modele ML** | scikit-learn (LinearRegression, Ridge, Lasso, LogisticRegression) |
| **Backend** | FastAPI, uvicorn, joblib |
| **Frontend** | React 18, Vite, axios |
| **Konteneryzacja** | Docker, docker-compose |
| **Testy** | pytest (backend), Vitest + React Testing Library (frontend) |
| **i18n** | obsługa dwóch języków (PL / EN) |
| **Dane** | MovieLens 1M (GroupLens Research), Book-Crossing |

---

## Struktura projektu

```
magisterka/
├── data/                              # dane (nie w repo)
│   ├── ratings.dat                    # MovieLens — oceny
│   ├── movies.dat                     # MovieLens — filmy
│   ├── users.dat                      # MovieLens — użytkownicy
│   ├── books/                         # Book-Crossing — dane surowe
│   │   ├── Ratings.csv
│   │   ├── Books.csv
│   │   └── Users.csv
│   └── books_processed/               # Book-Crossing — dane przetworzone
│
├── notebooks/                         # Jupyter Notebooks
│   ├── 01_eda.ipynb                   # eksploracja danych (MovieLens)
│   ├── 02_preprocessing.ipynb         # preprocessing i feature engineering
│   ├── 03_model.ipynb                 # modele filmowe + threshold tuning
│   ├── 04_visualizations.ipynb        # wykresy do pracy magisterskiej
│   ├── 05_group_analysis.ipynb        # analiza per-grupa demograficzna
│   ├── 06_books_preprocessing.ipynb   # preprocessing Book-Crossing
│   └── 07_books_model.ipynb           # modele książkowe
│
├── backend/                           # FastAPI
│   ├── main.py                        # serwer i endpointy (filmy + książki)
│   ├── predict.py                     # logika predykcji (filmy)
│   ├── predict_books.py               # logika predykcji (książki)
│   ├── data_loader.py                 # wczytywanie danych (filmy)
│   ├── data_loader_books.py           # wczytywanie danych (książki)
│   ├── Dockerfile
│   ├── tests/                         # testy pytest
│   ├── model/                         # wytrenowane modele filmowe
│   │   ├── linear_model.pkl
│   │   ├── ridge_model.pkl
│   │   ├── lasso_model.pkl
│   │   ├── logistic_model.pkl
│   │   ├── scaler.pkl
│   │   ├── feature_cols.pkl
│   │   └── optimal_threshold.json
│   └── model_books/                   # wytrenowane modele książkowe
│       ├── linear_model_books.pkl
│       ├── ridge_model_books.pkl
│       ├── lasso_model_books.pkl
│       ├── logistic_model_books.pkl
│       ├── scaler_books.pkl
│       ├── feature_cols_books.pkl
│       └── optimal_threshold_books.json
│
├── frontend/                          # React + Vite
│   └── src/
│       ├── App.jsx
│       ├── i18n.js                    # tłumaczenia PL/EN
│       ├── utils.js
│       └── components/
│           ├── LandingPage.jsx
│           ├── AboutPage.jsx
│           ├── SearchBar.jsx
│           ├── UserProfile.jsx
│           ├── RecommendationCard.jsx
│           ├── ValidationChart.jsx
│           ├── EvaluationChart.jsx
│           ├── SimilarUsersFilter.jsx
│           ├── UserComparison.jsx
│           ├── UserTasteProfile.jsx
│           ├── GenreFilter.jsx
│           ├── NewUserFlow.jsx
│           ├── DeepAnalysisFlow.jsx
│           ├── BooksApp.jsx
│           ├── BookTasteProfile.jsx
│           ├── SimilarBooksUsersFilter.jsx
│           ├── Spinner.jsx
│           └── Tooltip.jsx
│
├── docs/                              # dokumentacja (21 plików)
├── docker-compose.yml
└── requirements.txt
```

---

## Wymagania

- Python 3.10+
- Node.js 18+
- npm 9+
- (opcjonalnie) Docker + docker-compose

---

## Instalacja i uruchomienie

### Wariant A — Docker (zalecany)

```bash
docker-compose up --build
```

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`
- Swagger UI: `http://localhost:8000/docs`

### Wariant B — uruchomienie lokalne

#### 1. Pobierz dane

**MovieLens 1M** — ze strony [grouplens.org/datasets/movielens/1m](https://grouplens.org/datasets/movielens/1m/),
wypakuj `ratings.dat`, `movies.dat`, `users.dat` do `data/`.

**Book-Crossing** — pliki `Ratings.csv`, `Books.csv`, `Users.csv` do `data/books/`.

#### 2. Zainstaluj zależności Pythona

```bash
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

#### 3. Uruchom notebooki (w kolejności)

```bash
jupyter notebook
```

Filmy: `01_eda` → `02_preprocessing` → `03_model` → `04_visualizations` *(opcjonalny)* → `05_group_analysis` *(opcjonalny)*
Książki: `06_books_preprocessing` → `07_books_model`

> ⚠️ Notebooki `03_model` i `07_books_model` muszą być uruchomione przed startem backendu —
> generują pliki modeli `.pkl` oraz `optimal_threshold*.json` potrzebne do działania API.

#### 4. Uruchom backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

> Uwaga: do zapytań `curl` na macOS używaj `127.0.0.1` zamiast `localhost` (kwestia IPv6).

#### 5. Uruchom frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend będzie dostępny pod adresem: `http://localhost:5173` (domyślny port Vite).

---

## Endpointy API

### Filmy (MovieLens 1M)

| Metoda | Endpoint | Opis |
|--------|----------|------|
| `GET` | `/` | Status serwera |
| `GET` | `/user/{userId}` | Profil demograficzny użytkownika |
| `GET` | `/recommend/{userId}` | Rekomendacje — regresja liniowa |
| `GET` | `/recommend-logistic/{userId}` | Rekomendacje — regresja logistyczna |
| `GET` | `/validate/{userId}` | Walidacja modelu per-użytkownik |
| `GET` | `/similar-users` | Filtr podobnych użytkowników |
| `GET` | `/compare-users/{id1}/{id2}` | Porównanie dwóch użytkowników |
| `GET` | `/user-taste/{userId}` | Profil filmowy (lubi/neutralne/nie lubi) |
| `GET` | `/explain/{userId}/{movieId}` | Wyjaśnienie predykcji — wkład cech |
| `GET` | `/evaluate/{userId}` | Ewaluacja top-N (Precision/Recall/F1) |
| `POST` | `/recommend-new-user` | Rekomendacje cold start |

### Książki (Book-Crossing)

| Metoda | Endpoint | Opis |
|--------|----------|------|
| `GET` | `/books/user/{userId}` | Profil użytkownika |
| `GET` | `/books/recommend/{userId}` | Rekomendacje — regresja liniowa |
| `GET` | `/books/recommend-logistic/{userId}` | Rekomendacje — regresja logistyczna |
| `GET` | `/books/validate/{userId}` | Walidacja modelu per-użytkownik |
| `GET` | `/books/similar-users` | Filtr podobnych użytkowników |
| `GET` | `/books/user-taste/{userId}` | Profil czytelniczy (lubi/średnie/słabe) |
| `GET` | `/books/random-user` | Losowy użytkownik z bazy |
| `POST` | `/books/recommend-new-user` | Rekomendacje cold start |

### Przykłady

`GET /similar-users` (parametry opcjonalne):
```
/similar-users?gender=M&age=25&occupation=12&limit=20
```

`POST /recommend-new-user`:
```json
{
  "ratings": [
    { "movieId": 318, "rating": 4.5 },
    { "movieId": 296, "rating": 3.0 },
    { "movieId": 2571, "rating": 5.0 }
  ],
  "age": 25,
  "gender": "M",
  "occupation": 12
}
```

`POST /books/recommend-new-user`:
```json
{
  "ratings": [
    { "isbn": "0316666343", "rating": 9 },
    { "isbn": "0385504209", "rating": 7 },
    { "isbn": "0060928336", "rating": 8 }
  ],
  "age": 25
}
```

---

## Notebooki

| Notebook | Zawartość | Output |
|----------|-----------|--------|
| `01_eda.ipynb` | Eksploracja danych MovieLens, rozkłady, demografia, long-tail | wykresy PNG |
| `02_preprocessing.ipynb` | Feature engineering, skalowanie, podział danych | `X_train.npy`, `X_test.npy`, `scaler.pkl` |
| `03_model.ipynb` | Regresja liniowa, Ridge, Lasso, logistyczna, threshold tuning | `*.pkl`, `optimal_threshold.json` |
| `04_visualizations.ipynb` | Wykresy do pracy magisterskiej | `fig1_*.png` … `fig6_*.png` |
| `05_group_analysis.ipynb` | RMSE/MAE per płeć, wiek, zawód, aktywność | `fig_group_*.png`, `group_analysis_summary.json` |
| `06_books_preprocessing.ipynb` | Preprocessing Book-Crossing, filtracja, feature engineering | dane w `books_processed/`, `book_crossing_eda.png` |
| `07_books_model.ipynb` | Modele książkowe + threshold tuning | `*_books.pkl`, `optimal_threshold_books.json` |

> **Wykresy w `notebooks/`:** wersje docelowe do pracy magisterskiej to `fig1_*.png` … `fig6_*.png`
> (z `04_visualizations`) oraz `fig_group_*.png` (z `05_group_analysis`) — opisane w `docs/07_visualizations.md`
> i `docs/08_group_analysis.md`. Pliki `plot_*.png` to robocze podglądy generowane inline przez notebooki
> `01_eda`/`02_preprocessing`/`03_model` (szybka kontrola wzrokowa, nie wersje publikacyjne).

---

## Testy

```bash
# backend
cd backend && pytest

# frontend
cd frontend && npx vitest run
```

Pokrycie: testy jednostkowe backendu (pytest), testy integracyjne API (FastAPI TestClient)
oraz testy komponentów frontendu (Vitest + React Testing Library).

---

## Dokumentacja

Folder `docs/` zawiera szczegółową dokumentację każdego komponentu (21 plików),
napisaną z myślą o osobach bez doświadczenia w ML i statystyce.

| Plik | Zawartość |
|------|-----------|
| `01_eda.md` | EDA — wyjaśnienie każdej komórki i wykresu |
| `02_preprocessing.md` | Preprocessing — One-Hot Encoding, skalowanie, data leakage |
| `03_model.md` | Modele — regresja liniowa, Ridge, Lasso, logistyczna, metryki |
| `04_backend.md` | Backend FastAPI — endpointy, logika predykcji (z sekcją aktualizacji) |
| `05_frontend.md` | Frontend React — komponenty, zarządzanie stanem (z sekcją aktualizacji) |
| `06_chapter3_foundation.md` | Podwaliny pod Rozdział III — wnioski, ograniczenia, porównanie modeli |
| `07_visualizations.md` | Wykresy — jak czytać i opisywać w pracy |
| `08_group_analysis.md` | Analiza per-grupa — long-tail problem, selection bias |
| `09_deep_analysis.md` | Zakładka pogłębionej analizy — wagi kryteriów |
| `10_docker.md` | Konteneryzacja — Docker, docker-compose |
| `11_i18n.md` | Internacjonalizacja — obsługa PL/EN |
| `12_per_user_split.md` | Podział danych dla każdego użytkownika (temporalny i losowy) |
| `13_landing_page.md` | Strona startowa aplikacji |
| `14_books_preprocessing.md` | Preprocessing Book-Crossing |
| `15_books_model.md` | Modele książkowe |
| `16_books_backend.md` | Backend książkowy — endpointy `/books/*` |
| `17_books_frontend.md` | Frontend książkowy |
| `18_caching_vectorization.md` | Optymalizacja — cache statystyk i wektoryzacja |
| `19_testing.md` | Testy — pytest i Vitest |
| `20_ui_features.md` | Funkcje interfejsu użytkownika |
| `21_topn_evaluation.md` | Ewaluacja top-N — Precision, Recall, F1 |

---

## Zbiory danych

### MovieLens 1M — GroupLens Research, University of Minnesota
- 1 000 209 ocen, 6 040 użytkowników, 3 883 filmy
- Oceny w skali 1–5
- Dane demograficzne: wiek, płeć, zawód
- Źródło: [grouplens.org/datasets/movielens/1m](https://grouplens.org/datasets/movielens/1m/)

### Book-Crossing
- ~1,15 mln ocen surowych → 96 059 po filtracji (usunięcie ocen zerowych, użytkownicy < 20 ocen, książki < 5 ocen)
- Oceny w skali 1–10
- Dane demograficzne: wiek (ograniczone)

> Zbiory danych nie są dołączone do repozytorium ze względu na licencję.
> Pobierz je ręcznie i umieść w folderze `data/`.

---

## Autor

Robert Pilczuk
Praca magisterska — Lubelska Akademia WSEI w Lublinie
Kierunek: Informatyka, specjalizacja: Programowanie i Analiza Danych