import Layout from '../components/Layout'
import Link from 'next/link'
import { getAllSlugs, getPostBySlug, getAllPosts } from '../lib/posts'
import siteConfig from '../site.config'

export default function Post({ post, related }) {
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
    inLanguage: 'uk',
  }

  return (
    <Layout title={post.title} description={post.description} canonical={`${siteConfig.url}/${post.slug}`} isArticle>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div style={s.wrap}>
        <div className="container">
          {/* Breadcrumb */}
          <nav style={s.breadcrumb} aria-label="breadcrumb">
            <Link href="/" style={s.bcLink}>Головна</Link>
            <span style={s.bcSep}>/</span>
            {post.tags && post.tags[0] && (
              <><Link href={`/tags/${post.tags[0]}`} style={s.bcLink}>{post.tags[0]}</Link><span style={s.bcSep}>/</span></>
            )}
            <span style={s.bcCurrent}>{post.title}</span>
          </nav>

          {/* Header */}
          <header style={s.header}>
            {post.tags && (
              <div style={s.tagRow}>
                {post.tags.map(tag => (
                  <Link key={tag} href={`/tags/${tag}`} className="tag-chip">{tag}</Link>
                ))}
              </div>
            )}
            <h1 style={s.title}>{post.title}</h1>
            <div style={s.meta}>
              {post.date && <span style={s.metaItem}>{formatDate(post.date)}</span>}
              {post.readTime && <><span style={s.dot}/><span style={s.metaItem}>{post.readTime} хв читання</span></>}
              {post.updated && <><span style={s.dot}/><span style={s.metaItem}>Оновлено {formatDate(post.updated)}</span></>}
            </div>
            {post.description && <p style={s.lead}>{post.description}</p>}
          </header>

          {/* AdSense top */}
          {siteConfig.adsenseId && (
            <div style={{ margin: '1.5rem 0' }}>
              <ins className="adsbygoogle" style={{ display: 'block' }}
                data-ad-client={siteConfig.adsenseId} data-ad-slot="TOP_SLOT" data-ad-format="auto" data-full-width-responsive="true" />
            </div>
          )}

          {/* Content */}
          <div className="prose" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />

          {/* AdSense bottom */}
          {siteConfig.adsenseId && (
            <div style={{ margin: '2rem 0' }}>
              <ins className="adsbygoogle" style={{ display: 'block' }}
                data-ad-client={siteConfig.adsenseId} data-ad-slot="BOTTOM_SLOT" data-ad-format="auto" data-full-width-responsive="true" />
            </div>
          )}

          {/* Related posts */}
          {related && related.length > 0 && (
            <section style={s.related}>
              <p style={s.relatedTitle}>Схожі статті</p>
              <div style={s.relatedGrid}>
                {related.map(r => (
                  <Link key={r.slug} href={`/${r.slug}`} style={s.relatedCard}>
                    {r.tags && r.tags[0] && <span className="tag-chip" style={{ marginBottom: '8px', display: 'inline-block' }}>{r.tags[0]}</span>}
                    <p style={s.relatedCardTitle}>{r.title}</p>
                    <span style={s.relatedArrow}>Читати →</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Back */}
          <div style={s.back}>
            <Link href="/" style={s.backLink}>← Всі статті</Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })
}

export async function getStaticPaths() {
  return { paths: getAllSlugs(), fallback: false }
}

export async function getStaticProps({ params }) {
  const post = await getPostBySlug(params.slug)
  const all = getAllPosts()
  const related = all
    .filter(p => p.slug !== post.slug && p.tags && post.tags && p.tags.some(t => post.tags.includes(t)))
    .slice(0, 3)
  return { props: { post, related } }
}

const s = {
  wrap: { padding: '1.75rem 0 3rem' },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1.5rem', flexWrap: 'wrap' },
  bcLink: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--faint)', transition: 'color .15s' },
  bcSep: { fontSize: '12px', color: 'var(--faint)' },
  bcCurrent: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' },
  header: { marginBottom: '2rem' },
  tagRow: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(1.4rem, 3.5vw, 1.9rem)',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-.5px',
    marginBottom: '12px',
  },
  meta: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', flexWrap: 'wrap' },
  metaItem: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--faint)' },
  dot: { width: '3px', height: '3px', borderRadius: '50%', background: 'var(--faint)', flexShrink: 0 },
  lead: {
    fontSize: '1.05rem',
    color: 'var(--muted)',
    lineHeight: 1.65,
    padding: '1rem 1.25rem',
    background: 'var(--accent-light)',
    borderRadius: 'var(--radius-md)',
    borderLeft: '3px solid var(--accent)',
  },
  related: { marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' },
  relatedTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 500,
    color: 'var(--faint)',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '14px',
  },
  relatedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '10px',
  },
  relatedCard: {
    display: 'block',
    padding: '1rem',
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    transition: 'border-color .15s',
  },
  relatedCardTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '.88rem',
    fontWeight: 700,
    lineHeight: 1.3,
    color: 'var(--text)',
    marginBottom: '8px',
  },
  relatedArrow: { fontSize: '12px', color: 'var(--accent)', fontWeight: 500 },
  back: { marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' },
  backLink: { fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent)', fontWeight: 500 },
}
