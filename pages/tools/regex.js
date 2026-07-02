import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import Link from 'next/link'
import siteConfig from '../../site.config'

const SITE = siteConfig.url

// Популярні готові регулярки
const PRESETS = {
  uk: [
    { label: 'IPv4 адреса',        pattern: '^(\\d{1,3}\\.){3}\\d{1,3}$',           flags: '',  test: '192.168.1.1' },
    { label: 'Email',              pattern: '^[\\w.-]+@[\\w.-]+\\.[a-z]{2,}$',        flags: 'i', test: 'user@example.com' },
    { label: 'URL',                pattern: 'https?:\\/\\/[\\w.-]+(?:\\/[\\w./?=#&-]*)?', flags: 'i', test: 'https://example.com/path?q=1' },
    { label: 'Дата (DD.MM.YYYY)', pattern: '^(\\d{2})\\.(\\d{2})\\.(\\d{4})$',       flags: '',  test: '24.06.2026' },
    { label: 'GUID/UUID',          pattern: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', flags: 'i', test: '550e8400-e29b-41d4-a716-446655440000' },
    { label: 'Шлях Windows',       pattern: '^[A-Za-z]:\\\\(?:[^\\\\/:*?"<>|\\r\\n]+\\\\)*[^\\\\/:*?"<>|\\r\\n]*$', flags: '', test: 'C:\\Windows\\System32\\cmd.exe' },
    { label: 'MAC адреса',         pattern: '^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$', flags: '', test: 'AA:BB:CC:DD:EE:FF' },
    { label: 'Версія SemVer',      pattern: '^(\\d+)\\.(\\d+)\\.(\\d+)(?:-[\\w.]+)?$', flags: '', test: '1.2.3-beta.1' },
    { label: 'PowerShell змінна',  pattern: '\\$[A-Za-z_][\\w]*',                    flags: 'g', test: '$myVar = $env:PATH' },
    { label: 'Event ID у логах',   pattern: 'EventID[=:\\s]+(\\d+)',                  flags: 'i', test: 'EventID=4625 Source=Security' },
  ],
  en: [
    { label: 'IPv4 address',       pattern: '^(\\d{1,3}\\.){3}\\d{1,3}$',           flags: '',  test: '192.168.1.1' },
    { label: 'Email',              pattern: '^[\\w.-]+@[\\w.-]+\\.[a-z]{2,}$',        flags: 'i', test: 'user@example.com' },
    { label: 'URL',                pattern: 'https?:\\/\\/[\\w.-]+(?:\\/[\\w./?=#&-]*)?', flags: 'i', test: 'https://example.com/path?q=1' },
    { label: 'Date (DD.MM.YYYY)', pattern: '^(\\d{2})\\.(\\d{2})\\.(\\d{4})$',       flags: '',  test: '24.06.2026' },
    { label: 'GUID/UUID',          pattern: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', flags: 'i', test: '550e8400-e29b-41d4-a716-446655440000' },
    { label: 'Windows path',       pattern: '^[A-Za-z]:\\\\(?:[^\\\\/:*?"<>|\\r\\n]+\\\\)*[^\\\\/:*?"<>|\\r\\n]*$', flags: '', test: 'C:\\Windows\\System32\\cmd.exe' },
    { label: 'MAC address',        pattern: '^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$', flags: '', test: 'AA:BB:CC:DD:EE:FF' },
    { label: 'SemVer version',     pattern: '^(\\d+)\\.(\\d+)\\.(\\d+)(?:-[\\w.]+)?$', flags: '', test: '1.2.3-beta.1' },
    { label: 'PowerShell variable',pattern: '\\$[A-Za-z_][\\w]*',                    flags: 'g', test: '$myVar = $env:PATH' },
    { label: 'Event ID in logs',   pattern: 'EventID[=:\\s]+(\\d+)',                  flags: 'i', test: 'EventID=4625 Source=Security' },
  ],
}

export default function RegexTester() {
  const { locale } = useRouter()
  const [mounted, setMounted] = useState(false)
  const isEn = mounted ? locale === 'en' : false
  useEffect(() => { setMounted(true) }, [])
  const t = (uk, en) => isEn ? en : uk

  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [testText, setTestText] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')

  const canonicalPath = isEn ? `${SITE}/en/tools/regex` : `${SITE}/tools/regex`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: isEn ? 'Regex Tester — CryptoLock' : 'Тестер регулярних виразів — CryptoLock',
    description: isEn
      ? 'Free online regex tester. Test regular expressions with live highlighting, match details and ready-made presets for Windows administration.'
      : 'Безкоштовний тестер регулярних виразів онлайн. Живе підсвічування збігів, деталі груп та готові шаблони для адміністрування Windows.',
    url: canonicalPath,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }

  // Обчислюємо збіги
  const getResult = useCallback(() => {
    if (!pattern || !testText) return { matches: [], error: '', highlighted: testText }
    try {
      const re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g')
      const matches = []
      let m
      const reGlobal = new RegExp(pattern, 'g' + flags.replace('g',''))
      while ((m = reGlobal.exec(testText)) !== null) {
        matches.push({
          index: m.index,
          length: m[0].length,
          value: m[0],
          groups: m.slice(1),
        })
        if (!flags.includes('g')) break
      }
      setError('')
      return { matches, error: '' }
    } catch (e) {
      setError(e.message)
      return { matches: [], error: e.message }
    }
  }, [pattern, flags, testText])

  const { matches } = getResult()

  // Підсвічування збігів у тексті
  const renderHighlighted = () => {
    if (!testText) return null
    if (!pattern || matches.length === 0) return <span style={{ color: '#334155' }}>{testText}</span>
    const parts = []
    let last = 0
    matches.forEach((m, i) => {
      if (m.index > last) parts.push(<span key={`t${i}`} style={{ color: '#334155' }}>{testText.slice(last, m.index)}</span>)
      parts.push(
        <mark key={`m${i}`} style={{
          background: `hsl(${200 + i * 37}, 85%, 85%)`,
          color: '#0f172a', borderRadius: '3px', padding: '0 2px',
          fontWeight: 600,
        }}>
          {m.value}
        </mark>
      )
      last = m.index + m.length
    })
    if (last < testText.length) parts.push(<span key="tend" style={{ color: '#334155' }}>{testText.slice(last)}</span>)
    return parts
  }

  const copy = (val, key) => {
    navigator.clipboard.writeText(val).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(''), 2000)
    })
  }

  const loadPreset = (p) => {
    setPattern(p.pattern)
    setFlags(p.flags || 'g')
    setTestText(p.test)
    setError('')
  }

  const allFlags = ['g', 'i', 'm', 's']
  const flagDesc = { g: t('глобальний', 'global'), i: t('без регістру', 'case insensitive'), m: t('багаторядковий', 'multiline'), s: t('крапка = будь-що', 'dot all') }

  const toggleFlag = (f) => {
    setFlags(prev => prev.includes(f) ? prev.replace(f, '') : prev + f)
  }

  const psCode = pattern ? `$text = "${testText.replace(/"/g, '`"').slice(0, 60)}"\n$regex = [regex]"${pattern}"\n$matches = $regex.Matches($text)\n$matches | ForEach-Object { Write-Host $_.Value }` : ''

  return (
    <Layout
      title={isEn
        ? 'Regex Tester Online — Regular Expressions for PowerShell | CryptoLock'
        : 'Тестер регулярних виразів онлайн — RegEx для PowerShell | CryptoLock'}
      description={isEn
        ? 'Free online regex tester with live match highlighting. Test regular expressions, view match groups and use ready-made patterns for Windows administration and PowerShell.'
        : 'Безкоштовний тестер регулярних виразів з живим підсвічуванням збігів. Тестуй regex, переглядай групи і використовуй готові шаблони для PowerShell і адміністрування Windows.'}
      canonical={canonicalPath}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div style={{ padding: '2.5rem 0 3rem' }}>
        <div className="container" style={{ maxWidth: '860px' }}>

          {/* Breadcrumb */}
          <nav style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '1.5rem', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Link href={isEn ? '/en' : '/'} style={{ color: '#94a3b8', textDecoration: 'none' }}>{t('Головна', 'Home')}</Link>
            <span>/</span>
            <Link href={isEn ? '/en/tools' : '/tools'} style={{ color: '#94a3b8', textDecoration: 'none' }}>{t('Інструменти', 'Tools')}</Link>
            <span>/</span>
            <span style={{ color: '#64748b' }}>Regex Tester</span>
          </nav>

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
              🔎 {t('Тестер регулярних виразів', 'Regex Tester')}
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
              {t(
                'Тестуй регулярні вирази з живим підсвічуванням збігів. Готові шаблони для IP, email, шляхів Windows і PowerShell.',
                'Test regular expressions with live match highlighting. Ready-made patterns for IP, email, Windows paths and PowerShell.'
              )}
            </p>
          </div>

          {/* Main grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>

            {/* Pattern input */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                {t('Регулярний вираз', 'Regular Expression')}
              </label>
              <div style={{ display: 'flex', gap: '0', alignItems: 'stretch' }}>
                <span style={{ padding: '10px 12px', background: '#e2e8f0', borderRadius: '10px 0 0 10px', fontSize: '18px', color: '#94a3b8', lineHeight: 1, display: 'flex', alignItems: 'center' }}>/</span>
                <input
                  type="text"
                  value={pattern}
                  onChange={e => setPattern(e.target.value)}
                  placeholder={t('Введіть regex…', 'Enter regex…')}
                  style={{
                    flex: 1, padding: '10px 12px', border: '1.5px solid #e2e8f0',
                    borderLeft: 'none', borderRight: 'none', fontSize: '15px',
                    fontFamily: 'var(--font-mono)', outline: 'none', background: '#fff',
                  }}
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  spellCheck={false}
                />
                <span style={{ padding: '10px 12px', background: '#e2e8f0', borderRadius: '0 10px 10px 0', fontSize: '18px', color: '#94a3b8', lineHeight: 1, display: 'flex', alignItems: 'center' }}>/{flags}</span>
              </div>

              {/* Flags */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', alignSelf: 'center' }}>{t('Флаги:', 'Flags:')}</span>
                {allFlags.map(f => (
                  <button key={f} onClick={() => toggleFlag(f)} style={{
                    padding: '3px 10px', borderRadius: '6px', fontSize: '12px',
                    fontFamily: 'var(--font-mono)', fontWeight: 700, cursor: 'pointer',
                    border: '1.5px solid',
                    borderColor: flags.includes(f) ? '#2563eb' : '#e2e8f0',
                    background: flags.includes(f) ? '#eff6ff' : '#fff',
                    color: flags.includes(f) ? '#2563eb' : '#94a3b8',
                  }}>
                    {f} <span style={{ fontFamily: 'sans-serif', fontWeight: 400, fontSize: '11px', color: '#94a3b8' }}>— {flagDesc[f]}</span>
                  </button>
                ))}
              </div>

              {/* Error */}
              {error && (
                <div style={{ marginTop: '8px', padding: '8px 12px', background: '#fef2f2', borderRadius: '8px', color: '#dc2626', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                  ⚠️ {error}
                </div>
              )}
            </div>

            {/* Test string */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                  {t('Тестовий рядок', 'Test string')}
                </label>
                <span style={{ fontSize: '12px', color: matches.length > 0 ? '#10b981' : '#94a3b8', fontWeight: 600 }}>
                  {pattern && testText
                    ? (error ? '⚠️' : matches.length > 0
                      ? `✓ ${matches.length} ${t('збіг(ів)', 'match(es)')}`
                      : `✗ ${t('немає збігів', 'no matches')}`)
                    : ''}
                </span>
              </div>
              <textarea
                value={testText}
                onChange={e => setTestText(e.target.value)}
                placeholder={t('Вставте текст для перевірки…', 'Paste text to test against…')}
                rows={4}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '10px 14px', borderRadius: '10px',
                  border: '1.5px solid #e2e8f0', fontSize: '14px',
                  fontFamily: 'var(--font-mono)', outline: 'none',
                  background: '#fff', resize: 'vertical', lineHeight: 1.6,
                }}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                spellCheck={false}
              />
            </div>

            {/* Highlighted result */}
            {testText && pattern && !error && (
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#475569', margin: '0 0 10px' }}>
                  {t('Підсвічування збігів', 'Match highlighting')}
                </p>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '14px',
                  lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                  padding: '10px 14px', background: '#f8fafc', borderRadius: '8px',
                }}>
                  {renderHighlighted()}
                </div>
              </div>
            )}

            {/* Match details */}
            {matches.length > 0 && (
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#475569', margin: 0 }}>
                    {t('Деталі збігів', 'Match details')} ({matches.length})
                  </p>
                  <button onClick={() => copy(matches.map(m => m.value).join('\n'), 'matches')} style={{
                    fontSize: '12px', padding: '3px 10px', borderRadius: '6px',
                    border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer',
                    color: copied === 'matches' ? '#10b981' : '#64748b',
                  }}>
                    {copied === 'matches' ? '✓' : '⎘'} {t('Копіювати всі', 'Copy all')}
                  </button>
                </div>
                <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                  {matches.slice(0, 50).map((m, i) => (
                    <div key={i} style={{
                      display: 'grid', gridTemplateColumns: '40px 80px 1fr auto',
                      gap: '8px', alignItems: 'center',
                      padding: '8px 16px',
                      borderBottom: i < matches.length - 1 ? '1px solid #f1f5f9' : 'none',
                    }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>#{i + 1}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                        [{m.index}:{m.index + m.length}]
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '13px',
                        background: `hsl(${200 + i * 37}, 85%, 92%)`,
                        padding: '1px 8px', borderRadius: '4px', color: '#0f172a',
                      }}>
                        {m.value}
                      </span>
                      {m.groups.length > 0 && (
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {m.groups.map((g, gi) => g !== undefined ? `(${gi+1}): "${g}"` : '').filter(Boolean).join(', ')}
                        </span>
                      )}
                    </div>
                  ))}
                  {matches.length > 50 && (
                    <div style={{ padding: '8px 16px', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
                      {t(`... і ще ${matches.length - 50} збігів`, `... and ${matches.length - 50} more matches`)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Presets */}
          <div style={{ marginTop: '2rem' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '10px' }}>
              {t('Готові шаблони:', 'Ready-made patterns:')}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(isEn ? PRESETS.en : PRESETS.uk).map((p, i) => (
                <button key={i} onClick={() => loadPreset(p)} style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '12px',
                  border: '1px solid #e2e8f0', background: '#fff',
                  color: '#475569', cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569' }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* PowerShell tip */}
          {psCode && (
            <div style={{ marginTop: '1.5rem', padding: '1.25rem 1.5rem', background: '#1e1e2e', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, fontFamily: 'var(--font-mono)' }}>
                  # PowerShell
                </p>
                <button onClick={() => copy(psCode, 'ps')} style={{
                  fontSize: '11px', padding: '2px 8px', borderRadius: '5px',
                  border: '1px solid #334155', background: 'transparent',
                  color: copied === 'ps' ? '#10b981' : '#94a3b8', cursor: 'pointer',
                }}>
                  {copied === 'ps' ? '✓' : '⎘'} {t('Копіювати', 'Copy')}
                </button>
              </div>
              <code style={{ fontSize: '12px', color: '#e2e8f0', fontFamily: 'var(--font-mono)', lineHeight: 1.8, display: 'block', whiteSpace: 'pre' }}>
                {psCode}
              </code>
            </div>
          )}

        </div>
      </div>
    </Layout>
  )
}
