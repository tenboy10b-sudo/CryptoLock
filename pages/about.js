import Layout from '../components/Layout'
import siteConfig from '../site.config'

const SITE = siteConfig.url

export default function About() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `Про нас — ${siteConfig.name}`,
    url: `${SITE}/about`,
    description: `CryptoLock — незалежний україномовний ресурс з покрокових гайдів по Windows, безпеці та адмініструванню ПК.`,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: SITE,
    },
    inLanguage: 'uk',
  }

  return (
    <Layout
      title="Про нас"
      description={`CryptoLock — незалежний україномовний ресурс з покрокових гайдів по Windows, безпеці та адмініструванню ПК.`}
      canonical={`${SITE}/about`}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div style={{ padding: '2.5rem 0 3rem' }}>
        <div className="container">
          <h1 style={styles.title}>Про нас</h1>
          <div className="prose">
            <p>
              <strong>{siteConfig.name}</strong> — незалежний україномовний ресурс з покрокових інструкцій
              по налаштуванню Windows, захисту даних та системному адмініструванню ПК.
            </p>
            <p>
              Всі матеріали написані практиками: тільки конкретні кроки, команди та пояснення що і навіщо —
              без зайвої теорії та «лийте воду».
            </p>
            <h2>Що ви знайдете тут</h2>
            <ul>
              <li>Покрокові гайди по Windows 10 і Windows 11</li>
              <li>Налаштування безпеки: BitLocker, Windows Defender, брандмауер</li>
              <li>Групова політика (GPO) — від базових до просунутих налаштувань</li>
              <li>Командний рядок (CMD) і PowerShell для адміністраторів</li>
              <li>Відновлення системи, діагностика, оптимізація</li>
              <li>Мережеві налаштування: DNS, Wi-Fi, VPN, RDP</li>
            </ul>
            <h2>Зворотній зв'язок</h2>
            <p>
              Знайшли помилку або хочете запропонувати тему?
              {siteConfig.social.telegram && (
                <> Пишіть у наш{' '}
                  <a href={siteConfig.social.telegram} target="_blank" rel="noopener noreferrer">
                    Telegram канал
                  </a>.
                </>
              )}
            </p>
            {siteConfig.social.tiktok && (
              <p>
                Короткі відеогайди дивіться на{' '}
                <a href={siteConfig.social.tiktok} target="_blank" rel="noopener noreferrer">
                  TikTok
                </a>.
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

const styles = {
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(1.5rem, 4vw, 1.75rem)',
    fontWeight: 700,
    marginBottom: '1.5rem',
    color: '#0f172a',
  },
}
