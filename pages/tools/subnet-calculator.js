import { useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import Link from 'next/link'
import siteConfig from '../../site.config'

const SITE = siteConfig.url

function ipToInt(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0
}

function intToIp(n) {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.')
}

function validateIp(ip) {
  const parts = ip.split('.')
  if (parts.length !== 4) return false
  return parts.every(p => {
    const n = parseInt(p)
    return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p
  })
}

function calcSubnet(ip, prefix) {
  const prefixNum = parseInt(prefix)
  if (prefixNum < 0 || prefixNum > 32) return null

  const ipInt      = ipToInt(ip)
  const maskInt    = prefixNum === 0 ? 0 : (0xFFFFFFFF << (32 - prefixNum)) >>> 0
  const networkInt = (ipInt & maskInt) >>> 0
  const broadInt   = (networkInt | (~maskInt >>> 0)) >>> 0
  const hostCount  = prefixNum >= 31 ? Math.pow(2, 32 - prefixNum) : Math.pow(2, 32 - prefixNum) - 2
  const firstHost  = prefixNum >= 31 ? networkInt : networkInt + 1
  const lastHost   = prefixNum >= 31 ? broadInt   : broadInt - 1

  return {
    ip:          intToIp(ipInt),
    prefix:      prefixNum,
    mask:        intToIp(maskInt),
    wildcard:    intToIp(~maskInt >>> 0),
    network:     intToIp(networkInt),
    broadcast:   intToIp(broadInt),
    firstHost:   intToIp(firstHost),
    lastHost:    intToIp(lastHost),
    hostCount:   hostCount > 0 ? hostCount : 0,
    ipClass:     getClass(ipInt),
    ipType:      getType(ipInt),
    ipBinary:    intToBinary(ipInt),
    maskBinary:  intToBinary(maskInt),
    networkInt,
    broadInt,
  }
}

function intToBinary(n) {
  return [24, 16, 8, 0].map(shift => {
    return ((n >>> shift) & 255).toString(2).padStart(8, '0')
  }).join('.')
}

function getClass(n) {
  const first = n >>> 24
  if (first < 128)  return 'A'
  if (first < 192)  return 'B'
  if (first < 224)  return 'C'
  if (first < 240)  return 'D (Multicast)'
  return 'E (Reserved)'
}

function getType(n) {
  const a = n >>> 24
  const b = (n >>> 16) & 255
  if (a === 10) return 'Private (RFC1918)'
  if (a === 172 && b >= 16 && b <= 31) return 'Private (RFC1918)'
  if (a === 192 && b === 168) return 'Private (RFC1918)'
  if (a === 127) return 'Loopback'
  if (a === 169 && b === 254) return 'Link-local (APIPA)'
  if (a >= 224) return 'Multicast/Reserved'
  return 'Public'
}

function formatHostCount(n, isEn) {
  if (n >= 1e9)  return (n / 1e9).toFixed(1)  + (isEn ? 'B'  : ' млрд')
  if (n >= 1e6)  return (n / 1e6).toFixed(1)  + (isEn ? 'M'  : ' млн')
  if (n >= 1000) return n.toLocaleString(isEn ? 'en-US' : 'uk-UA')
  return String(n)
}

const COMMON_MASKS = [
  { prefix: 8,  mask: '255.0.0.0',       hosts: '16,777,214', use_uk: 'Великі мережі ISP',       use_en: 'Large ISP networks' },
  { prefix: 16, mask: '255.255.0.0',     hosts: '65,534',     use_uk: 'Середні організації',      use_en: 'Medium organizations' },
  { prefix: 24, mask: '255.255.255.0',   hosts: '254',        use_uk: 'Типова офісна мережа',     use_en: 'Typical office network' },
  { prefix: 25, mask: '255.255.255.128', hosts: '126',        use_uk: 'Половина /24',             use_en: 'Half of /24' },
  { prefix: 26, mask: '255.255.255.192', hosts: '62',         use_uk: 'Чверть /24',              use_en: 'Quarter of /24' },
  { prefix: 27, mask: '255.255.255.224', hosts: '30',         use_uk: 'Малий відділ',            use_en: 'Small department' },
  { prefix: 28, mask: '255.255.255.240', hosts: '14',         use_uk: 'Мала група',              use_en: 'Small group' },
  { prefix: 29, mask: '255.255.255.248', hosts: '6',          use_uk: 'Point-to-point + резерв', use_en: 'Point-to-point + spare' },
  { prefix: 30, mask: '255.255.255.252', hosts: '2',          use_uk: 'WAN point-to-point',      use_en: 'WAN point-to-point' },
  { prefix: 32, mask: '255.255.255.255', hosts: '1',          use_uk: 'Host route',              use_en: 'Host route' },
]

export default function SubnetCalculator() {
  const { locale } = useRouter()
  const isEn = locale === 'en'

  const [input, setInput]     = useState('192.168.1.0/24')
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState('')
  const [copied, setCopied]   = useState(null)

  const calculate = useCallback(() => {
    const raw = input.trim()
    let ip = '', prefix = '24'

    if (raw.includes('/')) {
      [ip, prefix] = raw.split('/')
    } else if (raw.includes(' ')) {
      const parts = raw.split(/\s+/)
      ip = parts[0]
      // якщо другий частина — маска
      if (parts[1] && parts[1].includes('.')) {
        // конвертуємо маску в префікс
        const maskInt = ipToInt(parts[1])
        let p = 0
        let m = maskInt
        while (m & 0x80000000) { p++; m = (m << 1) >>> 0 }
        prefix = String(p)
      } else {
        prefix = parts[1] || '24'
      }
    } else {
      ip = raw
    }

    if (!validateIp(ip)) {
      setError(isEn ? 'Invalid IP address. Example: 192.168.1.0/24' : 'Невірна IP-адреса. Приклад: 192.168.1.0/24')
      setResult(null)
      return
    }

    const prefixNum = parseInt(prefix)
    if (isNaN(prefixNum) || prefixNum < 0 || prefixNum > 32) {
      setError(isEn ? 'Prefix must be between 0 and 32' : 'Префікс має бути від 0 до 32')
      setResult(null)
      return
    }

    setError('')
    setResult(calcSubnet(ip, prefix))
  }, [input])

  const handleKey = e => { if (e.key === 'Enter') calculate() }

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key); setTimeout(() => setCopied(null), 1500)
    })
  }

  const canonicalPath = isEn
    ? `${SITE}/en/tools/subnet-calculator`
    : `${SITE}/tools/subnet-calculator`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: isEn
      ? 'IP Subnet Calculator — CIDR, Mask, Host Range Online'
      : 'IP/Subnet калькулятор — розрахунок підмережі онлайн',
    description: isEn
      ? 'Free online subnet calculator. Enter IP and CIDR prefix to get network address, broadcast, host range, wildcard mask and binary representation.'
      : 'Безкоштовний онлайн калькулятор підмереж. Введи IP і маску або CIDR — отримай мережу, broadcast, діапазон хостів, бінарне представлення.',
    url: canonicalPath,
    applicationCategory: 'UtilityApplication',
    inLanguage: isEn ? 'en' : 'uk',
    publisher: { '@type': 'Organization', name: siteConfig.name, url: SITE },
  }

  return (
    <Layout
      title={isEn
        ? 'IP Subnet Calculator — CIDR, Mask, Host Range, Binary'
        : 'IP/Subnet калькулятор — розрахунок підмережі онлайн'}
      description={isEn
        ? 'Free online subnet calculator. Enter IP/CIDR (e.g. 192.168.1.0/24) and get network, broadcast, host range, wildcard mask and binary. Free.'
        : 'Онлайн калькулятор підмереж CIDR. Введи IP і маску — отримай мережу, broadcast, діапазон хостів, wildcard і бінарне представлення. Безкоштовно.'}
      canonical={canonicalPath}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div style={{ padding: '2rem 0 4rem' }}>
        <div className="container">

          <nav style={s.bc}>
            <Link href={isEn ? '/en' : '/'} style={s.bcLink}>{isEn ? 'Home' : 'Головна'}</Link>
            <span style={s.bcSep}>/</span>
            <Link href={isEn ? '/en/tools' : '/tools'} style={s.bcLink}>{isEn ? 'Tools' : 'Інструменти'}</Link>
            <span style={s.bcSep}>/</span>
            <span style={{ ...s.bcLink, color: '#64748b' }}>{isEn ? 'Subnet Calculator' : 'Subnet калькулятор'}</span>
          </nav>

          <div style={s.header}>
            <h1 style={s.title}>🌐 {isEn ? 'IP / Subnet Calculator' : 'IP / Subnet калькулятор'}</h1>
            <p style={s.subtitle}>{isEn ? 'CIDR, subnet mask, host range — all calculations online' : 'CIDR, маска підмережі, діапазон хостів — всі розрахунки онлайн'}</p>
          </div>

          {/* Input */}
          <div style={s.inputBox}>
            <div style={s.inputRow}>
              <input
                style={error ? { ...s.input, borderColor: '#f87171' } : s.input}
                type="text"
                value={input}
                onChange={e => { setInput(e.target.value); setError('') }}
                onKeyDown={handleKey}
                placeholder="192.168.1.0/24 або 10.0.0.1 255.255.255.0"
                autoFocus
              />
              <button style={s.btn} onClick={calculate}>{isEn ? 'Calculate' : 'Розрахувати'}</button>
            </div>
            {error && <p style={s.error}>{error}</p>}
            <div style={s.examples}>
              {isEn ? 'Examples:' : 'Приклади:'}{' '}
              {['192.168.1.0/24', '10.0.0.0/8', '172.16.0.0/16', '192.168.1.100/27', '10.10.10.0/30'].map(ex => (
                <button key={ex} style={s.exChip} onClick={() => { setInput(ex); setTimeout(calculate, 0) }}>{ex}</button>
              ))}
            </div>
          </div>

          {/* Result */}
          {result && (
            <div style={s.resultWrap}>

              {/* Main info */}
              <div style={s.resultGrid}>
                {[
                  { label: isEn ? 'IP address'    : 'IP-адреса',        val: result.ip,        key: 'ip' },
                  { label: isEn ? 'Prefix'        : 'Префікс',           val: `/${result.prefix}`, key: 'prefix' },
                  { label: isEn ? 'Subnet mask'   : 'Маска підмережі',   val: result.mask,      key: 'mask' },
                  { label: isEn ? 'Wildcard mask' : 'Wildcard маска',    val: result.wildcard,  key: 'wildcard' },
                  { label: isEn ? 'Network'       : 'Адреса мережі',     val: result.network,   key: 'network' },
                  { label: isEn ? 'Broadcast'     : 'Broadcast',         val: result.broadcast, key: 'bcast' },
                  { label: isEn ? 'First host'    : 'Перший хост',       val: result.firstHost, key: 'first' },
                  { label: isEn ? 'Last host'     : 'Останній хост',     val: result.lastHost,  key: 'last' },
                  { label: isEn ? 'Host count'  : 'Кількість хостів',  val: formatHostCount(result.hostCount, isEn), key: 'count' },
                  { label: isEn ? 'IP class'      : 'Клас IP',           val: result.ipClass,   key: 'class' },
                  { label: isEn ? 'Address type'  : 'Тип адреси',        val: result.ipType,    key: 'type' },
                ].map(({ label, val, key }) => (
                  <div key={key} style={s.resultRow}>
                    <span style={s.resultLabel}>{label}</span>
                    <div style={s.resultValWrap}>
                      <span style={s.resultVal}>{val}</span>
                      {['ip','mask','network','bcast','first','last'].includes(key) && (
                        <button style={copied === key ? s.cpOn : s.cpOff} onClick={() => copy(val, key)}>
                          {copied === key ? '✓' : '⎘'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Binary */}
              <div style={s.binaryBox}>
                <p style={s.binaryTitle}>{isEn ? 'Binary representation' : 'Бінарне представлення'}</p>
                <div style={s.binaryRow}>
                  <span style={s.binaryLabel}>IP:</span>
                  <code style={s.binaryVal}>{result.ipBinary}</code>
                </div>
                <div style={s.binaryRow}>
                  <span style={s.binaryLabel}>{isEn ? 'Mask:' : 'Маска:'}</span>
                  <code style={s.binaryVal}>{result.maskBinary}</code>
                </div>
                <div style={s.binaryNote}>
                  {result.prefix > 0 && (
                    <>
                      <span style={{ color: '#2563eb', fontWeight: 700 }}>{'█'.repeat(result.prefix)}</span>
                      <span style={{ color: '#94a3b8' }}>{'░'.repeat(32 - result.prefix)}</span>
                      {isEn ? ` — network part (${result.prefix} bits) / host part (${32 - result.prefix} bits)` : ` — мережева частина (${result.prefix} біт) / хостова частина (${32 - result.prefix} біт)`}
                    </>
                  )}
                </div>
              </div>

              {/* CIDR notation */}
              <div style={s.cidrBox}>
                <p style={s.binaryTitle}>{isEn ? 'CIDR notation' : 'CIDR запис'}</p>
                <div style={s.cidrRow}>
                  <code style={s.cidrCode}>{result.network}/{result.prefix}</code>
                  <button style={copied === 'cidr' ? s.cpOn : s.cpOff}
                    onClick={() => copy(`${result.network}/${result.prefix}`, 'cidr')}>
                    {copied === 'cidr' ? '✓ ' + (isEn ? 'Copied' : 'Скопійовано') : '⎘ ' + (isEn ? 'Copy' : 'Копіювати')}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Common masks table */}
          <div style={s.section}>
            <h2 style={s.h2}>{isEn ? 'Common subnet masks' : 'Таблиця поширених масок'}</h2>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {(isEn ? ['Prefix', 'Mask', 'Hosts', 'Use case'] : ['Префікс', 'Маска', 'Хостів', 'Використання']).map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMMON_MASKS.map(row => (
                    <tr key={row.prefix} style={s.tr}
                      onClick={() => { setInput(`192.168.1.0/${row.prefix}`); setTimeout(calculate, 0) }}>
                      <td style={s.tdMono}>/{row.prefix}</td>
                      <td style={s.tdMono}>{row.mask}</td>
                      <td style={s.tdMono}>{row.hosts}</td>
                      <td style={s.td}>{isEn ? row.use_en : row.use_uk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={s.tableNote}>{isEn ? 'Click a row to calculate for 192.168.1.0 with that mask' : 'Клікни на рядок щоб розрахувати для 192.168.1.0 з цією маскою'}</p>
          </div>

          {/* SEO */}
          <div style={s.seoBlock}>
            <h2 style={s.seoH2}>{isEn ? 'How to use the calculator' : 'Як користуватись калькулятором'}</h2>
            <p style={s.seoP}>{isEn
              ? <span>Enter an IP address with CIDR prefix (e.g. <code style={s.code}>192.168.1.0/24</code>) or with subnet mask separated by space (<code style={s.code}>192.168.1.0 255.255.255.0</code>). The calculator auto-detects the format.</span>
              : <span>Введи IP-адресу з CIDR префіксом (наприклад <code style={s.code}>192.168.1.0/24</code>) або з маскою підмережі через пробіл (<code style={s.code}>192.168.1.0 255.255.255.0</code>). Калькулятор автоматично визначить формат.</span>
            }</p>
            <p style={s.seoP}>{isEn
              ? <span><strong>CIDR /24</strong> means the first 24 bits are the network part. A /24 gives 256 addresses (254 usable hosts, 1 network, 1 broadcast).</span>
              : <span><strong>CIDR /24</strong> означає що перші 24 біти — мережева частина. Для /24 це дає 256 адрес (254 використовуваних хости, 1 мережева, 1 broadcast).</span>
            }</p>
            <p style={s.seoP}>
              {isEn ? 'For configuring Windows network settings use ' : 'Для налаштування мережевих параметрів Windows використовуй '}
              <Link href={isEn ? '/en/tools/powershell-commands' : '/tools/powershell-commands'} style={s.link}>
                {isEn ? 'PowerShell Reference' : 'PowerShell довідник'}
              </Link>.
              {isEn ? ' For network security audit — ' : ' Для перевірки мережевої безпеки ПК — '}
              <Link href={isEn ? '/en/tools/auditshield' : '/tools/auditshield'} style={s.link}>AuditShield</Link>.
            </p>
          </div>

          <div style={s.back}>
            <Link href={isEn ? '/tools' : '/tools'} style={s.backLink}>{isEn ? '← All tools' : '← Всі інструменти'}</Link>
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
  header: { textAlign: 'center', marginBottom: '2rem' },
  title: { fontFamily: "'Unbounded', sans-serif", fontSize: 'clamp(1.4rem,4vw,1.9rem)', fontWeight: 700, color: '#0f172a', marginBottom: '8px' },
  subtitle: { fontSize: '0.875rem', color: '#64748b', fontFamily: 'var(--font-mono)', margin: 0 },

  inputBox: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem' },
  inputRow: { display: 'flex', gap: '10px', marginBottom: '10px' },
  input: { flex: 1, padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '1rem', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', background: '#fff', color: '#0f172a' },
  btn: { padding: '12px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', whiteSpace: 'nowrap' },
  error: { color: '#dc2626', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', margin: '0 0 8px' },
  examples: { display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', fontSize: '0.8rem', color: '#94a3b8' },
  exChip: { fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: '20px', cursor: 'pointer' },

  resultWrap: { marginBottom: '2.5rem' },
  resultGrid: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' },
  resultRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 1.25rem', borderBottom: '1px solid #f1f5f9' },
  resultLabel: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#64748b', fontWeight: 600 },
  resultValWrap: { display: 'flex', alignItems: 'center', gap: '8px' },
  resultVal: { fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' },
  cpOn: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#16a34a', fontWeight: 800, background: 'transparent', border: 'none', cursor: 'pointer' },
  cpOff: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' },

  binaryBox: { background: '#0f172a', borderRadius: '12px', padding: '1.25rem', marginBottom: '12px' },
  binaryTitle: { fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' },
  binaryRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' },
  binaryLabel: { fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#64748b', width: '40px', flexShrink: 0 },
  binaryVal: { fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#7dd3fc', letterSpacing: '1px', wordBreak: 'break-all' },
  binaryNote: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#475569', marginTop: '10px' },

  cidrBox: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' },
  cidrRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  cidrCode: { fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800, color: '#2563eb' },

  section: { marginBottom: '2.5rem' },
  h2: { fontFamily: "'Unbounded', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' },
  th: { fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', padding: '10px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' },
  tr: { borderBottom: '1px solid #f1f5f9', cursor: 'pointer' },
  tdMono: { fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#0f172a', padding: '10px 14px' },
  td: { fontSize: '0.8rem', color: '#64748b', padding: '10px 14px' },
  tableNote: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#94a3b8', marginTop: '8px' },

  seoBlock: { padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', marginBottom: '2rem' },
  seoH2: { fontFamily: "'Unbounded', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' },
  seoP: { fontSize: '0.875rem', color: '#475569', lineHeight: 1.8, marginBottom: '8px' },
  code: { fontFamily: 'var(--font-mono)', background: '#e2e8f0', padding: '1px 4px', borderRadius: '3px', fontSize: '0.85em' },
  link: { color: '#2563eb', fontWeight: 500, textDecoration: 'none' },
  back: { paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' },
  backLink: { fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#2563eb', fontWeight: 500, textDecoration: 'none' },
}
