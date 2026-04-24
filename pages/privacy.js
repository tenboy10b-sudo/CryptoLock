import Layout from '../components/Layout'
import siteConfig from '../site.config'

const SITE = siteConfig.url

export default function Privacy() {
  const effectiveDate = '2026-04-01'

  return (
    <Layout
      title="Політика конфіденційності"
      description={`Політика конфіденційності сайту ${siteConfig.name} — що ми збираємо і як захищаємо ваші дані.`}
      canonical={`${SITE}/privacy`}
    >
      <div style={{ padding: '2.5rem 0 3rem' }}>
        <div className="container">
          <h1 style={styles.title}>Політика конфіденційності</h1>
          <div className="prose">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#94a3b8' }}>
              Дата набрання чинності: 1 квітня 2026 р.
            </p>

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
