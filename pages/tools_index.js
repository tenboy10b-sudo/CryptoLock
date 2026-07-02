import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import Link from 'next/link'
import siteConfig from '../../site.config'

const SITE = siteConfig.url

const tools = {
  uk: [
    { slug: 'auditshield',           name: 'AuditShield',         tagline: 'Аудит безпеки Windows ПК',       description: 'Перевіряє ПК по 22 напрямках і видає детальний HTML-звіт з оцінкою ризику.', badge: 'Безкоштовне демо', icon: '🛡️' },
    { slug: 'windows-error-decoder', name: 'Декодер помилок',      tagline: 'Розшифруй код помилки Windows',  description: 'Введи код 0x80070005 і дізнайся що він означає і як виправити. 40+ помилок.',    badge: 'Безкоштовно', icon: '🔍' },
    { slug: 'powershell-commands',   name: 'PowerShell довідник',  tagline: 'Шукай команду за задачею',       description: '40+ PowerShell і CMD команд. Мережа, файли, безпека, диски. Копіюй одним кліком.', badge: 'Безкоштовно', icon: '⚡' },
    { slug: 'windows-event-id',      name: 'Event ID довідник',    tagline: 'Що означає подія з Event Viewer', description: '20+ ключових подій безпеки Windows з описом, рівнем загрози і рекомендаціями.', badge: 'Безкоштовно', icon: '📋' },
    { slug: 'password-generator',    name: 'Генератор паролів',    tagline: 'Надійні паролі за секунду',      description: 'Криптографічно надійні паролі в браузері. Нічого не передається на сервер.',    badge: 'Безкоштовно', icon: '🔑' },
    { slug: 'subnet-calculator',     name: 'Subnet калькулятор',   tagline: 'IP і підмережі онлайн',          description: 'Введи IP/CIDR — маска, мережа, broadcast, діапазон хостів і бінарне представлення.', badge: 'Безкоштовно', icon: '🌐' },
    { slug: 'regex',            name: 'Regex Tester',         tagline: 'Тестуй регулярні вирази онлайн',  description: 'Живе підсвічування збігів, деталі груп, флаги і 10 готових шаблонів для IP, email, шляхів Windows і PowerShell.', badge: 'Безкоштовно', icon: '🔎' },
    { slug: 'hash',             name: 'Hash Generator',       tagline: 'MD5, SHA1, SHA256, SHA512 онлайн', description: 'Розрахуй хеш тексту в браузері. MD5, SHA-1, SHA-256, SHA-512. Порівняй з відомим хешем. Нічого не передається.', badge: 'Безкоштовно', icon: '#️⃣' },
    { slug: 'base64',           name: 'Base64 / HEX',         tagline: 'Кодуй і декодуй Base64 та HEX',  description: 'Base64 encode/decode, HEX конвертер і кодування PowerShell команд. Все в браузері, нічого не передається.', badge: 'Безкоштовно', icon: '🔢' },
    { slug: 'ip-info',              name: 'IP Info',              tagline: 'Інформація про IP адресу',       description: 'Країна, місто, провайдер, організація і геолокація будь-якої IPv4 або IPv6 адреси.',     badge: 'Безкоштовно', icon: '🌐' },
    { slug: 'port-checker',          name: 'Перевірка портів',     tagline: 'Чи відкритий TCP порт онлайн',   description: 'Введи хост і порт — миттєва перевірка TCP зʼєднання. Або скануй 20 популярних портів.', badge: 'Безкоштовно', icon: '🔌' },
  ],
  en: [
    { slug: 'auditshield',           name: 'AuditShield',          tagline: 'Windows PC Security Audit',      description: 'Scans your PC across 22 security areas and generates a detailed HTML report with a risk score.', badge: 'Free demo', icon: '🛡️' },
    { slug: 'windows-error-decoder', name: 'Error Code Decoder',   tagline: 'Look up any Windows error code', description: 'Enter code 0x80070005 and instantly get the cause and step-by-step fix. 40+ codes.',           badge: 'Free', icon: '🔍' },
    { slug: 'powershell-commands',   name: 'PowerShell Reference',  tagline: 'Search commands by task',        description: '40+ PowerShell and CMD commands. Network, files, security, disks. Copy with one click.',       badge: 'Free', icon: '⚡' },
    { slug: 'windows-event-id',      name: 'Event ID Reference',   tagline: 'Look up Event Viewer IDs',       description: '20+ key Windows security events with description, threat level and recommended actions.',       badge: 'Free', icon: '📋' },
    { slug: 'password-generator',    name: 'Password Generator',   tagline: 'Strong passwords instantly',     description: 'Cryptographically secure passwords generated in your browser. Nothing is transmitted.',         badge: 'Free', icon: '🔑' },
    { slug: 'subnet-calculator',     name: 'Subnet Calculator',    tagline: 'IP and subnets online',          description: 'Enter IP/CIDR and get mask, network, broadcast, host range and binary representation.',        badge: 'Free', icon: '🌐' },
    { slug: 'regex',            name: 'Regex Tester',         tagline: 'Test regular expressions online',  description: 'Live match highlighting, group details, flags and 10 ready-made patterns for IP, email, Windows paths and PowerShell.', badge: 'Free', icon: '🔎' },
    { slug: 'hash',             name: 'Hash Generator',       tagline: 'MD5, SHA1, SHA256, SHA512 online', description: 'Calculate text hashes in your browser. MD5, SHA-1, SHA-256, SHA-512. Compare with known hash. Nothing is sent anywhere.', badge: 'Free', icon: '#️⃣' },
    { slug: 'base64',           name: 'Base64 / HEX',         tagline: 'Encode and decode Base64 & HEX',  description: 'Base64 encode/decode, HEX converter and PowerShell EncodedCommand. Everything runs in your browser.', badge: 'Free', icon: '🔢' },
    { slug: 'ip-info',              name: 'IP Info',              tagline: 'IP address lookup',              description: 'Country, city, ISP, organization and geolocation for any IPv4 or IPv6 address.',            badge: 'Free', icon: '🌐' },
    { slug: 'port-checker',          name: 'Port Checker',         tagline: 'Check if TCP port is open',      description: 'Enter host and port for instant TCP connection test. Or scan 20 common ports at once.',          badge: 'Free', icon: '🔌' },
  ],
}

export default function Tools() {
  const { locale } = useRouter()
  const [mounted, setMounted] = useState(false)
  const isEn = mounted ? locale === 'en' : false
  useEffect(() => { setMounted(true) }, [])
  const list = isEn ? tools.en : tools.uk

  const canonicalPath = mounted ? (isEn ? `${SITE}/en/tools` : `${SITE}/tools`) : `${SITE}/tools`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: isEn
      ? `Windows Tools — ${siteConfig.name}`
      : `Інструменти для Windows — ${siteConfig.name}`,
    description: isEn
      ? 'Free Windows tools for diagnostics, security and administration. Error decoder, PowerShell reference, Event ID lookup, password generator, subnet calculator.'
      : 'Безкоштовні інструменти для Windows: декодер помилок, PowerShell довідник, Event ID, генератор паролів, аудит безпеки ПК.',
    url: canonicalPath,
    publisher: { '@type': 'Organization', name: siteConfig.name, url: SITE },
    inLanguage: isEn ? 'en' : 'uk',
  }

  return (
    <Layout
      title={isEn
        ? 'Windows Tools — Error Decoder, PowerShell, Event ID, Password Generator'
        : 'Інструменти для Windows — діагностика, безпека, адміністрування'}
      description={isEn
        ? 'Free online Windows tools: error code lookup, PowerShell command reference, Event ID decoder, password generator, subnet calculator. No sign-up required.'
        : 'Безкоштовні онлайн інструменти для Windows: декодер помилок, PowerShell довідник, Event ID, генератор паролів, аудит безпеки ПК.'}
      canonical={canonicalPath}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div style={{ padding: '2.5rem 0 3rem' }}>
        <div className="container">

          <nav style={s.bc}>
            <Link href={isEn ? '/en' : '/'} style={s.bcLink}>{isEn ? 'Home' : 'Головна'}</Link>
            <span style={s.bcSep}>/</span>
            <span style={{ ...s.bcLink, color: 'var(--muted,#64748b)' }}>{isEn ? 'Tools' : 'Інструменти'}</span>
          </nav>

          <h1 style={s.title}>{isEn ? 'Windows Tools' : 'Інструменти для Windows'}</h1>
          <p style={s.lead}>{isEn
            ? 'Free utilities for Windows diagnostics, security and administration. No sign-up — everything runs in your browser.'
            : 'Практичні безкоштовні утиліти для діагностики, безпеки та адміністрування Windows. Без реєстрації — все працює прямо в браузері.'
          }</p>

          <div style={s.grid}>
            {list.map(tool => (
              <Link key={tool.slug}
                href={isEn ? `/en/tools/${tool.slug}` : `/tools/${tool.slug}`}
                style={s.card}>
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

        </div>
      </div>
    </Layout>
  )
}

const s = {
  bc: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1.5rem' },
  bcLink: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--faint,#94a3b8)', textDecoration: 'none' },
  bcSep: { fontSize: '12px', color: 'var(--border-md,#cbd5e1)' },
  title: { fontFamily: "'Unbounded', sans-serif", fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, color: 'var(--text,#0f172a)', marginBottom: '1rem' },
  lead: { fontSize: '1rem', color: 'var(--muted,#475569)', lineHeight: 1.7, padding: '1.25rem 1.5rem', background: 'var(--accent-light,#eff6ff)', borderRadius: '0 10px 10px 0', borderLeft: '3px solid var(--accent,#2563eb)', marginBottom: '2.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px', marginBottom: '2.5rem' },
  card: { display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '1.25rem', background: 'var(--bg-card,#fff)', border: '1px solid var(--border,#e2e8f0)', borderRadius: '12px', textDecoration: 'none', cursor: 'pointer' },
  cardIcon: { fontSize: '1.75rem', flexShrink: 0, marginTop: '2px' },
  cardContent: { flex: 1 },
  cardTop: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
  cardName: { fontFamily: "'Unbounded', sans-serif", fontSize: '0.9rem', fontWeight: 700, color: 'var(--text,#0f172a)' },
  badge: { fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  cardTagline: { fontSize: '0.8rem', color: '#2563eb', fontWeight: 600, marginBottom: '4px' },
  cardDesc: { fontSize: '0.825rem', color: 'var(--muted,#64748b)', lineHeight: 1.6, margin: 0 },
  cardArrow: { fontSize: '1.1rem', color: 'var(--faint,#94a3b8)', flexShrink: 0, alignSelf: 'center' },
}
