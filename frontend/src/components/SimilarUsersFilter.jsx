import { useState } from 'react'
import axios from 'axios'
import Spinner from './Spinner'
import Tooltip from './Tooltip'
import { getRatingStyle } from '../utils'
import { useLang } from '../LangContext'

export default function SimilarUsersFilter({ API, onSelectUser }) {
    const { t } = useLang()
    const [gender, setGender] = useState('')
    const [age, setAge] = useState('')
    const [occupation, setOccupation] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)

    const AGE_OPTIONS = [
        { value: 1 }, { value: 18 }, { value: 25 }, { value: 35 },
        { value: 45 }, { value: 50 }, { value: 56 }
    ]

    const OCC_OPTIONS = Array.from({ length: 21 }, (_, i) => ({ value: i }))

    const selectStyle = {
        padding: '8px 12px', borderRadius: '8px',
        border: '2px solid #ddd', fontSize: '14px',
        background: 'white', cursor: 'pointer',
        minWidth: '180px', color: '#333'
    }

    async function handleSearch() {
        setLoading(true)
        setSearched(true)
        try {
            const params = {}
            if (gender) params.gender = gender
            if (age) params.age = parseInt(age)
            if (occupation) params.occupation = parseInt(occupation)
            const res = await axios.get(`${API}/similar-users`, { params })
            setResults(res.data.users)
        } catch {
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    function handleReset() {
        setGender('')
        setAge('')
        setOccupation('')
        setResults([])
        setSearched(false)
    }

    return (
        <div style={{
            background: '#f8f9fa', border: '1px solid #e0e0e0',
            borderRadius: '12px', padding: '20px', marginBottom: '24px'
        }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>
                🔍 {t('similar.title')}
            </h3>

            <div style={{
                display: 'flex', gap: '12px', flexWrap: 'wrap',
                alignItems: 'flex-end', marginBottom: '16px'
            }}>
                <div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{t('similar.gender_label')}</div>
                    <select value={gender} onChange={e => setGender(e.target.value)} style={selectStyle}>
                        <option value="">{t('similar.any_gender')}</option>
                        <option value="M">{t('gender', 'M')}</option>
                        <option value="F">{t('gender', 'F')}</option>
                    </select>
                </div>

                <div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{t('similar.age_label')}</div>
                    <select value={age} onChange={e => setAge(e.target.value)} style={selectStyle}>
                        <option value="">{t('similar.any_age')}</option>
                        {AGE_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{t('age', o.value)}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{t('similar.occ_label')}</div>
                    <select value={occupation} onChange={e => setOccupation(e.target.value)} style={selectStyle}>
                        <option value="">{t('similar.any_occ')}</option>
                        {OCC_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{t('occupation', o.value)}</option>
                        ))}
                    </select>
                </div>

                <button onClick={handleSearch} disabled={loading}
                    style={{
                        padding: '8px 20px', background: '#4a90d9', color: 'white',
                        border: 'none', borderRadius: '8px', cursor: 'pointer',
                        fontSize: '14px', height: '38px',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                    {loading ? <Spinner size={16} color="white" /> : '🔍'}
                    {loading ? t('similar.loading') : t('similar.button')}
                </button>

                {searched && (
                    <button onClick={handleReset}
                        style={{
                            padding: '8px 16px', background: '#eee', color: '#666',
                            border: 'none', borderRadius: '8px', cursor: 'pointer',
                            fontSize: '14px', height: '38px'
                        }}>
                        ✕ {t('similar.reset')}
                    </button>
                )}
            </div>

            {searched && !loading && results.length === 0 && (
                <div style={{ color: '#888', fontSize: '14px' }}>
                    {t('similar.no_results')}
                </div>
            )}

            {results.length > 0 && (
                <>
                    <div style={{ fontSize: '13px', color: '#888', marginBottom: '10px' }}>
                        {t('similar.found')} {results.length} {t('similar.found_suffix')}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {results.map(u => {
                            const label = getRatingStyle(u.avgRating, t)
                            const score10 = Math.round(u.avgRating * 2)
                            return (
                                <button key={u.userId} onClick={() => onSelectUser(u.userId)}
                                    style={{
                                        padding: '10px 14px', background: 'white',
                                        border: '1px solid #ddd', borderRadius: '10px',
                                        cursor: 'pointer', fontSize: '13px', textAlign: 'left',
                                        transition: 'all 0.2s', color: '#333'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = '#4a90d9'
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(74,144,217,0.15)'
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = '#ddd'
                                        e.currentTarget.style.boxShadow = 'none'
                                    }}
                                >
                                    <div style={{ fontWeight: '700', color: '#333', marginBottom: '2px' }}>
                                        {t('similar.user_prefix')}{u.userId}
                                    </div>
                                    <div style={{ color: '#555', fontSize: '12px', marginBottom: '4px' }}>
                                        {u.gender === 'M' ? '👨' : '👩'} {t('age', u.age)}
                                        · {t('occupation', u.occupation)}
                                    </div>
                                    <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                                        <span style={{ color: '#888' }}>{t('similar.ratings_label')} </span>
                                        <span style={{ color: '#333', fontWeight: '600' }}>{u.ratingsCount}</span>
                                    </div>
                                    <div style={{ fontSize: '12px' }}>
                                        <span style={{ color: '#888' }}>{t('similar.style_label')} </span>
                                        <Tooltip text={label.desc}>
                                            <span style={{
                                                color: label.color, fontWeight: '600',
                                                borderBottom: `1px dashed ${label.color}`,
                                                cursor: 'help'
                                            }}>
                                                {score10}/10 — {label.text}
                                            </span>
                                        </Tooltip>
                                    </div>
                                    <div style={{
                                        marginTop: '6px', background: '#f0f0f0',
                                        borderRadius: '4px', height: '4px', overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${score10 * 10}%`, height: '100%',
                                            background: label.color, borderRadius: '4px'
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