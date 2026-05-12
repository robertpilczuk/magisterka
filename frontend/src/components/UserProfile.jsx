import Tooltip from './Tooltip'
import { getRatingStyle } from '../utils'

const OCCUPATION_LABELS = {
    0: 'Inne / nieokreślone',
    1: 'Naukowiec / wykładowca',
    2: 'Artysta',
    3: 'Pracownik biurowy',
    4: 'Student',
    5: 'Obsługa klienta',
    6: 'Lekarz / służba zdrowia',
    7: 'Menedżer / dyrektor',
    8: 'Rolnik',
    9: 'Gospodarz/ni domowy/a',
    10: 'Uczeń (szkoła podstawowa/średnia)',
    11: 'Prawnik',
    12: 'Programista',
    13: 'Emeryt/rencista',
    14: 'Sprzedaż / marketing',
    15: 'Naukowiec',
    16: 'Samozatrudniony',
    17: 'Technik / inżynier',
    18: 'Rzemieślnik',
    19: 'Bezrobotny',
    20: 'Pisarz / dziennikarz'
}

const AGE_LABELS = {
    1: 'Poniżej 18', 18: '18–24', 25: '25–34', 35: '35–44',
    45: '45–49', 50: '50–55', 56: '56+'
}


export default function UserProfile({ profile }) {
    const score10 = Math.round(profile.avgRating * 2)
    const ratingInfo = getRatingStyle(profile.avgRating)

    return (
        <div style={{
            background: '#f8f9fa', border: '1px solid #e0e0e0',
            borderRadius: '12px', padding: '20px',
            display: 'flex', gap: '24px', flexWrap: 'wrap',
            alignItems: 'flex-start'
        }}>

            {/* ID */}
            <div>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '2px' }}>
                    ID użytkownika
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                    #{profile.userId}
                </div>
            </div>

            {/* płeć */}
            <div>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '2px' }}>Płeć</div>
                <div style={{ fontSize: '16px', color: '#333' }}>
                    {profile.gender === 'M' ? '👨 Mężczyzna' : '👩 Kobieta'}
                </div>
            </div>

            {/* wiek */}
            <div>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '2px' }}>Wiek</div>
                <div style={{ fontSize: '16px', color: '#333' }}>
                    {AGE_LABELS[profile.age] || profile.age}
                </div>
            </div>

            {/* zawód */}
            <div>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '2px' }}>Zawód</div>
                <div style={{ fontSize: '16px', color: '#333' }}>
                    {OCCUPATION_LABELS[profile.occupation]}
                </div>
            </div>

            {/* liczba ocen */}
            <div>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '2px' }}>
                    Liczba ocen
                </div>
                <div style={{ fontSize: '16px', color: '#333', fontWeight: '600' }}>
                    {profile.ratingsCount}
                </div>
            </div>

            {/* styl oceniania */}
            <div style={{ minWidth: '200px' }}>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>
                    Styl oceniania
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                        fontSize: '18px', fontWeight: '700',
                        color: ratingInfo.color
                    }}>
                        {score10}/10
                    </span>
                    <Tooltip text={ratingInfo.desc}>
                        <span style={{
                            fontSize: '14px', fontWeight: '600',
                            color: ratingInfo.color,
                            borderBottom: `1px dashed ${ratingInfo.color}`
                        }}>
                            {ratingInfo.text}
                        </span>
                    </Tooltip>
                </div>
                {/* pasek */}
                <div style={{
                    background: '#e0e0e0', borderRadius: '6px',
                    height: '8px', width: '200px', overflow: 'hidden',
                    marginBottom: '6px'
                }}>
                    <div style={{
                        width: `${score10 * 10}%`, height: '100%',
                        background: ratingInfo.color, borderRadius: '6px',
                        transition: 'width 0.5s ease'
                    }} />
                </div>
                <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                    {ratingInfo.desc}
                </div>
            </div>

        </div>
    )
}