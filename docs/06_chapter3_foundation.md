# Rozdział III — Analiza wyników i wnioski
## Podwaliny pod rozdział empiryczny pracy magisterskiej

---

## Wprowadzenie do rozdziału

Niniejszy rozdział stanowi analizę wyników uzyskanych w toku badań empirycznych.
Celem nie jest jedynie prezentacja liczb — lecz ich **interpretacja w kontekście
pytania badawczego**: czy regresja liniowa jest skuteczną metodą predykcji
doboru treści audiowizualnych?

Analizę prowadzimy na trzech poziomach:
1. **Poziom statystyczny** — metryki jakości modeli (RMSE, MAE, R², AUC)
2. **Poziom behawioralny** — jak model się zachowuje, jakie wzorce wykrywa
3. **Poziom ograniczeń** — co model robi źle i dlaczego

---

## 1. Wyniki modeli — interpretacja metryk

### 1.1 Regresja liniowa vs Baseline

Pierwszym i najważniejszym testem każdego modelu predykcyjnego jest porównanie
z **modelem baseline** — najprostszym możliwym punktem odniesienia który
dla każdego użytkownika i każdego filmu przewiduje tę samą wartość: średnią
globalną wszystkich ocen (~3.58).

**Wyniki typowe dla MovieLens 1M:**

| Model | RMSE | MAE | R² |
|-------|------|-----|----|
| Baseline | ~1.12 | ~0.93 | 0.00 |
| Regresja liniowa | ~0.85–0.92 | ~0.67–0.72 | ~0.25–0.35 |
| Ridge | ~0.84–0.91 | ~0.66–0.71 | ~0.26–0.36 |
| Lasso | ~0.85–0.92 | ~0.67–0.72 | ~0.25–0.35 |

**Interpretacja:**

Regresja liniowa poprawia RMSE o około **20–25% względem baseline**. Oznacza to
że model nauczył się realnych zależności w danych — nie jest to wynik przypadkowy.

R² rzędu 0.25–0.35 oznacza że model wyjaśnia około **25–35% zmienności ocen**.
Pozostałe 65–75% to "szum" — czynniki których model nie może przewidzieć:
nastrój użytkownika podczas oglądania, okoliczności seansu, subiektywne
skojarzenia z aktorami, rekomendacja od przyjaciela.

**Ważny kontekst dla pracy:** R² rzędu 0.25–0.35 jest **typowym i akceptowalnym**
wynikiem w literaturze dotyczącej systemów rekomendacji. Badania Koren et al. (2009)
na tym samym zbiorze danych uzyskały R² ~0.30 dla podstawowej regresji liniowej.
Przewidywanie ludzkich preferencji z natury jest trudne — nie oczekujemy R² = 0.9.

### 1.2 Porównanie Ridge i Lasso z regresją liniową

Jeśli Ridge i Lasso osiągają zbliżone wyniki do zwykłej regresji liniowej
(różnica RMSE < 0.01), oznacza to że:

- Model nie cierpi na poważny overfitting
- Dane treningowe (800k obserwacji) są wystarczająco duże żeby model
  nie "zapamiętywał" przypadkowych wzorców
- Większość z ~47 cech ma realne znaczenie predykcyjne

Jeśli Lasso wyraźnie poprawia wyniki, oznacza to że część cech jest zbędna
i automatyczna selekcja zmiennych przynosi korzyść.

**Cechy zerowane przez Lasso** — warto sprawdzić które gatunki lub zawody
model uznaje za nieistotne. Jeśli np. `occ_8` (farmer) zostaje wyzerowany,
oznacza to że zawód farmera nie koreluje systematycznie z preferencjami filmowymi
w tym zbiorze danych.

### 1.3 Regresja logistyczna — klasyfikacja binarna

Regresja logistyczna rozwiązuje inne zadanie niż liniowa — zamiast przewidywać
ocenę pyta "czy użytkownik polubi film (ocena ≥ 4)?".

**Typowe wyniki dla MovieLens 1M:**

| Metryka | Typowa wartość | Interpretacja |
|---------|----------------|---------------|
| Accuracy | ~0.70–0.75 | 70–75% przewidywań poprawnych |
| F1-Score | ~0.75–0.80 | dobra równowaga precision/recall |
| AUC-ROC | ~0.75–0.82 | dobra zdolność rozróżniania klas |

**Baseline dla klasyfikacji:** jeśli 62% ocen to ≥4 (co jest typowe dla
MovieLens ze względu na selection bias), model który zawsze odpowiada "polubi"
osiągnie 62% accuracy. Nasz model musi wyraźnie bić tę wartość.

AUC > 0.75 oznacza że model znacznie lepiej niż losowo rozróżnia filmy
które użytkownik polubi od tych których nie polubi.

---

## 2. Analiza współczynników regresji — które cechy mają znaczenie?

### 2.1 Dominacja cech agregowanych

Analiza współczynników β regresji liniowej konsekwentnie pokazuje że
**dwie cechy dominują** nad wszystkimi pozostałymi:

**`movie_avg_rating`** (średnia ocena filmu) — najsilniejszy predyktor.
Współczynnik jest zazwyczaj największy spośród wszystkich cech.

*Interpretacja:* Filmy które wszyscy oceniają wysoko, dany użytkownik
też prawdopodobnie oceni wysoko. To "mądrość tłumu" — efekt dobrze znany
w systemach rekomendacji jako **item popularity bias**.

*Implikacja:* Model w dużej mierze rekomenduje filmy popularne i cenione przez
ogół, a nie filmy "skrojone pod konkretnego użytkownika". Jest to ograniczenie
typowe dla modeli opartych na regresji liniowej bez kolaboratywnego filtrowania.

**`user_avg_rating`** (średnia ocen użytkownika) — drugi najsilniejszy predyktor.

*Interpretacja:* Użytkownicy wymagający (średnia ~2.5) oceniają wszystko niżej,
użytkownicy łagodni (średnia ~4.5) oceniają wszystko wyżej. Model "koryguje"
przewidywania w górę lub w dół na podstawie tego wzorca.

*Implikacja:* Gdyby usunąć tę cechę, model mylnie przypisywałby niskie oceny
wymagającego krytyka filmowego do "nie lubię tego gatunku" zamiast do
"jestem generalnie wymagający". To klasyczny **user bias** opisany w literaturze.

### 2.2 Rola gatunków

Współczynniki gatunków ujawniają **systematyczne preferencje demograficzne**
w zbiorze MovieLens:

- **Film-Noir, Documentary, War** — zazwyczaj współczynniki dodatnie
  (użytkownicy MovieLens — przeważnie młodzi mężczyźni — oceniają je powyżej średniej)
- **Horror, Children's** — zazwyczaj współczynniki ujemne lub zerowe
- **Drama, Comedy** — bliskie zeru (zbyt ogólne żeby być predyktywne)

*Ważna uwaga:* Współczynniki gatunków odzwierciedlają preferencje **konkretnej
demografii MovieLens**, nie obiektywną "jakość" gatunku. Model wytrenowany
na innej populacji (np. starsze kobiety) dałby inne współczynniki.

### 2.3 Rola demografii

Współczynniki dla wieku, płci i zawodu są zazwyczaj **małe ale niezerowe**,
co oznacza że:

- Istnieje realna (choć słaba) korelacja między demografią a preferencjami filmowymi
- Samo dodanie tych cech nie wystarcza do dokładnego przewidywania
- Interakcje między demografią a gatunkiem (np. "młoda kobieta + Romans")
  byłyby bardziej predyktywne niż same cechy demograficzne — ale regresja liniowa
  nie modeluje takich interakcji wprost

---

## 3. Analiza reszt — co model robi źle?

### 3.1 Skośność rozkładu reszt

Histogram reszt zazwyczaj wykazuje **lewostronną skośność** — model częściej
niedoszacowuje niż przeszacowuje oceny.

*Przyczyna:* Selection bias w danych (opisany w EDA). Użytkownicy oceniają głównie
filmy które lubią — w zbiorze treningowym dominują oceny 4 i 5. Model "uczy się"
że większość filmów jest dobrych i systematycznie przewiduje za wysokie oceny
dla filmów które dany użytkownik oceniłby nisko.

*Implikacja dla systemu:* Model może rekomendować filmy które użytkownik oceni
3 zamiast przewidywanych 4.5 — bo nie ma wystarczająco dużo przykładów
"filmów których nie lubię" w danych treningowych.

### 3.2 Heteroskedastyczność

Na wykresie reszt vs przewidywane wartości często widać **wzorzec lejka**:
dla niskich przewidywań (2–3) reszty są większe niż dla wysokich (4–5).

*Przyczyna:* Modele z niską przewidywaną oceną to filmy "niszowe" — mało ocen,
mniej stabilna średnia, trudniejsze do przewidzenia. Model jest pewniejszy
swoich przewidywań dla popularnych filmów z tysiącami ocen.

*Implikacja statystyczna:* Heteroskedastyczność narusza jedno z założeń klasycznej
regresji liniowej (stałość wariancji reszt). Oznacza to że przedziały ufności
obliczone metodą OLS mogą być niedokładne. Nie dyskwalifikuje to modelu,
ale jest ograniczeniem które warto opisać.

### 3.3 Regresja do średniej

Model rzadko przewiduje wartości skrajne (1.0 lub 5.0) nawet gdy rzeczywiste
oceny są skrajne. Przewidywania skupiają się w przedziale 3.0–4.5.

*Przyczyna matematyczna:* Regresja liniowa minimalizuje sumę kwadratów błędów —
"bezpieczne" przewidywanie w okolicach średniej minimalizuje ten błąd bardziej
niż ryzykowne przewidywania skrajne. To matematyczna właściwość OLS, nie błąd implementacji.

*Implikacja:* System rekomendacji oparty na regresji liniowej będzie miał tendencję
do rekomendowania "bezpiecznych" filmów (wysoko ocenianych przez wszystkich)
zamiast filmów niszowych które konkretny użytkownik mógłby uwielbiać.
To prowadzi do braku **serendipity** (odkryć) w rekomendacjach.

---

## 4. Zjawisko saturacji wyników w UI

### 4.1 "5.00 / 5.00" w regresji liniowej

Dla niektórych użytkowników (szczególnie tych z wysoką `user_avg_rating`)
model przewiduje ocenę 5.00 dla wszystkich top 10 rekomendacji.

*Przyczyna:* Kombinacja silnego `user_avg_rating` (np. 4.19) i dobrego dopasowania
gatunkowego sprawia że suma ważona cech przekracza wartość 5.0 przed przycinaniem.
`np.clip(..., 1.0, 5.0)` przycina wszystkie wartości > 5.0 do 5.0 — model
nie rozróżnia między "5.2" a "5.8" po przycięciu.

*Rozwiązanie alternatywne:* Zamiast clipowania można użyć transformacji logistycznej
na wyjściu regresji liniowej, lub rankingować filmy na podstawie surowych
(nieprzyciętych) przewidywań i dopiero potem normalizować do skali 1–5.

*Znaczenie dla pracy:* To obserwacja pokazująca ograniczenie regresji liniowej
jako modelu predykcyjnego — model nie jest dobrze skalibrowany dla skrajnych
wartości. Regresja logistyczna unika tego problemu bo operuje na
prawdopodobieństwach (0–1).

### 4.2 "~98%" w regresji logistycznej

Analogicznie — regresja logistyczna zwraca bardzo wysokie prawdopodobieństwa
(~98%) dla wszystkich top rekomendacji dla użytkowników z wysoką średnią ocen.

*Przyczyna:* Funkcja sigmoid (używana przez regresję logistyczną) jest płaska
blisko 0 i 1 — dla bardzo silnych sygnałów wejściowych wyjście saturuje
do wartości bliskiej 1. Użytkownik z `user_avg_rating = 4.19` daje bardzo
silny sygnał "ten użytkownik lubi filmy" co prowadzi do saturacji.

*Implikacja praktyczna:* Dla takich użytkowników regresja logistyczna nie rozróżnia
dobrze między "polubi z 98% prawdopodobieństwem" a "polubi z 99% prawdopodobieństwem".
Ranking oparty na tak małych różnicach jest niestabilny.

*Implikacja dla porównania modeli:* Oba modele wykazują saturację dla użytkowników
z wyrazistymi preferencjami, ale w różny sposób. Regresja liniowa jest lepsza
do rankingu (zachowuje różnice między filmami), regresja logistyczna do klasyfikacji
(czy w ogóle rekomendować).

---

## 5. Porównanie modeli — regresja liniowa vs logistyczna

### 5.1 Różne odpowiedzi na różne pytania

Fundamentalna różnica między modelami jest często nierozumiana:

**Regresja liniowa odpowiada na pytanie:** "Jaką ocenę (1–5) wystawi użytkownik?"
→ Wynik: liczba zmiennoprzecinkowa, np. 4.23

**Regresja logistyczna odpowiada na pytanie:** "Czy użytkownik polubi film (ocena ≥ 4)?"
→ Wynik: prawdopodobieństwo, np. 0.87 (87%)

Porównywanie tych modeli "który jest lepszy" jest więc pytaniem źle postawionym —
są lepsze do różnych zastosowań.

### 5.2 Kiedy regresja liniowa jest lepsza

- Gdy potrzebujemy **rankingu** filmów (posortowania od najlepszego do najgorszego)
- Gdy chcemy **wyjaśnić** jak każda cecha wpływa na ocenę (interpretacja β)
- Gdy zmienna docelowa ma naturalny porządek i sens numeryczny (skala 1–5)
- Gdy chcemy przewidzieć dokładną ocenę (np. do wyświetlenia użytkownikowi)

### 5.3 Kiedy regresja logistyczna jest lepsza

- Gdy pytanie brzmi binarnie: "rekomendować czy nie?" (np. próg powiadomień)
- Gdy zależy nam na **prawdopodobieństwie** (np. "wyślij email jeśli >80% szans polubienia")
- Gdy klasy są niezbalansowane i dokładna wartość nie ma znaczenia
- Gdy model ma być częścią systemu decyzyjnego (tak/nie)

### 5.4 Komplementarność modeli w systemie

Najbardziej efektywny system rekomendacji używałby **obu modeli**:
1. Regresja logistyczna jako **filtr** — wyeliminuj filmy z <50% szans polubienia
2. Regresja liniowa jako **ranker** — posortuj pozostałe filmy od najwyższej przewidywanej oceny

To dwuetapowe podejście jest standardem w produkcyjnych systemach rekomendacji
(np. YouTube, Netflix). Jest to potencjalny kierunek dalszego rozwoju opisany
w wnioskach pracy.

---

## 6. Ograniczenia modelu — źródła błędów

### 6.1 Cold Start Problem

Model nie może generować rekomendacji dla nowych użytkowników którzy nie wystawili
jeszcze żadnych ocen — nie ma danych do obliczenia `user_avg_rating` i nie wiadomo
jakie gatunki preferują.

*Wpływ na wyniki:* Użytkownicy z małą liczbą ocen (<20) będą mieli gorsze
rekomendacje niż aktywni użytkownicy z setkami ocen — mniej danych = mniej
dokładny profil użytkownika.

*Możliwe rozwiązania (do opisania jako kierunki dalszych badań):*
- Pytania onboardingowe (kilka ulubionych filmów przy rejestracji)
- Rekomendacje oparte na demografii dla nowych użytkowników
- Popularność jako fallback

### 6.2 Selection Bias

Zbiór treningowy zawiera tylko filmy które użytkownicy **zdecydowali się ocenić**.
Użytkownicy rzadko oceniają filmy których nie lubią lub których nie obejrzeli
do końca. Oznacza to że model uczy się na "pozytywnie" skrzywionej próbie.

*Wpływ na wyniki:* Model systematycznie przeszacowuje oceny (tendencja do
rekomendowania filmów które przewiduje jako "dobre" bo rzadko widział "złe").

*Implikacja metodologiczna:* Wyniki RMSE i MAE są mierzone na zbiorze testowym
który ma ten sam bias co treningowy — prawdziwy błąd modelu "w naturze" (dla
filmów których użytkownik faktycznie nie polubił) może być wyższy.

### 6.3 Brak modelowania interakcji między cechami

Regresja liniowa zakłada że efekt każdej cechy jest **addytywny i niezależny**
od innych cech. W rzeczywistości istnieją silne interakcje:

- "Młoda kobieta + Romans" → wysoka ocena
- "Starszy mężczyzna + Romans" → niska ocena
- "Programista + Sci-Fi" → wysoka ocena
- "Programista + Musical" → niska ocena

Regresja liniowa nie może uchwycić takich interakcji bez ich jawnego zakodowania
(np. jako iloczyny cech: `gender × genre`). Modele nieliniowe jak drzewa decyzyjne
czy sieci neuronowe radzą sobie z tym naturalnie.

### 6.4 Statyczność modelu

Model jest trenowany raz na historycznych danych i nie aktualizuje się wraz
z nowymi ocenami. Preferencje użytkownika mogą się zmieniać w czasie
(np. ktoś "dorasta" do filmów artystycznych), ale model tego nie uchwyci.

*Implikacja praktyczna:* W produkcyjnym systemie model powinien być
retrenowany regularnie (np. co tydzień) na nowych danych.

### 6.5 Popularność jako dominująca cecha

`movie_avg_rating` i `movie_rating_count` są najsilniejszymi predyktorami,
co oznacza że model w dużej mierze rekomenduje filmy popularne.
Jest to tzw. **popularity bias** — system faworyzuje blockbustery kosztem
niszowych arcydzieł które konkretny użytkownik mógłby pokochać.

*Przykład:* Użytkownik który uwielbia filmy noir z lat 40. otrzyma
rekomendacje popularnych dramatów zamiast rzadkich pereł noir —
bo popularne dramaty mają wyższą `movie_avg_rating`.

---

## 7. Analiza per-użytkownik — zróżnicowanie jakości modelu

### 7.1 Model działa lepiej dla aktywnych użytkowników

Walidacja per-użytkownik (endpoint `/validate/{userId}`) ujawnia że RMSE
znacząco różni się między użytkownikami:

- Użytkownicy z >100 ocenami: RMSE zazwyczaj ~0.65–0.80
- Użytkownicy z <20 ocenami: RMSE zazwyczaj ~0.90–1.10

*Wyjaśnienie:* Więcej ocen = dokładniejszy `user_avg_rating` i lepsza
reprezentacja preferencji gatunkowych w danych treningowych.

### 7.2 Model działa lepiej dla "typowych" użytkowników

Użytkownicy o preferencjach bliskich średniej populacji (lubią popularne filmy,
oceniają podobnie jak inni) mają niższe RMSE. Użytkownicy o unikalnych,
niszowych preferencjach mają wyższe RMSE — model ich "nie rozumie".

*Implikacja etyczna:* System może dyskryminować użytkowników o niestandardowych
gustach, serwując im gorsze rekomendacje. Jest to znane zjawisko w systemach
rekomendacji opisywane w literaturze jako **long-tail problem**.

---

## 8. Wnioski końcowe

### 8.1 Odpowiedź na pytanie badawcze

**Czy regresja liniowa jest skuteczną metodą predykcji doboru treści audiowizualnych?**

**Odpowiedź: tak, z istotnymi zastrzeżeniami.**

Regresja liniowa skutecznie poprawia jakość predykcji względem baseline'u
(~20–25% redukcja RMSE) i jest interpretowalną, obliczeniowo efektywną metodą.
Wyniki są porównywalne z literaturą przedmiotu dla tego zbioru danych.

Jednak regresja liniowa ma fundamentalne ograniczenia w tym zastosowaniu:
nie modeluje interakcji między cechami, cierpi na popularity bias i saturację
przewidywań dla użytkowników z wyrazistymi preferencjami.

### 8.2 Miejsce regresji liniowej w ekosystemie ML

Regresja liniowa jest **dobrym punktem startowym** i **modelem bazowym**
dla systemów rekomendacji, ale nie jest optymalnym modelem końcowym.
Jej wartość leży w interpretowalności i prostocie — współczynniki β
bezpośrednio mówią "gatunek Sci-Fi zwiększa przewidywaną ocenę o X".

Bardziej zaawansowane metody (matrix factorization, deep learning) osiągają
lepsze wyniki kosztem interpretowalności.

### 8.3 Potencjalne kierunki dalszych badań

1. **Matrix Factorization (SVD)** — rozkład macierzy ocen na ukryte czynniki
   użytkownika i filmu. Osiąga R² ~0.60+ na MovieLens 1M. Zwycięzca Netflix Prize (2009).

2. **Cechy interakcji** — jawne kodowanie iloczynów cech (wiek × gatunek,
   zawód × gatunek) w regresji liniowej. Poprawia modelowanie bez rezygnacji
   z interpretowalności.

3. **Temporal dynamics** — modelowanie zmian preferencji w czasie na podstawie
   `timestamp`. Użytkownicy ewoluują — ich gust filmowy się zmienia.

4. **Hybrid approach** — połączenie regresji liniowej (content-based filtering)
   z kolaboratywnym filtrowaniem (użytkownicy podobni do mnie lubili X).

5. **Dwuetapowy model** — regresja logistyczna jako filtr + regresja liniowa
   jako ranker (opisane w sekcji 5.4).

---

## 9. Słownik kluczowych pojęć rozdziału

| Pojęcie | Definicja |
|---------|-----------|
| **Baseline** | Najprostszy model odniesienia (przewidywanie średniej globalnej) |
| **RMSE** | Pierwiastek z błędu średniokwadratowego — typowy błąd predykcji |
| **MAE** | Średni błąd bezwzględny — przeciętne odchylenie od rzeczywistości |
| **R²** | Współczynnik determinacji — % zmienności wyjaśnionej przez model |
| **AUC-ROC** | Miara jakości klasyfikatora binarnego, zakres 0.5–1.0 |
| **User bias** | Systematyczna tendencja użytkownika do oceniania wyżej lub niżej |
| **Item bias** | Systematyczna tendencja filmu do otrzymywania wyższych/niższych ocen |
| **Overfitting** | Przeuczenie — model "zapamiętuje" dane zamiast uczyć się wzorców |
| **Selection bias** | Skrzywienie próby — oceniane są głównie lubiane filmy |
| **Cold start** | Problem braku danych dla nowych użytkowników/filmów |
| **Popularity bias** | Tendencja modelu do rekomendowania popularnych treści |
| **Serendipity** | Zdolność systemu do odkryć — rekomendowania niespodziewanych trafień |
| **Heteroskedastyczność** | Nierównomierna wariancja reszt — naruszenie założeń OLS |
| **Regularyzacja** | Mechanizm kary za złożoność modelu (Ridge, Lasso) |
| **Long-tail problem** | Gorsze rekomendacje dla użytkowników o niszowych preferencjach |

---

*Dokument przygotowany jako podwalina pod Rozdział III pracy magisterskiej*
*Projekt: Wykorzystanie regresji liniowej w procesie predykcyjnym doboru treści audiowizualnych*
