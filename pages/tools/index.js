import Layout from '../../components/Layout'
import Link from 'next/link'
import siteConfig from '../../site.config'

const SITE = siteConfig.url

const tools = [
  {
    slug: 'auditshield',
    name: 'AuditShield',
    tagline: 'Аудит безпеки Windows ПК',
    description: 'Перевіряє ПК по 22 напрямках і видає детальний HTML-звіт з оцінкою ризику. Для бізнесу, ФОП та IT-спеціалістів.',
    badge: 'Безкоштовне демо',
    icon: '🛡️',
  },
  {
    slug: 'windows-error-decoder',
    name: 'Декодер помилок',
    tagline: 'Розшифруй код помилки Windows',
    description: 'Введи код на кшталт 0x80070005 і дізнайся що він означає, чому виникає і як виправити. База 20+ найпоширеніших помилок.',
    badge: 'Безкоштовно',
    icon: '🔍',
  },
  {
    slug: 'powershell-commands',
    name: 'PowerShell довідник',
    tagline: 'Шукай команду за задачею',
    description: '40+ PowerShell і CMD команд з пошуком. Мережа, файли, процеси, безпека, диски. Копіюй одним кліком.',
    badge: 'Безкоштовно',
    icon: '⚡',
  },
  {
    slug: 'windows-event-id',
    name: 'Event ID довідник',
    tagline: 'Що означає подія з Event Viewer',
    description: 'Розшифруй Event ID з журналу Windows. 20+ ключових подій безпеки: входи, акаунти, процеси, служби з описом і рекомендаціями.',
    badge: 'Безкоштовно',
    icon: '📋',
  },
  {
    slug: 'password-generator',
    name: 'Генератор паролів',
    tagline: 'Надійні паролі за секунду',
    description: 'Генеруй криптографічно надійні паролі в браузері. Налаштуй довжину, символи, кількість. Нічого не передається на сервер.',
    badge: 'Безкоштовно',
    icon: '🔑',
  },
  {
    slug: 'subnet-calculator',
    name: 'Subnet калькулятор',
    tagline: 'IP і підмережі онлайн',
    description: 'Введи IP/CIDR — отримай маску, мережу, broadcast, діапазон хостів і бінарне представлення. Таблиця поширених масок.',
    badge: 'Безкоштовно',
    icon: '🌐',
  },
]

export default function Tools() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Інструменти для Windows — ${siteConfig.name}`,
    description: 'Безкоштовні інструменти для діагностики, безпеки та адміністрування Windows. Декодер помилок, PowerShell довідник, Event ID, аудит безпеки.',
    url: `${SITE}/tools`,
    publisher: { '@type': 'Organization', name: siteConfig.name, url: SITE },
    inLanguage: 'uk',
  }

  return (
    <Layout
      title="Інструменти для Windows — діагностика, безпека, адміністрування"
      description="Безкоштовні онлайн інструменти для Windows: декодер помилок, PowerShell довідник, Event ID, генератор паролів, аудит безпеки ПК."
      canonical={`${SITE}/tools`}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div style={{ padding: '2.5rem 0 3rem' }}>
        <div className="container">

          {/* Breadcrumb */}
          <nav style={s.bc}>
            <Link href="/" style={s.bcLink}>Головна</Link>
            <span style={s.bcSep}>/</span>
            <span style={{ ...s.bcLink, color: '#64748b' }}>Інструменти</span>
          </nav>

          {/* Header */}
          <h1 style={s.title}>Інструменти для Windows</h1>
          <p style={s.lead}>
            Практичні безкоштовні утиліти для діагностики, безпеки та адміністрування Windows.
            Без реєстрації — все працює прямо в браузері.
          </p>

          {/* Tools grid */}
          <div style={s.grid}>
            {tools.map(tool => (
              <Link key={tool.slug} href={`/tools/${tool.slug}`} style={s.card}>
                <div style={s.cardIcon}>{tool.icon}</div>
                <div style={s.cardContent}>
                  <div style={s.cardTop}>
                    <span style={s.cardName}>{tool.name}</span>
                    {tool.badge && <span style={s.badge}>{tool.badge}</span>}
                  </div>
                  <p style={s.cardTagline}>{tool.tagline}</p>
                  <p style={s.cardDesc}>{tool.description}</p>
                </div>
                <span style={s.cardArrow}>→</span>
              </Link>
            ))}
          </div>

          {/* Coming soon */}
          <div style={s.soon}>
            <p style={s.soonTitle}>Незабаром</p>
            <p style={s.soonText}>
              Генератор паролів, IP/Subnet калькулятор та інші інструменти у розробці.
              Слідкуй за оновленнями у{' '}
              <a href={siteConfig.social.telegram} style={s.link}>Telegram каналі</a>.
            </p>
          </div>

        </div>
      </div>
    </Layout>
  )
}

const s = {
  bc: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1.5rem' },
  bcLink: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#94a3b8', textDecoration: 'none' },
  bcSep: { fontSize: '12px', color: '#cbd5e1' },
  title: {
    fontFamily: "'Unbounded', sans-serif",
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    fontWeight: 700, color: '#0f172a', marginBottom: '1rem',
  },
  lead: {
    fontSize: '1rem', color: '#475569', lineHeight: 1.7,
    padding: '1.25rem 1.5rem', background: '#eff6ff',
    borderRadius: '0 10px 10px 0', borderLeft: '3px solid #2563eb',
    marginBottom: '2.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '14px', marginBottom: '2.5rem',
  },
  card: {
    display: 'flex', alignItems: 'flex-start', gap: '14px',
    padding: '1.25rem', background: '#fff',
    border: '1px solid #e2e8f0', borderRadius: '12px',
    textDecoration: 'none', cursor: 'pointer',
  },
  cardIcon: { fontSize: '1.75rem', flexShrink: 0, marginTop: '2px' },
  cardContent: { flex: 1 },
  cardTop: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
  cardName: {
    fontFamily: "'Unbounded', sans-serif",
    fontSize: '0.9rem', fontWeight: 700, color: '#0f172a',
  },
  badge: {
    fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 600,
    color: '#16a34a', background: '#dcfce7',
    padding: '2px 8px', borderRadius: '20px',
    textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  cardTagline: { fontSize: '0.8rem', color: '#2563eb', fontWeight: 600, marginBottom: '4px' },
  cardDesc: { fontSize: '0.825rem', color: '#64748b', lineHeight: 1.6, margin: 0 },
  cardArrow: { fontSize: '1.1rem', color: '#94a3b8', flexShrink: 0, alignSelf: 'center' },
  soon: {
    padding: '1.25rem 1.5rem', background: '#f8fafc',
    borderRadius: '10px', border: '1px dashed #cbd5e1',
  },
  soonTitle: {
    fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600,
    color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px',
  },
  soonText: { fontSize: '0.875rem', color: '#64748b', margin: 0 },
  link: { color: '#2563eb', fontWeight: 500 },
}
