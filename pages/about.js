import Layout from '../components/Layout'
import siteConfig from '../site.config'

export default function About() {
  return (
    <Layout title="Про нас">
      <div style={{ padding: '2.5rem 0 3rem' }}>
        <div className="container">
          <h1 style={styles.title}>Про нас</h1>
          <div className="prose">
            <p>
              <strong>{siteConfig.name}</strong> — це сайт з покроковими гайдами по налаштуванню Windows,
              оптимізації ПК та комп'ютерній безпеці. Всі матеріали написані українською мовою.
            </p>
            <p>
              Ми пишемо практичні інструкції без зайвої теорії — тільки конкретні кроки,
              команди та пояснення що і навіщо.
            </p>
            {siteConfig.social.telegram && (
              <p>
                Слідкуй за новими статтями в нашому{' '}
                <a href={siteConfig.social.telegram} target="_blank" rel="noopener noreferrer">
                  Telegram каналі
                </a>
                .
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
    fontSize: '1.75rem',
    fontWeight: 700,
    marginBottom: '1.5rem',
  },
}
