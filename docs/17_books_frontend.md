# 17. Frontend — Aplikacja książkowa

## Co zostało zbudowane

Kompletna zakładka książkowa dostępna z landing page po kliknięciu kafelka "Książki".
Trzy nowe komponenty React + rozbudowanie `BooksApp.jsx` o filtr podobnych czytelników
i profil czytelniczy.

---

## Nowe komponenty

### `frontend/src/components/BooksApp.jsx`

Główny komponent aplikacji książkowej. Dwie zakładki:

**Zakładka 1 — Użytkownik z bazy:**
- `SimilarBooksUsersFilter` — filtr podobnych czytelników
- Wyszukiwarka po userId + przycisk "Losuj czytelnika"
- `BookUserProfile` — profil (ID, wiek, liczba ocen, średnia z paskiem)
- `BookTasteProfile` — profil czytelniczy (lubi/neutralne/nie lubi)
- Dwa panele rekomendacji (liniowa vs logistyczna)
- `BookValidation` — walidacja z rozbudowanymi wyjaśnieniami RMSE/MAE

**Zakładka 2 — Moje rekomendacje:**
- Krok 1: wiek użytkownika
- Krok 2: ocenianie 20 popularnych książek w skali 1–10 (siatka kafelków)
- Krok 3: wyniki — liniowa / logistyczna / połączony

**Suwak top_n** — identyczny jak w aplikacji filmowej, kolor akcentu `#2ecc71` (zielony).

**Historia wyszukiwań** — sessionStorage, 8 ostatnich userId.

**Eksport CSV** — pobieranie wyników jako plik .csv.

### `frontend/src/components/SimilarBooksUsersFilter.jsx`

Filtr podobnych czytelników. Uproszczony względem `SimilarUsersFilter` bo Book-Crossing
nie ma płci ani zawodu.

**Parametry filtrowania:**
- Zakres wieku: predefiniowane przedziały (<18, 18–25, 26–35, 36–45, 46–55, 56+)
- Min. liczba ocen: 20, 50, 100, 200, 500+

Kafelki użytkowników pokazują: ID, wiek, liczba ocen, średnia ocena z paskiem.
Kolor paska zależy od średniej: fioletowy (≥8), zielony (≥6), pomarańczowy (≥4), czerwony (<4).

### `frontend/src/components/BookTasteProfile.jsx`

Profil czytelniczy użytkownika. Analogiczny do `UserTasteProfile` ale bez filtrowania
po gatunkach (Book-Crossing nie ma gatunków).

**Trzy kategorie:**
- 👍 Lubi — oceny ≥8/10
- 😐 Neutralne — oceny 5–7/10
- 👎 Nie lubi — oceny ≤4/10

Każda kategoria pokazuje tytuł, autora i ocenę. Paginacja po 8 pozycji.
Pasek proporcji ocen z tooltipem z procentami.

---

## Walidacja modelu — rozbudowane wyjaśnienia

`BookValidation` zawiera trzy karty zamiast prostych liczb:

**Karta RMSE:**
- Duża liczba z kolorem `#2ecc71`
- Podpis: "im niższe tym lepiej · w skali 1–10"
- Pełny opis tekstowy z podstawionym wynikiem: `t('books_app.rmse_explain_full').replace('RMSE', 'RMSE = 1.34')`

**Karta MAE:**
- Analogicznie do RMSE

**Karta Liczba ocen:**
- Prosta liczba z etykietą

Tabela próbki 20 przewidywań z kolumnami: Książka, Autor, Ocena rzeczywista,
Ocena przewidywana, Różnica (zielona <1, pomarańczowa <2, czerwona ≥2).

---

## i18n — nowe klucze

Dodano sekcje `books_app`, `books_similar`, `books_taste` do `i18n.js`.

Kluczowe klucze:
- `books_app.rmse_explain_full` — pełny opis RMSE z przykładem
- `books_app.mae_explain_full` — pełny opis MAE z przykładem
- `books_app.random_user` — przycisk "Losuj czytelnika"
- `books_similar.*` — etykiety filtra podobnych czytelników
- `books_taste.*` — etykiety profilu czytelniczego

---

## Integracja z App.jsx

```jsx
if (contentType === 'books') {
    return (
        <div style={{ maxWidth: '1200px', ... }}>
            {/* przyciski fixed: Wróć do wyboru + zmiana języka */}
            <div style={{ marginTop: '48px' }}>
                <BooksApp />
            </div>
        </div>
    )
}
```

`marginTop: '48px'` zapobiega zachodzeniu treści pod fixed buttons.

---

## Różnice względem aplikacji filmowej

| Aspekt | Filmy | Książki |
|--------|-------|---------|
| Skala ocen | 1–5 | 1–10 |
| Filtr użytkowników | Płeć + wiek + zawód | Wiek + aktywność |
| Profil użytkownika | Typ widza (Krytyk/Entuzjasta) | Prosta średnia z paskiem |
| Profil treści | Gatunki filmowe | Tytuły i autorzy |
| Porównanie użytkowników | Tak | Nie (uproszczenie) |
| Pogłębiona analiza | Tak (wagi kryteriów) | Nie |
| Kolor akcentu | `#4a90d9` (niebieski) | `#2ecc71` (zielony) |
