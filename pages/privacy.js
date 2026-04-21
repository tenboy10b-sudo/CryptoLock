import Layout from '../components/Layout'
import siteConfig from '../site.config'

export default function Privacy() {
  return (
    <Layout title="Політика конфіденційності">
      <div style={{ padding: '2.5rem 0 3rem' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            Політика конфіденційності
          </h1>
          <div className="prose">
            <p>Дата набрання чинності: {new Date().toLocaleDateString('uk-UA')}</p>
            <h2>Збір даних</h2>
            <p>
              {siteConfig.name} не збирає персональні дані користувачів безпосередньо.
              Сайт може використовувати сторонні сервіси аналітики (Google Analytics)
              та рекламні мережі (Google AdSense), які можуть збирати анонімізовані дані
              відповідно до власних політик конфіденційності.
            </p>
            <h2>Файли cookie</h2>
            <p>
              Google AdSense та Google Analytics можуть використовувати файли cookie
              для показу релевантної реклами та збору статистики. Ви можете відключити
              cookie у налаштуваннях браузера.
            </p>
            <h2>Контакти</h2>
            <p>
              З питань конфіденційності зв'яжіться з нами через{' '}
              {siteConfig.social.telegram
                ? <a href={siteConfig.social.telegram}>Telegram</a>
                : 'контактну форму'
              }.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
