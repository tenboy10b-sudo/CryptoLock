import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import SearchBar from './SearchBar'
import siteConfig from '../site.config'

const SITE = siteConfig.url

const TelegramIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.68 7.94c-.13.57-.47.71-.95.44l-2.58-1.9-1.24 1.2c-.14.14-.26.26-.52.26l.18-2.6 4.74-4.28c.2-.18-.05-.28-.32-.1L7.46 14.73 4.9 13.97c-.56-.17-.57-.56.13-.83l9.68-3.74c.47-.17.87.12.7.83l-.67-.43z"/>
  </svg>
)
const TikTokIcon = () => (
  <svg width="15" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.15 8.15 0 004.78 1.54V6.78a4.85 4.85 0 01-1.01-.09z"/>
  </svg>
)

// ── Theme Toggle ────────────────────────────────────────────────
function ThemeToggle() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setDark(document.documentElement.getAttribute('data-theme') === 'dark')
  }, [])

  const toggle = () => {
    const next = dark ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
    setDark(!dark)
  }

  // SSR: порожня кнопка без вмісту — без hydration mismatch
  if (!mounted) return (
    <button style={{ width:'32px', height:'32px', borderRadius:'8px', background:'none',
      border:'1px solid var(--border,#e2e8f0)', cursor:'pointer', flexShrink:0 }}
      aria-label="Тема" suppressHydrationWarning />
  )

  return (
    <button onClick={toggle}
      aria-label={dark ? 'Світла тема' : 'Темна тема'}
      style={{ display:'flex', alignItems:'center', justifyContent:'center',
        width:'32px', height:'32px', borderRadius:'8px', background:'none',
        border:'1px solid var(--border,#e2e8f0)', cursor:'pointer',
        color:'var(--muted,#64748b)', transition:'border-color 0.15s, opacity 0.15s',
        flexShrink:0 }}
      suppressHydrationWarning
    >
      {dark ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  )
}

// ── Bookmarks Nav Link ──────────────────────────────────────────
function BookmarksNavLink() {
  const [count, setCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  const { locale } = useRouter()
  const isEn = locale === 'en'

  useEffect(() => {
    const update = () => {
      try {
        const b = JSON.parse(localStorage.getItem('cl-bookmarks') || '[]')
        setCount(b.length)
      } catch {}
    }
    update()
    setMounted(true)
    window.addEventListener('storage', update)
    window.addEventListener('focus', update)
    return () => {
      window.removeEventListener('storage', update)
      window.removeEventListener('focus', update)
    }
  }, [])

  const href = mounted ? (isEn ? '/en/bookmarks' : '/bookmarks') : '/bookmarks'

  return (
    <Link href={href}
      title={mounted ? (isEn ? 'Bookmarks' : 'Закладки') : 'Закладки'}
      suppressHydrationWarning
      style={{ display:'inline-flex', alignItems:'center', gap:'4px',
        padding:'5px 10px', borderRadius:'8px',
        border:'1px solid var(--border,#e2e8f0)',
        color:'var(--muted,#64748b)', textDecoration:'none',
        fontSize:'13px', transition:'all 0.15s', flexShrink:0 }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
      {mounted && count > 0 && (
        <span suppressHydrationWarning style={{
          fontSize:'11px', fontWeight:700,
          background:'var(--accent,#2563eb)', color:'#fff',
          borderRadius:'10px', padding:'0 5px',
          lineHeight:'16px', minWidth:'16px', textAlign:'center',
        }}>
          {count}
        </span>
      )}
    </Link>
  )
}

export default function Layout({ children, title, description, canonical, isArticle, ogImage, noindex, translatesUk, translatesEn }) {
  const pageTitle = title
    ? `${title} — ${siteConfig.name}`
    : `${siteConfig.name} — налаштування Windows та захист ПК українською`
  const pageDesc = description || siteConfig.description
  const pageUrl  = canonical || SITE
  const ogImg    = ogImage || `${SITE}/logo.png`
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const { locale, asPath } = router

  useEffect(() => {
    const btn = document.getElementById('back-to-top')
    const onScroll = () => {
      if (btn) {
        if (window.scrollY > 400) btn.classList.add('visible')
        else btn.classList.remove('visible')
      }
      const bar = document.getElementById('read-progress')
      if (bar && isArticle) {
        const d = document.documentElement
        const pct = d.scrollHeight - d.clientHeight
        bar.style.width = (pct > 0 ? (d.scrollTop / pct) * 100 : 0) + '%'
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [isArticle])

  useEffect(() => {
    if (!menuOpen) return
    const h = (e) => { if (!e.target.closest('header')) setMenuOpen(false) }
    document.addEventListener('click', h)
    return () => document.removeEventListener('click', h)
  }, [menuOpen])

  const socialLinks = [
    { key: 'telegram', icon: <TelegramIcon />, label: 'Telegram', cls: 'telegram' },
    { key: 'tiktok',   icon: <TikTokIcon />,   label: 'TikTok',   cls: 'tiktok'   },
  ].filter(s => siteConfig.social[s.key])

  const orgSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE}/#org`,
        name: siteConfig.name,
        url: SITE,
        logo: { '@type': 'ImageObject', url: `${SITE}/logo.png` },
        sameAs: Object.values(siteConfig.social).filter(Boolean),
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE}/#website`,
        url: SITE,
        name: siteConfig.name,
        description: siteConfig.description,
        inLanguage: 'uk',
        publisher: { '@id': `${SITE}/#org` },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* БЕЗ preconnect тут — вони в _document.js */}
        <link rel="canonical" href={pageUrl} />
        <link rel="alternate" hrefLang="uk"
          href={`${SITE}${asPath.replace(/^\/en/, '') || '/'}`} />
        <link rel="alternate" hrefLang="en"
          href={asPath.startsWith('/en') ? `${SITE}${asPath}` : `${SITE}/en${asPath === '/' ? '' : asPath}`} />
        <link rel="alternate" hrefLang="x-default"
          href={`${SITE}${asPath.replace(/^\/en/, '') || '/'}`} />
        <meta name="robots" content={noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
        {siteConfig.googleVerification && (
          <meta name="google-site-verification" content={siteConfig.googleVerification} />
        )}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content={isArticle ? 'article' : 'website'} />
        <meta property="og:site_name" content={siteConfig.name} />
        <meta property="og:image" content={ogImg} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content={locale === "en" ? "en_US" : "uk_UA"} />
        <meta property="og:locale:alternate" content={locale === "en" ? "uk_UA" : "en_US"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image" content={ogImg} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
        {siteConfig.adsenseId && (
          <script async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteConfig.adsenseId}`}
            crossOrigin="anonymous" />
        )}
        {siteConfig.gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.gaId}`} />
            <script dangerouslySetInnerHTML={{ __html:
              `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${siteConfig.gaId}');`
            }} />
          </>
        )}
      </Head>

      {isArticle && <div id="read-progress" role="progressbar" aria-hidden="true" />}

      <header style={s.header}>
        <div className="container" style={s.navWrap}>

          <Link href="/" style={s.logoWrap} aria-label={`${siteConfig.name} — на головну`}>
            <span style={s.logoText}>Crypto<span style={s.logoAccent}>Lock</span></span>
          </Link>

          <div style={s.rightSide}>
            <nav className="nav-desktop" aria-label="Головна навігація">
              {(locale === 'en'
                ? [{ label: 'Articles', href: '/' }, { label: 'Tools', href: '/tools' }, { label: 'Tags', href: '/tags' }, { label: 'About', href: '/about' }]
                : siteConfig.nav
              ).map(item => (
                <Link key={item.href} href={item.href} style={s.navLink} className="nav-link" suppressHydrationWarning>
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="nav-divider" aria-hidden="true" />

            <BookmarksNavLink />
            <ThemeToggle />
            <SearchBar />

            {(translatesUk || translatesEn) && (
              <div style={s.langSwitch} aria-label="Вибір мови">
                {translatesUk && (
                  <Link href={`/${translatesUk}`} locale="uk"
                    style={{ ...s.langBtn, ...(locale === 'uk' ? s.langBtnActive : {}) }}
                    aria-label="Українська" title="Українська">UA</Link>
                )}
                {translatesEn && (
                  <Link href={`/${translatesEn}`} locale="en"
                    style={{ ...s.langBtn, ...(locale === 'en' ? s.langBtnActive : {}) }}
                    aria-label="English" title="English">EN</Link>
                )}
              </div>
            )}

            <div className="nav-social">
              {socialLinks.map(({ key, icon, label, cls }) => (
                <a key={key} href={siteConfig.social[key]} target="_blank" rel="noopener noreferrer"
                  className={`social-btn ${cls}`} style={s.socialBtn} aria-label={label} title={label}>
                  {icon}
                </a>
              ))}
            </div>

            <button className="nav-burger" onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Закрити меню' : 'Відкрити меню'}
              aria-expanded={menuOpen} aria-controls="mobile-menu">
              <span style={{ ...s.bl, ...(menuOpen ? s.bl1o : {}) }} />
              <span style={{ ...s.bl, ...(menuOpen ? s.bl2o : {}) }} />
              <span style={{ ...s.bl, ...(menuOpen ? s.bl3o : {}) }} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div id="mobile-menu" style={s.mobileMenu} role="navigation" aria-label="Мобільна навігація">
            {(locale === 'en'
              ? [{ label: 'Articles', href: '/' }, { label: 'Tools', href: '/tools' }, { label: 'Tags', href: '/tags' }, { label: 'About', href: '/about' }]
              : siteConfig.nav
            ).map(item => (
              <Link key={item.href} href={item.href} style={s.mobileLink} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
            <div style={s.mobileSocial}>
              {socialLinks.map(({ key, icon, label }) => (
                <a key={key} href={siteConfig.social[key]} target="_blank" rel="noopener noreferrer"
                  style={s.mobileSocialBtn} aria-label={label}>
                  {icon} {label}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      <main style={{ minHeight: 'calc(100vh - 62px - 72px)' }}>
        {children}
      </main>

      <footer style={s.footer}>
        <div className="container" style={s.footerInner}>
          <div style={s.footerLogo}>
            <span style={s.footerName}>CryptoLock</span>
          </div>
          <nav style={s.footerLinks} aria-label="Навігація в підвалі">
            <Link href="/about" style={s.footerLink}>{locale === "en" ? "About" : "Про нас"}</Link>
            <Link href="/tags" style={s.footerLink}>{locale === "en" ? "Tags" : "Теги"}</Link>
            <Link href="/privacy" style={s.footerLink}>{locale === "en" ? "Privacy" : "Конфіденційність"}</Link>
          </nav>
          <div style={s.footerSocial}>
            {socialLinks.map(({ key, icon, label }) => (
              <a key={key} href={siteConfig.social[key]} target="_blank" rel="noopener noreferrer"
                style={s.footerSocialBtn} aria-label={label}>
                {icon}
              </a>
            ))}
          </div>
        </div>
        <div style={s.footerCopy}>
          <div className="container">
            <p style={s.footerCopyText}>
              {locale === "en"
                ? "© 2026 CryptoLock. Windows & Security guides."
                : "© 2026 CryptoLock. Всі матеріали українською мовою."}
            </p>
          </div>
        </div>
      </footer>

      <button id="back-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Прокрутити нагору">↑</button>
    </>
  )
}

const s = {
  header: { background: 'var(--bg-card,#fff)', borderBottom: '1px solid var(--border,#e2e8f0)', position: 'sticky', top: 0, zIndex: 50 },
  navWrap: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', height: '62px', width: '100%', padding: '0 20px' },
  logoWrap: { display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none', flexShrink: 0 },
  logoText: { fontFamily: "'Unbounded',sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.5px', color: 'var(--text,#0f172a)' },
  logoAccent: { color: 'var(--accent,#2563eb)' },
  rightSide: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1, justifyContent: 'flex-end' },
  navLink: { fontSize: '14px', fontWeight: 500, color: 'var(--text,#0f172a)', padding: '6px 10px', borderRadius: '8px', transition: 'color .15s, background .15s', whiteSpace: 'nowrap' },
  socialBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: '8px', color: '#64748b', border: '1px solid #e2e8f0', background: '#f8fafc', transition: 'color .15s, border-color .15s, background .15s', flexShrink: 0, cursor: 'pointer' },
  bl: { display: 'block', width: '20px', height: '2px', background: '#334155', borderRadius: '2px', transition: 'transform .2s, opacity .2s' },
  bl1o: { transform: 'rotate(45deg) translate(5px,5px)' },
  bl2o: { opacity: 0 },
  bl3o: { transform: 'rotate(-45deg) translate(5px,-5px)' },
  mobileMenu: { borderTop: '1px solid var(--border,#e2e8f0)', background: 'var(--bg-card,#fff)', padding: '4px 0 8px' },
  mobileLink: { display: 'block', padding: '11px 20px', fontSize: '15px', fontWeight: 500, color: '#0f172a', borderBottom: '1px solid #f1f5f9' },
  mobileSocial: { display: 'flex', gap: '8px', padding: '12px 20px 4px', flexWrap: 'wrap' },
  mobileSocialBtn: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: '#475569', padding: '7px 14px', border: '1px solid #e2e8f0', borderRadius: '20px', background: '#f8fafc' },
  footer: { borderTop: '1px solid var(--border,#e2e8f0)', background: 'var(--bg-card,#fff)', marginTop: '4rem' },
  footerInner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '1.25rem 20px' },
  footerLogo: { display: 'flex', alignItems: 'center', gap: '8px' },
  footerName: { fontFamily: "'Unbounded',sans-serif", fontSize: '13px', fontWeight: 600, color: '#0f172a' },
  footerLinks: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  footerLink: { fontSize: '13px', color: '#64748b', transition: 'color .15s' },
  footerSocial: { display: 'flex', gap: '8px' },
  footerSocialBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', color: '#64748b', border: '1px solid #e2e8f0', background: '#f8fafc' },
  footerCopy: { borderTop: '1px solid #f1f5f9', padding: '.75rem 0' },
  footerCopyText: { fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#475569', textAlign: 'center' },
  langSwitch: { display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0, border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: '#f8fafc' },
  langBtn: { fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-mono)', padding: '5px 9px', color: '#64748b', textDecoration: 'none', transition: 'background .15s, color .15s', letterSpacing: '.03em' },
  langBtnActive: { background: '#0f172a', color: '#fff' },
}
