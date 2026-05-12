# Dokumentacja — DeepAnalysisFlow.jsx
## Zakładka "Pogłębiona analiza" — wielokryterialna ocena filmów

---

## Cel i znaczenie tej zakładki

Zakładka "Pogłębiona analiza" rozwiązuje fundamentalne ograniczenie
standardowego systemu rekomendacji: **pojedyncza ocena 1–5 nie oddaje
złożoności preferencji filmowych**.

Użytkownik który dał filmowi 4/5 mógł to zrobić z różnych powodów:
- Genialny scenariusz przy przeciętnej muzyce
- Słaba fabuła ale rewelacyjne efekty wizualne
- Świetne aktorstwo które ratuje banalną historię

Każdy z tych użytkowników ma inne preferencje — ale model widzi tylko "4".

### Rozwiązanie

Użytkownik definiuje **wagi kryteriów** (co jest dla niego ważne w filmie)
i ocenia filmy **per kryterium** (fabuła, aktorstwo, efekty, muzyka, emocje,
oryginalność). System oblicza ważoną średnią i podaje ją do modelu.

Model nadal dostaje jedną liczbę 1–5 — ale jest to liczba bardziej
reprezentatywna dla prawdziwych preferencji użytkownika.

### Znaczenie dla pracy magisterskiej

To rozszerzenie pokazuje świadomość ograniczeń regresji liniowej
i proponuje praktyczne rozwiązanie po stronie danych wejściowych.
Warto opisać w Rozdziale III jako "kierunek rozwoju systemu" lub
"rozszerzenie o personalizację wag kryteriów".

---

## Czterokrokowy flow

```
Krok 1: Profil demograficzny
     ↓
Krok 2: Wagi kryteriów (suwaki)
     ↓
Krok 3: Ocenianie filmów per kryterium
     ↓
Krok 4: Wyniki z filtrem gatunków
```

### Wskaźnik kroków (step indicator)

```jsx
const [step, setStep] = useState(1)
```

Stan `step` (1–4) kontroluje który ekran jest widoczny. Pasek kroków
na górze wizualizuje postęp — aktywny krok ma niebieski kolor, poprzednie
też są niebieskie (ukończone), przyszłe szare.

```jsx
function stepIndicator(n, label) {
  return (
    <div style={{
      background: step >= n ? '#4a90d9' : '#e0e0e0',
      color:      step >= n ? 'white'   : '#aaa'
    }}>
      {n}
    </div>
  )
}
```

`step >= n` — krok jest "aktywny lub ukończony" gdy jego numer jest
mniejszy lub równy aktualnemu krokowi.

---

## Krok 2 — Wagi kryteriów

### Sześć kryteriów oceny

| Kryterium | Klucz | Co mierzy |
|-----------|-------|-----------|
| Fabuła | `plot` | Historia, scenariusz, zwroty akcji |
| Aktorstwo | `acting` | Gra aktorów, obsada, chemia na ekranie |
| Efekty wizualne | `visuals` | CGI, zdjęcia, scenografia, kostiumy |
| Muzyka | `music` | Ścieżka dźwiękowa, muzyka, dźwięk |
| Emocje | `emotions` | Wzruszenie, napięcie, humor, strach |
| Oryginalność | `originality` | Świeże pomysły, unikatowy styl, klimat |

### Komponent WeightSlider

```jsx
function WeightSlider({ criterion, value, onChange }) {
  return (
    <input type="range" min="0" max="100" step="5" value={value}
           onChange={e => onChange(parseInt(e.target.value))} />
  )
}
```

`type="range"` to natywny HTML slider — bez zewnętrznych bibliotek.
`step="5"` — skoki co 5% dla precyzji bez zbędnej granularności.
`accentColor: '#4a90d9'` — kolor uchwytu suwaka zgodny z paletą UI.

### Podgląd znormalizowanych wag

```jsx
const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
const pct = totalWeight > 0
  ? Math.round(weights[c.key] / totalWeight * 100) : 0
```

Użytkownik ustawia wagi w skali 0–100 (np. fabuła=80, muzyka=20).
Podgląd pokazuje **znormalizowane procenty** — ile każde kryterium
waży względem sumy wszystkich wag.

Przykład: fabuła=80, aktorstwo=60, reszta=30 → suma=260
- fabuła: 80/260 = 31%
- aktorstwo: 60/260 = 23%
- itd.

To eliminuje problem "wszystko na 100%" — jeśli użytkownik ustawi
wszystkie suwaki na maksimum, każde kryterium waży tyle samo (17%).

---

## Krok 3 — Ocenianie filmów per kryterium

### Komponent MovieRatingDeep

```jsx
function MovieRatingDeep({ movie, criteriaRatings, onRate }) {
```

Każdy film ma siatkę 6 zestawów przycisków (0–5 dla każdego kryterium).
Przycisk "0" (z etykietą "–") oznacza "pomiń to kryterium" — użytkownik
nie musi oceniać wszystkiego.

### Przechowywanie ocen

```jsx
const [movieRatings, setMovieRatings] = useState({})

function setMovieRating(movieId, criterion, value) {
  setMovieRatings(prev => ({
    ...prev,
    [movieId]: { ...(prev[movieId] || {}), [criterion]: value }
  }))
}
```

Zagnieżdżona struktura: `{ movieId: { criterion: value } }`.
Spread operator (`...prev`) zachowuje istniejące oceny przy dodawaniu nowych.

### Wizualizacja ocenionych filmów

```jsx
const hasAny = Object.values(criteriaRatings).some(v => v > 0)
```

Karta filmu zmienia tło na niebieskie gdy ma co najmniej jedną ocenę > 0.
`Object.values().some()` sprawdza czy którakolwiek wartość jest większa od zera.

### Obliczanie ważonej oceny

```jsx
function computeWeightedRating(criteriaRatings) {
  let weightedSum = 0
  let weightSum   = 0
  for (const c of CRITERIA) {
    const rating = criteriaRatings[c.key] || 0
    const weight = weights[c.key] || 0
    if (rating > 0) {          // pomiń kryteria z oceną 0
      weightedSum += rating * weight
      weightSum   += weight
    }
  }
  if (weightSum === 0) return null
  return (weightedSum / weightSum)
}
```

**Wzór:** `ocena_ważona = Σ(ocena_i × waga_i) / Σwaga_i`

Kluczowy szczegół: uwzględniamy tylko kryteria z oceną > 0.
Jeśli użytkownik nie ocenił muzyki, waga muzyki nie wchodzi do mianownika.
To zapobiega "karaniu" filmów za nieocenienie wszystkich kryteriów.

**Przykład:**
- Fabuła: 5/5, waga 80
- Aktorstwo: 3/5, waga 60
- Muzyka: pominięta (0), waga 30

Wynik: (5×80 + 3×60) / (80+60) = (400+180) / 140 = **4.14/5**

### Podgląd przeliczonych ocen

W kroku 3 wyświetlamy podgląd jak oceny będą wyglądać po uwzględnieniu wag:

```jsx
{(weighted * 2).toFixed(1)}/10
```

Mnożymy przez 2 żeby pokazać skalę 0–10 (bardziej intuicyjna dla użytkownika).
`.toFixed(1)` — jedno miejsce po przecinku (np. "8.3/10").

---

## Krok 4 — Wyniki

### Co trafia do modelu

```jsx
async function handleSubmit() {
  const ratingsPayload = []
  for (const [movieIdStr, criteriaRatings] of Object.entries(movieRatings)) {
    const weighted = computeWeightedRating(criteriaRatings)
    if (weighted !== null) {
      ratingsPayload.push({
        movieId: parseInt(movieIdStr),
        rating:  parseFloat(weighted.toFixed(2))
      })
    }
  }
```

Model dostaje dokładnie te same dane co w zakładce "Moje rekomendacje" —
listę par `{movieId, rating}`. Różnica jest tylko w tym jak `rating`
został obliczony: tu jest ważoną średnią kryteriów.

### Transparentność — podsumowanie wag i ocen

Krok 4 pokazuje użytkownikowi:
1. **Zastosowane wagi** — jak były ustawione suwaki (w procentach)
2. **Przeliczone oceny** — jakie wartości trafiły do modelu

To jest kluczowe dla **interpretowalności** — użytkownik rozumie
dlaczego dostał takie a nie inne rekomendacje.

### Filtr gatunków w wynikach

```jsx
const [excludedGenres, setExcludedGenres] = useState([])

function filterByGenre(recs) {
  if (excludedGenres.length === 0) return recs
  return recs.filter(rec =>
    !excludedGenres.some(g => rec.genres.includes(g))
  )
}
```

Niezależny filtr gatunków — nie wpływa na inne zakładki.
Trzy niezależne filtry w całej aplikacji:
- Zakładka 1: `excludedGenres` (rekomendacje)
- Zakładka 1: `excludedProfileGenres` (profil filmowy)
- Zakładka 3: lokalny `excludedGenres` w `DeepAnalysisFlow`

---

## Połączenie z modelem — jak wagi wpływają na rekomendacje

### Przepływ danych

```
Użytkownik ustawia wagi:
  fabuła=80, aktorstwo=60, muzyka=20, ...
        ↓
Użytkownik ocenia filmy per kryterium:
  Matrix: fabuła=4, efekty=5, muzyka=3, ...
        ↓
computeWeightedRating():
  (4×80 + 5×30 + 3×20) / (80+30+20) = 4.08
        ↓
POST /recommend-new-user
  { ratings: [{movieId: 2571, rating: 4.08}, ...] }
        ↓
Backend: build_feature_vector() dla każdego nieocenionego filmu
        ↓
lr.predict() + log_reg.predict_proba()
        ↓
Top 10 rekomendacji dla każdego modelu
```

### Dlaczego to jest naukowo uczciwe

Model regresji liniowej nie jest modyfikowany — nadal przewiduje ocenę
na podstawie tych samych ~47 cech. Jedyna zmiana to jakość danych wejściowych:
zamiast subiektywnej oceny ogólnej, model dostaje ocenę która lepiej
odzwierciedla prawdziwe preferencje użytkownika.

Jest to analogiczne do poprawy jakości danych treningowych — lepsze
dane wejściowe = lepsze przewidywania. To "preprocessing po stronie użytkownika".

---

## Znaczenie dla porównania modeli

Zakładka 3 pokazuje jeden z kluczowych wniosków pracy:

**Regresja liniowa z lepszymi danymi wejściowymi może być bardziej
efektywna niż regresja logistyczna ze standardowymi danymi.**

To subtelny ale ważny punkt: problem nie zawsze leży w algorytmie,
ale w jakości danych. Wielokryterialna ocena jest sposobem na poprawę
jakości danych bez zmiany modelu.

---

*Dokumentacja wygenerowana dla komponentu DeepAnalysisFlow.jsx*
*Projekt: Wykorzystanie regresji liniowej w procesie predykcyjnym doboru treści audiowizualnych*
