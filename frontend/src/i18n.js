// i18n.js — tłumaczenia PL/EN
// Użycie: import { t, setLang, getLang } from '../i18n'

const translations = {
    PL: {
        // nawigacja
        nav: {
            title: 'Film Recommender',
            subtitle: 'Predykcja doboru treści audiowizualnych — regresja liniowa vs logistyczna',
            tab_existing: 'Użytkownik z bazy',
            tab_new: 'Moje rekomendacje',
            tab_deep: 'Pogłębiona analiza',
        },

        // wyszukiwanie
        search: {
            placeholder: 'ID użytkownika (1–6040)',
            button: 'Szukaj',
            loading: 'Generowanie rekomendacji...',
            error_range: 'Podaj liczbę z zakresu 1–6040',
        },

        // podobni użytkownicy
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

        // płeć
        gender: {
            M: 'Mężczyzna',
            F: 'Kobieta',
            M_icon: '👨 Mężczyzna',
            F_icon: '👩 Kobieta',
        },

        // wiek
        age: {
            1: 'Poniżej 18',
            18: '18–24',
            25: '25–34',
            35: '35–44',
            45: '45–49',
            50: '50–55',
            56: '56+',
        },

        // zawody
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

        // profil użytkownika
        profile: {
            id: 'ID użytkownika',
            gender: 'Płeć',
            age: 'Wiek',
            occupation: 'Zawód',
            ratings_count: 'Liczba ocen',
            rating_style: 'Styl oceniania',
        },

        // typy widzów
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

        // profil filmowy
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

        // rekomendacje
        recommendations: {
            linear_title: 'Regresja liniowa',
            linear_desc: 'Przewidywana ocena (1–5)',
            logistic_title: 'Regresja logistyczna',
            logistic_desc: 'Prawdopodobieństwo polubienia (%)',
            like_chance: 'szans na polubienie',
        },

        // porównanie użytkowników
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

        // walidacja
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

        // filtr gatunków
        genre_filter: {
            title: 'Filtruj gatunki',
            show_all: 'Pokaż wszystkie',
            hide_all: 'Ukryj wszystkie',
            hidden: 'Ukryto',
            genre_suffix_1: 'gatunek',
            genre_suffix_2: 'gatunki',
            genre_suffix_5: 'gatunków',
        },

        // gatunki
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

        // nowy użytkownik
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

        // pogłębiona analiza
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
    },

    EN: {
        nav: {
            title: 'Film Recommender',
            subtitle: 'Audiovisual content prediction — linear vs logistic regression',
            tab_existing: 'Database User',
            tab_new: 'My Recommendations',
            tab_deep: 'Deep Analysis',
        },

        search: {
            placeholder: 'User ID (1–6040)',
            button: 'Search',
            loading: 'Generating recommendations...',
            error_range: 'Enter a number between 1 and 6040',
        },

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

        gender: {
            M: 'Male',
            F: 'Female',
            M_icon: '👨 Male',
            F_icon: '👩 Female',
        },

        age: {
            1: 'Under 18',
            18: '18–24',
            25: '25–34',
            35: '35–44',
            45: '45–49',
            50: '50–55',
            56: '56+',
        },

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

        profile: {
            id: 'User ID',
            gender: 'Gender',
            age: 'Age',
            occupation: 'Occupation',
            ratings_count: 'Ratings count',
            rating_style: 'Rating style',
        },

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

        recommendations: {
            linear_title: 'Linear Regression',
            linear_desc: 'Predicted rating (1–5)',
            logistic_title: 'Logistic Regression',
            logistic_desc: 'Probability of liking (%)',
            like_chance: 'chance of liking',
        },

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

        genre_filter: {
            title: 'Filter genres',
            show_all: 'Show all',
            hide_all: 'Hide all',
            hidden: 'Hidden',
            genre_suffix_1: 'genre',
            genre_suffix_2: 'genres',
            genre_suffix_5: 'genres',
        },

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
    },
}

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
// użycie: t('nav.title'), t('occupation', 12), t('genres', 'Drama')
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