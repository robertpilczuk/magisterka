import { useLang } from '../LangContext'

const MODELS = [
    {
        emoji: '📈',
        name: 'Linear Regression',
        color: '#4a90d9',
        metrics: { films: { rmse: '0.9120', mae: '0.7177', r2: '0.352' }, books: { rmse: '1.3379', mae: '1.0132', r2: '0.416' } },
        descKey: 'linear_desc',
    },
    {
        emoji: '🎯',
        name: 'Logistic Regression',
        color: '#e87040',
        metrics: { films: { threshold: '~0.4' }, books: { threshold: '0.4006' } },
        descKey: 'logistic_desc',
    },
    {
        emoji: '🏔️',
        name: 'Ridge',
        color: '#9b59b6',
        metrics: { films: { rmse: '0.9120', mae: '0.7177', r2: '0.352' }, books: { rmse: '1.3379', mae: '1.0132', r2: '0.416' } },
        descKey: 'linear_desc',
    },
    {
        emoji: '🪢',
        name: 'Lasso',
        color: '#16a085',
        metrics: { films: { rmse: '0.9129', mae: '0.7192', r2: '0.3508' }, books: { rmse: '1.3380', mae: '1.0143', r2: '0.416' } },
        descKey: 'linear_desc',
    },
]

const TECH_STACK = [
    { category: 'Backend', items: ['Python 3.12', 'FastAPI', 'scikit-learn', 'pandas', 'numpy', 'joblib'] },
    { category: 'Frontend', items: ['React 18', 'Vite', 'Axios', 'i18n (PL/EN)'] },
    { category: 'Infrastructure', items: ['Docker', 'docker-compose', 'PostgreSQL'] },
    { category: 'ML / Data', items: ['LinearRegression', 'LogisticRegression', 'Ridge', 'Lasso', 'StandardScaler'] },
]

function MetricBadge({ label, value, color }) {
    return (
        <div style={{
            display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
            background: '#f8f9fa', borderRadius: '8px', padding: '6px 12px',
            border: `1px solid ${color}20`, marginRight: '8px', marginBottom: '8px'
        }}>
            <span style={{ fontSize: '11px', color: '#888' }}>{label}</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color }}>{value}</span>
        </div>
    )
}

export default function AboutPage() {
    const { t } = useLang()

    return (
        <div style={{
            maxWidth: '900px', margin: '0 auto', padding: '40px 24px',
            fontFamily: 'sans-serif'
        }}>
            {/* Hero */}
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎓</div>
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1a1a2e', marginBottom: '8px' }}>
                    {t('about.title')}
                </h1>
                <p style={{ fontSize: '15px', color: '#4a90d9', fontWeight: '600', marginBottom: '4px' }}>
                    {t('about.subtitle')}
                </p>
                <p style={{ fontSize: '14px', color: '#888' }}>
                    {t('about.university')}
                </p>
            </div>

            {/* Metodologia */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{
                    fontSize: '20px', fontWeight: '700', color: '#333',
                    borderBottom: '2px solid #4a90d9', paddingBottom: '8px', marginBottom: '16px'
                }}>
                    🔬 {t('about.methodology_title')}
                </h2>
                <p style={{ color: '#555', lineHeight: '1.7', fontSize: '15px' }}>
                    {t('about.methodology_desc')}
                </p>
            </section>

            {/* Modele */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{
                    fontSize: '20px', fontWeight: '700', color: '#333',
                    borderBottom: '2px solid #4a90d9', paddingBottom: '8px', marginBottom: '16px'
                }}>
                    🤖 {t('about.models_title')}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '16px' }}>
                    {MODELS.map(model => (
                        <div key={model.name} style={{
                            background: 'white', borderRadius: '12px', padding: '20px',
                            border: `2px solid ${model.color}30`,
                            borderLeft: `4px solid ${model.color}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <span style={{ fontSize: '24px' }}>{model.emoji}</span>
                                <span style={{ fontSize: '16px', fontWeight: '700', color: model.color }}>
                                    {model.name}
                                </span>
                            </div>
                            <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px', lineHeight: '1.5' }}>
                                {t(`about.${model.descKey}`)}
                            </p>
                            {model.metrics.films?.rmse && (
                                <div>
                                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px', fontWeight: '600' }}>
                                        🎬 Filmy
                                    </div>
                                    <MetricBadge label="RMSE" value={model.metrics.films.rmse} color={model.color} />
                                    <MetricBadge label="MAE"  value={model.metrics.films.mae}  color={model.color} />
                                    <MetricBadge label="R²"   value={model.metrics.films.r2}   color={model.color} />
                                    <div style={{ fontSize: '11px', color: '#888', marginTop: '8px', marginBottom: '6px', fontWeight: '600' }}>
                                        📚 Książki
                                    </div>
                                    <MetricBadge label="RMSE" value={model.metrics.books.rmse} color={model.color} />
                                    <MetricBadge label="MAE"  value={model.metrics.books.mae}  color={model.color} />
                                    <MetricBadge label="R²"   value={model.metrics.books.r2}   color={model.color} />
                                </div>
                            )}
                            {model.metrics.films?.threshold && (
                                <div>
                                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px', fontWeight: '600' }}>
                                        🎬 Filmy
                                    </div>
                                    <MetricBadge label="Próg" value={model.metrics.films.threshold} color={model.color} />
                                    <div style={{ fontSize: '11px', color: '#888', marginTop: '8px', marginBottom: '6px', fontWeight: '600' }}>
                                        📚 Książki
                                    </div>
                                    <MetricBadge label="Próg" value={model.metrics.books.threshold} color={model.color} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Metryki */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{
                    fontSize: '20px', fontWeight: '700', color: '#333',
                    borderBottom: '2px solid #4a90d9', paddingBottom: '8px', marginBottom: '16px'
                }}>
                    📊 {t('about.metrics_title')}
                </h2>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {[
                        { name: 'RMSE', emoji: '📉', desc: t('about.rmse_desc'), color: '#4a90d9' },
                        { name: 'MAE',  emoji: '📊', desc: t('about.mae_desc'),  color: '#e87040' },
                        { name: 'R²',   emoji: '📈', desc: t('about.r2_desc'),   color: '#2ecc71' },
                    ].map(m => (
                        <div key={m.name} style={{
                            background: 'white', borderRadius: '12px', padding: '20px',
                            border: '1px solid #e0e0e0', flex: 1, minWidth: '200px'
                        }}>
                            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{m.emoji}</div>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: m.color, marginBottom: '8px' }}>
                                {m.name}
                            </div>
                            <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
                                {m.desc}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Datasety */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{
                    fontSize: '20px', fontWeight: '700', color: '#333',
                    borderBottom: '2px solid #4a90d9', paddingBottom: '8px', marginBottom: '16px'
                }}>
                    🗄️ {t('about.datasets_title')}
                </h2>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{
                        background: 'white', borderRadius: '12px', padding: '20px',
                        border: '1px solid #e0e0e0', flex: 1, minWidth: '260px'
                    }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎬</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#4a90d9', marginBottom: '8px' }}>
                            MovieLens 1M
                        </div>
                        <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                            {t('about.movies_dataset_desc')}
                        </div>
                    </div>
                    <div style={{
                        background: 'white', borderRadius: '12px', padding: '20px',
                        border: '1px solid #e0e0e0', flex: 1, minWidth: '260px'
                    }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>📚</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#2ecc71', marginBottom: '8px' }}>
                            Book-Crossing
                        </div>
                        <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                            {t('about.books_dataset_desc')}
                        </div>
                    </div>
                </div>
            </section>

            {/* Stack technologiczny */}
            <section style={{ marginBottom: '40px' }}>
                <h2 style={{
                    fontSize: '20px', fontWeight: '700', color: '#333',
                    borderBottom: '2px solid #4a90d9', paddingBottom: '8px', marginBottom: '16px'
                }}>
                    ⚙️ {t('about.tech_title')}
                </h2>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {TECH_STACK.map(({ category, items }) => (
                        <div key={category} style={{
                            background: 'white', borderRadius: '12px', padding: '16px 20px',
                            border: '1px solid #e0e0e0', flex: 1, minWidth: '180px'
                        }}>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#888', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {category}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {items.map(item => (
                                    <span key={item} style={{
                                        padding: '4px 10px', background: '#e8f4fd',
                                        color: '#4a90d9', borderRadius: '20px',
                                        fontSize: '12px', fontWeight: '600'
                                    }}>
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
