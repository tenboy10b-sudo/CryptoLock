import { useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import Link from 'next/link'
import siteConfig from '../../site.config'

const SITE = siteConfig.url

export default function Base64Tool() {
  const { locale } = useRouter()
  const isEn = locale === 'en'
  const t = (uk, en) => isEn ? en : uk

  const [mode, setMode] = useState('encode') // encode | decode | hex
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const canonicalPath = isEn
    ? `${SITE}/en/tools/base64`
    : `${SITE}/tools/base64`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: isEn ? 'Base64 & Hex Encoder/Decoder — CryptoLock' : 'Base64 і Hex конвертер — CryptoLock',
    description: isEn
      ? 'Free online Base64 encoder and decoder. Also convert text to HEX and back. Useful for PowerShell scripts and Windows administration.'
      : 'Безкоштовний онлайн конвертер Base64 і HEX. Кодуй і декодуй рядки прямо в браузері. Корисно для PowerShell і адміністрування Windows.',
    url: canonicalPath,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }

  const process = useCallback((val, currentMode) => {
    setError('')
    setOutput('')
    if (!val) return
    try {
      if (currentMode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(val))))
      } else if (currentMode === 'decode') {
        setOutput(decodeURIComponent(escape(atob(val.trim()))))
      } else if (currentMode === 'hex-encode') {
        setOutput([...val].map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' '))
      } else if (currentMode === 'hex-decode') {
        setOutput(val.trim().split(/\s+/).map(h => String.fromCharCode(parseInt(h, 16))).join(''))
      } else if (currentMode === 'ps-encode') {
        // PowerShell EncodedCommand — UTF-16LE Base64
        const utf16 = [...val].reduce((acc, c) => {
          const code = c.charCodeAt(0)
          return acc + String.fromCharCode(code & 0xFF, (code >> 8) & 0xFF)
        }, '')
        setOutput(btoa(utf16))
      } else if (currentMode === 'ps-decode') {
        const bin = atob(val.trim())
        let result = ''
        for (let i = 0; i < bin.length; i += 2) {
          result += String.fromCharCode(bin.charCodeAt(i) | (bin.charCodeAt(i + 1) << 8))
        }
        setOutput(result)
      }
    } catch (e) {
      setError(t('Помилка: невалідний вхідний рядок', 'Error: invalid input string'))
    }
  }, [isEn])

  const handleInput = (val) => {
    setInput(val)
    process(val, mode)
  }

  const handleMode = (newMode) => {
    setMode(newMode)
    setOutput('')
    setError('')
    if (input) process(input, newMode)
  }

  const copy = () => {
    if (!output) return
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const swap = () => {
    if (!output) return
    setInput(output)
    setOutput('')
    // Swap mode
    const swapMap = {
      'encode': 'decode', 'decode': 'encode',
      'hex-encode': 'hex-decode', 'hex-decode': 'hex-encode',
      'ps-encode': 'ps-decode', 'ps-decode': 'ps-encode',
    }
    const newMode = swapMap[mode] || mode
    setMode(newMode)
    process(output, newMode)
  }

  const modes = [
    { id: 'encode',     label: 'Base64 Encode', icon: '→' },
    { id: 'decode',     label: 'Base64 Decode', icon: '←' },
    { id: 'hex-encode', label: 'Text → HEX',    icon: '→' },
    { id: 'hex-decode', label: 'HEX → Text',    icon: '←' },
    { id: 'ps-encode',  label: 'PS Encode',      icon: '⚡' },
    { id: 'ps-decode',  label: 'PS Decode',      icon: '⚡' },
  ]

  const modeDescriptions = {
    'encode':     t('Кодування тексту в Base64', 'Encode text to Base64'),
    'decode':     t('Декодування Base64 в текст', 'Decode Base64 to text'),
    'hex-encode': t('Перетворення тексту в шістнадцяткові байти', 'Convert text to hexadecimal bytes'),
    'hex-decode': t('Перетворення HEX байтів в текст', 'Convert hexadecimal bytes to text'),
    'ps-encode':  t('PowerShell EncodedCommand (UTF-16LE Base64)', 'PowerShell EncodedCommand (UTF-16LE Base64)'),
    'ps-decode':  t('Декодування PowerShell EncodedCommand', 'Decode PowerShell EncodedCommand'),
  }

  return (
    <Layout
      title={isEn
        ? 'Base64 & HEX Encoder/Decoder — Free Online Tool | CryptoLock'
        : 'Base64 і HEX конвертер онлайн — безкоштовно | CryptoLock'}
      description={isEn
        ? 'Free Base64 encoder and decoder online. Convert text to Base64, decode Base64 to text, encode/decode HEX, and encode PowerShell commands. No registration.'
        : 'Безкоштовний Base64 і HEX конвертер онлайн. Кодуй текст у Base64, декодуй Base64, конвертуй HEX і кодуй команди PowerShell. Без реєстрації.'}
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
            <span style={{ color: '#64748b' }}>Base64 / HEX</span>
          </nav>

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
              🔢 {t('Base64 і HEX конвертер', 'Base64 & HEX Converter')}
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
              {t(
                'Кодуй і декодуй Base64, HEX і PowerShell EncodedCommand прямо в браузері. Нічого не передається на сервер.',
                'Encode and decode Base64, HEX and PowerShell EncodedCommand directly in your browser. Nothing is sent to any server.'
              )}
            </p>
          </div>

          {/* Mode selector */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.5rem' }}>
            {modes.map(m => (
              <button key={m.id} onClick={() => handleMode(m.id)} style={{
                padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', border: '1.5px solid',
                borderColor: mode === m.id ? '#2563eb' : '#e2e8f0',
                background:  mode === m.id ? '#eff6ff' : '#fff',
                color:       mode === m.id ? '#2563eb' : '#64748b',
                transition: 'all 0.15s',
              }}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          {/* Mode description */}
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '1rem', fontStyle: 'italic' }}>
            {modeDescriptions[mode]}
          </p>

          {/* Main card */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem' }}>

            {/* Input */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                {t('Вхідний текст', 'Input')}
              </label>
              <textarea
                value={input}
                onChange={e => handleInput(e.target.value)}
                placeholder={
                  mode === 'decode' || mode === 'ps-decode'
                    ? t('Вставте Base64 рядок сюди…', 'Paste Base64 string here…')
                    : mode === 'hex-decode'
                    ? t('Вставте HEX байти (наприклад: 48 65 6c 6c 6f)…', 'Paste HEX bytes (e.g. 48 65 6c 6c 6f)…')
                    : t('Введіть або вставте текст сюди…', 'Type or paste text here…')
                }
                rows={5}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '10px 14px', borderRadius: '10px',
                  border: '1.5px solid #e2e8f0', fontSize: '14px',
                  fontFamily: 'var(--font-mono)', outline: 'none',
                  background: '#fff', resize: 'vertical', lineHeight: 1.6,
                }}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {input.length} {t('символів', 'chars')}
                </span>
                {input && (
                  <button onClick={() => { setInput(''); setOutput(''); setError('') }}
                    style={{ fontSize: '12px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {t('Очистити', 'Clear')}
                  </button>
                )}
              </div>
            </div>

            {/* Arrow + Swap */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', margin: '12px 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <button onClick={swap} disabled={!output} title={t('Поміняти місцями', 'Swap input/output')} style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '13px',
                border: '1px solid #e2e8f0', background: output ? '#fff' : '#f8fafc',
                color: output ? '#475569' : '#cbd5e1', cursor: output ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                ⇅ {t('Поміняти', 'Swap')}
              </button>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            {/* Output */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                  {t('Результат', 'Output')}
                </label>
                {output && (
                  <button onClick={copy} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '4px 12px', borderRadius: '7px', fontSize: '12px',
                    border: '1px solid', fontWeight: 600, cursor: 'pointer',
                    borderColor: copied ? '#10b981' : '#e2e8f0',
                    background:  copied ? '#f0fdf4' : '#fff',
                    color:       copied ? '#10b981' : '#64748b',
                    transition: 'all 0.15s',
                  }}>
                    {copied ? '✓ ' + t('Скопійовано', 'Copied') : '⎘ ' + t('Копіювати', 'Copy')}
                  </button>
                )}
              </div>

              {error ? (
                <div style={{ padding: '12px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', color: '#dc2626', fontSize: '13px' }}>
                  ⚠️ {error}
                </div>
              ) : (
                <textarea
                  readOnly
                  value={output}
                  placeholder={t('Результат з\'явиться тут…', 'Result will appear here…')}
                  rows={5}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '10px 14px', borderRadius: '10px',
                    border: '1.5px solid #e2e8f0', fontSize: '14px',
                    fontFamily: 'var(--font-mono)', outline: 'none',
                    background: output ? '#fff' : '#f8fafc',
                    resize: 'vertical', lineHeight: 1.6, color: '#0f172a',
                  }}
                  onClick={e => e.target.select()}
                />
              )}
              {output && (
                <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                  {output.length} {t('символів', 'chars')}
                </span>
              )}
            </div>
          </div>

          {/* Examples */}
          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
              {t('Приклади для тесту:', 'Examples to try:')}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                { label: t('Текст', 'Text'),          val: 'Hello, World!',     m: 'encode' },
                { label: 'Base64',                     val: 'SGVsbG8sIFdvcmxkIQ==', m: 'decode' },
                { label: 'PowerShell',                 val: 'Get-Process | Where-Object {$_.CPU -gt 10}', m: 'ps-encode' },
                { label: 'HEX',                        val: '48 65 6c 6c 6f', m: 'hex-decode' },
              ].map(({ label, val, m }) => (
                <button key={label} onClick={() => { setInput(val); handleMode(m); process(val, m) }} style={{
                  padding: '5px 12px', borderRadius: '8px', fontSize: '12px',
                  border: '1px solid #e2e8f0', background: '#fff',
                  color: '#475569', cursor: 'pointer',
                }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* PowerShell tip */}
          <div style={{ marginTop: '2rem', padding: '1.25rem 1.5rem', background: '#1e1e2e', borderRadius: '12px' }}>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
              # {t('Base64 в PowerShell', 'Base64 in PowerShell')}
            </p>
            <code style={{ fontSize: '13px', color: '#e2e8f0', fontFamily: 'var(--font-mono)', lineHeight: 1.8, display: 'block' }}>
              <span style={{ color: '#94a3b8' }}># Encode</span><br/>
              [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes(&quot;Hello&quot;))<br/><br/>
              <span style={{ color: '#94a3b8' }}># Decode</span><br/>
              [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String(&quot;SGVsbG8=&quot;))<br/><br/>
              <span style={{ color: '#94a3b8' }}># PowerShell EncodedCommand</span><br/>
              powershell.exe -EncodedCommand &lt;Base64&gt;
            </code>
          </div>

        </div>
      </div>
    </Layout>
  )
}
