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


# Dokumentacja — Frontend React (aktualizacja)
## Nowe komponenty i funkcje dodane po etapie 5

---

## Przegląd nowych komponentów

| Komponent | Plik | Cel |
|-----------|------|-----|
| `Spinner` | `Spinner.jsx` | Animowany wskaźnik ładowania |
| `Tooltip` | `Tooltip.jsx` | Podpowiedź przy najechaniu myszką |
| `GenreFilter` | `GenreFilter.jsx` | Filtr gatunków dla rekomendacji |
| `SimilarUsersFilter` | `SimilarUsersFilter.jsx` | Wyszukiwanie podobnych użytkowników |
| `UserComparison` | `UserComparison.jsx` | Porównanie dwóch użytkowników |
| `UserTasteProfile` | `UserTasteProfile.jsx` | Profil filmowy (lubi/neutralne/nie lubi) |
| `NewUserFlow` | `NewUserFlow.jsx` | Zakładka "Moje rekomendacje" — onboarding |
| `utils.js` | `utils.js` | Wspólna funkcja `getRatingStyle()` |

---

## utils.js — wspólna logika

### Problem który rozwiązuje

Funkcja `getRatingStyle()` była zduplikowana w `UserProfile.jsx`
i `SimilarUsersFilter.jsx`. Zmiana w jednym miejscu nie propagowała się
automatycznie do drugiego — co prowadziło do niespójności (błąd który faktycznie wystąpił).

### Zasada DRY

**DRY (Don't Repeat Yourself)** — fundamentalna zasada programowania.
Każda logika powinna istnieć w jednym miejscu. Wyciągnięcie funkcji
do wspólnego pliku eliminuje duplikację.

```js
// utils.js
export function getRatingStyle(avg) {
  const score = Math.round(avg * 2)  // konwersja skali 1-5 na 0-10
  if (score <= 2)  return { text: 'Krytyk',       desc: '...', color: '#c0392b' }
  // ...
}
```

### Konwersja skali 1–5 na 0–10

```js
const score = Math.round(avg * 2)
```

MovieLens używa skali 1–5. Mnożymy przez 2 i zaokrąglamy żeby uzyskać
intuicyjną skalę 0–10. Przykład: średnia 3.8 → score = 8/10.

### Typy widzów i ich znaczenie

| Score | Typ | Opis |
|-------|-----|------|
| 0–2 | Krytyk | Prawie zawsze niezadowolony |
| 3–4 | Sceptyk | Trudno go zachwycić |
| 5 | Wybredny widz | Chwali tylko naprawdę dobre filmy |
| 6 | Typowy widz | Ocenia podobnie jak większość |
| 7 | Życzliwy widz | Łatwo go zadowolić |
| 8 | Optymista | Rzadko rozczarowany |
| 9 | Miłośnik kina | Kocha filmy |
| 10 | Entuzjasta | Zachwycony niemal każdym filmem |

8 kategorii zamiast 3 (wymagający/przeciętny/łagodny) daje bardziej
zniuansowany obraz stylu oceniania użytkownika.

---

## Spinner.jsx — animowany wskaźnik ładowania

### Dlaczego spinner zamiast tekstu "⏳ Ładowanie..."?

Animacja daje użytkownikowi wizualny feedback że coś się dzieje —
statyczny tekst lub emoji jest mniej intuicyjny. Spinner to
**konwencja UX** rozpoznawalna przez wszystkich użytkowników.

### Implementacja CSS animation

```jsx
<span style={{
  border: '3px solid #e0e0e0',
  borderTop: `3px solid ${color}`,
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite'
}}>
  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
</span>
```

Trick z `borderTop` innego koloru niż reszta `border` tworzy efekt
"obracającego się łuku". `@keyframes spin` definiuje animację rotacji
360° w czasie 0.8 sekundy, powtarzaną w nieskończoność (`infinite`).

### Parametry

```jsx
<Spinner size={24} color="#4a90d9" />
```

`size` i `color` jako propsy — komponent jest reużywalny w różnych
kontekstach (mały spinner w przycisku, duży spinner na stronie).

---

## Tooltip.jsx — podpowiedź kontekstowa

### Cel

Pokazuje dodatkowe informacje gdy użytkownik najedzie myszką na element.
Używany dla typów widzów ("Krytyk", "Entuzjasta") i kategorii profilu filmowego.

### Pozycjonowanie względem kursora

```jsx
const [pos, setPos] = useState({ x: 0, y: 0 })

function handleMove(e) {
  setPos({ x: e.clientX + 12, y: e.clientY + 12 })
}
```

`e.clientX/Y` to pozycja kursora w oknie przeglądarki.
`+ 12` przesuwa tooltip 12px w prawo i w dół od kursora — żeby
nie zasłaniał tekstu na który użytkownik patrzy.

### `position: fixed` dla tooltipa

```jsx
<div style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 9999 }}>
```

`fixed` pozycjonuje element względem okna przeglądarki (nie rodzica).
`zIndex: 9999` gwarantuje że tooltip jest zawsze na wierzchu innych elementów.
`pointerEvents: 'none'` sprawia że tooltip nie blokuje kliknięć.

### Sygnalizacja interaktywności

```jsx
<span style={{ borderBottom: `1px dashed ${color}` }}>
  {ratingInfo.text}
</span>
```

Przerywana linia pod tekstem to konwencja UX oznaczająca "najedź myszką
po więcej informacji" — podobna do przypisów w dokumentach.

---

## GenreFilter.jsx — filtr gatunków rekomendacji

### Logika wykluczania vs włączania

```jsx
function toggle(en) {
  if (selected.includes(en)) {
    onChange(selected.filter(g => g !== en))  // usuń z wykluczonych
  } else {
    onChange([...selected, en])               // dodaj do wykluczonych
  }
}
```

Stan `selected` przechowuje listę **wykluczonych** gatunków (nie włączonych).
Pusta lista = pokaż wszystko. To intuicyjne podejście — domyślnie wszystko
jest widoczne, użytkownik decyduje co ukryć.

### Wizualizacja stanu

```jsx
background: excluded ? '#fdf0f0' : '#e8f4fd',
color:      excluded ? '#e74c3c' : '#4a90d9',
textDecoration: excluded ? 'line-through' : 'none'
```

Trzy równoczesne zmiany wizualne dla wykluczonego gatunku:
- Czerwone tło i kolor (ostrzeżenie)
- Przekreślony tekst (usunięty)
- Prefix "✕" (wyraźna akcja)

### Przyciski "Pokaż wszystkie" / "Ukryj wszystkie"

```jsx
function selectAll()  { onChange([]) }           // pusta lista = nic nie wykluczone
function selectNone() { onChange(GENRES.map(g => g.en)) }  // wszystkie wykluczone
```

Szybkie akcje globalne zamiast klikania każdego gatunku osobno.

### Filtrowanie w App.jsx

```jsx
function filterByGenre(recs) {
  if (excludedGenres.length === 0) return recs
  return recs.filter(rec =>
    !excludedGenres.some(g => rec.genres.includes(g))
  )
}
```

`Array.some()` zwraca `true` jeśli którykolwiek wykluczony gatunek
pojawia się w gatunkach filmu. `!` neguje — zachowujemy filmy które
NIE zawierają żadnego wykluczonego gatunku.

---

## Dwa niezależne filtry gatunków

### Problem

Początkowo jeden filtr gatunków wpływał zarówno na rekomendacje jak
i na profil filmowy użytkownika. To było niepożądane — filtr rekomendacji
powinien działać niezależnie od filtrowania w profilu.

### Rozwiązanie — dwa stany

```jsx
const [excludedGenres, setExcludedGenres]               = useState([]) // rekomendacje
const [excludedProfileGenres, setExcludedProfileGenres] = useState([]) // profil filmowy
```

Dwa osobne stany React przechowują dwie niezależne listy wykluczeń.

**`excludedGenres`** — przekazywany do:
- `<GenreFilter>` — widoczny filtr z przyciskami gatunków
- `filterByGenre()` — filtruje karty rekomendacji
- `<ValidationChart>` — wyszarza wiersze w tabeli walidacji

**`excludedProfileGenres`** — przekazywany do:
- `<UserTasteProfile>` — filtruje filmy w sekcjach lubi/neutralne/nie lubi
- Klikalne tagi ulubionych gatunków w profilu

### Wyszarzanie w tabeli walidacji

```jsx
const isExcluded = excludedGenres.length > 0 &&
                   s.genres && excludedGenres.some(g => s.genres.includes(g))

<tr style={{ opacity: isExcluded ? 0.6 : 1 }}>
```

Wiersze z wykluczonymi gatunkami są wyszarzone (opacity 0.6) ale
nie usunięte — tabela walidacji pokazuje dane naukowe które nie powinny
znikać. Wyszarzenie sygnalizuje "te dane są poza Twoim filtrem".

---

## SimilarUsersFilter.jsx — wyszukiwanie podobnych użytkowników

### Cel UX

Użytkownik który nie zna swojego userId może znaleźć kogoś podobnego
demograficznie i zobaczyć jego rekomendacje jako punkt startowy.
To też sposób na eksplorację bazy — "co oglądają programiści w wieku 25-34?"

### Trzy dropdowny

Płeć, wiek i zawód to trzy zmienne demograficzne dostępne w MovieLens 1M.
Wszystkie opcjonalne — można szukać tylko po zawodzie bez podawania płci i wieku.

### Karty użytkowników z informacją o stylu oceniania

```jsx
const label  = getRatingStyle(u.avgRating)
const score10 = Math.round(u.avgRating * 2)
```

Każda karta pokazuje:
- ID użytkownika
- Płeć + przedział wiekowy + zawód
- Liczbę ocen (miara aktywności)
- Styl oceniania: "7/10 — Życzliwy widz" z tooltipem i paskiem

Pasek wizualizuje styl oceniania — szybki rzut oka pokazuje czy
użytkownik jest wymagający czy łagodny bez czytania liczb.

### Hover effect na kartach

```jsx
onMouseEnter={e => {
  e.currentTarget.style.borderColor = '#4a90d9'
  e.currentTarget.style.boxShadow = '0 2px 8px rgba(74,144,217,0.15)'
}}
onMouseLeave={e => {
  e.currentTarget.style.borderColor = '#ddd'
  e.currentTarget.style.boxShadow = 'none'
}}
```

`e.currentTarget` (nie `e.target`) — wskazuje element na którym jest
event handler, nie element który faktycznie otrzymał zdarzenie (może być
dziecko). To ważna różnica przy zagnieżdżonych elementach.

---

## UserComparison.jsx — porównanie użytkowników

### Trzy kolumny

UI dzieli rekomendacje na trzy grupy:
- **Tylko dla użytkownika 1** (niebieski) — unikalne preferencje
- **Wspólne** (zielony) — filmy które obu modele rekomendują obu użytkownikom
- **Tylko dla użytkownika 2** (pomarańczowy) — unikalne preferencje

Środkowa kolumna "Wspólne" jest najważniejsza naukowo — pokazuje filmy
które model jest pewny że spodobają się obu użytkownikom niezależnie
od ich różnic demograficznych.

### Wskaźnik podobieństwa

```jsx
const similarityColor = similarityPct >= 50 ? '#2ecc71'
                      : similarityPct >= 25 ? '#e08800'
                      : '#e87040'
```

Kolor wskaźnika zmienia się zależnie od podobieństwa:
- Zielony (≥50%) — bardzo podobne gusta
- Pomarańczowy (25–50%) — umiarkowane podobieństwo
- Czerwony (<25%) — różne gusta

---

## UserTasteProfile.jsx — profil filmowy

### Paginacja w CategoryBlock

```jsx
const PAGE_SIZE = 8
const visible   = filtered.slice(0, page * PAGE_SIZE)
const hasMore   = page * PAGE_SIZE < filtered.length
```

Początkowo pokazujemy 8 filmów. Przycisk "Pokaż więcej" zwiększa `page`
o 1 — `slice(0, page * PAGE_SIZE)` pokazuje kolejne 8.

Zamiast paginacji "strona 1/3" użyto **infinite scroll-like** przycisku —
bardziej naturalne dla list filmów.

### Licznik "filtered/total"

```jsx
<span style={{ fontSize: '12px', fontWeight: 'normal', color: '#888' }}>
  {filtered.length}/{count} filmów
</span>
```

Pokazuje ile filmów pozostało po filtrowaniu vs ile jest łącznie.
Np. "12/45 filmów" — użytkownik widzi że filtr usunął 33 pozycje.

### Pasek proporcji ocen

```jsx
<div style={{ display: 'flex', height: '12px', borderRadius: '6px' }}>
  <div style={{ width: `${lubiPct}%`,    background: '#2ecc71' }} />
  <div style={{ width: `${sredniePct}%`, background: '#f39c12' }} />
  <div style={{ width: `${slabePct}%`,   background: '#e74c3c' }} />
</div>
```

Trzy divy obok siebie w jednym kontenerze flex tworzą segmentowany pasek.
Szerokości (w procentach) sumują się do 100% bo:
`lubiPct + sredniePct + slabePct = Math.round(lubi/total*100) + ... ≈ 100`

---

## NewUserFlow.jsx — zakładka "Moje rekomendacje"

### Trzyetapowy flow

```
Krok 1: Profil demograficzny (opcjonalny)
     ↓
Krok 2: Oceń filmy (minimum 3)
     ↓
Krok 3: Wyniki — linear / logistic / combined
```

Stan `step` (1/2/3) kontroluje który ekran jest widoczny:

```jsx
const [step, setStep] = useState(1)
```

### Lista sample movies

20 starannie wybranych filmów reprezentujących różne gatunki i epoki.
Kryteria wyboru:
- Rozpoznawalność (większość ludzi je zna lub o nich słyszała)
- Różnorodność gatunkowa (akcja, dramat, sci-fi, komedia, thriller)
- Różnorodność czasowa (filmy z lat 70–2000)
- Obecność w bazie MovieLens 1M (movieId musi istnieć w zbiorze)

### Ocenianie filmami — przyciski 1–5

```jsx
{[1,2,3,4,5].map(star => (
  <button key={star} onClick={() => setRating(movie.movieId, star)}
    style={{
      background: ratings[movie.movieId] >= star ? '#4a90d9' : '#f0f0f0',
    }}>
    {star}
  </button>
))}
```

Przyciski 1–5 zamiast gwiazdek — bardziej precyzyjne i jednoznaczne.
`ratings[movie.movieId] >= star` koloruje wszystkie przyciski ≤ aktualnej oceny
tworząc efekt "wypełnienia" jak w klasycznych systemach gwiazdkowych.

### Trzy panele wyników z przełącznikiem

```jsx
const [activePanel, setActivePanel] = useState('linear')
```

Przełącznik między trzema widokami: linear / logistic / combined.
Zamiast pokazywać wszystkie trzy listy jednocześnie (za dużo informacji)
użytkownik świadomie wybiera który model chce zobaczyć.

Panel "combined" jest opisany jako "50% regresja liniowa + 50% regresja logistyczna"
— transparentność dla użytkownika który nie zna szczegółów implementacji.

### Wyświetlanie optymalnego progu

```jsx
<div>
  <div style={{ fontSize: '12px', color: '#888' }}>Optymalny próg</div>
  <div>🎯 {results.optimal_threshold}</div>
</div>
```

Optymalny próg jest pokazywany w podsumowaniu profilu. Dla laika
można to opisać jako "próg pewności modelu" — film zostanie polecony
tylko gdy model jest przynajmniej X% pewny że się spodoba.

---

## Architektura stanu w App.jsx

Po rozbudowie App.jsx zarządza następującymi stanami:

```jsx
// zakładki
const [activeTab, setActiveTab]               = useState('existing')

// dane użytkownika z bazy
const [userId, setUserId]                     = useState(null)
const [userProfile, setUserProfile]           = useState(null)
const [recsLinear, setRecsLinear]             = useState([])
const [recsLogistic, setRecsLogistic]         = useState([])
const [validation, setValidation]             = useState(null)
const [tasteProfile, setTasteProfile]         = useState(null)
const [loading, setLoading]                   = useState(false)
const [error, setError]                       = useState(null)

// porównanie użytkowników
const [compareUserId, setCompareUserId]       = useState('')
const [comparison, setComparison]             = useState(null)
const [compareLoading, setCompareLoading]     = useState(false)

// dwa niezależne filtry gatunków
const [excludedGenres, setExcludedGenres]               = useState([])
const [excludedProfileGenres, setExcludedProfileGenres] = useState([])
```

**Dlaczego wszystko w App.jsx a nie w osobnych komponentach?**

Stany które są współdzielone między komponentami (np. `excludedGenres`
używany przez `GenreFilter`, `ValidationChart` i panele rekomendacji)
muszą żyć w wspólnym przodku — to **lifting state up**, fundamentalny
pattern React. Lokalne stany (np. `page` w `CategoryBlock`) żyją tam
gdzie są potrzebne.

---

*Dokumentacja zaktualizowana po rozbudowie frontendu*
*Projekt: Wykorzystanie regresji liniowej w procesie predykcyjnym doboru treści audiowizualnych*