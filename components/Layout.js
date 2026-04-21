import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import siteConfig from '../site.config'

const TelegramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.93 6.77l-1.68 7.93c-.12.56-.46.7-.93.43l-2.57-1.9-1.24 1.19c-.14.14-.25.25-.51.25l.18-2.6 4.72-4.27c.2-.18-.05-.28-.32-.1L7.47 14.73 4.93 13.97c-.55-.17-.56-.55.13-.82l9.67-3.73c.46-.17.86.11.7.82l.47-.52z" fill="currentColor"/>
  </svg>
)

const TikTokIcon = () => (
  <svg width="16" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.15 8.15 0 004.78 1.54V6.78a4.85 4.85 0 01-1.01-.09z" fill="currentColor"/>
  </svg>
)

export default function Layout({ children, title, description, canonical, isArticle }) {
  const pageTitle = title ? `${title} — ${siteConfig.name}` : `${siteConfig.name} — захист і налаштування ПК`
  const pageDesc = description || siteConfig.description
  const pageUrl = canonical || siteConfig.url
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
        <meta property="og:image" content={`${siteConfig.url}/logo.jpg`} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <meta httpEquiv="content-language" content="uk" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
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
        <div className="container" style={s.navWrap}>
          {/* Logo */}
          <Link href="/" style={s.logoWrap}>
            <div style={s.logoImgWrap}>
              <Image src="/logo.jpg" alt="CryptoLock" width={34} height={34} style={{ objectFit: 'contain', borderRadius: '7px' }} />
            </div>
            <span style={s.logoText}>
              Crypto<span style={s.logoAccent}>Lock</span>
            </span>
          </Link>

          {/* Right side: nav + social */}
          <div style={s.rightSide}>
            {/* Desktop nav links */}
            <nav style={s.navLinks}>
              {siteConfig.nav.map(item => (
                <Link key={item.href} href={item.href} style={s.navLink}>{item.label}</Link>
              ))}
            </nav>

            {/* Divider */}
            <div style={s.divider} />

            {/* Social icons */}
            <div style={s.socialRow}>
              {siteConfig.social.telegram && (
                <a href={siteConfig.social.telegram} target="_blank" rel="noopener noreferrer" style={s.socialBtn} title="Telegram" aria-label="Telegram канал">
                  <TelegramIcon />
                </a>
              )}
              {siteConfig.social.tiktok && (
                <a href={siteConfig.social.tiktok} target="_blank" rel="noopener noreferrer" style={s.socialBtn} title="TikTok" aria-label="TikTok канал">
                  <TikTokIcon />
                </a>
              )}
            </div>

            {/* Mobile burger */}
            <button style={s.burger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Меню">
              <span style={{ ...s.bl, ...(menuOpen ? s.bl1o : {}) }} />
              <span style={{ ...s.bl, ...(menuOpen ? s.bl2o : {}) }} />
              <span style={{ ...s.bl, ...(menuOpen ? s.bl3o : {}) }} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={s.mobileMenu}>
            {siteConfig.nav.map(item => (
              <Link key={item.href} href={item.href} style={s.mobileLink} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
            <div style={s.mobileSocial}>
              {siteConfig.social.telegram && (
                <a href={siteConfig.social.telegram} target="_blank" rel="noopener noreferrer" style={s.mobileSocialBtn}>
                  <TelegramIcon /> Telegram
                </a>
              )}
              {siteConfig.social.tiktok && (
                <a href={siteConfig.social.tiktok} target="_blank" rel="noopener noreferrer" style={s.mobileSocialBtn}>
                  <TikTokIcon /> TikTok
                </a>
              )}
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
            <Image src="/logo.jpg" alt="CryptoLock" width={22} height={22} style={{ objectFit: 'contain', borderRadius: '5px' }} />
            <span style={s.footerName}>CryptoLock</span>
          </div>
          <div style={s.footerLinks}>
            <Link href="/about" style={s.footerLink}>Про нас</Link>
            <Link href="/tags" style={s.footerLink}>Теги</Link>
            <Link href="/privacy" style={s.footerLink}>Конфіденційність</Link>
          </div>
          <div style={s.footerSocial}>
            {siteConfig.social.telegram && (
              <a href={siteConfig.social.telegram} target="_blank" rel="noopener noreferrer" style={s.footerSocialBtn} aria-label="Telegram">
                <TelegramIcon />
              </a>
            )}
            {siteConfig.social.tiktok && (
              <a href={siteConfig.social.tiktok} target="_blank" rel="noopener noreferrer" style={s.footerSocialBtn} aria-label="TikTok">
                <TikTokIcon />
              </a>
            )}
          </div>
        </div>
      </footer>

      <button id="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Нагору">↑</button>
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
  logoWrap: { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 },
  logoImgWrap: { width: '34px', height: '34px', borderRadius: '7px', overflow: 'hidden', flexShrink: 0, border: '1px solid #e2e8f0' },
  logoText: { fontFamily: "'Unbounded',sans-serif", fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.5px', color: '#0f172a' },
  logoAccent: { color: '#2563eb' },

  rightSide: { display: 'flex', alignItems: 'center', gap: '4px' },

  navLinks: { display: 'flex', gap: '4px', alignItems: 'center' },
  navLink: { fontSize: '14px', fontWeight: 500, color: '#475569', padding: '6px 10px', borderRadius: '8px', transition: 'color .15s, background .15s' },

  divider: { width: '1px', height: '20px', background: '#e2e8f0', margin: '0 8px' },

  socialRow: { display: 'flex', alignItems: 'center', gap: '4px' },
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
    transition: 'color .15s, background .15s, border-color .15s',
    flexShrink: 0,
  },

  burger: { display: 'none', flexDirection: 'column', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', marginLeft: '4px' },
  bl: { display: 'block', width: '20px', height: '2px', background: '#334155', borderRadius: '2px', transition: 'transform .2s, opacity .2s' },
  bl1o: { transform: 'rotate(45deg) translate(5px,5px)' },
  bl2o: { opacity: 0 },
  bl3o: { transform: 'rotate(-45deg) translate(5px,-5px)' },

  mobileMenu: { borderTop: '1px solid #e2e8f0', background: '#fff', padding: '4px 0 8px' },
  mobileLink: { display: 'block', padding: '11px 20px', fontSize: '15px', fontWeight: 500, color: '#0f172a', borderBottom: '1px solid #f1f5f9' },
  mobileSocial: { display: 'flex', gap: '8px', padding: '12px 20px 4px' },
  mobileSocialBtn: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: '#475569', padding: '7px 14px', border: '1px solid #e2e8f0', borderRadius: '20px', background: '#f8fafc' },

  footer: { borderTop: '1px solid #e2e8f0', background: '#fff', marginTop: '4rem' },
  footerInner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '1.25rem 20px' },
  footerLogo: { display: 'flex', alignItems: 'center', gap: '8px' },
  footerName: { fontFamily: "'Unbounded',sans-serif", fontSize: '13px', fontWeight: 600, color: '#0f172a' },
  footerLinks: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  footerLink: { fontSize: '13px', color: '#94a3b8' },
  footerSocial: { display: 'flex', gap: '8px' },
  footerSocialBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', color: '#94a3b8', border: '1px solid #e2e8f0', background: '#f8fafc', transition: 'color .15s, border-color .15s' },
}
