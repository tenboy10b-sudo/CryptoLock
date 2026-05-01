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
      ? `CryptoLock — independent Windows & security guides: BitLocker, GPO, CMD, PowerShell, and system administration.`
      : `CryptoLock — незалежний україномовний ресурс з покрокових гайдів по Windows, безпеці та адмініструванню ПК.`,
    publisher: { '@type': 'Organization', name: siteConfig.name, url: SITE },
    inLanguage: locale || 'uk',
  }

  return (
    <Layout
      title={isEn ? 'About' : 'Про нас'}
      description={isEn
        ? 'CryptoLock — independent Windows & security guides: BitLocker, GPO, CMD, PowerShell, and system administration.'
        : 'CryptoLock — незалежний україномовний ресурс з покрокових гайдів по Windows, безпеці та адмініструванню ПК.'}
      canonical={`${SITE}/about`}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div style={{ padding: '2.5rem 0 3rem' }}>
        <div className="container">
          {isEn ? (
            <>
              <h1 style={s.title}>About CryptoLock</h1>
              <div style={s.lead}>
                CryptoLock is an independent resource with step-by-step guides on Windows configuration,
                data security, and PC administration. Practical instructions only — no fluff.
              </div>
              <h2 style={s.h2}>What you'll find here</h2>
              <ul style={s.list}>
                <li>Step-by-step guides for Windows 10 and 11</li>
                <li>Security settings: BitLocker, Windows Defender, Firewall</li>
                <li>Group Policy (GPO) — from basics to advanced</li>
                <li>Command Prompt (CMD) and PowerShell for administrators</li>
                <li>System recovery, diagnostics, optimization</li>
                <li>Network settings: DNS, Wi-Fi, VPN, RDP</li>
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
                CryptoLock — незалежний україномовний ресурс з покрокових інструкцій по налаштуванню Windows,
                захисту даних та системному адмініструванню ПК.<br /><br />
                Всі матеріали написані практиками: тільки конкретні кроки, команди та пояснення що і навіщо — без зайвої теорії та «лийте воду».
              </div>
              <h2 style={s.h2}>Що ви знайдете тут</h2>
              <ul style={s.list}>
                <li>Покрокові гайди по Windows 10 і Windows 11</li>
                <li>Налаштування безпеки: BitLocker, Windows Defender, брандмауер</li>
                <li>Групова політика (GPO) — від базових до просунутих налаштувань</li>
                <li>Командний рядок (CMD) і PowerShell для адміністраторів</li>
                <li>Відновлення системи, діагностика, оптимізація</li>
                <li>Мережеві налаштування: DNS, Wi-Fi, VPN, RDP</li>
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
    color: '#0f172a',
    marginBottom: '1.5rem',
  },
  lead: {
    fontSize: '1rem',
    color: '#475569',
    lineHeight: 1.7,
    padding: '1.25rem 1.5rem',
    background: '#eff6ff',
    borderRadius: '0 10px 10px 0',
    borderLeft: '3px solid #2563eb',
    marginBottom: '2rem',
  },
  h2: {
    fontFamily: "'Unbounded', sans-serif",
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: '1rem',
    marginTop: '2rem',
  },
  list: {
    paddingLeft: '1.5rem',
    color: '#475569',
    lineHeight: 2,
    fontSize: '0.95rem',
  },
  p: {
    color: '#475569',
    lineHeight: 1.7,
    fontSize: '0.95rem',
  },
  link: {
    color: '#2563eb',
    fontWeight: 500,
  },
}
