import { useLang } from '../LangContext'
import Tooltip from './Tooltip'

export default function EvaluationChart({ evaluation }) {
    const { t } = useLang()
    if (!evaluation) return null
    if (evaluation.error) return (
        <div style={{ color: '#888', padding: '16px', fontStyle: 'italic' }}>
            {evaluation.error}
        </div>
    )

    const {
        test_count, n_liked_by_user, n_model_recommends, hits,
        precision, recall, f1, rmse_on_test, mae_on_test,
        liked_threshold, recommendations
    } = evaluation

    const metricCard = (label, value, hint, color, format = 'num') => (
        <Tooltip text={hint}>
            <div style={{
                background: 'white', borderRadius: '10px', padding: '14px 18px',
                border: '1px solid #e0e0e0', textAlign: 'center',
                cursor: 'help', minWidth: '110px'
            }}>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color }}>
                    {format === 'pct' ? `${(value * 100).toFixed(1)}%` : value}
                </div>
            </div>
        </Tooltip>
    )

    return (
        <div style={{
            marginTop: '40px', background: '#f8f9fa',
            border: '1px solid #e0e0e0', borderRadius: '12px', padding: '24px'
        }}>
            <h2 style={{ marginTop: 0, marginBottom: '8px', color: '#333' }}>
                🎯 {t('evaluation.title')}
            </h2>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                {t('evaluation.subtitle')}
            </p>

            {/* info o progu */}
            <div style={{
                background: '#fff8e1', border: '1px solid #ffe082',
                borderRadius: '8px', padding: '10px 16px',
                fontSize: '13px', color: '#795548', marginBottom: '20px'
            }}>
                💡 {t('evaluation.threshold')}: ≥{liked_threshold}/5 = polubił ·
                Zbiór testowy: {test_count} filmów ·
                Polubił: {n_liked_by_user} · Model polecił: {n_model_recommends}
            </div>

            {/* metryki */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
                {metricCard(t('evaluation.hits'),      hits,      '6 trafień = model polecił 6 filmów które user polubił', '#2ecc71')}
                {metricCard(t('evaluation.precision'), precision, t('evaluation.hint_precision'), '#4a90d9', 'pct')}
                {metricCard(t('evaluation.recall'),    recall,    t('evaluation.hint_recall'),    '#e87040', 'pct')}
                {metricCard(t('evaluation.f1'),        f1,        t('evaluation.hint_f1'),        '#9b59b6', 'num')}
                {metricCard(t('evaluation.rmse'),      rmse_on_test, 'Błąd predykcji oceny na zbiorze testowym', '#888')}
                {metricCard(t('evaluation.mae'),       mae_on_test,  'Średnia bezwzględna różnica ocen', '#888')}
            </div>

            {/* pasek F1 */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>
                    F1-score: {(f1 * 100).toFixed(1)}%
                </div>
                <div style={{ background: '#e0e0e0', borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
                    <div style={{
                        width: `${f1 * 100}%`, height: '100%',
                        background: f1 >= 0.7 ? '#2ecc71' : f1 >= 0.5 ? '#f39c12' : '#e74c3c',
                        borderRadius: '6px', transition: 'width 0.5s ease'
                    }} />
                </div>
                <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                    {f1 >= 0.7 ? '✅ Dobry wynik' : f1 >= 0.5 ? '🟡 Średni wynik' : '❌ Słaby wynik'}
                </div>
            </div>

            {/* tabela */}
            <h3 style={{ marginBottom: '12px' }}>
                Filmy ze zbioru testowego — predykcja vs rzeczywistość
            </h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                        <tr style={{ background: '#e8e8e8' }}>
                            <th style={{ padding: '8px', textAlign: 'center', width: '40px' }}>{t('evaluation.col_rank')}</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>{t('evaluation.col_title')}</th>
                            <th style={{ padding: '8px', textAlign: 'center' }}>{t('evaluation.col_predicted')}</th>
                            <th style={{ padding: '8px', textAlign: 'center' }}>{t('evaluation.col_actual')}</th>
                            <th style={{ padding: '8px', textAlign: 'center' }}>{t('evaluation.col_recommended')}</th>
                            <th style={{ padding: '8px', textAlign: 'center' }}>{t('evaluation.col_liked')}</th>
                            <th style={{ padding: '8px', textAlign: 'center' }}>{t('evaluation.col_hit')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recommendations.map((r, i) => {
                            const rowBg = r.hit
                                ? '#f0fff4'
                                : (!r.model_recommends && !r.user_liked)
                                    ? '#fafafa'
                                    : r.model_recommends && !r.user_liked
                                        ? '#fff5f5'
                                        : !r.model_recommends && r.user_liked
                                            ? '#fffbe6'
                                            : 'white'

                            return (
                                <tr key={r.movieId} style={{
                                    borderBottom: '1px solid #eee',
                                    background: rowBg
                                }}>
                                    <td style={{ padding: '8px', textAlign: 'center', color: '#888' }}>
                                        {r.rank}
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <div style={{ fontWeight: '600', color: '#333' }}>{r.title}</div>
                                        <div style={{ fontSize: '11px', color: '#aaa' }}>
                                            {r.genres.replace(/\|/g, ' · ')}
                                        </div>
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                        <span style={{
                                            fontWeight: '700',
                                            color: r.model_recommends ? '#4a90d9' : '#888'
                                        }}>
                                            ⭐ {r.predicted_rating}
                                        </span>
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                        {r.actual_rating !== null
                                            ? <span style={{
                                                fontWeight: '700',
                                                color: r.user_liked ? '#2ecc71' : '#e74c3c'
                                            }}>⭐ {r.actual_rating}</span>
                                            : <span style={{ color: '#ccc' }}>{t('evaluation.na')}</span>
                                        }
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: '12px', fontSize: '12px',
                                            background: r.model_recommends ? '#e8f4fd' : '#f5f5f5',
                                            color: r.model_recommends ? '#4a90d9' : '#888'
                                        }}>
                                            {r.model_recommends ? `✅ ${t('evaluation.yes')}` : `— ${t('evaluation.no')}`}
                                        </span>
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '2px 8px', borderRadius: '12px', fontSize: '12px',
                                            background: r.user_liked ? '#f0fff4' : '#f5f5f5',
                                            color: r.user_liked ? '#2ecc71' : '#888'
                                        }}>
                                            {r.user_liked ? `✅ ${t('evaluation.yes')}` : `— ${t('evaluation.no')}`}
                                        </span>
                                    </td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                        {r.hit
                                            ? <span style={{ fontSize: '18px' }}>🎯</span>
                                            : r.model_recommends && !r.user_liked
                                                ? <span style={{ fontSize: '16px', color: '#e74c3c' }}>❌</span>
                                                : !r.model_recommends && r.user_liked
                                                    ? <span style={{ fontSize: '16px', color: '#f39c12' }}>⚠️</span>
                                                    : <span style={{ color: '#ccc' }}>—</span>
                                        }
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* legenda */}
            <div style={{
                marginTop: '12px', display: 'flex', gap: '16px',
                flexWrap: 'wrap', fontSize: '12px', color: '#888'
            }}>
                <span>🎯 Trafienie (model polecił + user polubił)</span>
                <span>❌ Fałszywy alarm (model polecił, user nie polubił)</span>
                <span>⚠️ Przeoczenie (model nie polecił, user polubił)</span>
            </div>
        </div>
    )
}
