import Layout from '../components/Layout'
import siteConfig from '../site.config'
import { useRouter } from 'next/router'

const SITE = siteConfig.url

export default function About() {
  const { locale } = useRouter()
  const isEn = locale === 'en'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: isEn ? `About — ${siteConfig.name}` : `Про нас — ${siteConfig.name}`,
    url: `${SITE}/about`,
    description: isEn
      ? `CryptoLock — Windows guides, security, developer tools and software reviews. BitLocker, GPO, PowerShell, Git, VirtualBox.`
      : `CryptoLock — гайди Windows, безпека, інструменти розробника та огляди ПЗ. BitLocker, GPO, PowerShell, Git, VirtualBox.`,
    publisher: { '@type': 'Organization', name: siteConfig.name, url: SITE },
    inLanguage: locale || 'uk',
  }

  return (
    <Layout
      title={isEn ? 'About CryptoLock — Windows, Security & Developer Tools' : 'Про CryptoLock — Windows, безпека та інструменти розробника'}
      description={isEn
        ? 'CryptoLock — practical Windows guides, security settings and developer tools. Git, VirtualBox, PowerShell, BitLocker, GPO — step by step.'
        : 'CryptoLock — практичні гайди Windows, налаштування безпеки та інструменти розробника. Git, VirtualBox, PowerShell, BitLocker, GPO — покроково.'}
      canonical={`${SITE}/about`}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div style={{ padding: '2.5rem 0 3rem' }}>
        <div className="container">
          {isEn ? (
            <>
              <h1 style={s.title}>About CryptoLock</h1>
              <div style={s.lead}>
                CryptoLock is an independent resource for those who work with Windows and want to understand how it really works.<br /><br />
                Step-by-step guides, PowerShell and CMD commands, security settings, developer tools — practical content only, no fluff.
              </div>
              <h2 style={s.h2}>What you'll find here</h2>
              <ul style={s.list}>
                <li>Step-by-step guides for Windows 10 and 11</li>
                <li>Security: BitLocker, Windows Defender, Firewall, UAC</li>
                <li>Group Policy (GPO) and command line for administrators</li>
                <li>PowerShell — automation and administration</li>
                <li>Network settings: DNS, Wi-Fi, VPN, RDP</li>
                <li>System recovery, diagnostics, optimization</li>
                <li>Developer tools: Git, GitHub, VirtualBox, WSL</li>
                <li>Software: installation, configuration, troubleshooting</li>
                <li>Online tools: port checker, IP info, Base64, hash generator, regex</li>
              </ul>
              <h2 style={s.h2}>Feedback</h2>
              <p style={s.p}>
                Found an error or want to suggest a topic? Write to our{' '}
                <a href={siteConfig.social.telegram} style={s.link}>Telegram channel</a>.
                Short video guides on{' '}
                <a href={siteConfig.social.tiktok} style={s.link}>TikTok</a>.
              </p>
            </>
          ) : (
            <>
              <h1 style={s.title}>Про нас</h1>
              <div style={s.lead}>
                CryptoLock — незалежний україномовний ресурс для тих хто працює з Windows і хоче розібратись як все влаштовано зсередини.<br /><br />
                Покрокові інструкції, команди PowerShell і CMD, налаштування безпеки, огляди інструментів — тільки конкретика без зайвої води.
              </div>
              <h2 style={s.h2}>Що ви знайдете тут</h2>
              <ul style={s.list}>
                <li>Покрокові гайди по Windows 10 і Windows 11</li>
                <li>Безпека: BitLocker, Windows Defender, брандмауер, UAC</li>
                <li>Групова політика (GPO) і командний рядок для адміністраторів</li>
                <li>PowerShell — автоматизація і адміністрування</li>
                <li>Мережеві налаштування: DNS, Wi-Fi, VPN, RDP</li>
                <li>Відновлення системи, діагностика, оптимізація</li>
                <li>Інструменти розробника: Git, GitHub, VirtualBox, WSL</li>
                <li>Програмне забезпечення: встановлення, налаштування, вирішення проблем</li>
                <li>Онлайн-інструменти: перевірка портів, IP info, Base64, хеші, regex</li>
              </ul>
              <h2 style={s.h2}>Зворотній зв'язок</h2>
              <p style={s.p}>
                Знайшли помилку або хочете запропонувати тему? Пишіть у наш{' '}
                <a href={siteConfig.social.telegram} style={s.link}>Telegram канал</a>.
                Короткі відеогайди дивіться на{' '}
                <a href={siteConfig.social.tiktok} style={s.link}>TikTok</a>.
              </p>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}

const s = {
  title: {
    fontFamily: "'Unbounded', sans-serif",
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    fontWeight: 700,
    color: 'var(--text,#0f172a)',
    marginBottom: '1.5rem',
  },
  lead: {
    fontSize: '1rem',
    color: 'var(--muted,#475569)',
    lineHeight: 1.7,
    padding: '1.25rem 1.5rem',
    background: 'var(--accent-light,#eff6ff)',
    borderRadius: '0 10px 10px 0',
    borderLeft: '3px solid var(--accent,#2563eb)',
    marginBottom: '2rem',
  },
  h2: {
    fontFamily: "'Unbounded', sans-serif",
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text,#0f172a)',
    marginBottom: '1rem',
    marginTop: '2rem',
  },
  list: {
    paddingLeft: '1.5rem',
    color: 'var(--muted,#475569)',
    lineHeight: 2,
    fontSize: '0.95rem',
  },
  p: {
    color: 'var(--muted,#475569)',
    lineHeight: 1.7,
    fontSize: '0.95rem',
  },
  link: {
    color: '#2563eb',
    fontWeight: 500,
  },
}
