import { useState } from 'react'
import axios from 'axios'
import SearchBar from './components/SearchBar'
import UserProfile from './components/UserProfile'
import RecommendationCard from './components/RecommendationCard'
import ValidationChart from './components/ValidationChart'
import SimilarUsersFilter from './components/SimilarUsersFilter'
import UserComparison from './components/UserComparison'
import NewUserFlow from './components/NewUserFlow'
import Spinner from './components/Spinner'
import UserTasteProfile from './components/UserTasteProfile'

const API = 'http://localhost:8000'

export default function App() {
  const [activeTab, setActiveTab] = useState('existing')

  // stan dla zakładki "użytkownik z bazy"
  const [userId, setUserId] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [recsLinear, setRecsLinear] = useState([])
  const [recsLogistic, setRecsLogistic] = useState([])
  const [validation, setValidation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tasteProfile, setTasteProfile] = useState(null)

  // stan dla porównania
  const [compareUserId, setCompareUserId] = useState('')
  const [comparison, setComparison] = useState(null)
  const [compareLoading, setCompareLoading] = useState(false)

  async function fetchAll(id) {
    setLoading(true)
    setError(null)
    setComparison(null)
    try {
      const [profile, linear, logistic, valid, taste] = await Promise.all([
        axios.get(`${API}/user/${id}`),
        axios.get(`${API}/recommend/${id}`),
        axios.get(`${API}/recommend-logistic/${id}`),
        axios.get(`${API}/validate/${id}`),
        axios.get(`${API}/user-taste/${id}`)
      ])
      setUserId(id)
      setUserProfile(profile.data)
      setRecsLinear(linear.data.recommendations)
      setRecsLogistic(logistic.data.recommendations)
      setValidation(valid.data)
      setTasteProfile(taste.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Błąd połączenia z API')
    } finally {
      setLoading(false)
    }
  }

  async function fetchComparison() {
    const id2 = parseInt(compareUserId)
    if (isNaN(id2) || id2 < 1 || id2 > 6040) return
    setCompareLoading(true)
    try {
      const res = await axios.get(`${API}/compare-users/${userId}/${id2}`)
      setComparison(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Błąd porównania')
    } finally {
      setCompareLoading(false)
    }
  }

  const tabStyle = (tab) => ({
    padding: '12px 32px',
    fontSize: '15px',
    fontWeight: '600',
    border: 'none',
    borderBottom: activeTab === tab ? '3px solid #4a90d9' : '3px solid transparent',
    background: 'none',
    color: activeTab === tab ? '#4a90d9' : '#888',
    cursor: 'pointer',
    transition: 'all 0.2s'
  })

  return (
    <div style={{
      maxWidth: '1200px', margin: '0 auto', padding: '24px',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '4px' }}>🎬 Film Recommender</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '24px' }}>
        Predykcja doboru treści audiowizualnych — regresja liniowa vs logistyczna
      </p>

      {/* zakładki */}
      <div style={{
        display: 'flex', justifyContent: 'center',
        borderBottom: '1px solid #e0e0e0', marginBottom: '32px'
      }}>
        <button style={tabStyle('existing')} onClick={() => setActiveTab('existing')}>
          👤 Użytkownik z bazy
        </button>
        <button style={tabStyle('new')} onClick={() => setActiveTab('new')}>
          ✨ Moje rekomendacje
        </button>
      </div>

      {/* zakładka 1 — użytkownik z bazy */}
      {activeTab === 'existing' && (
        <>
          <SearchBar onSearch={fetchAll} />
          <SimilarUsersFilter API={API} onSelectUser={fetchAll} />

          {error && (
            <div style={{
              background: '#fee', border: '1px solid #fcc',
              borderRadius: '8px', padding: '12px',
              margin: '16px 0', color: '#c00'
            }}>
              ⚠️ {error}
            </div>
          )}

          {loading && (
            <div style={{
              textAlign: 'center', padding: '48px', color: '#666',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '16px'
            }}>
              <Spinner size={40} color="#4a90d9" />
              <div>Generowanie rekomendacji...</div>
            </div>
          )}

          {!loading && userProfile && (
            <>
              <UserProfile profile={userProfile} />
              <UserTasteProfile taste={tasteProfile} />

              {/* porównanie użytkowników */}
              <div style={{
                margin: '24px 0', padding: '16px',
                background: '#f8f9fa', borderRadius: '12px',
                border: '1px solid #e0e0e0'
              }}>
                <h3 style={{ margin: '0 0 12px 0' }}>🔄 Porównaj z innym użytkownikiem</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="number" min="1" max="6040"
                    placeholder="ID drugiego użytkownika"
                    value={compareUserId}
                    onChange={e => setCompareUserId(e.target.value)}
                    style={{
                      padding: '8px 12px', borderRadius: '8px',
                      border: '2px solid #ddd', fontSize: '14px', width: '200px'
                    }}
                  />
                  <button onClick={fetchComparison} disabled={compareLoading}
                    style={{
                      padding: '8px 20px', background: '#4a90d9',
                      color: 'white', border: 'none', borderRadius: '8px',
                      cursor: 'pointer', fontSize: '14px'
                    }}>
                    {compareLoading ? '⏳ Ładowanie...' : 'Porównaj'}
                  </button>
                </div>
              </div>

              {comparison && <UserComparison comparison={comparison} />}

              {/* dwa panele rekomendacji */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '24px', marginTop: '24px'
              }}>
                <div>
                  <h2 style={{ borderBottom: '2px solid #4a90d9', paddingBottom: '8px' }}>
                    📈 Regresja liniowa
                  </h2>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                    Przewidywana ocena (1–5)
                  </p>
                  {recsLinear.map((rec, i) => (
                    <RecommendationCard key={rec.movieId} rank={i + 1}
                      rec={rec} type="linear" />
                  ))}
                </div>
                <div>
                  <h2 style={{ borderBottom: '2px solid #e87040', paddingBottom: '8px' }}>
                    🎯 Regresja logistyczna
                  </h2>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                    Prawdopodobieństwo polubienia (%)
                  </p>
                  {recsLogistic.map((rec, i) => (
                    <RecommendationCard key={rec.movieId} rank={i + 1}
                      rec={rec} type="logistic" />
                  ))}
                </div>
              </div>

              <ValidationChart validation={validation} />
            </>
          )}
        </>
      )}

      {/* zakładka 2 — nowy użytkownik */}
      {activeTab === 'new' && <NewUserFlow API={API} />}
    </div>
  )
}