import Layout from '../components/Layout'
import PostCard from '../components/PostCard'
import Link from 'next/link'
import Image from 'next/image'
import { getAllPosts, getAllTags } from '../lib/posts'
import siteConfig from '../site.config'

const TAG_ICONS = {
  'безпека': '🔒', 'windows': '🪟', 'cmd': '⌨️', 'групова-політика': '⚙️',
  'gpedit': '⚙️', 'bios': '🖥️', 'uefi': '🖥️', 'bitlocker': '🔐',
  'шифрування': '🔐', 'оптимізація': '⚡', 'драйвери': '🔧', 'wifi': '📶',
  'bluetooth': '📡', 'паролі': '🗝️', 'диск': '💾', 'powershell': '💻',
  'облікові-записи': '👤', 'автозавантаження': '🚀', 'продуктивність': '📊',
  'відновлення': '♻️', 'персоналізація': '🎨', 'мережа': '🌐',
}

export default function Home({ posts, tags }) {
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
                Покрокові інструкції з Windows, захисту даних,<br />
                групових політик і системного адміністрування.
              </p>
              <div style={s.heroActions}>
                <Link href="/tags/безпека" style={s.heroBtnPrimary}>Безпека</Link>
                <Link href="/tags/windows" style={s.heroBtnSecondary}>Windows</Link>
                <Link href="/tags/групова-політика" style={s.heroBtnSecondary}>Групова політика</Link>
              </div>
            </div>
            <div style={s.heroLogoWrap}>
              <Image
                src="/logo.jpg"
                alt="CryptoLock"
                width={180}
                height={180}
                style={{ objectFit: 'contain', filter: 'drop-shadow(0 8px 24px rgba(37,99,235,0.18))' }}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tags block — повністю переробений */}
      <section style={s.tagsSection}>
        <div className="container">
          <div style={s.tagsSectionHeader}>
            <h2 style={s.tagsSectionTitle}>Теми</h2>
            <Link href="/tags" style={s.tagsViewAll}>Всі теги →</Link>
          </div>
          <div style={s.tagsGrid}>
            {tags.map(({ tag, count }) => (
              <Link key={tag} href={`/tags/${tag}`} style={s.tagCard}>
                <span style={s.tagCardIcon}>{TAG_ICONS[tag] || '📄'}</span>
                <span style={s.tagCardName}>{tag}</span>
                <span style={s.tagCardCount}>{count}</span>
              </Link>
            ))}
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

          <div style={s.allPostsHeader}>
            <p style={s.sectionLabel}>Всі статті</p>
          </div>
          <div style={s.grid}>
            {rest.map(post => (
              <PostCard key={post.slug} post={post} />
            ))}
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
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
    padding: '3rem 0',
    position: 'relative',
    overflow: 'hidden',
  },
  heroGrid: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  heroText: { flex: '1', minWidth: '280px' },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '16px',
    letterSpacing: '.3px',
  },
  heroBadgeDot: {
    width: '7px', height: '7px',
    borderRadius: '50%',
    background: '#3b82f6',
    display: 'inline-block',
    flexShrink: 0,
    boxShadow: '0 0 6px #3b82f6',
  },
  heroTitle: {
    fontFamily: "'Unbounded', sans-serif",
    fontSize: 'clamp(1.6rem, 5vw, 2.4rem)',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-1px',
    color: '#f1f5f9',
    marginBottom: '1rem',
  },
  heroAccent: { color: '#3b82f6' },
  heroSub: {
    fontSize: '.9rem',
    color: '#94a3b8',
    lineHeight: 1.7,
    marginBottom: '1.75rem',
  },
  heroActions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  heroBtnPrimary: {
    padding: '8px 18px',
    background: '#2563eb',
    color: '#fff',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 600,
    transition: 'background .15s',
  },
  heroBtnSecondary: {
    padding: '8px 18px',
    background: 'rgba(255,255,255,0.07)',
    color: '#cbd5e1',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 500,
    border: '1px solid rgba(255,255,255,0.1)',
    transition: 'background .15s',
  },
  heroLogoWrap: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tagsSection: {
    padding: '2rem 0',
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
  },
  tagsSectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  tagsSectionTitle: {
    fontFamily: "'Unbounded', sans-serif",
    fontSize: '1rem',
    fontWeight: 700,
    color: '#0f172a',
  },
  tagsViewAll: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: '#2563eb',
    fontWeight: 500,
  },
  tagsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '8px',
  },
  tagCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    transition: 'border-color .15s, background .15s, transform .1s',
    textDecoration: 'none',
  },
  tagCardIcon: { fontSize: '16px', flexShrink: 0 },
  tagCardName: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: '#334155',
    fontWeight: 500,
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  tagCardCount: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: '#94a3b8',
    background: '#e2e8f0',
    padding: '1px 6px',
    borderRadius: '10px',
    flexShrink: 0,
  },

  postsSection: { padding: '2rem 0 3rem' },
  featuredWrap: { marginBottom: '2rem' },
  sectionLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 500,
    color: '#94a3b8',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '12px',
  },
  allPostsHeader: { marginBottom: '4px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
    gap: '12px',
  },
}
