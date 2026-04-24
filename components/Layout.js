import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
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

const YouTubeIcon = () => (
  <svg width="19" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 00.5 6.19C0 8.04 0 12 0 12s0 3.96.5 5.81a3.02 3.02 0 002.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 002.12-2.14C24 15.96 24 12 24 12s0-3.96-.5-5.81zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/>
  </svg>
)

export default function Layout({ children, title, description, canonical, isArticle, ogImage }) {
  const pageTitle = title
    ? `${title} — ${siteConfig.name}`
    : `${siteConfig.name} — налаштування Windows та захист ПК українською`
  const pageDesc = description || siteConfig.description
  const pageUrl = canonical || SITE
  const ogImg = ogImage || `${SITE}/logo.png`
  const [menuOpen, setMenuOpen] = useState(false)

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

  // Закрити меню при кліку поза ним
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (!e.target.closest('header')) setMenuOpen(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [menuOpen])

  const socialLinks = [
    { key: 'telegram', icon: <TelegramIcon />, label: 'Telegram', cls: 'telegram' },
    { key: 'tiktok',   icon: <TikTokIcon />,   label: 'TikTok',   cls: 'tiktok'   },
    { key: 'youtube',  icon: <YouTubeIcon />,   label: 'YouTube',  cls: 'youtube'  },
  ].filter(s => siteConfig.social[s.key])

  // Organization + WebSite schema (лише на кожній сторінці)
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
      },
    ],
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="content-language" content="uk" />
        <link rel="canonical" href={pageUrl} />
        <link rel="alternate" hrefLang="uk" href={pageUrl} />
        <link rel="alternate" hrefLang="x-default" href={pageUrl} />

        {/* Robots */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

        {/* OG */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content={isArticle ? 'article' : 'website'} />
        <meta property="og:site_name" content={siteConfig.name} />
        <meta property="og:image" content={ogImg} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="uk_UA" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta name="twitter:image" content={ogImg} />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />

        {/* Organization + WebSite schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />

        {/* AdSense */}
        {siteConfig.adsenseId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteConfig.adsenseId}`}
            crossOrigin="anonymous"
          />
        )}

        {/* GA4 */}
        {siteConfig.gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.gaId}`} />
            <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${siteConfig.gaId}');` }} />
          </>
        )}
      </Head>

      {isArticle && <div id="read-progress" role="progressbar" aria-hidden="true" />}

      <header style={s.header}>
        <div className="container" style={s.navWrap}>
          {/* Логотип */}
          <Link href="/" style={s.logoWrap} aria-label={`${siteConfig.name} — на головну`}>
            <div style={s.logoImgWrap}>
              <Image
                src="/logo.png"
                alt={siteConfig.name}
                width={34}
                height={34}
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
            <span style={s.logoText}>Crypto<span style={s.logoAccent}>Lock</span></span>
          </Link>

          {/* Права частина: nav + divider + social + burger */}
          <div style={s.rightSide}>
            {/* Desktop nav — ховається через CSS клас */}
            <nav className="nav-desktop" aria-label="Головна навігація">
              {siteConfig.nav.map(item => (
                <Link key={item.href} href={item.href} style={s.navLink} className="nav-link">
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="nav-divider" aria-hidden="true" />

            {/* Соціальні кнопки — ховаються через CSS клас */}
            <div className="nav-social">
              {socialLinks.map(({ key, icon, label, cls }) => (
                <a
                  key={key}
                  href={siteConfig.social[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`social-btn ${cls}`}
                  style={s.socialBtn}
                  aria-label={label}
                  title={label}
                >
                  {icon}
                </a>
              ))}
            </div>

            {/* Бургер — показується через CSS клас */}
            <button
              className="nav-burger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Закрити меню' : 'Відкрити меню'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <span style={{ ...s.bl, ...(menuOpen ? s.bl1o : {}) }} />
              <span style={{ ...s.bl, ...(menuOpen ? s.bl2o : {}) }} />
              <span style={{ ...s.bl, ...(menuOpen ? s.bl3o : {}) }} />
            </button>
          </div>
        </div>

        {/* Мобільне меню */}
        {menuOpen && (
          <div id="mobile-menu" style={s.mobileMenu} role="navigation" aria-label="Мобільна навігація">
            {siteConfig.nav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                style={s.mobileLink}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div style={s.mobileSocial}>
              {socialLinks.map(({ key, icon, label }) => (
                <a
                  key={key}
                  href={siteConfig.social[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={s.mobileSocialBtn}
                  aria-label={label}
                >
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
            <Image src="/logo.png" alt={siteConfig.name} width={22} height={22} style={{ objectFit: 'contain' }} />
            <span style={s.footerName}>CryptoLock</span>
          </div>
          <nav style={s.footerLinks} aria-label="Навігація в підвалі">
            <Link href="/about" style={s.footerLink}>Про нас</Link>
            <Link href="/tags" style={s.footerLink}>Теги</Link>
            <Link href="/privacy" style={s.footerLink}>Конфіденційність</Link>
          </nav>
          <div style={s.footerSocial}>
            {socialLinks.map(({ key, icon, label }) => (
              <a
                key={key}
                href={siteConfig.social[key]}
                target="_blank"
                rel="noopener noreferrer"
                style={s.footerSocialBtn}
                aria-label={label}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
        <div style={s.footerCopy}>
          <div className="container">
            <p style={s.footerCopyText}>
              © {new Date().getFullYear()} CryptoLock. Всі матеріали українською мовою.
            </p>
          </div>
        </div>
      </footer>

      <button
        id="back-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Прокрутити нагору"
      >
        ↑
      </button>
    </>
  )
}

const s = {
  header: {
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  navWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '62px',
    width: '100%',
    padding: '0 20px',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoImgWrap: {
    width: '34px',
    height: '34px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: "'Unbounded',sans-serif",
    fontWeight: 700,
    fontSize: '1rem',
    letterSpacing: '-0.5px',
    color: '#0f172a',
  },
  logoAccent: { color: '#2563eb' },
  rightSide: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    minWidth: 0,
  },
  navLink: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#475569',
    padding: '6px 10px',
    borderRadius: '8px',
    transition: 'color .15s, background .15s',
    whiteSpace: 'nowrap',
  },
  socialBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    transition: 'color .15s, border-color .15s, background .15s',
    flexShrink: 0,
    cursor: 'pointer',
  },
  bl: {
    display: 'block',
    width: '20px',
    height: '2px',
    background: '#334155',
    borderRadius: '2px',
    transition: 'transform .2s, opacity .2s',
  },
  bl1o: { transform: 'rotate(45deg) translate(5px,5px)' },
  bl2o: { opacity: 0 },
  bl3o: { transform: 'rotate(-45deg) translate(5px,-5px)' },
  mobileMenu: {
    borderTop: '1px solid #e2e8f0',
    background: '#fff',
    padding: '4px 0 8px',
  },
  mobileLink: {
    display: 'block',
    padding: '11px 20px',
    fontSize: '15px',
    fontWeight: 500,
    color: '#0f172a',
    borderBottom: '1px solid #f1f5f9',
  },
  mobileSocial: {
    display: 'flex',
    gap: '8px',
    padding: '12px 20px 4px',
    flexWrap: 'wrap',
  },
  mobileSocialBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#475569',
    padding: '7px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    background: '#f8fafc',
  },
  footer: {
    borderTop: '1px solid #e2e8f0',
    background: '#fff',
    marginTop: '4rem',
  },
  footerInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    padding: '1.25rem 20px',
  },
  footerLogo: { display: 'flex', alignItems: 'center', gap: '8px' },
  footerName: {
    fontFamily: "'Unbounded',sans-serif",
    fontSize: '13px',
    fontWeight: 600,
    color: '#0f172a',
  },
  footerLinks: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  footerLink: { fontSize: '13px', color: '#94a3b8', transition: 'color .15s' },
  footerSocial: { display: 'flex', gap: '8px' },
  footerSocialBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    color: '#94a3b8',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
  },
  footerCopy: {
    borderTop: '1px solid #f1f5f9',
    padding: '.75rem 0',
  },
  footerCopyText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '11px',
    color: '#cbd5e1',
    textAlign: 'center',
  },
}
