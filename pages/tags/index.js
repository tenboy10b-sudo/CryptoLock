import Layout from '../../components/Layout'
import Link from 'next/link'
import { getAllTags } from '../../lib/posts'
import siteConfig from '../../site.config'

export default function TagsPage({ tags }) {
  return (
    <Layout title="Теги" description={`Усі теги статей на ${siteConfig.name}`}>
      <div style={{ padding: '2.5rem 0' }}>
        <div className="container">
          <h1 style={styles.title}>Теги</h1>
          <div style={styles.grid}>
            {tags.map(({ tag, count }) => (
              <Link key={tag} href={`/tags/${tag}`} style={styles.tagCard}>
                <span style={styles.tagName}>{tag}</span>
                <span style={styles.tagCount}>{count}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export async function getStaticProps() {
  const tags = getAllTags()
  return { props: { tags } }
}

const styles = {
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.75rem',
    fontWeight: 700,
    marginBottom: '2rem',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  tagCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    background: 'var(--bg-card)',
    transition: 'border-color 0.15s',
  },
  tagName: { fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent-text)' },
  tagCount: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-faint)',
    background: 'var(--accent-bg)',
    padding: '1px 6px',
    borderRadius: '10px',
  },
}
