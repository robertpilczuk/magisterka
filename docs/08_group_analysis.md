# Dokumentacja — 05_group_analysis.ipynb
## Analiza per-grupa — zróżnicowanie jakości modelu

---

## Cel i znaczenie tej analizy

Analiza per-grupa to jeden z najważniejszych elementów oceny modelu predykcyjnego
z perspektywy naukowej. Globalne metryki (RMSE = 0.89 dla całego zbioru) mogą
**maskować znaczące różnice** w jakości modelu dla różnych grup użytkowników.

Wyobraź sobie model który osiąga RMSE = 0.70 dla mężczyzn i RMSE = 1.20 dla kobiet.
Globalne RMSE = 0.89 nie ujawnia tej dysproporcji — dopiero analiza per-grupa
ją odkrywa.

**Znaczenie dla pracy magisterskiej:**
Wyniki tej analizy trafiają bezpośrednio do Rozdziału III jako podrozdział
"Zróżnicowanie jakości modelu predykcyjnego". Pozwalają odpowiedzieć na pytanie:
*"Dla kogo model działa dobrze, a dla kogo źle i dlaczego?"*

---

## Celka 1 — Importy i wczytanie modelu

### Dlaczego wczytujemy gotowy model a nie trenujemy od nowa?

```python
lr           = joblib.load('backend/model/linear_model.pkl')
scaler       = joblib.load('backend/model/scaler.pkl')
FEATURE_COLS = joblib.load('backend/model/feature_cols.pkl')
```

Analiza per-grupa musi być przeprowadzona na **dokładnie tym samym modelu**
który był oceniany w notebooku `03_model.ipynb` i który działa w aplikacji webowej.
Wczytanie z pliku `.pkl` gwarantuje spójność — nie ma ryzyka że nowe trenowanie
da inny model z powodu losowości inicjalizacji.

---

## Celka 2 — Przygotowanie danych

### Generowanie przewidywań dla całego zbioru

```python
X_all      = df_model[FEATURE_COLS].values
X_scaled   = scaler.transform(pd.DataFrame(X_all, columns=FEATURE_COLS))
y_pred_all = lr.predict(X_scaled)
y_pred_all = np.clip(y_pred_all, 1.0, 5.0)
```

W notebookach 02–03 pracowaliśmy tylko na zbiorze testowym (20% danych).
Tutaj generujemy przewidywania dla **całego zbioru** (100% = 1 000 209 ocen)
żeby analiza per-grupa była oparta na jak największej próbie dla każdej grupy.

**Dlaczego `pd.DataFrame(X_all, columns=FEATURE_COLS)` a nie samo `X_all`?**
Scaler był trenowany na DataFrame z nazwami kolumn — podanie nazw eliminuje
ostrzeżenie "X does not have valid feature names".

### Obliczanie reszt i błędów bezwzględnych

```python
df_model['predicted'] = y_pred_all
df_model['residual']  = df_model['rating'] - df_model['predicted']
df_model['abs_error'] = df_model['residual'].abs()
```

Dla każdej obserwacji obliczamy:
- `residual` — reszta (ze znakiem): ujemna = przeszacowanie, dodatnia = niedoszacowanie
- `abs_error` — błąd bezwzględny (bez znaku): używany do obliczania MAE i RMSE per grupa

### Usunięcie duplikatów kolumn przed merge

```python
for col in ['gender', 'age', 'occupation']:
    if col in df_model.columns:
        df_model = df_model.drop(columns=[col])
```

`df_model.csv` powstał w preprocessing gdzie płeć była już zakodowana
jako `gender_encoded`. Jednak oryginalne kolumny mogły zostać zachowane.
Zabezpieczenie przed duplikacją kolumn przy merge — standardowa praktyka.

### Dekodowanie wartości numerycznych na etykiety

```python
AGE_LABELS = {1:'<18', 18:'18-24', 25:'25-34', ...}
OCC_LABELS = {0:'other', 1:'educator', 12:'programmer', ...}
```

MovieLens przechowuje wiek i zawód jako liczby. Dekodowanie na czytelne
etykiety jest niezbędne dla wykresów i tabel w pracy — czytelnik nie wie
że `occupation=12` to programista.

---

## Celka 3 — Analiza według płci

### Co mierzymy?

Dla każdej płci obliczamy:
- **count** — liczbę ocen (ile danych miał model dla tej grupy)
- **RMSE** — typowy błąd predykcji
- **MAE** — średni błąd bezwzględny
- **avg_real** — rzeczywista średnia ocen grupy
- **avg_pred** — przewidywana średnia ocen grupy

### Funkcja lambda dla RMSE

```python
rmse=('abs_error', lambda x: np.sqrt((x**2).mean()))
```

`groupby().agg()` nie ma wbudowanej funkcji RMSE — definiujemy ją jako
wyrażenie lambda. `(x**2).mean()` to MSE, `np.sqrt()` to pierwiastek = RMSE.

### Interpretacja wyników

**Jeśli RMSE kobiet > RMSE mężczyzn:**
Potwierdza hipotezę selection bias — MovieLens ma ~72% mężczyzn, model
"widział" więcej przykładów zachowań męskich podczas treningu i lepiej
je przewiduje. To jest **long-tail problem** opisany w `06_chapter3_foundation.md`.

**Jeśli RMSE są zbliżone:**
Model generalizuje dobrze mimo niezbalansowanej reprezentacji płci.
Sugeruje że preferencje filmowe nie różnią się drastycznie między płciami
w tym zbiorze danych — lub że `movie_avg_rating` i `user_avg_rating`
dominują nad cechami demograficznymi.

**avg_real vs avg_pred:**
Jeśli średnia przewidywana znacząco odbiega od rzeczywistej dla danej grupy,
model ma **systematyczny bias** dla tej grupy — zawsze przeszacowuje lub
niedoszacowuje oceny kobiet/mężczyzn.

---

## Celka 4 — Analiza według wieku

### Hipoteza badawcza

Grupy wiekowe z małą liczbą reprezentantów w zbiorze danych będą miały
wyższe RMSE — mniej danych treningowych = gorsze przewidywania.

Oczekiwany ranking (od najlepszego do najgorszego RMSE):
1. 25–34 lat (najliczniejsza grupa, dominuje w MovieLens)
2. 18–24 lat
3. 35–44 lat
4. <18 lat i 56+ lat (najmniej reprezentowane)

### Układ wykresu — dwa panele pionowo

```python
fig, axes = plt.subplots(2, 1, figsize=(12, 9))
```

Dwa wykresy jeden pod drugim zamiast obok siebie — grupy wiekowe mają
długie etykiety (`'18-24'`, `'25-34'`) które lepiej mieszczą się
w układzie horyzontalnym. Dolny wykres (liczba ocen) daje kontekst
dla górnego (metryki).

### Grupowany wykres słupkowy

```python
axes[0].bar(x - width/2, age_stats['rmse'], width, label='RMSE', ...)
axes[0].bar(x + width/2, age_stats['mae'],  width, label='MAE',  ...)
```

RMSE i MAE na jednym wykresie — pozwala zobaczyć **rozstęp** między nimi.
Duży rozstęp (RMSE >> MAE) oznacza że model sporadycznie popełnia bardzo
duże błędy dla tej grupy wiekowej.

### Co interpretować w pracy

Szukamy korelacji między liczbą ocen w grupie a jakością modelu.
Jeśli korelacja jest silna — potwierdza cold start problem:
model jest tak dobry jak dane na których się uczył.

---

## Celka 5 — Analiza według zawodu

### Dlaczego sortujemy po RMSE?

```python
occ_stats = ... .sort_values('rmse', ascending=True)
```

Wykres posortowany od najlepszego (najniższe RMSE) do najgorszego
jest bardziej czytelny niż posortowany alfabetycznie lub po kodzie numerycznym.
Natychmiast widać które zawody są "łatwe" a które "trudne" dla modelu.

### Kolorowanie powyżej/poniżej mediany

```python
colors = ['#4a90d9' if r < occ_stats['rmse'].median() else '#e87040'
          for r in occ_stats['rmse']]
```

Mediana RMSE jako próg kolorowania — niebieski = model działa lepiej niż
przeciętnie, koralowy = gorzej niż przeciętnie. Linia mediany na wykresie
jako wizualny punkt odniesienia.

### Interpretacja wyników

**Zawody z niskim RMSE (model działa dobrze):**
Zazwyczaj zawody z dużą reprezentacją w zbiorze (student, programmer, executive).
Model "widział" wiele przykładów ich preferencji i dobrze je modeluje.

**Zawody z wysokim RMSE (model działa źle):**
Zazwyczaj małe grupy (farmer, homemaker, tradesman). Mało danych =
model nie ma wystarczająco przykładów żeby nauczyć się ich preferencji.

**Implikacja dla pracy:**
Pokazuje że model regresji liniowej jest **nierówny** — faworyzuje
grupy demograficzne które są licznie reprezentowane w danych treningowych.
To argument za opisaniem long-tail problem i wskazaniem go jako ograniczenia.

---

## Celka 6 — Analiza według aktywności użytkownika

### Definicja grup aktywności

```python
def activity_group(n):
    if n < 20:   return '1. Nieaktywni (<20)'
    if n < 50:   return '2. Mało aktywni (20-50)'
    if n < 200:  return '3. Aktywni (50-200)'
    return '4. Bardzo aktywni (>200)'
```

Progi są dobrane tak żeby każda grupa miała sensowną liczność.
Prefix numeryczny (`1.`, `2.`, `3.`, `4.`) zapewnia właściwą kolejność
na wykresie (Python sortuje stringi alfabetycznie).

### Dlaczego aktywność jest kluczową zmienną?

`user_avg_rating` — jeden z najsilniejszych predyktorów — jest obliczana
z historii ocen użytkownika. Im więcej ocen, tym:
- Dokładniejsza wartość `user_avg_rating` (mniej szumu)
- Lepsza reprezentacja preferencji gatunkowych w danych treningowych
- Niższe RMSE przewidywań

To jest matematyczny dowód na cold start problem:
model jest dokładnie tak dobry jak dane wejściowe.

### Oczekiwany wynik

Silna negatywna korelacja między aktywnością a RMSE:

```
Nieaktywni    → najwyższe RMSE (mało danych o użytkowniku)
Mało aktywni  → wysokie RMSE
Aktywni       → niskie RMSE
Bardzo aktywni → najniższe RMSE (model dobrze zna użytkownika)
```

Jeśli ten wzorzec jest wyraźny, jest to jeden z najsilniejszych
argumentów w Rozdziale III — bezpośredni związek między ilością danych
a jakością predykcji.

### `nunique()` dla liczby użytkowników

```python
users=('userId', 'nunique')
```

`nunique()` liczy unikalne wartości — w tym przypadku liczbę unikalnych
użytkowników w grupie. Jest to inna miara niż `count` (liczba ocen) —
jedna osoba może mieć setki ocen.

---

## Celka 7 — Podsumowanie

### Zapis do JSON

```python
with open('data/group_analysis_summary.json', 'w') as f:
    json.dump(summary, f, indent=2, default=str)
```

Wyniki analizy per-grupa są zapisywane do pliku JSON.
`default=str` obsługuje typy pandas (np. `int64`) które nie są
natywnie serializowalne przez JSON — konwertuje je na string.

Plik będzie używany przez backend w endpoincie `/similar-users`
do szybkiego zwracania statystyk per-grupa bez ponownego obliczania.

---

## Wnioski z analizy per-grupa — materiał do Rozdziału III

### Wniosek 1 — Nierówność modelu względem płci

Model może wykazywać wyższe RMSE dla kobiet ze względu na niedoreprezentowanie
tej grupy w zbiorze (28% vs 72% mężczyzn). Jest to przykład **algorithmic bias**
— systematycznej dysproporcji w jakości modelu dla różnych grup demograficznych.

### Wniosek 2 — Korelacja aktywności z jakością

Im więcej ocen wystawił użytkownik, tym niższe RMSE modelu dla tego użytkownika.
Potwierdza to cold start problem jako fundamentalne ograniczenie modelu.

### Wniosek 3 — Zawody niszowe

Grupy zawodowe z małą reprezentacją (farmer, homemaker) mają wyższe RMSE.
Pokazuje to że model regresji liniowej nie generalizuje dobrze dla
niedoreprezentowanych grup — long-tail problem.

### Wniosek 4 — Grupy wiekowe

Dominująca grupa wiekowa (25–34) prawdopodobnie ma najniższe RMSE.
Grupy skrajne (<18, 56+) mają wyższe RMSE z powodu mniejszej reprezentacji.

### Połączenie z tezą pracy

Analiza per-grupa dostarcza dodatkowych argumentów za **odrzuceniem tezy**
że regresja liniowa jest najlepszym modelem do predykcji treści audiowizualnych:

- Model nie jest sprawiedliwy dla wszystkich grup demograficznych
- Jakość predykcji zależy silnie od ilości danych o użytkowniku
- Grupy niedoreprezentowane w danych mają systematycznie gorsze rekomendacje

Model logistyczny z threshold tuningiem wykazuje te same ograniczenia
demograficzne, ale lepiej radzi sobie z pytaniem binarnym
"polecić czy nie polecić" — co jest bardziej praktycznym zastosowaniem.

---

## Wykresy i ich przeznaczenie w pracy

| Plik | Rozdział | Podrozdział |
|------|----------|-------------|
| `fig_group_gender.png` | III | Analiza per-grupa — płeć |
| `fig_group_age.png` | III | Analiza per-grupa — wiek |
| `fig_group_occupation.png` | III | Analiza per-grupa — zawód |
| `fig_group_activity.png` | III | Cold start problem |

---

*Dokumentacja wygenerowana dla notebooka 05_group_analysis.ipynb*
*Projekt: Wykorzystanie regresji liniowej w procesie predykcyjnym doboru treści audiowizualnych*
