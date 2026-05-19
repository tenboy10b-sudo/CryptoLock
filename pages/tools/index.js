import Layout from '../components/Layout'
import Link from 'next/link'
import siteConfig from '../site.config'

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
]

export default function Tools() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Інструменти для безпеки Windows — ${siteConfig.name}`,
    description: 'Практичні інструменти для перевірки та захисту Windows ПК.',
    url: `${SITE}/tools`,
    publisher: { '@type': 'Organization', name: siteConfig.name, url: SITE },
    inLanguage: 'uk',
  }

  return (
    <Layout
      title="Інструменти для безпеки Windows"
      description="Практичні інструменти для перевірки та захисту Windows ПК. Аудит безпеки, перевірка витоків даних та інше."
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
            Практичні утиліти для перевірки безпеки, аудиту та захисту Windows ПК.
            Кожен інструмент вирішує конкретну задачу — без зайвого.
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
            <p style={s.soonText}>Більше інструментів у розробці. Слідкуй за оновленнями у{' '}
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
  bcLink: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#94a3b8' },
  bcSep: { fontSize: '12px', color: '#cbd5e1' },
  title: {
    fontFamily: "'Unbounded', sans-serif",
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: '1rem',
  },
  lead: {
    fontSize: '1rem',
    color: '#475569',
    lineHeight: 1.7,
    padding: '1.25rem 1.5rem',
    background: '#eff6ff',
    borderRadius: '0 10px 10px 0',
    borderLeft: '3px solid #2563eb',
    marginBottom: '2.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
    marginBottom: '3rem',
  },
  card: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '1.5rem',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    textDecoration: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    cursor: 'pointer',
  },
  cardIcon: { fontSize: '2rem', flexShrink: 0, marginTop: '2px' },
  cardContent: { flex: 1 },
  cardTop: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
  cardName: {
    fontFamily: "'Unbounded', sans-serif",
    fontSize: '1rem',
    fontWeight: 700,
    color: '#0f172a',
  },
  badge: {
    fontSize: '10px',
    fontFamily: 'var(--font-mono)',
    fontWeight: 600,
    color: '#16a34a',
    background: '#dcfce7',
    padding: '2px 8px',
    borderRadius: '20px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  cardTagline: {
    fontSize: '0.85rem',
    color: '#2563eb',
    fontWeight: 600,
    marginBottom: '6px',
  },
  cardDesc: {
    fontSize: '0.875rem',
    color: '#64748b',
    lineHeight: 1.6,
    margin: 0,
  },
  cardArrow: { fontSize: '1.25rem', color: '#94a3b8', flexShrink: 0, alignSelf: 'center' },
  soon: {
    padding: '1.5rem',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px dashed #cbd5e1',
  },
  soonTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '6px',
  },
  soonText: { fontSize: '0.875rem', color: '#64748b', margin: 0 },
  link: { color: '#2563eb', fontWeight: 500 },
}
