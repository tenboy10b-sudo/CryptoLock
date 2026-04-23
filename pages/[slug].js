import Layout from '../components/Layout'
import PostCard from '../components/PostCard'
import Link from 'next/link'
import Head from 'next/head'
import { getAllSlugs, getPostBySlug, getAllPosts } from '../lib/posts'
import siteConfig from '../site.config'

const SITE_URL = siteConfig.url

export default function Post({ post, related, isPending }) {
  if (isPending) {
    return (
      <>
        <Head>
          <title>Незабаром — {siteConfig.name}</title>
          <meta name="robots" content="noindex, follow" />
        </Head>
        <Layout title="Незабаром">
          <div style={{ padding: '4rem 20px', textAlign: 'center', color: '#94a3b8' }}>
            <p style={{ fontSize: '1.1rem' }}>Ця стаття ще не опублікована. Поверніться пізніше.</p>
            <Link href="/" style={{ display: 'inline-block', marginTop: '1.5rem', color: '#2563eb', fontSize: '14px' }}>
              ← На головну
            </Link>
          </div>
        </Layout>
      </>
    )
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description || '',
    datePublished: post.date,
    dateModified: post.updated || post.date,
    author: { '@type': 'Organization', name: siteConfig.name, url: SITE_URL },
    publisher: { '@type': 'Organization', name: siteConfig.name, url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/${post.slug}` },
    inLanguage: 'uk',
  }

  return (
    <Layout title={post.title} description={post.description} canonical={`${SITE_URL}/${post.slug}`} isArticle>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div style={s.wrap}>
        <div className="container">
          <nav style={s.bc}>
            <Link href="/" style={s.bcLink}>Головна</Link>
            <span style={s.bcSep}>/</span>
            {post.tags && post.tags[0] && (
              <>
                <Link href={`/tags/${post.tags[0]}`} style={s.bcLink}>{post.tags[0]}</Link>
                <span style={s.bcSep}>/</span>
              </>
            )}
            <span style={s.bcCur}>{post.title}</span>
          </nav>

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
              {post.date && <span style={s.metaItem}>{fmt(post.date)}</span>}
              {post.readTime && <><span style={s.dot}/><span style={s.metaItem}>{post.readTime} хв читання</span></>}
              {post.updated && <><span style={s.dot}/><span style={s.metaItem}>Оновлено {fmt(post.updated)}</span></>}
            </div>
            {post.description && <p style={s.lead}>{post.description}</p>}
          </header>

          {siteConfig.adsenseId && (
            <div style={{ margin: '1.5rem 0' }}>
              <ins className="adsbygoogle" style={{ display: 'block' }}
                data-ad-client={siteConfig.adsenseId}
                data-ad-slot="TOP"
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            </div>
          )}

          <div className="prose" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />

          {siteConfig.adsenseId && (
            <div style={{ margin: '2rem 0' }}>
              <ins className="adsbygoogle" style={{ display: 'block' }}
                data-ad-client={siteConfig.adsenseId}
                data-ad-slot="BOTTOM"
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
            </div>
          )}

          {related && related.length > 0 && (
            <section style={s.related}>
              <p style={s.relatedTitle}>Схожі статті</p>
              <div style={s.relatedGrid}>
                {related.map(r => <PostCard key={r.slug} post={r} />)}
              </div>
            </section>
          )}

          <div style={s.back}>
            <Link href="/" style={s.backLink}>← Всі статті</Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function fmt(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

export async function getStaticPaths() {
  return { paths: getAllSlugs(), fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  const post = await getPostBySlug(params.slug)

  const publishDate = post.publishDate || post.date
  const isPending = publishDate && new Date(publishDate) > new Date()

  if (isPending) {
    return {
      props: { post: { slug: post.slug }, isPending: true },
      revalidate: 300
    }
  }

  const all = getAllPosts()
  const related = all
    .filter(p => p.slug !== post.slug && p.tags && post.tags && p.tags.some(t => post.tags.includes(t)))
    .slice(0, 3)

  return {
    props: { post, related, isPending: false },
    revalidate: 3600
  }
}

const s = {
  wrap: { padding: '1.75rem 0 3rem' },
  bc: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1.5rem', flexWrap: 'wrap' },
  bcLink: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#94a3b8' },
  bcSep: { fontSize: '12px', color: '#cbd5e1' },
  bcCur: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' },
  header: { marginBottom: '2rem' },
  tagRow: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' },
  title: {
    fontFamily: "'Unbounded', sans-serif",
    fontSize: 'clamp(1.35rem, 3.5vw, 1.85rem)',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-.5px',
    marginBottom: '12px',
    color: '#0f172a',
  },
  meta: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', flexWrap: 'wrap' },
  metaItem: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#94a3b8' },
  dot: { width: '3px', height: '3px', borderRadius: '50%', background: '#cbd5e1', flexShrink: 0 },
  lead: {
    fontSize: '1rem',
    color: '#475569',
    lineHeight: 1.65,
    padding: '1rem 1.25rem',
    background: '#eff6ff',
    borderRadius: '0 10px 10px 0',
    borderLeft: '3px solid #2563eb',
  },
  related: { marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' },
  relatedTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 500,
    color: '#94a3b8',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '14px',
  },
  relatedGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' },
  back: { marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' },
  backLink: { fontFamily: 'var(--font-mono', fontSize: '13px', color: '#2563eb', fontWeight: 500 },
}