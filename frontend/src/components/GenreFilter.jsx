const GENRES = [
    { en: 'Action', pl: 'Akcja' },
    { en: 'Adventure', pl: 'Przygodowy' },
    { en: 'Animation', pl: 'Animacja' },
    { en: "Children's", pl: 'Dla dzieci' },
    { en: 'Comedy', pl: 'Komedia' },
    { en: 'Crime', pl: 'Kryminał' },
    { en: 'Documentary', pl: 'Dokumentalny' },
    { en: 'Drama', pl: 'Dramat' },
    { en: 'Fantasy', pl: 'Fantasy' },
    { en: 'Film-Noir', pl: 'Film Noir' },
    { en: 'Horror', pl: 'Horror' },
    { en: 'Musical', pl: 'Musical' },
    { en: 'Mystery', pl: 'Thriller psych.' },
    { en: 'Romance', pl: 'Romans' },
    { en: 'Sci-Fi', pl: 'Sci-Fi' },
    { en: 'Thriller', pl: 'Thriller' },
    { en: 'War', pl: 'Wojenny' },
    { en: 'Western', pl: 'Western' }
]

export { GENRES }

export default function GenreFilter({ selected, onChange }) {
    function toggle(en) {
        if (selected.includes(en)) {
            onChange(selected.filter(g => g !== en))
        } else {
            onChange([...selected, en])
        }
    }

    function selectAll() { onChange([]) }
    function selectNone() { onChange(GENRES.map(g => g.en)) }

    const isExcluded = (en) => selected.includes(en)
    const allShown = selected.length === 0

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
                    🎬 Filtruj gatunki
                </h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={selectAll}
                        style={{
                            padding: '4px 10px', fontSize: '12px', background: '#eee',
                            border: 'none', borderRadius: '6px', cursor: 'pointer',
                            color: '#555'
                        }}>
                        Pokaż wszystkie
                    </button>
                    <button onClick={selectNone}
                        style={{
                            padding: '4px 10px', fontSize: '12px', background: '#eee',
                            border: 'none', borderRadius: '6px', cursor: 'pointer',
                            color: '#555'
                        }}>
                        Ukryj wszystkie
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {GENRES.map(g => {
                    const excluded = isExcluded(g.en)
                    return (
                        <button key={g.en} onClick={() => toggle(g.en)}
                            style={{
                                padding: '5px 12px', fontSize: '12px', fontWeight: '600',
                                border: `1px solid ${excluded ? '#e74c3c' : '#4a90d9'}`,
                                borderRadius: '20px', cursor: 'pointer',
                                background: excluded ? '#fdf0f0' : '#e8f4fd',
                                color: excluded ? '#e74c3c' : '#4a90d9',
                                transition: 'all 0.15s',
                                textDecoration: excluded ? 'line-through' : 'none'
                            }}>
                            {excluded ? '✕ ' : ''}{g.pl}
                        </button>
                    )
                })}
            </div>

            {selected.length > 0 && (
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#e74c3c' }}>
                    Ukryto {selected.length} {selected.length === 1 ? 'gatunek' :
                        selected.length < 5 ? 'gatunki' : 'gatunków'}
                </div>
            )}
        </div>
    )
}