export default function ValidationChart({ validation, excludedGenres = [] }) {
    if (!validation) return null

    const { rmse, mae, count, samples } = validation

    return (
        <div style={{
            marginTop: '40px',
            background: '#f8f9fa',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            padding: '24px'
        }}>
            <h2 style={{ marginTop: 0, marginBottom: '8px' }}>🔬 Walidacja modelu</h2>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                Porównanie przewidywanych vs rzeczywistych ocen dla tego użytkownika
                (na podstawie {count} ocen).
            </p>

            {/* metryki */}
            <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div style={{
                    background: 'white', borderRadius: '10px', padding: '16px 24px',
                    border: '1px solid #e0e0e0', textAlign: 'center'
                }}>
                    <div style={{ color: '#888', fontSize: '13px' }}>RMSE</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4a90d9' }}>{rmse}</div>
                    <div style={{ color: '#aaa', fontSize: '12px' }}>im niższe tym lepiej</div>
                </div>
                <div style={{
                    background: 'white', borderRadius: '10px', padding: '16px 24px',
                    border: '1px solid #e0e0e0', textAlign: 'center'
                }}>
                    <div style={{ color: '#888', fontSize: '13px' }}>MAE</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4a90d9' }}>{mae}</div>
                    <div style={{ color: '#aaa', fontSize: '12px' }}>im niższe tym lepiej</div>
                </div>
                <div style={{
                    background: 'white', borderRadius: '10px', padding: '16px 24px',
                    border: '1px solid #e0e0e0', textAlign: 'center'
                }}>
                    <div style={{ color: '#888', fontSize: '13px' }}>Liczba ocen</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4a90d9' }}>{count}</div>
                    <div style={{ color: '#aaa', fontSize: '12px' }}>użytkownika</div>
                </div>
            </div>

            {/* tabela próbki */}
            <h3 style={{ marginBottom: '12px' }}>Próbka 20 przewidywań</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#e8e8e8' }}>
                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Film</th>
                            <th style={{ padding: '8px 12px', textAlign: 'center' }}>Ocena rzeczywista</th>
                            <th style={{ padding: '8px 12px', textAlign: 'center' }}>Ocena przewidywana</th>
                            <th style={{ padding: '8px 12px', textAlign: 'center' }}>Różnica</th>
                        </tr>
                    </thead>
                    <tbody>
                        {samples.map((s, i) => {
                            const diff = (s.predicted - s.actual).toFixed(2)
                            const absDiff = Math.abs(diff)
                            const diffColor = absDiff < 0.5 ? '#2a9d2a' : absDiff < 1.0 ? '#e08800' : '#c00'
                            const isExcluded = excludedGenres.length > 0 &&
                                s.genres && excludedGenres.some(g => s.genres.includes(g))

                            return (
                                <tr key={i} style={{
                                    borderBottom: '1px solid #eee',
                                    background: isExcluded ? '#f8f8f8' : i % 2 === 0 ? 'white' : '#fafafa',
                                    opacity: isExcluded ? 0.6 : 1,
                                    transition: 'opacity 0.2s'
                                }}>
                                    <td style={{ padding: '8px 12px', color: isExcluded ? '#aaa' : '#333' }}>
                                        {s.title}
                                    </td>
                                    <td style={{
                                        padding: '8px 12px', textAlign: 'center',
                                        color: isExcluded ? '#aaa' : '#333'
                                    }}>
                                        ⭐ {s.actual}
                                    </td>
                                    <td style={{
                                        padding: '8px 12px', textAlign: 'center',
                                        color: isExcluded ? '#aaa' : '#333'
                                    }}>
                                        ⭐ {s.predicted}
                                    </td>
                                    <td style={{
                                        padding: '8px 12px', textAlign: 'center',
                                        color: isExcluded ? '#aaa' : diffColor, fontWeight: '600'
                                    }}>
                                        {diff > 0 ? '+' : ''}{diff}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}