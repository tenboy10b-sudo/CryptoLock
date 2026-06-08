import Layout from '../components/Layout'
import Link from 'next/link'
import siteConfig from '../site.config'
import { useRouter } from 'next/router'

const SITE = siteConfig.url

const POPULAR = [
  { href: '/yak-pidklyuchyty-dva-monitory-windows',             label: 'Як підключити два монітори' },
  { href: '/yak-nalashtuvanty-virtualnyi-stol-windows',         label: 'Віртуальні робочі столи' },
  { href: '/zaborona-zapusku-prohram-gpo',                      label: 'Заборона запуску програм GPO' },
  { href: '/obmezhennya-kilkosti-sprob-parolyu',                label: 'Обмеження спроб пароля' },
  { href: '/tools/windows-error-decoder',                       label: '🔍 Декодер помилок Windows' },
  { href: '/tools/powershell-commands',                         label: '⚡ PowerShell довідник' },
  { href: '/tools/password-generator',                          label: '🔑 Генератор паролів' },
]

export default function NotFound() {
  const { locale } = useRouter()
  const isEn = locale === 'en'

  return (
    <Layout
      title={isEn ? "Page not found — CryptoLock" : "Сторінку не знайдено — CryptoLock"}
      description={isEn
        ? "The page you're looking for doesn't exist. Browse our Windows guides and security tools."
        : "Сторінку не знайдено. Перегляньте наші гайди з Windows та інструменти безпеки."}
      canonical={`${SITE}/404`}
      noindex
    >
      <div style={s.wrap}>
        <div className="container" style={s.inner}>

          <div style={s.code}>404</div>
          <h1 style={s.title}>
            {isEn ? "Page not found" : "Сторінку не знайдено"}
          </h1>
          <p style={s.sub}>
            {isEn
              ? "The page may have been moved or deleted. Here are some popular pages:"
              : "Можливо сторінку перемістили або видалили. Ось популярні розділи:"}
          </p>

          <div style={s.links}>
            {POPULAR.map(({ href, label }) => (
              <Link key={href} href={href} style={s.link}>{label}</Link>
            ))}
          </div>

          <div style={s.actions}>
            <Link href="/" style={s.btnPrimary}>
              {isEn ? "← All articles" : "← Всі статті"}
            </Link>
            <Link href="/tools" style={s.btnSecondary}>
              {isEn ? "Tools" : "Інструменти"}
            </Link>
          </div>

        </div>
      </div>
    </Layout>
  )
}

const s = {
  wrap: {
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    padding: '3rem 0',
  },
  inner: {
    textAlign: 'center',
    maxWidth: '560px',
    margin: '0 auto',
  },
  code: {
    fontFamily: "'Unbounded', sans-serif",
    fontSize: 'clamp(4rem, 15vw, 8rem)',
    fontWeight: 900,
    color: '#e2e8f0',
    lineHeight: 1,
    marginBottom: '1rem',
    letterSpacing: '-4px',
  },
  title: {
    fontFamily: "'Unbounded', sans-serif",
    fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
    fontWeight: 700,
    color: 'var(--text,#0f172a)',
    marginBottom: '0.75rem',
  },
  sub: {
    color: 'var(--muted,#64748b)',
    fontSize: '0.95rem',
    lineHeight: 1.6,
    marginBottom: '2rem',
  },
  links: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '2rem',
    textAlign: 'left',
    background: 'var(--bg,#f8fafc)',
    border: '1px solid var(--border,#e2e8f0)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  link: {
    color: '#2563eb',
    fontSize: '0.9rem',
    textDecoration: 'none',
    fontWeight: 500,
    padding: '4px 0',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    display: 'inline-block',
    background: '#2563eb',
    color: '#fff',
    padding: '10px 24px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.875rem',
    textDecoration: 'none',
  },
  btnSecondary: {
    display: 'inline-block',
    background: 'var(--bg,#f1f5f9)',
    color: 'var(--text,#0f172a)',
    padding: '10px 24px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.875rem',
    textDecoration: 'none',
    border: '1px solid var(--border,#e2e8f0)',
  },
}
