import { useState } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import Link from 'next/link'
import siteConfig from '../../site.config'

const SITE = siteConfig.url

export default function IpInfo() {
  const { locale } = useRouter()
  const isEn = locale === 'en'
  const t = (uk, en) => isEn ? en : uk

  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [myIp, setMyIp] = useState(null)
  const [myIpLoading, setMyIpLoading] = useState(false)

  const canonicalPath = isEn ? `${SITE}/en/tools/ip-info` : `${SITE}/tools/ip-info`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: isEn ? 'IP Address Lookup — CryptoLock' : 'Інформація про IP адресу — CryptoLock',
    description: isEn
      ? 'Look up any IP address: country, city, ISP, organization, timezone and geolocation. Free, no registration.'
      : 'Дізнайся інформацію про будь-яку IP адресу: країна, місто, провайдер, організація, часовий пояс.',
    url: canonicalPath,
    applicationCategory: 'NetworkingApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }

  const isValidIp = (ip) => {
    const v4 = /^(\d{1,3}\.){3}\d{1,3}$/
    const v6 = /^[0-9a-fA-F:]{2,39}$/
    return v4.test(ip) || v6.test(ip)
  }

  const lookup = async (ip) => {
    if (!ip.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch(`https://ipapi.co/${ip.trim()}/json/`)
      const data = await res.json()
      if (data.error) {
        setError(data.reason || t('Невалідна IP адреса', 'Invalid IP address'))
      } else {
        setResult(data)
      }
    } catch {
      setError(t('Помилка мережі. Спробуй ще раз.', 'Network error. Please try again.'))
    }
    setLoading(false)
  }

  const getMyIp = async () => {
    setMyIpLoading(true)
    try {
      const res = await fetch('https://ipapi.co/json/')
      const data = await res.json()
      if (!data.error) {
        setMyIp(data.ip)
        setInput(data.ip)
        setResult(data)
      }
    } catch {}
    setMyIpLoading(false)
  }

  const fields = result ? [
    { icon: '🌍', label: t('Країна', 'Country'),       value: result.country_name ? `${result.country_name} ${result.country_code ? `(${result.country_code})` : ''}` : '—' },
    { icon: '🏙️', label: t('Місто', 'City'),           value: [result.city, result.region].filter(Boolean).join(', ') || '—' },
    { icon: '📮', label: t('Поштовий індекс', 'ZIP'),   value: result.postal || '—' },
    { icon: '🌐', label: t('Провайдер (ISP)', 'ISP'),   value: result.org || '—' },
    { icon: '🏢', label: t('Організація', 'Organization'), value: result.asn ? `${result.asn} — ${result.org || ''}` : (result.org || '—') },
    { icon: '⏰', label: t('Часовий пояс', 'Timezone'), value: result.timezone || '—' },
    { icon: '🌏', label: t('Континент', 'Continent'),   value: result.continent_code || '—' },
    { icon: '📍', label: t('Координати', 'Coordinates'), value: result.latitude && result.longitude ? `${result.latitude}, ${result.longitude}` : '—' },
    { icon: '📡', label: t('Тип IP', 'IP type'),        value: [
        result.version || '',
        result.proxy ? t('Проксі', 'Proxy') : '',
        result.hosting ? t('Хостинг', 'Hosting') : '',
        result.tor ? 'Tor' : '',
      ].filter(Boolean).join(' · ') || '—' },
  ] : []

  return (
    <Layout
      title={isEn
        ? 'IP Address Lookup — Country, ISP, Location | CryptoLock'
        : 'Інформація про IP адресу — країна, провайдер, геолокація | CryptoLock'}
      description={isEn
        ? 'Free IP address lookup tool. Enter any IPv4 or IPv6 address to get country, city, ISP, organization, timezone and coordinates. No registration required.'
        : 'Безкоштовний інструмент для перевірки IP адреси. Введи IPv4 або IPv6 і отримай країну, місто, провайдера, організацію і часовий пояс.'}
      canonical={canonicalPath}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div style={{ padding: '2.5rem 0 3rem' }}>
        <div className="container" style={{ maxWidth: '680px' }}>

          {/* Breadcrumb */}
          <nav style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '1.5rem', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Link href={isEn ? '/en' : '/'} style={{ color: '#94a3b8', textDecoration: 'none' }}>{t('Головна', 'Home')}</Link>
            <span>/</span>
            <Link href={isEn ? '/en/tools' : '/tools'} style={{ color: '#94a3b8', textDecoration: 'none' }}>{t('Інструменти', 'Tools')}</Link>
            <span>/</span>
            <span style={{ color: '#64748b' }}>IP Info</span>
          </nav>

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
              🌐 {t('Інформація про IP адресу', 'IP Address Lookup')}
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
              {t(
                'Введи будь-яку IPv4 або IPv6 адресу щоб дізнатись країну, провайдера, геолокацію і тип адреси.',
                'Enter any IPv4 or IPv6 address to get country, ISP, geolocation and address type.'
              )}
            </p>
          </div>

          {/* Input card */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem' }}>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                {t('IP адреса', 'IP address')}
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && lookup(input)}
                  placeholder={t('наприклад: 8.8.8.8 або 2001:db8::1', 'e.g. 8.8.8.8 or 2001:db8::1')}
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: '10px',
                    border: '1.5px solid #e2e8f0', fontSize: '15px',
                    fontFamily: 'var(--font-mono)', outline: 'none', background: '#fff',
                  }}
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button
                  onClick={() => lookup(input)}
                  disabled={loading || !input.trim()}
                  style={{
                    padding: '10px 20px', borderRadius: '10px', fontSize: '14px',
                    fontWeight: 700, border: 'none', cursor: 'pointer',
                    background: loading || !input.trim() ? '#cbd5e1' : '#2563eb',
                    color: '#fff', whiteSpace: 'nowrap',
                  }}
                >
                  {loading ? '⏳' : t('Шукати', 'Lookup')}
                </button>
              </div>
            </div>

            {/* My IP button */}
            <button
              onClick={getMyIp}
              disabled={myIpLoading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '8px', fontSize: '13px',
                border: '1px solid #e2e8f0', background: '#fff',
                color: '#475569', cursor: 'pointer', fontWeight: 500,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              {myIpLoading
                ? t('Визначаємо…', 'Detecting…')
                : t('Моя IP адреса', 'My IP address')}
              {myIp && !myIpLoading && (
                <span style={{ fontFamily: 'var(--font-mono)', color: '#2563eb', marginLeft: '2px' }}>{myIp}</span>
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', color: '#dc2626', fontSize: '14px', marginBottom: '1rem' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>

              {/* IP header */}
              <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '28px' }}>
                  {result.country_code ? String.fromCodePoint(...[...result.country_code].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)) : '🌐'}
                </span>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: '#f1f5f9' }}>
                    {result.ip}
                  </div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
                    {result.city ? `${result.city}, ${result.country_name}` : result.country_name}
                  </div>
                </div>
                {(result.proxy || result.hosting || result.tor) && (
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
                    {result.tor     && <span style={{ fontSize: '11px', background: '#7c3aed', color: '#fff', borderRadius: '5px', padding: '2px 8px', fontWeight: 700 }}>TOR</span>}
                    {result.proxy   && <span style={{ fontSize: '11px', background: '#f59e0b', color: '#fff', borderRadius: '5px', padding: '2px 8px', fontWeight: 700 }}>PROXY</span>}
                    {result.hosting && <span style={{ fontSize: '11px', background: '#64748b', color: '#fff', borderRadius: '5px', padding: '2px 8px', fontWeight: 700 }}>HOSTING</span>}
                  </div>
                )}
              </div>

              {/* Fields grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {fields.map((f, i) => (
                  <div key={i} style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    borderRight: i % 2 === 0 ? '1px solid #f1f5f9' : 'none',
                  }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                      {f.icon} {f.label}
                    </div>
                    <div style={{ fontSize: '14px', color: '#1e293b', fontFamily: f.label.includes('IP') || f.label.includes('Coord') || f.label.includes('Координ') || f.label === 'ASN' ? 'var(--font-mono)' : 'inherit', wordBreak: 'break-word' }}>
                      {f.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map link */}
              {result.latitude && result.longitude && (
                <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${result.latitude}&mlon=${result.longitude}&zoom=12`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {t('Відкрити на карті', 'View on map')} →
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Popular IPs */}
          {!result && !loading && (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                {t('Популярні для перевірки:', 'Common lookups:')}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { ip: '8.8.8.8', label: 'Google DNS' },
                  { ip: '1.1.1.1', label: 'Cloudflare' },
                  { ip: '208.67.222.222', label: 'OpenDNS' },
                  { ip: '9.9.9.9', label: 'Quad9' },
                ].map(({ ip, label }) => (
                  <button key={ip} onClick={() => { setInput(ip); lookup(ip) }} style={{
                    padding: '5px 12px', borderRadius: '8px', fontSize: '12px',
                    border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', color: '#475569',
                    transition: 'all 0.15s',
                  }}>
                    {ip} <span style={{ color: '#94a3b8' }}>— {label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PowerShell tip */}
          <div style={{ marginTop: '2rem', padding: '1.25rem 1.5rem', background: '#1e1e2e', borderRadius: '12px' }}>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
              # {t('Перевірити IP локально через PowerShell', 'Check IP info via PowerShell')}
            </p>
            <code style={{ fontSize: '13px', color: '#e2e8f0', fontFamily: 'var(--font-mono)', lineHeight: 1.8, display: 'block' }}>
              Resolve-DnsName 8.8.8.8<br/>
              <span style={{ color: '#94a3b8' }}># Або через web API:</span><br/>
              Invoke-RestMethod "https://ipapi.co/8.8.8.8/json/" | Select-Object ip, city, country_name, org
            </code>
          </div>

        </div>
      </div>
    </Layout>
  )
}
