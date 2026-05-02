import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
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

function useSearchIndex(locale) {
  const [index, setIndex] = useState(null)
  const localeRef = useRef(null)

  const load = useCallback(async () => {
    if (index && localeRef.current === locale) return
    try {
      localeRef.current = locale
      const res = await fetch(`/api/search-index?locale=${locale}`)
      setIndex(await res.json())
    } catch {}
  }, [index, locale])

  // Скидаємо індекс при зміні локалі
  useEffect(() => {
    setIndex(null)
    localeRef.current = null
  }, [locale])

  return [index, load]
}

function useSearch(index, query) {
  const [results, setResults] = useState([])
  useEffect(() => {
    if (!index || query.trim().length < 2) { setResults([]); return }
    const q = query.trim().toLowerCase()
    setResults(
      index.filter(p =>
        (p.title + ' ' + p.description + ' ' + p.tags.join(' ')).toLowerCase().includes(q)
      ).slice(0, 6)
    )
  }, [index, query])
  return results
}

// ── Мобільний оверлей ────────────────────────────────────────────────────
function MobileOverlay({ onClose, index, loadIndex, isEn, locale }) {
  const [query, setQuery] = useState('')
  const results = useSearch(index, query)
  const inputRef = useRef(null)

  useEffect(() => {
    loadIndex()
    setTimeout(() => inputRef.current?.focus(), 80)
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  return (
    <div style={m.overlay}>
      <div style={m.header}>
        <div style={m.box}>
          <span style={m.boxIcon}><SearchIcon /></span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            placeholder={isEn ? "Search articles..." : "Пошук по статтях..."}
            onChange={e => setQuery(e.target.value)}
            style={m.input}
            autoComplete="off"
          />
          {query && (
            <button onClick={() => setQuery('')} style={m.clearBtn} aria-label="Очистити">
              <CloseIcon />
            </button>
          )}
        </div>
        <button onClick={onClose} style={m.cancel}>{isEn ? 'Cancel' : 'Скасувати'}</button>
      </div>
      <div style={m.body}>
        {query.trim().length < 2 && (
          <p style={m.hint}>{isEn ? 'Type at least 2 characters' : 'Введи мінімум 2 символи'}</p>
        )}
        {query.trim().length >= 2 && results.length === 0 && (
          <div style={m.empty}>
            <div style={{ fontSize: '32px' }}>🔍</div>
            <p style={m.emptyTitle}>{isEn ? 'Nothing found' : 'Нічого не знайдено'}</p>
            <p style={m.emptyHint}>{isEn ? 'Try another word' : 'Спробуй інше слово'}</p>
          </div>
        )}
        {results.map(post => (
          <Link key={post.slug} href={`/${post.slug}`} locale={locale} style={m.item} onClick={onClose}>
            <span style={m.itemIcon}><SearchIcon /></span>
            <span style={m.itemBody}>
              <span style={m.itemTitle}>{post.title}</span>
              {post.description && (
                <span style={m.itemDesc}>
                  {post.description.length > 70 ? post.description.slice(0, 70) + '…' : post.description}
                </span>
              )}
            </span>
            <span style={m.arrow}>›</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ── Десктопний inline ────────────────────────────────────────────────────
function DesktopSearch({ index, loadIndex, isEn, locale }) {
  const [query, setQuery] = useState('')
  const [open, setOpen]   = useState(false)
  const [active, setActive] = useState(-1)
  const results = useSearch(index, query)
  const inputRef = useRef(null)
  const wrapRef  = useRef(null)

  useEffect(() => {
    const h = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false); setQuery('')
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    const h = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault(); inputRef.current?.focus(); setOpen(true)
      }
      if (e.key === 'Escape') { setOpen(false); setQuery(''); inputRef.current?.blur() }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const onKeyDown = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, -1)) }
    else if (e.key === 'Enter' && results[active]) window.location.href = (locale === 'en' ? '/en/' : '/') + results[active].slug
  }

  const show = open && query.trim().length >= 2

  return (
    <div ref={wrapRef} style={d.wrap}>
      <div style={{ ...d.box, ...(open ? d.boxOpen : {}) }}>
        <span style={d.icon}><SearchIcon /></span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={isEn ? "Search..." : "Пошук..."}
          autoComplete="off"
          onFocus={() => { loadIndex(); setOpen(true) }}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onKeyDown={onKeyDown}
          style={d.input}
        />
        {query
          ? <button onClick={() => { setQuery(''); inputRef.current?.focus() }} style={d.clearBtn} tabIndex={-1}><CloseIcon /></button>
          : null
        }
      </div>
      {show && (
        <div style={d.dropdown}>
          {results.length > 0 ? results.map((post, i) => (
            <Link key={post.slug} href={`/${post.slug}`} locale={locale}
              style={{ ...d.item, ...(i === active ? d.itemActive : {}) }}
              onMouseEnter={() => setActive(i)}>
              <span style={d.itemIcon}><SearchIcon /></span>
              <span style={d.itemBody}>
                <span style={d.itemTitle}>{post.title}</span>
                {post.description && <span style={d.itemDesc}>{post.description.slice(0, 70)}</span>}
              </span>
              <span style={d.arrow}>›</span>
            </Link>
          )) : (
            <div style={d.empty}>{isEn ? `No results for "${query}"` : `Нічого не знайдено за «${query}»`}</div>
          )}
          {results.length > 0 && (
            <div style={d.footer}>{results.length} {isEn ? `result${results.length > 1 ? 's' : ''}` : `результат${results.length > 1 ? 'и' : ''}`} · ↑↓ · Enter</div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Головний компонент ───────────────────────────────────────────────────
// Рендерить ОБИДВА варіанти одразу — CSS вирішує що показати
// Це уникає hydration mismatch і проблем з SSR
export default function SearchBar() {
  const { locale } = useRouter()
  const isEn = locale === 'en'
  const [index, loadIndex] = useSearchIndex(locale || 'uk')
  const [overlayOpen, setOverlayOpen] = useState(false)

  return (
    <>
      {/* Десктоп — ховається через CSS на мобайлі */}
      <div className="search-desktop">
        <DesktopSearch index={index} loadIndex={loadIndex} isEn={isEn} locale={locale} />
      </div>

      {/* Мобайл — кнопка-іконка, ховається на десктопі */}
      <button
        className="search-mobile-btn"
        onClick={() => { loadIndex(); setOverlayOpen(true) }}
        style={sb.btn}
        aria-label={isEn ? "Search" : "Пошук"}
      >
        <SearchIcon />
      </button>

      {/* Оверлей — показується поверх всього на мобайлі */}
      {overlayOpen && (
        <MobileOverlay
          onClose={() => setOverlayOpen(false)}
          index={index}
          loadIndex={loadIndex}
          isEn={isEn}
          locale={locale}
        />
      )}
    </>
  )
}

// ── Стилі мобайлу ────────────────────────────────────────────────────────
const m = {
  overlay: { position:'fixed', inset:0, background:'#fff', zIndex:200, display:'flex', flexDirection:'column', overflowX:'hidden' },
  header:  { display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px', borderBottom:'1px solid #e2e8f0', flexShrink:0 },
  box:     { display:'flex', alignItems:'center', gap:'8px', flex:1, background:'#f1f5f9', borderRadius:'10px', padding:'0 12px', height:'42px', minWidth:0 },
  boxIcon: { color:'#94a3b8', display:'flex', flexShrink:0 },
  input:   { flex:1, border:'none', outline:'none', background:'transparent', fontSize:'16px', fontFamily:'var(--font-body)', color:'#0f172a', minWidth:0, width:'100%' },
  clearBtn:{ display:'flex', alignItems:'center', background:'none', border:'none', cursor:'pointer', color:'#94a3b8', padding:'4px', flexShrink:0 },
  cancel:  { background:'none', border:'none', cursor:'pointer', fontSize:'14px', fontWeight:500, color:'#2563eb', padding:'0 2px', whiteSpace:'nowrap', flexShrink:0 },
  body:    { flex:1, overflowY:'auto', overflowX:'hidden' },
  hint:    { padding:'2rem 1rem', textAlign:'center', fontSize:'13px', color:'#94a3b8' },
  empty:   { padding:'3rem 1rem', textAlign:'center' },
  emptyTitle: { fontSize:'15px', fontWeight:500, color:'#334155', margin:'8px 0 4px' },
  emptyHint:  { fontSize:'13px', color:'#94a3b8' },
  item:    { display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px', textDecoration:'none', borderBottom:'1px solid #f1f5f9' },
  itemIcon:{ color:'#94a3b8', display:'flex', flexShrink:0 },
  itemBody:{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:'3px' },
  itemTitle:{ fontSize:'14px', fontWeight:500, color:'#0f172a', lineHeight:1.4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' },
  itemDesc: { fontSize:'12px', color:'#64748b', lineHeight:1.4, display:'block' },
  arrow:   { fontSize:'20px', color:'#cbd5e1', flexShrink:0 },
}

// ── Стилі десктопу ────────────────────────────────────────────────────────
const d = {
  wrap:    { position:'relative', width:'100%' },
  box:     { display:'flex', alignItems:'center', gap:'7px', background:'#f1f5f9', border:'1.5px solid transparent', borderRadius:'10px', padding:'0 10px', height:'36px', transition:'border-color .15s, background .15s, box-shadow .15s', cursor:'text' },
  boxOpen: { background:'#fff', borderColor:'#2563eb', boxShadow:'0 0 0 3px rgba(37,99,235,0.1)' },
  icon:    { color:'#94a3b8', display:'flex', flexShrink:0, pointerEvents:'none' },
  input:   { flex:1, border:'none', outline:'none', background:'transparent', fontSize:'13px', fontFamily:'var(--font-body)', color:'#0f172a', minWidth:0 },
  clearBtn:{ display:'flex', alignItems:'center', background:'none', border:'none', cursor:'pointer', color:'#94a3b8', padding:'2px', flexShrink:0 },
  dropdown:{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, background:'#fff', border:'1px solid #e2e8f0', borderRadius:'12px', boxShadow:'0 8px 32px rgba(15,23,42,0.12)', zIndex:100, overflow:'hidden' },
  item:    { display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', textDecoration:'none', borderBottom:'1px solid #f8fafc', transition:'background .1s' },
  itemActive:{ background:'#eff6ff' },
  itemIcon:{ color:'#94a3b8', flexShrink:0, display:'flex' },
  itemBody:{ flex:1, minWidth:0 },
  itemTitle:{ display:'block', fontSize:'13px', fontWeight:500, color:'#0f172a', lineHeight:1.35, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  itemDesc: { display:'block', fontSize:'11px', color:'#64748b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  arrow:   { fontSize:'18px', color:'#cbd5e1', flexShrink:0 },
  footer:  { padding:'7px 14px', background:'#f8fafc', fontSize:'11px', fontFamily:'var(--font-mono)', color:'#94a3b8' },
  empty:   { padding:'1.25rem 14px', fontSize:'13px', color:'#94a3b8', textAlign:'center' },
}

const sb = {
  btn: { display:'flex', alignItems:'center', justifyContent:'center', width:'36px', height:'36px', borderRadius:'8px', background:'#f1f5f9', border:'1px solid #e2e8f0', cursor:'pointer', color:'#475569', flexShrink:0 },
}
