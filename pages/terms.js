import Layout from '../components/Layout'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import siteConfig from '../site.config'

const SITE = siteConfig.url

export default function Terms() {
  const { locale } = useRouter()
  const [mounted, setMounted] = useState(false)
  const isEn = mounted ? locale === 'en' : false
  useEffect(() => { setMounted(true) }, [])

  const effectiveDateUk = '24 вересня 2026 р.'
  const effectiveDateEn = 'September 24, 2026'

  return (
    <Layout
      title={isEn ? 'Terms of Service' : 'Умови використання'}
      description={isEn
        ? `Terms of Service for ${siteConfig.name} — practical Windows guides, security content and free tools.`
        : `Умови використання сайту ${siteConfig.name} — практичні гайди з Windows, безпеки та безкоштовні інструменти.`
      }
      canonical={`${SITE}/terms`}
    >
      <div style={{ padding: '2.5rem 0 3rem' }}>
        <div className="container">
          <h1 style={styles.title}>
            {isEn ? 'Terms of Service' : 'Умови використання'}
          </h1>
          <div className="prose">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--faint,#94a3b8)' }}>
              {isEn ? `Last updated: ${effectiveDateEn}` : `Останнє оновлення: ${effectiveDateUk}`}
            </p>

            {isEn ? (
              <>
                <h2>1. About the Service</h2>
                <p>
                  {siteConfig.name} ({SITE}) publishes practical Windows troubleshooting guides,
                  system administration and security content, and free browser-based tools
                  (password generator, subnet calculator, hash calculator and similar utilities).
                  The service is provided free of charge and does not require an account or login.
                </p>

                <h2>2. Informational Use Only</h2>
                <p>
                  All content on this site — articles, guides, commands, scripts and tool output —
                  is provided for general informational and educational purposes only. It is not
                  professional IT, security or legal advice for your specific situation.
                </p>

                <h2>3. Your Responsibility</h2>
                <p>
                  Commands, scripts and configuration steps described on this site can change your
                  operating system, network or security settings. Before applying any step, verify
                  it is appropriate for your system and situation, and keep backups of important
                  data where relevant. You are responsible for actions you take on your own devices.
                </p>

                <h2>4. No Warranty</h2>
                <p>
                  Content and tools on this site are provided &quot;as is&quot;, without warranties of any
                  kind. We do not guarantee that the site, its content or its tools will be
                  uninterrupted, error-free, or suitable for any particular purpose.
                </p>

                <h2>5. Acceptable Use</h2>
                <p>
                  You agree not to misuse the site — including attempting to disrupt its operation,
                  scraping content at abusive volume, or using it for unlawful purposes.
                </p>

                <h2>6. Intellectual Property</h2>
                <p>
                  Articles, guides and original graphics published on this site are the property of{' '}
                  {siteConfig.name} unless stated otherwise. You may reference and link to our content;
                  please credit the source when quoting it elsewhere.
                </p>

                <h2>7. Third-Party Services</h2>
                <p>
                  Some pages, links or embedded tools may depend on external providers (for example
                  Google Analytics, Telegram, or software vendors referenced in guides). We do not
                  control those third-party services and are not responsible for their availability
                  or content.
                </p>

                <h2>8. Limitation of Liability</h2>
                <p>
                  To the fullest extent permitted by law, {siteConfig.name} is not liable for any
                  direct or indirect damages, data loss, or system issues arising from your use of
                  this site&apos;s content or tools.
                </p>

                <h2>9. Changes to the Service and These Terms</h2>
                <p>
                  We may update the site&apos;s content, tools and these Terms from time to time. Continued
                  use of the site after changes means you accept the current version of these Terms.
                </p>

                <h2>10. Contact</h2>
                <p>
                  Questions about these Terms can be sent via{' '}
                  {siteConfig.social.telegram
                    ? <a href={siteConfig.social.telegram} target="_blank" rel="noopener noreferrer">Telegram</a>
                    : 'Telegram'
                  }.
                </p>

                <h2>11. Related Documents</h2>
                <p>
                  See also our <a href="/privacy">Privacy Policy</a> for information about data
                  handling on this site.
                </p>
              </>
            ) : (
              <>
                <h2>1. Про сервіс</h2>
                <p>
                  {siteConfig.name} ({SITE}) публікує практичні гайди з усунення несправностей
                  Windows, контент з адміністрування та безпеки систем, а також безкоштовні
                  інструменти у браузері (генератор паролів, калькулятор підмереж, калькулятор
                  хешів та подібні утиліти). Сервіс надається безкоштовно і не потребує реєстрації
                  чи входу в акаунт.
                </p>

                <h2>2. Інформаційний характер</h2>
                <p>
                  Весь контент на сайті — статті, гайди, команди, скрипти та результати роботи
                  інструментів — надається виключно в загальних інформаційних та освітніх цілях.
                  Це не є професійною ІТ-консультацією, консультацією з безпеки чи юридичною
                  порадою для вашої конкретної ситуації.
                </p>

                <h2>3. Відповідальність користувача</h2>
                <p>
                  Команди, скрипти та кроки з налаштування, описані на сайті, можуть змінювати
                  операційну систему, мережеві або безпекові налаштування вашого пристрою. Перед
                  застосуванням будь-якого кроку перевіряйте, чи він підходить саме для вашої
                  системи та ситуації, і за потреби робіть резервні копії важливих даних. Ви несете
                  відповідальність за дії, які виконуєте на власних пристроях.
                </p>

                <h2>4. Відсутність гарантій</h2>
                <p>
                  Контент і інструменти на сайті надаються &laquo;як є&raquo;, без будь-яких гарантій.
                  Ми не гарантуємо безперебійну чи безпомилкову роботу сайту, його контенту чи
                  інструментів, а також їх придатність для якоїсь конкретної мети.
                </p>

                <h2>5. Належне використання</h2>
                <p>
                  Ви погоджуєтесь не зловживати сайтом — зокрема не намагатися порушити його
                  роботу, не збирати контент у надмірних обсягах (скрейпінг) та не використовувати
                  сайт у протиправних цілях.
                </p>

                <h2>6. Інтелектуальна власність</h2>
                <p>
                  Статті, гайди та оригінальна графіка, опубліковані на сайті, є власністю{' '}
                  {siteConfig.name}, якщо не вказано інше. Ви можете посилатися на наш контент;
                  будь ласка, вказуйте джерело при цитуванні в інших місцях.
                </p>

                <h2>7. Сторонні сервіси</h2>
                <p>
                  Деякі сторінки, посилання чи вбудовані інструменти можуть залежати від зовнішніх
                  постачальників (наприклад, Google Analytics, Telegram, або постачальники ПЗ,
                  згадані в гайдах). Ми не контролюємо ці сторонні сервіси і не несемо
                  відповідальності за їх доступність чи вміст.
                </p>

                <h2>8. Обмеження відповідальності</h2>
                <p>
                  У межах, дозволених законодавством, {siteConfig.name} не несе відповідальності
                  за будь-які прямі чи непрямі збитки, втрату даних або проблеми з системою,
                  що виникли внаслідок використання контенту чи інструментів цього сайту.
                </p>

                <h2>9. Зміни до сервісу та цих умов</h2>
                <p>
                  Ми можемо час від часу оновлювати контент сайту, інструменти та ці Умови.
                  Продовження використання сайту після змін означає прийняття вами чинної версії
                  Умов.
                </p>

                <h2>10. Контакти</h2>
                <p>
                  Питання щодо цих Умов можна надсилати через{' '}
                  {siteConfig.social.telegram
                    ? <a href={siteConfig.social.telegram} target="_blank" rel="noopener noreferrer">Telegram</a>
                    : 'Telegram'
                  }.
                </p>

                <h2>11. Пов'язані документи</h2>
                <p>
                  Див. також нашу <a href="/privacy">Політику конфіденційності</a> — інформацію
                  про обробку даних на цьому сайті.
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
    color: 'var(--text,#0f172a)',
  },
}
