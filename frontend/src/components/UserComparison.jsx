const OCC_LABELS = {
    0: 'other', 1: 'educator', 2: 'artist', 3: 'clerical', 4: 'student',
    5: 'customer svc', 6: 'doctor', 7: 'executive', 8: 'farmer', 9: 'homemaker',
    10: 'K-12 student', 11: 'lawyer', 12: 'programmer', 13: 'retired',
    14: 'sales', 15: 'scientist', 16: 'self-employed', 17: 'technician',
    18: 'tradesman', 19: 'unemployed', 20: 'writer'
}

const AGE_LABELS = {
    1: '<18', 18: '18-24', 25: '25-34', 35: '35-44',
    45: '45-49', 50: '50-55', 56: '56+'
}

function UserMiniCard({ user, color }) {
    return (
        <div style={{
            flex: 1, background: 'white', borderRadius: '10px',
            padding: '16px', border: `2px solid ${color}`
        }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color }}>
                #{user.userId}
            </div>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                {user.gender === 'M' ? '👨' : '👩'} {AGE_LABELS[user.age]}
                · {OCC_LABELS[user.occupation]}
            </div>
            <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>
                ⭐ śr. {user.avgRating} · {user.ratingsCount} ocen
            </div>
        </div>
    )
}

function RecMiniList({ recs, color }) {
    return (
        <div>
            {recs.slice(0, 10).map((r, i) => (
                <div key={r.movieId} style={{
                    padding: '8px 10px', marginBottom: '6px',
                    background: 'white', borderRadius: '8px',
                    borderLeft: `3px solid ${color}`,
                    fontSize: '13px'
                }}>
                    <span style={{ color, fontWeight: '600', marginRight: '6px' }}>
                        {i + 1}.
                    </span>
                    {r.title}
                    <div style={{ color: '#aaa', fontSize: '11px' }}>
                        {r.genres?.replace(/\|/g, ' · ')}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function UserComparison({ comparison }) {
    const { user1, user2, onlyForUser1, onlyForUser2, common, similarityPct } = comparison

    const similarityColor = similarityPct >= 50 ? '#2ecc71'
        : similarityPct >= 25 ? '#e08800'
            : '#e87040'

    return (
        <div style={{
            marginTop: '24px', background: '#f8f9fa',
            border: '1px solid #e0e0e0', borderRadius: '12px',
            padding: '24px'
        }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>🔄 Porównanie użytkowników</h2>

            {/* profile */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <UserMiniCard user={user1} color="#4a90d9" />
                <div style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '4px'
                }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: similarityColor }}>
                        {similarityPct}%
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', textAlign: 'center' }}>
                        wspólnych<br />rekomendacji
                    </div>
                </div>
                <UserMiniCard user={user2} color="#e87040" />
            </div>

            {/* trzy kolumny */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                    <h4 style={{
                        color: '#4a90d9', borderBottom: '2px solid #4a90d9',
                        paddingBottom: '6px', marginTop: 0
                    }}>
                        Tylko dla #{user1.userId}
                    </h4>
                    <RecMiniList recs={onlyForUser1} color="#4a90d9" />
                </div>

                <div>
                    <h4 style={{
                        color: '#2ecc71', borderBottom: '2px solid #2ecc71',
                        paddingBottom: '6px', marginTop: 0
                    }}>
                        ✅ Wspólne ({common.length})
                    </h4>
                    <RecMiniList recs={common} color="#2ecc71" />
                    {common.length === 0 && (
                        <div style={{ color: '#888', fontSize: '13px' }}>
                            Brak wspólnych rekomendacji.
                        </div>
                    )}
                </div>

                <div>
                    <h4 style={{
                        color: '#e87040', borderBottom: '2px solid #e87040',
                        paddingBottom: '6px', marginTop: 0
                    }}>
                        Tylko dla #{user2.userId}
                    </h4>
                    <RecMiniList recs={onlyForUser2} color="#e87040" />
                </div>
            </div>
        </div>
    )
}