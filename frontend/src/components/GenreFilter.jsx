import { useLang } from '../LangContext'

const GENRES_EN = [
    'Action', 'Adventure', 'Animation', "Children's", 'Comedy', 'Crime',
    'Documentary', 'Drama', 'Fantasy', 'Film-Noir', 'Horror', 'Musical',
    'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'
]

export { GENRES_EN }

export default function GenreFilter({ selected, onChange }) {
    const { t } = useLang()

    function toggle(en) {
        if (selected.includes(en)) {
            onChange(selected.filter(g => g !== en))
        } else {
            onChange([...selected, en])
        }
    }

    function selectAll() { onChange([]) }
    function selectNone() { onChange(GENRES_EN) }

    const hiddenCount = selected.length
    const suffix = hiddenCount === 1
        ? t('genre_filter.genre_suffix_1')
        : hiddenCount < 5
            ? t('genre_filter.genre_suffix_2')
            : t('genre_filter.genre_suffix_5')

    return (
        <div style={{
            background: '#f8f9fa', border: '1px solid #e0e0e0',
            borderRadius: '12px', padding: '16px', marginBottom: '20px'
        }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '12px'
            }}>
                <h4 style={{ margin: 0, color: '#333', fontSize: '14px' }}>
                    🎬 {t('genre_filter.title')}
                </h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={selectAll}
                        style={{
                            padding: '4px 10px', fontSize: '12px', background: '#eee',
                            border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#555'
                        }}>
                        {t('genre_filter.show_all')}
                    </button>
                    <button onClick={selectNone}
                        style={{
                            padding: '4px 10px', fontSize: '12px', background: '#eee',
                            border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#555'
                        }}>
                        {t('genre_filter.hide_all')}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {GENRES_EN.map(en => {
                    const excluded = selected.includes(en)
                    return (
                        <button key={en} onClick={() => toggle(en)}
                            style={{
                                padding: '5px 12px', fontSize: '12px', fontWeight: '600',
                                border: `1px solid ${excluded ? '#e74c3c' : '#4a90d9'}`,
                                borderRadius: '20px', cursor: 'pointer',
                                background: excluded ? '#fdf0f0' : '#e8f4fd',
                                color: excluded ? '#e74c3c' : '#4a90d9',
                                transition: 'all 0.15s',
                                textDecoration: excluded ? 'line-through' : 'none'
                            }}>
                            {excluded ? '✕ ' : ''}{t('genres', en)}
                        </button>
                    )
                })}
            </div>

            {selected.length > 0 && (
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#e74c3c' }}>
                    {t('genre_filter.hidden')} {hiddenCount} {suffix}
                </div>
            )}
        </div>
    )
}