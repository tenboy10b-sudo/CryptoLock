import Layout from '../components/Layout'
import PostCard from '../components/PostCard'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { getAllPosts, getAllTags } from '../lib/posts'
import siteConfig from '../site.config'

// Категорії з підтегами — URL статей не змінюються
const CATEGORIES = [
  {
    id: 'security', label: 'Безпека', icon: '🔒',
    tags: ['безпека', 'паролі', 'bitlocker', 'шифрування', 'облікові-записи', 'захист'],
  },
  {
    id: 'windows', label: 'Windows', icon: '🪟',
    tags: ['windows', 'оновлення', 'windows-update', 'персоналізація', 'темна-тема', 'налаштування'],
  },
  {
    id: 'system', label: 'Система', icon: '⚙️',
    tags: ['драйвери', 'bios', 'uefi', 'диск', 'chkdsk', 'sfc', 'dism', 'обладнання'],
  },
  {
    id: 'network', label: 'Мережа', icon: '📶',
    tags: ['wifi', 'dns', 'bluetooth', 'мережа'],
  },
  {
    id: 'optimization', label: 'Оптимізація', icon: '⚡',
    tags: ['оптимізація', 'продуктивність', 'автозавантаження', 'очищення', 'прискорення'],
  },
  {
    id: 'tools', label: 'Інструменти', icon: '🧰',
    tags: ['cmd', 'powershell', 'реєстр', 'моніторинг'],
  },
  {
    id: 'gpo', label: 'Групова політика', icon: '🛡️',
    tags: ['групова-політика', 'gpedit', 'secpol', 'applocker', 'gpo'],
  },
  {
    id: 'recovery', label: 'Відновлення', icon: '🔄',
    tags: ['відновлення', 'скидання', 'переустановка'],
  },
]

export default function Home({ posts, tags }) {
  const [openCats, setOpenCats] = useState({ security: true, windows: true })
  const tagMap = Object.fromEntries(tags.map(t => [t.tag, t.count]))

  const toggle = (id) => setOpenCats(prev => ({ ...prev, [id]: !prev[id] }))

  const featured = posts[0]
  const rest = posts.slice(1)

  return (
    <Layout>
      {/* Hero */}
      <section style={s.hero}>
        <div className="container">
          <div style={s.heroGrid}>
            <div style={s.heroText}>
              <div style={s.heroBadge}>
                <span style={s.heroBadgeDot} />
                Гайди українською · {posts.length} статей
              </div>
              <h1 style={s.heroTitle}>
                Безпека та<br />
                <span style={s.heroAccent}>налаштування ПК</span>
              </h1>
              <p style={s.heroSub}>
                Покрокові інструкції з Windows, захисту даних,
                групових політик і системного адміністрування.
              </p>
              <div style={s.heroActions}>
                <Link href="/tags/безпека" style={s.heroBtnPrimary}>Безпека</Link>
                <Link href="/tags/windows" style={s.heroBtnSecondary}>Windows</Link>
                <Link href="/tags/групова-політика" style={s.heroBtnSecondary}>Групова політика</Link>
              </div>
            </div>
            <div style={s.heroLogoWrap}>
              <Image src="/logo.jpg" alt="CryptoLock" width={170} height={170}
                style={{ objectFit: 'contain', filter: 'drop-shadow(0 8px 24px rgba(59,130,246,0.25))' }} priority />
            </div>
          </div>
        </div>
      </section>

      {/* Categories block */}
      <section style={s.catsSection}>
        <div className="container">
          <div style={s.catsSectionHead}>
            <h2 style={s.catsSectionTitle}>Теми</h2>
            <button style={s.expandAllBtn} onClick={() => {
              const allOpen = CATEGORIES.every(c => openCats[c.id])
              const next = {}
              CATEGORIES.forEach(c => { next[c.id] = !allOpen })
              setOpenCats(next)
            }}>
              {CATEGORIES.every(c => openCats[c.id]) ? 'Згорнути всі ↑' : 'Розгорнути всі ↓'}
            </button>
          </div>

          <div style={s.catsGrid}>
            {CATEGORIES.map(cat => {
              const isOpen = !!openCats[cat.id]
              const catTags = cat.tags.filter(t => tagMap[t])
              const totalCount = catTags.reduce((s, t) => s + (tagMap[t] || 0), 0)
              if (catTags.length === 0) return null
              return (
                <div key={cat.id} style={s.catCard}>
                  <button style={s.catHeader} onClick={() => toggle(cat.id)}>
                    <div style={s.catLeft}>
                      <span style={s.catIcon}>{cat.icon}</span>
                      <span style={s.catLabel}>{cat.label}</span>
                      <span style={s.catTotal}>{totalCount}</span>
                    </div>
                    <span style={{ ...s.catArrow, transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
                  </button>
                  {isOpen && (
                    <div style={s.catTags}>
                      {catTags.map(tag => (
                        <Link key={tag} href={`/tags/${tag}`} style={s.catTagItem}>
                          <span style={s.catTagName}>{tag}</span>
                          <span style={s.catTagCount}>{tagMap[tag]}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Posts */}
      <section style={s.postsSection}>
        <div className="container">
          {featured && (
            <div style={s.featuredWrap}>
              <p style={s.sectionLabel}>Остання стаття</p>
              <PostCard post={featured} featured />
            </div>
          )}
          <p style={s.sectionLabel}>Всі статті</p>
          <div style={s.grid}>
            {rest.map(post => <PostCard key={post.slug} post={post} />)}
          </div>
        </div>
      </section>
    </Layout>
  )
}

export async function getStaticProps() {
  const posts = getAllPosts()
  const tags = getAllTags()
  return { props: { posts, tags } }
}

const s = {
  hero: {
    background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)',
    padding: '3rem 0',
  },
  heroGrid: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' },
  heroText: { flex: 1, minWidth: '280px' },
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#94a3b8', marginBottom: '16px', letterSpacing: '.3px' },
  heroBadgeDot: { width: '7px', height: '7px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block', flexShrink: 0, boxShadow: '0 0 6px #3b82f6' },
  heroTitle: { fontFamily: "'Unbounded',sans-serif", fontSize: 'clamp(1.6rem,5vw,2.4rem)', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-1px', color: '#f1f5f9', marginBottom: '1rem' },
  heroAccent: { color: '#3b82f6' },
  heroSub: { fontSize: '.9rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '1.75rem' },
  heroActions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  heroBtnPrimary: { padding: '8px 18px', background: '#2563eb', color: '#fff', borderRadius: '20px', fontSize: '13px', fontWeight: 600 },
  heroBtnSecondary: { padding: '8px 18px', background: 'rgba(255,255,255,0.07)', color: '#cbd5e1', borderRadius: '20px', fontSize: '13px', fontWeight: 500, border: '1px solid rgba(255,255,255,0.1)' },
  heroLogoWrap: { flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },

  catsSection: { padding: '2rem 0', background: '#fff', borderBottom: '1px solid #e2e8f0' },
  catsSectionHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' },
  catsSectionTitle: { fontFamily: "'Unbounded',sans-serif", fontSize: '1rem', fontWeight: 700, color: '#0f172a' },
  expandAllBtn: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: '4px 8px' },

  catsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '8px' },

  catCard: { border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc' },
  catHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' },
  catLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  catIcon: { fontSize: '16px', flexShrink: 0 },
  catLabel: { fontFamily: "'Unbounded',sans-serif", fontSize: '12px', fontWeight: 700, color: '#0f172a' },
  catTotal: { fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#94a3b8', background: '#e2e8f0', padding: '1px 6px', borderRadius: '10px' },
  catArrow: { fontSize: '12px', color: '#94a3b8', transition: 'transform .2s', display: 'inline-block' },

  catTags: { padding: '0 10px 10px', display: 'flex', flexDirection: 'column', gap: '2px' },
  catTagItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', borderRadius: '7px', background: '#fff', border: '1px solid #e2e8f0', transition: 'border-color .15s,background .15s' },
  catTagName: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#334155', fontWeight: 500 },
  catTagCount: { fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#94a3b8' },

  postsSection: { padding: '2rem 0 3rem' },
  featuredWrap: { marginBottom: '2rem' },
  sectionLabel: { fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500, color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(330px,1fr))', gap: '12px' },
}
