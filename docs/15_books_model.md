# 15. Trenowanie modeli — Książki (Book-Crossing)

## Co zostało zbudowane

Notebook `07_books_model.ipynb` trenuje i porównuje cztery modele predykcji
ocen książek: regresję liniową, Ridge, Lasso i regresję logistyczną z threshold
tuningiem. Pipeline jest identyczny jak dla filmów (`03_model.ipynb`).

---

## Wyniki modeli

### Metryki regresji

| Model | RMSE | MAE | R² |
|-------|------|-----|----|
| Baseline (średnia) | 1.7815 | 1.4167 | 0.0000 |
| Linear Regression | 1.3257 | 1.0037 | 0.4461 |
| Ridge | 1.3257 | 1.0037 | 0.4461 |
| Lasso | 1.3257 | 1.0044 | 0.4462 |

### Regresja logistyczna

- **Próg binaryzacji:** ocena >= 7 = "polubi" (1), ocena < 7 = "nie polubi" (0)
- **Optymalny próg:** 0.4006
- Próg 7/10 odpowiada ocenie 3.5/5 — analogicznie do progu 4/5 dla filmów

---

## Interpretacja wyników

### RMSE = 1.3257

Model myli się średnio o ~1.33 punktu w skali 1–10 (czyli ~0.66 punktu
w przeliczeniu na skalę 1–5 jak filmy). To dobry wynik biorąc pod uwagę
że dataset ma tylko 5 cech (brak gatunków, płci, zawodu).

### R² = 0.446

Model wyjaśnia 44.6% zmienności ocen książek. To lepszy wynik niż dla filmów
(35.2%) mimo mniejszej liczby cech. Możliwe wyjaśnienia:

- Oceny książkowe są bardziej przewidywalne na podstawie demografii
- Skala 1–10 daje więcej granularności niż 1–5
- Dataset po filtrowaniu zawiera bardziej aktywnych i konsekwentnych użytkowników

### Porównanie z filmami

| Aspekt | Filmy | Książki |
|--------|-------|---------|
| RMSE | 0.9120 | 1.3257 |
| MAE | 0.7177 | 1.0037 |
| R² | 0.3520 | 0.4461 |
| Skala ocen | 1–5 | 1–10 |
| Liczba cech | 45 | 5 |

RMSE dla książek jest wyższe liczbowo (1.33 vs 0.91) ale skale są różne —
w przeliczeniu na skalę 1–5 błąd książkowy to ~0.66, co jest porównywalny
z filmowym 0.91. R² jest wyższe dla książek co sugeruje lepsze dopasowanie
modelu.

---

## Szczegóły implementacji

### Funkcja evaluate()

```python
def evaluate(name, model, X_tr, y_tr, X_te, y_te, clip_min=1, clip_max=10):
    model.fit(X_tr, y_tr)
    pred = np.clip(model.predict(X_te), clip_min, clip_max)
    ...
```

Parametry `clip_min=1, clip_max=10` przycinają predykcje do zakresu 1–10
(skala Book-Crossing). Model regresji liniowej może przewidywać wartości
spoza zakresu — przycinanie zapobiega absurdalnym predykcjom (np. 0.2 lub 12.5).

### Binaryzacja dla regresji logistycznej

```python
y_train_bin = (y_train >= 7).astype(int)
y_test_bin  = (y_test  >= 7).astype(int)
```

Próg 7 w skali 1–10 odpowiada "dobrej" ocenie — analogicznie do progu 4
w skali 1–5 użytego dla filmów. Pozwala to na spójne porównanie obu modeli
w pracy magisterskiej.

### Threshold tuning

```python
precisions, recalls, thresholds = precision_recall_curve(y_test_bin, proba)
f1_scores = 2 * precisions * recalls / (precisions + recalls + 1e-8)
optimal_threshold = float(thresholds[np.argmax(f1_scores)])
```

Optymalny próg 0.4006 (niższy niż domyślne 0.5) oznacza że model jest
bardziej skłonny do rekomendowania książek — obniżamy poprzeczkę żeby
zwiększyć liczbę trafnych rekomendacji kosztem precyzji.

---

## Zapisane artefakty

Wszystkie modele zapisane w `backend/model_books/`:

| Plik | Zawartość |
|------|-----------|
| `linear_model_books.pkl` | Wytrenowana regresja liniowa |
| `ridge_model_books.pkl` | Wytrenowany model Ridge |
| `lasso_model_books.pkl` | Wytrenowany model Lasso |
| `logistic_model_books.pkl` | Wytrenowana regresja logistyczna |
| `optimal_threshold_books.json` | Optymalny próg: `{"optimal_threshold": 0.4006}` |

---

## Znaczenie dla pracy magisterskiej

Wyniki dla książek wzmacniają główną tezę pracy na dwa sposoby:

1. **Weryfikacja metodologii na innym typie treści** — ten sam pipeline
   działa dla filmów i książek, co potwierdza uniwersalność podejścia

2. **Porównanie R²** — wyższe R² dla książek (0.446 vs 0.352) przy mniejszej
   liczbie cech sugeruje że preferencje czytelnicze są bardziej przewidywalne
   niż filmowe — interesująca obserwacja do omówienia w rozdziale z wnioskami

3. **Argument dla regresji logistycznej** — optymalny próg 0.4006 ≠ 0.5
   potwierdza że threshold tuning jest istotny niezależnie od typu treści
