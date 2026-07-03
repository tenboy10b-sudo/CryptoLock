import Layout from '../components/Layout'
import PostCard from '../components/PostCard'
import Link from 'next/link'
import TableOfContents from '../components/TableOfContents'
import { getAllSlugs, getPostBySlug, getAllPosts } from '../lib/posts'
import siteConfig from '../site.config'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Script from 'next/script'

const SITE = siteConfig.url

function extractFaqSchema(contentHtml) {
  if (!contentHtml) return null
  const lower = contentHtml.toLowerCase()
  const markers = ['часті питання', 'питання і відповіді', 'питання та відповіді', 'faq']
  let faqIdx = -1
  for (const m of markers) {
    const idx = lower.indexOf(m)
    if (idx !== -1) { faqIdx = idx; break }
  }
  if (faqIdx === -1) return null
  const faqPart = contentHtml.slice(Math.max(0, faqIdx - 50))
  const pattern = /<h[23][^>]*>(.*?)<\/h[23]>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi
  const items = []
  let m
  while ((m = pattern.exec(faqPart)) !== null && items.length < 6) {
    const q = m[1].replace(/<[^>]+>/g, '').trim()
    const a = m[2].replace(/<[^>]+>/g, '').trim().slice(0, 300)
    if (q && a && q.length > 5) {
      items.push({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a }
      })
    }
  }
  if (!items.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items
  }
}


// ── Copy Button ──────────────────────────────────────────────────
function useCopyButtons(slug) {
  useEffect(() => {
    const blocks = document.querySelectorAll('.prose pre')
    blocks.forEach(pre => {
      if (pre.querySelector('.copy-btn')) return
      const btn = document.createElement('button')
      btn.className = 'copy-btn'
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
      btn.title = 'Копіювати'
      btn.style.cssText = 'position:absolute;top:10px;right:10px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#e2e8f0;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:4px;transition:all 0.15s;z-index:10;line-height:1'
      btn.addEventListener('click', () => {
        const code = pre.querySelector('code')?.innerText || pre.innerText
        navigator.clipboard.writeText(code).then(() => {
          btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
          setTimeout(() => {
            btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
          }, 2000)
        })
      })
      pre.style.position = 'relative'
      pre.appendChild(btn)
    })
  }, [slug])
}

// ── Share Buttons ────────────────────────────────────────────────
function ShareButtons({ title, url, isEn }) {
  const [copied, setCopied] = useState(false)
  const enc = encodeURIComponent(url)
  const encT = encodeURIComponent(title)
  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }
  const btn = { display:'inline-flex', alignItems:'center', gap:'6px', padding:'7px 14px',
    borderRadius:'8px', fontSize:'13px', fontWeight:600, cursor:'pointer', border:'none',
    textDecoration:'none', transition:'opacity 0.15s' }
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap', margin:'1rem 0 1.5rem' }}>
      <span style={{ fontSize:'13px', color:'var(--faint,#94a3b8)' }}>{isEn ? 'Share:' : 'Поділитись:'}</span>
      <a href={'https://t.me/share/url?url=' + enc + '&text=' + encT} target="_blank" rel="noopener noreferrer"
        style={{ ...btn, background:'#229ED9', color:'#fff' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.01 9.47c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 14.676l-2.95-.924c-.642-.2-.654-.642.136-.953l11.52-4.44c.537-.194 1.006.131.686.889z"/>
        </svg>
        Telegram
      </a>
      <a href={'https://twitter.com/intent/tweet?url=' + enc + '&text=' + encT} target="_blank" rel="noopener noreferrer"
        style={{ ...btn, background:'#000', color:'#fff' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        X
      </a>
      <button onClick={copyLink} style={{ ...btn, background:copied?'#10b981':'var(--bg,#f1f5f9)',
        color:copied?'#fff':'var(--muted,#475569)', border:'1px solid var(--border,#e2e8f0)' }}>
        {copied ? ('✓ ' + (isEn ? 'Copied!' : 'Скопійовано!')) : (isEn ? '🔗 Copy link' : '🔗 Посилання')}
      </button>
    </div>
  )
}

// ── Bookmark Button ──────────────────────────────────────────────
function BookmarkButton({ slug, title, tag, isEn }) {
  const [saved, setSaved] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    try { setSaved(JSON.parse(localStorage.getItem('cl-bookmarks')||'[]').some(x=>x.slug===slug)) } catch {}
  }, [slug])
  const toggle = () => {
    try {
      const b = JSON.parse(localStorage.getItem('cl-bookmarks')||'[]')
      if (saved) { localStorage.setItem('cl-bookmarks', JSON.stringify(b.filter(x=>x.slug!==slug))); setSaved(false) }
      else { localStorage.setItem('cl-bookmarks', JSON.stringify([...b,{slug,title,tag,locale:isEn?'en':'uk',savedAt:Date.now()}])); setSaved(true) }
    } catch {}
  }
  // SSR: нейтральна кнопка без залежності від localStorage
  if (!mounted) return (
    <button suppressHydrationWarning style={{ display:'inline-flex', alignItems:'center', gap:'5px',
      padding:'6px 12px', borderRadius:'8px', fontSize:'13px', fontWeight:600, cursor:'pointer',
      border:'1.5px solid var(--border,#e2e8f0)', background:'var(--bg-card,#fff)',
      color:'var(--muted,#64748b)' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
      {isEn?'Save':'Зберегти'}
    </button>
  )
  return (
    <button onClick={toggle} style={{ display:'inline-flex', alignItems:'center', gap:'5px',
      padding:'6px 12px', borderRadius:'8px', fontSize:'13px', fontWeight:600, cursor:'pointer',
      border:'1.5px solid', transition:'all 0.2s',
      borderColor:saved?'#2563eb':'var(--border,#e2e8f0)',
      background:saved?'#eff6ff':'var(--bg-card,#fff)',
      color:saved?'#2563eb':'var(--muted,#64748b)' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill={saved?'currentColor':'none'} stroke="currentColor" strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
      {saved ? (isEn?'Saved':'Збережено') : (isEn?'Save':'Зберегти')}
    </button>
  )
}

// ── Comments ─────────────────────────────────────────────────────
function CommentsSection({ appId, pageId, pageUrl, pageTitle, isEn }) {
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !text.trim()) return
    setSending(true)
    try {
      await fetch('https://cusdis.com/api/open/comments', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ appId, pageId, pageUrl, pageTitle, username:name, content:text }),
      })
    } catch {}
    setSent(true); setSending(false)
  }
  const inp = { width:'100%', padding:'10px 14px', borderRadius:'10px',
    border:'1.5px solid var(--border,#e2e8f0)', background:'var(--bg-card,#fff)',
    color:'var(--text,#0f172a)', fontSize:'14px', fontFamily:'inherit', outline:'none', boxSizing:'border-box' }
  return (
    <div style={{ marginTop:'3rem', paddingTop:'2rem', borderTop:'1px solid var(--border,#e2e8f0)' }}>
      <p style={{ fontSize:'1.1rem', fontWeight:700, marginBottom:'1.5rem', color:'var(--text,#0f172a)' }}>
        💬 {isEn ? 'Leave a comment' : 'Написати коментар'}
      </p>
      {sent ? (
        <div style={{ padding:'14px 18px', background:'var(--accent-light,#eff6ff)',
          border:'1px solid var(--accent-dim,#bfdbfe)', borderRadius:'10px',
          color:'var(--accent-text,#1d4ed8)', fontSize:'14px' }}>
          ✅ {isEn ? 'Thanks! Comment sent for moderation.' : 'Дякуємо! Коментар відправлено на модерацію.'}
        </div>
      ) : (
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          <input style={inp} value={name} onChange={e=>setName(e.target.value)}
            placeholder={isEn ? 'Your name *' : "Ваше ім'я *"} required />
          <textarea style={{ ...inp, minHeight:'100px', resize:'vertical', lineHeight:'1.6' }}
            value={text} onChange={e=>setText(e.target.value)}
            placeholder={isEn ? 'Your comment *' : 'Ваш коментар *'} required />
          <div>
            <button type="submit" disabled={sending} style={{ padding:'9px 24px', borderRadius:'10px',
              border:'none', background:sending?'#94a3b8':'#2563eb', color:'#fff',
              fontWeight:600, fontSize:'14px', cursor:sending?'default':'pointer' }}>
              {sending ? '...' : (isEn ? 'Send' : 'Надіслати')}
            </button>
          </div>
          <p style={{ fontSize:'12px', color:'var(--faint,#94a3b8)' }}>
            {isEn ? 'Comments are moderated before publishing.' : 'Коментарі проходять модерацію перед публікацією.'}
          </p>
        </form>
      )}
    </div>
  )
}


export default function Post({ post, related, locale }) {
  const isEn = locale === 'en'
  useCopyButtons(post.slug)
  // isFallback = ця /en/ сторінка не має реального перекладу і показує UK-контент.
  // В такому разі canonical/schema мають вести на UK-оригінал, а не заявляти окрему EN-сторінку.
  const isFallback = isEn && post.isFallback
  const postUrl = (isEn && !isFallback) ? `${SITE}/en/${post.slug}` : `${SITE}/${post.slug}`
  const altUkUrl = isEn
    ? (isFallback ? `${SITE}/${post.slug}` : (post.translatesUk ? `${SITE}/${post.translatesUk}` : null))
    : `${SITE}/${post.slug}`
  const altEnUrl = isEn
    ? (isFallback ? null : `${SITE}/en/${post.slug}`)
    : (post.translatesEn ? `${SITE}/en/${post.translatesEn}` : null)

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

  const faqSchema = extractFaqSchema(post.contentHtml)

  return (
    <Layout
      title={post.title}
      description={post.description}
      canonical={postUrl}
      isArticle
      ogImage={`${SITE}/api/og?title=${encodeURIComponent(post.title)}&tags=${encodeURIComponent((post.tags||[]).slice(0,3).join(","))}&lang=${locale||"uk"}`}
      translatesUk={post.translatesUk}
      translatesEn={post.translatesEn}
      altUkUrl={altUkUrl}
      altEnUrl={altEnUrl}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 1200px) {
          .article-two-col {
            display: grid !important;
            grid-template-columns: 1fr 260px !important;
            grid-template-areas: "article sidebar" !important;
            gap: 0 2rem !important;
            align-items: start !important;
          }
          .article-two-col .toc-sidebar {
            display: block !important;
            grid-area: sidebar !important;
          }
          .toc-inline { display: none !important; }
        }
      ` }} />
      <div style={s.wrap}>
        <div className="container">

          <nav aria-label={isEn ? "Breadcrumbs" : "Хлібні крихти"} style={s.bc}>
            <Link href="/" style={s.bcLink}>{isEn ? "Home" : "Головна"}</Link>
            <span style={s.bcSep} aria-hidden="true">/</span>
            {post.tags && post.tags[0] && (
              <>
                <Link href={`/tags/${post.tags[0]}`} locale={false} style={s.bcLink}>{post.tags[0]}</Link>
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
                    <Link key={tag} href={`/tags/${tag}`} locale={false} className="tag-chip">{tag}</Link>
                  ))}
                </div>
              )}
              <h1 style={s.title}>{post.title}</h1>
              <div style={s.meta}>
                {post.date && <span style={s.metaItem}><PublishDate date={post.date} locale={locale} /></span>}
                {post.readTime && <><span style={s.dot} aria-hidden="true"/><span style={s.metaItem}>{post.readTime} {isEn ? 'min read' : 'хв читання'}</span></>}
                {post.updated && <><span style={s.dot} aria-hidden="true"/><span style={s.metaItem}>{isEn ? 'Updated' : 'Оновлено'} <PublishDate date={post.updated} locale={locale} /></span></>}
              </div>
              {post.description && <p style={s.lead}>{post.description}</p>}
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginTop:'1rem', flexWrap:'wrap' }}>
                <BookmarkButton slug={post.slug} title={post.title} tag={post.tags?.[0]||''} isEn={isEn} />
              </div>
              <ShareButtons title={post.title} url={postUrl} isEn={isEn} />
            </header>

            {siteConfig.adsenseId && (
              <div style={{ margin: '1.5rem 0' }}>
                <ins className="adsbygoogle" style={{ display: 'block' }}
                  data-ad-client={siteConfig.adsenseId} data-ad-slot="TOP"
                  data-ad-format="auto" data-full-width-responsive="true" />
              </div>
            )}

            {/* TOC для мобільних (sticky={false}) */}
            <TableOfContents contentHtml={post.contentHtml} sticky={false} className="toc-inline" />
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

          <CommentsSection
            appId="5c61191d-573f-4970-beb5-63efb84a8730"
            pageId={post.slug} pageUrl={postUrl}
            pageTitle={post.title} isEn={isEn}
          />
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

// ── Безпечний рендер дати — форматування тільки на клієнті ────────
function PublishDate({ date, locale }) {
  const [text, setText] = useState('')
  useEffect(() => { setText(fmt(date, locale)) }, [date, locale])
  return <time dateTime={date} suppressHydrationWarning>{text}</time>
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
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gridTemplateAreas: '"article"',
    gap: '0',
    position: 'relative',
  },
  sidebar: {
    display: 'none',  // приховано на мобільних
  },
  articleCol: {
    minWidth: 0,
  },
  bc: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1.5rem', flexWrap: 'wrap' },
  bcLink: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--faint,#94a3b8)' },
  bcSep: { fontSize: '12px', color: 'var(--border-md,#cbd5e1)' },
  bcCur: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted,#64748b)', wordBreak: 'break-word', maxWidth: '300px' },
  header: { marginBottom: '2rem' },
  tagRow: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' },
  title: {
    fontFamily: "'Unbounded', sans-serif",
    fontSize: 'clamp(1.35rem, 3.5vw, 1.85rem)',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-.5px',
    marginBottom: '12px',
    color: 'var(--text,#0f172a)',
  },
  meta: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', flexWrap: 'wrap' },
  metaItem: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--faint,#94a3b8)' },
  dot: { width: '3px', height: '3px', borderRadius: '50%', background: '#cbd5e1', flexShrink: 0, display: 'inline-block' },
  lead: {
    fontSize: '1rem', color: 'var(--muted,#475569)', lineHeight: 1.65,
    padding: '1rem 1.25rem', background: 'var(--accent-light,#eff6ff)',
    borderRadius: '0 10px 10px 0', borderLeft: '3px solid var(--accent,#2563eb)',
  },
  related: { marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border,#e2e8f0)' },
  relatedTitle: {
    fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500,
    color: 'var(--faint,#94a3b8)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '14px',
  },
  relatedGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' },
  back: { marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border,#e2e8f0)' },
  backLink: { fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#2563eb', fontWeight: 500 },
}
