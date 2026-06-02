# Raport audytu spójności projektu

**Data:** 2026-06-02
**Zakres:** endpointy, liczby, notebooki↔docs, komponenty frontendu, i18n, martwy kod.
**Źródło prawdy dla liczb:** `CLAUDE.md` + zweryfikowane artefakty (`backend/model*/optimal_threshold*.json`,
`data/books_processed/*.csv`, outputy `notebooks/03_model.ipynb`).
**Status:** ✅ **ZREALIZOWANE** — wszystkie pozycje (krytyczne, warto, opcjonalne) zostały poprawione.
Poniższa tabela to oryginalny raport rozbieżności; sekcja „Status realizacji" niżej opisuje wprowadzone zmiany.

---

## Status realizacji (2026-06-02)

Poprawki wdrożone na gałęziach `fix/audit-consistency` (krytyczne + warto) i `fix/audit-optional`
(opcjonalne), scalonych do `main`. Zasada: tekst dostosowywano do **zweryfikowanych liczb**
(przeliczonych z modeli `.pkl`/danych), nigdy odwrotnie.

| Waga | Pozycji | Status |
|------|---------|--------|
| 🔴 Krytyczne | 4 | ✅ wszystkie poprawione |
| 🟡 Warto | 8 | ✅ wszystkie poprawione |
| ⚪ Opcjonalne | 8 | ✅ 7 poprawionych + #18 udokumentowane (zamiast usuwania `plot_*.png`) |

Kluczowe zmiany: rozmiar Book-Crossing 139 399→**96 059**; metryki i próg modelu książkowego
zaktualizowane do wartości z modeli; opis filtra 5→**20**; metryki logistyczne książek dodane;
i18n w `EvaluationChart`, `AboutPage` i komunikatach błędów; EDA Book-Crossing przeniesione z
`03_model` do `06_books_preprocessing`; liczba cech ujednolicona do **45**; port 3000→**5173**;
przykładowy JSON progu, odwołania do `*_update.md` i nota o `.npy` poprawione; `/evaluate`
przeniesiony do sekcji FILMS; tabele wyników w `03_model.md` i `06_chapter3` uzupełnione
zweryfikowanymi liczbami; rola `plot_*.png` udokumentowana w README i `07_visualizations.md`.

---

## Podsumowanie (oryginalny raport)

| Waga | Liczba problemów |
|------|------------------|
| 🔴 Krytyczne | 4 |
| 🟡 Warto | 8 |
| ⚪ Opcjonalne | 8 |

**Co jest spójne (zweryfikowane, bez uwag):**
- ✅ Endpointy: 19 endpointów (11 filmowych + 8 książkowych) — `main.py` = README = `16_books_backend.md` = `CLAUDE.md`. Każdy endpoint ma wywołanie z frontendu (brak endpointów-sierot).
- ✅ Liczby MovieLens (1 000 209 / 6 040 / 3 883) i metryki filmowe (RMSE 0,9120; MAE 0,7177; R² 0,3520; AUC 0,7968; próg 0,40; F1 0,7585/0,7518) — `notebooks/03_model.ipynb` = `CLAUDE.md` = `model/optimal_threshold.json`.
- ✅ Rozmiar Book-Crossing po filtracji: `data/books_processed/` potwierdza **96 059 / 75 466 / 20 593** (zgodne z CLAUDE.md).
- ✅ Próg książkowy w `model_books/optimal_threshold_books.json` = 0,43316… ≈ 0,4332 (zgodne z CLAUDE.md).
- ✅ Lista 18 komponentów w README (sekcja struktury) jest kompletna i zgodna z `frontend/src/components/`.
- ✅ Każdy komponent jest opisany w jakimś pliku docs (AboutPage→20, EvaluationChart→21, DeepAnalysisFlow→09, LandingPage→13).

---

## Tabela rozbieżności

### 🔴 Krytyczne — błędne liczby sprzeczne ze zweryfikowanym źródłem

| Kategoria | Plik | Problem | Sugerowana poprawka |
|-----------|------|---------|---------------------|
| Liczby | `docs/14_books_preprocessing.md:187-189` | Tabela „Wyniki podziału": **Train 106 302 / Test 33 097 / Łącznie 139 399** — to STARE BŁĘDNE liczby, jawnie zakazane w CLAUDE.md („NIE 139 399"). | Zmienić na **Train 75 466 / Test 20 593 / Łącznie 96 059**. |
| Liczby | `docs/14_books_preprocessing.md:221` | Tabela porównawcza: „Rozmiar po czyszczeniu \| ~1M ocen \| **~139k ocen**". | Zmienić na **~96k ocen**. |
| Liczby | `docs/15_books_model.md:17-20,32,51-53` | Metryki regresji książkowej: Baseline **1.7815/1.4167**, Linear **1.3257/1.0037/0.4461** — różne od CLAUDE.md (Baseline 1,7513/1,3764; Linear 1,3379/1,0132/**0,4164**). Wartości pochodzą ze starego przebiegu modelu. | Zaktualizować do wartości z CLAUDE.md (Baseline RMSE=1,7513 MAE=1,3764; Linear RMSE=1,3379 MAE=1,0132 R²=0,4164). |
| Liczby | `docs/15_books_model.md:25,98,114,129` | Optymalny próg książkowy podany jako **0.4006** — sprzeczny z faktycznym plikiem modelu `model_books/optimal_threshold_books.json` (**0,4332**) i z CLAUDE.md. | Zmienić wszystkie wystąpienia na **0,4332**. |

### 🟡 Warto poprawić

| Kategoria | Plik | Problem | Sugerowana poprawka |
|-----------|------|---------|---------------------|
| Liczby / Notebook | `notebooks/06_books_preprocessing.ipynb` (markdown cell 12) | Opis: „Użytkownicy którzy ocenili **mniej niż 5** książek… Próg 5 to kompromis" — ale kod (cell 13) używa `MIN_USER_RATINGS = 20`. Markdown przeczy kodowi. | Poprawić narrację: użytkownicy < **20** ocen, książki < 5 ocen. |
| Notebooki vs docs | `docs/14_books_preprocessing.md:104,114` | Powtórzenie tego samego błędu: „Użytkownicy z mniej niż **5** ocenami… Próg 5 to kompromis" — powinno być 20 dla użytkowników. | Rozdzielić progi: użytkownicy < **20**, książki < 5. |
| i18n | `frontend/src/components/EvaluationChart.jsx:52-54,59,80,86,184-186` | Komponent w większości używa `t()`, ale ma zaszyte polskie stringi: „= polubił", „Zbiór testowy", „Polubił", „Model polecił", „Dobry/Średni/Słaby wynik", legenda „Trafienie/Fałszywy alarm/Przeoczenie", hint `'6 trafień = model polecił…'`. Łamie zasadę CLAUDE.md (wszystkie stringi przez i18n). | Przenieść do `i18n.js` (sekcja `evaluation.*`). |
| Notebooki vs docs / Sieroty | `book_crossing_eda.png` (root repo) + `notebooks/03_model.ipynb` | Wykres EDA Book-Crossing jest generowany przez **filmowy** notebook `03_model.ipynb` (`savefig('book_crossing_eda.png')`) i zapisywany do **katalogu głównego repo**, nie do `notebooks/`. Plik jest nietrackowany w git. Semantycznie w złym miejscu. | Przenieść kod generujący do dedykowanego notebooka książkowego (np. nowego `08_books_eda` lub `06_books_preprocessing`) i zapisywać do `notebooks/`. |
| Docs vs pliki | `README.md:320-321` | Tabela docs odwołuje się do `04_backend_update.md` i `05_frontend_update.md` — **te pliki nie istnieją** (treść „aktualizacji" jest doklejona do `04_backend.md:367` i `05_frontend.md:337`). | Usunąć „+ `*_update.md`" z opisu, zostawić same `04_backend.md` / `05_frontend.md`. |
| Endpointy / Docs | `docs/04_backend.md:240-242` | Sekcja CORS: „Frontend React działa na `http://localhost:3000`" — faktyczny port to **5173** (Vite, zgodnie z CLAUDE.md i README). | Zmienić na `http://localhost:5173`. |
| Liczby | `docs/04_backend.md:412-416` | Przykładowy JSON threshold tuningu: `0.42 / 0.7823 / 0.7701` — różny od faktycznych wartości filmowych (0,40 / 0,7585 / 0,7518). Prezentowane jako wzór formatu, ale mylące. | Zastąpić faktycznymi wartościami z `model/optimal_threshold.json`. |
| Liczby / Docs | `docs/15_books_model.md` (cały plik) | Brak metryk regresji **logistycznej** dla książek (AUC-ROC=0,8404; F1 0,9107/0,9126; Precision/Recall) — są w CLAUDE.md, nieobecne w docs. Dokumentacja niekompletna. | Dodać sekcję z metrykami klasyfikacji książkowej. |

### ⚪ Opcjonalne

| Kategoria | Plik | Problem | Sugerowana poprawka |
|-----------|------|---------|---------------------|
| i18n | `frontend/src/components/AboutPage.jsx:122,134,136,138` | Zaszyte stringi „📚 Książki" oraz `label="Próg"` (reszta przez `t()`). | Przenieść do i18n. |
| i18n | `BooksApp.jsx:293,517,533`, `DeepAnalysisFlow.jsx:152,164`, `NewUserFlow.jsx:76`, `UserComparison.jsx:104` | Zaszyte polskie fallbacki błędów i teksty: „Błąd generowania rekomendacji", „Błąd połączenia z API", „Oceń co najmniej 3 filmy", „Brak wspólnych rekomendacji.". | Przenieść do i18n (klucze `errors.*`). |
| Liczby / Docs | `docs/03_model.md:398-404` | Finalna tabela porównawcza ma placeholdery „?" („Wartości uzupełniasz wynikami") oraz Baseline „~1.12/~0.93" (faktyczne 1,2163/0,9733). | Uzupełnić tabelę zweryfikowanymi wynikami lub oznaczyć jako szablon. |
| Liczby / Docs | `docs/06_chapter3_foundation.md:34-36,80-82` | Metryki podane jako zakresy (~0,85–0,92; ~0,75–0,80) zamiast dokładnych wartości. Zakresy obejmują faktyczne liczby, ale nieprecyzyjne dla pracy. | Rozważyć podanie dokładnych wartości (0,9120 itd.). |
| Liczby / Docs | `docs/04_backend.md:348`, `docs/09_deep_analysis.md:288`, `docs/02_preprocessing.md:184` | Liczba cech filmowych: „~47 liczb"/„~47 cech"/„45–47" — CLAUDE.md i docs książkowe podają dokładnie **45** (6 + 18 gatunków + 21 zawodów). | Ujednolicić do **45**. |
| Sieroty | `notebooks/plot_*.png` (13 plików) | Pliki `plot_*.png` (z 01_eda/02_preprocessing/03_model) nie są referowane w żadnym docs ani README — oficjalnymi wykresami pracy są `fig1-6_*.png` i `fig_group_*.png` (opisane w 07/08). Dublują treść (np. `plot_model_comparison` vs `fig1_model_comparison`). | Rozważyć usunięcie roboczych `plot_*.png` z repo lub udokumentowanie ich roli. |
| Docs vs pliki | `README.md:192` | „generują pliki `.pkl` i `.npy`" — dotyczy filmów; preprocessing książek zapisuje `.csv` (`X_train_books.csv`), nie `.npy`. | Doprecyzować (filmy: `.npy`, książki: `.csv`). |
| Organizacja kodu | `backend/main.py:315-320` | Endpoint filmowy `/evaluate/{userId}` zdefiniowany na samym dole, w sekcji `# ─── BOOKS ───`. Działa poprawnie, ale myli organizację. | Przenieść do sekcji `# ─── FILMS ───`. |

---

## Mapowanie notebooki ↔ docs (kontrola pokrycia)

| Notebook | Doc | Zgodność outputów |
|----------|-----|-------------------|
| `01_eda.ipynb` | `01_eda.md` | ✅ (plot_rating_distribution, plot_user_activity*, plot_movie_popularity, plot_genres, plot_demographics) |
| `02_preprocessing.ipynb` | `02_preprocessing.md` | ✅ (X_train.npy/X_test.npy, scaler.pkl, plot_aggregated_features.png) |
| `03_model.ipynb` | `03_model.md` | ⚠️ tabela z „?"; dodatkowo generuje `book_crossing_eda.png` do roota (patrz wyżej) |
| `04_visualizations.ipynb` | `07_visualizations.md` | ✅ (fig1-fig6_*.png) — uwaga: numeracja docs ≠ numeracja notebooka |
| `05_group_analysis.ipynb` | `08_group_analysis.md` | ✅ (fig_group_*.png, group_analysis_summary.json) |
| `06_books_preprocessing.ipynb` | `14_books_preprocessing.md` | 🔴 błędne liczby podziału + próg użytkowników (5 vs 20) |
| `07_books_model.ipynb` | `15_books_model.md` | 🔴 błędne metryki i próg (stary przebieg) |

> Uwaga: numeracja plików docs nie jest 1:1 z numeracją notebooków po `03` (np. notebook `04_visualizations` → `docs/07_visualizations.md`). Nie jest to błąd — mapowanie obsługują tabele w README — ale warto o tym pamiętać przy nawigacji.

---

## Rekomendowana kolejność naprawy

1. **Najpierw krytyczne** (`14_books_preprocessing.md`, `15_books_model.md`) — to liczby trafiające bezpośrednio do pracy magisterskiej i sprzeczne ze zweryfikowanym modelem.
2. Następnie spójność progu książkowego i progu filtracji (notebook 06 + doc 14).
3. i18n w `EvaluationChart.jsx` (jawne złamanie zasady projektu).
4. Drobne porządki dokumentacji (porty, nieistniejące pliki `*_update.md`, liczba cech).
