import Head from 'next/head'
import Link from 'next/link'
import siteConfig from '../site.config'

export default function Layout({ children, title, description, canonical }) {
  const pageTitle = title ? `${title} — ${siteConfig.name}` : siteConfig.name
  const pageDesc = description || siteConfig.description
  const pageUrl = canonical || siteConfig.url

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={pageUrl} />
        <meta name="google-site-verification" content="NkedD2H8r10fGABfYIJ8GgTERAKYoZzMhN693enehRw" />

        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={siteConfig.name} />

        {/* Twitter card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />

        {/* Language */}
        <meta httpEquiv="content-language" content={siteConfig.language} />
        <link rel="icon" href="/favicon.ico" />

        {/* Google AdSense — вставляється автоматично якщо є ID */}
        {siteConfig.adsenseId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteConfig.adsenseId}`}
            crossOrigin="anonymous"
          />
        )}

        {/* Google Analytics 4 */}
        {siteConfig.gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.gaId}`} />
            <script dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${siteConfig.gaId}');`
            }} />
          </>
        )}
      </Head>

      <header style={styles.header}>
        <div className="container" style={styles.nav}>
          <Link href="/" style={styles.logo}>
            {siteConfig.name.replace('.ua', '')}<span style={styles.logoAccent}>.ua</span>
          </Link>
          <nav style={styles.navLinks}>
            {siteConfig.nav.map((item) => (
              <Link key={item.href} href={item.href} style={styles.navLink}>
                {item.label}
              </Link>
            ))}
            {siteConfig.social.telegram && (
              <a href={siteConfig.social.telegram} target="_blank" rel="noopener noreferrer" style={styles.navLink}>
                Telegram
              </a>
            )}
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer style={styles.footer}>
        <div className="container" style={styles.footerInner}>
          <span style={styles.footerText}>© {new Date().getFullYear()} {siteConfig.name}</span>
          <div style={styles.footerLinks}>
            <Link href="/about" style={styles.footerLink}>Про нас</Link>
            <Link href="/privacy" style={styles.footerLink}>Конфіденційність</Link>
          </div>
        </div>
      </footer>
    </>
  )
}

const styles = {
  header: {
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: '1rem',
    letterSpacing: '-0.3px',
  },
  logoAccent: { color: 'var(--accent)' },
  navLinks: { display: 'flex', gap: '24px' },
  navLink: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    transition: 'color 0.15s',
  },
  footer: {
    borderTop: '1px solid var(--border)',
    marginTop: '4rem',
    padding: '1.5rem 0',
  },
  footerInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '0 20px',
  },
  footerText: { fontSize: '13px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' },
  footerLinks: { display: 'flex', gap: '16px' },
  footerLink: { fontSize: '13px', color: 'var(--text-faint)' },
}
