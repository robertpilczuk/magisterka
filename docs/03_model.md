# Dokumentacja — 03_model.ipynb
## Budowa, trening i ocena modeli predykcyjnych

---

## Wprowadzenie — czym jest model predykcyjny?

**Model predykcyjny** to matematyczna funkcja która na podstawie znanych danych wejściowych (cech, zmiennych niezależnych) przewiduje nieznaną wartość wyjściową (zmienną zależną). W naszym przypadku:

- **Dane wejściowe (X):** cechy użytkownika (wiek, płeć, zawód) + cechy filmu (gatunek, rok, popularność) + cechy agregowane (średnia ocen użytkownika, średnia ocen filmu)
- **Wartość wyjściowa (Y):** przewidywana ocena którą użytkownik wystawi filmowi (liczba z zakresu 1–5)

Model "uczy się" tej funkcji analizując milion historycznych ocen — szuka wzorców w stylu "użytkownicy w wieku 25–34 lubujący się w Sci-Fi zazwyczaj wysoko oceniają filmy z lat 90. z gatunku Sci-Fi".

---

## Regresja liniowa — wprowadzenie

### Czym jest regresja liniowa?

**Regresja liniowa** to jedna z najstarszych i najlepiej rozumianych metod statystycznych. Zakłada że zmienna zależna (Y) jest **liniową kombinacją** zmiennych niezależnych (X):

```
Y = β₀ + β₁·X₁ + β₂·X₂ + ... + βₙ·Xₙ + ε
```

Gdzie:
- `Y` — przewidywana ocena (np. 3.74)
- `β₀` — wyraz wolny (intercept) — bazowa przewidywana ocena gdy wszystkie cechy = 0
- `β₁, β₂, ..., βₙ` — współczynniki regresji — "waga" każdej cechy
- `X₁, X₂, ..., Xₙ` — wartości cech (wiek, gatunek, itd.)
- `ε` — błąd losowy (tego czego model nie potrafi wyjaśnić)

### Jak model "uczy się"?

Algorytm szuka takich wartości współczynników β, które minimalizują sumę kwadratów błędów — różnicę między ocenami przewidywanymi a rzeczywistymi. Metoda ta nazywa się **Metodą Najmniejszych Kwadratów (OLS — Ordinary Least Squares)**.

### Dlaczego regresja liniowa do przewidywania ocen?

Regresja liniowa jest uzasadnionym wyborem do tego zadania z kilku powodów:
1. Oceny 1–5 to wartości ciągłe z naturalnym porządkiem — liniowa relacja jest sensownym założeniem
2. Jest interpretowalna — współczynniki β mówią wprost jak każda cecha wpływa na przewidywaną ocenę
3. Jest wydajna obliczeniowo — trenuje się w sekundy nawet na milionach obserwacji
4. Jest dobrze opisana w literaturze — wyniki łatwo porównać z innymi badaniami

---

## Celka 1 — Importy i setup

### Nowe biblioteki

**LinearRegression** — implementacja regresji liniowej (metoda OLS) z biblioteki scikit-learn.

**Ridge** — wariant regresji liniowej z regularyzacją L2 (opisany szczegółowo przy celce 5).

**Lasso** — wariant regresji liniowej z regularyzacją L1 (opisany szczegółowo przy celce 5).

**mean_squared_error** — funkcja obliczająca Błąd Średniokwadratowy (MSE).

**mean_absolute_error** — funkcja obliczająca Średni Błąd Bezwzględny (MAE).

**r2_score** — funkcja obliczająca współczynnik determinacji R².

---

## Celka 2 — Wczytanie danych

Wczytujemy przetworzone dane z plików `.npy` (format numpy) oraz listę nazw cech z pliku `.pkl`. Dane są już przeskalowane i podzielone — gotowe do trenowania.

### Weryfikacja wymiarów

Sprawdzamy czy dane mają oczekiwany kształt:
- `X_train`: powinno być ~800k wierszy i ~47 kolumn (cech)
- `X_test`: ~200k wierszy, te same kolumny
- Liczba cech powinna zgadzać się z długością listy `FEATURE_COLS`

---

## Celka 3 — Model Baseline

### Czym jest model baseline?

**Baseline** (punkt odniesienia) to najprostszy możliwy "model" — jego wyniki stanowią minimalny poziom który każdy sensowny model musi przekroczyć.

Nasz baseline robi najprostszą możliwą rzecz: **dla każdego filmu i każdego użytkownika przewiduje dokładnie tę samą wartość — średnią wszystkich ocen ze zbioru treningowego** (około 3.58).

Jeśli nasz model regresji liniowej nie bije baseline'u, oznacza to że jest bezużyteczny — równie dobrze moglibyśmy mówić "każdy film dostanie 3.58".

### Interpretacja metryk baseline

**RMSE baseline** wynosi zazwyczaj około 1.12 dla MovieLens 1M. To wartość którą nasz model musi pobić.

---

## Celka 4 — Regresja liniowa

### Proces trenowania

```python
lr = LinearRegression()    # tworzymy obiekt modelu
lr.fit(X_train, y_train)   # trenujemy — model szuka optymalnych współczynników β
y_pred_lr = lr.predict(X_test)  # przewidujemy oceny dla danych testowych
```

`fit()` to moment w którym model "uczy się" — analizuje 800 000+ par (cechy → ocena) i wyznacza współczynniki β metodą najmniejszych kwadratów.

`predict()` to moment zastosowania modelu — dla każdego zestawu cech w zbiorze testowym oblicza przewidywaną ocenę.

---

## Metryki oceny jakości modelu

### RMSE — Root Mean Squared Error (Pierwiastek z Błędu Średniokwadratowego)

**Co mierzy:** typową wielkość błędu przewidywania, wyrażoną w tych samych jednostkach co zmienna docelowa (tu: w "punktach oceny").

**Wzór:** `RMSE = √( Σ(y_rzeczywiste - y_przewidywane)² / n )`

**Interpretacja:** RMSE = 0.85 oznacza że model myli się średnio o ±0.85 punktu na skali 1–5. Kara za duże błędy jest wyższa niż za małe (ze względu na kwadratowanie).

**Dlaczego RMSE a nie samo MSE?** MSE (bez pierwiastka) jest wyrażone w "kwadratach punktów oceny" — trudne do intuicyjnej interpretacji. RMSE przywraca jednostki oryginalne.

### MAE — Mean Absolute Error (Średni Błąd Bezwzględny)

**Co mierzy:** średnią absolutną różnicę między przewidywaniem a rzeczywistością.

**Wzór:** `MAE = Σ|y_rzeczywiste - y_przewidywane| / n`

**Interpretacja:** MAE = 0.70 oznacza że przeciętnie model myli się o 0.70 punktu. W przeciwieństwie do RMSE traktuje wszystkie błędy jednakowo (nie kwadratuje).

**RMSE vs MAE:** RMSE jest "surowszy" — mocniej karze za duże błędy. Jeśli RMSE jest wyraźnie wyższy od MAE, oznacza to że model popełnia sporadycznie duże błędy. W systemach rekomendacji oba są ważne.

### R² — Współczynnik Determinacji

**Co mierzy:** jaki procent zmienności ocen model potrafi wyjaśnić.

**Zakres:** od -∞ do 1.0
- `R² = 1.0` — model idealny, przewiduje bezbłędnie
- `R² = 0.0` — model równie dobry jak baseline (przewidywanie średniej)
- `R² < 0` — model gorszy niż baseline (to oznacza poważny problem)

**Interpretacja:** R² = 0.30 oznacza że model wyjaśnia 30% zmienności ocen. Pozostałe 70% to "szum" — czynniki których model nie potrafi przewidzieć (nastrój użytkownika, okoliczności oglądania, subiektywne odczucia).

**Ważna uwaga dla pracy:** R² rzędu 0.25–0.35 dla przewidywania preferencji filmowych jest typowym i akceptowalnym wynikiem w literaturze. Przewidywanie ludzkich preferencji jest z natury trudne — nie oczekujemy R² = 0.9.

---

## Celka 5 — Ridge i Lasso (modele z regularyzacją)

### Problem przeuczenia (overfitting)

**Overfitting** (przeuczenie) to sytuacja gdy model "zapamiętuje" dane treningowe zamiast uczyć się ogólnych wzorców. Objawia się dobrymi wynikami na danych treningowych i gorszymi na testowych.

Przy dużej liczbie cech (mamy ~47) istnieje ryzyko że model dopasuje się do przypadkowych wzorców w danych treningowych które nie generalizują się na nowe dane.

### Regularyzacja — mechanizm "kary"

**Regularyzacja** to technika która dodaje do funkcji kosztu (którą model minimalizuje) dodatkowy człon penalizujący zbyt duże współczynniki β. Zmusza to model do prostszych rozwiązań które lepiej generalizują.

### Ridge Regression (Regularyzacja L2)

**Jak działa:** dodaje do funkcji kosztu sumę kwadratów wszystkich współczynników pomnożoną przez parametr `alpha`:

```
Funkcja kosztu Ridge = MSE + alpha · Σβᵢ²
```

**Efekt:** wszystkie współczynniki są zmniejszane w kierunku zera, ale żaden nie staje się dokładnie zerem. Ridge "ściska" wszystkie cechy proporcjonalnie.

**Parametr alpha:** kontroluje siłę regularyzacji. alpha=0 → zwykła regresja liniowa. Im wyższe alpha, tym mocniejsza regularyzacja i prostszy model.

**Kiedy stosować:** gdy podejrzewamy że wiele cech ma małe ale realne znaczenie (co pasuje do naszego przypadku — wiele gatunków i zawodów może mieć małe ale niezerowe znaczenie).

### Lasso Regression (Regularyzacja L1)

**Jak działa:** dodaje do funkcji kosztu sumę wartości bezwzględnych współczynników:

```
Funkcja kosztu Lasso = MSE + alpha · Σ|βᵢ|
```

**Efekt:** Lasso potrafi wyzerować współczynniki nieistotnych cech — robi automatyczną **selekcję zmiennych**. Zamiast 47 cech model może wybrać że naprawdę istotnych jest np. 20.

**Dlaczego Lasso zeruje a Ridge nie?** To wynika z geometrii funkcji kosztu — szczegóły matematyczne wykraczają poza zakres pracy, ale efekt jest dobrze udokumentowany w literaturze.

**Kiedy stosować:** gdy podejrzewamy że wiele cech jest zbędnych i chcemy wiedzieć które z nich naprawdę mają znaczenie (np. czy zawód użytkownika naprawdę wpływa na oceny?).

### Znaczenie dla pracy magisterskiej

Porównanie Linear Regression, Ridge i Lasso pozwala odpowiedzieć na pytania badawcze:
1. Czy regularyzacja poprawia jakość przewidywań?
2. Które cechy są najważniejsze dla modelu (analiza współczynników Lasso)?
3. Czy model cierpi na overfitting (jeśli Ridge/Lasso biją LR, odpowiedź brzmi tak)?

---

## Celka 6 — Wykres porównania modeli

### Interpretacja wykresu

Trzy wykresy słupkowe porównują modele według każdej metryki:

**RMSE i MAE:** niższe wartości = lepszy model. Oczekujemy że wszystkie trzy modele uczenia maszynowego biją baseline o co najmniej 15–20%.

**R²:** wyższe wartości = lepszy model. Baseline ma R² = 0.0 z definicji.

### Co oznacza jeśli Ridge/Lasso nie poprawiają wyników?

Jeśli wszystkie trzy modele (LR, Ridge, Lasso) mają zbliżone metryki, oznacza to że regularyzacja nie jest potrzebna — dane są wystarczająco "czyste" i model nie przeuczył się. To pozytywny wynik który warto opisać w pracy.

---

## Celka 7 — Wykres: rzeczywiste vs przewidywane

### Co pokazuje ten wykres?

**Scatter plot** (wykres rozproszenia) gdzie:
- Oś X = rzeczywista ocena użytkownika (1–5)
- Oś Y = ocena przewidywana przez model

**Idealna sytuacja:** wszystkie punkty leżą na czerwonej linii przerywanej (y = x), co oznaczałoby że model przewiduje bezbłędnie.

**Rzeczywistość:** punkty są rozproszone wokół linii. Im mniejsze rozproszenie, tym lepszy model.

### Typowe wzorce do opisania w pracy

**Skupienie w środku (2.5–4.5):** model "boi się" skrajnych przewidywań. To typowe dla regresji liniowej — rzadko przewiduje 1.0 lub 5.0 nawet gdy rzeczywista ocena jest skrajna. Zjawisko to nazywa się **regresją do średniej**.

**Asymetria:** model może lepiej przewidywać wysokie oceny niż niskie (bo wysokie dominują w zbiorze treningowym — selection bias opisany w EDA).

---

## Celka 8 — Analiza reszt

### Co to są reszty (residuals)?

**Reszta** to różnica między oceną rzeczywistą a przewidywaną:
```
reszta = y_rzeczywiste - y_przewidywane
```

Reszta = +1.5 oznacza że model niedoszacował ocenę o 1.5 punktu.
Reszta = -0.8 oznacza że model przeszacował ocenę o 0.8 punktu.

### Histogram reszt

**Co powinniśmy zobaczyć w idealnym modelu:**
- Rozkład zbliżony do normalnego (dzwon Gaussa)
- Symetria względem zera — model nie powinien systematycznie przeszacowywać ani niedoszacowywać

**Odchylenia od ideału które warto opisać:**
- Skośność histogramu → systematyczny błąd modelu w jednym kierunku
- Grube ogony → model często popełnia bardzo duże błędy
- Wiele reszt przy +2 i -2 → trudność z przewidywaniem skrajnych ocen

### Wykres reszt vs przewidywane wartości

**Co powinniśmy zobaczyć w idealnym modelu:**
- Punkty równomiernie rozłożone wokół poziomej linii y=0
- Brak wyraźnych wzorców — losowy "szum"

**Odchylenia od ideału:**
- Wzorzec lejka (większe reszty dla wyższych przewidywań) → **heteroskedastyczność** — zmienność błędów nie jest stała, co narusza założenia regresji liniowej
- Wzorzec krzywej → nieliniowa zależność którą model liniowy nie może uchwycić

### Znaczenie dla pracy

Analiza reszt to standardowy element oceny jakości modelu regresji. Pozwala zidentyfikować **ograniczenia modelu** — tematyka Rozdziału III. Nawet jeśli reszty nie są idealne (co jest typowe w danych o preferencjach), opisanie tego jest wartościowe naukowo.

---

## Celka 9 — Współczynniki regresji

### Co pokazuje ten wykres?

Wykres słupkowy poziomy przedstawia wartości współczynników β dla 20 najważniejszych cech modelu regresji liniowej.

### Interpretacja współczynników

**Wartość dodatnia (niebieski słupek):** ta cecha zwiększa przewidywaną ocenę. Np. jeśli `movie_avg_rating` ma współczynnik +0.8, oznacza to że wzrost średniej oceny filmu o 1 jednostkę (po standaryzacji) zwiększa przewidywaną ocenę o 0.8.

**Wartość ujemna (czerwony/koralowy słupek):** ta cecha zmniejsza przewidywaną ocenę.

**Wielkość bezwzględna:** im większa wartość bezwzględna współczynnika, tym większy wpływ tej cechy na przewidywanie.

### Oczekiwane wyniki

Typowo najważniejszymi cechami okazują się:
- `movie_avg_rating` — najpotężniejszy predyktor: filmy które wszyscy lubią, ten użytkownik też pewnie polubi
- `user_avg_rating` — user bias: wymagający użytkownik będzie oceniał wszystko niżej
- Wybrane gatunki — różne gatunki mają systematycznie wyższe/niższe oceny

### Znaczenie dla pracy

Analiza współczynników to kluczowy element Rozdziału III — "wskazanie zależności pomiędzy zmiennymi". Odpowiada na pytanie: **co naprawdę wpływa na to jak użytkownik oceni film?**

---

## Celka 10 — Zapis modeli

### Dlaczego zapisujemy modele do plików .pkl?

Trenowanie modelu na milion obserwacji zajmuje kilka sekund–minut. Aplikacja webowa nie może za każdym razem trenować modelu od nowa przy każdym zapytaniu użytkownika. Zapisujemy wytrenowany model do pliku i wczytujemy go raz przy starcie aplikacji.

Format `.pkl` (pickle) to natywny format serializacji Pythona — zachowuje wszystkie parametry modelu (współczynniki β, intercept, itd.).

---

## Regresja logistyczna — wprowadzenie i porównanie

### Czym jest regresja logistyczna?

**Regresja logistyczna** to algorytm klasyfikacji (mimo mylącego słowa "regresja" w nazwie). Zamiast przewidywać wartość ciągłą (np. ocenę 3.74), przewiduje **prawdopodobieństwo przynależności do kategorii**.

W naszym przypadku przeformułowujemy problem: zamiast pytać "jaką ocenę wystawi użytkownik?" pytamy **"czy użytkownik polubi ten film?"**

Binaryzacja: `rating >= 4` → `1` (polubi), `rating < 4` → `0` (nie polubi)

### Matematyka regresji logistycznej

Regresja logistyczna używa funkcji logistycznej (sigmoid) do mapowania wyniku liniowego na prawdopodobieństwo:

```
P(Y=1) = 1 / (1 + e^(-z))
gdzie z = β₀ + β₁·X₁ + ... + βₙ·Xₙ
```

Wynikiem jest liczba z zakresu (0, 1) interpretowana jako prawdopodobieństwo że użytkownik polubi film. Jeśli P > 0.5, model przewiduje "polubi" (klasa 1).

### Kluczowa różnica między modelami

| Cecha | Regresja liniowa | Regresja logistyczna |
|-------|-----------------|---------------------|
| Typ zadania | Regresja (wartość ciągła) | Klasyfikacja (kategoria) |
| Wartość wyjściowa | Liczba (np. 3.74) | Prawdopodobieństwo (0–1) |
| Pytanie | "Jak wysoko oceni?" | "Czy polubi?" |
| Metryki oceny | RMSE, MAE, R² | Accuracy, F1, AUC-ROC |
| Założenie | Liniowa zależność Y od X | Liniowa zależność log-odds od X |

### Kiedy regresja logistyczna jest lepsza?

Dla praktycznego systemu rekomendacji ("pokaż mi filmy które polubię") regresja logistyczna może być bardziej użyteczna — użytkownika interesuje czy film mu się spodoba, nie dokładna liczba jaką mu wystawi. Natomiast gdy zależy nam na rankingu (posortowaniu filmów od najlepszego do najgorszego), regresja liniowa daje więcej informacji.

---

## Metryki klasyfikacji (dla regresji logistycznej)

### Accuracy (Dokładność)

**Co mierzy:** jaki procent przewidywań był poprawny.

**Wzór:** `Accuracy = (TP + TN) / (TP + TN + FP + FN)`

**Ograniczenie:** przy niezbalansowanych klasach (jeśli 65% ocen to "polubi") model który zawsze przewiduje "polubi" osiągnie 65% accuracy bez żadnej wiedzy. Dlatego accuracy często nie wystarcza.

### Precision i Recall

**Precision (Precyzja):** z filmów które model oznaczył jako "spodoba się", ile rzeczywiście się spodobało?

**Recall (Czułość):** ze wszystkich filmów które naprawdę się spodobały, ile model poprawnie wykrył?

### F1-Score

**Harmoniczna średnia** Precision i Recall — dobre podsumowanie jakości klasyfikatora gdy klasy są niezbalansowane.

**Wzór:** `F1 = 2 · (Precision · Recall) / (Precision + Recall)`

### AUC-ROC

**AUC** (Area Under the Curve) — pole pod krzywą ROC. Mierzy zdolność modelu do rozróżniania między klasami niezależnie od progu decyzyjnego.

- `AUC = 1.0` — model idealny
- `AUC = 0.5` — model losowy (rzut monetą)
- `AUC = 0.7–0.8` — dobry model
- `AUC > 0.8` — bardzo dobry model

---

## Celki regresji logistycznej — kiedy dodajemy

Regresja logistyczna jest dodawana jako **blok celkek na końcu notebooka 03**, po wszystkich celkach regresji liniowej. Struktura:

1. **Binaryzacja danych** — konwersja ocen 1–5 na 0/1
2. **Trening modelu** — `LogisticRegression().fit(X_train, y_binary_train)`
3. **Metryki klasyfikacji** — accuracy, F1, AUC-ROC
4. **Krzywa ROC** — wizualizacja jakości klasyfikatora
5. **Macierz pomyłek** — visualization confusion matrix
6. **Tabela porównawcza** — zestawienie wszystkich modeli

---

## Finalna tabela porównawcza wszystkich modeli

Na końcu notebooka zestawiamy wszystkie modele w jednej tabeli. Ponieważ modele rozwiązują różne zadania (regresja vs klasyfikacja), nie porównujemy ich tymi samymi metrykami — opisujemy je równolegle:

| Model | Zadanie | RMSE | MAE | R² | Accuracy | F1 | AUC |
|-------|---------|------|-----|----|----------|----|-----|
| Baseline | Regresja | ~1.12 | ~0.93 | 0.00 | — | — | — |
| Linear Regression | Regresja | ? | ? | ? | — | — | — |
| Ridge | Regresja | ? | ? | ? | — | — | — |
| Lasso | Regresja | ? | ? | ? | — | — | — |
| Logistic Regression | Klasyfikacja | — | — | — | ? | ? | ? |

Wartości "?" uzupełniasz wynikami z uruchomienia notebooka.

---

*Dokumentacja wygenerowana dla notebooka 03_model.ipynb*
*Projekt: Wykorzystanie regresji liniowej w procesie predykcyjnym doboru treści audiowizualnych*
