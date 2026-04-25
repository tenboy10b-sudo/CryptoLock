import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

// Кнопка-іконка для мобайлу — просто відкриває оверлей
export function SearchButton({ onClick }) {
  return (
    <button onClick={onClick} style={sb.btn} aria-label="Відкрити пошук">
      <SearchIcon />
    </button>
  )
}

// Повноекранний оверлей для мобайлу
function MobileSearchOverlay({ onClose, index, loadIndex }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const inputRef = useRef(null)

  // Фокус при відкритті
  useEffect(() => {
    loadIndex()
    setTimeout(() => inputRef.current?.focus(), 50)
    // Заблокувати скрол body
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Пошук
  useEffect(() => {
    if (!index || query.trim().length < 2) { setResults([]); return }
    const q = query.trim().toLowerCase()
    setResults(
      index.filter(p =>
        (p.title + ' ' + p.description + ' ' + p.tags.join(' ')).toLowerCase().includes(q)
      ).slice(0, 8)
    )
  }, [query, index])

  // Escape — закрити
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  return (
    <div style={mob.overlay} role="dialog" aria-modal="true" aria-label="Пошук">
      {/* Шапка оверлею */}
      <div style={mob.header}>
        <div style={mob.inputBox}>
          <span style={mob.inputIcon}><SearchIcon /></span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            placeholder="Пошук по статтях..."
            onChange={e => setQuery(e.target.value)}
            style={mob.input}
            autoComplete="off"
            aria-label="Пошук"
          />
          {query && (
            <button onClick={() => setQuery('')} style={mob.clearBtn} aria-label="Очистити">
              <CloseIcon />
            </button>
          )}
        </div>
        <button onClick={onClose} style={mob.cancelBtn} aria-label="Закрити пошук">
          Скасувати
        </button>
      </div>

      {/* Результати */}
      <div style={mob.results}>
        {query.trim().length < 2 && (
          <div style={mob.hint}>Введи мінімум 2 символи</div>
        )}
        {query.trim().length >= 2 && results.length === 0 && (
          <div style={mob.noResults}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
            <div style={mob.noResultsText}>Нічого не знайдено</div>
            <div style={mob.noResultsHint}>Спробуй інше слово</div>
          </div>
        )}
        {results.map(post => (
          <Link
            key={post.slug}
            href={`/${post.slug}`}
            style={mob.item}
            onClick={onClose}
          >
            <div style={mob.itemIconWrap}><SearchIcon /></div>
            <div style={mob.itemBody}>
              <div style={mob.itemTitle}>{post.title}</div>
              {post.description && (
                <div style={mob.itemDesc}>
                  {post.description.length > 70
                    ? post.description.slice(0, 70) + '...'
                    : post.description}
                </div>
              )}
              {post.tags && post.tags.length > 0 && (
                <div style={mob.itemTags}>
                  {post.tags.slice(0, 2).map(t => (
                    <span key={t} style={mob.tag}>{t}</span>
                  ))}
                </div>
              )}
            </div>
            <span style={mob.arrow}>›</span>
          </Link>
        ))}
        {results.length > 0 && (
          <div style={mob.count}>
            Знайдено: {results.length} {results.length === 1 ? 'стаття' : results.length < 5 ? 'статті' : 'статей'}
          </div>
        )}
      </div>
    </div>
  )
}

// Десктопний inline-пошук з dropdown
function DesktopSearchBar({ index, loadIndex }) {
  const [query, setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen]     = useState(false)
  const [active, setActive] = useState(-1)
  const inputRef = useRef(null)
  const wrapRef  = useRef(null)

  useEffect(() => {
    if (!index || query.trim().length < 2) { setResults([]); setActive(-1); return }
    const q = query.trim().toLowerCase()
    setResults(
      index.filter(p =>
        (p.title + ' ' + p.description + ' ' + p.tags.join(' ')).toLowerCase().includes(q)
      ).slice(0, 6)
    )
    setActive(-1)
  }, [query, index])

  useEffect(() => {
    const h = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false); setQuery(''); setResults([])
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault(); inputRef.current?.focus(); setOpen(true)
      }
      if (e.key === 'Escape') {
        setOpen(false); setQuery(''); setResults([]); inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, -1)) }
    else if (e.key === 'Enter' && active >= 0 && results[active]) {
      window.location.href = '/' + results[active].slug
    }
  }

  const highlight = (text, q) => {
    if (!q || q.length < 2) return text
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: '#dbeafe', color: '#1d4ed8', borderRadius: '2px', padding: '0 1px' }}>
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    )
  }

  const showDropdown = open && query.trim().length >= 2

  return (
    <div ref={wrapRef} style={ds.wrap}>
      <div style={{ ...ds.inputBox, ...(open ? ds.inputBoxOpen : {}) }}>
        <span style={ds.icon}><SearchIcon /></span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Пошук..."
          aria-label="Пошук"
          autoComplete="off"
          onFocus={() => { loadIndex(); setOpen(true) }}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onKeyDown={onKeyDown}
          style={ds.input}
        />
        {query
          ? <button onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }}
              style={ds.clearBtn} aria-label="Очистити" tabIndex={-1}>
              <CloseIcon />
            </button>
          : <kbd style={ds.kbd}>⌃K</kbd>
        }
      </div>

      {showDropdown && (
        <div style={ds.dropdown} role="listbox">
          {results.length > 0 ? (
            <>
              {results.map((post, i) => (
                <Link
                  key={post.slug}
                  href={`/${post.slug}`}
                  style={{ ...ds.item, ...(i === active ? ds.itemActive : {}) }}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                >
                  <span style={ds.itemIconWrap}><SearchIcon /></span>
                  <span style={ds.itemBody}>
                    <span style={ds.itemTitle}>{highlight(post.title, query.trim())}</span>
                    {post.description && (
                      <span style={ds.itemDesc}>
                        {post.description.length > 75 ? post.description.slice(0, 75) + '...' : post.description}
                      </span>
                    )}
                  </span>
                  <span style={ds.arrow} aria-hidden="true">›</span>
                </Link>
              ))}
              <div style={ds.footer}>
                {results.length} {results.length === 1 ? 'результат' : results.length < 5 ? 'результати' : 'результатів'}
                {' · '}↑↓ · Enter
              </div>
            </>
          ) : (
            <div style={ds.empty}>Нічого не знайдено за «{query}»</div>
          )}
        </div>
      )}
    </div>
  )
}

// Головний компонент — рендерить потрібний варіант залежно від ширини
export default function SearchBar() {
  const [isMobile, setIsMobile] = useState(false)
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [index, setIndex] = useState(null)

  const loadIndex = useCallback(async () => {
    if (index) return
    try {
      const res = await fetch('/api/search-index')
      const data = await res.json()
      setIndex(data)
    } catch {}
  }, [index])

  // Визначаємо мобайл по ширині — тільки на клієнті
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 680)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (isMobile) {
    return (
      <>
        <SearchButton onClick={() => { loadIndex(); setOverlayOpen(true) }} />
        {overlayOpen && (
          <MobileSearchOverlay
            onClose={() => setOverlayOpen(false)}
            index={index}
            loadIndex={loadIndex}
          />
        )}
      </>
    )
  }

  return <DesktopSearchBar index={index} loadIndex={loadIndex} />
}

// ── Стилі мобільного оверлею ──────────────────────────────────────────────
const mob = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: '#fff',
    zIndex: 200,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    background: '#fff',
    zIndex: 1,
  },
  inputBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    background: '#f1f5f9',
    borderRadius: '10px',
    padding: '0 12px',
    height: '42px',
    minWidth: 0,
  },
  inputIcon: {
    color: '#94a3b8',
    display: 'flex',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '16px', // 16px — щоб iOS не збільшував масштаб
    fontFamily: 'var(--font-body)',
    color: '#0f172a',
    minWidth: 0,
    width: '100%',
  },
  clearBtn: {
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: '4px',
    flexShrink: 0,
  },
  cancelBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    color: '#2563eb',
    padding: '0 4px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  results: {
    flex: 1,
    padding: '8px 0',
  },
  hint: {
    padding: '2rem 1rem',
    textAlign: 'center',
    fontSize: '13px',
    color: '#94a3b8',
  },
  noResults: {
    padding: '3rem 1rem',
    textAlign: 'center',
  },
  noResultsText: {
    fontSize: '15px',
    fontWeight: 500,
    color: '#334155',
    marginBottom: '4px',
  },
  noResultsHint: {
    fontSize: '13px',
    color: '#94a3b8',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    textDecoration: 'none',
    borderBottom: '1px solid #f1f5f9',
  },
  itemIconWrap: {
    color: '#94a3b8',
    display: 'flex',
    flexShrink: 0,
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  itemTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#0f172a',
    lineHeight: 1.4,
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemDesc: {
    fontSize: '12px',
    color: '#64748b',
    lineHeight: 1.4,
    display: 'block',
  },
  itemTags: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
    marginTop: '2px',
  },
  tag: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: '#1d4ed8',
    background: '#eff6ff',
    borderRadius: '10px',
    padding: '1px 6px',
  },
  arrow: {
    fontSize: '20px',
    color: '#cbd5e1',
    flexShrink: 0,
    lineHeight: 1,
  },
  count: {
    padding: '10px 16px',
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    color: '#94a3b8',
    textAlign: 'center',
  },
}

// ── Стилі десктопного inline ──────────────────────────────────────────────
const ds = {
  wrap: {
    position: 'relative',
    flex: 1,
    maxWidth: '380px',
    minWidth: 0,
  },
  inputBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    background: '#f1f5f9',
    border: '1.5px solid transparent',
    borderRadius: '10px',
    padding: '0 10px',
    height: '36px',
    transition: 'border-color .15s, background .15s, box-shadow .15s',
    cursor: 'text',
  },
  inputBoxOpen: {
    background: '#fff',
    borderColor: '#2563eb',
    boxShadow: '0 0 0 3px rgba(37,99,235,0.1)',
  },
  icon: {
    color: '#94a3b8',
    display: 'flex',
    flexShrink: 0,
    pointerEvents: 'none',
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '13px',
    fontFamily: 'var(--font-body)',
    color: '#0f172a',
    minWidth: 0,
  },
  clearBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#94a3b8', padding: '2px', borderRadius: '4px', flexShrink: 0,
  },
  kbd: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px', color: '#94a3b8',
    background: '#e2e8f0', border: '1px solid #cbd5e1',
    borderRadius: '4px', padding: '1px 5px', flexShrink: 0,
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(15,23,42,0.12)',
    zIndex: 100,
    overflow: 'hidden',
    // НЕ має minWidth — займає ширину wrap
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    textDecoration: 'none',
    borderBottom: '1px solid #f8fafc',
    transition: 'background .1s',
  },
  itemActive: { background: '#eff6ff' },
  itemIconWrap: { color: '#94a3b8', flexShrink: 0, display: 'flex' },
  itemBody: { flex: 1, minWidth: 0 },
  itemTitle: {
    display: 'block',
    fontSize: '13px', fontWeight: 500, color: '#0f172a',
    lineHeight: 1.35, marginBottom: '2px',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  itemDesc: {
    display: 'block',
    fontSize: '11px', color: '#64748b', lineHeight: 1.4,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  arrow: { fontSize: '18px', color: '#cbd5e1', flexShrink: 0 },
  footer: {
    padding: '7px 14px',
    background: '#f8fafc',
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    color: '#94a3b8',
  },
  empty: {
    padding: '1.25rem 14px',
    fontSize: '13px',
    color: '#94a3b8',
    textAlign: 'center',
  },
}

// Стилі кнопки-іконки для мобайлу
const sb = {
  btn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    color: '#475569',
    flexShrink: 0,
  },
}
