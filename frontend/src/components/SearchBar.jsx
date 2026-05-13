import { useState } from 'react'
import { useLang } from '../LangContext'

export default function SearchBar({ onSearch }) {
    const { t } = useLang()
    const [input, setInput] = useState('')
    const [error, setError] = useState(null)

    function handleSearch() {
        const id = parseInt(input)
        if (isNaN(id) || id < 1 || id > 6040) {
            setError(t('search.error_range'))
            return
        }
        setError(null)
        onSearch(id)
    }

    function handleKey(e) {
        if (e.key === 'Enter') handleSearch()
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
                <input
                    type="number"
                    min="1"
                    max="6040"
                    placeholder={t('search.placeholder')}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    style={{
                        padding: '10px 16px',
                        fontSize: '16px',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        width: '240px',
                        outline: 'none'
                    }}
                />
                <button
                    onClick={handleSearch}
                    style={{
                        padding: '10px 24px',
                        fontSize: '16px',
                        background: '#4a90d9',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    {t('search.button')}
                </button>
            </div>
            {error && <span style={{ color: '#c00', fontSize: '14px' }}>{error}</span>}
        </div>
    )
}