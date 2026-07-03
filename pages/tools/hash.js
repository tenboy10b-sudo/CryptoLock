import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import Link from 'next/link'
import siteConfig from '../../site.config'

const SITE = siteConfig.url

// Web Crypto API — вбудована в браузер, нічого не передається
async function hash(text, algorithm) {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const buf = await crypto.subtle.digest(algorithm, data)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// MD5 — не підтримується Web Crypto, реалізуємо самостійно
function md5(str) {
  function safeAdd(x, y) { const lsw=(x&0xFFFF)+(y&0xFFFF); return (((x>>16)+(y>>16)+(lsw>>16))<<16)|(lsw&0xFFFF) }
  function bitRotateLeft(num, cnt) { return (num<<cnt)|(num>>>(32-cnt)) }
  function md5cmn(q,a,b,x,s,t) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a,q),safeAdd(x,t)),s),b) }
  function md5ff(a,b,c,d,x,s,t) { return md5cmn((b&c)|((~b)&d),a,b,x,s,t) }
  function md5gg(a,b,c,d,x,s,t) { return md5cmn((b&d)|(c&(~d)),a,b,x,s,t) }
  function md5hh(a,b,c,d,x,s,t) { return md5cmn(b^c^d,a,b,x,s,t) }
  function md5ii(a,b,c,d,x,s,t) { return md5cmn(c^(b|(~d)),a,b,x,s,t) }
  const bMsg = []
  for(let i=0;i<str.length*8;i+=8) bMsg[i>>5]|=(str.charCodeAt(i/8)&0xFF)<<(i%32)
  const l=str.length*8; bMsg[l>>5]|=0x80<<(l%32); bMsg[(((l+64)>>>9)<<4)+14]=l
  let [a,b,c,d]=[1732584193,-271733879,-1732584194,271733878]
  for(let i=0;i<bMsg.length;i+=16){
    const [oa,ob,oc,od]=[a,b,c,d]
    a=md5ff(a,b,c,d,bMsg[i],7,-680876936);d=md5ff(d,a,b,c,bMsg[i+1],12,-389564586);c=md5ff(c,d,a,b,bMsg[i+2],17,606105819);b=md5ff(b,c,d,a,bMsg[i+3],22,-1044525330)
    a=md5ff(a,b,c,d,bMsg[i+4],7,-176418897);d=md5ff(d,a,b,c,bMsg[i+5],12,1200080426);c=md5ff(c,d,a,b,bMsg[i+6],17,-1473231341);b=md5ff(b,c,d,a,bMsg[i+7],22,-45705983)
    a=md5ff(a,b,c,d,bMsg[i+8],7,1770035416);d=md5ff(d,a,b,c,bMsg[i+9],12,-1958414417);c=md5ff(c,d,a,b,bMsg[i+10],17,-42063);b=md5ff(b,c,d,a,bMsg[i+11],22,-1990404162)
    a=md5ff(a,b,c,d,bMsg[i+12],7,1804603682);d=md5ff(d,a,b,c,bMsg[i+13],12,-40341101);c=md5ff(c,d,a,b,bMsg[i+14],17,-1502002290);b=md5ff(b,c,d,a,bMsg[i+15],22,1236535329)
    a=md5gg(a,b,c,d,bMsg[i+1],5,-165796510);d=md5gg(d,a,b,c,bMsg[i+6],9,-1069501632);c=md5gg(c,d,a,b,bMsg[i+11],14,643717713);b=md5gg(b,c,d,a,bMsg[i],20,-373897302)
    a=md5gg(a,b,c,d,bMsg[i+5],5,-701558691);d=md5gg(d,a,b,c,bMsg[i+10],9,38016083);c=md5gg(c,d,a,b,bMsg[i+15],14,-660478335);b=md5gg(b,c,d,a,bMsg[i+4],20,-405537848)
    a=md5gg(a,b,c,d,bMsg[i+9],5,568446438);d=md5gg(d,a,b,c,bMsg[i+14],9,-1019803690);c=md5gg(c,d,a,b,bMsg[i+3],14,-187363961);b=md5gg(b,c,d,a,bMsg[i+8],20,1163531501)
    a=md5gg(a,b,c,d,bMsg[i+13],5,-1444681467);d=md5gg(d,a,b,c,bMsg[i+2],9,-51403784);c=md5gg(c,d,a,b,bMsg[i+7],14,1735328473);b=md5gg(b,c,d,a,bMsg[i+12],20,-1926607734)
    a=md5hh(a,b,c,d,bMsg[i+5],4,-378558);d=md5hh(d,a,b,c,bMsg[i+8],11,-2022574463);c=md5hh(c,d,a,b,bMsg[i+11],16,1839030562);b=md5hh(b,c,d,a,bMsg[i+14],23,-35309556)
    a=md5hh(a,b,c,d,bMsg[i+1],4,-1530992060);d=md5hh(d,a,b,c,bMsg[i+4],11,1272893353);c=md5hh(c,d,a,b,bMsg[i+7],16,-155497632);b=md5hh(b,c,d,a,bMsg[i+10],23,-1094730640)
    a=md5hh(a,b,c,d,bMsg[i+13],4,681279174);d=md5hh(d,a,b,c,bMsg[i],11,-358537222);c=md5hh(c,d,a,b,bMsg[i+3],16,-722521979);b=md5hh(b,c,d,a,bMsg[i+6],23,76029189)
    a=md5hh(a,b,c,d,bMsg[i+9],4,-640364487);d=md5hh(d,a,b,c,bMsg[i+12],11,-421815835);c=md5hh(c,d,a,b,bMsg[i+15],16,530742520);b=md5hh(b,c,d,a,bMsg[i+2],23,-995338651)
    a=md5ii(a,b,c,d,bMsg[i],6,-198630844);d=md5ii(d,a,b,c,bMsg[i+7],10,1126891415);c=md5ii(c,d,a,b,bMsg[i+14],15,-1416354905);b=md5ii(b,c,d,a,bMsg[i+5],21,-57434055)
    a=md5ii(a,b,c,d,bMsg[i+12],6,1700485571);d=md5ii(d,a,b,c,bMsg[i+3],10,-1894986606);c=md5ii(c,d,a,b,bMsg[i+10],15,-1051523);b=md5ii(b,c,d,a,bMsg[i+1],21,-2054922799)
    a=md5ii(a,b,c,d,bMsg[i+8],6,1873313359);d=md5ii(d,a,b,c,bMsg[i+15],10,-30611744);c=md5ii(c,d,a,b,bMsg[i+6],15,-1560198380);b=md5ii(b,c,d,a,bMsg[i+13],21,1309151649)
    a=md5ii(a,b,c,d,bMsg[i+4],6,-145523070);d=md5ii(d,a,b,c,bMsg[i+11],10,-1120210379);c=md5ii(c,d,a,b,bMsg[i+2],15,718787259);b=md5ii(b,c,d,a,bMsg[i+9],21,-343485551)
    a=safeAdd(a,oa);b=safeAdd(b,ob);c=safeAdd(c,oc);d=safeAdd(d,od)
  }
  return [a,b,c,d].map(n=>[(n&0xFF),(n>>8&0xFF),(n>>16&0xFF),(n>>24&0xFF)].map(b=>b.toString(16).padStart(2,'0')).join('')).join('')
}

export default function HashGenerator() {
  const { locale } = useRouter()
  const [mounted, setMounted] = useState(false)
  const isEn = mounted ? locale === 'en' : false
  useEffect(() => { setMounted(true) }, [])
  const t = (uk, en) => isEn ? en : uk

  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState('')
  const [compareHash, setCompareHash] = useState('')
  const [compareResult, setCompareResult] = useState(null)

  const canonicalPath = isEn ? `${SITE}/en/tools/hash` : `${SITE}/tools/hash`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: isEn ? 'Hash Generator (MD5, SHA1, SHA256, SHA512) — CryptoLock' : 'Генератор хешів (MD5, SHA1, SHA256, SHA512) — CryptoLock',
    description: isEn
      ? 'Free online hash generator. Calculate MD5, SHA1, SHA256 and SHA512 hashes instantly in your browser. Nothing is sent to any server.'
      : 'Безкоштовний генератор хешів онлайн. Розраховуй MD5, SHA1, SHA256 і SHA512 прямо в браузері. Нічого не передається на сервер.',
    url: canonicalPath,
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }

  const generate = useCallback(async (text) => {
    if (!text) { setHashes(null); return }
    setLoading(true)
    try {
      const [sha1, sha256, sha512] = await Promise.all([
        hash(text, 'SHA-1'),
        hash(text, 'SHA-256'),
        hash(text, 'SHA-512'),
      ])
      setHashes({
        md5:    md5(text),
        sha1,
        sha256,
        sha512,
      })
    } catch {}
    setLoading(false)
  }, [])

  const handleInput = (val) => {
    setInput(val)
    setCompareResult(null)
    generate(val)
  }

  const copy = (val, key) => {
    navigator.clipboard.writeText(val).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(''), 2000)
    })
  }

  const compare = () => {
    if (!hashes || !compareHash.trim()) return
    const h = compareHash.trim().toLowerCase()
    const match = Object.entries(hashes).find(([, v]) => v === h)
    setCompareResult(match ? { found: true, algo: match[0].toUpperCase() } : { found: false })
  }

  const algorithms = hashes ? [
    { key: 'md5',    label: 'MD5',    bits: 128, warn: true  },
    { key: 'sha1',   label: 'SHA-1',  bits: 160, warn: true  },
    { key: 'sha256', label: 'SHA-256',bits: 256, warn: false },
    { key: 'sha512', label: 'SHA-512',bits: 512, warn: false },
  ] : []

  return (
    <Layout
      title={isEn
        ? 'Hash Generator — MD5, SHA1, SHA256, SHA512 Online | CryptoLock'
        : 'Генератор хешів онлайн — MD5, SHA1, SHA256, SHA512 | CryptoLock'}
      description={isEn
        ? 'Free online hash generator. Instantly calculate MD5, SHA1, SHA256 and SHA512 hashes in your browser. Verify file integrity, check passwords. Nothing sent to server.'
        : 'Безкоштовний онлайн генератор хешів. Розраховуй MD5, SHA1, SHA256 і SHA512 миттєво в браузері. Перевірка цілісності файлів і паролів. Нічого не передається.'}
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
            <span style={{ color: '#64748b' }}>{t('Генератор хешів', 'Hash Generator')}</span>
          </nav>

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
              #️⃣ {t('Генератор хешів', 'Hash Generator')}
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
              {t(
                'Введи текст — миттєво отримай MD5, SHA-1, SHA-256 і SHA-512 хеші. Все обраховується прямо в браузері, нічого не передається на сервер.',
                'Enter text to instantly get MD5, SHA-1, SHA-256 and SHA-512 hashes. Everything is computed in your browser — nothing is sent anywhere.'
              )}
            </p>
          </div>

          {/* Input */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              {t('Текст для хешування', 'Text to hash')}
            </label>
            <textarea
              value={input}
              onChange={e => handleInput(e.target.value)}
              placeholder={t('Введіть або вставте текст…', 'Type or paste text here…')}
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
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                {input.length} {t('символів', 'chars')} · {new Blob([input]).size} bytes
              </span>
              {input && (
                <button onClick={() => { setInput(''); setHashes(null); setCompareResult(null) }}
                  style={{ fontSize: '12px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {t('Очистити', 'Clear')}
                </button>
              )}
            </div>
          </div>

          {/* Hash results */}
          {hashes && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
              {algorithms.map(({ key, label, bits, warn }) => (
                <div key={key} style={{
                  background: '#fff', border: '1px solid #e2e8f0',
                  borderRadius: '12px', padding: '14px 16px',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#94a3b8'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                        {label}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                        {bits} {t('біт', 'bit')}
                      </span>
                      {warn && (
                        <span style={{ fontSize: '11px', color: '#f59e0b', background: '#fffbeb', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          {t('застарілий', 'deprecated')}
                        </span>
                      )}
                    </div>
                    <button onClick={() => copy(hashes[key], key)} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '3px 10px', borderRadius: '6px', fontSize: '12px',
                      border: '1px solid', cursor: 'pointer', fontWeight: 600,
                      borderColor: copied === key ? '#10b981' : '#e2e8f0',
                      background:  copied === key ? '#f0fdf4' : '#f8fafc',
                      color:       copied === key ? '#10b981' : '#64748b',
                      transition: 'all 0.15s',
                    }}>
                      {copied === key ? '✓' : '⎘'} {copied === key ? t('Скопійовано', 'Copied') : t('Копіювати', 'Copy')}
                    </button>
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '13px',
                    color: '#1e293b', wordBreak: 'break-all',
                    lineHeight: 1.5, userSelect: 'all',
                    cursor: 'text',
                  }}
                  onClick={e => {
                    const range = document.createRange()
                    range.selectNodeContents(e.currentTarget)
                    window.getSelection().removeAllRanges()
                    window.getSelection().addRange(range)
                  }}
                  >
                    {hashes[key]}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Compare hash */}
          {hashes && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#475569', margin: '0 0 10px' }}>
                🔍 {t('Порівняти з відомим хешем', 'Compare with known hash')}
              </p>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 10px' }}>
                {t('Вставте хеш для перевірки (наприклад з сайту завантаження)', 'Paste the expected hash (e.g. from a download page)')}
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={compareHash}
                  onChange={e => { setCompareHash(e.target.value); setCompareResult(null) }}
                  onKeyDown={e => e.key === 'Enter' && compare()}
                  placeholder={t('Вставте хеш сюди…', 'Paste hash here…')}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: '8px',
                    border: '1.5px solid #e2e8f0', fontSize: '13px',
                    fontFamily: 'var(--font-mono)', outline: 'none', background: '#fff',
                  }}
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button onClick={compare} disabled={!compareHash.trim()} style={{
                  padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
                  fontWeight: 600, border: 'none', cursor: 'pointer',
                  background: compareHash.trim() ? '#2563eb' : '#cbd5e1', color: '#fff',
                }}>
                  {t('Порівняти', 'Compare')}
                </button>
              </div>
              {compareResult && (
                <div style={{
                  marginTop: '10px', padding: '10px 14px', borderRadius: '8px',
                  background: compareResult.found ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${compareResult.found ? '#86efac' : '#fca5a5'}`,
                  color: compareResult.found ? '#15803d' : '#dc2626',
                  fontSize: '13px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  {compareResult.found
                    ? <>✅ {t(`Збіг! Алгоритм: ${compareResult.algo}`, `Match! Algorithm: ${compareResult.algo}`)}</>
                    : <>❌ {t('Хеш не збігається з жодним алгоритмом', 'Hash does not match any algorithm')}</>}
                </div>
              )}
            </div>
          )}

          {/* PowerShell tip */}
          <div style={{ marginTop: '1rem', padding: '1.25rem 1.5rem', background: '#1e1e2e', borderRadius: '12px' }}>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
              # {t('Хеш файлу в PowerShell', 'File hash in PowerShell')}
            </p>
            <code style={{ fontSize: '13px', color: '#e2e8f0', fontFamily: 'var(--font-mono)', lineHeight: 1.8, display: 'block' }}>
              Get-FileHash C:\file.exe -Algorithm SHA256<br/>
              Get-FileHash C:\file.exe -Algorithm MD5<br/>
              <span style={{ color: '#94a3b8' }}><br/># Хеш рядка</span><br/>
              $h = [System.Security.Cryptography.SHA256]::Create()<br/>
              [BitConverter]::ToString($h.ComputeHash([Text.Encoding]::UTF8.GetBytes(&quot;text&quot;))).Replace(&quot;-&quot;,&quot;&quot;).ToLower()
            </code>
          </div>

        </div>
      </div>
    </Layout>
  )
}
