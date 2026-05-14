import { useState } from 'react'
import axios from 'axios'
import { useLang } from '../LangContext'
import Spinner from './Spinner'

const API = 'http://localhost:8000'

const AGE_RANGES = [
    { label: '<18',   min: 5,  max: 17  },
    { label: '18–25', min: 18, max: 25  },
    { label: '26–35', min: 26, max: 35  },
    { label: '36–45', min: 36, max: 45  },
    { label: '46–55', min: 46, max: 55  },
    { label: '56+',   min: 56, max: 90  },
]

const MIN_RATINGS_OPTIONS = [20, 50, 100, 200, 500]

export default function SimilarBooksUsersFilter({ onSelectUser }) {
    const { t } = useLang()
    const [ageRange, setAgeRange]       = useState('')
    const [minRatings, setMinRatings]   = useState('')
    const [results, setResults]         = useState([])
    const [loading, setLoading]         = useState(false)
    const [searched, setSearched]       = useState(false)

    const selectStyle = {
        padding: '8px 12px', borderRadius: '8px',
        border: '2px solid #ddd', fontSize: '14px',
        background: 'white', cursor: 'pointer',
        minWidth: '160px', color: '#333'
    }

    async function handleSearch() {
        setLoading(true); setSearched(true)
        try {
            const params = {}
            if (ageRange) {
                const range = AGE_RANGES.find(r => r.label === ageRange)
                if (range) { params.age_min = range.min; params.age_max = range.max }
            }
            if (minRatings) params.min_ratings = parseInt(minRatings)
            const res = await axios.get(`${API}/books/similar-users`, { params })
            setResults(res.data.users)
        } catch {
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    function handleReset() {
        setAgeRange(''); setMinRatings('')
        setResults([]); setSearched(false)
    }

    const ratingColor = (avg) =>
        avg >= 8 ? '#8e44ad' : avg >= 6 ? '#27ae60' : avg >= 4 ? '#e67e22' : '#c0392b'

    return (
        <div style={{
            background: '#f8f9fa', border: '1px solid #e0e0e0',
            borderRadius: '12px', padding: '20px', marginBottom: '24px'
        }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>
                🔍 {t('books_similar.title')}
            </h3>

            <div style={{
                display: 'flex', gap: '12px', flexWrap: 'wrap',
                alignItems: 'flex-end', marginBottom: '16px'
            }}>
                <div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                        {t('books_similar.age_min')} – {t('books_similar.age_max')}
                    </div>
                    <select value={ageRange} onChange={e => setAgeRange(e.target.value)} style={selectStyle}>
                        <option value="">{t('books_similar.any')}</option>
                        {AGE_RANGES.map(r => (
                            <option key={r.label} value={r.label}>{r.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                        {t('books_similar.min_ratings')}
                    </div>
                    <select value={minRatings} onChange={e => setMinRatings(e.target.value)} style={selectStyle}>
                        <option value="">{t('books_similar.any')}</option>
                        {MIN_RATINGS_OPTIONS.map(v => (
                            <option key={v} value={v}>{v}+</option>
                        ))}
                    </select>
                </div>

                <button onClick={handleSearch} disabled={loading}
                    style={{
                        padding: '8px 20px', background: '#2ecc71', color: 'white',
                        border: 'none', borderRadius: '8px', cursor: 'pointer',
                        fontSize: '14px', height: '38px',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                    {loading ? <Spinner size={16} color="white" /> : '🔍'}
                    {loading ? t('books_similar.loading') : t('books_similar.button')}
                </button>

                {searched && (
                    <button onClick={handleReset}
                        style={{
                            padding: '8px 16px', background: '#eee', color: '#666',
                            border: 'none', borderRadius: '8px', cursor: 'pointer',
                            fontSize: '14px', height: '38px'
                        }}>
                        ✕ {t('books_similar.reset')}
                    </button>
                )}
            </div>

            {searched && !loading && results.length === 0 && (
                <div style={{ color: '#888', fontSize: '14px' }}>
                    {t('books_similar.no_results')}
                </div>
            )}

            {results.length > 0 && (
                <>
                    <div style={{ fontSize: '13px', color: '#888', marginBottom: '10px' }}>
                        {t('books_similar.found')} {results.length} {t('books_similar.found_suffix')}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {results.map(u => {
                            const color = ratingColor(u.avgRating)
                            return (
                                <button key={u.userId} onClick={() => onSelectUser(u.userId)}
                                    style={{
                                        padding: '10px 14px', background: 'white',
                                        border: '1px solid #ddd', borderRadius: '10px',
                                        cursor: 'pointer', fontSize: '13px', textAlign: 'left',
                                        transition: 'all 0.2s', color: '#333'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = '#2ecc71'
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(46,204,113,0.2)'
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = '#ddd'
                                        e.currentTarget.style.boxShadow = 'none'
                                    }}
                                >
                                    <div style={{ fontWeight: '700', color: '#333', marginBottom: '2px' }}>
                                        {t('books_similar.user_prefix')}{u.userId}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#555', marginBottom: '4px' }}>
                                        👤 {u.age} lat
                                    </div>
                                    <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                                        <span style={{ color: '#888' }}>{t('books_similar.ratings_label')} </span>
                                        <span style={{ color: '#333', fontWeight: '600' }}>{u.ratingsCount}</span>
                                    </div>
                                    <div style={{ fontSize: '12px' }}>
                                        <span style={{ color: '#888' }}>{t('books_similar.avg_label')} </span>
                                        <span style={{ color, fontWeight: '600' }}>{u.avgRating}/10</span>
                                    </div>
                                    <div style={{
                                        marginTop: '6px', background: '#f0f0f0',
                                        borderRadius: '4px', height: '4px', overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${u.avgRating * 10}%`, height: '100%',
                                            background: color, borderRadius: '4px'
                                        }} />
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}
