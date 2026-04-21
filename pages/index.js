import Layout from '../components/Layout'
import PostCard from '../components/PostCard'
import Link from 'next/link'
import { getAllPosts, getAllTags } from '../lib/posts'
import siteConfig from '../site.config'

export default function Home({ posts, tags }) {
  const featured = posts[0]
  const rest = posts.slice(1)

  return (
    <Layout>
      <div style={s.hero}>
        <div className="container">
          <div style={s.heroLabel}>
            <span style={s.heroLabelDot} />
            Гайди українською мовою
          </div>
          <h1 style={s.heroTitle}>Налаштування ПК<br/>без зайвих слів</h1>
          <p style={s.heroSub}>{siteConfig.description}</p>
          <div style={s.heroStats}>
            <div style={s.stat}><span style={s.statNum}>{posts.length}</span><span style={s.statLabel}>статей</span></div>
            <div style={s.statDiv}/>
            <div style={s.stat}><span style={s.statNum}>{tags.length}</span><span style={s.statLabel}>тем</span></div>
            <div style={s.statDiv}/>
            <div style={s.stat}><span style={s.statNum}>100%</span><span style={s.statLabel}>українською</span></div>
          </div>
        </div>
      </div>

      <div className="container" style={s.body}>
        {/* Tags */}
        <div style={s.tagSection}>
          <p style={s.sectionLabel}>Теми</p>
          <div style={s.tagRow}>
            {tags.map(({ tag, count }) => (
              <Link key={tag} href={`/tags/${tag}`} style={s.tagWithCount}>
                <span className="tag-chip">{tag}</span>
                <span style={s.tagCount}>{count}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured post */}
        {featured && (
          <div style={s.section}>
            <p style={s.sectionLabel}>Остання стаття</p>
            <PostCard post={featured} featured />
          </div>
        )}

        {/* All posts grid */}
        <div style={s.section}>
          <p style={s.sectionLabel}>Всі статті</p>
          <div style={s.grid}>
            {rest.map(post => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </div>
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
    background: '#fff',
    borderBottom: '1px solid var(--border)',
    padding: '3rem 0 2.5rem',
  },
  heroLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--accent)',
    fontWeight: 500,
    marginBottom: '16px',
    letterSpacing: '.3px',
  },
  heroLabelDot: {
    width: '7px', height: '7px',
    borderRadius: '50%',
    background: 'var(--accent)',
    display: 'inline-block',
    flexShrink: 0,
  },
  heroTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: '-1px',
    marginBottom: '1rem',
  },
  heroSub: {
    fontSize: '.95rem',
    color: 'var(--muted)',
    maxWidth: '500px',
    lineHeight: 1.65,
    marginBottom: '1.75rem',
  },
  heroStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  stat: { display: 'flex', flexDirection: 'column', gap: '1px' },
  statNum: { fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' },
  statLabel: { fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--faint)', letterSpacing: '.3px' },
  statDiv: { width: '1px', height: '28px', background: 'var(--border)' },
  body: { paddingTop: '2rem', paddingBottom: '2rem' },
  tagSection: { marginBottom: '2rem' },
  sectionLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 500,
    color: 'var(--faint)',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '12px',
  },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' },
  tagWithCount: { display: 'flex', alignItems: 'center', gap: '4px' },
  tagCount: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--faint)',
    background: '#f4f4f5',
    padding: '1px 5px',
    borderRadius: '10px',
  },
  section: { marginBottom: '2.5rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '12px',
  },
}
