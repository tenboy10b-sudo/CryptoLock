import Layout from '../components/Layout'
import PostCard from '../components/PostCard'
import { useState, useEffect } from 'react'
import { getAllPosts } from '../lib/posts'
import siteConfig from '../site.config'

export default function SearchPage({ posts }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  useEffect(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) { setResults([]); return }
    const found = posts.filter(p => {
      const title = (p.title || '').toLowerCase()
      const desc  = (p.description || '').toLowerCase()
      const tags  = (p.tags || []).join(' ').toLowerCase()
      return title.includes(q) || desc.includes(q) || tags.includes(q)
    })
    setResults(found)
  }, [query, posts])

  return (
    <Layout
      title="Пошук"
      description={`Пошук по статтях ${siteConfig.name}`}
      canonical={`${siteConfig.url}/search`}
    >
      <div style={{ padding: '2rem 0 3rem' }}>
        <div className="container">
          <h1 style={s.title}>Пошук</h1>

          <div style={s.inputWrap}>
            <svg style={s.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              autoFocus
              type="search"
              placeholder="Введи запит..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={s.input}
              aria-label="Пошук по статтях"
            />
            {query && (
              <button onClick={() => setQuery('')} style={s.clear} aria-label="Очистити">✕</button>
            )}
          </div>

          {query.length >= 2 && (
            <p style={s.count}>
              {results.length > 0
                ? `Знайдено: ${results.length} ${plural(results.length)}`
                : 'Нічого не знайдено'}
            </p>
          )}

          {query.length >= 2 && results.length === 0 && (
            <div style={s.empty}>
              <p style={s.emptyText}>Спробуй інший запит або перейди до <a href="/tags" style={s.link}>тегів</a></p>
            </div>
          )}

          <div style={s.list}>
            {results.map(post => <PostCard key={post.slug} post={post} />)}
          </div>
        </div>
      </div>
    </Layout>
  )
}

function plural(n) {
  if (n === 1) return 'стаття'
  if (n >= 2 && n <= 4) return 'статті'
  return 'статей'
}

export async function getStaticProps() {
  const posts = getAllPosts()
  return { props: { posts } }
}

const s = {
  title: { fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,4vw,1.75rem)', fontWeight: 700, marginBottom: '1.5rem', color: '#0f172a' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '1rem' },
  icon: { position: 'absolute', left: '14px', width: '18px', height: '18px', color: '#94a3b8', pointerEvents: 'none' },
  input: {
    width: '100%', padding: '12px 44px 12px 44px',
    fontSize: '16px', fontFamily: 'var(--font-body)',
    border: '1.5px solid #e2e8f0', borderRadius: '12px',
    background: '#fff', outline: 'none', color: '#0f172a',
    transition: 'border-color .15s',
  },
  clear: { position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px', padding: '4px', lineHeight: 1 },
  count: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#94a3b8', marginBottom: '1rem' },
  empty: { padding: '2rem 0', textAlign: 'center' },
  emptyText: { fontSize: '14px', color: '#94a3b8' },
  link: { color: '#2563eb' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
}
