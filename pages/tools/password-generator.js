import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'
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

function entropyLabel(bits, isEn) {
  if (bits < 40)  return { label: isEn ? 'Very weak'   : 'Дуже слабкий', color: '#dc2626', bg: '#fef2f2', width: '10%'  }
  if (bits < 60)  return { label: isEn ? 'Weak'        : 'Слабкий',      color: '#ea580c', bg: '#fff7ed', width: '30%'  }
  if (bits < 80)  return { label: isEn ? 'Fair'        : 'Середній',     color: '#ca8a04', bg: '#fefce8', width: '55%'  }
  if (bits < 100) return { label: isEn ? 'Strong'      : 'Надійний',     color: '#16a34a', bg: '#f0fdf4', width: '75%'  }
  if (bits < 128) return { label: isEn ? 'Very strong' : 'Дуже надійний',color: '#059669', bg: '#ecfdf5', width: '90%'  }
  return           { label: isEn ? 'Excellent'   : 'Відмінний',    color: '#0284c7', bg: '#f0f9ff', width: '100%' }
}

function crackTime(bits, isEn) {
  const seconds = Math.pow(2, bits) / 1e10
  if (isEn) {
    if (seconds < 60)          return 'less than a minute'
    if (seconds < 3600)        return `${Math.round(seconds/60)} min`
    if (seconds < 86400)       return `${Math.round(seconds/3600)} hrs`
    if (seconds < 31536000)    return `${Math.round(seconds/86400)} days`
    if (seconds < 3153600000)  return `${Math.round(seconds/31536000)} years`
    return 'millions of years'
  }
  if (seconds < 60)          return 'менше хвилини'
  if (seconds < 3600)        return `${Math.round(seconds/60)} хв`
  if (seconds < 86400)       return `${Math.round(seconds/3600)} год`
  if (seconds < 31536000)    return `${Math.round(seconds/86400)} днів`
  if (seconds < 3153600000)  return `${Math.round(seconds/31536000)} років`
  return 'мільйони років'
}

export default function PasswordGenerator() {
  const { locale } = useRouter()
  const isEn = locale === 'en'

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
  const strength = entropyLabel(entropy, isEn)

  const canonicalPath = isEn
    ? `${SITE}/en/tools/password-generator`
    : `${SITE}/tools/password-generator`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: isEn
      ? 'Secure Password Generator — Free Online'
      : 'Генератор надійних паролів онлайн',
    description: isEn
      ? 'Free random password generator. Set length and character types. Passwords are generated locally in your browser — nothing is sent to any server.'
      : 'Безкоштовний генератор випадкових паролів. Налаштуй довжину, символи, складність. Паролі генеруються локально — нічого не надсилається на сервер.',
    url: canonicalPath,
    applicationCategory: 'SecurityApplication',
    inLanguage: isEn ? 'en' : 'uk',
    publisher: { '@type': 'Organization', name: siteConfig.name, url: SITE },
  }

  return (
    <Layout
      title={isEn
        ? 'Secure Password Generator — Free, Local, No Tracking'
        : 'Генератор паролів — безпечні паролі онлайн безкоштовно'}
      description={isEn
        ? 'Generate strong random passwords in your browser. Set length, character types and quantity. All generation is local — nothing is sent to any server.'
        : 'Генеруй надійні випадкові паролі прямо в браузері. Налаштуй довжину і символи. Паролі не передаються на сервер — генерація повністю локальна.'}
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
            <span style={{ ...s.bcLink, color: '#64748b' }}>{isEn ? 'Password Generator' : 'Генератор паролів'}</span>
          </nav>

          <div style={s.header}>
            <h1 style={s.title}>🔑 {isEn ? 'Password Generator' : 'Генератор паролів'}</h1>
            <p style={s.subtitle}>{isEn ? 'Strong passwords · Browser-side only · Nothing is transmitted' : 'Надійні паролі · Генерація в браузері · Нічого не надсилається'}</p>
          </div>

          <div style={s.layout}>
            {/* Settings */}
            <div style={s.settingsPanel}>

              <div style={s.section}>
                <div style={s.row}>
                  <span style={s.label}>{isEn ? 'Length' : 'Довжина'}</span>
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
                  { key: 'upper',     label_uk: 'Великі літери', label_en: 'Uppercase',       ex: 'A–Z' },
                  { key: 'lower',     label_uk: 'Малі літери',   label_en: 'Lowercase',       ex: 'a–z' },
                  { key: 'digits',    label_uk: 'Цифри',         label_en: 'Digits',          ex: '0–9' },
                  { key: 'symbols',   label_uk: 'Символи',       label_en: 'Symbols',         ex: '!@#$%' },
                  { key: 'noSimilar', label_uk: 'Без схожих',    label_en: 'No similar chars',ex: 'I l 1 O 0' },
                ].map(({ key, label_uk, label_en, ex }) => (
                  <label key={key} style={s.checkRow} onClick={() => toggle(key)}>
                    <div style={opts[key] ? s.cbOn : s.cbOff}>{opts[key] && '✓'}</div>
                    <span style={s.checkLabel}>{isEn ? label_en : label_uk}</span>
                    <span style={s.checkEx}>{ex}</span>
                  </label>
                ))}
              </div>

              <div style={s.section}>
                <div style={s.row}>
                  <span style={s.label}>{isEn ? 'Count' : 'Кількість'}</span>
                </div>
                <div style={s.countRow}>
                  {[1,3,5,10].map(n => (
                    <button key={n} style={count===n ? s.cntOn : s.cntOff} onClick={() => setCount(n)}>{n}</button>
                  ))}
                </div>
              </div>

              <div style={{ ...s.strengthBox, background: strength.bg }}>
                <div style={s.row}>
                  <span style={s.label}>{isEn ? 'Strength' : 'Надійність'}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 800, color: strength.color }}>{strength.label}</span>
                </div>
                <div style={s.bar}><div style={{ ...s.fill, width: strength.width, background: strength.color }} /></div>
                <div style={s.row}>
                  <span style={s.meta}>Entropy: <b>{entropy} {isEn ? 'bits' : 'біт'}</b></span>
                  <span style={s.meta}>{isEn ? 'Crack time:' : 'Перебір:'} <b>{crackTime(entropy, isEn)}</b></span>
                </div>
              </div>

              <button style={s.genBtn} onClick={generate}>🔄 {isEn ? 'Generate new' : 'Згенерувати нові'}</button>
            </div>

            {/* Results */}
            <div style={s.resultsPanel}>
              <div style={s.row}>
                <span style={s.label}>{isEn ? 'Generated passwords' : 'Згенеровані паролі'}</span>
                {passwords.length > 1 && (
                  <button style={copied==='all' ? s.caOn : s.caOff} onClick={copyAll}>
                    {copied==='all' ? '✓ ' + (isEn ? 'Copied' : 'Скопійовано') : (isEn ? 'Copy all' : 'Копіювати всі')}
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
                {isEn ? '🔒 Uses ' : '🔒 Використовується '}<code style={s.code}>window.crypto.getRandomValues()</code>{isEn ? ' — cryptographically secure API. Passwords are not transmitted to any server.' : ' — криптографічно безпечний генератор. Паролі не передаються на сервер.'}
              </p>
            </div>
          </div>

          {/* Tips */}
          <div style={s.tips}>
            <h2 style={s.tipsTitle}>{isEn ? 'Password security tips' : 'Поради щодо паролів'}</h2>
            <div style={s.tipsGrid}>
              {(isEn ? [
                { icon: '📏', t: '16+ characters minimum', d: 'Length matters more than complexity. A 16-character password is far stronger than an 8-character one with all symbol types.' },
                { icon: '🔀', t: 'Unique per service',     d: 'If one site is breached, attackers will try your password on every other site automatically.' },
                { icon: '🗄️', t: 'Use a password manager', d: 'Bitwarden or KeePass — store all passwords in one place and remember only one master password.' },
                { icon: '🔐', t: 'Enable 2-factor auth',   d: 'Even a stolen password is useless to an attacker without your second authentication factor.' },
              ] : [
                { icon: '📏', t: 'Мінімум 16 символів', d: 'Довжина важливіша за складність. Пароль з 16 символів надійніший за 8-символьний з усіма типами.' },
                { icon: '🔀', t: 'Унікальний для кожного сервісу', d: 'Якщо один сайт зламали — зловмисники перевіряють цей пароль на всіх інших.' },
                { icon: '🗄️', t: 'Менеджер паролів', d: 'Bitwarden або KeePass — зберігай всі паролі в одному місці, потрібно запам'ятати тільки один.' },
                { icon: '🔐', t: 'Двофакторна аутентифікація', d: 'Навіть вкрадений пароль не допоможе зловмиснику без другого фактора.' },
              ]).map(({ icon, t, d }) => (
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
            <h2 style={s.seoH2}>{isEn ? 'How passwords are generated' : 'Як генерується пароль'}</h2>
            <p style={s.seoP}>{isEn
              ? 'All passwords are generated using '
              : 'Всі паролі генеруються через '}
              <code style={s.code}>window.crypto.getRandomValues()</code>
              {isEn
                ? ' — the browser's cryptographically secure random API. No data is ever sent to any server.'
                : ' — криптографічно безпечний API браузера. Ніякі дані не надсилаються на сервер.'}</p>
            <p style={s.seoP}>{isEn
              ? 'Entropy measures mathematical difficulty. 80+ bits is sufficient. 128 bits is practically unbreakable with today's hardware.'
              : 'Entropy показує математичну складність. 80+ біт — достатньо. 128 біт — практично нерозкривний.'}</p>
            <p style={s.seoP}>{isEn ? 'For Windows PC security audit — ' : 'Для захисту Windows ПК також перевір налаштування безпеки через '}
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
