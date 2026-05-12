# Dokumentacja — Frontend React
## Pliki: frontend/src/App.jsx + komponenty

---

## Architektura frontendu — przegląd

Frontend to aplikacja jednostronicowa (SPA — Single Page Application) napisana
w **React** z użyciem **Vite** jako narzędzia do budowania.

```
App.jsx                    ← główny komponent, zarządza stanem i API
├── SearchBar.jsx          ← pole wyszukiwania userId
├── UserProfile.jsx        ← karta z danymi demograficznymi użytkownika
├── RecommendationCard.jsx ← pojedyncza karta rekomendacji (używana w obu panelach)
└── ValidationChart.jsx    ← sekcja walidacji z metrykami i tabelą próbki
```

### Dlaczego React a nie czysty HTML/JS?

React pozwala budować UI z **komponentów** — niezależnych, wielokrotnego użytku
bloków kodu. Zamiast pisać jeden duży plik HTML z logiką, każdy element interfejsu
ma swój własny plik. Korzyści:
- Zmiana jednego komponentu nie psuje pozostałych
- Ten sam komponent `RecommendationCard` obsługuje oba panele (liniowy i logistyczny)
  dzięki parametrowi `type`
- Stan aplikacji jest zarządzany centralnie w `App.jsx`

### Dlaczego Vite a nie Create React App?

Vite jest nowocześniejszym i znacznie szybszym narzędziem do budowania aplikacji React.
Oferuje błyskawiczny **Hot Module Replacement** (HMR) — zmiany w kodzie są widoczne
w przeglądarce natychmiast, bez przeładowania strony.

---

## App.jsx — główny komponent

### Stan aplikacji (useState)

```javascript
const [userId, setUserId]             = useState(null)
const [userProfile, setUserProfile]   = useState(null)
const [recsLinear, setRecsLinear]     = useState([])
const [recsLogistic, setRecsLogistic] = useState([])
const [validation, setValidation]     = useState(null)
const [loading, setLoading]           = useState(false)
const [error, setError]               = useState(null)
```

**useState** to mechanizm React do przechowywania danych które mogą się zmieniać.
Każde wywołanie `setState` powoduje ponowne wyrenderowanie komponentu z nowymi danymi.

| Zmienna stanu | Typ | Co przechowuje |
|---------------|-----|----------------|
| `userId` | number/null | ID aktualnie wybranego użytkownika |
| `userProfile` | object/null | Dane demograficzne z `/user/{userId}` |
| `recsLinear` | array | Lista rekomendacji z regresji liniowej |
| `recsLogistic` | array | Lista rekomendacji z regresji logistycznej |
| `validation` | object/null | Dane walidacji: RMSE, MAE, próbka ocen |
| `loading` | boolean | Czy trwa ładowanie (pokazuje spinner) |
| `error` | string/null | Komunikat błędu (np. nieistniejący userId) |

### Funkcja fetchAll() — równoległe zapytania do API

```javascript
const [profile, linear, logistic, valid] = await Promise.all([
  axios.get(`${API}/user/${id}`),
  axios.get(`${API}/recommend/${id}`),
  axios.get(`${API}/recommend-logistic/${id}`),
  axios.get(`${API}/validate/${id}`)
])
```

**Promise.all()** wysyła cztery zapytania HTTP **jednocześnie** zamiast kolejno.

Gdybyśmy wysyłali zapytania sekwencyjnie i każde zajmuje 2 sekundy,
czekalibyśmy łącznie 8 sekund. Promise.all sprawia że wszystkie cztery
zapytania są w locie jednocześnie — czekamy tylko tyle ile zajmuje najwolniejsze (2 sekundy).

**axios** to biblioteka HTTP dla JavaScript — upraszcza wysyłanie zapytań
i automatycznie parsuje odpowiedzi JSON.

**async/await** to nowoczesna składnia JavaScript do obsługi operacji asynchronicznych
(takich jak zapytania HTTP). Zamiast zagnieżdżonych callbacków kod wygląda
jak synchroniczny — czytelniej i łatwiej w utrzymaniu.

### Obsługa błędów

```javascript
} catch (err) {
  setError(err.response?.data?.detail || 'Błąd połączenia z API')
}
```

`err.response?.data?.detail` to **optional chaining** (`?.`) — bezpieczny dostęp
do zagnieżdżonych właściwości. Jeśli `err.response` nie istnieje (np. brak połączenia),
zamiast rzucić błędem zwróci `undefined`, a operator `||` użyje fallbacku.

`detail` to pole które FastAPI zwraca w błędach HTTP (np. "Użytkownik 9999 nie istnieje").

### Warunkowe renderowanie

```javascript
{loading && <div>⏳ Generowanie rekomendacji...</div>}
{!loading && userProfile && <> ... </>}
```

React renderuje komponenty warunkowo używając operatora `&&` —
element wyświetla się tylko gdy warunek jest `true`. To standardowy
pattern zastępujący if/else w JSX.

### Layout dwukolumnowy

```javascript
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
```

CSS Grid z dwoma równymi kolumnami (`1fr 1fr`) — panel regresji liniowej
po lewej, logistycznej po prawej. Pozwala na bezpośrednie wizualne porównanie
wyników obu modeli przez użytkownika.

---

## SearchBar.jsx — pole wyszukiwania

### Walidacja po stronie frontendu

```javascript
const id = parseInt(input)
if (isNaN(id) || id < 1 || id > 6040) {
  setError('Podaj liczbę z zakresu 1–6040')
  return
}
```

Walidacja przed wysłaniem zapytania do API. MovieLens 1M zawiera użytkowników
o ID 1–6040 — każda inna wartość spowodowałaby błąd 404 z backendu.
Walidacja po stronie frontendu daje szybszy feedback użytkownikowi
bez angażowania serwera.

`parseInt()` konwertuje tekst z inputa na liczbę całkowitą.
`isNaN()` sprawdza czy wynik jest "Not a Number" (np. gdy użytkownik wpisał tekst).

### Obsługa klawisza Enter

```javascript
function handleKey(e) {
  if (e.key === 'Enter') handleSearch()
}
```

Standardowe UX — użytkownik może nacisnąć Enter zamiast klikać przycisk.

---

## UserProfile.jsx — karta użytkownika

### Dekodowanie wartości numerycznych

```javascript
const OCCUPATION_LABELS = {
  0: 'other', 1: 'academic/educator', 12: 'programmer', ...
}
const AGE_LABELS = {
  1: 'poniżej 18', 18: '18–24', 25: '25–34', ...
}
```

MovieLens przechowuje zawód i wiek jako liczby (0–20 i {1,18,25,...}).
Frontend dekoduje je na czytelne etykiety dla użytkownika.
Te same kody są opisane w dokumentacji `docs/01_eda.md`.

### Dane wyświetlane

Komponent pokazuje:
- ID użytkownika (z `#` prefix dla czytelności)
- Płeć (z emoji 👨/👩)
- Przedział wiekowy (zdekodowany z liczby)
- Zawód (zdekodowany z liczby 0–20)
- Liczbę wystawionych ocen (`ratingsCount`)
- Średnią ocen użytkownika (`avgRating`) — odzwierciedla **user bias** opisany w modelu

---

## RecommendationCard.jsx — karta rekomendacji

### Jeden komponent, dwa tryby

```javascript
export default function RecommendationCard({ rank, rec, type }) {
  const isLinear    = type === 'linear'
  const accentColor = isLinear ? '#4a90d9' : '#e87040'
```

Ten sam komponent obsługuje oba panele dzięki parametrowi `type`.
`type='linear'` → niebieski motyw, ocena 1–5.
`type='logistic'` → pomarańczowy motyw, prawdopodobieństwo %.

To przykład zasady **DRY** (Don't Repeat Yourself) — zamiast dwóch osobnych
komponentów jeden parametr zmienia zachowanie.

### Wyświetlanie wyniku modelu

```javascript
const score = isLinear
  ? `⭐ ${rec.predicted_rating.toFixed(2)} / 5.00`
  : `🎯 ${(rec.like_probability * 100).toFixed(1)}% szans na polubienie`
```

**Regresja liniowa** zwraca `predicted_rating` — liczbę zmiennoprzecinkową
z zakresu 1–5 (po clip w backendzie). `.toFixed(2)` formatuje do 2 miejsc
po przecinku.

**Regresja logistyczna** zwraca `like_probability` — prawdopodobieństwo
z zakresu 0–1. Mnożymy przez 100 i formatujemy jako procent.

### Pasek wizualizacji wyniku

```javascript
const barWidth = isLinear
  ? (rec.predicted_rating / 5) * 100
  : rec.like_probability * 100
```

Pasek postępu pokazuje wynik wizualnie. Dla regresji liniowej normalizujemy
ocenę do zakresu 0–100% dzieląc przez 5 (maksymalną ocenę).
Dla regresji logistycznej prawdopodobieństwo jest już w zakresie 0–1.

### Wyświetlanie gatunków

```javascript
{rec.genres.replace(/\|/g, ' · ')}
```

Backend zwraca gatunki w formacie MovieLens: `"Action|Sci-Fi|Thriller"`.
`replace(/\|/g, ' · ')` zamienia separatory `|` na czytelne ` · ` (regex `g` = global,
wszystkie wystąpienia, nie tylko pierwsze).

---

## ValidationChart.jsx — sekcja walidacji

### Cel sekcji walidacji

Sekcja walidacji to **naukowy element UI** — pokazuje jak dobry jest model
dla konkretnego użytkownika. Nie jest to typowa funkcja systemu rekomendacji
(użytkownik końcowy jej nie potrzebuje), ale jest kluczowa dla pracy magisterskiej
— demonstruje jakość modelu w czasie rzeczywistym.

### Metryki RMSE i MAE

```javascript
const { rmse, mae, count, samples } = validation
```

Dane pochodzą z endpointu `/validate/{userId}` który wywołuje `get_validation()`
w backendzie — porównuje przewidywania modelu z rzeczywistymi ocenami użytkownika.

Trzy karty metryk:
- **RMSE** — typowa wielkość błędu z większą karą za duże odchylenia
- **MAE** — średni błąd bezwzględny, łatwiejszy do intuicyjnej interpretacji
- **Liczba ocen** — kontekst: ile danych miał model do nauki dla tego użytkownika

### Tabela próbki 20 przewidywań

```javascript
const diff = (s.predicted - s.actual).toFixed(2)
const absDiff = Math.abs(diff)
const diffColor = absDiff < 0.5 ? '#2a9d2a' : absDiff < 1.0 ? '#e08800' : '#c00'
```

Kolumna "Różnica" jest kolorowana według dokładności:
- 🟢 Zielony: błąd < 0.5 punktu — bardzo dobra predykcja
- 🟡 Żółty: błąd 0.5–1.0 punktu — akceptowalna predykcja
- 🔴 Czerwony: błąd > 1.0 punktu — słaba predykcja

To wizualna reprezentacja rozkładu błędów opisanego w analizie reszt
w notebooku `03_model.ipynb`.

---

## Interpretacja wyników w UI — obserwacje naukowe

### Zjawisko "5.00 / 5.00" w regresji liniowej

Gdy regresja liniowa zwraca 5.00 dla wszystkich top 10 rekomendacji,
oznacza to że model jest bardzo pewny preferencji użytkownika.
Dzieje się tak dla użytkowników z wysoką `user_avg_rating` (np. 4.19)
i wyrazistymi preferencjami gatunkowymi.

Jest to **ograniczenie regresji liniowej** — model nie rozróżnia między
filmem "świetnym" (5.00) a "bardzo dobrym" (4.80) gdy oba trafiają powyżej
progu przycinania `np.clip(..., 1.0, 5.0)`. Warto opisać w Rozdziale III.

### Zjawisko ~98% w regresji logistycznej

Analogicznie — dla użytkownika z wysoką średnią ocen model logistyczny
jest bardzo pewny że użytkownik polubi kolejne filmy. Wynika to z tego że
`user_avg_rating` jest silnym predyktorem i dla tego użytkownika wskazuje
jednoznacznie na tendencję do wysokich ocen.

### RMSE i MAE w walidacji

Wartości RMSE ~0.79 i MAE ~0.64 oznaczają że model myli się przeciętnie
o 0.64 punktu na skali 1–5. Jest to wynik **lepszy niż baseline** (~1.12 RMSE)
co potwierdza że model nauczył się realnych zależności w danych.

---

## Połączenie frontend ↔ backend ↔ model

```
Użytkownik wpisuje "1" w SearchBar
        ↓
App.jsx: fetchAll(1) → Promise.all([4 zapytania HTTP])
        ↓
Backend FastAPI odbiera zapytania
        ↓
predict.py: build_feature_vector() dla każdego filmu
        ↓
scaler.transform() → lr.predict() / log_reg.predict_proba()
        ↓
JSON z rekomendacjami wraca do frontendu
        ↓
setRecsLinear([...]) → React re-renderuje komponenty
        ↓
RecommendationCard wyświetla wyniki obu modeli obok siebie
```

---

*Dokumentacja wygenerowana dla frontendu React*
*Projekt: Wykorzystanie regresji liniowej w procesie predykcyjnym doboru treści audiowizualnych*
