import { useState } from 'react'
import axios from 'axios'
import { useLang } from '../LangContext'
import Spinner from './Spinner'
import SimilarBooksUsersFilter from './SimilarBooksUsersFilter'
import BookTasteProfile from './BookTasteProfile'

const API = 'http://localhost:8000'

// ─── BookUserProfile ──────────────────────────────────────────────────────────
function BookUserProfile({ profile }) {
    const { t } = useLang()
    const barWidth = (profile.avgRating / 10) * 100
    const color = profile.avgRating <= 3 ? '#c0392b'
        : profile.avgRating <= 5 ? '#e67e22'
            : profile.avgRating <= 7 ? '#27ae60'
                : '#8e44ad'

    return (
        <div style={{
            background: '#f8f9fa', border: '1px solid #e0e0e0',
            borderRadius: '12px', padding: '20px',
            display: 'flex', gap: '24px', flexWrap: 'wrap',
            alignItems: 'flex-start', marginBottom: '20px'
        }}>
            <div>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '2px' }}>
                    {t('books_app.user_id')}
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                    #{profile.userId}
                </div>
            </div>
            <div>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '2px' }}>
                    {t('books_app.age')}
                </div>
                <div style={{ fontSize: '16px', color: '#333' }}>
                    {profile.age} {t('books_app.age_suffix')}
                </div>
            </div>
            <div>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '2px' }}>
                    {t('books_app.ratings_count')}
                </div>
                <div style={{ fontSize: '16px', color: '#333', fontWeight: '600' }}>
                    {profile.ratingsCount}
                </div>
            </div>
            <div style={{ minWidth: '200px' }}>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>
                    {t('books_app.avg_rating')}
                </div>
                <div style={{ fontSize: '18px', fontWeight: '700', color, marginBottom: '4px' }}>
                    {profile.avgRating}/10
                </div>
                <div style={{
                    background: '#e0e0e0', borderRadius: '6px',
                    height: '8px', width: '200px', overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${barWidth}%`, height: '100%',
                        background: color, borderRadius: '6px',
                        transition: 'width 0.5s ease'
                    }} />
                </div>
            </div>
        </div>
    )
}

// ─── BookCard ─────────────────────────────────────────────────────────────────
function BookCard({ rank, rec, type }) {
    const { t } = useLang()
    const isLinear = type === 'linear'
    const accentColor = isLinear ? '#4a90d9' : '#e87040'

    const score = isLinear
        ? `📖 ${rec.predicted_rating.toFixed(2)} / 10.00`
        : `🎯 ${(rec.like_probability * 100).toFixed(1)}% ${t('books_app.like_chance')}`

    const barWidth = isLinear
        ? (rec.predicted_rating / 10) * 100
        : rec.like_probability * 100

    return (
        <div style={{
            background: 'white', border: '1px solid #e0e0e0',
            borderRadius: '10px', padding: '14px 16px',
            marginBottom: '10px', borderLeft: `4px solid ${accentColor}`
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                    background: accentColor, color: 'white',
                    borderRadius: '50%', width: '22px', height: '22px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 'bold', flexShrink: 0
                }}>{rank}</span>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '15px' }}>{rec.title}</div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                        ✍️ {rec.author}
                    </div>
                </div>
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
        </div>
    )
}

// ─── BookValidation ───────────────────────────────────────────────────────────
function BookValidation({ validation }) {
    const { t } = useLang()
    if (!validation) return null
    const { rmse, mae, count, samples } = validation

    return (
        <div style={{
            marginTop: '40px', background: '#f8f9fa',
            border: '1px solid #e0e0e0', borderRadius: '12px', padding: '24px'
        }}>
            <h2 style={{ marginTop: 0, marginBottom: '8px' }}>
                🔬 {t('books_app.validation_title')}
            </h2>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                {t('books_app.validation_subtitle')} ({t('books_app.validation_based_on')} {count} {t('books_app.validation_ratings')}).
            </p>
            <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {[
                    { label: 'RMSE', value: rmse, hint: t('books_app.rmse_hint') },
                    { label: 'MAE', value: mae, hint: t('books_app.mae_hint') },
                    { label: t('books_app.ratings_count'), value: count, hint: '' },
                ].map(({ label, value, hint }) => (
                    <div key={label} style={{
                        background: 'white', borderRadius: '10px', padding: '16px 24px',
                        border: '1px solid #e0e0e0', textAlign: 'center'
                    }}>
                        <div style={{ color: '#888', fontSize: '13px' }}>{label}</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2ecc71' }}>{value}</div>
                        <div style={{ color: '#aaa', fontSize: '12px' }}>{hint}</div>
                    </div>
                ))}
            </div>
            <h3 style={{ marginBottom: '12px' }}>{t('books_app.sample_title')}</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#e8e8e8' }}>
                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>{t('books_app.col_book')}</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left' }}>{t('books_app.col_author')}</th>
                            <th style={{ padding: '8px 12px', textAlign: 'center' }}>{t('books_app.col_actual')}</th>
                            <th style={{ padding: '8px 12px', textAlign: 'center' }}>{t('books_app.col_pred')}</th>
                            <th style={{ padding: '8px 12px', textAlign: 'center' }}>{t('books_app.col_diff')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {samples.map((s, i) => {
                            const diff = (s.predicted - s.actual).toFixed(2)
                            const absDiff = Math.abs(diff)
                            const diffColor = absDiff < 1.0 ? '#2a9d2a' : absDiff < 2.0 ? '#e08800' : '#c00'
                            return (
                                <tr key={i} style={{
                                    borderBottom: '1px solid #eee',
                                    background: i % 2 === 0 ? 'white' : '#fafafa'
                                }}>
                                    <td style={{ padding: '8px 12px', color: '#333' }}>{s.title}</td>
                                    <td style={{ padding: '8px 12px', color: '#888', fontSize: '12px' }}>{s.author}</td>
                                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>⭐ {s.actual}</td>
                                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>⭐ {s.predicted}</td>
                                    <td style={{ padding: '8px 12px', textAlign: 'center', color: diffColor, fontWeight: '600' }}>
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

// ─── NewUserBooks ─────────────────────────────────────────────────────────────
const SAMPLE_BOOKS = [
    { isbn: '0316769177', title: 'The Catcher in the Rye', author: 'J.D. Salinger' },
    { isbn: '0061096229', title: 'To Kill a Mockingbird', author: 'Harper Lee' },
    { isbn: '0743273567', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
    { isbn: '0679720200', title: '1984', author: 'George Orwell' },
    { isbn: '0060934344', title: 'Brave New World', author: 'Aldous Huxley' },
    { isbn: '0141439521', title: 'Pride and Prejudice', author: 'Jane Austen' },
    { isbn: '0743482832', title: 'The Da Vinci Code', author: 'Dan Brown' },
    { isbn: '0439139597', title: 'Harry Potter and the Goblet of Fire', author: 'J.K. Rowling' },
    { isbn: '0590353403', title: "Harry Potter and the Sorcerer's Stone", author: 'J.K. Rowling' },
    { isbn: '0618002235', title: 'The Lord of the Rings', author: 'J.R.R. Tolkien' },
    { isbn: '0385333498', title: "The Hitchhiker's Guide to the Galaxy", author: 'Douglas Adams' },
    { isbn: '0316346624', title: 'The Lovely Bones', author: 'Alice Sebold' },
    { isbn: '0385504209', title: 'The Alchemist', author: 'Paulo Coelho' },
    { isbn: '0446310786', title: 'Gone with the Wind', author: 'Margaret Mitchell' },
    { isbn: '0553213113', title: 'Crime and Punishment', author: 'Fyodor Dostoevsky' },
    { isbn: '0140449132', title: 'Don Quixote', author: 'Miguel de Cervantes' },
    { isbn: '0679720202', title: 'Animal Farm', author: 'George Orwell' },
    { isbn: '0060850523', title: 'Mere Christianity', author: 'C.S. Lewis' },
    { isbn: '0671027360', title: "Angela's Ashes", author: 'Frank McCourt' },
    { isbn: '0385504209', title: 'The Alchemist', author: 'Paulo Coelho' },
]

function NewUserBooks() {
    const { t } = useLang()
    const [step, setStep] = useState(1)
    const [age, setAge] = useState(25)
    const [ratings, setRatings] = useState({})
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [tasteProfile, setTasteProfile] = useState(null)
    const [activePanel, setPanel] = useState('linear')

    const ratedCount = Object.keys(ratings).length

    function setRating(isbn, rating) {
        setRatings(prev => ({ ...prev, [isbn]: rating }))
    }
    function clearRating(isbn) {
        setRatings(prev => { const n = { ...prev }; delete n[isbn]; return n })
    }

    async function handleSubmit() {
        if (ratedCount < 3) return
        setLoading(true); setError(null)
        try {
            const ratingsPayload = Object.entries(ratings).map(([isbn, rating]) => ({
                isbn, rating: parseFloat(rating)
            }))
            const res = await axios.post(`${API}/books/recommend-new-user`, {
                ratings: ratingsPayload, age: parseInt(age)
            })
            setResults(res.data); setStep(3)
        } catch (err) {
            setError(err.response?.data?.detail || 'Błąd generowania rekomendacji')
        } finally {
            setLoading(false)
        }
    }

    const panelBtn = (key) => ({
        padding: '8px 20px',
        background: activePanel === key ? '#4a90d9' : '#eee',
        color: activePanel === key ? 'white' : '#666',
        border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
    })

    return (
        <div>
            {step === 1 && (
                <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <h2>{t('books_app.step1_title')}</h2>
                    <p style={{ color: '#666' }}>{t('books_app.step1_desc')}</p>
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '13px', color: '#888', marginBottom: '6px' }}>
                            {t('books_app.step1_age_label')}
                        </div>
                        <input
                            type="number" min="5" max="90" value={age}
                            onChange={e => setAge(e.target.value)}
                            style={{
                                padding: '8px 12px', borderRadius: '8px',
                                border: '2px solid #ddd', fontSize: '14px', width: '120px'
                            }}
                        />
                    </div>
                    <button onClick={() => setStep(2)} style={{
                        padding: '12px 32px', background: '#2ecc71', color: 'white',
                        border: 'none', borderRadius: '8px', cursor: 'pointer',
                        fontSize: '15px', fontWeight: '600'
                    }}>
                        {t('books_app.next_rate')}
                    </button>
                </div>
            )}

            {step === 2 && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h2 style={{ margin: 0 }}>📚 {t('books_app.step2_title')}</h2>
                        <div style={{ fontSize: '14px', color: ratedCount >= 3 ? '#2ecc71' : '#888' }}>
                            {ratedCount >= 3 ? '✅' : '⏳'} {t('books_app.rated')}: {ratedCount} / {t('books_app.min_ratings')}
                        </div>
                    </div>
                    <p style={{ color: '#666', marginBottom: '20px' }}>{t('books_app.step2_desc')}</p>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                        gap: '12px', marginBottom: '24px'
                    }}>
                        {SAMPLE_BOOKS.map(book => (
                            <div key={book.isbn} style={{
                                background: ratings[book.isbn] ? '#f0fff4' : 'white',
                                border: `1px solid ${ratings[book.isbn] ? '#2ecc71' : '#e0e0e0'}`,
                                borderRadius: '10px', padding: '14px'
                            }}>
                                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>
                                    {book.title}
                                </div>
                                <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
                                    ✍️ {book.author}
                                </div>
                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
                                        <button key={star} onClick={() => setRating(book.isbn, star)}
                                            style={{
                                                width: '28px', height: '28px',
                                                background: ratings[book.isbn] >= star ? '#2ecc71' : '#f0f0f0',
                                                color: ratings[book.isbn] >= star ? 'white' : '#aaa',
                                                border: 'none', borderRadius: '4px',
                                                cursor: 'pointer', fontSize: '11px', fontWeight: '600'
                                            }}>
                                            {star}
                                        </button>
                                    ))}
                                    {ratings[book.isbn] && (
                                        <button onClick={() => clearRating(book.isbn)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: '16px' }}>
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => setStep(1)} style={{
                            padding: '10px 20px', background: '#eee', color: '#666',
                            border: 'none', borderRadius: '8px', cursor: 'pointer'
                        }}>
                            {t('books_app.back')}
                        </button>
                        <button onClick={handleSubmit}
                            disabled={ratedCount < 3 || loading}
                            style={{
                                padding: '12px 32px',
                                background: ratedCount >= 3 ? '#2ecc71' : '#ccc',
                                color: 'white', border: 'none', borderRadius: '8px',
                                cursor: ratedCount >= 3 ? 'pointer' : 'not-allowed',
                                fontSize: '15px', fontWeight: '600'
                            }}>
                            {loading ? `⏳ ${t('books_app.generating')}` : `📚 ${t('books_app.generate')}`}
                        </button>
                    </div>
                    {error && <div style={{ marginTop: '12px', color: '#c00' }}>⚠️ {error}</div>}
                </div>
            )}

            {step === 3 && results && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ margin: 0 }}>🎉 {t('books_app.results_title')}</h2>
                        <button onClick={() => { setStep(1); setRatings({}); setResults(null) }}
                            style={{ padding: '8px 20px', background: '#eee', color: '#666', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                            ↺ {t('books_app.reset')}
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                        <button style={panelBtn('linear')} onClick={() => setPanel('linear')}>
                            📈 {t('books_app.panel_linear')}
                        </button>
                        <button style={panelBtn('logistic')} onClick={() => setPanel('logistic')}>
                            🎯 {t('books_app.panel_logistic')}
                        </button>
                        <button style={panelBtn('combined')} onClick={() => setPanel('combined')}>
                            ⚡ {t('books_app.panel_combined')}
                        </button>
                    </div>
                    {activePanel === 'linear' && (
                        <div>
                            <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                                {t('books_app.linear_desc')}
                            </p>
                            {results.linear.map((rec, i) => (
                                <BookCard key={rec.isbn} rank={i + 1} rec={rec} type="linear" />
                            ))}
                        </div>
                    )}
                    {activePanel === 'logistic' && (
                        <div>
                            <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                                {t('books_app.threshold_desc')} {results.optimal_threshold})
                            </p>
                            {results.logistic.map((rec, i) => (
                                <BookCard key={rec.isbn} rank={i + 1} rec={rec} type="logistic" />
                            ))}
                        </div>
                    )}
                    {activePanel === 'combined' && (
                        <div>
                            <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                                {t('books_app.combined_desc')}
                            </p>
                            {results.combined.map((rec, i) => (
                                <BookCard key={rec.isbn} rank={i + 1}
                                    rec={{ ...rec, predicted_rating: rec.combined_score * 10 }}
                                    type="linear" />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── MAIN BooksApp ────────────────────────────────────────────────────────────
export default function BooksApp() {
    const { t } = useLang()
    const [activeTab, setActiveTab] = useState('existing')
    const [userId, setUserId] = useState('')
    const [userProfile, setProfile] = useState(null)
    const [recsLinear, setLinear] = useState([])
    const [recsLogistic, setLogistic] = useState([])
    const [validation, setValidation] = useState(null)
    const [tasteProfile, setTasteProfile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)


    const tabStyle = (tab) => ({
        padding: '12px 32px', fontSize: '15px', fontWeight: '600',
        border: 'none',
        borderBottom: activeTab === tab ? '3px solid #2ecc71' : '3px solid transparent',
        background: 'none',
        color: activeTab === tab ? '#2ecc71' : '#888',
        cursor: 'pointer', transition: 'all 0.2s'
    })

    async function fetchAll(id) {
        const uid = parseInt(id)
        if (isNaN(uid) || uid < 1) return
        setLoading(true); setError(null)
        try {
            const [profile, linear, logistic, valid, taste] = await Promise.all([
                axios.get(`${API}/books/user/${uid}`),
                axios.get(`${API}/books/recommend/${uid}`),
                axios.get(`${API}/books/recommend-logistic/${uid}`),
                axios.get(`${API}/books/validate/${uid}`),
                axios.get(`${API}/books/user-taste/${uid}`),
            ])
            setProfile(profile.data)
            setLinear(linear.data.recommendations)
            setLogistic(logistic.data.recommendations)
            setValidation(valid.data)
            setTasteProfile(taste.data)
        } catch (err) {
            setError(err.response?.data?.detail || 'Błąd połączenia z API')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1 style={{ textAlign: 'center', marginBottom: '4px' }}>
                📚 {t('books_app.title')}
            </h1>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '24px' }}>
                {t('books_app.subtitle')}
            </p>

            <div style={{
                display: 'flex', justifyContent: 'center',
                borderBottom: '1px solid #e0e0e0', marginBottom: '32px'
            }}>
                <button style={tabStyle('existing')} onClick={() => setActiveTab('existing')}>
                    👤 {t('books_app.tab_existing')}
                </button>
                <button style={tabStyle('new')} onClick={() => setActiveTab('new')}>
                    ✨ {t('books_app.tab_new')}
                </button>
            </div>

            {activeTab === 'existing' && (
                <>
                    <SimilarBooksUsersFilter onSelectUser={fetchAll} />
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                        <input
                            type="number"
                            placeholder={t('books_app.search_placeholder')}
                            value={userId}
                            onChange={e => setUserId(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && fetchAll(userId)}
                            style={{
                                padding: '10px 16px', fontSize: '16px',
                                border: '2px solid #ddd', borderRadius: '8px',
                                width: '220px', outline: 'none'
                            }}
                        />
                        <button onClick={() => fetchAll(userId)} style={{
                            padding: '10px 24px', fontSize: '16px',
                            background: '#2ecc71', color: 'white',
                            border: 'none', borderRadius: '8px', cursor: 'pointer'
                        }}>
                            {t('books_app.search_button')}
                        </button>
                    </div>

                    {error && (
                        <div style={{
                            background: '#fee', border: '1px solid #fcc',
                            borderRadius: '8px', padding: '12px', margin: '16px 0', color: '#c00'
                        }}>⚠️ {error}</div>
                    )}

                    {loading && (
                        <div style={{ textAlign: 'center', padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                            <Spinner size={40} color="#2ecc71" />
                            <div>{t('books_app.loading')}</div>
                        </div>
                    )}

                    {!loading && userProfile && (
                        <>
                            <BookUserProfile profile={userProfile} />
                            <BookTasteProfile taste={tasteProfile} />

                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr',
                                gap: '24px', marginTop: '24px'
                            }}>
                                <div>
                                    <h2 style={{ borderBottom: '2px solid #4a90d9', paddingBottom: '8px' }}>
                                        📈 {t('books_app.linear_title')}
                                    </h2>
                                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                                        {t('books_app.linear_desc')}
                                    </p>
                                    {recsLinear.map((rec, i) => (
                                        <BookCard key={rec.isbn} rank={i + 1} rec={rec} type="linear" />
                                    ))}
                                </div>
                                <div>
                                    <h2 style={{ borderBottom: '2px solid #e87040', paddingBottom: '8px' }}>
                                        🎯 {t('books_app.logistic_title')}
                                    </h2>
                                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                                        {t('books_app.logistic_desc')}
                                    </p>
                                    {recsLogistic.map((rec, i) => (
                                        <BookCard key={rec.isbn} rank={i + 1} rec={rec} type="logistic" />
                                    ))}
                                </div>
                            </div>
                            <BookValidation validation={validation} />
                        </>
                    )}
                </>
            )}

            {activeTab === 'new' && <NewUserBooks />}
        </div>
    )
}
