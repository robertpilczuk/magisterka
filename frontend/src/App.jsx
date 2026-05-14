import { useState, useEffect } from 'react'
import { useLang } from './LangContext'
import axios from 'axios'
import LandingPage from './components/LandingPage'
import BooksApp from './components/BooksApp'
import AboutPage from './components/AboutPage'
import SearchBar from './components/SearchBar'
import UserProfile from './components/UserProfile'
import RecommendationCard from './components/RecommendationCard'
import ValidationChart from './components/ValidationChart'
import SimilarUsersFilter from './components/SimilarUsersFilter'
import UserComparison from './components/UserComparison'
import NewUserFlow from './components/NewUserFlow'
import Spinner from './components/Spinner'
import UserTasteProfile from './components/UserTasteProfile'
import GenreFilter from './components/GenreFilter'
import DeepAnalysisFlow from './components/DeepAnalysisFlow'

const API = 'http://localhost:8000'

export default function App() {
  const { lang, setLang, t } = useLang()
  const [activeTab, setActiveTab] = useState('existing')
  const [contentType, setContentType] = useState(null)

  const [userId, setUserId] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [recsLinear, setRecsLinear] = useState([])
  const [recsLogistic, setRecsLogistic] = useState([])
  const [validation, setValidation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tasteProfile, setTasteProfile] = useState(null)
  const [excludedGenres, setExcludedGenres] = useState([])
  const [excludedProfileGenres, setExcludedProfileGenres] = useState([])
  const [topN, setTopN] = useState(10)

  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('searchHistory') || '[]')
    } catch { return [] }
  })

  function addToHistory(id) {
    setSearchHistory(prev => {
      const filtered = prev.filter(x => x !== id)
      const next = [id, ...filtered].slice(0, 8)
      sessionStorage.setItem('searchHistory', JSON.stringify(next))
      return next
    })
  }

  const [compareUserId, setCompareUserId] = useState('')
  const [comparison, setComparison] = useState(null)
  const [compareLoading, setCompareLoading] = useState(false)

  function toggleLang() {
    setLang(lang === 'PL' ? 'EN' : 'PL')
  }

  async function fetchAll(id, n = topN) {
    setLoading(true)
    setError(null)
    setComparison(null)
    try {
      const [profile, linear, logistic, valid, taste] = await Promise.all([
        axios.get(`${API}/user/${id}`),
        axios.get(`${API}/recommend/${id}?top_n=${n}`),
        axios.get(`${API}/recommend-logistic/${id}?top_n=${n}`),
        axios.get(`${API}/validate/${id}`),
        axios.get(`${API}/user-taste/${id}`)
      ])
      setUserId(id)
      addToHistory(id)
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

  useEffect(() => {
    if (userId) fetchAll(userId, topN)
  }, [topN])

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

  function exportCSV(recs, type) {
    const header = type === 'linear'
      ? 'rank,title,genres,predicted_rating'
      : 'rank,title,genres,like_probability'
    const rows = recs.map((r, i) => {
      const score = type === 'linear'
        ? r.predicted_rating.toFixed(2)
        : (r.like_probability * 100).toFixed(1) + '%'
      return `${i + 1},"${r.title}","${r.genres}",${score}`
    })
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recommendations_${type}_user${userId}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const tabStyle = (tab) => ({
    padding: '12px 32px', fontSize: '15px', fontWeight: '600',
    border: 'none',
    borderBottom: activeTab === tab ? '3px solid #4a90d9' : '3px solid transparent',
    background: 'none',
    color: activeTab === tab ? '#4a90d9' : '#888',
    cursor: 'pointer', transition: 'all 0.2s'
  })

  function filterByGenre(recs) {
    if (excludedGenres.length === 0) return recs
    return recs.filter(rec => !excludedGenres.some(g => rec.genres.includes(g)))
  }

  const fixedBtnStyle = {
    padding: '6px 14px', borderRadius: '20px',
    border: '2px solid #333', background: 'white',
    cursor: 'pointer', fontSize: '13px', fontWeight: '700',
    color: '#333', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
  }

  // ─── Landing ───────────────────────────────────────────────────────────────
  if (!contentType) {
    return <LandingPage onSelect={setContentType} />
  }

  // ─── Books ─────────────────────────────────────────────────────────────────
  if (contentType === 'books') {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', fontFamily: 'sans-serif' }}>
        <div style={{ position: 'fixed', top: '16px', left: '16px', zIndex: 1000 }}>
          <button onClick={() => setContentType(null)} style={fixedBtnStyle}>
            {t('landing.back')}
          </button>
        </div>
        <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 1000 }}>
          <button onClick={toggleLang} style={fixedBtnStyle}>
            {lang === 'PL' ? '🇬🇧 EN' : '🇵🇱 PL'}
          </button>
        </div>
        <div style={{ marginTop: '48px' }}>
          <BooksApp />
        </div>
      </div>
    )
  }

  // ─── Films ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', fontFamily: 'sans-serif' }}>

      {/* fixed buttons */}
      <button onClick={() => setContentType(null)} style={{
        ...fixedBtnStyle, position: 'fixed', top: '16px', left: '16px', zIndex: 1000
      }}>
        {t('landing.back')}
      </button>
      <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 1000 }}>
        <button onClick={toggleLang} style={fixedBtnStyle}>
          {lang === 'PL' ? '🇬🇧 EN' : '🇵🇱 PL'}
        </button>
      </div>

      <h1 style={{ textAlign: 'center', marginBottom: '4px' }}>{t('nav.app_title')}</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '24px' }}>
        {t('nav.app_subtitle')}
      </p>

      {/* zakładki */}
      <div style={{
        display: 'flex', justifyContent: 'center',
        borderBottom: '1px solid #e0e0e0', marginBottom: '32px'
      }}>
        <button style={tabStyle('existing')} onClick={() => setActiveTab('existing')}>
          👤 {t('nav.tab_existing')}
        </button>
        <button style={tabStyle('new')} onClick={() => setActiveTab('new')}>
          ✨ {t('nav.tab_new')}
        </button>
        <button style={tabStyle('deep')} onClick={() => setActiveTab('deep')}>
          🔬 {t('nav.tab_deep')}
        </button>
        <button style={tabStyle('about')} onClick={() => setActiveTab('about')}>
          ℹ️ {t('nav.tab_about')}
        </button>
      </div>

      {/* suwak top_n — tylko dla zakładki existing */}
      {activeTab === 'existing' && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>{t('top_n.label')}:</span>
          <input
            type="range" min="5" max="50" step="5" value={topN}
            onChange={e => setTopN(parseInt(e.target.value))}
            style={{ width: '200px', accentColor: '#4a90d9', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#4a90d9', minWidth: '32px' }}>
            {topN}
          </span>
        </div>
      )}

      {/* zakładka 1 — użytkownik z bazy */}
      {activeTab === 'existing' && (
        <>
          <SearchBar onSearch={fetchAll} />
          {searchHistory.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              flexWrap: 'wrap', marginBottom: '16px'
            }}>
              <span style={{ fontSize: '13px', color: '#888' }}>
                {t('history.title')}:
              </span>
              {searchHistory.map(id => (
                <button key={id} onClick={() => fetchAll(id)}
                  style={{
                    padding: '4px 12px', background: '#e8f4fd',
                    color: '#4a90d9', border: '1px solid #4a90d9',
                    borderRadius: '20px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: '600'
                  }}>
                  #{id}
                </button>
              ))}
              <button onClick={() => {
                setSearchHistory([])
                sessionStorage.removeItem('searchHistory')
              }} style={{
                padding: '4px 10px', background: '#eee', color: '#888',
                border: 'none', borderRadius: '20px', cursor: 'pointer',
                fontSize: '12px'
              }}>
                ✕ {t('history.clear')}
              </button>
            </div>
          )}
          <SimilarUsersFilter API={API} onSelectUser={fetchAll} />

          {error && (
            <div style={{
              background: '#fee', border: '1px solid #fcc',
              borderRadius: '8px', padding: '12px', margin: '16px 0', color: '#c00'
            }}>
              ⚠️ {error}
            </div>
          )}

          {loading && (
            <div style={{
              textAlign: 'center', padding: '48px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px'
            }}>
              <Spinner size={40} color="#4a90d9" />
              <div>{t('nav.loading_recs')}</div>
            </div>
          )}

          {!loading && userProfile && (
            <>
              <UserProfile profile={userProfile} />
              <UserTasteProfile
                taste={tasteProfile}
                excludedGenres={excludedProfileGenres}
                onToggleGenre={(g) => {
                  setExcludedProfileGenres(prev =>
                    prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
                  )
                }}
              />
              <GenreFilter selected={excludedGenres} onChange={setExcludedGenres} />

              {/* porównanie użytkowników */}
              <div style={{
                margin: '24px 0', padding: '16px',
                background: '#f8f9fa', borderRadius: '12px', border: '1px solid #e0e0e0'
              }}>
                <h3 style={{ margin: '0 0 12px 0' }}>🔄 {t('comparison.title')}</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="number" min="1" max="6040"
                    placeholder={t('comparison.input_label')}
                    value={compareUserId}
                    onChange={e => setCompareUserId(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '2px solid #ddd', fontSize: '14px', width: '200px' }}
                  />
                  <button onClick={fetchComparison} disabled={compareLoading}
                    style={{
                      padding: '8px 20px', background: '#4a90d9', color: 'white',
                      border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
                    }}>
                    {compareLoading ? t('comparison.loading') : t('comparison.button')}
                  </button>
                </div>
              </div>

              {comparison && <UserComparison comparison={comparison} />}

              {/* dwa panele rekomendacji */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #4a90d9', paddingBottom: '8px', marginBottom: '0' }}>
                    <h2 style={{ margin: 0 }}>📈 {t('nav.linear_title')}</h2>
                    <button onClick={() => exportCSV(filterByGenre(recsLinear), 'linear')}
                      style={{
                        padding: '6px 12px', background: '#e8f4fd', color: '#4a90d9',
                        border: '1px solid #4a90d9', borderRadius: '8px',
                        cursor: 'pointer', fontSize: '12px', fontWeight: '600'
                      }}>
                      ⬇️ {t('export_csv')}
                    </button>
                  </div>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                    {t('nav.linear_desc')}
                  </p>
                  {filterByGenre(recsLinear).map((rec, i) => (
                    <RecommendationCard key={rec.movieId} rank={i + 1} rec={rec} type="linear" userId={userId} />
                  ))}
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e87040', paddingBottom: '8px', marginBottom: '0' }}>
                    <h2 style={{ margin: 0 }}>🎯 {t('nav.logistic_title')}</h2>
                    <button onClick={() => exportCSV(filterByGenre(recsLogistic), 'logistic')}
                      style={{
                        padding: '6px 12px', background: '#fff0ea', color: '#e87040',
                        border: '1px solid #e87040', borderRadius: '8px',
                        cursor: 'pointer', fontSize: '12px', fontWeight: '600'
                      }}>
                      ⬇️ {t('export_csv')}
                    </button>
                  </div>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                    {t('nav.logistic_desc')}
                  </p>
                  {filterByGenre(recsLogistic).map((rec, i) => (
                    <RecommendationCard key={rec.movieId} rank={i + 1} rec={rec} type="logistic" userId={userId} />
                  ))}
                </div>
              </div>

              <ValidationChart validation={validation} excludedGenres={excludedGenres} />
            </>
          )}
        </>
      )}

      {activeTab === 'new' && <NewUserFlow API={API} />}
      {activeTab === 'deep' && <DeepAnalysisFlow API={API} />}
      {activeTab === 'about' && <AboutPage />}
    </div>
  )
}
