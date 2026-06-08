// pages/bookmarks.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import Link from 'next/link'
import siteConfig from '../site.config'

const SITE = siteConfig.url

function fmt(ts, locale) {
  return new Date(ts).toLocaleDateString(locale === 'en' ? 'en-GB' : 'uk-UA', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export default function BookmarksPage() {
  const { locale } = useRouter()
  const isEn = locale === 'en'
  const [bookmarks, setBookmarks] = useState(null) // null = loading
  const [removing, setRemoving] = useState(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cl-bookmarks') || '[]')
      // Сортуємо від найновіших
      setBookmarks(saved.sort((a, b) => b.savedAt - a.savedAt))
    } catch {
      setBookmarks([])
    }
  }, [])

  const remove = (slug) => {
    setRemoving(slug)
    setTimeout(() => {
      const updated = bookmarks.filter(b => b.slug !== slug)
      localStorage.setItem('cl-bookmarks', JSON.stringify(updated))
      setBookmarks(updated)
      setRemoving(null)
    }, 300)
  }

  const clearAll = () => {
    if (confirm(isEn ? 'Clear all bookmarks?' : 'Видалити всі закладки?')) {
      localStorage.removeItem('cl-bookmarks')
      setBookmarks([])
    }
  }

  const canonical = isEn ? `${SITE}/en/bookmarks` : `${SITE}/bookmarks`

  return (
    <Layout
      title={isEn ? 'My Bookmarks — CryptoLock' : 'Мої закладки — CryptoLock'}
      description={isEn
        ? 'Your saved CryptoLock articles. Bookmarks are stored locally in your browser.'
        : 'Збережені статті CryptoLock. Закладки зберігаються локально у вашому браузері.'}
      canonical={canonical}
    >
      <div style={{ padding: '2.5rem 0 3rem', minHeight: '60vh' }}>
        <div className="container" style={{ maxWidth: '720px' }}>

          {/* Breadcrumb */}
          <nav style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '1.5rem', display: 'flex', gap: '6px' }}>
            <Link href={isEn ? '/en' : '/'} style={{ color: '#94a3b8', textDecoration: 'none' }}>
              {isEn ? 'Home' : 'Головна'}
            </Link>
            <span>/</span>
            <span style={{ color: '#64748b' }}>{isEn ? 'Bookmarks' : 'Закладки'}</span>
          </nav>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 700, color: 'var(--text,#0f172a)', margin: '0 0 4px' }}>
                🔖 {isEn ? 'My Bookmarks' : 'Мої закладки'}
              </h1>
              {bookmarks !== null && (
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                  {bookmarks.length > 0
                    ? (isEn ? `${bookmarks.length} saved article${bookmarks.length === 1 ? '' : 's'}` : `${bookmarks.length} збережених статей`)
                    : (isEn ? 'No saved articles yet' : 'Поки немає збережених статей')}
                </p>
              )}
            </div>
            {bookmarks?.length > 0 && (
              <button onClick={clearAll} style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '13px',
                border: '1px solid #fca5a5', background: '#fef2f2',
                color: '#ef4444', cursor: 'pointer', fontWeight: 600,
              }}>
                {isEn ? '✕ Clear all' : '✕ Очистити всі'}
              </button>
            )}
          </div>

          {/* Loading */}
          {bookmarks === null && (
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem' }}>
              {isEn ? 'Loading…' : 'Завантаження…'}
            </div>
          )}

          {/* Empty state */}
          {bookmarks !== null && bookmarks.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '4rem 2rem',
              background: '#f8fafc', borderRadius: '16px',
              border: '1px dashed #e2e8f0',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🔖</div>
              <p style={{ fontSize: '1rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                {isEn ? 'No bookmarks yet' : 'Закладок поки немає'}
              </p>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '1.5rem' }}>
                {isEn
                  ? 'Click "Save" on any article to bookmark it here.'
                  : 'Натисни "Зберегти" на будь-якій статті щоб додати сюди.'}
              </p>
              <Link href={isEn ? '/en' : '/'} style={{
                display: 'inline-block', padding: '10px 24px',
                background: '#2563eb', color: '#fff', borderRadius: '10px',
                textDecoration: 'none', fontSize: '14px', fontWeight: 600,
              }}>
                {isEn ? 'Browse articles' : 'Переглянути статті'}
              </Link>
            </div>
          )}

          {/* Bookmarks list */}
          {bookmarks !== null && bookmarks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {bookmarks.map(b => {
                const bLocale = b.locale || (isEn ? 'en' : 'uk')
              const href = bLocale === 'en' ? `/en/${b.slug}` : `/${b.slug}`
                const isRemoving = removing === b.slug
                return (
                  <div key={b.slug} className="bm-card" style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 16px',
                    background: 'var(--bg-card,#fff)', borderRadius: '12px',
                    border: '1px solid var(--border,#e2e8f0)',
                    opacity: isRemoving ? 0.4 : 1,
                    transition: 'opacity 0.3s, border-color 0.15s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                  >
                    {/* Bookmark icon */}
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      background: '#eff6ff', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24"
                        fill="#2563eb" stroke="#2563eb" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link href={href} style={{
                        display: 'block', fontWeight: 600, fontSize: '14px',
                        color: 'var(--text,#0f172a)', textDecoration: 'none',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}
                      onMouseEnter={e => e.target.style.color = 'var(--accent,#2563eb)'}
                      onMouseLeave={e => e.target.style.color = 'var(--text,#0f172a)'}
                      >
                        {b.title}
                      </Link>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '3px' }}>
                        {b.tag && (
                          <span className="tag-chip" style={{ fontSize: '11px', padding: '1px 8px' }}>
                            {b.tag}
                          </span>
                        )}
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {isEn ? 'Saved' : 'Збережено'} {fmt(b.savedAt, locale)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <Link href={href} style={{
                        padding: '5px 12px', borderRadius: '7px', fontSize: '12px',
                        background: 'var(--bg,#f1f5f9)', color: 'var(--muted,#475569)',
                        textDecoration: 'none', fontWeight: 600,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.target.style.background = 'var(--border,#e2e8f0)'}
                      onMouseLeave={e => e.target.style.background = 'var(--bg,#f1f5f9)'}
                      >
                        {isEn ? 'Read →' : 'Читати →'}
                      </Link>
                      <button onClick={() => remove(b.slug)} style={{
                        padding: '5px 8px', borderRadius: '7px', fontSize: '14px',
                        border: 'none', background: 'none', cursor: 'pointer',
                        color: '#cbd5e1', transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
                      title={isEn ? 'Remove' : 'Видалити'}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Local storage note */}
          <p style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2rem', textAlign: 'center' }}>
            {isEn
              ? '🔒 Bookmarks are stored locally in your browser. Clearing browser data will remove them.'
              : '🔒 Закладки зберігаються локально у браузері. Очищення даних браузера видалить їх.'}
          </p>
        </div>
      </div>
    </Layout>
  )
}
