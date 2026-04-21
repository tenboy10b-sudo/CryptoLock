import Head from 'next/head'
import Link from 'next/link'
import { useEffect } from 'react'
import siteConfig from '../site.config'

export default function Layout({ children, title, description, canonical, isArticle }) {
  const pageTitle = title ? `${title} — ${siteConfig.name}` : siteConfig.name
  const pageDesc = description || siteConfig.description
  const pageUrl = canonical || siteConfig.url

  useEffect(() => {
    // Back to top button
    const btn = document.getElementById('back-to-top')
    const onScroll = () => {
      if (!btn) return
      if (window.scrollY > 400) btn.classList.add('visible')
      else btn.classList.remove('visible')

      // Read progress bar (articles only)
      const bar = document.getElementById('read-progress')
      if (bar && isArticle) {
        const doc = document.documentElement
        const scrolled = doc.scrollTop
        const total = doc.scrollHeight - doc.clientHeight
        bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%'
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [isArticle])

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content={isArticle ? 'article' : 'website'} />
        <meta property="og:site_name" content={siteConfig.name} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta httpEquiv="content-language" content={siteConfig.language} />
        <link rel="icon" href="/favicon.ico" />
        {siteConfig.adsenseId && (
          <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteConfig.adsenseId}`} crossOrigin="anonymous" />
        )}
        {siteConfig.gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.gaId}`} />
            <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${siteConfig.gaId}');` }} />
          </>
        )}
      </Head>

      {isArticle && <div id="read-progress" />}

      <header style={s.header}>
        <div className="container" style={s.nav}>
          <Link href="/" style={s.logo}>
            {siteConfig.name.split('.')[0]}<span style={s.logoDot}>.</span>{siteConfig.name.split('.')[1]}
          </Link>
          <nav style={s.navLinks}>
            {siteConfig.nav.map(item => (
              <Link key={item.href} href={item.href} style={s.navLink}>{item.label}</Link>
            ))}
          </nav>
        </div>
      </header>

      <main style={{ minHeight: 'calc(100vh - 58px - 80px)' }}>
        {children}
      </main>

      <footer style={s.footer}>
        <div className="container" style={s.footerInner}>
          <span style={s.footerText}>© {new Date().getFullYear()} {siteConfig.name}</span>
          <div style={s.footerLinks}>
            <Link href="/about" style={s.footerLink}>Про нас</Link>
            <Link href="/tags" style={s.footerLink}>Теги</Link>
            <Link href="/privacy" style={s.footerLink}>Конфіденційність</Link>
          </div>
        </div>
      </footer>

      <button id="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Нагору">
        ↑
      </button>
    </>
  )
}

const s = {
  header: {
    background: '#fff',
    borderBottom: '1px solid var(--border)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    height: '58px',
    display: 'flex',
    alignItems: 'center',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '0 20px',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '1rem',
    letterSpacing: '-0.5px',
    color: 'var(--text)',
  },
  logoDot: { color: 'var(--accent)' },
  navLinks: { display: 'flex', gap: '20px', alignItems: 'center' },
  navLink: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--muted)',
    transition: 'color .15s',
  },
  footer: {
    borderTop: '1px solid var(--border)',
    background: '#fff',
    marginTop: '4rem',
  },
  footerInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '1.25rem 20px',
  },
  footerText: { fontSize: '13px', color: 'var(--faint)', fontFamily: 'var(--font-mono)' },
  footerLinks: { display: 'flex', gap: '16px' },
  footerLink: { fontSize: '13px', color: 'var(--faint)' },
}
