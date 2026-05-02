import Layout from '../components/Layout'
import { useRouter } from 'next/router'
import siteConfig from '../site.config'

const SITE = siteConfig.url

export default function Privacy() {
  const { locale } = useRouter()
  const isEn = locale === 'en'

  const effectiveDateUk = '1 квітня 2026 р.'
  const effectiveDateEn = 'April 1, 2026'

  return (
    <Layout
      title={isEn ? 'Privacy Policy' : 'Політика конфіденційності'}
      description={isEn
        ? `Privacy Policy for ${siteConfig.name} — what we collect and how we protect your data.`
        : `Політика конфіденційності сайту ${siteConfig.name} — що ми збираємо і як захищаємо ваші дані.`
      }
      canonical={`${SITE}/privacy`}
    >
      <div style={{ padding: '2.5rem 0 3rem' }}>
        <div className="container">
          <h1 style={styles.title}>
            {isEn ? 'Privacy Policy' : 'Політика конфіденційності'}
          </h1>
          <div className="prose">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#94a3b8' }}>
              {isEn ? `Effective date: ${effectiveDateEn}` : `Дата набрання чинності: ${effectiveDateUk}`}
            </p>

            {isEn ? (
              <>
                <h2>1. Data Collection</h2>
                <p>
                  {siteConfig.name} does not collect personal data directly from users.
                  The site may use Google Analytics for anonymous usage statistics
                  and Google AdSense for displaying advertisements. Both services operate
                  under their own Google Privacy Policies.
                </p>

                <h2>2. Cookies</h2>
                <p>
                  Google Analytics and Google AdSense may use cookies to collect
                  anonymized visit data and display personalized ads.
                  You can disable cookies in your browser settings or use the{' '}
                  <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                    Google Analytics Opt-out
                  </a> extension.
                </p>

                <h2>3. External Links</h2>
                <p>
                  This site may contain links to external resources. We are not responsible
                  for the privacy practices of those sites.
                </p>

                <h2>4. Changes to This Policy</h2>
                <p>
                  We may update this page from time to time. We recommend checking it periodically.
                </p>

                <h2>5. Contact</h2>
                <p>
                  For privacy-related questions, contact us via{' '}
                  {siteConfig.social.telegram
                    ? <a href={siteConfig.social.telegram} target="_blank" rel="noopener noreferrer">Telegram</a>
                    : 'Telegram'
                  }.
                </p>
              </>
            ) : (
              <>
                <h2>1. Збір даних</h2>
                <p>
                  {siteConfig.name} не збирає персональні дані користувачів безпосередньо.
                  Сайт може використовувати Google Analytics для анонімної статистики відвідуваності
                  та Google AdSense для показу реклами. Обидва сервіси діють відповідно до власних
                  політик конфіденційності Google.
                </p>

                <h2>2. Файли cookie</h2>
                <p>
                  Google Analytics і Google AdSense можуть використовувати cookie для збору
                  анонімізованих даних про відвідування та показу персоналізованої реклами.
                  Ви можете відключити cookie у налаштуваннях браузера або скористатися
                  розширенням <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                    Google Analytics Opt-out
                  </a>.
                </p>

                <h2>3. Зовнішні посилання</h2>
                <p>
                  Сайт може містити посилання на зовнішні ресурси. Ми не несемо відповідальності
                  за політику конфіденційності цих сайтів.
                </p>

                <h2>4. Зміни до політики</h2>
                <p>
                  Ми можемо оновлювати цю сторінку. Рекомендуємо перевіряти її час від часу.
                </p>

                <h2>5. Контакти</h2>
                <p>
                  З питань конфіденційності звертайтесь до нас через{' '}
                  {siteConfig.social.telegram
                    ? <a href={siteConfig.social.telegram} target="_blank" rel="noopener noreferrer">Telegram</a>
                    : 'Telegram'
                  }.
                </p>
              </>
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
