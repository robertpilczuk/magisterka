import { useState } from 'react'
import axios from 'axios'
import { useLang } from '../LangContext'

const API = 'http://localhost:8000'

export default function RecommendationCard({ rank, rec, type, userId }) {
    const { t } = useLang()
    const isLinear = type === 'linear'
    const accentColor = isLinear ? '#4a90d9' : '#e87040'

    const score = isLinear
        ? `⭐ ${rec.predicted_rating.toFixed(2)} / 5.00`
        : `🎯 ${(rec.like_probability * 100).toFixed(1)}% ${t('recommendations.like_chance')}`

    const barWidth = isLinear
        ? (rec.predicted_rating / 5) * 100
        : rec.like_probability * 100

    const [showWhy, setShowWhy] = useState(false)
    const [explanation, setExplanation] = useState(null)
    const [whyLoading, setWhyLoading] = useState(false)

    async function fetchWhy() {
        if (explanation) { setShowWhy(s => !s); return }
        setWhyLoading(true)
        try {
            const res = await axios.get(`${API}/explain/${userId}/${rec.movieId}`)
            setExplanation(res.data)
            setShowWhy(true)
        } catch { } finally {
            setWhyLoading(false)
        }
    }

    return (
        <div style={{
            background: 'white', border: '1px solid #e0e0e0',
            borderRadius: '10px', padding: '14px 16px',
            marginBottom: '10px', borderLeft: `4px solid ${accentColor}`
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                            background: accentColor, color: 'white',
                            borderRadius: '50%', width: '22px', height: '22px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: 'bold', flexShrink: 0
                        }}>{rank}</span>
                        <span style={{ fontWeight: '600', fontSize: '15px' }}>{rec.title}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', paddingLeft: '30px' }}>
                        {rec.genres.replace(/\|/g, ' · ')}
                    </div>
                </div>
                {userId && (
                    <button onClick={fetchWhy} disabled={whyLoading}
                        style={{
                            padding: '4px 10px', background: showWhy ? accentColor : '#f0f0f0',
                            color: showWhy ? 'white' : '#666',
                            border: 'none', borderRadius: '8px',
                            cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                            marginLeft: '8px', flexShrink: 0
                        }}>
                        {whyLoading ? t('why_loading') : t('why_button')}
                    </button>
                )}
            </div>

            <div style={{ paddingLeft: '30px' }}>
                <div style={{ fontSize: '13px', color: accentColor, fontWeight: '600', marginBottom: '4px' }}>
                    {score}
                </div>
                <div style={{ background: '#f0f0f0', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                    <div style={{
                        width: `${barWidth}%`, height: '100%',
                        background: accentColor, borderRadius: '4px',
                        transition: 'width 0.4s ease'
                    }} />
                </div>
            </div>

            {showWhy && explanation && (
                <div style={{
                    marginTop: '10px', paddingLeft: '30px',
                    borderTop: '1px solid #f0f0f0', paddingTop: '10px'
                }}>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', fontWeight: '600' }}>
                        🤔 {t('why_title')}
                    </div>
                    {explanation.top_features.map((f, i) => (
                        <div key={i} style={{
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', marginBottom: '6px'
                        }}>
                            <span style={{ fontSize: '12px', color: '#555' }}>
                                {f.direction === '+' ? '✅' : '❌'} {f.feature}
                            </span>
                            <span style={{
                                fontSize: '11px', fontWeight: '600',
                                color: f.direction === '+' ? '#2ecc71' : '#e74c3c'
                            }}>
                                {f.direction === '+' ? t('why_positive') : t('why_negative')}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}