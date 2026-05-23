import { useState, useCallback, useEffect } from 'react'
import Layout from '../../components/Layout'
import Link from 'next/link'
import siteConfig from '../../site.config'

const SITE = siteConfig.url

const CHARSETS = {
  upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower:   'abcdefghijklmnopqrstuvwxyz',
  digits:  '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  similar: 'Il1O0',
}

function generatePassword(length, opts) {
  let charset = ''
  if (opts.upper)   charset += CHARSETS.upper
  if (opts.lower)   charset += CHARSETS.lower
  if (opts.digits)  charset += CHARSETS.digits
  if (opts.symbols) charset += CHARSETS.symbols
  if (!charset) charset = CHARSETS.lower + CHARSETS.digits
  if (opts.noSimilar) {
    charset = charset.split('').filter(c => !CHARSETS.similar.includes(c)).join('')
  }
  const array = new Uint32Array(length)
  window.crypto.getRandomValues(array)
  return Array.from(array).map(n => charset[n % charset.length]).join('')
}

function calcEntropy(length, opts) {
  let size = 0
  if (opts.upper)   size += opts.noSimilar ? 24 : 26
  if (opts.lower)   size += 26
  if (opts.digits)  size += opts.noSimilar ? 8 : 10
  if (opts.symbols) size += CHARSETS.symbols.length
  if (!size) size = 36
  return Math.round(length * Math.log2(size))
}

function entropyLabel(bits) {
  if (bits < 40)  return { label: 'Дуже слабкий', color: '#dc2626', bg: '#fef2f2', width: '10%' }
  if (bits < 60)  return { label: 'Слабкий',      color: '#ea580c', bg: '#fff7ed', width: '30%' }
  if (bits < 80)  return { label: 'Прийнятний',   color: '#ca8a04', bg: '#fefce8', width: '55%' }
  if (bits < 100) return { label: 'Сильний',      color: '#16a34a', bg: '#f0fdf4', width: '78%' }
  return               { label: 'Дуже сильний',   color: '#059669', bg: '#ecfdf5', width: '100%' }
}

function crackTime(bits) {
  const seconds = Math.pow(2, bits) / 1e10
  if (seconds < 60)          return 'менше хвилини'
  if (seconds < 3600)        return `${Math.round(seconds/60)} хв`
  if (seconds < 86400)       return `${Math.round(seconds/3600)} год`
  if (seconds < 31536000)    return `${Math.round(seconds/86400)} днів`
  if (seconds < 3153600000)  return `${Math.round(seconds/31536000)} років`
  return 'мільйони років'
}

export default function PasswordGenerator() {
  const [length, setLength]       = useState(16)
  const [opts, setOpts]           = useState({ upper: true, lower: true, digits: true, symbols: true, noSimilar: false })
  const [count, setCount]         = useState(5)
  const [passwords, setPasswords] = useState([])
  const [copied, setCopied]       = useState(null)

  const generate = useCallback(() => {
    const list = Array.from({ length: count }, () => generatePassword(length, opts))
    setPasswords(list)
    setCopied(null)
  }, [length, count, opts])

  useEffect(() => { generate() }, [generate])

  const copy = (pw, idx) => {
    navigator.clipboard.writeText(pw).then(() => {
      setCopied(idx); setTimeout(() => setCopied(null), 1800)
    })
  }
  const copyAll = () => {
    navigator.clipboard.writeText(passwords.join('\n')).then(() => {
      setCopied('all'); setTimeout(() => setCopied(null), 1800)
    })
  }
  const toggle = key => setOpts(o => ({ ...o, [key]: !o[key] }))

  const entropy  = calcEntropy(length, opts)
  const strength = entropyLabel(entropy)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Генератор надійних паролів онлайн',
    description: 'Безкоштовний генератор випадкових паролів. Налаштуй довжину, символи, складність. Паролі генеруються локально — нічого не надсилається на сервер.',
    url: `${SITE}/tools/password-generator`,
    applicationCategory: 'SecurityApplication',
    inLanguage: 'uk',
    publisher: { '@type': 'Organization', name: siteConfig.name, url: SITE },
  }

  return (
    <Layout
      title="Генератор паролів — безпечні паролі онлайн безкоштовно"
      description="Генеруй надійні випадкові паролі прямо в браузері. Налаштуй довжину і символи. Паролі не передаються на сервер — генерація повністю локальна."
      canonical={`${SITE}/tools/password-generator`}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div style={{ padding: '2rem 0 4rem' }}>
        <div className="container">

          <nav style={s.bc}>
            <Link href="/" style={s.bcLink}>Головна</Link>
            <span style={s.bcSep}>/</span>
            <Link href="/tools" style={s.bcLink}>Інструменти</Link>
            <span style={s.bcSep}>/</span>
            <span style={{ ...s.bcLink, color: '#64748b' }}>Генератор паролів</span>
          </nav>

          <div style={s.header}>
            <h1 style={s.title}>🔑 Генератор паролів</h1>
            <p style={s.subtitle}>Надійні паролі · Генерація в браузері · Нічого не надсилається</p>
          </div>

          <div style={s.layout}>
            {/* Settings */}
            <div style={s.settingsPanel}>

              <div style={s.section}>
                <div style={s.row}>
                  <span style={s.label}>Довжина</span>
                  <span style={s.bigVal}>{length}</span>
                </div>
                <input type="range" min={8} max={64} value={length}
                  onChange={e => setLength(Number(e.target.value))} style={s.slider} />
                <div style={s.marks}>
                  {[8,12,16,24,32,48,64].map(v => (
                    <button key={v} style={length===v ? s.markOn : s.markOff} onClick={() => setLength(v)}>{v}</button>
                  ))}
                </div>
              </div>

              <div style={s.section}>
                <p style={s.label}>Символи</p>
                {[
                  { key: 'upper',     label: 'Великі літери', ex: 'A–Z' },
                  { key: 'lower',     label: 'Малі літери',   ex: 'a–z' },
                  { key: 'digits',    label: 'Цифри',          ex: '0–9' },
                  { key: 'symbols',   label: 'Символи',        ex: '!@#$%' },
                  { key: 'noSimilar', label: 'Без схожих',    ex: 'I l 1 O 0' },
                ].map(({ key, label, ex }) => (
                  <label key={key} style={s.checkRow} onClick={() => toggle(key)}>
                    <div style={opts[key] ? s.cbOn : s.cbOff}>{opts[key] && '✓'}</div>
                    <span style={s.checkLabel}>{label}</span>
                    <span style={s.checkEx}>{ex}</span>
                  </label>
                ))}
              </div>

              <div style={s.section}>
                <div style={s.row}>
                  <span style={s.label}>Кількість</span>
                </div>
                <div style={s.countRow}>
                  {[1,3,5,10].map(n => (
                    <button key={n} style={count===n ? s.cntOn : s.cntOff} onClick={() => setCount(n)}>{n}</button>
                  ))}
                </div>
              </div>

              <div style={{ ...s.strengthBox, background: strength.bg }}>
                <div style={s.row}>
                  <span style={s.label}>Надійність</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 800, color: strength.color }}>{strength.label}</span>
                </div>
                <div style={s.bar}><div style={{ ...s.fill, width: strength.width, background: strength.color }} /></div>
                <div style={s.row}>
                  <span style={s.meta}>Entropy: <b>{entropy} біт</b></span>
                  <span style={s.meta}>Перебір: <b>{crackTime(entropy)}</b></span>
                </div>
              </div>

              <button style={s.genBtn} onClick={generate}>🔄 Згенерувати нові</button>
            </div>

            {/* Results */}
            <div style={s.resultsPanel}>
              <div style={s.row}>
                <span style={s.label}>Згенеровані паролі</span>
                {passwords.length > 1 && (
                  <button style={copied==='all' ? s.caOn : s.caOff} onClick={copyAll}>
                    {copied==='all' ? '✓ Всі скопійовано' : 'Копіювати всі'}
                  </button>
                )}
              </div>

              <div style={s.pwList}>
                {passwords.map((pw, idx) => (
                  <div key={idx} style={s.pwRow}>
                    <code style={s.pwText}>{pw}</code>
                    <button style={copied===idx ? s.cpOn : s.cpOff} onClick={() => copy(pw, idx)}>
                      {copied===idx ? '✓' : '⎘'}
                    </button>
                  </div>
                ))}
              </div>

              <p style={s.secNote}>
                🔒 Використовується <code style={s.code}>window.crypto.getRandomValues()</code> — криптографічно безпечний генератор. Паролі не передаються на сервер.
              </p>
            </div>
          </div>

          {/* Tips */}
          <div style={s.tips}>
            <h2 style={s.tipsTitle}>Поради щодо паролів</h2>
            <div style={s.tipsGrid}>
              {[
                { icon: '📏', t: 'Мінімум 16 символів', d: 'Довжина важливіша за складність. Пароль з 16 символів надійніший за 8-символьний з усіма типами.' },
                { icon: '🔀', t: 'Унікальний для кожного сервісу', d: 'Якщо один сайт зламали — зловмисники перевіряють цей пароль на всіх інших.' },
                { icon: '🗄️', t: 'Менеджер паролів', d: 'Bitwarden або KeePass — зберігай всі паролі в одному місці, потрібно запам\'ятати тільки один.' },
                { icon: '🔐', t: 'Двофакторна аутентифікація', d: 'Навіть вкрадений пароль не допоможе зловмиснику без другого фактора.' },
              ].map(({ icon, t, d }) => (
                <div key={t} style={s.tipCard}>
                  <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{icon}</span>
                  <div>
                    <p style={s.tipT}>{t}</p>
                    <p style={s.tipD}>{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SEO */}
          <div style={s.seoBlock}>
            <h2 style={s.seoH2}>Як генерується пароль</h2>
            <p style={s.seoP}>Всі паролі генеруються через <code style={s.code}>window.crypto.getRandomValues()</code> — криптографічно безпечний API браузера. Ніякі дані не надсилаються на сервер.</p>
            <p style={s.seoP}>Entropy показує математичну складність. 80+ біт — достатньо. 128 біт — практично нерозкривний.</p>
            <p style={s.seoP}>Для захисту Windows ПК також перевір налаштування безпеки через <Link href="/tools/auditshield" style={s.link}>AuditShield</Link>.</p>
          </div>

          <div style={s.back}>
            <Link href="/tools" style={s.backLink}>← Всі інструменти</Link>
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
  layout: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '20px', marginBottom: '2.5rem', alignItems: 'start' },
  settingsPanel: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem' },
  section: { marginBottom: '1.5rem' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  label: { fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' },
  bigVal: { fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800, color: '#2563eb' },
  slider: { width: '100%', marginBottom: '8px', accentColor: '#2563eb' },
  marks: { display: 'flex', justifyContent: 'space-between' },
  markOn: { fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#2563eb', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' },
  markOff: { fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' },
  checkRow: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none', marginBottom: '8px' },
  cbOn: { width: '18px', height: '18px', borderRadius: '4px', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 },
  cbOff: { width: '18px', height: '18px', borderRadius: '4px', border: '2px solid #cbd5e1', flexShrink: 0 },
  checkLabel: { fontSize: '0.875rem', color: '#334155', flex: 1 },
  checkEx: { fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#94a3b8' },
  countRow: { display: 'flex', gap: '8px' },
  cntOn: { fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#fff', background: '#2563eb', border: '1px solid #2563eb', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer' },
  cntOff: { fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#64748b', background: '#fff', border: '1px solid #e2e8f0', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer' },
  strengthBox: { padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem' },
  bar: { height: '6px', background: '#e2e8f0', borderRadius: '3px', margin: '8px 0', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s, background 0.3s' },
  meta: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#64748b' },
  genBtn: { width: '100%', padding: '12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' },
  resultsPanel: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem' },
  caOn:  { fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#16a34a', fontWeight: 700, background: 'transparent', border: 'none', cursor: 'pointer' },
  caOff: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#2563eb', background: 'transparent', border: 'none', cursor: 'pointer' },
  pwList: { display: 'flex', flexDirection: 'column', gap: '8px', margin: '1rem 0' },
  pwRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' },
  pwText: { fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: '#0f172a', flex: 1, letterSpacing: '0.5px', wordBreak: 'break-all' },
  cpOn:  { fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#16a34a', fontWeight: 800, background: 'transparent', border: 'none', cursor: 'pointer', flexShrink: 0 },
  cpOff: { fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer', flexShrink: 0 },
  secNote: { fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 },
  code: { fontFamily: 'var(--font-mono)', background: '#e2e8f0', padding: '1px 4px', borderRadius: '3px', fontSize: '0.8em' },
  tips: { marginBottom: '2.5rem' },
  tipsTitle: { fontFamily: "'Unbounded', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' },
  tipsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '12px' },
  tipCard: { display: 'flex', gap: '12px', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' },
  tipT: { fontWeight: 700, color: '#0f172a', fontSize: '0.875rem', marginBottom: '4px' },
  tipD: { fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6, margin: 0 },
  seoBlock: { padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', marginBottom: '2rem' },
  seoH2: { fontFamily: "'Unbounded', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' },
  seoP: { fontSize: '0.875rem', color: '#475569', lineHeight: 1.8, marginBottom: '8px' },
  link: { color: '#2563eb', fontWeight: 500, textDecoration: 'none' },
  back: { paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' },
  backLink: { fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#2563eb', fontWeight: 500, textDecoration: 'none' },
}
