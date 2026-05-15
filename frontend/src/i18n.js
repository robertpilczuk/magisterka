// ============================================================
// i18n.js — tłumaczenia PL/EN
// Użycie: t('nav.app_title'), t('search.button'), t('genres', 'Drama')
// ============================================================

const translations = {

    // ─────────────────────────────────────────────────────────
    // JĘZYK POLSKI
    // ─────────────────────────────────────────────────────────
    PL: {

        // ── Nawigacja i tytuły aplikacji ──────────────────────
        nav: {
            app_title: '🎬 Film Recommender',
            app_subtitle: 'Predykcja doboru treści audiowizualnych — regresja liniowa vs logistyczna',
            loading_recs: 'Generowanie rekomendacji...',
            linear_title: 'Regresja liniowa',
            linear_desc: 'Przewidywana ocena (1–5)',
            logistic_title: 'Regresja logistyczna',
            logistic_desc: 'Prawdopodobieństwo polubienia (%)',
            tab_existing: 'Użytkownik z bazy',
            tab_new: 'Moje rekomendacje',
            tab_deep: 'Pogłębiona analiza',
            tab_about: 'O projekcie',
        },

        // ── Landing page ──────────────────────────────────────
        landing: {
            hero_title: 'System predykcji treści',
            hero_subtitle: 'Praca magisterska — Wykorzystanie regresji liniowej w procesie predykcyjnym doboru treści audiowizualnych',
            hero_desc: 'Wybierz typ treści który chcesz poddać predykcji. System użyje modelu regresji liniowej i logistycznej do wygenerowania spersonalizowanych rekomendacji.',
            choose: 'Co chcesz dziś odkryć?',
            movies: 'Filmy',
            movies_desc: 'Rekomendacje filmowe na podstawie datasetu MovieLens 1M — ponad milion ocen od 6040 użytkowników.',
            series: 'Seriale',
            series_desc: 'Rekomendacje seriali telewizyjnych. Wkrótce — dataset w przygotowaniu.',
            books: 'Książki',
            books_desc: 'Rekomendacje książek na podstawie datasetu Book-Crossing — 270 000 użytkowników.',
            coming_soon: 'Wkrótce',
            available: 'Dostępne',
            about_title: 'O projekcie',
            about_desc: 'Aplikacja powstała jako część pracy magisterskiej na kierunku Informatyka (specjalność Programowanie i Analiza Danych) na uczelni WSEI w Lublinie. Celem projektu jest porównanie skuteczności regresji liniowej i logistycznej w zadaniu predykcji preferencji użytkowników.',
            about_stack: 'Stack technologiczny',
            about_dataset: 'Dataset',
            back: '← Wróć do wyboru',
        },

        // ── Wyszukiwarka użytkowników ─────────────────────────
        search: {
            placeholder: 'ID użytkownika (1–6040)',
            button: 'Szukaj',
            loading: 'Generowanie rekomendacji...',
            error_range: 'Podaj liczbę z zakresu 1–6040',
        },

        // ── Filtr podobnych użytkowników (filmy) ──────────────
        similar: {
            title: 'Znajdź podobnych użytkowników',
            gender_label: 'Płeć',
            age_label: 'Wiek',
            occ_label: 'Zawód',
            any_gender: 'Dowolna',
            any_age: 'Dowolny',
            any_occ: 'Dowolny',
            button: 'Szukaj',
            loading: 'Szukam...',
            reset: 'Reset',
            found: 'Znaleziono',
            found_suffix: 'użytkowników — kliknij żeby zobaczyć rekomendacje',
            no_results: 'Brak użytkowników spełniających kryteria.',
            user_prefix: 'Użytkownik #',
            ratings_label: 'Ocen:',
            style_label: 'Styl oceniania:',
        },

        // ── Dane demograficzne — płeć ─────────────────────────
        gender: {
            M: 'Mężczyzna',
            F: 'Kobieta',
            M_icon: '👨 Mężczyzna',
            F_icon: '👩 Kobieta',
        },

        // ── Dane demograficzne — wiek ─────────────────────────
        age: {
            1: 'Poniżej 18',
            18: '18–24',
            25: '25–34',
            35: '35–44',
            45: '45–49',
            50: '50–55',
            56: '56+',
        },

        // ── Dane demograficzne — zawód ────────────────────────
        occupation: {
            0: 'Inne / nieokreślone',
            1: 'Naukowiec / wykładowca',
            2: 'Artysta',
            3: 'Pracownik biurowy',
            4: 'Student',
            5: 'Obsługa klienta',
            6: 'Lekarz / służba zdrowia',
            7: 'Menedżer / dyrektor',
            8: 'Rolnik',
            9: 'Gospodarz/ni domowy/a',
            10: 'Uczeń (szkoła podstawowa/średnia)',
            11: 'Prawnik',
            12: 'Programista',
            13: 'Emeryt/rencista',
            14: 'Sprzedaż / marketing',
            15: 'Naukowiec',
            16: 'Samozatrudniony',
            17: 'Technik / inżynier',
            18: 'Rzemieślnik',
            19: 'Bezrobotny',
            20: 'Pisarz / dziennikarz',
        },

        // ── Profil użytkownika ────────────────────────────────
        profile: {
            id: 'ID użytkownika',
            gender: 'Płeć',
            age: 'Wiek',
            occupation: 'Zawód',
            ratings_count: 'Liczba ocen',
            rating_style: 'Styl oceniania',
        },

        // ── Typy widzów ───────────────────────────────────────
        viewer_type: {
            critic: 'Krytyk',
            skeptic: 'Sceptyk',
            picky: 'Wybredny widz',
            typical: 'Typowy widz',
            friendly: 'Życzliwy widz',
            optimist: 'Optymista',
            cinephile: 'Miłośnik kina',
            enthusiast: 'Entuzjasta',
        },

        viewer_desc: {
            critic: 'Prawie zawsze niezadowolony — bardzo rzadko chwali filmy',
            skeptic: 'Trudno go zachwycić — wysoką notę trzeba naprawdę zasłużyć',
            picky: 'Ogląda selektywnie i chwali tylko to co naprawdę go porusza',
            typical: 'Ocenia podobnie jak większość — spokojnie przyjmuje dobre i złe',
            friendly: 'Łatwo go zadowolić — rzadko wychodzi z kina rozczarowany',
            optimist: 'Nastawiony pozytywnie — niemal zawsze znajduje coś dobrego w filmie',
            cinephile: 'Pasjonat — kocha filmy i chętnie to wyraża wysokimi notami',
            enthusiast: 'Zachwycony niemal każdym filmem — najwyższe noty to jego standard',
        },

        // ── Profil filmowy użytkownika ────────────────────────
        taste: {
            title: 'Profil filmowy użytkownika',
            proportions: 'Proporcje ocen',
            top_genres: 'Ulubione gatunki — kliknij żeby wykluczyć z rekomendacji',
            likes: '👍 Lubi',
            neutral: '😐 Neutralne',
            dislikes: '👎 Nie lubi',
            likes_tooltip: 'Filmy ocenione 8–10/10 — model generuje rekomendacje na ich podstawie',
            neutral_tooltip: 'Filmy ocenione 6/10 — słaby sygnał dla modelu',
            dislikes_tooltip: 'Filmy ocenione 2–4/10 — model stara się unikać podobnych tytułów',
            likes_pct: 'Lubi',
            neutral_pct: 'Neutralne',
            dislikes_pct: 'Nie lubi',
            films_suffix: 'filmów',
            no_films: 'Brak filmów w tej kategorii',
            no_films_filter: 'Brak filmów po zastosowaniu filtrów',
            show_more: 'Pokaż więcej',
            remaining: 'pozostałych',
        },

        // ── Rekomendacje filmowe ──────────────────────────────
        recommendations: {
            linear_title: 'Regresja liniowa',
            linear_desc: 'Przewidywana ocena (1–5)',
            logistic_title: 'Regresja logistyczna',
            logistic_desc: 'Prawdopodobieństwo polubienia (%)',
            like_chance: 'szans na polubienie',
        },

        // ── Porównanie dwóch użytkowników ─────────────────────
        comparison: {
            title: 'Porównanie użytkowników',
            input_label: 'ID drugiego użytkownika',
            button: 'Porównaj',
            loading: 'Ładowanie...',
            common: 'wspólnych rekomendacji',
            only_for: 'Tylko dla #',
            common_title: 'Wspólne',
            similarity: 'Podobieństwo',
        },

        // ── Walidacja modelu (filmy) ──────────────────────────
        validation: {
            title: 'Walidacja modelu',
            subtitle: 'Porównanie przewidywanych vs rzeczywistych ocen dla tego użytkownika',
            based_on: 'na podstawie',
            ratings: 'ocen',
            rmse_hint: 'im niższe tym lepiej',
            mae_hint: 'im niższe tym lepiej',
            count_hint: 'użytkownika',
            sample_title: 'Próbka 20 przewidywań',
            col_film: 'Film',
            col_actual: 'Ocena rzeczywista',
            col_pred: 'Ocena przewidywana',
            col_diff: 'Różnica',
        },

        // ── Ewaluacja top-N (predykcja vs rzeczywistość) ──────
        evaluation: {
            title: 'Ewaluacja modelu — weryfikacja predykcji',
            subtitle: 'Sprawdzamy czy model trafnie przewidział filmy które użytkownik rzeczywiście ocenił po treningu',
            test_count: 'Filmów w zbiorze testowym',
            n_liked: 'Polubionych przez użytkownika',
            n_recommended: 'Poleconych przez model',
            hits: 'Trafień',
            precision: 'Precyzja',
            recall: 'Czułość',
            f1: 'F1-score',
            rmse: 'RMSE (zbiór testowy)',
            mae: 'MAE (zbiór testowy)',
            threshold: 'Próg "polubienia"',
            col_rank: '#',
            col_title: 'Film',
            col_predicted: 'Przewidywana',
            col_actual: 'Rzeczywista',
            col_recommended: 'Model poleca?',
            col_liked: 'User polubił?',
            col_hit: 'Trafienie',
            yes: 'Tak',
            no: 'Nie',
            na: '—',
            hint_precision: 'Ile z poleconych filmów użytkownik faktycznie polubił',
            hint_recall: 'Ile z lubianych filmów model znalazł',
            hint_f1: 'Harmonijna średnia precyzji i czułości',
        },

        // ── Filtr gatunków filmowych ──────────────────────────
        genre_filter: {
            title: 'Filtruj gatunki',
            show_all: 'Pokaż wszystkie',
            hide_all: 'Ukryj wszystkie',
            hidden: 'Ukryto',
            genre_suffix_1: 'gatunek',
            genre_suffix_2: 'gatunki',
            genre_suffix_5: 'gatunków',
        },

        // ── Nazwy gatunków filmowych ──────────────────────────
        genres: {
            'Action': 'Akcja',
            'Adventure': 'Przygodowy',
            'Animation': 'Animacja',
            "Children's": 'Dla dzieci',
            'Comedy': 'Komedia',
            'Crime': 'Kryminał',
            'Documentary': 'Dokumentalny',
            'Drama': 'Dramat',
            'Fantasy': 'Fantasy',
            'Film-Noir': 'Film Noir',
            'Horror': 'Horror',
            'Musical': 'Musical',
            'Mystery': 'Thriller psych.',
            'Romance': 'Romans',
            'Sci-Fi': 'Sci-Fi',
            'Thriller': 'Thriller',
            'War': 'Wojenny',
            'Western': 'Western',
        },

        // ── Nowy użytkownik (cold start — filmy) ─────────────
        new_user: {
            step1_title: 'Krok 1 — Twój profil',
            step1_desc: 'Podaj dane demograficzne — model użyje ich jako dodatkowych cech predykcji.',
            step2_title: 'Krok 2 — Oceń filmy',
            step2_desc: 'Oceń co najmniej 3 filmy które znasz — to pozwoli modelowi zrozumieć Twoje preferencje.',
            step3_title: 'Twoje rekomendacje',
            next_rate: 'Dalej → Oceń filmy',
            back: 'Wróć',
            generate: 'Generuj rekomendacje',
            generating: 'Generowanie...',
            reset: 'Zacznij od nowa',
            rated: 'Oceniono',
            min_ratings: 'min. 3',
            avg_rating: 'Średnia ocena',
            threshold: 'Próg pewności modelu',
            threshold_desc: 'Film zostanie polecony gdy model jest co najmniej X% pewny że Ci się spodoba',
            panel_linear: 'Regresja liniowa',
            panel_logistic: 'Regresja logistyczna',
            panel_combined: 'Połączony',
            combined_desc: '50% regresja liniowa + 50% regresja logistyczna',
        },

        // ── Pogłębiona analiza wielokryterialna ───────────────
        deep: {
            step1: 'Profil',
            step2: 'Wagi kryteriów',
            step3: 'Oceń filmy',
            step4: 'Wyniki',
            weights_title: 'Krok 2 — Co jest dla Ciebie ważne w filmie?',
            weights_desc: 'Przesuń suwaki żeby powiedzieć modelowi co najbardziej cenisz.',
            weights_hint: 'Przykład: jeśli fabuła = 80% a efekty = 20%, film z genialną historią ale słabymi efektami dostanie od Ciebie wyższą ocenę.',
            weights_total: 'Podgląd wag (suma:',
            weights_points: 'punktów):',
            rate_title: 'Krok 3 — Oceń filmy według kryteriów',
            rate_desc: 'Dla każdego filmu który znasz oceń poszczególne kryteria (0 = pomiń).',
            preview_title: 'Podgląd przeliczonych ocen (po uwzględnieniu wag):',
            results_weights: 'Zastosowane wagi kryteriów:',
            results_ratings: 'Przeliczone oceny które trafiły do modelu:',
            criteria: {
                plot: 'Fabuła',
                acting: 'Aktorstwo',
                visuals: 'Efekty wizualne',
                music: 'Muzyka',
                emotions: 'Emocje',
                originality: 'Oryginalność',
            },
            criteria_desc: {
                plot: 'Historia, scenariusz, zwroty akcji',
                acting: 'Gra aktorów, obsada, chemia na ekranie',
                visuals: 'CGI, zdjęcia, scenografia, kostiumy',
                music: 'Ścieżka dźwiękowa, muzyka, dźwięk',
                emotions: 'Wzruszenie, napięcie, humor, strach',
                originality: 'Świeże pomysły, unikatowy styl, klimat',
            },
        },

        // ── Suwak liczby rekomendacji ─────────────────────────
        top_n: {
            label: 'Liczba rekomendacji',
            hint: 'Przesuń żeby zmienić liczbę wyświetlanych rekomendacji',
        },

        // ── Historia wyszukiwań ───────────────────────────────
        history: {
            title: 'Ostatnio przeglądane',
            clear: 'Wyczyść',
        },

        // ── Eksport CSV ───────────────────────────────────────
        export_csv: 'Eksportuj CSV',
        export_csv_linear: 'Pobierz CSV (liniowa)',
        export_csv_logistic: 'Pobierz CSV (logistyczna)',

        // ── Wyjaśnienie rekomendacji ("Dlaczego?") ────────────
        why_button: 'Dlaczego?',
        why_title: 'Dlaczego ten film?',
        why_loading: 'Analizuję...',
        why_positive: 'zwiększa szansę',
        why_negative: 'zmniejsza szansę',

        // ── Tryb ciemny ───────────────────────────────────────
        dark_mode: 'Tryb ciemny',
        light_mode: 'Tryb jasny',

        // ── Strona O projekcie ────────────────────────────────
        about: {
            title: 'O projekcie',
            subtitle: 'Praca magisterska — Informatyka, specjalność Programowanie i Analiza Danych',
            university: 'WSEI Lublin',
            methodology_title: 'Metodologia',
            methodology_desc: 'System wykorzystuje dwa modele uczenia maszynowego — regresję liniową i logistyczną — do predykcji preferencji użytkowników. Modele trenowane są na rzeczywistych danych ocen i porównywane pod kątem skuteczności.',
            models_title: 'Modele',
            metrics_title: 'Metryki jakości',
            rmse_desc: 'Średni błąd predykcji — im niższy tym lepiej',
            mae_desc: 'Średnia bezwzględna różnica ocen — im niższa tym lepiej',
            r2_desc: 'Współczynnik determinacji — jaki % zmienności model wyjaśnia',
            datasets_title: 'Datasety',
            tech_title: 'Stack technologiczny',
            linear_desc: 'Przewiduje ocenę numeryczną (1–5 dla filmów, 1–10 dla książek). Prosta, interpretatywna metoda regresji.',
            logistic_desc: 'Klasyfikuje czy użytkownik "polubi" pozycję (binarnie). Optymalizowany próg decyzyjny zamiast domyślnego 0.5.',
            movies_dataset_desc: 'MovieLens 1M — 1 000 209 ocen, 6 040 użytkowników, 3 883 filmy. Podział temporalny per-user.',
            books_dataset_desc: 'Book-Crossing — 96 059 ocen (po filtracji min. 20 ocen/user), 3 419 użytkowników, 13 599 książek.',
        },

        // ── Aplikacja książkowa — ogólne ──────────────────────
        books_app: {
            title: 'Book Recommender',
            subtitle: 'Predykcja doboru książek — regresja liniowa vs logistyczna',
            tab_existing: 'Użytkownik z bazy',
            tab_new: 'Moje rekomendacje',
            search_placeholder: 'ID użytkownika',
            search_button: 'Szukaj',
            loading: 'Generowanie rekomendacji...',
            user_id: 'ID użytkownika',
            age: 'Wiek',
            age_suffix: 'lat',
            ratings_count: 'Liczba ocen',
            avg_rating: 'Średnia ocena',
            linear_title: 'Regresja liniowa',
            linear_desc: 'Przewidywana ocena (1–10)',
            logistic_title: 'Regresja logistyczna',
            logistic_desc: 'Prawdopodobieństwo polubienia (%)',
            like_chance: 'szans na polubienie',
            validation_title: 'Walidacja modelu',
            validation_subtitle: 'Porównanie przewidywanych vs rzeczywistych ocen',
            validation_based_on: 'na podstawie',
            validation_ratings: 'ocen',
            rmse_title: 'Jak dokładny jest system?',
            rmse_explain_full: 'Ten wynik pokazuje, jak dokładnie nasz system potrafi przewidywać oceny książek. Przykładowo: użytkownik ocenił książkę na 8/10, system przewidział 7/10 — pomyłka o 1 punkt. RMSE informuje jak duże są takie pomyłki średnio. Im niższy wynik, tym trafniejsze rekomendacje.',
            mae_title: 'Średnia różnica ocen',
            mae_explain_full: 'MAE pokazuje, o ile punktów średnio różni się przewidywana ocena od oceny którą użytkownik faktycznie wystawił. Przykład: użytkownik ocenił książkę na 9/10, system przewidział 8/10 — różnica wynosi 1 punkt. Im niższa wartość, tym bardziej trafne rekomendacje.',
            rmse_hint: 'im niższe tym lepiej',
            mae_hint: 'im niższe tym lepiej',
            count_hint: 'ocen tego użytkownika',
            scale_info: 'w skali 1–10',
            sample_title: 'Próbka 20 przewidywań',
            col_book: 'Książka',
            col_author: 'Autor',
            col_actual: 'Ocena rzeczywista',
            col_pred: 'Ocena przewidywana',
            col_diff: 'Różnica',
            step1_title: 'Krok 1 — Twój profil',
            step1_desc: 'Podaj swój wiek — model użyje go jako cechy predykcji.',
            step1_age_label: 'Wiek',
            step2_title: 'Krok 2 — Oceń książki',
            step2_desc: 'Oceń co najmniej 3 książki które znasz w skali 1–10.',
            next_rate: 'Dalej → Oceń książki',
            back: '← Wróć',
            generate: 'Generuj rekomendacje',
            generating: 'Generowanie...',
            results_title: 'Twoje rekomendacje książkowe',
            reset: 'Zacznij od nowa',
            rated: 'Oceniono',
            min_ratings: 'min. 3',
            panel_linear: 'Regresja liniowa',
            panel_logistic: 'Regresja logistyczna',
            panel_combined: 'Połączony',
            combined_desc: '50% regresja liniowa + 50% regresja logistyczna',
            threshold_desc: 'Prawdopodobieństwo polubienia (próg:',
            random_user: '🎲 Losuj czytelnika',
        },

        // ── Filtr podobnych czytelników ───────────────────────
        books_similar: {
            title: 'Znajdź podobnych czytelników',
            age_min: 'Wiek od',
            age_max: 'Wiek do',
            min_ratings: 'Min. ocen',
            any: 'Dowolny',
            button: 'Szukaj',
            loading: 'Szukam...',
            reset: 'Reset',
            found: 'Znaleziono',
            found_suffix: 'czytelników — kliknij żeby zobaczyć rekomendacje',
            no_results: 'Brak czytelników spełniających kryteria.',
            user_prefix: 'Czytelnik #',
            ratings_label: 'Ocen:',
            avg_label: 'Średnia:',
        },

        // ── Profil czytelniczy użytkownika ────────────────────
        books_taste: {
            title: 'Profil czytelniczy użytkownika',
            proportions: 'Proporcje ocen',
            likes: '👍 Lubi',
            neutral: '😐 Neutralne',
            dislikes: '👎 Nie lubi',
            likes_tooltip: 'Książki ocenione 8–10/10',
            neutral_tooltip: 'Książki ocenione 5–7/10',
            dislikes_tooltip: 'Książki ocenione 1–4/10',
            likes_pct: 'Lubi',
            neutral_pct: 'Neutralne',
            dislikes_pct: 'Nie lubi',
            books_suffix: 'książek',
            no_books: 'Brak książek w tej kategorii',
            show_more: 'Pokaż więcej',
            remaining: 'pozostałych',
        },

    }, // koniec PL


    // ─────────────────────────────────────────────────────────
    // JĘZYK ANGIELSKI
    // ─────────────────────────────────────────────────────────
    EN: {

        // ── Nawigacja i tytuły aplikacji ──────────────────────
        nav: {
            app_title: '🎬 Film Recommender',
            app_subtitle: 'Audiovisual content prediction — linear vs logistic regression',
            loading_recs: 'Generating recommendations...',
            linear_title: 'Linear Regression',
            linear_desc: 'Predicted rating (1–5)',
            logistic_title: 'Logistic Regression',
            logistic_desc: 'Probability of liking (%)',
            tab_existing: 'Database User',
            tab_new: 'My Recommendations',
            tab_deep: 'Deep Analysis',
            tab_about: 'About',
        },

        // ── Landing page ──────────────────────────────────────
        landing: {
            hero_title: 'Content Prediction System',
            hero_subtitle: "Master's Thesis — Using Linear Regression in Predictive Selection of Audiovisual Content",
            hero_desc: 'Choose the type of content you want to predict. The system uses linear and logistic regression models to generate personalized recommendations.',
            choose: 'What do you want to discover today?',
            movies: 'Movies',
            movies_desc: 'Movie recommendations based on the MovieLens 1M dataset — over one million ratings from 6,040 users.',
            series: 'TV Series',
            series_desc: 'TV series recommendations. Coming soon — dataset in preparation.',
            books: 'Books',
            books_desc: 'Book recommendations based on the Book-Crossing dataset — 270,000 users.',
            coming_soon: 'Coming soon',
            available: 'Available',
            about_title: 'About the project',
            about_desc: "This application was created as part of a master's thesis in Computer Science (Programming and Data Analysis) at WSEI University in Lublin. The goal is to compare the effectiveness of linear and logistic regression in predicting user preferences.",
            about_stack: 'Tech stack',
            about_dataset: 'Dataset',
            back: '← Back to selection',
        },

        // ── Wyszukiwarka użytkowników ─────────────────────────
        search: {
            placeholder: 'User ID (1–6040)',
            button: 'Search',
            loading: 'Generating recommendations...',
            error_range: 'Enter a number between 1 and 6040',
        },

        // ── Filtr podobnych użytkowników (filmy) ──────────────
        similar: {
            title: 'Find Similar Users',
            gender_label: 'Gender',
            age_label: 'Age',
            occ_label: 'Occupation',
            any_gender: 'Any',
            any_age: 'Any',
            any_occ: 'Any',
            button: 'Search',
            loading: 'Searching...',
            reset: 'Reset',
            found: 'Found',
            found_suffix: 'users — click to see recommendations',
            no_results: 'No users match the criteria.',
            user_prefix: 'User #',
            ratings_label: 'Ratings:',
            style_label: 'Rating style:',
        },

        // ── Dane demograficzne — płeć ─────────────────────────
        gender: {
            M: 'Male',
            F: 'Female',
            M_icon: '👨 Male',
            F_icon: '👩 Female',
        },

        // ── Dane demograficzne — wiek ─────────────────────────
        age: {
            1: 'Under 18',
            18: '18–24',
            25: '25–34',
            35: '35–44',
            45: '45–49',
            50: '50–55',
            56: '56+',
        },

        // ── Dane demograficzne — zawód ────────────────────────
        occupation: {
            0: 'Other / not specified',
            1: 'Academic / educator',
            2: 'Artist',
            3: 'Clerical / admin',
            4: 'College / grad student',
            5: 'Customer service',
            6: 'Doctor / health care',
            7: 'Executive / managerial',
            8: 'Farmer',
            9: 'Homemaker',
            10: 'K-12 student',
            11: 'Lawyer',
            12: 'Programmer',
            13: 'Retired',
            14: 'Sales / marketing',
            15: 'Scientist',
            16: 'Self-employed',
            17: 'Technician / engineer',
            18: 'Tradesman / craftsman',
            19: 'Unemployed',
            20: 'Writer',
        },

        // ── Profil użytkownika ────────────────────────────────
        profile: {
            id: 'User ID',
            gender: 'Gender',
            age: 'Age',
            occupation: 'Occupation',
            ratings_count: 'Ratings count',
            rating_style: 'Rating style',
        },

        // ── Typy widzów ───────────────────────────────────────
        viewer_type: {
            critic: 'Critic',
            skeptic: 'Skeptic',
            picky: 'Picky viewer',
            typical: 'Typical viewer',
            friendly: 'Friendly viewer',
            optimist: 'Optimist',
            cinephile: 'Cinephile',
            enthusiast: 'Enthusiast',
        },

        viewer_desc: {
            critic: 'Almost always dissatisfied — rarely praises films',
            skeptic: 'Hard to impress — high ratings must be truly earned',
            picky: 'Watches selectively — praises only what truly moves them',
            typical: 'Rates like most people — takes good and bad in stride',
            friendly: 'Easy to please — rarely leaves the cinema disappointed',
            optimist: 'Positively inclined — almost always finds something good',
            cinephile: 'A passionate lover of film — expresses it with high ratings',
            enthusiast: 'Delighted by almost every film — top ratings are the norm',
        },

        // ── Profil filmowy użytkownika ────────────────────────
        taste: {
            title: 'User Film Profile',
            proportions: 'Rating proportions',
            top_genres: 'Favorite genres — click to exclude from recommendations',
            likes: '👍 Likes',
            neutral: '😐 Neutral',
            dislikes: '👎 Dislikes',
            likes_tooltip: 'Films rated 8–10/10 — model generates recommendations based on these',
            neutral_tooltip: 'Films rated 6/10 — weak signal for the model',
            dislikes_tooltip: 'Films rated 2–4/10 — model tries to avoid similar titles',
            likes_pct: 'Likes',
            neutral_pct: 'Neutral',
            dislikes_pct: 'Dislikes',
            films_suffix: 'films',
            no_films: 'No films in this category',
            no_films_filter: 'No films after applying filters',
            show_more: 'Show more',
            remaining: 'remaining',
        },

        // ── Rekomendacje filmowe ──────────────────────────────
        recommendations: {
            linear_title: 'Linear Regression',
            linear_desc: 'Predicted rating (1–5)',
            logistic_title: 'Logistic Regression',
            logistic_desc: 'Probability of liking (%)',
            like_chance: 'chance of liking',
        },

        // ── Porównanie dwóch użytkowników ─────────────────────
        comparison: {
            title: 'User Comparison',
            input_label: 'Second user ID',
            button: 'Compare',
            loading: 'Loading...',
            common: 'shared recommendations',
            only_for: 'Only for #',
            common_title: 'Shared',
            similarity: 'Similarity',
        },

        // ── Walidacja modelu (filmy) ──────────────────────────
        validation: {
            title: 'Model Validation',
            subtitle: 'Predicted vs actual ratings for this user',
            based_on: 'based on',
            ratings: 'ratings',
            rmse_hint: 'lower is better',
            mae_hint: 'lower is better',
            count_hint: 'by user',
            sample_title: 'Sample of 20 predictions',
            col_film: 'Film',
            col_actual: 'Actual rating',
            col_pred: 'Predicted rating',
            col_diff: 'Difference',
        },

        // ── Ewaluacja top-N (predykcja vs rzeczywistość) ──────
        evaluation: {
            title: 'Model Evaluation — Prediction Verification',
            subtitle: 'Checking whether the model correctly predicted films the user actually rated after training',
            test_count: 'Films in test set',
            n_liked: 'Liked by user',
            n_recommended: 'Recommended by model',
            hits: 'Hits',
            precision: 'Precision',
            recall: 'Recall',
            f1: 'F1-score',
            rmse: 'RMSE (test set)',
            mae: 'MAE (test set)',
            threshold: 'Like threshold',
            col_rank: '#',
            col_title: 'Film',
            col_predicted: 'Predicted',
            col_actual: 'Actual',
            col_recommended: 'Model recommends?',
            col_liked: 'User liked?',
            col_hit: 'Hit',
            yes: 'Yes',
            no: 'No',
            na: '—',
            hint_precision: 'How many recommended films the user actually liked',
            hint_recall: 'How many liked films the model found',
            hint_f1: 'Harmonic mean of precision and recall',
        },

        // ── Filtr gatunków filmowych ──────────────────────────
        genre_filter: {
            title: 'Filter genres',
            show_all: 'Show all',
            hide_all: 'Hide all',
            hidden: 'Hidden',
            genre_suffix_1: 'genre',
            genre_suffix_2: 'genres',
            genre_suffix_5: 'genres',
        },

        // ── Nazwy gatunków filmowych ──────────────────────────
        genres: {
            'Action': 'Action',
            'Adventure': 'Adventure',
            'Animation': 'Animation',
            "Children's": "Children's",
            'Comedy': 'Comedy',
            'Crime': 'Crime',
            'Documentary': 'Documentary',
            'Drama': 'Drama',
            'Fantasy': 'Fantasy',
            'Film-Noir': 'Film Noir',
            'Horror': 'Horror',
            'Musical': 'Musical',
            'Mystery': 'Mystery',
            'Romance': 'Romance',
            'Sci-Fi': 'Sci-Fi',
            'Thriller': 'Thriller',
            'War': 'War',
            'Western': 'Western',
        },

        // ── Nowy użytkownik (cold start — filmy) ─────────────
        new_user: {
            step1_title: 'Step 1 — Your profile',
            step1_desc: 'Enter demographic data — the model will use it as additional features.',
            step2_title: 'Step 2 — Rate films',
            step2_desc: 'Rate at least 3 films you know — this helps the model understand your preferences.',
            step3_title: 'Your recommendations',
            next_rate: 'Next → Rate films',
            back: 'Back',
            generate: 'Generate recommendations',
            generating: 'Generating...',
            reset: 'Start over',
            rated: 'Rated',
            min_ratings: 'min. 3',
            avg_rating: 'Average rating',
            threshold: 'Model confidence threshold',
            threshold_desc: 'A film will be recommended when the model is at least X% confident you will like it',
            panel_linear: 'Linear Regression',
            panel_logistic: 'Logistic Regression',
            panel_combined: 'Combined',
            combined_desc: '50% linear regression + 50% logistic regression',
        },

        // ── Pogłębiona analiza wielokryterialna ───────────────
        deep: {
            step1: 'Profile',
            step2: 'Criteria weights',
            step3: 'Rate films',
            step4: 'Results',
            weights_title: 'Step 2 — What matters to you in a film?',
            weights_desc: 'Move the sliders to tell the model what you value most.',
            weights_hint: 'Example: if plot = 80% and effects = 20%, a film with a great story but weak effects will score higher for you.',
            weights_total: 'Weight preview (total:',
            weights_points: 'points):',
            rate_title: 'Step 3 — Rate films by criteria',
            rate_desc: 'For each film you know, rate individual criteria (0 = skip).',
            preview_title: 'Preview of weighted ratings:',
            results_weights: 'Applied criteria weights:',
            results_ratings: 'Weighted ratings sent to model:',
            criteria: {
                plot: 'Plot',
                acting: 'Acting',
                visuals: 'Visual effects',
                music: 'Music',
                emotions: 'Emotions',
                originality: 'Originality',
            },
            criteria_desc: {
                plot: 'Story, screenplay, plot twists',
                acting: 'Actors, cast, on-screen chemistry',
                visuals: 'CGI, cinematography, production design',
                music: 'Soundtrack, score, sound design',
                emotions: 'Tension, humor, fear, sentiment',
                originality: 'Fresh ideas, unique style, atmosphere',
            },
        },

        // ── Suwak liczby rekomendacji ─────────────────────────
        top_n: {
            label: 'Number of recommendations',
            hint: 'Slide to change the number of displayed recommendations',
        },

        // ── Historia wyszukiwań ───────────────────────────────
        history: {
            title: 'Recently viewed',
            clear: 'Clear',
        },

        // ── Eksport CSV ───────────────────────────────────────
        export_csv: 'Export CSV',
        export_csv_linear: 'Download CSV (linear)',
        export_csv_logistic: 'Download CSV (logistic)',

        // ── Wyjaśnienie rekomendacji ("Why?") ─────────────────
        why_button: 'Why?',
        why_title: 'Why this film?',
        why_loading: 'Analyzing...',
        why_positive: 'increases chance',
        why_negative: 'decreases chance',

        // ── Tryb ciemny ───────────────────────────────────────
        dark_mode: 'Dark mode',
        light_mode: 'Light mode',

        // ── Strona O projekcie ────────────────────────────────
        about: {
            title: 'About the project',
            subtitle: "Master's Thesis — Computer Science, Programming and Data Analysis",
            university: 'WSEI Lublin',
            methodology_title: 'Methodology',
            methodology_desc: 'The system uses two machine learning models — linear and logistic regression — to predict user preferences. Models are trained on real rating data and compared for effectiveness.',
            models_title: 'Models',
            metrics_title: 'Quality metrics',
            rmse_desc: 'Average prediction error — lower is better',
            mae_desc: 'Average absolute rating difference — lower is better',
            r2_desc: 'Coefficient of determination — what % of variance the model explains',
            datasets_title: 'Datasets',
            tech_title: 'Tech stack',
            linear_desc: 'Predicts a numerical rating (1–5 for films, 1–10 for books). Simple, interpretable regression method.',
            logistic_desc: 'Classifies whether a user will "like" an item (binary). Optimized decision threshold instead of default 0.5.',
            movies_dataset_desc: 'MovieLens 1M — 1,000,209 ratings, 6,040 users, 3,883 films. Per-user temporal split.',
            books_dataset_desc: 'Book-Crossing — 96,059 ratings (after filtering min. 20 ratings/user), 3,419 users, 13,599 books.',
        },

        // ── Aplikacja książkowa — ogólne ──────────────────────
        books_app: {
            title: 'Book Recommender',
            subtitle: 'Book prediction — linear vs logistic regression',
            tab_existing: 'Database User',
            tab_new: 'My Recommendations',
            search_placeholder: 'User ID',
            search_button: 'Search',
            loading: 'Generating recommendations...',
            user_id: 'User ID',
            age: 'Age',
            age_suffix: 'years old',
            ratings_count: 'Ratings count',
            avg_rating: 'Average rating',
            linear_title: 'Linear Regression',
            linear_desc: 'Predicted rating (1–10)',
            logistic_title: 'Logistic Regression',
            logistic_desc: 'Probability of liking (%)',
            like_chance: 'chance of liking',
            validation_title: 'Model Validation',
            validation_subtitle: 'Predicted vs actual ratings comparison',
            validation_based_on: 'based on',
            validation_ratings: 'ratings',
            rmse_title: 'How accurate is the system?',
            rmse_explain_full: 'This score shows how accurately our system predicts book ratings. For example: a user rated a book 8/10, the system predicted 7/10 — an error of 1 point. RMSE shows how large these errors are on average. The lower the score, the more accurate the recommendations.',
            mae_title: 'Average rating difference',
            mae_explain_full: 'MAE shows by how many points the predicted rating differs from the actual rating given by the user. Example: a user rated a book 9/10, the system predicted 8/10 — a difference of 1 point. The lower the value, the more accurate the recommendations.',
            rmse_hint: 'lower is better',
            mae_hint: 'lower is better',
            count_hint: 'ratings by this user',
            scale_info: 'on a 1–10 scale',
            sample_title: 'Sample of 20 predictions',
            col_book: 'Book',
            col_author: 'Author',
            col_actual: 'Actual rating',
            col_pred: 'Predicted rating',
            col_diff: 'Difference',
            step1_title: 'Step 1 — Your profile',
            step1_desc: 'Enter your age — the model will use it as a prediction feature.',
            step1_age_label: 'Age',
            step2_title: 'Step 2 — Rate books',
            step2_desc: 'Rate at least 3 books you know on a scale of 1–10.',
            next_rate: 'Next → Rate books',
            back: '← Back',
            generate: 'Generate recommendations',
            generating: 'Generating...',
            results_title: 'Your book recommendations',
            reset: 'Start over',
            rated: 'Rated',
            min_ratings: 'min. 3',
            panel_linear: 'Linear Regression',
            panel_logistic: 'Logistic Regression',
            panel_combined: 'Combined',
            combined_desc: '50% linear regression + 50% logistic regression',
            threshold_desc: 'Probability of liking (threshold:',
            random_user: '🎲 Random reader',
        },

        // ── Filtr podobnych czytelników ───────────────────────
        books_similar: {
            title: 'Find similar readers',
            age_min: 'Age from',
            age_max: 'Age to',
            min_ratings: 'Min. ratings',
            any: 'Any',
            button: 'Search',
            loading: 'Searching...',
            reset: 'Reset',
            found: 'Found',
            found_suffix: 'readers — click to see recommendations',
            no_results: 'No readers match the criteria.',
            user_prefix: 'Reader #',
            ratings_label: 'Ratings:',
            avg_label: 'Average:',
        },

        // ── Profil czytelniczy użytkownika ────────────────────
        books_taste: {
            title: 'User reading profile',
            proportions: 'Rating proportions',
            likes: '👍 Likes',
            neutral: '😐 Neutral',
            dislikes: '👎 Dislikes',
            likes_tooltip: 'Books rated 8–10/10',
            neutral_tooltip: 'Books rated 5–7/10',
            dislikes_tooltip: 'Books rated 1–4/10',
            likes_pct: 'Likes',
            neutral_pct: 'Neutral',
            dislikes_pct: 'Dislikes',
            books_suffix: 'books',
            no_books: 'No books in this category',
            show_more: 'Show more',
            remaining: 'remaining',
        },

    }, // koniec EN

} // koniec translations


// ─────────────────────────────────────────────────────────────
// API modułu i18n
// ─────────────────────────────────────────────────────────────

// aktywny język — domyślnie polski
let currentLang = 'PL'

export function setLang(lang) {
    if (lang === 'PL' || lang === 'EN') {
        currentLang = lang
    }
}

export function getLang() {
    return currentLang
}

// główna funkcja tłumaczenia
// użycie: t('nav.app_title'), t('occupation', 12), t('genres', 'Drama')
export function t(key, subkey = null) {
    const langData = translations[currentLang]
    const keys = key.split('.')

    let value = langData
    for (const k of keys) {
        if (value === undefined) return key
        value = value[k]
    }

    if (subkey !== null) {
        if (typeof value === 'object' && value !== null) {
            return value[subkey] ?? String(subkey)
        }
    }

    return value ?? key
}

export default translations