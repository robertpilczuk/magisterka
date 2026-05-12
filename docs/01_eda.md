# Dokumentacja — 01_eda.ipynb
## Eksploracyjna Analiza Danych (EDA)

---

## Czym jest EDA i dlaczego ją robimy?

**EDA (Exploratory Data Analysis)** — eksploracyjna analiza danych — to pierwszy obowiązkowy krok w każdym projekcie związanym z analizą danych lub uczeniem maszynowym. Zanim zbudujemy jakikolwiek model, musimy zrozumieć dane którymi dysponujemy.

EDA odpowiada na pytania:
- Ile mamy danych i jakiego są rodzaju?
- Czy dane są kompletne, czy brakuje wartości?
- Jak rozkładają się wartości poszczególnych zmiennych?
- Czy są wartości odstające (tzw. outliery)?
- Jakie zależności istnieją między zmiennymi?

W kontekście naszej pracy: zanim zbudujemy model przewidujący oceny filmów, musimy wiedzieć jak wyglądają te oceny, kim są użytkownicy, jakie filmy są popularne i czy dane nadają się do modelowania.

---

## Zbiór danych MovieLens 1M

### Czym jest MovieLens?

MovieLens to serwis rekomendacji filmowych prowadzony przez GroupLens Research na Uniwersytecie Minnesota. Użytkownicy oceniają filmy w skali 1–5, a na podstawie tych ocen serwis generuje rekomendacje. Zebrane dane są udostępniane publicznie do celów badawczych i są jednym z najpopularniejszych zbiorów danych w dziedzinie systemów rekomendacji.

### Dlaczego MovieLens 1M, a nie inny zbiór?

Spośród dostępnych wersji datasetu MovieLens 1M jest optymalny dla celów pracy magisterskiej z następujących powodów:

- **Rozmiar:** 1 000 209 ocen to wystarczająco duży zbiór, żeby wyniki były statystycznie wiarygodne, ale wystarczająco mały, żeby model trenował się w rozsądnym czasie na zwykłym komputerze
- **Dane demograficzne:** jako jedyny z mniejszych zbiorów zawiera informacje o użytkownikach (wiek, płeć, zawód) — co pozwala budować bogatszy model z więcej zmiennymi niezależnymi
- **Stabilność:** jest to "stable benchmark dataset" — nie zmienia się w czasie, co jest wymagane przy cytowaniu w pracach naukowych
- **Powszechność:** jest cytowany w tysiącach publikacji naukowych, co ułatwia porównanie wyników z literaturą

### Struktura zbioru danych

Zbiór składa się z trzech plików:

**ratings.dat** — główny plik z ocenami
```
userId :: movieId :: rating :: timestamp
1 :: 1193 :: 5 :: 978300760
```
- `userId` — unikalny identyfikator użytkownika (1–6040)
- `movieId` — unikalny identyfikator filmu (1–3952)
- `rating` — ocena w skali 1–5 (tylko liczby całkowite)
- `timestamp` — czas wystawienia oceny w formacie Unix (sekundy od 1.01.1970)

**movies.dat** — informacje o filmach
```
movieId :: title :: genres
1 :: Toy Story (1995) :: Animation|Children's|Comedy
```
- `title` — tytuł wraz z rokiem produkcji w nawiasie
- `genres` — gatunki oddzielone znakiem `|` (jeden film może należeć do wielu gatunków)

**users.dat** — dane demograficzne użytkowników
```
userId :: gender :: age :: occupation :: zip-code
1 :: F :: 1 :: 10 :: 48067
```
- `gender` — płeć: M (mężczyzna) lub F (kobieta)
- `age` — przedział wiekowy zakodowany jako liczba (1=poniżej 18, 18=18-24, 25=25-34, itd.)
- `occupation` — zawód zakodowany jako liczba 0–20
- `zip-code` — kod pocztowy (nie używamy w modelu)

---

## Celka 1 — Importy bibliotek

### Co importujemy i po co?

**pandas** (`pd`) — podstawowa biblioteka do pracy z danymi tabelarycznymi w Pythonie. Odpowiednik Excela, ale programistyczny. Pozwala wczytywać pliki CSV/DAT, filtrować dane, grupować, łączyć tabele itp.

**numpy** (`np`) — biblioteka do obliczeń numerycznych. Operuje na macierzach liczb i jest podstawą większości obliczeń matematycznych i statystycznych w Pythonie.

**matplotlib.pyplot** (`plt`) — podstawowa biblioteka do tworzenia wykresów w Pythonie. Daje pełną kontrolę nad wyglądem wykresów.

**seaborn** (`sns`) — biblioteka do wizualizacji zbudowana na matplotlib. Oferuje ładniejsze domyślne style i upraszcza tworzenie złożonych wykresów statystycznych.

`sns.set_theme(style="whitegrid")` — ustawia jednolity styl dla wszystkich wykresów (białe tło z siatką), co zapewnia spójny wygląd wszystkich wizualizacji w pracy.

`%matplotlib inline` — komenda Jupyter która sprawia że wykresy wyświetlają się bezpośrednio w notebooku, a nie w osobnym oknie.

---

## Celka 2 — Wczytanie danych

### Dlaczego separator `::` a nie zwykły przecinek?

Standardowy format CSV używa przecinka jako separatora kolumn. Pliki MovieLens 1M używają `::` (dwa dwukropki) jako separatora — to niestandartowy format, który wymaga podania go wprost w funkcji `read_csv`.

### Co oznacza `engine='python'`?

Pandas ma dwa silniki parsowania plików: szybszy napisany w C i wolniejszy napisany w Pythonie. Szybszy nie obsługuje separatorów dłuższych niż jeden znak, dlatego dla `::` musimy użyć `engine='python'`.

### Dlaczego `encoding='latin-1'` dla movies.dat?

Plik z tytułami filmów zawiera znaki specjalne (np. tytuły z akcentami w językach europejskich). Domyślne kodowanie UTF-8 nie obsługuje ich poprawnie w tym pliku — `latin-1` (ISO-8859-1) rozwiązuje ten problem.

### Oczekiwany wynik
```
ratings: (1000209, 4)   → 1 000 209 ocen, 4 kolumny
movies:  (3883, 3)      → 3 883 filmy, 3 kolumny
users:   (6040, 5)      → 6 040 użytkowników, 5 kolumn
```

---

## Celka 3 — Podgląd danych (`head`)

`.head(3)` wyświetla pierwsze 3 wiersze każdej tabeli. To podstawowa czynność diagnostyczna — pozwala upewnić się że dane wczytały się poprawnie: kolumny mają właściwe nazwy, wartości wyglądają sensownie, typy danych są odpowiednie.

---

## Celka 4 — Rozkład ocen

### Co to jest histogram?

**Histogram** to wykres słupkowy pokazujący jak często występują poszczególne wartości zmiennej. Na osi X mamy wartości (tu: oceny 1–5), na osi Y liczbę wystąpień (ile razy dana ocena została wystawiona).

### Co ten wykres mówi nam o danych?

Rozkład ocen w MovieLens jest **lewostronnie skośny** — dominują oceny 3, 4 i 5, oceny 1 i 2 są rzadkie. To typowe zjawisko zwane **selection bias** (błąd selekcji): użytkownicy chętniej oceniają filmy które lubią, a rzadko zadają sobie trud oceniania filmów które im się nie podobały lub których nie obejrzeli do końca.

### Znaczenie dla modelu

Ten rozkład ma ważną konsekwencję dla naszego modelu: będzie on "widział" więcej przykładów wysokich ocen niż niskich, co może prowadzić do systematycznego przeszacowywania przewidywań. Jest to ograniczenie które opisujemy w Rozdziale III pracy.

---

## Celka 5 — Statystyki opisowe

### Co to są statystyki opisowe?

Statystyki opisowe to zestaw liczb które w skrócie charakteryzują rozkład zmiennej:

- **count** — liczba obserwacji (czy nie brakuje danych?)
- **mean** — średnia arytmetyczna
- **std** — odchylenie standardowe, miara rozrzutu danych wokół średniej. Im wyższe, tym bardziej zróżnicowane są wartości
- **min / max** — wartość minimalna i maksymalna
- **25% / 50% / 75%** — kwartyle. 50% to mediana — wartość środkowa. 25% oznacza że ćwierć obserwacji ma wartość niższą od tej liczby

### Interpretacja wyników dla ocen

Średnia ocena ~3.58 przy medianie ~4.0 potwierdza lewostronną skośność rozkładu opisaną powyżej. Odchylenie standardowe ~1.1 oznacza że typowa ocena odchyla się od średniej o około 1 punkt — to istotna informacja przy ocenie jakości modelu (dobry model powinien mieć błąd RMSE wyraźnie niższy niż 1.1).

---

## Celka 6 — Aktywność użytkowników

### Co analizujemy?

Sprawdzamy ile ocen wystawił każdy użytkownik. To ważne z kilku powodów:

1. Użytkownicy którzy wystawili bardzo mało ocen (np. 1–5) dają modelowi zbyt mało informacji o swoich preferencjach
2. Bardzo aktywni użytkownicy mogą dominować w zbiorze treningowym i "przesterowywać" model

### Interpretacja histogramu aktywności

Rozkład jest silnie prawostronnie skośny — większość użytkowników wystawiła stosunkowo mało ocen, ale jest niewielka grupa bardzo aktywnych użytkowników z setkami lub tysiącami ocen. To typowy wzorzec w serwisach społecznościowych, opisywany prawem Pareto (20% użytkowników generuje 80% ocen).

### Mediana ocen na usera

Mediana jest tutaj lepszą miarą niż średnia, bo nie jest zakłócana przez bardzo aktywnych użytkowników. Jeśli mediana wynosi np. 96, oznacza to że połowa użytkowników wystawiła mniej niż 96 ocen.

---

## Celka 7 — Popularność filmów

### Co analizujemy?

Sprawdzamy ile ocen otrzymał każdy film oraz jaka jest ich średnia. To pozwala zidentyfikować:

- Filmy bardzo popularne (setki/tysiące ocen) vs niszowe (kilka ocen)
- Czy popularne filmy są też lepiej oceniane?

### Top 10 najpopularniejszych filmów

Tabela pokazuje filmy z największą liczbą ocen. Warto zwrócić uwagę że "popularność" (liczba ocen) nie jest tym samym co "jakość" (średnia ocena) — film może być bardzo popularny i mieć średnią ocenę, bo oglądają go zarówno fani jak i przypadkowi widzowie.

### Znaczenie dla modelu

Liczba ocen filmu (`movie_rating_count`) będzie jedną ze zmiennych niezależnych w modelu. Założenie: filmy z większą liczbą ocen mają bardziej "stabilną" i wiarygodną średnią, co może pomagać modelowi w dokładniejszych przewidywaniach.

---

## Celka 8 — Oceny per gatunek

### Dlaczego `explode`?

Jeden film może należeć do wielu gatunków jednocześnie (np. "Action|Adventure|Sci-Fi"). Funkcja `explode` "rozkłada" listę gatunków tak że każda para film–gatunek staje się osobnym wierszem. Bez tego nie moglibyśmy poprawnie policzyć statystyk per gatunek.

### Interpretacja wykresu

**Lewy wykres (średnia ocena per gatunek)** — pokazuje które gatunki są oceniane najwyżej. Typowo Film-Noir, Documentary i War otrzymują wyższe średnie oceny niż Horror czy Children's. Nie oznacza to że są "lepsze" — odzwierciedla to preferencje demograficzne użytkowników MovieLens (przeważnie młodzi mężczyźni).

**Prawy wykres (liczba ocen per gatunek)** — pokazuje które gatunki są najpopularniejsze. Drama i Comedy dominują bo jest ich po prostu najwięcej w zbiorze.

### Znaczenie dla modelu

Gatunek filmu będzie kluczową zmienną niezależną w modelu. Jeśli użytkownik historycznie wysoko oceniał filmy akcji, model powinien przewidywać wyższe oceny dla kolejnych filmów akcji.

---

## Celka 9 — Demografia użytkowników

### Rozkład płci

Wykres kołowy pokazuje proporcję kobiet i mężczyzn w zbiorze. MovieLens jest zdominowany przez mężczyzn (~72% M, ~28% F) — to istotne ograniczenie zbioru danych, które należy opisać w Rozdziale III. Model może być mniej dokładny dla użytkowniczek ze względu na niedoreprezentowanie tej grupy w danych treningowych.

### Rozkład wieku

Kodowanie wieku w ML-1M jest niestandartowe — zamiast rzeczywistego wieku mamy przedziały zakodowane liczbami (1, 18, 25, 35, 45, 50, 56). Wykres słupkowy po zdekodowaniu na etykiety pokazuje że dominuje grupa 25–34 lat, co jest typowe dla serwisów internetowych z początku lat 2000.

### Znaczenie dla modelu

Wiek i płeć użytkownika będą zmiennymi niezależnymi w modelu. Założenie badawcze: różne grupy demograficzne mają różne preferencje filmowe, co model powinien uchwycić.

---

## Celka 10 — Zapis scalonych danych

### Co to jest merge (łączenie tabel)?

Operacja `merge` w pandas odpowiada operacji JOIN w SQL — łączy dwie tabele na podstawie wspólnej kolumny. W naszym przypadku:

```
ratings + users  → łączymy po userId  → dodajemy dane demograficzne do każdej oceny
wynik + movies   → łączymy po movieId → dodajemy gatunek i tytuł do każdej oceny
```

Wynikiem jest jedna duża tabela gdzie każdy wiersz to ocena wraz z pełnym kontekstem: kto ocenił (demografia), co ocenił (gatunek, tytuł) i jak ocenił (rating).

### Dlaczego zapisujemy do pliku?

Żeby nie musieć powtarzać łączenia tabel w następnym notebooku. Zapis do `merged_raw.csv` to punkt startowy dla preprocessingu.

---

*Dokumentacja wygenerowana dla notebooka 01_eda.ipynb*
*Projekt: Wykorzystanie regresji liniowej w procesie predykcyjnym doboru treści audiowizualnych*
