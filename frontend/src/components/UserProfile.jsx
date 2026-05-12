const OCCUPATION_LABELS = {
    0: 'other', 1: 'academic/educator', 2: 'artist', 3: 'clerical/admin',
    4: 'college/grad student', 5: 'customer service', 6: 'doctor/health care',
    7: 'executive/managerial', 8: 'farmer', 9: 'homemaker', 10: 'K-12 student',
    11: 'lawyer', 12: 'programmer', 13: 'retired', 14: 'sales/marketing',
    15: 'scientist', 16: 'self-employed', 17: 'technician/engineer',
    18: 'tradesman/craftsman', 19: 'unemployed', 20: 'writer'
}

const AGE_LABELS = {
    1: 'poniżej 18', 18: '18–24', 25: '25–34',
    35: '35–44', 45: '45–49', 50: '50–55', 56: '56+'
}

export default function UserProfile({ profile }) {
    return (
        <div style={{
            background: '#f8f9fa',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            gap: '32px',
            flexWrap: 'wrap'
        }}>
            <div>
                <span style={{ color: '#888', fontSize: '13px' }}>ID użytkownika</span>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>#{profile.userId}</div>
            </div>
            <div>
                <span style={{ color: '#888', fontSize: '13px' }}>Płeć</span>
                <div style={{ fontSize: '18px' }}>{profile.gender === 'M' ? '👨 Mężczyzna' : '👩 Kobieta'}</div>
            </div>
            <div>
                <span style={{ color: '#888', fontSize: '13px' }}>Wiek</span>
                <div style={{ fontSize: '18px' }}>{AGE_LABELS[profile.age] || profile.age}</div>
            </div>
            <div>
                <span style={{ color: '#888', fontSize: '13px' }}>Zawód</span>
                <div style={{ fontSize: '18px' }}>{OCCUPATION_LABELS[profile.occupation]}</div>
            </div>
            <div>
                <span style={{ color: '#888', fontSize: '13px' }}>Liczba ocen</span>
                <div style={{ fontSize: '18px' }}>{profile.ratingsCount}</div>
            </div>
            <div>
                <span style={{ color: '#888', fontSize: '13px' }}>Średnia ocena</span>
                <div style={{ fontSize: '18px' }}>⭐ {profile.avgRating}</div>
            </div>
        </div>
    )
}