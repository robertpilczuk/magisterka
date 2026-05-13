# 13. Landing Page — wybór typu treści

## Co zostało zbudowane

Strona główna aplikacji z sekcją hero i trzema kafelkami wyboru typu treści
(Filmy, Seriale, Książki). Użytkownik trafia na landing page przy pierwszym
uruchomieniu i wybiera co chce poddać predykcji zanim przejdzie do właściwej
aplikacji.

---

## Struktura wizualna

```
┌─────────────────────────────────────────┐
│  🎓                                      │
│  System predykcji treści                 │  ← hero title
│  Praca magisterska — ...                 │  ← subtitle
│  Opis projektu...                        │  ← hero desc
│                                          │
│  Co chcesz dziś odkryć?                  │
│                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ 🎬       │ │ 📺       │ │ 📚       │ │
│  │ Filmy    │ │ Seriale  │ │ Książki  │ │
│  │ Dostępne │ │ Wkrótce  │ │ Wkrótce  │ │
│  └──────────┘ └──────────┘ └──────────┘ │
│                                          │
│  ℹ️ O projekcie                          │
│  Stack: Python, React, FastAPI...        │
│  Dataset: MovieLens 1M, Book-Crossing    │
└─────────────────────────────────────────┘
```

---

## Pliki

### `frontend/src/components/LandingPage.jsx`

Główny komponent landing page. Składa się z trzech części:

**1. Sekcja hero** — tytuł, podtytuł z tematem pracy magisterskiej, krótki opis.

**2. Kafelki wyboru** (`ContentCard`) — trzy karty dla filmów, seriali i książek.
Każda karta zawiera:
- emoji reprezentujące typ treści
- nazwę w aktywnym języku
- krótki opis datasetu
- badge "Dostępne" (zielony) lub "Wkrótce" (pomarańczowy)

Karta nieaktywna (`available: false`) ma zmniejszoną przezroczystość i kursor
`not-allowed` — kliknięcie nic nie robi.

**3. Sekcja "O projekcie"** — opis pracy magisterskiej, stack technologiczny
i datasety jako kolorowe tagi.

### Konfiguracja typów treści

```jsx
const CONTENT_TYPES = [
    { key: 'movies',  emoji: '🎬', available: true,  color: '#4a90d9' },
    { key: 'series',  emoji: '📺', available: false, color: '#e87040' },
    { key: 'books',   emoji: '📚', available: false, color: '#2ecc71' },
]
```

Żeby aktywować nowy typ treści po dodaniu datasetu wystarczy zmienić
`available: false` na `available: true`.

---

## Integracja z App.jsx

### Stan `contentType`

```jsx
const [contentType, setContentType] = useState(null)
```

- `null` — pokazuje landing page
- `'movies'` — pokazuje aplikację filmową
- `'series'` — (przyszłość) aplikacja seriali
- `'books'` — (przyszłość) aplikacja książkowa

### Early return

```jsx
if (!contentType) {
    return <LandingPage onSelect={setContentType} />
}
```

Jeśli użytkownik nie wybrał jeszcze typu treści, renderowany jest tylko
landing page — cała reszta App.jsx nie jest montowana.

### Przycisk powrotu

Stały przycisk w lewym górnym rogu (pozycja `fixed`) który ustawia
`contentType` z powrotem na `null` i wraca do landing page.

---

## Internacjonalizacja

Dodano sekcję `landing` do `i18n.js` w obu językach (PL/EN):

| Klucz | PL | EN |
|-------|----|----|
| `hero_title` | System predykcji treści | Content Prediction System |
| `hero_subtitle` | Praca magisterska — ... | Master's Thesis — ... |
| `choose` | Co chcesz dziś odkryć? | What do you want to discover today? |
| `movies` | Filmy | Movies |
| `series` | Seriale | TV Series |
| `books` | Książki | Books |
| `coming_soon` | Wkrótce | Coming soon |
| `available` | Dostępne | Available |
| `about_title` | O projekcie | About the project |
| `back` | ← Wróć do wyboru | ← Back to selection |

---

## Dalszy rozwój

Po znalezieniu datasetów dla seriali i książek:

1. Wytrenować model tym samym pipeline co filmy (`02_preprocessing`, `03_model`)
2. Dodać endpointy w `backend/main.py` z prefixem `/series/` lub `/books/`
3. Zmienić `available: false` na `available: true` w `CONTENT_TYPES`
4. W `App.jsx` dodać warunek który ładuje odpowiedni komponent
   w zależności od `contentType`
