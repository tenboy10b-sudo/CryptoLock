import Layout from '../../components/Layout'
import Link from 'next/link'
import siteConfig from '../../site.config'

const SITE = siteConfig.url
const BOT_LINK = 'https://t.me/AuditShield_01_Bot'

const modules = [
  'USB-пристрої та знімні носії',
  'Мережеві підключення і відкриті порти',
  'Запущені процеси і служби',
  'Браузери і збережені паролі',
  'Автозавантаження програм',
  'Спільний доступ до файлів і папок',
  'Налаштування брандмауера',
  'Windows Defender і антивірус',
  'BitLocker і шифрування дисків',
  'Облікові записи і права адміністратора',
  'Журнали подій і підозрілі входи',
  'Встановлені програми і дати',
  'Оновлення Windows',
  'Політики паролів',
  'RDP і віддалений доступ',
  'Telemetry і збір даних',
  'Scheduled tasks і планувальник',
  'Витоки файлів і тимчасові дані',
  'DNS і мережеві налаштування',
  'Реєстр — підозрілі ключі',
  'Сертифікати і довірені видавці',
  'Загальна оцінка ризику (0–100)',
]

const plans = [
  { name: 'Старт', runs: 3, price: '$9', usdt: true, mono: true },
  { name: 'Базовий', runs: 5, price: '$13', usdt: true, mono: true, highlight: true },
  { name: 'Про', runs: 10, price: '$22', usdt: true, mono: true },
]

export default function AuditShield() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AuditShield — Windows Security Audit Tool',
    description: 'Програма яка аналізує Windows ПК по 22 напрямках і видає детальний HTML-звіт з оцінкою ризику.',
    url: `${SITE}/tools/auditshield`,
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Windows',
    offers: [
      { '@type': 'Offer', name: 'Старт', price: '9', priceCurrency: 'USD' },
      { '@type': 'Offer', name: 'Базовий', price: '13', priceCurrency: 'USD' },
      { '@type': 'Offer', name: 'Про', price: '22', priceCurrency: 'USD' },
    ],
    publisher: { '@type': 'Organization', name: siteConfig.name, url: SITE },
    inLanguage: 'uk',
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Головна', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Інструменти', item: `${SITE}/tools` },
      { '@type': 'ListItem', position: 3, name: 'AuditShield', item: `${SITE}/tools/auditshield` },
    ],
  }

  return (
    <Layout
      title="AuditShield — Аудит безпеки Windows ПК за 10 хвилин"
      description="Перевіряє Windows ПК по 22 напрямках: USB, мережа, процеси, браузери, витоки даних. HTML-звіт з оцінкою ризику. Нічого не встановлюється. Безкоштовне демо."
      canonical={`${SITE}/tools/auditshield`}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div style={{ padding: '2rem 0 4rem' }}>
        <div className="container">

          {/* Breadcrumb */}
          <nav style={s.bc}>
            <Link href="/" style={s.bcLink}>Головна</Link>
            <span style={s.bcSep}>/</span>
            <Link href="/tools" style={s.bcLink}>Інструменти</Link>
            <span style={s.bcSep}>/</span>
            <span style={{ ...s.bcLink, color: '#64748b' }}>AuditShield</span>
          </nav>

          {/* Hero */}
          <div style={s.hero}>
            <div style={s.heroIcon}>🛡️</div>
            <div>
              <div style={s.heroBadge}>Безкоштовне демо · 4 модулі</div>
              <h1 style={s.heroTitle}>AuditShield</h1>
              <p style={s.heroSub}>Windows Security Audit Tool</p>
              <p style={s.heroDesc}>
                Аналізує Windows ПК по <strong>22 напрямках</strong> і видає детальний HTML-звіт
                з оцінкою ризику за <strong>10 хвилин</strong>. Нічого не встановлюється і не змінюється в системі.
              </p>
              <div style={s.heroActions}>
                <a href={BOT_LINK} target="_blank" rel="noopener noreferrer" style={s.btnPrimary}>
                  Спробувати безкоштовно →
                </a>
                <span style={s.heroNote}>Демо одразу в Telegram боті</span>
              </div>
            </div>
          </div>

          {/* For whom */}
          <section style={s.section}>
            <h2 style={s.h2}>Для кого</h2>
            <div style={s.forWhomGrid}>
              {[
                { icon: '🏢', title: 'Бізнес і ФОП', desc: 'Перевірте чи не зливають дані з корпоративного ПК. Звіт для керівника або аудитора.' },
                { icon: '👩‍💼', title: 'HR і менеджери', desc: 'Переконайтесь що на робочому ноутбуці немає зайвих програм, USB-пристроїв і відкритих доступів.' },
                { icon: '🔧', title: 'IT-спеціалісти', desc: 'Швидкий аудит перед здачею ПК або після інциденту. Зрозумілий HTML-звіт замість ручних перевірок.' },
                { icon: '👤', title: 'Особисте використання', desc: 'Хочеш знати що відбувається на твоєму ПК? Перевір за 10 хвилин.' },
              ].map(item => (
                <div key={item.title} style={s.forWhomCard}>
                  <div style={s.forWhomIcon}>{item.icon}</div>
                  <div>
                    <p style={s.forWhomTitle}>{item.title}</p>
                    <p style={s.forWhomDesc}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Advantages */}
          <section style={s.section}>
            <h2 style={s.h2}>Переваги</h2>
            <div style={s.advGrid}>
              {[
                { icon: '🔍', text: '22 модулі перевірки — від USB до реєстру' },
                { icon: '🚫', text: 'Нічого не встановлюється і не змінюється в системі' },
                { icon: '💾', text: 'Звіт зберігається тільки локально на вашому ПК' },
                { icon: '⚡', text: 'Результат за 10 хвилин у зрозумілому HTML форматі' },
                { icon: '🎁', text: 'Безкоштовне демо на 4 модулі — одразу в боті' },
                { icon: '🔒', text: 'Жодних даних не передається назовні' },
              ].map(item => (
                <div key={item.text} style={s.advItem}>
                  <span style={s.advIcon}>{item.icon}</span>
                  <span style={s.advText}>{item.text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 22 modules */}
          <section style={s.section}>
            <h2 style={s.h2}>22 модулі перевірки</h2>
            <div style={s.modulesGrid}>
              {modules.map((mod, i) => (
                <div key={i} style={s.moduleItem}>
                  <span style={s.moduleNum}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={s.moduleText}>{mod}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section style={s.section}>
            <h2 style={s.h2}>Ціни</h2>
            <div style={s.plansGrid}>
              {plans.map(plan => (
                <div key={plan.name} style={plan.highlight ? { ...s.planCard, ...s.planCardHL } : s.planCard}>
                  {plan.highlight && <div style={s.planBadge}>Популярний</div>}
                  <p style={s.planName}>{plan.name}</p>
                  <p style={s.planPrice}>{plan.price}</p>
                  <p style={s.planRuns}>{plan.runs} запуски</p>
                  <div style={s.planPay}>
                    {plan.mono && <span style={s.payChip}>💳 Monobank</span>}
                    {plan.usdt && <span style={s.payChip}>₮ USDT</span>}
                  </div>
                  <a href={BOT_LINK} target="_blank" rel="noopener noreferrer"
                    style={plan.highlight ? s.btnPrimary : s.btnSecondary}>
                    Придбати →
                  </a>
                </div>
              ))}
            </div>
            <p style={s.plansNote}>
              Оплата карткою Monobank або USDT. Після оплати — ключ активації в боті.
            </p>
          </section>

          {/* CTA */}
          <section style={s.cta}>
            <p style={s.ctaTitle}>Спробуй безкоштовно прямо зараз</p>
            <p style={s.ctaDesc}>4 модулі демо — одразу в Telegram боті. Без реєстрації.</p>
            <a href={BOT_LINK} target="_blank" rel="noopener noreferrer" style={s.btnPrimary}>
              Відкрити @AuditShield_01_Bot →
            </a>
          </section>

          {/* FAQ */}
          <section style={s.section}>
            <h2 style={s.h2}>Питання і відповіді</h2>
            {[
              {
                q: 'Чи передаються мої дані кудись?',
                a: 'Ні. AuditShield працює повністю локально. Звіт зберігається тільки на вашому ПК. Жодних даних не надсилається назовні.',
              },
              {
                q: 'Чи потрібно встановлювати програму?',
                a: 'Ні. AuditShield запускається без встановлення і не вносить жодних змін в систему.',
              },
              {
                q: 'Які права потрібні для запуску?',
                a: 'Для повноцінного аудиту рекомендується запуск від імені адміністратора. Деякі модулі доступні і без прав адміна.',
              },
              {
                q: 'Як виглядає звіт?',
                a: 'HTML-файл який відкривається в будь-якому браузері. Містить результати по кожному модулю, оцінку ризику від 0 до 100 і рекомендації.',
              },
              {
                q: 'Що таке "кількість запусків"?',
                a: 'Кожне сканування ПК = 1 запуск. Купуючи тариф "Старт" (3 запуски) ти можеш просканувати 3 різних ПК або один ПК тричі.',
              },
            ].map(item => (
              <div key={item.q} style={s.faqItem}>
                <p style={s.faqQ}>{item.q}</p>
                <p style={s.faqA}>{item.a}</p>
              </div>
            ))}
          </section>

          {/* Back */}
          <div style={s.back}>
            <Link href="/tools" style={s.backLink}>← Всі інструменти</Link>
          </div>

        </div>
      </div>
    </Layout>
  )
}

const s = {
  bc: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2rem' },
  bcLink: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#94a3b8', textDecoration: 'none' },
  bcSep: { fontSize: '12px', color: '#cbd5e1' },

  hero: {
    display: 'flex', gap: '1.5rem', alignItems: 'flex-start',
    background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
    border: '1px solid #e2e8f0', borderRadius: '16px',
    padding: '2rem', marginBottom: '3rem',
  },
  heroIcon: { fontSize: '3.5rem', flexShrink: 0 },
  heroBadge: {
    display: 'inline-block',
    fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600,
    color: '#16a34a', background: '#dcfce7',
    padding: '3px 10px', borderRadius: '20px',
    textTransform: 'uppercase', letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  heroTitle: {
    fontFamily: "'Unbounded', sans-serif",
    fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
    fontWeight: 700, color: '#0f172a',
    margin: '0 0 4px',
  },
  heroSub: { fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#64748b', margin: '0 0 1rem' },
  heroDesc: { fontSize: '0.95rem', color: '#475569', lineHeight: 1.7, margin: '0 0 1.5rem' },
  heroActions: { display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
  heroNote: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#94a3b8' },

  btnPrimary: {
    display: 'inline-block',
    background: '#2563eb', color: '#fff',
    padding: '12px 24px', borderRadius: '8px',
    fontWeight: 600, fontSize: '0.9rem',
    textDecoration: 'none',
    transition: 'background 0.15s',
  },
  btnSecondary: {
    display: 'inline-block',
    background: '#f1f5f9', color: '#0f172a',
    padding: '12px 24px', borderRadius: '8px',
    fontWeight: 600, fontSize: '0.9rem',
    textDecoration: 'none', border: '1px solid #e2e8f0',
  },

  section: { marginBottom: '3rem' },
  h2: {
    fontFamily: "'Unbounded', sans-serif",
    fontSize: '1.15rem', fontWeight: 700, color: '#0f172a',
    marginBottom: '1.25rem',
  },

  forWhomGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' },
  forWhomCard: {
    display: 'flex', gap: '12px', alignItems: 'flex-start',
    padding: '1.25rem', background: '#fff',
    border: '1px solid #e2e8f0', borderRadius: '12px',
  },
  forWhomIcon: { fontSize: '1.75rem', flexShrink: 0 },
  forWhomTitle: { fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', marginBottom: '4px' },
  forWhomDesc: { fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6, margin: 0 },

  advGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' },
  advItem: {
    display: 'flex', gap: '10px', alignItems: 'flex-start',
    padding: '1rem 1.25rem', background: '#f8fafc',
    border: '1px solid #e2e8f0', borderRadius: '10px',
  },
  advIcon: { fontSize: '1.25rem', flexShrink: 0 },
  advText: { fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 },

  modulesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '8px' },
  moduleItem: {
    display: 'flex', gap: '10px', alignItems: 'center',
    padding: '10px 14px', background: '#fff',
    border: '1px solid #e2e8f0', borderRadius: '8px',
  },
  moduleNum: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#94a3b8', flexShrink: 0, width: '20px' },
  moduleText: { fontSize: '0.85rem', color: '#334155' },

  plansGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '1rem' },
  planCard: {
    position: 'relative',
    padding: '1.5rem', background: '#fff',
    border: '1px solid #e2e8f0', borderRadius: '12px',
    textAlign: 'center',
  },
  planCardHL: {
    border: '2px solid #2563eb',
    background: '#eff6ff',
  },
  planBadge: {
    position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
    fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700,
    color: '#fff', background: '#2563eb',
    padding: '3px 12px', borderRadius: '20px',
    whiteSpace: 'nowrap',
  },
  planName: { fontFamily: "'Unbounded', sans-serif", fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' },
  planPrice: { fontSize: '2rem', fontWeight: 800, color: '#2563eb', marginBottom: '4px' },
  planRuns: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#64748b', marginBottom: '16px' },
  planPay: { display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '16px', flexWrap: 'wrap' },
  payChip: {
    fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#475569',
    background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px',
  },
  plansNote: { fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', textAlign: 'center' },

  cta: {
    textAlign: 'center',
    padding: '2.5rem',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)',
    borderRadius: '16px',
    marginBottom: '3rem',
  },
  ctaTitle: { fontFamily: "'Unbounded', sans-serif", fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '8px' },
  ctaDesc: { color: '#93c5fd', fontSize: '0.9rem', marginBottom: '1.5rem' },

  faqItem: {
    padding: '1.25rem',
    borderBottom: '1px solid #e2e8f0',
  },
  faqQ: { fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', marginBottom: '6px' },
  faqA: { color: '#475569', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 },

  back: { marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' },
  backLink: { fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#2563eb', fontWeight: 500, textDecoration: 'none' },
}
