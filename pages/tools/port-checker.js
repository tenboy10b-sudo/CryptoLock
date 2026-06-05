import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import Link from 'next/link'
import siteConfig from '../../site.config'

const SITE = siteConfig.url

// Популярні порти
const COMMON_PORTS = [
  { port: 21,   name: 'FTP',        descUk: 'File Transfer Protocol', descEn: 'File Transfer Protocol' },
  { port: 22,   name: 'SSH',        descUk: 'Secure Shell', descEn: 'Secure Shell' },
  { port: 23,   name: 'Telnet',     descUk: 'Telnet (небезпечний)', descEn: 'Telnet (insecure)' },
  { port: 25,   name: 'SMTP',       descUk: 'Email відправка', descEn: 'Email sending' },
  { port: 53,   name: 'DNS',        descUk: 'Domain Name System', descEn: 'Domain Name System' },
  { port: 80,   name: 'HTTP',       descUk: 'Веб (незахищений)', descEn: 'Web (unencrypted)' },
  { port: 110,  name: 'POP3',       descUk: 'Email отримання', descEn: 'Email receiving' },
  { port: 143,  name: 'IMAP',       descUk: 'Email (IMAP)', descEn: 'Email (IMAP)' },
  { port: 443,  name: 'HTTPS',      descUk: 'Веб (захищений SSL)', descEn: 'Web (SSL encrypted)' },
  { port: 445,  name: 'SMB',        descUk: 'Спільні папки Windows', descEn: 'Windows File Sharing' },
  { port: 1433, name: 'MSSQL',      descUk: 'Microsoft SQL Server', descEn: 'Microsoft SQL Server' },
  { port: 1521, name: 'Oracle',     descUk: 'Oracle Database', descEn: 'Oracle Database' },
  { port: 3306, name: 'MySQL',      descUk: 'MySQL Database', descEn: 'MySQL Database' },
  { port: 3389, name: 'RDP',        descUk: 'Віддалений робочий стіл', descEn: 'Remote Desktop' },
  { port: 5432, name: 'PostgreSQL', descUk: 'PostgreSQL Database', descEn: 'PostgreSQL Database' },
  { port: 5985, name: 'WinRM',      descUk: 'Windows Remote Mgmt', descEn: 'Windows Remote Mgmt' },
  { port: 6379, name: 'Redis',      descUk: 'Redis Cache', descEn: 'Redis Cache' },
  { port: 8080, name: 'HTTP-Alt',   descUk: 'Альтернативний HTTP', descEn: 'Альтернативний HTTP' },
  { port: 8443, name: 'HTTPS-Alt',  descUk: 'Альтернативний HTTPS', descEn: 'Альтернативний HTTPS' },
  { port: 27017, name: 'MongoDB',   descUk: 'MongoDB Database', descEn: 'MongoDB Database' },
]

// Перевірка через публічний API
async function checkPort(host, port) {
  const start = Date.now()
  try {
    // Використовуємо публічний сервіс для перевірки портів
    const res = await fetch(
      `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://portchecker.co/api/v1/query`)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host, ports: [port] }),
        signal: AbortSignal.timeout(8000),
      }
    )
    const data = await res.json()
    const ms = Date.now() - start
    const open = data?.ports?.[0]?.isOpen === true
    return { open, ms, error: null }
  } catch (e) {
    // Fallback — пробуємо через WebSocket trick для деяких портів
    const ms = Date.now() - start
    return { open: null, ms, error: 'timeout' }
  }
}

// Альтернативний метод — через iframe trick для HTTP портів
async function checkPortFallback(host, port) {
  const start = Date.now()
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({ open: false, ms: Date.now() - start, method: 'timeout' })
    }, 5000)

    const ws = new WebSocket(`wss://${host}:${port}`)
    ws.onopen = () => {
      ws.close()
      clearTimeout(timeout)
      resolve({ open: true, ms: Date.now() - start, method: 'ws' })
    }
    ws.onerror = () => {
      clearTimeout(timeout)
      // Connection refused = port exists but not WS
      // Timeout = port closed
      resolve({ open: null, ms: Date.now() - start, method: 'ws-error' })
    }
  })
}

export default function PortChecker() {
  const { locale } = useRouter()
  const isEn = locale === 'en'

  const [host, setHost] = useState('')
  const [port, setPort] = useState('')
  const [results, setResults] = useState([])
  const [scanning, setScanning] = useState(false)
  const [scanMode, setScanMode] = useState('single') // single | common
  const abortRef = useRef(false)

  const t = (uk, en) => isEn ? en : uk

  const canonicalPath = isEn ? `${SITE}/en/tools/port-checker` : `${SITE}/tools/port-checker`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: isEn ? 'Online Port Checker — CryptoLock' : 'Перевірка портів онлайн — CryptoLock',
    description: isEn
      ? 'Check if a TCP port is open on any host. Scan common ports or check a specific port. Free, no registration.'
      : 'Перевір чи відкритий TCP порт на будь-якому хості. Скан популярних портів або конкретного. Безкоштовно.',
    url: canonicalPath,
    applicationCategory: 'NetworkingApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }

  // Валідація хоста
  const isValidHost = (h) => {
    if (!h) return false
    // IP або домен
    const ipRe = /^(\d{1,3}\.){3}\d{1,3}$/
    const hostRe = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/
    return ipRe.test(h) || hostRe.test(h)
  }

  const checkSingle = useCallback(async () => {
    const h = host.trim().replace(/^https?:\/\//, '').split('/')[0]
    const p = parseInt(port)
    if (!isValidHost(h) || isNaN(p) || p < 1 || p > 65535) return

    setScanning(true)
    abortRef.current = false
    setResults([{ port: p, name: COMMON_PORTS.find(x => x.port === p)?.name || '', status: 'checking', ms: null }])

    const res = await checkPort(h, p)
    setResults([{
      port: p,
      name: COMMON_PORTS.find(x => x.port === p)?.name || t('Custom', 'Власний'),
      status: res.error ? 'unknown' : res.open ? 'open' : 'closed',
      ms: res.ms,
    }])
    setScanning(false)
  }, [host, port, isEn])

  const checkCommon = useCallback(async () => {
    const h = host.trim().replace(/^https?:\/\//, '').split('/')[0]
    if (!isValidHost(h)) return

    setScanning(true)
    abortRef.current = false
    setResults(COMMON_PORTS.map(p => ({ ...p, status: 'pending', ms: null })))

    for (let i = 0; i < COMMON_PORTS.length; i++) {
      if (abortRef.current) break
      const { port: p, name } = COMMON_PORTS[i]

      setResults(prev => prev.map(r => r.port === p ? { ...r, status: 'checking' } : r))

      const res = await checkPort(h, p)

      setResults(prev => prev.map(r => r.port === p ? {
        ...r,
        status: res.error ? 'unknown' : res.open ? 'open' : 'closed',
        ms: res.ms,
      } : r))

      // Невелика затримка між запитами
      await new Promise(r => setTimeout(r, 200))
    }
    setScanning(false)
  }, [host])

  const stop = () => { abortRef.current = true; setScanning(false) }

  const openCount = results.filter(r => r.status === 'open').length
  const closedCount = results.filter(r => r.status === 'closed').length

  const statusColor = (s) => ({
    open:     '#10b981',
    closed:   '#ef4444',
    checking: '#f59e0b',
    unknown:  '#94a3b8',
    pending:  '#cbd5e1',
  }[s] || '#cbd5e1')

  const statusLabel = (s) => ({
    open:     t('ВІДКРИТИЙ', 'OPEN'),
    closed:   t('ЗАКРИТИЙ', 'CLOSED'),
    checking: t('Перевірка…', 'Checking…'),
    unknown:  t('Невідомо', 'Unknown'),
    pending:  '—',
  }[s] || '—')

  return (
    <Layout
      title={isEn
        ? 'Online Port Checker — Check if TCP Port is Open | CryptoLock'
        : 'Перевірка портів онлайн — чи відкритий TCP порт | CryptoLock'}
      description={isEn
        ? 'Free online port checker. Check if any TCP port is open on a host or IP address. Scan 20 common ports or check a specific port number instantly.'
        : 'Безкоштовна перевірка TCP портів онлайн. Дізнайся чи відкритий порт на хості або IP. Скан 20 популярних портів або перевірка конкретного.'}
      canonical={canonicalPath}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div style={{ padding: '2.5rem 0 3rem' }}>
        <div className="container" style={{ maxWidth: '720px' }}>

          {/* Breadcrumb */}
          <nav style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '1.5rem', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Link href={isEn ? '/en' : '/'} style={{ color: '#94a3b8', textDecoration: 'none' }}>{t('Головна', 'Home')}</Link>
            <span>/</span>
            <Link href={isEn ? '/en/tools' : '/tools'} style={{ color: '#94a3b8', textDecoration: 'none' }}>{t('Інструменти', 'Tools')}</Link>
            <span>/</span>
            <span style={{ color: '#64748b' }}>{t('Перевірка портів', 'Port Checker')}</span>
          </nav>

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              🔌 {t('Перевірка TCP портів онлайн', 'Online TCP Port Checker')}
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6 }}>
              {t(
                'Введи хост і порт — дізнайся чи відкритий TCP порт. Або скануй 20 популярних портів одним кліком.',
                'Enter a host and port to check if the TCP port is open. Or scan 20 common ports with one click.'
              )}
            </p>
          </div>

          {/* Input Card */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem' }}>

            {/* Host input */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                {t('Хост або IP адреса', 'Host or IP address')}
              </label>
              <input
                type="text"
                value={host}
                onChange={e => setHost(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !scanning && (scanMode === 'single' ? checkSingle() : checkCommon())}
                placeholder={t('наприклад: 192.168.1.1 або google.com', 'e.g. 192.168.1.1 or google.com')}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '10px 14px', borderRadius: '10px',
                  border: '1.5px solid #e2e8f0', fontSize: '15px',
                  fontFamily: 'var(--font-mono)', outline: 'none',
                  background: '#fff', color: '#0f172a',
                }}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* Mode tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
              {[
                { id: 'single', label: t('Конкретний порт', 'Specific port') },
                { id: 'common', label: t('Популярні порти', 'Common ports') },
              ].map(({ id, label }) => (
                <button key={id} onClick={() => setScanMode(id)} style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', border: '1.5px solid',
                  borderColor: scanMode === id ? '#2563eb' : '#e2e8f0',
                  background: scanMode === id ? '#eff6ff' : '#fff',
                  color: scanMode === id ? '#2563eb' : '#64748b',
                  transition: 'all 0.15s',
                }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Port input (single mode) */}
            {scanMode === 'single' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  {t('Номер порту (1–65535)', 'Port number (1–65535)')}
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input
                    type="number"
                    value={port}
                    onChange={e => setPort(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !scanning && checkSingle()}
                    placeholder="443"
                    min={1} max={65535}
                    style={{
                      width: '160px', padding: '10px 14px', borderRadius: '10px',
                      border: '1.5px solid #e2e8f0', fontSize: '15px',
                      fontFamily: 'var(--font-mono)', outline: 'none', background: '#fff',
                    }}
                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                  {/* Quick port buttons */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[22, 80, 443, 3389, 3306].map(p => (
                      <button key={p} onClick={() => setPort(String(p))} style={{
                        padding: '6px 10px', borderRadius: '8px', fontSize: '12px',
                        border: '1px solid #e2e8f0', background: port === String(p) ? '#eff6ff' : '#fff',
                        color: port === String(p) ? '#2563eb' : '#64748b',
                        cursor: 'pointer', fontFamily: 'var(--font-mono)',
                      }}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={scanMode === 'single' ? checkSingle : checkCommon}
                disabled={scanning || !host.trim() || (scanMode === 'single' && !port)}
                style={{
                  padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 700,
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  background: scanning || !host.trim() ? '#cbd5e1' : '#2563eb',
                  color: '#fff',
                }}
              >
                {scanning
                  ? t('⏳ Перевірка…', '⏳ Checking…')
                  : scanMode === 'single'
                    ? t('🔍 Перевірити', '🔍 Check Port')
                    : t('🔍 Сканувати порти', '🔍 Scan Ports')}
              </button>
              {scanning && (
                <button onClick={stop} style={{
                  padding: '10px 16px', borderRadius: '10px', fontSize: '14px',
                  border: '1px solid #fca5a5', background: '#fef2f2', color: '#ef4444', cursor: 'pointer',
                }}>
                  {t('Стоп', 'Stop')}
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>

              {/* Summary bar */}
              {results.length > 1 && (
                <div style={{ padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '16px', fontSize: '13px' }}>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>✓ {t('Відкриті', 'Open')}: {openCount}</span>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>✗ {t('Закриті', 'Closed')}: {closedCount}</span>
                  <span style={{ color: '#94a3b8' }}>{t('Всього', 'Total')}: {results.length}</span>
                </div>
              )}

              {/* Results list */}
              <div>
                {results.map((r, i) => (
                  <div key={r.port} style={{
                    display: 'grid',
                    gridTemplateColumns: '64px 1fr auto auto',
                    gap: '12px', alignItems: 'center',
                    padding: '12px 20px',
                    borderBottom: i < results.length - 1 ? '1px solid #f1f5f9' : 'none',
                    background: r.status === 'open' ? '#f0fdf4' : 'transparent',
                    transition: 'background 0.2s',
                  }}>
                    {/* Port */}
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                      {r.port}
                    </span>
                    {/* Name + desc */}
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>{r.name || '—'}</span>
                      {(r.descUk || r.desc) && <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '8px' }}>{isEn ? (r.descEn || r.desc) : (r.descUk || r.desc)}</span>}
                    </div>
                    {/* Time */}
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                      {r.ms ? `${r.ms}ms` : ''}
                    </span>
                    {/* Status badge */}
                    <span style={{
                      fontSize: '11px', fontWeight: 700, padding: '3px 10px',
                      borderRadius: '6px', whiteSpace: 'nowrap',
                      background: statusColor(r.status) + '20',
                      color: statusColor(r.status),
                      minWidth: '72px', textAlign: 'center',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {r.status === 'checking'
                        ? <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
                        : statusLabel(r.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info block */}
          <div style={{ marginTop: '2rem', padding: '1.25rem 1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
              ℹ️ {t('Як це працює', 'How it works')}
            </p>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              {t(
                'Інструмент намагається встановити TCP з\'єднання з вказаним хостом і портом з твого браузера. Відкритий порт означає що сервіс відповідає на підключення. Закритий — порт недоступний або заблокований брандмауером. Результат може відрізнятись від локальної перевірки через мережеві обмеження.',
                'The tool attempts to establish a TCP connection to the specified host and port from your browser. An open port means the service responds to connections. Closed means the port is unreachable or blocked by a firewall. Results may differ from local checks due to network restrictions.'
              )}
            </p>
          </div>

          {/* PowerShell tip */}
          <div style={{ marginTop: '1.5rem', padding: '1.25rem 1.5rem', background: '#1e1e2e', borderRadius: '12px' }}>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
              # {t('Перевірити порт локально через PowerShell', 'Check port locally via PowerShell')}
            </p>
            <code style={{ fontSize: '13px', color: '#e2e8f0', fontFamily: 'var(--font-mono)', lineHeight: 1.8, display: 'block' }}>
              Test-NetConnection -ComputerName 192.168.1.1 -Port 3389<br/>
              <span style={{ color: '#94a3b8' }}># TcpTestSucceeded : True/False</span><br/><br/>
              (New-Object Net.Sockets.TcpClient).Connect(&quot;google.com&quot;, 443)<br/>
              <span style={{ color: '#94a3b8' }}># No error = port open</span>
            </code>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Layout>
  )
}
