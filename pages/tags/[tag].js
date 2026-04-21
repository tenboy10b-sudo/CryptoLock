import Layout from '../../components/Layout'
import PostCard from '../../components/PostCard'
import Link from 'next/link'
import { getAllTags, getPostsByTag } from '../../lib/posts'
import siteConfig from '../../site.config'

export default function TagPage({ tag, posts }) {
  return (
    <Layout title={`#${tag}`} description={`Статті по темі «${tag}» на ${siteConfig.name}`}>
      <div style={{ padding: '2.5rem 0 3rem' }}>
        <div className="container">
          <div style={styles.back}>
            <Link href="/tags" style={styles.backLink}>← Усі теги</Link>
          </div>
          <div style={styles.header}>
            <span className="tag-chip" style={{ fontSize: '13px', padding: '4px 12px' }}>{tag}</span>
            <h1 style={styles.title}>Статті по темі «{tag}»</h1>
            <p style={styles.count}>{posts.length} {plural(posts.length)}</p>
          </div>
          <div>
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
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

export async function getStaticPaths() {
  const tags = getAllTags()
  return {
    paths: tags.map(({ tag }) => ({ params: { tag } })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const posts = getPostsByTag(params.tag)
  return { props: { tag: params.tag, posts } }
}

const styles = {
  back: { marginBottom: '1.5rem' },
  backLink: { fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-faint)' },
  header: { marginBottom: '0.5rem' },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.6rem',
    fontWeight: 700,
    margin: '10px 0 4px',
  },
  count: { fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-faint)', marginBottom: '1.5rem' },
}
