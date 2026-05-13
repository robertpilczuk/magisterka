import { useState } from 'react'
import Tooltip from './Tooltip'
import { useLang } from '../LangContext'

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
                    {movie.genres.split('|').map(g => g).join(' · ')}
                </div>
            </div>
            <div style={{ fontSize: '13px', fontWeight: '700', color, whiteSpace: 'nowrap' }}>
                {movie.rating * 2}/10
            </div>
        </div>
    )
}

const PAGE_SIZE = 8

function CategoryBlock({ title, tooltip, movies, color, count, excludedGenres, onToggleGenre }) {
    const [page, setPage] = useState(1)
    const { t } = useLang()

    const filtered = excludedGenres?.length > 0
        ? movies.filter(m => !excludedGenres.some(g => m.genres.includes(g)))
        : movies

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
                        {filtered.length}/{count} {t('taste.films_suffix')}
                    </span>
                </h4>
            </Tooltip>

            {filtered.length === 0
                ? <div style={{ fontSize: '13px', color: '#aaa', fontStyle: 'italic', padding: '8px 0' }}>
                    {t('taste.no_films_filter')}
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
                            ↓ {t('taste.show_more')} ({filtered.length - page * PAGE_SIZE} {t('taste.remaining')})
                        </button>
                    )}
                </>
            }
        </div>
    )
}

export default function UserTasteProfile({ taste, excludedGenres, onToggleGenre }) {
    const { t } = useLang()
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
                🎭 {t('taste.title')}
            </h3>

            <Tooltip text={`${t('taste.likes_pct')} ${lubiPct}% · ${t('taste.neutral_pct')} ${sredniePct}% · ${t('taste.dislikes_pct')} ${slabePct}%`}>
                <div style={{ marginBottom: '16px', cursor: 'help' }}>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>
                        {t('taste.proportions')}
                    </div>
                    <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${lubiPct}%`, background: '#2ecc71' }} />
                        <div style={{ width: `${sredniePct}%`, background: '#f39c12' }} />
                        <div style={{ width: `${slabePct}%`, background: '#e74c3c' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '12px' }}>
                        <span style={{ color: '#2ecc71' }}>■ {t('taste.likes_pct')} {lubiPct}%</span>
                        <span style={{ color: '#f39c12' }}>■ {t('taste.neutral_pct')} {sredniePct}%</span>
                        <span style={{ color: '#e74c3c' }}>■ {t('taste.dislikes_pct')} {slabePct}%</span>
                    </div>
                </div>
            </Tooltip>

            {topGenres.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>
                        {t('taste.top_genres')}
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
                                {excludedGenres?.includes(g) ? '✕ ' : ''}{t('genres', g)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <CategoryBlock
                    title={t('taste.likes')} color="#2ecc71" movies={lubi} count={stats.lubiCount}
                    tooltip={t('taste.likes_tooltip')}
                    excludedGenres={excludedGenres} onToggleGenre={onToggleGenre}
                />
                <CategoryBlock
                    title={t('taste.neutral')} color="#f39c12" movies={srednie} count={stats.srednieCount}
                    tooltip={t('taste.neutral_tooltip')}
                    excludedGenres={excludedGenres} onToggleGenre={onToggleGenre}
                />
                <CategoryBlock
                    title={t('taste.dislikes')} color="#e74c3c" movies={slabe} count={stats.slabeCount}
                    tooltip={t('taste.dislikes_tooltip')}
                    excludedGenres={excludedGenres} onToggleGenre={onToggleGenre}
                />
            </div>
        </div>
    )
}