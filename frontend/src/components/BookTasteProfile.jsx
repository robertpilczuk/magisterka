import { useState } from 'react'
import { useLang } from '../LangContext'
import Tooltip from './Tooltip'

const PAGE_SIZE = 8

function BookRow({ book, color }) {
    return (
        <div style={{
            padding: '8px 10px', marginBottom: '5px', background: 'white',
            borderRadius: '8px', borderLeft: `3px solid ${color}`,
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', gap: '8px'
        }}>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>
                    {book.title}
                </div>
                <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>
                    ✍️ {book.author}
                </div>
            </div>
            <div style={{ fontSize: '13px', fontWeight: '700', color, whiteSpace: 'nowrap' }}>
                {book.rating}/10
            </div>
        </div>
    )
}

function CategoryBlock({ title, tooltip, books, color, count }) {
    const { t } = useLang()
    const [page, setPage] = useState(1)

    const visible = books.slice(0, page * PAGE_SIZE)
    const hasMore = page * PAGE_SIZE < books.length

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
                        {count} {t('books_taste.books_suffix')}
                    </span>
                </h4>
            </Tooltip>

            {books.length === 0
                ? <div style={{ fontSize: '13px', color: '#aaa', fontStyle: 'italic', padding: '8px 0' }}>
                    {t('books_taste.no_books')}
                </div>
                : <>
                    {visible.map(b => (
                        <BookRow key={b.isbn} book={b} color={color} />
                    ))}
                    {hasMore && (
                        <button onClick={() => setPage(p => p + 1)}
                            style={{
                                width: '100%', marginTop: '8px', padding: '6px',
                                background: '#f0f0f0', border: 'none',
                                borderRadius: '8px', cursor: 'pointer',
                                fontSize: '12px', color: '#666'
                            }}>
                            ↓ {t('books_taste.show_more')} ({books.length - page * PAGE_SIZE} {t('books_taste.remaining')})
                        </button>
                    )}
                </>
            }
        </div>
    )
}

export default function BookTasteProfile({ taste }) {
    const { t } = useLang()
    if (!taste) return null

    const { lubi, srednie, slabe, stats } = taste
    const lubiPct    = Math.round(stats.lubiCount    / stats.total * 100)
    const sredniePct = Math.round(stats.srednieCount / stats.total * 100)
    const slabePct   = Math.round(stats.slabeCount   / stats.total * 100)

    return (
        <div style={{
            marginTop: '20px', background: '#f8f9fa',
            border: '1px solid #e0e0e0', borderRadius: '12px', padding: '20px'
        }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>
                📖 {t('books_taste.title')}
            </h3>

            <Tooltip text={`${t('books_taste.likes_pct')} ${lubiPct}% · ${t('books_taste.neutral_pct')} ${sredniePct}% · ${t('books_taste.dislikes_pct')} ${slabePct}%`}>
                <div style={{ marginBottom: '16px', cursor: 'help' }}>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>
                        {t('books_taste.proportions')}
                    </div>
                    <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${lubiPct}%`, background: '#2ecc71' }} />
                        <div style={{ width: `${sredniePct}%`, background: '#f39c12' }} />
                        <div style={{ width: `${slabePct}%`, background: '#e74c3c' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '12px' }}>
                        <span style={{ color: '#2ecc71' }}>■ {t('books_taste.likes_pct')} {lubiPct}%</span>
                        <span style={{ color: '#f39c12' }}>■ {t('books_taste.neutral_pct')} {sredniePct}%</span>
                        <span style={{ color: '#e74c3c' }}>■ {t('books_taste.dislikes_pct')} {slabePct}%</span>
                    </div>
                </div>
            </Tooltip>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <CategoryBlock
                    title={t('books_taste.likes')} color="#2ecc71"
                    books={lubi} count={stats.lubiCount}
                    tooltip={t('books_taste.likes_tooltip')}
                />
                <CategoryBlock
                    title={t('books_taste.neutral')} color="#f39c12"
                    books={srednie} count={stats.srednieCount}
                    tooltip={t('books_taste.neutral_tooltip')}
                />
                <CategoryBlock
                    title={t('books_taste.dislikes')} color="#e74c3c"
                    books={slabe} count={stats.slabeCount}
                    tooltip={t('books_taste.dislikes_tooltip')}
                />
            </div>
        </div>
    )
}
