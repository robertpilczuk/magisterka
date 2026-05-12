# Dokumentacja — 04_visualizations.ipynb
## Wizualizacje końcowe do pracy magisterskiej

---

## Cel i rola tego notebooka w projekcie

Notebook `04_visualizations.ipynb` jest ostatnim etapem części analitycznej projektu.
Jego jedynym zadaniem jest **generowanie wykresów gotowych do wklejenia w pracę magisterską**.

W przeciwieństwie do notebooków 01–03, gdzie wykresy były produktem ubocznym analizy,
tutaj wykresy są celem samym w sobie — są tworzone z myślą o publikacji, z odpowiednią
rozdzielczością, tytułami, opisami osi i legendami.

Wszystkie modele i dane są wczytywane z plików — nie trenujemy modeli ponownie.
To gwarantuje że wykresy odpowiadają dokładnie tym samym modelom które były oceniane
w notebooku `03_model.ipynb`.

---

## Celka 1 — Importy, konfiguracja i wczytanie danych

### Konfiguracja matplotlib

```python
plt.rcParams['figure.dpi'] = 150
plt.rcParams['savefig.bbox'] = 'tight'
```

**`figure.dpi = 150`** — DPI (Dots Per Inch) to rozdzielczość wykresu.
Standardowy ekran używa 72–96 DPI. Ustawienie 150 DPI sprawia że wykresy
są wyraźne zarówno na ekranie jak i po wydrukowaniu w pracy.
Wyższa wartość (np. 300) byłaby lepsza dla druku ale generuje większe pliki.

**`savefig.bbox = 'tight'`** — przy zapisie wykresu automatycznie przycina
białe marginesy. Bez tego wykresy miałyby duże białe obszary które wyglądają
nieprofesjonalnie w pracy.

**`sns.set_theme(style="whitegrid", font_scale=1.1)`** — ustawia jednolity
styl dla wszystkich wykresów:
- `whitegrid` — białe tło z delikatną siatką (czytelne, profesjonalne)
- `font_scale=1.1` — czcionki nieco większe niż domyślne, lepiej czytelne w pracy

### Wczytywanie modeli

```python
lr      = joblib.load('backend/model/linear_model.pkl')
ridge   = joblib.load('backend/model/ridge_model.pkl')
lasso   = joblib.load('backend/model/lasso_model.pkl')
log_reg = joblib.load('backend/model/logistic_model.pkl')
```

Wczytujemy **dokładnie te same obiekty** które były trenowane w `03_model.ipynb`
i używane w aplikacji webowej. Serializacja przez `joblib` gwarantuje że
współczynniki β i wszystkie parametry są identyczne.

### Wczytywanie danych testowych

```python
X_test  = np.load('data/X_test.npy')
y_test  = np.load('data/y_test.npy')
```

Używamy **tylko zbioru testowego** do generowania wykresów — tych samych 200k+
obserwacji na których mierzono metryki w `03_model.ipynb`. To zapewnia spójność
między metrykami w tekście pracy a wizualizacjami.

### Generowanie przewidywań

```python
y_pred_lr    = lr.predict(X_test)
y_pred_ridge = ridge.predict(X_test)
y_pred_lasso = lasso.predict(X_test)
```

Przewidywania są generowane raz i używane wielokrotnie w różnych wykresach.
Unikamy zbędnych obliczeń — każde `.predict()` na 200k+ obserwacjach zajmuje
ułamek sekundy, ale dobra praktyka to obliczać raz.

### Binaryzacja dla modelu logistycznego

```python
y_test_binary    = (y_test >= 4).astype(int)
y_pred_log_proba = log_reg.predict_proba(X_test)[:, 1]
```

`predict_proba()` zwraca macierz dwóch kolumn:
- kolumna 0: prawdopodobieństwo klasy 0 ("nie polubi")
- kolumna 1: prawdopodobieństwo klasy 1 ("polubi")

`[:, 1]` wybiera drugą kolumnę — prawdopodobieństwo że użytkownik polubi film.
To wartość którą używamy do krzywej ROC i histogramu prawdopodobieństw.

---

## Wykres 1 — Porównanie modeli (fig1_model_comparison.png)

### Co pokazuje ten wykres?

Trzy wykresy słupkowe zestawiające cztery modele według metryk RMSE, MAE i R².
To główny wykres porównawczy pracy — trafia do Rozdziału III.

### Konfiguracja kolorów

```python
colors = ['#aaaaaa', '#4a90d9', '#e87040', '#2ecc71']
```

- **Szary (#aaaaaa)** — Baseline. Celowo stonowany, żeby nie odwracał uwagi
- **Niebieski (#4a90d9)** — Linear Regression. Główny model pracy, wyróżniony
- **Koralowy (#e87040)** — Ridge. Ciepły kolor, kontrastuje z niebieskim
- **Zielony (#2ecc71)** — Lasso. Trzeci wyróżniający się kolor

Kolory są dobrane tak żeby były czytelne zarówno na ekranie jak i po wydrukowaniu
w skali szarości (każdy ma inną jasność).

### Etykiety wartości nad słupkami

```python
ax.text(bar.get_x() + bar.get_width()/2,
        bar.get_height() + 0.003,
        f'{val:.4f}', ha='center', va='bottom', fontsize=9)
```

Każdy słupek ma wartość wypisaną nad sobą do 4 miejsc po przecinku.
`bar.get_x() + bar.get_width()/2` oblicza środek słupka na osi X.
`bar.get_height() + 0.003` stawia etykietę tuż nad słupkiem (0.003 = margines).

### Co interpretować w pracy

**Patrząc na RMSE i MAE:** Im niższe tym lepsze. Szukamy że Linear Regression,
Ridge i Lasso są wyraźnie niższe od Baseline — to dowód że model czegoś się nauczył.

**Patrząc na R²:** Im wyższe tym lepsze. Baseline ma 0.00 z definicji.
Różnica między 0.00 a wynikiem modelu to "wartość dodana" przez cechy.

**Porównując Ridge i Lasso do Linear Regression:** Jeśli są zbliżone
(różnica < 0.005), regularyzacja nie była potrzebna. Jeśli Ridge/Lasso
są wyraźnie lepsze — model cierpiał na overfitting.

---

## Wykres 2 — Rzeczywiste vs przewidywane (fig2_predicted_vs_actual.png)

### Co pokazuje ten wykres?

Scatter plot (wykres rozproszenia) gdzie każdy punkt to jedna ocena z zestawu testowego.
Trzy wykresy obok siebie — po jednym dla każdego modelu regresji.

### Próbkowanie danych

```python
sample = np.random.RandomState(42).choice(len(y_test), 3000, replace=False)
```

Wykreślanie 200k+ punktów byłoby:
- Nieczytelne (punkty nakładają się całkowicie)
- Wolne obliczeniowo
- Plik PNG byłby bardzo duży

Losujemy 3000 reprezentatywnych punktów. `RandomState(42)` gwarantuje
że za każdym uruchomieniem jest ta sama próbka — reprodukowalność.
`replace=False` — bez powtórzeń (każdy punkt co najwyżej raz).

### Linia idealna

```python
ax.plot([1, 5], [1, 5], 'r--', linewidth=1.5, label='Idealne przewidywanie')
```

Czerwona linia przerywana y=x to "ideał" — gdyby model był doskonały,
wszystkie punkty leżałyby na tej linii. Odchylenia od linii to błędy modelu.

### RMSE w tytule wykresu

```python
rmse = np.sqrt(mean_squared_error(y_test, preds))
ax.set_title(f'{name}\nRMSE = {rmse:.4f}', fontweight='bold')
```

Każdy podwykres ma RMSE w tytule — bezpośrednie połączenie między
wizualizacją a metryką. Czytelnik pracy widzi jednocześnie jak wygląda
rozproszenie i jaka jest jego miara liczbowa.

### Co interpretować w pracy

**Skupienie punktów wokół środka (2.5–4.5):** Model "boi się" skrajnych
przewidywań — rzadko przewiduje 1.0 lub 5.0. To **regresja do średniej**,
matematyczna właściwość OLS.

**Asymetria:** Więcej punktów powyżej linii idealnej dla niskich ocen
(model przeszacowuje) i poniżej dla wysokich (model niedoszacowuje).
To efekt selection bias w danych — model widział więcej przykładów
wysokich ocen i "nauczył się" że większość filmów jest dobra.

**Porównanie trzech wykresów:** Jeśli wyglądają identycznie, regularyzacja
nie zmieniła zachowania modelu. Subtelne różnice w skupieniu punktów
sugerują wpływ regularyzacji.

---

## Wykres 3 — Analiza reszt (fig3_residuals.png)

### Co to są reszty i dlaczego je analizujemy?

**Reszta** = ocena rzeczywista − ocena przewidywana.

Analiza reszt to **standardowy wymóg** przy ocenie modelu regresji liniowej.
Pozwala sprawdzić czy założenia OLS są spełnione i zidentyfikować wzorce
które model przeoczył.

### Lewy wykres — histogram reszt

```python
axes[0].hist(residuals, bins=80, color='#4a90d9', edgecolor='white', linewidth=0.3)
axes[0].axvline(0, color='red', linestyle='--', linewidth=1.5, label='Zero')
axes[0].axvline(residuals.mean(), color='orange', linestyle='-',
                linewidth=1.5, label=f'Średnia reszt ({residuals.mean():.3f})')
```

**Dwie linie pionowe:**
- Czerwona przerywana: zero — gdyby model był idealnie skalibrowany,
  reszty byłyby symetryczne względem tej linii
- Pomarańczowa ciągła: rzeczywista średnia reszt — jeśli jest blisko zera,
  model nie ma systematycznego przesunięcia (biasu)

**80 przedziałów (bins=80):** Drobniejszy podział niż domyślny (10) daje
lepszy obraz kształtu rozkładu przy dużej liczbie obserwacji.

**Statystyki w ramce:**
```python
stats_text = (f'Średnia: {residuals.mean():.4f}\n'
              f'Std: {residuals.std():.4f}\n'
              f'Min: {residuals.min():.2f}\n'
              f'Max: {residuals.max():.2f}')
```

Ramka ze statystykami w rogu wykresu eliminuje potrzebę oddzielnej tabeli
w pracy — wszystkie kluczowe liczby są na jednym obrazku.

**Co obserwujemy i jak interpretujemy:**

- **Rozkład zbliżony do normalnego** → spełnione założenie OLS o normalności reszt
- **Skośność lewa** (więcej dużych reszt dodatnich) → model częściej niedoszacowuje
  niż przeszacowuje — typowe dla danych z selection biasem
- **Grube ogony** (kurtoza > 3) → model sporadycznie popełnia bardzo duże błędy,
  częściej niż sugerowałby rozkład normalny

### Prawy wykres — reszty vs przewidywane wartości

```python
axes[1].scatter(y_pred_lr[sample], residuals[sample], alpha=0.15, s=8, color='#4a90d9')
axes[1].axhline(0, color='red', linestyle='--', linewidth=1.5)
```

**Co powinniśmy zobaczyć w idealnym modelu:**
Punkty równomiernie i losowo rozłożone wokół poziomej czerwonej linii y=0.
Brak jakiegokolwiek wzorca — "chmura szumu".

**Co faktycznie obserwujemy i jak interpretujemy:**

- **Wzorzec lejka (heteroskedastyczność):** Reszty są większe dla skrajnych
  wartości przewidywanych. Dla przewidywań ~2.0 rozrzut reszt jest większy
  niż dla ~4.0. Wyjaśnienie: filmy z niską przewidywaną oceną to często
  filmy niszowe z małą liczbą ocen — bardziej "losowe" i trudniejsze do
  przewidzenia.

- **Wzorzec horyzontalnych pasm:** Reszty skupiają się wokół wartości
  całkowitych (0, ±1, ±2). Wyjaśnienie: rzeczywiste oceny są dyskretne
  (1, 2, 3, 4, 5) a przewidywane ciągłe — mechanicznie tworzy to
  "prążkowany" wzorzec który nie jest problemem modelu.

- **Asymetria powyżej/poniżej zera:** Więcej punktów powyżej linii
  dla niskich przewidywań, więcej poniżej dla wysokich — potwierdza
  regresję do średniej opisaną wyżej.

### Znaczenie dla pracy magisterskiej

Analiza reszt to materiał na **podrozdział "Ograniczenia modelu"** w Rozdziale III.
Nawet jeśli wyniki nie są idealne (a nie będą — to dane o preferencjach ludzkich),
identyfikacja i opisanie tych wzorców jest wartościowe naukowo. Pokazuje
świadomość metodologiczną autora.

---

## Wykres 4 — Współczynniki regresji (fig4_coefficients.png)

### Co pokazuje ten wykres?

Poziomy wykres słupkowy (barh) przedstawiający wartości współczynników β
dla 20 cech o największym wpływie na przewidywaną ocenę.

### Wybór top 20 cech

```python
coef_df['abs'] = coef_df['coefficient'].abs()
coef_df = coef_df.nlargest(20, 'abs').sort_values('coefficient')
```

Sortujemy po **wartości bezwzględnej** współczynnika — interesują nas cechy
o największym wpływie niezależnie od kierunku (dodatni czy ujemny).
Następnie sortujemy po wartości dla czytelności wykresu (od najbardziej
ujemnego do najbardziej dodatniego).

Dlaczego top 20 a nie wszystkie ~47? Pełny wykres byłby nieczytelny.
Top 20 pokazuje najważniejsze zależności bez "szumu" nieistotnych cech.

### Kolorowanie słupków

```python
colors = ['#e87040' if c < 0 else '#4a90d9' for c in coef_df['coefficient']]
```

- **Niebieski** — współczynnik dodatni → cecha zwiększa przewidywaną ocenę
- **Koralowy** — współczynnik ujemny → cecha zmniejsza przewidywaną ocenę

Kolorowanie jest kluczowe dla interpretacji — bez niego trzeba by czytać
wartości przy każdym słupku żeby ustalić kierunek wpływu.

### Etykiety wartości przy słupkach

```python
ax.text(val + (0.002 if val >= 0 else -0.002),
        bar.get_y() + bar.get_height()/2,
        f'{val:.3f}',
        ha='left' if val >= 0 else 'right')
```

Etykiety pojawiają się po prawej stronie słupków dodatnich i po lewej
stronie słupków ujemnych — zawsze "od strony" słupka, nie zasłaniają go.

### Co interpretować w pracy

**Oczekiwana kolejność według literatury:**

1. `movie_avg_rating` — zazwyczaj największy współczynnik dodatni.
   Interpretacja: popularne filmy są przewidywane jako lepsze dla każdego użytkownika.
   To **item bias** — najpotężniejszy sygnał w danych.

2. `user_avg_rating` — duży współczynnik dodatni.
   Interpretacja: łagodni użytkownicy (wysoka średnia) dostają wyższe przewidywania.
   To **user bias** — korekta na "wymagającość" użytkownika.

3. **Gatunki z dodatnimi współczynnikami** — gatunki które demografika
   MovieLens (głównie młodzi mężczyźni) ocenia powyżej średniej.

4. **Gatunki z ujemnymi współczynnikami** — gatunki oceniane poniżej średniej
   przez typowego użytkownika MovieLens.

5. `movie_rating_count` — zazwyczaj mały ale dodatni.
   Interpretacja: popularne filmy (wiele ocen) mają bardziej wiarygodną
   i zazwyczaj wyższą średnią.

**Cechy demograficzne (wiek, płeć, zawód):** Zazwyczaj małe współczynniki.
To potwierdza hipotezę że sama demografia słabo przewiduje preferencje
filmowe — ważniejsza jest historia ocen użytkownika (`user_avg_rating`).

---

## Wykres 5 — Krzywa ROC (fig5_roc_curve.png)

### Składowe wykresu

Wykres składa się z dwóch paneli:
1. **Krzywa ROC** — główna wizualizacja jakości klasyfikatora
2. **Rozkład prawdopodobieństw** — pomocnicza wizualizacja

### Lewy panel — Krzywa ROC

```python
fpr, tpr, thresholds = roc_curve(y_test_binary, y_pred_log_proba)
roc_auc = auc(fpr, tpr)
```

**FPR (False Positive Rate)** = odsetek filmów których użytkownik nie polubił,
a model błędnie przewidział że polubi. Im niższy tym lepiej.

**TPR (True Positive Rate / Recall / Czułość)** = odsetek filmów które użytkownik
polubił, które model poprawnie zidentyfikował. Im wyższy tym lepiej.

**Jak czytać krzywą ROC:**
- Idealna krzywa: idzie pionowo w górę po lewej krawędzi, potem poziomo w prawo.
  Osiąga punkt (0, 1) — 0% false positives, 100% true positives.
- Linia czerwona przerywana: model losowy. Każdy punkt na tej linii
  odpowiada "rzutowi monetą" przy danym progu.
- Im bardziej krzywa jest "wypukła" w lewy górny róg, tym lepszy model.

**Wypełnienie pod krzywą:**
```python
axes[0].fill_between(fpr, tpr, alpha=0.1, color='#4a90d9')
```
Lekkie wypełnienie pod krzywą wizualnie akcentuje pole AUC.

**Interpretacja AUC:**
- AUC = 0.50 → model losowy
- AUC = 0.70 → dobry model
- AUC = 0.80 → bardzo dobry model
- AUC = 1.00 → model idealny (niemożliwy w praktyce)

Dla MovieLens 1M z podstawową regresją logistyczną oczekujemy AUC ~0.75–0.82.

### Prawy panel — Rozkład prawdopodobieństw

```python
axes[1].hist(y_pred_log_proba[y_test_binary == 0], bins=50,
             alpha=0.6, color='#e87040', label='Nie polubi (0)', density=True)
axes[1].hist(y_pred_log_proba[y_test_binary == 1], bins=50,
             alpha=0.6, color='#4a90d9', label='Polubi (1)', density=True)
```

Dwa histogramy na jednym wykresie: rozkład przewidywanych prawdopodobieństw
dla filmów które użytkownik polubił (niebieski) i nie polubił (koralowy).

`density=True` — normalizuje oba histogramy do gęstości (suma = 1),
co pozwala porównywać je mimo różnej liczności klas.

**Co obserwujemy:**
- Idealny model: dwa wyraźnie rozdzielone szczyty — koralowy przy 0, niebieski przy 1
- Rzeczywistość: dwa szczyty nakładają się — model nie jest pewny dla "granicznych" filmów
- Pionowa linia przy 0.5: domyślny próg decyzyjny. Filmy po prawej od linii = "polubi"

**Co interpretować w pracy:**
Im mniejsze nakładanie się rozkładów, tym model lepiej separuje klasy.
Szerokość "strefy nakładania" odpowiada zakresowi gdzie model jest niepewny
i popełnia błędy klasyfikacji. Warto to opisać jako ograniczenie.

---

## Wykres 6 — Macierz korelacji (fig6_correlation_matrix.png)

### Co to jest macierz korelacji?

**Korelacja** (współczynnik Pearsona) mierzy siłę i kierunek liniowej
zależności między dwiema zmiennymi. Przyjmuje wartości od -1 do +1:

| Wartość | Interpretacja |
|---------|---------------|
| +1.0 | Idealna korelacja dodatnia |
| +0.7 do +1.0 | Silna korelacja dodatnia |
| +0.3 do +0.7 | Umiarkowana korelacja dodatnia |
| -0.3 do +0.3 | Słaba lub brak korelacji |
| -0.7 do -0.3 | Umiarkowana korelacja ujemna |
| -1.0 | Idealna korelacja ujemna |

**Macierz korelacji** to tabela gdzie każda komórka pokazuje korelację
między parą zmiennych. Przekątna zawsze ma wartość 1.0 (zmienna koreluje
idealnie sama z sobą).

### Konfiguracja mapy ciepła

```python
sns.heatmap(corr, annot=True, fmt='.3f', cmap='RdBu_r',
            center=0, vmin=-1, vmax=1, linewidths=0.5)
```

- `annot=True` — wypisuje wartości liczbowe w każdej komórce
- `fmt='.3f'` — format: 3 miejsca po przecinku
- `cmap='RdBu_r'` — paleta kolorów: czerwony (ujemna) → biały (zero) → niebieski (dodatnia)
- `center=0` — biały kolor odpowiada dokładnie wartości 0
- `vmin=-1, vmax=1` — skala od -1 do +1 (pełny zakres korelacji)
- `linewidths=0.5` — delikatne linie między komórkami dla czytelności

### Dlaczego tylko kluczowe cechy a nie wszystkie 47?

Macierz korelacji dla 47 cech miałaby 47×47 = 2209 komórek — nieczytelna.
Wybieramy 7 kluczowych zmiennych numerycznych które mają największe znaczenie
interpretacyjne:

```python
key_cols = ['rating', 'age', 'gender_encoded', 'year',
            'user_avg_rating', 'movie_avg_rating', 'movie_rating_count']
```

### Co obserwujemy i jak interpretujemy

**`movie_avg_rating` vs `rating`:** Zazwyczaj najwyższa korelacja dodatnia
(~0.3–0.4). Potwierdza że filmy dobrze oceniane przez ogół są też dobrze
oceniane przez konkretnego użytkownika. Uzasadnia użycie tej cechy w modelu.

**`user_avg_rating` vs `rating`:** Duża korelacja dodatnia (~0.3–0.5).
Użytkownicy którzy zazwyczaj oceniają wysoko, oceniają wysoko też konkretny film.
To **user bias** — najsilniejszy per-user predyktor.

**`age` vs `rating`:** Zazwyczaj słaba korelacja (~0.0–0.1).
Wiek słabo przewiduje ocenę — potwierdza że sama demografia nie wystarczy.

**`year` vs `rating`:** Słaba dodatnia korelacja — filmy starsze mogą być
oceniane nieco wyżej (efekt "przetrwania" — słabe stare filmy są zapomniane).

**`movie_rating_count` vs `movie_avg_rating`:** Zazwyczaj umiarkowana
korelacja dodatnia — popularne filmy mają tendencję do wyższych ocen
(popularność bias opisany w dokumentacji Rozdziału III).

### Multikolinearność

Jeśli dwie cechy są silnie skorelowane między sobą (|r| > 0.7),
może wystąpić **multikolinearność** — problem dla regresji liniowej
który sprawia że współczynniki β stają się niestabilne.

Jeśli na wykresie widać takie pary, warto to opisać w pracy jako
potencjalne ograniczenie. Regularyzacja Ridge zmniejsza wpływ
multikolinearności — to dodatkowe uzasadnienie dla jej użycia.

---

## Celka 8 — Podsumowanie i lista plików

```python
import glob
figures = sorted(glob.glob('notebooks/fig*.png'))
```

`glob.glob` wyszukuje pliki pasujące do wzorca — tutaj wszystkie pliki
zaczynające się od `fig` w folderze `notebooks/`. Automatyczne listowanie
eliminuje ryzyko przeoczenia wygenerowanego pliku.

### Lista wygenerowanych plików i ich przeznaczenie

| Plik | Rozdział pracy | Cel |
|------|----------------|-----|
| `fig1_model_comparison.png` | Rozdział III, sekcja wyników | Główne porównanie modeli |
| `fig2_predicted_vs_actual.png` | Rozdział III, interpretacja | Wizualizacja dokładności |
| `fig3_residuals.png` | Rozdział III, ograniczenia | Analiza założeń regresji |
| `fig4_coefficients.png` | Rozdział III, zależności | Ważność cech i ich kierunek |
| `fig5_roc_curve.png` | Rozdział III, model logistyczny | Jakość klasyfikatora |
| `fig6_correlation_matrix.png` | Rozdział II lub III | Eksploracja zależności |

---

## Wskazówki do opisywania wykresów w pracy

### Jak podpisywać wykresy w Word/LaTeX

Każdy wykres w pracy magisterskiej powinien mieć:
- **Numer rysunku:** np. "Rysunek 3.1"
- **Tytuł:** opisowy, np. "Porównanie modeli predykcyjnych według metryk RMSE, MAE i R²"
- **Źródło:** "Opracowanie własne na podstawie zbioru danych MovieLens 1M"

### Jak się do nich odwoływać w tekście

Nie wstawiaj wykresu bez odwołania w tekście. Przykładowe sformułowania:
- "Jak przedstawia Rysunek 3.1, model regresji liniowej osiągnął RMSE = X.XX,
   co stanowi poprawę o Y% względem baseline'u."
- "Analiza reszt (Rysunek 3.3) wykazuje lewostronną skośność rozkładu,
   co sugeruje systematyczne niedoszacowanie wysokich ocen."
- "Wartość AUC = X.XX (Rysunek 3.5) wskazuje na dobrą zdolność modelu
   logistycznego do rozróżniania między klasami."

### Kolejność wstawiania w Rozdziale III

Rekomendowana kolejność:
1. `fig1_model_comparison.png` — zacznij od liczb, pokaż że model bije baseline
2. `fig4_coefficients.png` — wyjaśnij które cechy są ważne i dlaczego
3. `fig2_predicted_vs_actual.png` — pokaż jak model przewiduje w praktyce
4. `fig3_residuals.png` — analiza założeń, ograniczenia
5. `fig5_roc_curve.png` — model alternatywny, porównanie podejść
6. `fig6_correlation_matrix.png` — uzupełnienie, zależności między zmiennymi

---

*Dokumentacja wygenerowana dla notebooka 04_visualizations.ipynb*
*Projekt: Wykorzystanie regresji liniowej w procesie predykcyjnym doboru treści audiowizualnych*
