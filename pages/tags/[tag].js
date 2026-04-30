import Layout from '../../components/Layout'
import PostCard from '../../components/PostCard'
import Link from 'next/link'
import { getAllTags, getPostsByTag } from '../../lib/posts'
import siteConfig from '../../site.config'

const SITE = siteConfig.url

export default function TagPage({ tag, posts }) {
  const tagUrl = `${SITE}/tags/${tag}`
  const desc = `${posts.length} ${plural(posts.length)} по темі «${tag}» на ${siteConfig.name} — покрокові інструкції українською.`

  // BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Головна', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Теги', item: `${SITE}/tags` },
      { '@type': 'ListItem', position: 3, name: tag, item: tagUrl },
    ],
  }

  return (
    <Layout
      title={`Статті про ${tag}`}
      description={desc}
      canonical={tagUrl}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div style={{ padding: '2.5rem 0 3rem' }}>
        <div className="container">
          <nav aria-label="Хлібні крихти" style={styles.bc}>
            <Link href="/" style={styles.bcLink}>Головна</Link>
            <span style={styles.bcSep} aria-hidden="true">/</span>
            <Link href="/tags" style={styles.bcLink}>Теги</Link>
            <span style={styles.bcSep} aria-hidden="true">/</span>
            <span style={styles.bcCur} aria-current="page">{tag}</span>
          </nav>

          <header style={styles.header}>
            <span className="tag-chip" style={{ fontSize: '13px', padding: '4px 12px' }}>{tag}</span>
            <h1 style={styles.title}>Статті про «{tag}»</h1>
            <p style={styles.count}>{posts.length} {plural(posts.length)}</p>
          </header>

          <div role="list" aria-label={`Статті по темі ${tag}`}>
            {posts.map((post) => (
              <div key={post.slug} role="listitem">
                <PostCard post={post} />
              </div>
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
  const tags = getAllTags('uk')
  return {
    paths: tags.map(({ tag }) => ({ params: { tag } })),
    fallback: false,
  }
}

export async function getStaticProps({ params, locale }) {
  const posts = getPostsByTag(params.tag, locale)
  return { props: { tag: params.tag, posts } }
}

const styles = {
  bc: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  bcLink: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#94a3b8' },
  bcSep: { fontSize: '12px', color: '#cbd5e1' },
  bcCur: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#64748b' },
  header: { marginBottom: '1.5rem' },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(1.35rem, 4vw, 1.6rem)',
    fontWeight: 700,
    margin: '10px 0 4px',
    color: '#0f172a',
  },
  count: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    color: '#94a3b8',
    marginBottom: '.5rem',
  },
}
