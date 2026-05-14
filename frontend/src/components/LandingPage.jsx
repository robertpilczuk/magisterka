import { useLang } from '../LangContext'

const CONTENT_TYPES = [
    {
        key: 'movies',
        emoji: '🎬',
        available: true,
        color: '#4a90d9',
    },
    {
        key: 'series',
        emoji: '📺',
        available: false,
        color: '#e87040',
    },
    {
        key: 'books',
        emoji: '📚',
        available: true,
        color: '#2ecc71',
    },
]

function ContentCard({ type, onSelect }) {
    const { t } = useLang()
    const isAvailable = type.available

    return (
        <div
            onClick={() => isAvailable && onSelect(type.key)}
            style={{
                background: 'white',
                border: `2px solid ${isAvailable ? type.color : '#e0e0e0'}`,
                borderRadius: '16px',
                padding: '32px 24px',
                textAlign: 'center',
                cursor: isAvailable ? 'pointer' : 'not-allowed',
                opacity: isAvailable ? 1 : 0.6,
                transition: 'all 0.2s',
                position: 'relative',
                flex: '1',
                minWidth: '220px',
                maxWidth: '300px',
            }}
            onMouseEnter={e => {
                if (isAvailable) {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = `0 8px 24px ${type.color}33`
                }
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
            }}
        >
            {!isAvailable && (
                <div style={{
                    position: 'absolute', top: '12px', right: '12px',
                    background: '#f39c12', color: 'white',
                    fontSize: '11px', fontWeight: '700',
                    padding: '3px 8px', borderRadius: '20px',
                }}>
                    {t('landing.coming_soon')}
                </div>
            )}
            {isAvailable && (
                <div style={{
                    position: 'absolute', top: '12px', right: '12px',
                    background: '#2ecc71', color: 'white',
                    fontSize: '11px', fontWeight: '700',
                    padding: '3px 8px', borderRadius: '20px',
                }}>
                    {t('landing.available')}
                </div>
            )}

            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                {type.emoji}
            </div>
            <div style={{
                fontSize: '22px', fontWeight: '700',
                color: isAvailable ? type.color : '#aaa',
                marginBottom: '12px',
            }}>
                {t('landing', type.key)}
            </div>
            <div style={{
                fontSize: '13px', color: '#666',
                lineHeight: '1.6',
            }}>
                {t('landing', `${type.key}_desc`)}
            </div>
        </div>
    )
}

function AboutSection({ t }) {
    return (
        <div style={{
            marginTop: '64px',
            background: '#f8f9fa',
            border: '1px solid #e0e0e0',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '800px',
            margin: '64px auto 0',
        }}>
            <h2 style={{ marginTop: 0, color: '#333', marginBottom: '16px' }}>
                ℹ️ {t('landing.about_title')}
            </h2>
            <p style={{ color: '#555', lineHeight: '1.7', marginBottom: '24px' }}>
                {t('landing.about_desc')}
            </p>
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                <div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {t('landing.about_stack')}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {['Python', 'scikit-learn', 'FastAPI', 'React', 'TypeScript', 'PostgreSQL'].map(tech => (
                            <span key={tech} style={{
                                padding: '4px 10px', background: '#e8f4fd',
                                color: '#4a90d9', borderRadius: '20px',
                                fontSize: '12px', fontWeight: '600',
                            }}>
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {t('landing.about_dataset')}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {['MovieLens 1M', 'Book-Crossing'].map(ds => (
                            <span key={ds} style={{
                                padding: '4px 10px', background: '#f0fdf4',
                                color: '#2ecc71', borderRadius: '20px',
                                fontSize: '12px', fontWeight: '600',
                                border: '1px solid #2ecc71',
                            }}>
                                {ds}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function LandingPage({ onSelect }) {
    const { t, lang, setLang } = useLang()

    return (

        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e8f4fd 100%)',
            padding: '48px 24px',
        }}>
            <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 1000 }}>
                <button onClick={() => setLang(lang === 'PL' ? 'EN' : 'PL')} style={{
                    padding: '6px 14px', borderRadius: '20px',
                    border: '2px solid #333', background: 'white',
                    cursor: 'pointer', fontSize: '13px', fontWeight: '700',
                    color: '#333', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                    {lang === 'PL' ? '🇬🇧 EN' : '🇵🇱 PL'}
                </button>
            </div>
            {/* hero */}
            <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 56px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎓</div>
                <h1 style={{
                    fontSize: '36px', fontWeight: '800',
                    color: '#1a1a2e', marginBottom: '12px', lineHeight: '1.2',
                }}>
                    {t('landing.hero_title')}
                </h1>
                <p style={{
                    fontSize: '14px', color: '#4a90d9',
                    fontWeight: '600', marginBottom: '16px',
                    fontStyle: 'italic',
                }}>
                    {t('landing.hero_subtitle')}
                </p>
                <p style={{
                    fontSize: '16px', color: '#555',
                    lineHeight: '1.7', maxWidth: '560px', margin: '0 auto',
                }}>
                    {t('landing.hero_desc')}
                </p>
            </div>

            {/* kafelki */}
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <h2 style={{
                    textAlign: 'center', color: '#333',
                    marginBottom: '32px', fontSize: '20px',
                }}>
                    {t('landing.choose')}
                </h2>
                <div style={{
                    display: 'flex', gap: '24px',
                    justifyContent: 'center', flexWrap: 'wrap',
                }}>
                    {CONTENT_TYPES.map(type => (
                        <ContentCard key={type.key} type={type} onSelect={onSelect} />
                    ))}
                </div>
            </div>

            <AboutSection t={t} />
        </div>
    )
}