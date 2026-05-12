import { useState } from 'react'
import Tooltip from './Tooltip'

const GENRE_PL = {
    'Action': 'Akcja', 'Adventure': 'Przygodowy', 'Animation': 'Animacja',
    "Children's": 'Dla dzieci', 'Comedy': 'Komedia', 'Crime': 'Kryminał',
    'Documentary': 'Dokumentalny', 'Drama': 'Dramat', 'Fantasy': 'Fantasy',
    'Film-Noir': 'Film Noir', 'Horror': 'Horror', 'Musical': 'Musical',
    'Mystery': 'Thriller psych.', 'Romance': 'Romans', 'Sci-Fi': 'Sci-Fi',
    'Thriller': 'Thriller', 'War': 'Wojenny', 'Western': 'Western'
}

function translateGenres(genres) {
    return genres.split('|').map(g => GENRE_PL[g] || g).join(' · ')
}

function MovieRow({ movie, color }) {
    return (
        <div style={{
            padding: '8px 10px', marginBottom: '5px', background: 'white',
            borderRadius: '8px', borderLeft: `3px solid ${color}`,
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', gap: '8px'
        }}>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>
                    {movie.title}
                </div>
                <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>
                    {translateGenres(movie.genres)}
                </div>
            </div>
            <div style={{
                fontSize: '13px', fontWeight: '700', color,
                whiteSpace: 'nowrap'
            }}>
                {movie.rating * 2}/10
            </div>
        </div>
    )
}

const PAGE_SIZE = 8

function CategoryBlock({ title, tooltip, movies, color, count,
    excludedGenres, onToggleGenre }) {
    const [page, setPage] = useState(1)

    const filtered = excludedGenres?.length > 0
        ? movies.filter(m => !excludedGenres.some(g => m.genres.includes(g)))
        : movies

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    const visible = filtered.slice(0, page * PAGE_SIZE)
    const hasMore = page * PAGE_SIZE < filtered.length

    return (
        <div style={{ flex: 1, minWidth: '220px' }}>
            <Tooltip text={tooltip}>
                <h4 style={{
                    margin: '0 0 10px 0', color,
                    borderBottom: `2px solid ${color}`,
                    paddingBottom: '6px', cursor: 'help',
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span>{title}</span>
                    <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#888' }}>
                        {filtered.length}/{count} filmów
                    </span>
                </h4>
            </Tooltip>

            {filtered.length === 0
                ? <div style={{
                    fontSize: '13px', color: '#aaa', fontStyle: 'italic',
                    padding: '8px 0'
                }}>
                    Brak filmów po zastosowaniu filtrów
                </div>
                : <>
                    {visible.map(m => (
                        <MovieRow key={m.movieId} movie={m} color={color} />
                    ))}
                    {hasMore && (
                        <button onClick={() => setPage(p => p + 1)}
                            style={{
                                width: '100%', marginTop: '8px', padding: '6px',
                                background: '#f0f0f0', border: 'none',
                                borderRadius: '8px', cursor: 'pointer',
                                fontSize: '12px', color: '#666'
                            }}>
                            ↓ Pokaż więcej ({filtered.length - page * PAGE_SIZE} pozostałych)
                        </button>
                    )}
                </>
            }
        </div>
    )
}

export default function UserTasteProfile({ taste, excludedGenres, onToggleGenre }) {
    if (!taste) return null
    const { topGenres, lubi, srednie, slabe, stats } = taste

    const lubiPct = Math.round(stats.lubiCount / stats.total * 100)
    const sredniePct = Math.round(stats.srednieCount / stats.total * 100)
    const slabePct = Math.round(stats.slabeCount / stats.total * 100)

    return (
        <div style={{
            marginTop: '20px', background: '#f8f9fa',
            border: '1px solid #e0e0e0', borderRadius: '12px',
            padding: '20px'
        }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>
                🎭 Profil filmowy użytkownika
            </h3>

            <Tooltip text={`Lubi ${lubiPct}% filmów · Neutralny wobec ${sredniePct}% · Nie lubi ${slabePct}%`}>
                <div style={{ marginBottom: '16px', cursor: 'help' }}>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>
                        Proporcje ocen
                    </div>
                    <div style={{
                        display: 'flex', height: '12px',
                        borderRadius: '6px', overflow: 'hidden'
                    }}>
                        <div style={{ width: `${lubiPct}%`, background: '#2ecc71' }} />
                        <div style={{ width: `${sredniePct}%`, background: '#f39c12' }} />
                        <div style={{ width: `${slabePct}%`, background: '#e74c3c' }} />
                    </div>
                    <div style={{
                        display: 'flex', gap: '16px', marginTop: '6px',
                        fontSize: '12px'
                    }}>
                        <span style={{ color: '#2ecc71' }}>■ Lubi {lubiPct}%</span>
                        <span style={{ color: '#f39c12' }}>■ Neutralne {sredniePct}%</span>
                        <span style={{ color: '#e74c3c' }}>■ Nie lubi {slabePct}%</span>
                    </div>
                </div>
            </Tooltip>

            {topGenres.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>
                        Ulubione gatunki — kliknij żeby wykluczyć z rekomendacji:
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {topGenres.map(g => (
                            <button key={g} onClick={() => onToggleGenre && onToggleGenre(g)}
                                style={{
                                    padding: '4px 10px',
                                    background: excludedGenres?.includes(g) ? '#fdf0f0' : '#e8f4fd',
                                    color: excludedGenres?.includes(g) ? '#e74c3c' : '#4a90d9',
                                    border: `1px solid ${excludedGenres?.includes(g) ? '#e74c3c' : '#4a90d9'}`,
                                    borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                                    cursor: 'pointer', transition: 'all 0.15s',
                                    textDecoration: excludedGenres?.includes(g) ? 'line-through' : 'none'
                                }}>
                                {excludedGenres?.includes(g) ? '✕ ' : ''}{GENRE_PL[g] || g}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <CategoryBlock
                    title="👍 Lubi" color="#2ecc71" movies={lubi} count={stats.lubiCount}
                    tooltip="Filmy ocenione 8–10/10 — model generuje rekomendacje na ich podstawie"
                    excludedGenres={excludedGenres} onToggleGenre={onToggleGenre}
                />
                <CategoryBlock
                    title="😐 Neutralne" color="#f39c12" movies={srednie} count={stats.srednieCount}
                    tooltip="Filmy ocenione 6/10 — słaby sygnał dla modelu"
                    excludedGenres={excludedGenres} onToggleGenre={onToggleGenre}
                />
                <CategoryBlock
                    title="👎 Nie lubi" color="#e74c3c" movies={slabe} count={stats.slabeCount}
                    tooltip="Filmy ocenione 2–4/10 — model stara się unikać podobnych tytułów"
                    excludedGenres={excludedGenres} onToggleGenre={onToggleGenre}
                />
            </div>
        </div>
    )
}