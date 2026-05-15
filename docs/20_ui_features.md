# 20. Funkcjonalności UI — suwak, historia, eksport CSV, "Dlaczego?", O projekcie

## Suwak liczby rekomendacji (top_n)

### Opis
Suwak umożliwia dynamiczne sterowanie liczbą wyświetlanych rekomendacji (5–50, krok 5).
Dostępny w zakładce "Użytkownik z bazy" zarówno dla filmów jak i książek.

### Implementacja

**Stan w App.jsx / BooksApp.jsx:**
```jsx
const [topN, setTopN] = useState(10)
```

**JSX:**
```jsx
<input
    type="range" min="5" max="50" step="5" value={topN}
    onChange={e => setTopN(parseInt(e.target.value))}
    style={{ width: '200px', accentColor: '#4a90d9' }}
/>
<span>{topN}</span>
```

**useEffect — re-fetch przy zmianie:**
```jsx
useEffect(() => {
    if (userId) fetchAll(userId, topN)
}, [topN])
```

**Przekazanie do API:**
```jsx
axios.get(`${API}/recommend/${id}?top_n=${n}`)
```

Backend obsługuje parametr `top_n` w endpointach `/recommend` i `/recommend-logistic`.

### i18n
```js
top_n: {
    label: 'Liczba rekomendacji',      // PL
    label: 'Number of recommendations' // EN
}
```

---

## Historia wyszukiwań

### Opis
Pasek z ostatnio przeglądanymi userId (max 8), zapisany w `sessionStorage`.
Resetuje się po zamknięciu przeglądarki (w odróżnieniu od `localStorage`).

### Implementacja

**Inicjalizacja stanu z sessionStorage:**
```jsx
const [searchHistory, setSearchHistory] = useState(() => {
    try {
        return JSON.parse(sessionStorage.getItem('searchHistory') || '[]')
    } catch { return [] }
})
```

**Dodawanie do historii:**
```jsx
function addToHistory(id) {
    setSearchHistory(prev => {
        const filtered = prev.filter(x => x !== id)  // usuń duplikat
        const next = [id, ...filtered].slice(0, 8)    // max 8, najnowszy pierwszy
        sessionStorage.setItem('searchHistory', JSON.stringify(next))
        return next
    })
}
```

Wywołanie: `addToHistory(id)` w funkcji `fetchAll`, zaraz po `setUserId(id)`.

**Renderowanie:**
```jsx
{searchHistory.length > 0 && (
    <div>
        <span>{t('history.title')}:</span>
        {searchHistory.map(id => (
            <button key={id} onClick={() => fetchAll(id)}>#{id}</button>
        ))}
        <button onClick={() => {
            setSearchHistory([])
            sessionStorage.removeItem('searchHistory')
        }}>✕ {t('history.clear')}</button>
    </div>
)}
```

### i18n
```js
history: { title: 'Ostatnio przeglądane', clear: 'Wyczyść' }
```

---

## Eksport rekomendacji do CSV

### Opis
Przyciski "⬇️ Eksportuj CSV" przy nagłówkach paneli rekomendacji.
Pobierają plik CSV z wynikami aktualnie wyświetlanych rekomendacji (z uwzględnieniem filtru gatunków).

### Implementacja

```jsx
function exportCSV(recs, type) {
    const header = type === 'linear'
        ? 'rank,title,genres,predicted_rating'
        : 'rank,title,genres,like_probability'

    const rows = recs.map((r, i) => {
        const score = type === 'linear'
            ? r.predicted_rating.toFixed(2)
            : (r.like_probability * 100).toFixed(1) + '%'
        return `${i + 1},"${r.title}","${r.genres}",${score}`
    })

    const csv  = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `recommendations_${type}_user${userId}.csv`
    a.click()
    URL.revokeObjectURL(url)
}
```

Wywołanie: `onClick={() => exportCSV(filterByGenre(recsLinear), 'linear')}`.

Nazwa pliku: `recommendations_linear_user42.csv` lub `recommendations_logistic_user42.csv`.

### i18n
```js
export_csv: 'Eksportuj CSV'  // PL
export_csv: 'Export CSV'     // EN
```

---

## Wyjaśnienie rekomendacji — przycisk "Dlaczego?"

### Opis
Przycisk przy każdej karcie rekomendacji filmowej. Po kliknięciu pobiera top 3 cechy
które najbardziej wpłynęły na rekomendację i wyświetla je inline pod kartą.

### Backend — endpoint `/explain/{userId}/{movieId}`

```python
def get_recommendation_explanation(userId, movieId, ratings, movies, users, movie_stats=None):
    # buduje wektor cech dla pary (user, movie)
    # oblicza wkład każdej cechy: wkład_i = x_i_scaled * β_i
    # sortuje malejąco po |wkład_i|, pomija cechy occ_*
    # zwraca top 3 z direction (+/-)
```

Przykładowy wynik:
```json
{
  "movieId": 1,
  "title": "Toy Story (1995)",
  "top_features": [
    { "feature": "Popularność filmu", "contribution": 0.492, "direction": "+" },
    { "feature": "Średnia ocen użytkownika", "contribution": 0.471, "direction": "+" },
    { "feature": "Wiek użytkownika", "contribution": 0.086, "direction": "+" }
  ]
}
```

### Frontend — `RecommendationCard.jsx`

Przycisk jest widoczny tylko gdy prop `userId` jest przekazany:

```jsx
{userId && (
    <button onClick={fetchWhy}>
        {whyLoading ? t('why_loading') : t('why_button')}
    </button>
)}
```

Stan lokalny komponentu:
```jsx
const [showWhy, setShowWhy]         = useState(false)
const [explanation, setExplanation] = useState(null)
const [whyLoading, setWhyLoading]   = useState(false)
```

Wyjaśnienie cache'owane lokalnie — drugie kliknięcie tylko toggle'uje widoczność,
bez ponownego zapytania do API.

### i18n
```js
why_button:   'Dlaczego?'          // PL
why_title:    'Dlaczego ten film?' // PL
why_positive: 'zwiększa szansę'    // PL
why_negative: 'zmniejsza szansę'   // PL
```

---

## Strona "O projekcie"

### Opis
Czwarta zakładka w aplikacji filmowej (`activeTab === 'about'`).
Prezentuje informacje o pracy magisterskiej, zastosowanych modelach, metrykach, datasetach
i stacku technologicznym.

### Komponent `AboutPage.jsx`

Sekcje:
1. **Hero** — tytuł pracy, uczelnia
2. **Metodologia** — opis podejścia
3. **Modele** — karty dla Linear Regression, Logistic Regression, Ridge, Lasso
   z metrykami (RMSE, MAE, R² lub próg decyzyjny) dla filmów i książek
4. **Metryki** — opis RMSE, MAE, R² w formie kart
5. **Datasety** — MovieLens 1M i Book-Crossing z kluczowymi statystykami
6. **Stack technologiczny** — pogrupowane tagi (Backend, Frontend, Infrastructure, ML/Data)

Komponent pomocniczy `MetricBadge` — mała karta z etykietą i wartością.

Dane są hardcoded w komponencie (wyniki modeli z notebooków) — nie pobierane z API.

### Integracja z App.jsx

```jsx
// nowa zakładka
<button style={tabStyle('about')} onClick={() => setActiveTab('about')}>
    ℹ️ {t('nav.tab_about')}
</button>

// render
{activeTab === 'about' && <AboutPage />}
```

### i18n — sekcja `about`

Klucze: `about.title`, `about.subtitle`, `about.university`, `about.methodology_title`,
`about.methodology_desc`, `about.models_title`, `about.metrics_title`, `about.rmse_desc`,
`about.mae_desc`, `about.r2_desc`, `about.datasets_title`, `about.tech_title`,
`about.linear_desc`, `about.logistic_desc`, `about.movies_dataset_desc`, `about.books_dataset_desc`.
