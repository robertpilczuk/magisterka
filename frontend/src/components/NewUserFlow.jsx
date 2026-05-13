import { useState } from 'react'
import axios from 'axios'
import RecommendationCard from './RecommendationCard'
import { useLang } from '../LangContext'

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

export default function NewUserFlow({ API }) {
    const { t } = useLang()
    const [step, setStep] = useState(1)
    const [gender, setGender] = useState('M')
    const [age, setAge] = useState(25)
    const [occupation, setOccupation] = useState(4)
    const [ratings, setRatings] = useState({})
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [activePanel, setActivePanel] = useState('linear')

    const AGE_OPTIONS = [1, 18, 25, 35, 45, 50, 56]
    const OCC_OPTIONS = Array.from({ length: 21 }, (_, i) => i)

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

    const panelBtn = (key) => ({
        padding: '8px 20px',
        background: activePanel === key ? '#4a90d9' : '#eee',
        color: activePanel === key ? 'white' : '#666',
        border: 'none', borderRadius: '8px',
        cursor: 'pointer', fontSize: '14px'
    })

    return (
        <div>
            {/* krok 1 */}
            {step === 1 && (
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ marginBottom: '8px' }}>👤 {t('new_user.step1_title')}</h2>
                    <p style={{ color: '#666', marginBottom: '24px' }}>{t('new_user.step1_desc')}</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>{t('profile.gender')}</div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {['M', 'F'].map(g => (
                                    <button key={g} onClick={() => setGender(g)}
                                        style={{
                                            padding: '10px 24px',
                                            background: gender === g ? '#4a90d9' : '#eee',
                                            color: gender === g ? 'white' : '#666',
                                            border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px'
                                        }}>
                                        {t('gender', g === 'M' ? 'M_icon' : 'F_icon')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>{t('profile.age')}</div>
                            <select value={age} onChange={e => setAge(e.target.value)} style={inputStyle}>
                                {AGE_OPTIONS.map(v => (
                                    <option key={v} value={v}>{t('age', v)}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>{t('profile.occupation')}</div>
                            <select value={occupation} onChange={e => setOccupation(e.target.value)} style={inputStyle}>
                                {OCC_OPTIONS.map(v => (
                                    <option key={v} value={v}>{t('occupation', v)}</option>
                                ))}
                            </select>
                        </div>

                        <button onClick={() => setStep(2)}
                            style={{
                                padding: '12px 32px', background: '#4a90d9', color: 'white',
                                border: 'none', borderRadius: '8px', cursor: 'pointer',
                                fontSize: '15px', fontWeight: '600', alignSelf: 'flex-start', marginTop: '8px'
                            }}>
                            {t('new_user.next_rate')}
                        </button>
                    </div>
                </div>
            )}

            {/* krok 2 */}
            {step === 2 && (
                <div>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: '8px'
                    }}>
                        <h2 style={{ margin: 0 }}>🎬 {t('new_user.step2_title')}</h2>
                        <div style={{ fontSize: '14px', color: ratedCount >= 3 ? '#2ecc71' : '#888' }}>
                            {ratedCount >= 3 ? '✅' : '⏳'} {t('new_user.rated')}: {ratedCount} / {t('new_user.min_ratings')}
                        </div>
                    </div>
                    <p style={{ color: '#666', marginBottom: '20px' }}>{t('new_user.step2_desc')}</p>

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
                            ← {t('new_user.back')}
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
                            {loading ? `⏳ ${t('new_user.generating')}` : `🎯 ${t('new_user.generate')}`}
                        </button>
                    </div>

                    {error && (
                        <div style={{ marginTop: '12px', color: '#c00', fontSize: '14px' }}>⚠️ {error}</div>
                    )}
                </div>
            )}

            {/* krok 3 */}
            {step === 3 && results && (
                <div>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: '20px'
                    }}>
                        <h2 style={{ margin: 0 }}>🎉 {t('new_user.step3_title')}</h2>
                        <button onClick={handleReset}
                            style={{
                                padding: '8px 20px', background: '#eee', color: '#666',
                                border: 'none', borderRadius: '8px', cursor: 'pointer'
                            }}>
                            ↺ {t('new_user.reset')}
                        </button>
                    </div>

                    <div style={{
                        background: '#f8f9fa', borderRadius: '10px',
                        padding: '16px', marginBottom: '20px',
                        display: 'flex', gap: '24px', flexWrap: 'wrap'
                    }}>
                        <div>
                            <div style={{ fontSize: '12px', color: '#888' }}>{t('profile.gender')}</div>
                            <div>{t('gender', results.user_profile.gender === 'M' ? 'M_icon' : 'F_icon')}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#888' }}>{t('new_user.rated')}</div>
                            <div>🎬 {results.user_profile.ratingsGiven}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#888' }}>{t('new_user.avg_rating')}</div>
                            <div>⭐ {results.user_profile.avgRating}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#888' }}>{t('new_user.threshold')}</div>
                            <div>🎯 {results.optimal_threshold}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                        <button style={panelBtn('linear')} onClick={() => setActivePanel('linear')}>
                            📈 {t('new_user.panel_linear')}
                        </button>
                        <button style={panelBtn('logistic')} onClick={() => setActivePanel('logistic')}>
                            🎯 {t('new_user.panel_logistic')}
                        </button>
                        <button style={panelBtn('combined')} onClick={() => setActivePanel('combined')}>
                            ⚡ {t('new_user.panel_combined')}
                        </button>
                    </div>

                    {activePanel === 'linear' && (
                        <div>
                            <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                                {t('recommendations.linear_desc')}
                            </p>
                            {results.linear.map((rec, i) => (
                                <RecommendationCard key={rec.movieId} rank={i + 1} rec={rec} type="linear" />
                            ))}
                        </div>
                    )}
                    {activePanel === 'logistic' && (
                        <div>
                            <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                                {t('new_user.threshold_desc')} ({results.optimal_threshold})
                            </p>
                            {results.logistic.map((rec, i) => (
                                <RecommendationCard key={rec.movieId} rank={i + 1} rec={rec} type="logistic" />
                            ))}
                        </div>
                    )}
                    {activePanel === 'combined' && (
                        <div>
                            <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                                {t('new_user.combined_desc')}
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