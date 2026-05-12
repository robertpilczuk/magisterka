import { useState } from 'react'
import axios from 'axios'
import SearchBar from './components/SearchBar'
import UserProfile from './components/UserProfile'
import RecommendationCard from './components/RecommendationCard'
import ValidationChart from './components/ValidationChart'

const API = 'http://localhost:8000'

export default function App() {
  const [userId, setUserId] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [recsLinear, setRecsLinear] = useState([])
  const [recsLogistic, setRecsLogistic] = useState([])
  const [validation, setValidation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function fetchAll(id) {
    setLoading(true)
    setError(null)
    try {
      const [profile, linear, logistic, valid] = await Promise.all([
        axios.get(`${API}/user/${id}`),
        axios.get(`${API}/recommend/${id}`),
        axios.get(`${API}/recommend-logistic/${id}`),
        axios.get(`${API}/validate/${id}`)
      ])
      setUserId(id)
      setUserProfile(profile.data)
      setRecsLinear(linear.data.recommendations)
      setRecsLogistic(logistic.data.recommendations)
      setValidation(valid.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Błąd połączenia z API')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '8px' }}>
        🎬 Film Recommender
      </h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '32px' }}>
        Predykcja doboru treści audiowizualnych — regresja liniowa vs logistyczna
      </p>

      <SearchBar onSearch={fetchAll} />

      {error && (
        <div style={{
          background: '#fee', border: '1px solid #fcc', borderRadius: '8px',
          padding: '12px', margin: '16px 0', color: '#c00'
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '48px', color: '#666' }}>
          ⏳ Generowanie rekomendacji...
        </div>
      )}

      {!loading && userProfile && (
        <>
          <UserProfile profile={userProfile} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px' }}>

            {/* Panel lewy — regresja liniowa */}
            <div>
              <h2 style={{ borderBottom: '2px solid #4a90d9', paddingBottom: '8px' }}>
                📈 Regresja liniowa
              </h2>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                Przewidywana ocena (1–5)
              </p>
              {recsLinear.map((rec, i) => (
                <RecommendationCard key={rec.movieId} rank={i + 1} rec={rec} type="linear" />
              ))}
            </div>

            {/* Panel prawy — regresja logistyczna */}
            <div>
              <h2 style={{ borderBottom: '2px solid #e87040', paddingBottom: '8px' }}>
                🎯 Regresja logistyczna
              </h2>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                Prawdopodobieństwo polubienia (%)
              </p>
              {recsLogistic.map((rec, i) => (
                <RecommendationCard key={rec.movieId} rank={i + 1} rec={rec} type="logistic" />
              ))}
            </div>

          </div>

          <ValidationChart validation={validation} />
        </>
      )}
    </div>
  )
}