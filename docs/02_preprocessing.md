# Dokumentacja — 02_preprocessing.ipynb
## Przygotowanie i przetwarzanie danych (Preprocessing)

---

## Czym jest preprocessing i dlaczego jest niezbędny?

**Preprocessing** (przetwarzanie wstępne danych) to proces przekształcania surowych danych w formę którą algorytm uczenia maszynowego może przetworzyć. Surowe dane rzadko nadają się bezpośrednio do modelowania — zawierają tekst, kategorie, brakujące wartości i różne skale liczbowe.

Algorytm regresji liniowej operuje wyłącznie na **liczbach**. Oznacza to że musimy zamienić każdą informację — płeć, gatunek, zawód — na reprezentację numeryczną. Preprocessing to właśnie ten proces zamiany.

Dobry preprocessing ma bezpośredni wpływ na jakość modelu — "garbage in, garbage out" to zasada która mówi że nawet najlepszy algorytm da złe wyniki jeśli dostanie złe dane.

---

## Celka 1 — Importy i wczytanie danych

### Nowe biblioteki względem EDA

**sklearn (scikit-learn)** — najpopularniejsza biblioteka uczenia maszynowego w Pythonie. Zawiera gotowe implementacje dziesiątek algorytmów (w tym regresji liniowej), narzędzia do podziału danych, skalowania i oceny modeli. Używamy jej przez cały projekt.

**joblib** — biblioteka do serializacji obiektów Pythona, czyli zapisu skomplikowanych struktur danych (jak wytrenowany model) do pliku na dysku. Dzięki temu nie musimy trenować modelu od nowa przy każdym uruchomieniu aplikacji.

### Dlaczego wczytujemy `merged_raw.csv` a nie oryginalne pliki `.dat`?

Scalony plik z EDA zawiera już połączone dane z trzech źródeł (ratings + users + movies). Wczytanie jednego pliku jest szybsze i prostsze niż ponowne łączenie trzech tabel.

---

## Celka 2 — Ekstrakcja roku z tytułu

### Problem

Tytuły filmów w MovieLens zawierają rok produkcji w nawiasie: `"Toy Story (1995)"`. Rok jest cenną informacją (starsze filmy mogą być oceniane inaczej niż nowsze), ale jest "uwięziony" w tekście.

### Rozwiązanie — wyrażenie regularne (regex)

**Wyrażenie regularne** to mini-język do wyszukiwania wzorców w tekście. `r'\((\d{4})\)'` oznacza:
- `\(` — szukaj nawiasu otwierającego `(`
- `(\d{4})` — wewnątrz nawiasów znajdź dokładnie 4 cyfry i je "złap" (to będzie rok)
- `\)` — szukaj nawiasu zamykającego `)`

Wynikiem jest nowa kolumna `year` z liczbą np. `1995.0`. Typ `float` (liczba zmiennoprzecinkowa) zamiast `int` wynika z tego że pandas konwertuje kolumnę na float gdy mogą wystąpić wartości NaN (brakujące).

### Dlaczego rok może być ważną zmienną?

Hipoteza badawcza: użytkownicy mogą systematycznie oceniać filmy z różnych epok inaczej — np. klasyki z lat 70. są oceniane przez entuzjastów kina, a filmy współczesne przez szerszą publiczność.

---

## Celka 3 — Enkodowanie płci

### Problem

Kolumna `gender` zawiera wartości tekstowe: `'M'` i `'F'`. Algorytm matematyczny nie może operować na tekście.

### Rozwiązanie — Label Encoding

Zamieniamy wartości tekstowe na liczby binarne:
- `M` (mężczyzna) → `0`
- `F` (kobieta) → `1`

Wyrażenie `(df['gender'] == 'M').astype(int)` tworzy kolumnę wartości True/False (gdzie True = mężczyzna), a `.astype(int)` zamienia True→1, False→0. Ponieważ są tylko dwie kategorie, jedna kolumna binarna w zupełności wystarcza.

### Dlaczego nie używamy 1 dla M i 2 dla F?

Gdybyśmy zakodowali M=1, F=2, model mógłby błędnie interpretować że kobieta jest "dwa razy większa" niż mężczyzna. Kodowanie binarne (0/1) unika tego problemu.

---

## Celka 4 — One-Hot Encoding gatunków

### Problem

Kolumna `genres` zawiera tekst w formacie `"Action|Adventure|Sci-Fi"`. Jest to szczególnie trudny przypadek bo jeden film może mieć wiele gatunków jednocześnie.

### Rozwiązanie — One-Hot Encoding

**One-Hot Encoding** to technika zamiany zmiennej kategorycznej na zestaw kolumn binarnych. Dla każdego unikalnego gatunku tworzymy osobną kolumnę, gdzie wartość 1 oznacza że film należy do tego gatunku, a 0 że nie należy.

Przykład dla filmu `"Action|Sci-Fi"`:

| Action | Adventure | Comedy | Drama | Sci-Fi | ... |
|--------|-----------|--------|-------|--------|-----|
| 1      | 0         | 0      | 0     | 1      | ... |

Funkcja `str.get_dummies(sep='|')` robi to automatycznie — rozdziela wartości po znaku `|` i tworzy odpowiednie kolumny.

### Dlaczego nie zakodować gatunków jako liczb (1=Action, 2=Comedy, ...)?

Gdybyśmy zakodowali Action=1, Comedy=2, Drama=3, model zakładałby że Drama jest "trzy razy ważniejsza" niż Action i że Comedy "leży między" nimi. To nie ma sensu dla zmiennych kategorycznych bez naturalnego porządku. One-Hot Encoding eliminuje ten problem.

### Ile kolumn powstaje?

MovieLens 1M zawiera 18 gatunków — powstaje zatem 18 nowych kolumn binarnych.

---

## Celka 5 — One-Hot Encoding zawodów

### Kodowanie zawodów w ML-1M

Zawód użytkownika jest zakodowany jako liczba 0–20. Choć to liczba, nie ma ona wartości numerycznej — zawód nr 12 (programmer) nie jest "większy" niż zawód nr 3 (clerical/admin). Dlatego stosujemy One-Hot Encoding tak samo jak dla gatunków.

Funkcja `pd.get_dummies(df['occupation'], prefix='occ')` tworzy 21 kolumn binarnych: `occ_0`, `occ_1`, ..., `occ_20`.

### Pełna lista zawodów

| Kod | Zawód | Kod | Zawód |
|-----|-------|-----|-------|
| 0 | other/not specified | 11 | lawyer |
| 1 | academic/educator | 12 | programmer |
| 2 | artist | 13 | retired |
| 3 | clerical/admin | 14 | sales/marketing |
| 4 | college/grad student | 15 | scientist |
| 5 | customer service | 16 | self-employed |
| 6 | doctor/health care | 17 | technician/engineer |
| 7 | executive/managerial | 18 | tradesman/craftsman |
| 8 | farmer | 19 | unemployed |
| 9 | homemaker | 20 | writer |
| 10 | K-12 student | | |

### Hipoteza badawcza

Zawód może korelować z preferencjami filmowymi — np. programiści mogą preferować Sci-Fi, a artyści filmy dokumentalne. Model regresji liniowej sam wykryje te zależności jeśli istnieją.

---

## Celka 6 — Cechy agregowane

### Co to są cechy agregowane?

**Cechy agregowane** to zmienne wyliczane poprzez podsumowanie danych na poziomie grupy (np. "co wiemy o wszystkich ocenach tego użytkownika"). Są bardzo ważne w systemach rekomendacji bo pozwalają modelowi "wiedzieć" coś o historii danego użytkownika lub popularności danego filmu.

### user_avg_rating — średnia ocena użytkownika

Dla każdego użytkownika liczymy średnią z wszystkich jego ocen. Ta cecha odpowiada na pytanie: "Czy ten użytkownik jest generalnie wymagający (ocenia nisko) czy łagodny (ocenia wysoko)?". Użytkownik który zawsze daje 4–5 to inaczej interpretowany niż ten który daje 2–3.

Jest to jedna z najważniejszych cech w modelu — tzw. **user bias** (błąd systematyczny użytkownika).

### movie_avg_rating — średnia ocena filmu

Dla każdego filmu liczymy średnią ze wszystkich ocen które otrzymał. To odpowiednik oceny na Filmwebie czy IMDb — miara jak bardzo film jest ogólnie ceniony przez wszystkich użytkowników.

Jest to druga najważniejsza cecha — tzw. **item bias** (błąd systematyczny filmu/produktu).

### movie_rating_count — liczba ocen filmu

Liczba użytkowników którzy ocenili dany film. Filmy z wieloma ocenami mają bardziej "stabilną" i wiarygodną średnią niż filmy ocenione przez 3 osoby.

### Wizualizacja rozkładów

Trzy histogramy pokazują rozkłady tych cech:

**Rozkład user_avg_rating** — powinien być skupiony wokół 3.5–4.0 z małym odchyleniem. Większość użytkowników ocenia podobnie, outlierzy (bardzo surowi lub bardzo łagodni) są rzadcy.

**Rozkład movie_avg_rating** — szerszy rozkład, filmy różnią się bardziej między sobą niż użytkownicy w swoich nawykach oceniania.

**Rozkład movie_rating_count** — silnie prawostronnie skośny: większość filmów ma niewiele ocen, ale kilka blockbusterów ma ich tysiące.

---

## Celka 7 — Wybór finalnych cech (Feature Selection)

### Co to jest feature selection?

**Feature selection** to proces wyboru zmiennych (cech) które wejdą do modelu. Nie każda dostępna informacja jest użyteczna — niektóre zmienne mogą być nieistotne lub redundantne.

### Finalne cechy modelu

```
FEATURE_COLS = [
    'age',                  # wiek użytkownika
    'gender_encoded',       # płeć (0/1)
    'year',                 # rok produkcji filmu
    'user_avg_rating',      # średnia ocen użytkownika
    'movie_avg_rating',     # średnia ocen filmu
    'movie_rating_count',   # popularność filmu
    + 18 kolumn gatunków    # genre_Action, genre_Comedy, ...
    + 21 kolumn zawodów     # occ_0, occ_1, ..., occ_20
]
```

Łącznie około 45–47 zmiennych niezależnych.

### Czego NIE używamy i dlaczego?

- `timestamp` — czas wystawienia oceny. Mógłby wprowadzić zależności czasowe które komplikują interpretację modelu
- `zip-code` — kod pocztowy. Zbyt szczegółowy, zbyt wiele unikalnych wartości
- `title` — surowy tekst tytułu. Nie zawiera użytecznej informacji po wyekstrahowaniu roku
- `userId`, `movieId` — identyfikatory. Są numeryczne ale nie mają wartości predykcyjnej (to tylko etykiety)

---

## Celka 8 — Usunięcie wierszy z brakującymi wartościami (NaN)

### Co to są wartości NaN?

**NaN** (Not a Number) to sposób w jakim pandas reprezentuje brakujące wartości. Mogą powstać np. gdy film nie ma roku w tytule (regex nie znalazł wzorca) lub gdy dane były niekompletne w źródle.

### Dlaczego usuwamy wiersze z NaN zamiast je uzupełniać?

Mamy ponad milion obserwacji. Usunięcie kilku wierszy z brakującymi wartościami nie wpłynie istotnie na wyniki, a jest prostsze i bezpieczniejsze niż **imputacja** (uzupełnianie brakujących wartości szacunkowymi). Przy małej liczbie brakujących danych usunięcie jest standardowym podejściem.

---

## Celka 9 — Podział danych na zbiór treningowy i testowy

### Dlaczego dzielimy dane?

To jeden z fundamentalnych konceptów w uczeniu maszynowym. Mamy jeden zbiór danych, ale potrzebujemy go użyć do dwóch celów:

1. **Nauczyć model** — pokazać mu wiele przykładów żeby "nauczył się" zależności
2. **Ocenić model** — sprawdzić jak radzi sobie z danymi których nigdy nie widział

Gdybyśmy oceniali model na tych samych danych na których się uczył, wyniki byłyby sztucznie zawyżone. Model "pamiętałby" odpowiedzi zamiast generalizować.

### Podział 80/20

- **Zbiór treningowy (train, 80%)** — 800 000+ ocen na których model się uczy
- **Zbiór testowy (test, 20%)** — 200 000+ ocen na których sprawdzamy jakość modelu

Podział 80/20 (tzw. reguła Pareto) jest standardem w uczeniu maszynowym — daje wystarczająco dużo danych do nauki i wystarczająco dużo do rzetelnej oceny.

### `random_state=42`

Parametr `random_state` ustala "ziarno losowości" — gwarantuje że każde uruchomienie kodu da identyczny podział. Liczba 42 jest konwencją (nawiązanie do "Autostopem przez Galaktykę"), ale mogłaby być dowolna. Ważne jest że jest stała — zapewnia **reprodukowalność** wyników, co jest wymogiem badań naukowych.

---

## Celka 10 — Skalowanie cech (StandardScaler)

### Problem z różnymi skalami

Nasze cechy mają bardzo różne zakresy wartości:
- `age` → wartości 1, 18, 25, 35, 45, 50, 56
- `movie_rating_count` → wartości od 1 do 3428
- `genre_Action` → tylko 0 lub 1

Algorytm regresji liniowej jest wrażliwy na skalę cech — cecha o dużych wartościach (np. `movie_rating_count`) mogłaby dominować nad cechami o małych wartościach (np. `gender_encoded`), nawet jeśli jest mniej istotna.

### StandardScaler — standaryzacja

**Standaryzacja** przekształca każdą cechę tak żeby miała:
- średnią = 0
- odchylenie standardowe = 1

Wzór: `z = (x - średnia) / odchylenie_standardowe`

Po standaryzacji wszystkie cechy są na tej samej skali i model może je uczciwie porównywać.

### Dlaczego `fit_transform` na treningu, a tylko `transform` na teście?

To kluczowy szczegół:

- `fit_transform(X_train)` — najpierw **uczy się** parametrów (liczy średnią i odchylenie z danych treningowych), potem **transformuje**
- `transform(X_test)` — używa parametrów z danych treningowych do transformacji danych testowych

Gdybyśmy robili `fit_transform` na danych testowych, model "zobaczyłby" dane testowe przed oceną — to **data leakage** (wyciek danych), który sztucznie zawyża wyniki i jest poważnym błędem metodologicznym.

### Co zapisujemy i dlaczego?

- `scaler.pkl` — wytrenowany scaler. Musimy go zachować bo podczas działania aplikacji nowe dane muszą być skalowane tymi samymi parametrami (tą samą średnią i odchyleniem) co dane treningowe
- `feature_cols.pkl` — lista nazw cech. Zapewnia że model zawsze dostaje cechy w tej samej kolejności
- Pliki `.npy` — przetworzone macierze danych gotowe do wczytania w notebooku z modelem

---

## Podsumowanie preprocessingu

Po tym etapie mamy:

| Artefakt | Opis |
|----------|------|
| `X_train.npy` | ~800k przykładów, ~47 cech, przeskalowane |
| `X_test.npy` | ~200k przykładów, ~47 cech, przeskalowane |
| `y_train.npy` | ~800k ocen (1–5) — wartości docelowe dla treningu |
| `y_test.npy` | ~200k ocen (1–5) — wartości docelowe dla testowania |
| `scaler.pkl` | Parametry skalowania (do użycia w aplikacji) |
| `feature_cols.pkl` | Lista nazw cech (do użycia w aplikacji) |
| `df_model.csv` | Pełna tabela z cechami i metadanymi (userId, movieId) |

Dane są gotowe do trenowania modelu.

---

*Dokumentacja wygenerowana dla notebooka 02_preprocessing.ipynb*
*Projekt: Wykorzystanie regresji liniowej w procesie predykcyjnym doboru treści audiowizualnych*
