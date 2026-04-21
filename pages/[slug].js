import Layout from '../components/Layout'
import Link from 'next/link'
import { getAllSlugs, getPostBySlug } from '../lib/posts'
import siteConfig from '../site.config'

export default function Post({ post }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description || '',
    datePublished: post.date,
    dateModified: post.updated || post.date,
    author: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
    publisher: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteConfig.url}/${post.slug}` },
  }

  return (
    <Layout
      title={post.title}
      description={post.description}
      canonical={`${siteConfig.url}/${post.slug}`}
    >
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <article style={styles.article}>
        <div className="container">
          {/* Breadcrumb */}
          <nav style={styles.breadcrumb}>
            <Link href="/" style={styles.breadcrumbLink}>Головна</Link>
            <span style={styles.breadcrumbSep}>/</span>
            <span style={styles.breadcrumbCurrent}>{post.title}</span>
          </nav>

          {/* Tags */}
          {post.tags && (
            <div style={styles.tagRow}>
              {post.tags.map((tag) => (
                <Link key={tag} href={`/tags/${tag}`} className="tag-chip">{tag}</Link>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 style={styles.title}>{post.title}</h1>

          {/* Meta */}
          <div style={styles.meta}>
            {post.date && <span style={styles.metaItem}>{formatDate(post.date)}</span>}
            {post.readTime && <><span style={styles.dot}/><span style={styles.metaItem}>{post.readTime} хв читання</span></>}
            {post.updated && <><span style={styles.dot}/><span style={styles.metaItem}>Оновлено: {formatDate(post.updated)}</span></>}
          </div>

          {/* Description lead */}
          {post.description && (
            <p style={styles.lead}>{post.description}</p>
          )}

          {/* AdSense — верхній банер */}
          {siteConfig.adsenseId && (
            <div style={styles.adSlot}>
              <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={siteConfig.adsenseId}
                data-ad-slot="TOP_SLOT_ID"
                data-ad-format="auto"
                data-full-width-responsive="true" />
            </div>
          )}

          {/* Article content */}
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          {/* AdSense — нижній банер */}
          {siteConfig.adsenseId && (
            <div style={styles.adSlot}>
              <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={siteConfig.adsenseId}
                data-ad-slot="BOTTOM_SLOT_ID"
                data-ad-format="auto"
                data-full-width-responsive="true" />
            </div>
          )}

          {/* Back link */}
          <div style={styles.backRow}>
            <Link href="/" style={styles.backLink}>← Усі статті</Link>
          </div>
        </div>
      </article>
    </Layout>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })
}

export async function getStaticPaths() {
  const paths = getAllSlugs()
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const post = await getPostBySlug(params.slug)
  return { props: { post } }
}

const styles = {
  article: { padding: '2rem 0 3rem' },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1.25rem' },
  breadcrumbLink: { fontSize: '13px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' },
  breadcrumbSep: { fontSize: '13px', color: 'var(--text-faint)' },
  breadcrumbCurrent: { fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' },
  tagRow: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(1.5rem, 4vw, 2.1rem)',
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: '12px',
    letterSpacing: '-0.3px',
  },
  meta: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' },
  metaItem: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-faint)' },
  dot: { width: '3px', height: '3px', borderRadius: '50%', background: 'var(--text-faint)' },
  lead: {
    fontSize: '1.1rem',
    color: 'var(--text-muted)',
    lineHeight: 1.65,
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid var(--border)',
    fontStyle: 'italic',
  },
  adSlot: { margin: '2rem 0' },
  backRow: { marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' },
  backLink: { fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent-text)' },
}
