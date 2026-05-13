import { useState } from 'react'
import axios from 'axios'
import RecommendationCard from './RecommendationCard'
import Spinner from './Spinner'
import GenreFilter from './GenreFilter'
import { useLang } from '../LangContext'

const SAMPLE_MOVIES = [
    { movieId: 318, title: 'Shawshank Redemption, The (1994)', genres: 'Drama' },
    { movieId: 296, title: 'Pulp Fiction (1994)', genres: 'Crime|Thriller' },
    { movieId: 2571, title: 'Matrix, The (1999)', genres: 'Action|Sci-Fi|Thriller' },
    { movieId: 260, title: 'Star Wars: Episode IV (1977)', genres: 'Action|Adventure|Sci-Fi' },
    { movieId: 527, title: "Schindler's List (1993)", genres: 'Drama|War' },
    { movieId: 593, title: 'Silence of the Lambs, The (1991)', genres: 'Drama|Thriller' },
    { movieId: 356, title: 'Forrest Gump (1994)', genres: 'Comedy|Drama|Romance' },
    { movieId: 589, title: 'Terminator 2 (1991)', genres: 'Action|Sci-Fi|Thriller' },
    { movieId: 1198, title: 'Raiders of the Lost Ark (1981)', genres: 'Action|Adventure' },
    { movieId: 3578, title: 'Gladiator (2000)', genres: 'Action|Drama' },
    { movieId: 1196, title: 'Star Wars: Episode V (1980)', genres: 'Action|Adventure|Sci-Fi' },
    { movieId: 110, title: 'Braveheart (1995)', genres: 'Action|Drama|War' },
]

function WeightSlider({ criterion, value, onChange }) {
    return (
        <div style={{ marginBottom: '16px' }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '6px'
            }}>
                <div>
                    <span style={{ fontSize: '18px', marginRight: '8px' }}>{criterion.emoji}</span>
                    <span style={{ fontWeight: '600', color: '#333' }}>{criterion.label}</span>
                    <span style={{ fontSize: '12px', color: '#888', marginLeft: '8px' }}>{criterion.desc}</span>
                </div>
                <span style={{ fontWeight: '700', color: '#4a90d9', minWidth: '32px', textAlign: 'right' }}>
                    {value}%
                </span>
            </div>
            <input
                type="range" min="0" max="100" step="5" value={value}
                onChange={e => onChange(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#4a90d9', cursor: 'pointer' }}
            />
        </div>
    )
}

function MovieRatingDeep({ movie, criteriaRatings, onRate, criteria }) {
    const hasAny = Object.values(criteriaRatings).some(v => v > 0)
    return (
        <div style={{
            background: hasAny ? '#f0f7ff' : 'white',
            border: `1px solid ${hasAny ? '#4a90d9' : '#e0e0e0'}`,
            borderRadius: '10px', padding: '14px', marginBottom: '10px'
        }}>
            <div style={{ fontWeight: '600', fontSize: '14px', color: '#333', marginBottom: '10px' }}>
                {movie.title}
                <span style={{ fontSize: '11px', color: '#888', fontWeight: 'normal', marginLeft: '8px' }}>
                    {movie.genres.replace(/\|/g, ' · ')}
                </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {criteria.map(c => (
                    <div key={c.key}>
                        <div style={{ fontSize: '11px', color: '#888', marginBottom: '3px' }}>
                            {c.emoji} {c.label}
                        </div>
                        <div style={{ display: 'flex', gap: '3px' }}>
                            {[0, 1, 2, 3, 4, 5].map(star => (
                                <button key={star} onClick={() => onRate(movie.movieId, c.key, star)}
                                    style={{
                                        width: '22px', height: '22px', fontSize: '10px',
                                        background: (criteriaRatings[c.key] || 0) >= star && star > 0
                                            ? '#4a90d9' : '#f0f0f0',
                                        color: (criteriaRatings[c.key] || 0) >= star && star > 0
                                            ? 'white' : '#aaa',
                                        border: 'none', borderRadius: '4px',
                                        cursor: 'pointer', fontWeight: '600'
                                    }}>
                                    {star === 0 ? '–' : star}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function DeepAnalysisFlow({ API }) {
    const { t } = useLang()

    const CRITERIA = [
        { key: 'plot', label: t('deep.criteria.plot'), desc: t('deep.criteria_desc.plot'), emoji: '📖' },
        { key: 'acting', label: t('deep.criteria.acting'), desc: t('deep.criteria_desc.acting'), emoji: '🎭' },
        { key: 'visuals', label: t('deep.criteria.visuals'), desc: t('deep.criteria_desc.visuals'), emoji: '🎨' },
        { key: 'music', label: t('deep.criteria.music'), desc: t('deep.criteria_desc.music'), emoji: '🎵' },
        { key: 'emotions', label: t('deep.criteria.emotions'), desc: t('deep.criteria_desc.emotions'), emoji: '❤️' },
        { key: 'originality', label: t('deep.criteria.originality'), desc: t('deep.criteria_desc.originality'), emoji: '✨' },
    ]

    const AGE_OPTIONS = [1, 18, 25, 35, 45, 50, 56]
    const OCC_OPTIONS = Array.from({ length: 21 }, (_, i) => i)

    const [step, setStep] = useState(1)
    const [gender, setGender] = useState('M')
    const [age, setAge] = useState(25)
    const [occupation, setOccupation] = useState(4)
    const [weights, setWeights] = useState({
        plot: 50, acting: 50, visuals: 30, music: 30, emotions: 50, originality: 40
    })
    const [movieRatings, setMovieRatings] = useState({})
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [excludedGenres, setExcludedGenres] = useState([])

    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
    const ratedMoviesCount = Object.values(movieRatings)
        .filter(r => Object.values(r).some(v => v > 0)).length

    function setWeight(key, val) { setWeights(prev => ({ ...prev, [key]: val })) }

    function setMovieRating(movieId, criterion, value) {
        setMovieRatings(prev => ({
            ...prev,
            [movieId]: { ...(prev[movieId] || {}), [criterion]: value }
        }))
    }

    function computeWeightedRating(criteriaRatings) {
        let weightedSum = 0, weightSum = 0
        for (const c of CRITERIA) {
            const rating = criteriaRatings[c.key] || 0
            const weight = weights[c.key] || 0
            if (rating > 0) { weightedSum += rating * weight; weightSum += weight }
        }
        if (weightSum === 0) return null
        return weightedSum / weightSum
    }

    async function handleSubmit() {
        const ratingsPayload = []
        for (const [movieIdStr, criteriaRatings] of Object.entries(movieRatings)) {
            const weighted = computeWeightedRating(criteriaRatings)
            if (weighted !== null) {
                ratingsPayload.push({ movieId: parseInt(movieIdStr), rating: parseFloat(weighted.toFixed(2)) })
            }
        }
        if (ratingsPayload.length < 3) {
            setError('Oceń co najmniej 3 filmy')
            return
        }
        setLoading(true)
        setError(null)
        try {
            const res = await axios.post(`${API}/recommend-new-user`, {
                ratings: ratingsPayload, age: parseInt(age), gender, occupation: parseInt(occupation)
            })
            setResults({ ...res.data, ratingsPayload, weights })
            setStep(4)
        } catch (err) {
            setError(err.response?.data?.detail || 'Błąd generowania rekomendacji')
        } finally {
            setLoading(false)
        }
    }

    function handleReset() {
        setStep(1); setMovieRatings({}); setResults(null); setError(null)
        setWeights({ plot: 50, acting: 50, visuals: 30, music: 30, emotions: 50, originality: 40 })
    }

    function filterByGenre(recs) {
        if (excludedGenres.length === 0) return recs
        return recs.filter(rec => !excludedGenres.some(g => rec.genres.includes(g)))
    }

    const inputStyle = {
        padding: '8px 12px', borderRadius: '8px',
        border: '2px solid #ddd', fontSize: '14px',
        background: 'white', color: '#333', minWidth: '180px'
    }

    const stepIndicator = (n, label) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: step >= n ? '#4a90d9' : '#e0e0e0',
                color: step >= n ? 'white' : '#aaa',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: '700', flexShrink: 0
            }}>{n}</div>
            <span style={{
                fontSize: '13px', color: step >= n ? '#333' : '#aaa',
                fontWeight: step === n ? '600' : 'normal'
            }}>{label}</span>
        </div>
    )

    return (
        <div>
            {/* pasek kroków */}
            <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
                {stepIndicator(1, t('deep.step1'))}
                <div style={{ width: '32px', height: '2px', background: '#e0e0e0' }} />
                {stepIndicator(2, t('deep.step2'))}
                <div style={{ width: '32px', height: '2px', background: '#e0e0e0' }} />
                {stepIndicator(3, t('deep.step3'))}
                <div style={{ width: '32px', height: '2px', background: '#e0e0e0' }} />
                {stepIndicator(4, t('deep.step4'))}
            </div>

            {/* KROK 1 */}
            {step === 1 && (
                <div style={{ maxWidth: '560px' }}>
                    <h2 style={{ marginBottom: '8px' }}>👤 {t('new_user.step1_title')}</h2>
                    <p style={{ color: '#666', marginBottom: '24px' }}>{t('new_user.step1_desc')}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>{t('profile.gender')}</div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {['M', 'F'].map(g => (
                                    <button key={g} onClick={() => setGender(g)} style={{
                                        padding: '10px 24px',
                                        background: gender === g ? '#4a90d9' : '#eee',
                                        color: gender === g ? 'white' : '#666',
                                        border: 'none', borderRadius: '8px', cursor: 'pointer'
                                    }}>
                                        {t('gender', g === 'M' ? 'M_icon' : 'F_icon')}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>{t('profile.age')}</div>
                            <select value={age} onChange={e => setAge(e.target.value)} style={inputStyle}>
                                {AGE_OPTIONS.map(v => <option key={v} value={v}>{t('age', v)}</option>)}
                            </select>
                        </div>
                        <div>
                            <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>{t('profile.occupation')}</div>
                            <select value={occupation} onChange={e => setOccupation(e.target.value)} style={inputStyle}>
                                {OCC_OPTIONS.map(v => <option key={v} value={v}>{t('occupation', v)}</option>)}
                            </select>
                        </div>
                        <button onClick={() => setStep(2)} style={{
                            padding: '12px 32px', background: '#4a90d9', color: 'white',
                            border: 'none', borderRadius: '8px', cursor: 'pointer',
                            fontSize: '15px', fontWeight: '600', alignSelf: 'flex-start'
                        }}>
                            {t('new_user.next_rate')}
                        </button>
                    </div>
                </div>
            )}

            {/* KROK 2 */}
            {step === 2 && (
                <div style={{ maxWidth: '640px' }}>
                    <h2 style={{ marginBottom: '8px' }}>⚖️ {t('deep.weights_title')}</h2>
                    <p style={{ color: '#666', marginBottom: '8px' }}>{t('deep.weights_desc')}</p>
                    <div style={{
                        fontSize: '12px', color: '#888', marginBottom: '20px',
                        padding: '10px', background: '#f0f7ff',
                        borderRadius: '8px', border: '1px solid #cce0ff'
                    }}>
                        💡 {t('deep.weights_hint')}
                    </div>
                    {CRITERIA.map(c => (
                        <WeightSlider key={c.key} criterion={c}
                            value={weights[c.key]} onChange={val => setWeight(c.key, val)} />
                    ))}
                    <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                            {t('deep.weights_total')} {totalWeight} {t('deep.weights_points')}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {CRITERIA.map(c => {
                                const pct = totalWeight > 0 ? Math.round(weights[c.key] / totalWeight * 100) : 0
                                return (
                                    <div key={c.key} style={{
                                        padding: '4px 10px', background: '#e8f4fd',
                                        borderRadius: '20px', fontSize: '12px', color: '#4a90d9'
                                    }}>
                                        {c.emoji} {c.label}: {pct}%
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => setStep(1)} style={{
                            padding: '10px 20px', background: '#eee', color: '#666',
                            border: 'none', borderRadius: '8px', cursor: 'pointer'
                        }}>← {t('new_user.back')}</button>
                        <button onClick={() => setStep(3)} style={{
                            padding: '12px 32px', background: '#4a90d9', color: 'white',
                            border: 'none', borderRadius: '8px', cursor: 'pointer',
                            fontSize: '15px', fontWeight: '600'
                        }}>{t('deep.rate_title').split('—')[0].trim()} →</button>
                    </div>
                </div>
            )}

            {/* KROK 3 */}
            {step === 3 && (
                <div>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: '8px'
                    }}>
                        <h2 style={{ margin: 0 }}>🎬 {t('deep.rate_title')}</h2>
                        <div style={{ fontSize: '14px', color: ratedMoviesCount >= 3 ? '#2ecc71' : '#888' }}>
                            {ratedMoviesCount >= 3 ? '✅' : '⏳'} {t('new_user.rated')}: {ratedMoviesCount} / {t('new_user.min_ratings')}
                        </div>
                    </div>
                    <p style={{ color: '#666', marginBottom: '20px' }}>{t('deep.rate_desc')}</p>

                    {SAMPLE_MOVIES.map(movie => (
                        <MovieRatingDeep
                            key={movie.movieId} movie={movie}
                            criteriaRatings={movieRatings[movie.movieId] || {}}
                            onRate={setMovieRating} criteria={CRITERIA}
                        />
                    ))}

                    {ratedMoviesCount > 0 && (
                        <div style={{ background: '#f8f9fa', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                            <div style={{ fontSize: '13px', color: '#888', marginBottom: '10px', fontWeight: '600' }}>
                                {t('deep.preview_title')}
                            </div>
                            {SAMPLE_MOVIES.map(movie => {
                                const cr = movieRatings[movie.movieId]
                                if (!cr) return null
                                const weighted = computeWeightedRating(cr)
                                if (weighted === null) return null
                                return (
                                    <div key={movie.movieId} style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        padding: '6px 0', borderBottom: '1px solid #eee',
                                        fontSize: '13px', color: '#333'
                                    }}>
                                        <span>{movie.title}</span>
                                        <span style={{ fontWeight: '700', color: '#4a90d9' }}>
                                            {(weighted * 2).toFixed(1)}/10
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {error && <div style={{ color: '#c00', fontSize: '14px', marginBottom: '12px' }}>⚠️ {error}</div>}

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button onClick={() => setStep(2)} style={{
                            padding: '10px 20px', background: '#eee', color: '#666',
                            border: 'none', borderRadius: '8px', cursor: 'pointer'
                        }}>← {t('new_user.back')}</button>
                        <button onClick={handleSubmit}
                            disabled={ratedMoviesCount < 3 || loading}
                            style={{
                                padding: '12px 32px',
                                background: ratedMoviesCount >= 3 ? '#4a90d9' : '#ccc',
                                color: 'white', border: 'none', borderRadius: '8px',
                                cursor: ratedMoviesCount >= 3 ? 'pointer' : 'not-allowed',
                                fontSize: '15px', fontWeight: '600',
                                display: 'flex', alignItems: 'center', gap: '10px'
                            }}>
                            {loading && <Spinner size={18} color="white" />}
                            {loading ? t('new_user.generating') : `🔬 ${t('new_user.generate')}`}
                        </button>
                    </div>
                </div>
            )}

            {/* KROK 4 */}
            {step === 4 && results && (
                <div>
                    <GenreFilter selected={excludedGenres} onChange={setExcludedGenres} />
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: '20px'
                    }}>
                        <h2 style={{ margin: 0 }}>🎉 {t('new_user.step3_title')}</h2>
                        <button onClick={handleReset} style={{
                            padding: '8px 20px', background: '#eee', color: '#666',
                            border: 'none', borderRadius: '8px', cursor: 'pointer'
                        }}>↺ {t('new_user.reset')}</button>
                    </div>

                    <div style={{ background: '#f8f9fa', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                        <div style={{ fontSize: '13px', color: '#888', marginBottom: '10px', fontWeight: '600' }}>
                            {t('deep.results_weights')}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {CRITERIA.map(c => {
                                const total = Object.values(results.weights).reduce((a, b) => a + b, 0)
                                const pct = total > 0 ? Math.round(results.weights[c.key] / total * 100) : 0
                                return (
                                    <div key={c.key} style={{
                                        padding: '6px 12px', background: 'white',
                                        border: '1px solid #e0e0e0', borderRadius: '20px',
                                        fontSize: '13px', color: '#333'
                                    }}>
                                        {c.emoji} {c.label}:
                                        <span style={{ color: '#4a90d9', fontWeight: '700', marginLeft: '4px' }}>{pct}%</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div style={{ background: '#f8f9fa', borderRadius: '10px', padding: '16px', marginBottom: '24px' }}>
                        <div style={{ fontSize: '13px', color: '#888', marginBottom: '10px', fontWeight: '600' }}>
                            {t('deep.results_ratings')}
                        </div>
                        {results.ratingsPayload.map(r => {
                            const movie = SAMPLE_MOVIES.find(m => m.movieId === r.movieId)
                            return (
                                <div key={r.movieId} style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    padding: '5px 0', borderBottom: '1px solid #eee',
                                    fontSize: '13px', color: '#333'
                                }}>
                                    <span>{movie?.title || r.movieId}</span>
                                    <span style={{ fontWeight: '700', color: '#4a90d9' }}>
                                        {(r.rating * 2).toFixed(1)}/10
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div>
                            <h3 style={{ borderBottom: '2px solid #4a90d9', paddingBottom: '8px' }}>
                                📈 {t('new_user.panel_linear')}
                            </h3>
                            <p style={{ color: '#666', fontSize: '13px', marginBottom: '12px' }}>
                                {t('recommendations.linear_desc')}
                            </p>
                            {filterByGenre(results.linear).map((rec, i) => (
                                <RecommendationCard key={rec.movieId} rank={i + 1} rec={rec} type="linear" />
                            ))}
                        </div>
                        <div>
                            <h3 style={{ borderBottom: '2px solid #e87040', paddingBottom: '8px' }}>
                                🎯 {t('new_user.panel_logistic')}
                            </h3>
                            <p style={{ color: '#666', fontSize: '13px', marginBottom: '12px' }}>
                                {t('new_user.threshold_desc')} ({results.optimal_threshold})
                            </p>
                            {filterByGenre(results.logistic).map((rec, i) => (
                                <RecommendationCard key={rec.movieId} rank={i + 1} rec={rec} type="logistic" />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}