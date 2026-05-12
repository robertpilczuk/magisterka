# 🎬 Film Recommender
### Predykcja doboru treści audiowizualnych z wykorzystaniem regresji liniowej

Projekt badawczy zrealizowany w ramach pracy magisterskiej.  
System rekomendacji filmów oparty na regresji liniowej i logistycznej,  
trenowany na zbiorze danych MovieLens 1M.

---

## Spis treści

- [Opis projektu](#opis-projektu)
- [Stack technologiczny](#stack-technologiczny)
- [Struktura projektu](#struktura-projektu)
- [Wymagania](#wymagania)
- [Instalacja i uruchomienie](#instalacja-i-uruchomienie)
- [Endpointy API](#endpointy-api)
- [Notebooki](#notebooki)
- [Dokumentacja](#dokumentacja)
- [Zbiór danych](#zbi%C3%B3r-danych)

---

## Opis projektu

System rekomendacji filmowych który:

- **Przewiduje oceny** (1–5) które użytkownik wystawi filmowi — regresja liniowa
- **Klasyfikuje** czy użytkownik polubi film (ocena ≥ 4) — regresja logistyczna
- **Porównuje** oba podejścia w czasie rzeczywistym
- **Analizuje** jakość modelu per-użytkownik i per-grupa demograficzna
- Obsługuje **cold start** — rekomendacje dla nowych użytkowników spoza bazy
- Umożliwia **wielokryterialną ocenę** filmów z wagami (fabuła, muzyka, efekty...)

Praca stawia i obala tezę że regresja liniowa jest najlepszym modelem  
do predykcji treści audiowizualnych — wskazując na regresję logistyczną  
z threshold tuningiem jako bardziej efektywne podejście dla zadania klasyfikacji.

---

## Stack technologiczny

| Warstwa | Technologie |
|---------|-------------|
| **Analiza danych** | Python, pandas, numpy, Jupyter Notebook |
| **Modele ML** | scikit-learn (LinearRegression, Ridge, Lasso, LogisticRegression) |
| **Backend** | FastAPI, uvicorn, joblib |
| **Frontend** | React 18, Vite, axios |
| **Dane** | MovieLens 1M (GroupLens Research) |

---

## Struktura projektu

```
magisterka/
├── data/                          # dane MovieLens (nie w repo)
│   ├── ratings.dat
│   ├── movies.dat
│   └── users.dat
│
├── notebooks/                     # Jupyter Notebooks
│   ├── 01_eda.ipynb               # eksploracja danych
│   ├── 02_preprocessing.ipynb     # preprocessing i feature engineering
│   ├── 03_model.ipynb             # budowa i ocena modeli
│   ├── 04_visualizations.ipynb    # wykresy do pracy magisterskiej
│   └── 05_group_analysis.ipynb    # analiza per-grupa demograficzna
│
├── backend/                       # FastAPI
│   ├── main.py                    # serwer i endpointy
│   ├── predict.py                 # logika predykcji
│   ├── data_loader.py             # wczytywanie danych
│   └── model/                    # wytrenowane modele
│       ├── linear_model.pkl
│       ├── ridge_model.pkl
│       ├── lasso_model.pkl
│       ├── logistic_model.pkl
│       ├── scaler.pkl
│       ├── feature_cols.pkl
│       └── optimal_threshold.json
│
├── frontend/                      # React + Vite
│   └── src/
│       ├── App.jsx
│       ├── i18n.js                # tłumaczenia PL/EN
│       ├── utils.js               # wspólne funkcje
│       └── components/
│           ├── SearchBar.jsx
│           ├── UserProfile.jsx
│           ├── RecommendationCard.jsx
│           ├── ValidationChart.jsx
│           ├── SimilarUsersFilter.jsx
│           ├── UserComparison.jsx
│           ├── UserTasteProfile.jsx
│           ├── GenreFilter.jsx
│           ├── NewUserFlow.jsx
│           ├── DeepAnalysisFlow.jsx
│           ├── Spinner.jsx
│           └── Tooltip.jsx
│
├── docs/                          # dokumentacja
│   ├── 01_eda.md
│   ├── 02_preprocessing.md
│   ├── 03_model.md
│   ├── 04_backend.md
│   ├── 04_backend_update.md
│   ├── 05_frontend.md
│   ├── 05_frontend_update.md
│   ├── 06_chapter3_foundation.md  # podwaliny pod Rozdział III
│   ├── 07_visualizations.md
│   ├── 08_group_analysis.md
│   └── 09_deep_analysis.md
│
└── requirements.txt
```

---

## Wymagania

- Python 3.10+
- Node.js 18+
- npm 9+

---

## Instalacja i uruchomienie

### 1. Pobierz dane MovieLens 1M

Pobierz `ml-1m.zip` ze strony [grouplens.org/datasets/movielens/1m](https://grouplens.org/datasets/movielens/1m/)  
i wypakuj pliki `ratings.dat`, `movies.dat`, `users.dat` do folderu `data/`.

### 2. Zainstaluj zależności Pythona

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Uruchom notebooki (w kolejności)

```bash
jupyter notebook
```

Uruchom notebooki w kolejności:
1. `01_eda.ipynb`
2. `02_preprocessing.ipynb`
3. `03_model.ipynb`
4. `04_visualizations.ipynb` *(opcjonalny)*
5. `05_group_analysis.ipynb` *(opcjonalny)*

> ⚠️ Notebooki muszą być uruchomione przed startem backendu —  
> generują pliki `.pkl` i `.npy` potrzebne do działania API.

### 4. Uruchom backend

```bash
cd backend
uvicorn main:app --reload
```

Backend będzie dostępny pod adresem: `http://localhost:8000`  
Dokumentacja API (Swagger UI): `http://localhost:8000/docs`

### 5. Uruchom frontend

W nowym oknie terminala:

```bash
cd frontend
npm install
npm run dev
```

Frontend będzie dostępny pod adresem: `http://localhost:5173`

---

## Endpointy API

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
| `POST` | `/recommend-new-user` | Rekomendacje cold start |

### Parametry query dla `/similar-users`

```
/similar-users?gender=M&age=25&occupation=12&limit=20
```

Wszystkie parametry opcjonalne.

### Body dla `POST /recommend-new-user`

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

---

## Notebooki

| Notebook | Zawartość | Output |
|----------|-----------|--------|
| `01_eda.ipynb` | Eksploracja danych, rozkłady, demografia | 5 wykresów PNG |
| `02_preprocessing.ipynb` | Feature engineering, skalowanie, podział danych | `X_train.npy`, `X_test.npy`, `scaler.pkl` |
| `03_model.ipynb` | Regresja liniowa, Ridge, Lasso, logistyczna, threshold tuning | `*.pkl`, `optimal_threshold.json` |
| `04_visualizations.ipynb` | Wykresy do pracy magisterskiej | `fig1_*.png` ... `fig6_*.png` |
| `05_group_analysis.ipynb` | RMSE per płeć, wiek, zawód, aktywność | `fig_group_*.png` |

---

## Dokumentacja

Folder `docs/` zawiera szczegółową dokumentację każdego komponentu systemu,
napisaną z myślą o osobach bez doświadczenia w ML i statystyce.

| Plik | Zawartość |
|------|-----------|
| `01_eda.md` | EDA — wyjaśnienie każdej celki i wykresu |
| `02_preprocessing.md` | Preprocessing — One-Hot Encoding, skalowanie, data leakage |
| `03_model.md` | Modele — regresja liniowa, Ridge, Lasso, logistyczna, metryki |
| `04_backend.md` + `04_backend_update.md` | Backend FastAPI — endpointy, logika predykcji |
| `05_frontend.md` + `05_frontend_update.md` | Frontend React — komponenty, zarządzanie stanem |
| `06_chapter3_foundation.md` | **Podwaliny pod Rozdział III** — wnioski, ograniczenia, porównanie modeli |
| `07_visualizations.md` | Wykresy — jak czytać i opisywać w pracy |
| `08_group_analysis.md` | Analiza per-grupa — long-tail problem, selection bias |
| `09_deep_analysis.md` | Zakładka pogłębionej analizy — wagi kryteriów |

---

## Zbiór danych

**MovieLens 1M** — GroupLens Research, University of Minnesota  
- 1 000 209 ocen
- 6 040 użytkowników
- 3 883 filmy
- Oceny w skali 1–5
- Dane demograficzne: wiek, płeć, zawód

Źródło: [grouplens.org/datasets/movielens/1m](https://grouplens.org/datasets/movielens/1m/)

> Zbiór danych nie jest dołączony do repozytorium ze względu na licencję.  
> Pobierz go ręcznie i umieść w folderze `data/`.

---

## Autor

Robert Pilczuk  
Praca magisterska — WSEI Lublin  
Kierunek: Informatyka, specjalizacja: Programowanie i Analiza Danych
