import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

export default function SearchBar() {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState([])
  const [index, setIndex]       = useState(null)
  const [open, setOpen]         = useState(false)
  const [active, setActive]     = useState(-1)
  const inputRef  = useRef(null)
  const wrapRef   = useRef(null)
  // Завантажити індекс один раз ліниво при першому фокусі
  const loadIndex = useCallback(async () => {
    if (index) return
    try {
      const res = await fetch('/api/search-index')
      const data = await res.json()
      setIndex(data)
    } catch {}
  }, [index])

  // Пошук
  useEffect(() => {
    if (!index || query.trim().length < 2) {
      setResults([])
      setActive(-1)
      return
    }
    const q = query.trim().toLowerCase()
    const found = index.filter(p => {
      const t = (p.title + ' ' + p.description + ' ' + p.tags.join(' ')).toLowerCase()
      return t.includes(q)
    }).slice(0, 6)
    setResults(found)
    setActive(-1)
  }, [query, index])

  // Закрити при кліку поза
  useEffect(() => {
    const h = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
        setResults([])
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // Ctrl+K — фокус на поле
  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
      if (e.key === 'Escape') {
        setOpen(false)
        setQuery('')
        setResults([])
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  // Навігація стрілками
  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(a => Math.min(a + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(a => Math.max(a - 1, -1))
    } else if (e.key === 'Enter' && active >= 0 && results[active]) {
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
    <div ref={wrapRef} style={s.wrap}>
      <div style={{ ...s.inputBox, ...(open ? s.inputBoxOpen : {}) }}>
        <span style={s.icon}><SearchIcon /></span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Пошук по статтях..."
          aria-label="Пошук"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          autoComplete="off"
          onFocus={() => { loadIndex(); setOpen(true) }}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onKeyDown={onKeyDown}
          style={s.input}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }}
            style={s.clear}
            aria-label="Очистити"
            tabIndex={-1}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
        {!query && <kbd style={s.kbd}>Ctrl K</kbd>}
      </div>

      {showDropdown && (
        <div style={s.dropdown} role="listbox" aria-label="Результати пошуку">
          {results.length > 0 ? (
            <>
              {results.map((post, i) => (
                <Link
                  key={post.slug}
                  href={`/${post.slug}`}
                  style={{ ...s.item, ...(i === active ? s.itemActive : {}) }}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                >
                  <div style={s.itemIcon} aria-hidden="true">
                    <SearchIcon />
                  </div>
                  <div style={s.itemBody}>
                    <div style={s.itemTitle}>
                      {highlight(post.title, query.trim())}
                    </div>
                    {post.description && (
                      <div style={s.itemDesc}>
                        {post.description.length > 80
                          ? post.description.slice(0, 80) + '...'
                          : post.description}
                      </div>
                    )}
                    {post.tags && post.tags.length > 0 && (
                      <div style={s.itemTags}>
                        {post.tags.slice(0, 3).map(t => (
                          <span key={t} style={s.tag}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={s.itemArrow} aria-hidden="true">→</div>
                </Link>
              ))}
              <div style={s.footer}>
                <span style={s.footerText}>
                  {results.length} {results.length === 1 ? 'результат' : results.length < 5 ? 'результати' : 'результатів'}
                  {' · '}↑↓ для навігації · Enter для відкриття
                </span>
              </div>
            </>
          ) : (
            <div style={s.empty}>
              <div style={s.emptyIcon} aria-hidden="true">🔍</div>
              <div style={s.emptyText}>Нічого не знайдено за запитом «{query}»</div>
              <div style={s.emptyHint}>Спробуй інше слово або перейди до <Link href="/tags" style={s.emptyLink}>тегів</Link></div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const s = {
  wrap: {
    position: 'relative',
    flex: 1,
    maxWidth: '420px',
    minWidth: '180px',
  },
  inputBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#f1f5f9',
    border: '1.5px solid transparent',
    borderRadius: '10px',
    padding: '0 10px',
    height: '38px',
    transition: 'border-color .15s, background .15s, box-shadow .15s',
    cursor: 'text',
  },
  inputBoxOpen: {
    background: '#fff',
    borderColor: '#2563eb',
    boxShadow: '0 0 0 3px rgba(37,99,235,0.12)',
  },
  icon: {
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    pointerEvents: 'none',
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '14px',
    fontFamily: 'var(--font-body)',
    color: '#0f172a',
    minWidth: 0,
  },
  clear: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: '2px',
    borderRadius: '4px',
    flexShrink: 0,
  },
  kbd: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: '#94a3b8',
    background: '#e2e8f0',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    padding: '1px 5px',
    flexShrink: 0,
    letterSpacing: '.02em',
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
    minWidth: '360px',
  },
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '10px 14px',
    textDecoration: 'none',
    transition: 'background .1s',
    borderBottom: '1px solid #f1f5f9',
    cursor: 'pointer',
  },
  itemActive: {
    background: '#eff6ff',
  },
  itemIcon: {
    color: '#94a3b8',
    marginTop: '2px',
    flexShrink: 0,
    display: 'flex',
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#0f172a',
    lineHeight: 1.4,
    marginBottom: '2px',
  },
  itemDesc: {
    fontSize: '12px',
    color: '#64748b',
    lineHeight: 1.4,
    marginBottom: '4px',
  },
  itemTags: {
    display: 'flex',
    gap: '4px',
    flexWrap: 'wrap',
  },
  tag: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: '#1d4ed8',
    background: '#eff6ff',
    border: '1px solid #dbeafe',
    borderRadius: '10px',
    padding: '1px 6px',
  },
  itemArrow: {
    fontSize: '14px',
    color: '#cbd5e1',
    marginTop: '1px',
    flexShrink: 0,
  },
  footer: {
    padding: '8px 14px',
    background: '#f8fafc',
  },
  footerText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: '#94a3b8',
  },
  empty: {
    padding: '2rem 1rem',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '28px',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#334155',
    marginBottom: '4px',
  },
  emptyHint: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  emptyLink: {
    color: '#2563eb',
  },
}
