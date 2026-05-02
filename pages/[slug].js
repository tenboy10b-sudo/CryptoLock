import Layout from '../components/Layout'
import PostCard from '../components/PostCard'
import Link from 'next/link'
import TableOfContents from '../components/TableOfContents'
import { getAllSlugs, getPostBySlug, getAllPosts } from '../lib/posts'
import siteConfig from '../site.config'
import { useRouter } from 'next/router'

const SITE = siteConfig.url

export default function Post({ post, related, locale }) {
  const isEn = locale === 'en'
  const postUrl = `${SITE}/${post.slug}`

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${postUrl}/#article`,
    headline: post.title,
    description: post.description || '',
    datePublished: post.date,
    dateModified: post.updated || post.date,
    image: {
      '@type': 'ImageObject',
      url: `${SITE}/logo.png`,
      width: 1200,
      height: 630,
    },
    author: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: SITE,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: SITE,
      logo: { '@type': 'ImageObject', url: `${SITE}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
    inLanguage: locale || 'uk',
    url: postUrl,
    wordCount: post.contentHtml ? post.contentHtml.replace(/<[^>]+>/g, '').split(/\s+/).length : undefined,
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Головна', item: SITE },
      ...(post.tags && post.tags[0]
        ? [{ '@type': 'ListItem', position: 2, name: post.tags[0], item: `${SITE}/tags/${post.tags[0]}` }]
        : []),
      { '@type': 'ListItem', position: post.tags && post.tags[0] ? 3 : 2, name: post.title, item: postUrl },
    ],
  }

  return (
    <Layout
      title={post.title}
      description={post.description}
      canonical={postUrl}
      isArticle
      ogImage={`${SITE}/logo.png`}
      translatesUk={post.translatesUk}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div style={s.wrap}>
        <div className="container">

          <nav aria-label={isEn ? "Breadcrumbs" : "Хлібні крихти"} style={s.bc}>
            <Link href="/" style={s.bcLink}>{isEn ? "Home" : "Головна"}</Link>
            <span style={s.bcSep} aria-hidden="true">/</span>
            {post.tags && post.tags[0] && (
              <>
                <Link href={`/tags/${post.tags[0]}`} style={s.bcLink}>{post.tags[0]}</Link>
                <span style={s.bcSep} aria-hidden="true">/</span>
              </>
            )}
            <span style={s.bcCur} aria-current="page">{post.title}</span>
          </nav>

          <article>
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
                {post.date && <time dateTime={post.date} style={s.metaItem}>{fmt(post.date, locale)}</time>}
                {post.readTime && <><span style={s.dot} aria-hidden="true"/><span style={s.metaItem}>{post.readTime} {isEn ? 'min read' : 'хв читання'}</span></>}
                {post.updated && <><span style={s.dot} aria-hidden="true"/><span style={s.metaItem}>{isEn ? 'Updated' : 'Оновлено'} <time dateTime={post.updated}>{fmt(post.updated, locale)}</time></span></>}
              </div>
              {post.description && <p style={s.lead}>{post.description}</p>}
            </header>

            {siteConfig.adsenseId && (
              <div style={{ margin: '1.5rem 0' }}>
                <ins className="adsbygoogle" style={{ display: 'block' }}
                  data-ad-client={siteConfig.adsenseId} data-ad-slot="TOP"
                  data-ad-format="auto" data-full-width-responsive="true" />
              </div>
            )}

            <TableOfContents contentHtml={post.contentHtml} />
            <div className="prose" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />

            {siteConfig.adsenseId && (
              <div style={{ margin: '2rem 0' }}>
                <ins className="adsbygoogle" style={{ display: 'block' }}
                  data-ad-client={siteConfig.adsenseId} data-ad-slot="BOTTOM"
                  data-ad-format="auto" data-full-width-responsive="true" />
              </div>
            )}
          </article>

          {related && related.length > 0 && (
            <section style={s.related} aria-label={isEn ? "Related articles" : "Схожі статті"}>
              <p style={s.relatedTitle}>{isEn ? "Related articles" : "Схожі статті"}</p>
              <div style={s.relatedGrid}>
                {related.map(r => <PostCard key={r.slug} post={r} />)}
              </div>
            </section>
          )}

          <div style={s.back}>
            <Link href="/" style={s.backLink}>{isEn ? "← All articles" : "← Всі статті"}</Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function fmt(d, locale = 'uk') {
  if (!d) return ''
  return new Date(d).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })
}

export async function getStaticPaths() {
  const ukPaths = getAllSlugs('uk').map(p => ({ ...p, locale: 'uk' }))
  const enPaths = getAllSlugs('en').map(p => ({ ...p, locale: 'en' }))
  return { paths: [...ukPaths, ...enPaths], fallback: 'blocking' }
}

export async function getStaticProps({ params, locale }) {
  try {
    const post = await getPostBySlug(params.slug, locale)

    // Якщо стаття ще не опублікована — повертаємо 404
    const publishDate = post.publishDate || post.date
    if (publishDate && new Date(publishDate) > new Date()) {
      return { notFound: true }
    }

    const all = getAllPosts(locale)
    const related = all
      .filter(p => p.slug !== post.slug && p.tags && post.tags && p.tags.some(t => post.tags.includes(t)))
      .slice(0, 3)

    return { props: { post, related, locale: locale || 'uk' }, revalidate: 3600 }
  } catch (e) {
    return { notFound: true }
  }
}

const s = {
  wrap: { padding: '1.75rem 0 3rem' },
  bc: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1.5rem', flexWrap: 'wrap' },
  bcLink: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#94a3b8' },
  bcSep: { fontSize: '12px', color: '#cbd5e1' },
  bcCur: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#64748b', wordBreak: 'break-word', maxWidth: '300px' },
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
  dot: { width: '3px', height: '3px', borderRadius: '50%', background: '#cbd5e1', flexShrink: 0, display: 'inline-block' },
  lead: {
    fontSize: '1rem', color: '#475569', lineHeight: 1.65,
    padding: '1rem 1.25rem', background: '#eff6ff',
    borderRadius: '0 10px 10px 0', borderLeft: '3px solid #2563eb',
  },
  related: { marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' },
  relatedTitle: {
    fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500,
    color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '14px',
  },
  relatedGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' },
  back: { marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' },
  backLink: { fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#2563eb', fontWeight: 500 },
}
