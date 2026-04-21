import Layout from '../components/Layout'
import PostCard from '../components/PostCard'
import Link from 'next/link'
import { getAllPosts, getAllTags } from '../lib/posts'
import siteConfig from '../site.config'

export default function Home({ posts, tags }) {
  return (
    <Layout>
      {/* Hero */}
      <div style={styles.hero}>
        <div className="container">
          <p style={styles.heroEyebrow}>Гайди українською</p>
          <h1 style={styles.heroTitle}>Налаштовуємо Windows<br/>без зайвих слів</h1>
          <p style={styles.heroSub}>{siteConfig.description}</p>
        </div>
      </div>

      <div className="container" style={styles.body}>
        {/* Tags sidebar row */}
        <div style={styles.tagRow}>
          {tags.map(({ tag }) => (
            <Link key={tag} href={`/tags/${tag}`} className="tag-chip">{tag}</Link>
          ))}
        </div>

        {/* Posts list */}
        <div style={styles.posts}>
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
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

const styles = {
  hero: {
    padding: '3.5rem 0 2.5rem',
    borderBottom: '1px solid var(--border)',
  },
  heroEyebrow: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--accent-text)',
    letterSpacing: '0.5px',
    marginBottom: '12px',
  },
  heroTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(1.8rem, 5vw, 2.75rem)',
    fontWeight: 700,
    lineHeight: 1.15,
    marginBottom: '1rem',
    letterSpacing: '-0.5px',
  },
  heroSub: {
    fontSize: '1rem',
    color: 'var(--text-muted)',
    maxWidth: '520px',
    lineHeight: 1.6,
  },
  body: { paddingTop: '1.75rem' },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid var(--border)',
  },
  posts: {},
}
