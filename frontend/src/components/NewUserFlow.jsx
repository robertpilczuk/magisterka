import { useState } from 'react'
import axios from 'axios'
import RecommendationCard from './RecommendationCard'

const SAMPLE_MOVIES = [
    { movieId: 1, title: 'Toy Story (1995)', genres: 'Animation|Children\'s|Comedy' },
    { movieId: 2, title: 'Jumanji (1995)', genres: 'Adventure|Children\'s|Fantasy' },
    { movieId: 32, title: 'Twelve Monkeys (1995)', genres: 'Drama|Sci-Fi' },
    { movieId: 50, title: 'Usual Suspects, The (1995)', genres: 'Crime|Thriller' },
    { movieId: 95, title: 'Broken Arrow (1996)', genres: 'Action|Thriller' },
    { movieId: 110, title: 'Braveheart (1995)', genres: 'Action|Drama|War' },
    { movieId: 260, title: 'Star Wars: Episode IV (1977)', genres: 'Action|Adventure|Sci-Fi' },
    { movieId: 296, title: 'Pulp Fiction (1994)', genres: 'Crime|Drama' },
    { movieId: 318, title: 'Shawshank Redemption, The (1994)', genres: 'Drama' },
    { movieId: 356, title: 'Forrest Gump (1994)', genres: 'Comedy|Drama|Romance|War' },
    { movieId: 480, title: 'Jurassic Park (1993)', genres: 'Action|Adventure|Sci-Fi' },
    { movieId: 527, title: 'Schindler\'s List (1993)', genres: 'Drama|War' },
    { movieId: 589, title: 'Terminator 2 (1991)', genres: 'Action|Sci-Fi|Thriller' },
    { movieId: 593, title: 'Silence of the Lambs, The (1991)', genres: 'Drama|Thriller' },
    { movieId: 1196, title: 'Star Wars: Episode V (1980)', genres: 'Action|Adventure|Drama|Sci-Fi' },
    { movieId: 1198, title: 'Raiders of the Lost Ark (1981)', genres: 'Action|Adventure' },
    { movieId: 1210, title: 'Star Wars: Episode VI (1983)', genres: 'Action|Adventure|Romance|Sci-Fi' },
    { movieId: 2571, title: 'Matrix, The (1999)', genres: 'Action|Sci-Fi|Thriller' },
    { movieId: 2762, title: 'Sixth Sense, The (1999)', genres: 'Drama|Thriller' },
    { movieId: 3578, title: 'Gladiator (2000)', genres: 'Action|Drama' }
]

const AGE_OPTIONS = [
    { value: 1, label: 'Poniżej 18' }, { value: 18, label: '18–24' },
    { value: 25, label: '25–34' }, { value: 35, label: '35–44' },
    { value: 45, label: '45–49' }, { value: 50, label: '50–55' },
    { value: 56, label: '56+' }
]

const OCC_OPTIONS = [
    { value: 0, label: 'other' }, { value: 1, label: 'educator' },
    { value: 2, label: 'artist' }, { value: 3, label: 'clerical/admin' },
    { value: 4, label: 'student' }, { value: 5, label: 'customer service' },
    { value: 6, label: 'doctor' }, { value: 7, label: 'executive' },
    { value: 8, label: 'farmer' }, { value: 9, label: 'homemaker' },
    { value: 10, label: 'K-12 student' }, { value: 11, label: 'lawyer' },
    { value: 12, label: 'programmer' }, { value: 13, label: 'retired' },
    { value: 14, label: 'sales' }, { value: 15, label: 'scientist' },
    { value: 16, label: 'self-employed' }, { value: 17, label: 'technician' },
    { value: 18, label: 'tradesman' }, { value: 19, label: 'unemployed' },
    { value: 20, label: 'writer' }
]

export default function NewUserFlow({ API }) {
    const [step, setStep] = useState(1)
    const [gender, setGender] = useState('M')
    const [age, setAge] = useState(25)
    const [occupation, setOccupation] = useState(4)
    const [ratings, setRatings] = useState({})
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [activePanel, setActivePanel] = useState('linear')

    const ratedCount = Object.keys(ratings).length

    function setRating(movieId, rating) {
        setRatings(prev => ({ ...prev, [movieId]: rating }))
    }

    function clearRating(movieId) {
        setRatings(prev => {
            const next = { ...prev }
            delete next[movieId]
            return next
        })
    }

    async function handleSubmit() {
        if (ratedCount < 3) return
        setLoading(true)
        setError(null)
        try {
            const ratingsPayload = Object.entries(ratings).map(([movieId, rating]) => ({
                movieId: parseInt(movieId),
                rating: parseFloat(rating)
            }))
            const res = await axios.post(`${API}/recommend-new-user`, {
                ratings: ratingsPayload,
                age: parseInt(age),
                gender,
                occupation: parseInt(occupation)
            })
            setResults(res.data)
            setStep(3)
        } catch (err) {
            setError(err.response?.data?.detail || 'Błąd generowania rekomendacji')
        } finally {
            setLoading(false)
        }
    }

    function handleReset() {
        setStep(1)
        setRatings({})
        setResults(null)
        setError(null)
    }

    const inputStyle = {
        padding: '8px 12px', borderRadius: '8px',
        border: '2px solid #ddd', fontSize: '14px',
        background: 'white', minWidth: '180px'
    }

    const panelBtn = (key, label) => ({
        padding: '8px 20px',
        background: activePanel === key ? '#4a90d9' : '#eee',
        color: activePanel === key ? 'white' : '#666',
        border: 'none', borderRadius: '8px',
        cursor: 'pointer', fontSize: '14px'
    })

    return (
        <div>
            {/* krok 1 — profil demograficzny */}
            {step === 1 && (
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ marginBottom: '8px' }}>👤 Krok 1 — Twój profil</h2>
                    <p style={{ color: '#666', marginBottom: '24px' }}>
                        Podaj dane demograficzne — model użyje ich jako dodatkowych cech predykcji.
                        Wszystkie pola są opcjonalne.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>Płeć</div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {['M', 'F'].map(g => (
                                    <button key={g} onClick={() => setGender(g)}
                                        style={{
                                            padding: '10px 24px',
                                            background: gender === g ? '#4a90d9' : '#eee',
                                            color: gender === g ? 'white' : '#666',
                                            border: 'none', borderRadius: '8px', cursor: 'pointer',
                                            fontSize: '15px'
                                        }}>
                                        {g === 'M' ? '👨 Mężczyzna' : '👩 Kobieta'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>Wiek</div>
                            <select value={age} onChange={e => setAge(e.target.value)} style={inputStyle}>
                                {AGE_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>Zawód</div>
                            <select value={occupation} onChange={e => setOccupation(e.target.value)}
                                style={inputStyle}>
                                {OCC_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>

                        <button onClick={() => setStep(2)}
                            style={{
                                padding: '12px 32px', background: '#4a90d9', color: 'white',
                                border: 'none', borderRadius: '8px', cursor: 'pointer',
                                fontSize: '15px', fontWeight: '600', alignSelf: 'flex-start',
                                marginTop: '8px'
                            }}>
                            Dalej → Oceń filmy
                        </button>
                    </div>
                </div>
            )}

            {/* krok 2 — ocenianie filmów */}
            {step === 2 && (
                <div>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: '8px'
                    }}>
                        <h2 style={{ margin: 0 }}>🎬 Krok 2 — Oceń filmy</h2>
                        <div style={{ fontSize: '14px', color: ratedCount >= 3 ? '#2ecc71' : '#888' }}>
                            {ratedCount >= 3 ? '✅' : '⏳'} Oceniono: {ratedCount} / min. 3
                        </div>
                    </div>
                    <p style={{ color: '#666', marginBottom: '20px' }}>
                        Oceń co najmniej 3 filmy które znasz — to pozwoli modelowi zrozumieć Twoje preferencje.
                    </p>

                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                        gap: '12px', marginBottom: '24px'
                    }}>
                        {SAMPLE_MOVIES.map(movie => (
                            <div key={movie.movieId} style={{
                                background: ratings[movie.movieId] ? '#f0f7ff' : 'white',
                                border: `1px solid ${ratings[movie.movieId] ? '#4a90d9' : '#e0e0e0'}`,
                                borderRadius: '10px', padding: '14px'
                            }}>
                                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>
                                    {movie.title}
                                </div>
                                <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
                                    {movie.genres.replace(/\|/g, ' · ')}
                                </div>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button key={star} onClick={() => setRating(movie.movieId, star)}
                                            style={{
                                                width: '32px', height: '32px',
                                                background: ratings[movie.movieId] >= star ? '#4a90d9' : '#f0f0f0',
                                                color: ratings[movie.movieId] >= star ? 'white' : '#aaa',
                                                border: 'none', borderRadius: '6px',
                                                cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                                            }}>
                                            {star}
                                        </button>
                                    ))}
                                    {ratings[movie.movieId] && (
                                        <button onClick={() => clearRating(movie.movieId)}
                                            style={{
                                                marginLeft: '4px', background: 'none', border: 'none',
                                                cursor: 'pointer', color: '#ccc', fontSize: '16px'
                                            }}>
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button onClick={() => setStep(1)}
                            style={{
                                padding: '10px 20px', background: '#eee', color: '#666',
                                border: 'none', borderRadius: '8px', cursor: 'pointer'
                            }}>
                            ← Wróć
                        </button>
                        <button onClick={handleSubmit}
                            disabled={ratedCount < 3 || loading}
                            style={{
                                padding: '12px 32px',
                                background: ratedCount >= 3 ? '#4a90d9' : '#ccc',
                                color: 'white', border: 'none', borderRadius: '8px',
                                cursor: ratedCount >= 3 ? 'pointer' : 'not-allowed',
                                fontSize: '15px', fontWeight: '600'
                            }}>
                            {loading ? '⏳ Generowanie...' : '🎯 Generuj rekomendacje'}
                        </button>
                    </div>

                    {error && (
                        <div style={{ marginTop: '12px', color: '#c00', fontSize: '14px' }}>
                            ⚠️ {error}
                        </div>
                    )}
                </div>
            )}

            {/* krok 3 — wyniki */}
            {step === 3 && results && (
                <div>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: '20px'
                    }}>
                        <h2 style={{ margin: 0 }}>🎉 Twoje rekomendacje</h2>
                        <button onClick={handleReset}
                            style={{
                                padding: '8px 20px', background: '#eee', color: '#666',
                                border: 'none', borderRadius: '8px', cursor: 'pointer'
                            }}>
                            ↺ Zacznij od nowa
                        </button>
                    </div>

                    {/* profil */}
                    <div style={{
                        background: '#f8f9fa', borderRadius: '10px',
                        padding: '16px', marginBottom: '20px',
                        display: 'flex', gap: '24px', flexWrap: 'wrap'
                    }}>
                        <div>
                            <div style={{ fontSize: '12px', color: '#888' }}>Płeć</div>
                            <div>{results.user_profile.gender === 'M' ? '👨 Mężczyzna' : '👩 Kobieta'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#888' }}>Ocenionych filmów</div>
                            <div>🎬 {results.user_profile.ratingsGiven}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#888' }}>Średnia ocena</div>
                            <div>⭐ {results.user_profile.avgRating}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#888' }}>Optymalny próg</div>
                            <div>🎯 {results.optimal_threshold}</div>
                        </div>
                    </div>

                    {/* przełącznik paneli */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                        <button style={panelBtn('linear', '📈 Regresja liniowa')}
                            onClick={() => setActivePanel('linear')}>
                            📈 Regresja liniowa
                        </button>
                        <button style={panelBtn('logistic', '🎯 Regresja logistyczna')}
                            onClick={() => setActivePanel('logistic')}>
                            🎯 Regresja logistyczna
                        </button>
                        <button style={panelBtn('combined', '⚡ Połączony')}
                            onClick={() => setActivePanel('combined')}>
                            ⚡ Połączony
                        </button>
                    </div>

                    {/* rekomendacje */}
                    {activePanel === 'linear' && (
                        <div>
                            <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                                Przewidywana ocena (1–5) na podstawie Twoich preferencji.
                            </p>
                            {results.linear.map((rec, i) => (
                                <RecommendationCard key={rec.movieId} rank={i + 1} rec={rec} type="linear" />
                            ))}
                        </div>
                    )}

                    {activePanel === 'logistic' && (
                        <div>
                            <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                                Prawdopodobieństwo że polubisz film (próg: {results.optimal_threshold}).
                            </p>
                            {results.logistic.map((rec, i) => (
                                <RecommendationCard key={rec.movieId} rank={i + 1} rec={rec} type="logistic" />
                            ))}
                        </div>
                    )}

                    {activePanel === 'combined' && (
                        <div>
                            <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                                Wynik łączony: 50% regresja liniowa + 50% regresja logistyczna.
                            </p>
                            {results.combined.map((rec, i) => (
                                <RecommendationCard key={rec.movieId} rank={i + 1}
                                    rec={{ ...rec, predicted_rating: rec.combined_score * 5 }}
                                    type="linear" />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}