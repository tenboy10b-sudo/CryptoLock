import { useState, useCallback } from 'react'
import Layout from '../../components/Layout'
import Link from 'next/link'
import siteConfig from '../../site.config'

const SITE = siteConfig.url

// База помилок Windows — найпоширеніші коди
const ERROR_DB = {
  // Access / Permissions
  '0x80070005': { name: 'ERROR_ACCESS_DENIED', category: 'Доступ', severity: 'high', description: 'Відмовлено в доступі. Windows не може виконати операцію через недостатні права доступу.', causes: ['Запуск без прав адміністратора', 'Антивірус блокує операцію', 'Пошкоджені права NTFS на файл або папку', 'UAC заблокував дію'], fixes: ['Запусти програму від імені адміністратора (ПКМ → Запуск від адміністратора)', 'Тимчасово вимкни антивірус і повтори операцію', 'Запусти: icacls "шлях" /reset /T — для відновлення прав', 'Перевір налаштування UAC в Параметрах'] },
  '0x80070006': { name: 'ERROR_INVALID_HANDLE', category: 'Система', severity: 'medium', description: 'Недійсний дескриптор (handle). Програма звернулась до вже закритого або неіснуючого ресурсу.', causes: ['Збій в програмі або службі', 'Пошкоджені системні файли', 'Конфлікт програм'], fixes: ['Перезапустити програму або службу', 'Запустити sfc /scannow в командному рядку від адміна', 'Перезавантажити Windows'] },

  // File not found
  '0x80070002': { name: 'ERROR_FILE_NOT_FOUND', category: 'Файли', severity: 'medium', description: 'Файл не знайдено. Система шукає файл за вказаним шляхом, але не може його знайти.', causes: ['Файл видалено або переміщено', 'Неправильний шлях до файлу', 'Пошкоджений реєстр Windows', 'Відсутній компонент оновлення Windows'], fixes: ['Перевір чи існує файл за вказаним шляхом', 'Для помилки Windows Update: запусти засіб усунення неполадок (Параметри → Оновлення → Усунення неполадок)', 'Запусти DISM /Online /Cleanup-Image /RestoreHealth', 'Перевір і відновіть системні файли: sfc /scannow'] },
  '0x80070003': { name: 'ERROR_PATH_NOT_FOUND', category: 'Файли', severity: 'medium', description: 'Шлях не знайдено. Вказана папка або директорія не існує в системі.', causes: ['Папку видалено або перейменовано', 'Диск відключений або недоступний', 'Неправильний шлях в реєстрі'], fixes: ['Перевір чи існує зазначена папка', 'Якщо помилка при запуску програми — перевстанови її', 'Перевір записи автозавантаження в реєстрі'] },

  // Disk / Memory
  '0x80070070': { name: 'ERROR_DISK_FULL', category: 'Диск', severity: 'high', description: 'Диск заповнений. На диску недостатньо вільного місця для виконання операції.', causes: ['Диск переповнений', 'Накопичились тимчасові файли', 'Файл підкачки займає багато місця'], fixes: ['Запусти очищення диску (cleanmgr) і видали тимчасові файли', 'Звільни місце видаливши непотрібні програми та файли', 'Перемісти великі файли на інший диск', 'Перевір і зменши розмір файлу підкачки'] },
  '0x8007000E': { name: 'ERROR_OUTOFMEMORY', category: 'Пам\'ять', severity: 'high', description: 'Недостатньо пам\'яті. Системі не вистачає оперативної пам\'яті для виконання операції.', causes: ['Замало RAM для запущених програм', 'Витік пам\'яті в програмі', 'Файл підкачки вимкнений або замалий'], fixes: ['Закрий непотрібні програми і вкладки браузера', 'Перезавантаж Windows для очищення пам\'яті', 'Перевір файл підкачки: sysdm.cpl → Додатково → Продуктивність', 'Запусти перевірку пам\'яті: mdsched.exe'] },

  // Network
  '0x80072EFE': { name: 'ERROR_INTERNET_CONNECTION_ABORTED', category: 'Мережа', severity: 'medium', description: 'З\'єднання перервано. Підключення до інтернету було перервано під час операції.', causes: ['Нестабільне інтернет-підключення', 'Брандмауер або антивірус блокує з\'єднання', 'Проблеми з DNS'], fixes: ['Перевір інтернет-підключення', 'Тимчасово вимкни брандмауер і спробуй знову', 'Зміни DNS на 1.1.1.1 або 8.8.8.8', 'Запусти: netsh winsock reset && netsh int ip reset'] },
  '0x80072EE7': { name: 'ERROR_INTERNET_NAME_NOT_RESOLVED', category: 'Мережа', severity: 'medium', description: 'Ім\'я сервера не вдалося розпізнати. DNS не може знайти адресу зазначеного хоста.', causes: ['Проблеми з DNS сервером', 'Немає доступу до інтернету', 'Неправильні налаштування DNS', 'Hosts файл містить неправильні записи'], fixes: ['Очисти DNS кеш: ipconfig /flushdns', 'Зміни DNS сервер на 1.1.1.1 (Cloudflare) або 8.8.8.8 (Google)', 'Перевір файл hosts: C:\\Windows\\System32\\drivers\\etc\\hosts', 'Перезапусти службу DNS Client'] },
  '0x80072F8F': { name: 'ERROR_WINHTTP_SECURE_FAILURE', category: 'Мережа', severity: 'medium', description: 'Помилка SSL/TLS сертифіката. Неможливо встановити безпечне з\'єднання через проблему з сертифікатом.', causes: ['Неправильна дата і час на ПК', 'Застарілі кореневі сертифікати', 'Проблема з SSL на сервері'], fixes: ['Перевір і синхронізуй дату та час: w32tm /resync', 'Оновіть Windows — оновлення включають нові кореневі сертифікати', 'Перевір налаштування проксі-сервера'] },

  // Windows Update
  '0x80248007': { name: 'WU_E_DS_NODATA', category: 'Windows Update', severity: 'medium', description: 'Помилка Windows Update — відсутні необхідні дані в базі оновлень.', causes: ['Пошкоджена база даних Windows Update', 'Недостатньо місця на диску', 'Проблема зі службою Windows Update'], fixes: ['Запусти засіб усунення неполадок Windows Update', 'Очисти кеш оновлень: net stop wuauserv → видали C:\\Windows\\SoftwareDistribution → net start wuauserv', 'Запусти DISM /Online /Cleanup-Image /RestoreHealth'] },
  '0x80073712': { name: 'ERROR_SXS_COMPONENT_STORE_CORRUPT', category: 'Windows Update', severity: 'high', description: 'Сховище компонентів Windows пошкоджено. Файли Windows Update пошкоджені або відсутні.', causes: ['Пошкоджені системні файли', 'Перерване оновлення', 'Проблема з диском'], fixes: ['Запусти: DISM /Online /Cleanup-Image /RestoreHealth', 'Потім: sfc /scannow', 'Перевір диск: chkdsk C: /f /r (потребує перезавантаження)'] },
  '0x80070057': { name: 'ERROR_INVALID_PARAMETER', category: 'Система', severity: 'medium', description: 'Невірний параметр. Програма або Windows отримала недопустиме значення параметра.', causes: ['Пошкоджені системні файли', 'Конфлікт драйверів', 'Проблема з оновленням Windows'], fixes: ['Запусти sfc /scannow в командному рядку від адміна', 'Запусти DISM /Online /Cleanup-Image /RestoreHealth', 'Видали останнє встановлене оновлення якщо проблема з\'явилась після нього'] },

  // BSOD / Critical
  '0xC000021A': { name: 'STATUS_SYSTEM_PROCESS_TERMINATED', category: 'BSOD', severity: 'critical', description: 'Критична помилка Windows — системний процес завершився аварійно. Один з основних процесів Windows (winlogon.exe або csrss.exe) завершився.', causes: ['Пошкоджені системні файли', 'Несумісний драйвер', 'Проблема з профілем користувача', 'Пошкоджений реєстр'], fixes: ['Завантажся в безпечному режимі (F8 при старті)', 'Запусти sfc /scannow від адміністратора', 'Відновлення системи до точки до появи проблеми', 'Перевстанови драйвери відеокарти'] },
  '0x0000007E': { name: 'SYSTEM_THREAD_EXCEPTION_NOT_HANDLED', category: 'BSOD', severity: 'critical', description: 'Синій екран смерті — системний потік згенерував виключення яке обробник помилок не зміг обробити.', causes: ['Несумісний або пошкоджений драйвер', 'Пошкоджений системний файл', 'Проблема з обладнанням (RAM, диск)'], fixes: ['Завантажся в безпечному режимі і видали останній встановлений драйвер', 'Перевір RAM: mdsched.exe', 'Перевір диск: chkdsk /f', 'Запусти sfc /scannow'] },
  '0x00000050': { name: 'PAGE_FAULT_IN_NONPAGED_AREA', category: 'BSOD', severity: 'critical', description: 'BSOD — спроба звернутись до пам\'яті яка не знаходиться в оперативній пам\'яті.', causes: ['Несправна оперативна пам\'ять', 'Пошкоджений драйвер', 'Вірус або шкідливе ПЗ', 'Перегрів'], fixes: ['Запусти перевірку RAM: mdsched.exe', 'Перевір температури компонентів', 'Видали або оновіть проблемний драйвер', 'Запусти повне сканування на віруси'] },

  // Store / Activation
  '0x80073CF0': { name: 'ERROR_PACKAGE_NOT_FOUND', category: 'Microsoft Store', severity: 'low', description: 'Пакет програми не знайдено в Microsoft Store або в системі.', causes: ['Програма не встановлена', 'Пошкоджена установка програми', 'Проблема з Microsoft Store'], fixes: ['Скинь кеш Store: запусти wsreset.exe', 'Перевстанови програму через Microsoft Store', 'Запусти: Get-AppxPackage -AllUsers | ForEach {Add-AppxPackage -DisableDevelopmentMode -Register "$($_.InstallLocation)\\AppXManifest.xml"} в PowerShell'] },
  '0x803FB005': { name: 'WU_E_REDIRECTOR_S_FALSE', category: 'Microsoft Store', severity: 'low', description: 'Помилка завантаження з Microsoft Store. Не вдалось завантажити або встановити програму.', causes: ['Проблема з інтернет-підключенням', 'Недостатньо місця на диску', 'Пошкоджений кеш Store'], fixes: ['Скинь кеш Store: wsreset.exe', 'Перевір інтернет і вільне місце на диску', 'Перевстанови Microsoft Store через PowerShell: Get-AppxPackage Microsoft.WindowsStore | Remove-AppxPackage'] },

  // BitLocker
  '0x80310008': { name: 'FVE_E_VOLUME_NOT_SUPPORTED', category: 'BitLocker', severity: 'medium', description: 'BitLocker не підтримується для цього тому. Том не відповідає вимогам BitLocker.', causes: ['Відсутній TPM чіп', 'Диск відформатований у FAT замість NTFS', 'Системний диск не є основним NTFS томом'], fixes: ['Перевір наявність TPM: tpm.msc', 'Переконайся що диск відформатований у NTFS', 'Для шифрування без TPM: увімкни в gpedit.msc → Конфігурація комп\'ютера → Шаблони адміністрування → BitLocker → Require additional authentication at startup → включи "Allow BitLocker without compatible TPM"'] },

  // Generic
  '0x80004005': { name: 'E_FAIL', category: 'Загальна', severity: 'medium', description: 'Невизначена помилка. Загальний код помилки — операція не вдалась без конкретної причини.', causes: ['Проблема з доступом до файлу або ресурсу', 'Пошкоджений файл або архів', 'Несумісність програм', 'Проблема з мережею (для мережевих ресурсів)'], fixes: ['Запусти програму від імені адміністратора', 'Перевстанови проблемну програму', 'Перевір цілісність системних файлів: sfc /scannow', 'Для мережевих ресурсів: перевір дозволи SMB і NTFS'] },
  '0x8000FFFF': { name: 'E_UNEXPECTED', category: 'Загальна', severity: 'medium', description: 'Непередбачена помилка. Виникла неочікувана критична помилка у програмі або системі.', causes: ['Пошкоджені системні файли', 'Конфлікт програм', 'Проблема з Windows Update'], fixes: ['Перезавантаж систему', 'Запусти sfc /scannow', 'Перевір Windows Update на наявність оновлень', 'Якщо пов\'язано з Microsoft Store — запусти wsreset.exe'] },
  '0x80070490': { name: 'ERROR_NOT_FOUND', category: 'Система', severity: 'low', description: 'Елемент не знайдено. Запитаний об\'єкт, ключ реєстру або ресурс не існує.', causes: ['Пошкоджений компонент Windows', 'Відсутній запис в реєстрі', 'Проблема з Windows Update або DISM'], fixes: ['Запусти DISM /Online /Cleanup-Image /RestoreHealth', 'Для помилки Windows Update — скинь кеш оновлень', 'sfc /scannow для відновлення системних файлів'] },
}

const SEVERITY_CONFIG = {
  critical: { label: 'Критична', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  high:     { label: 'Висока',   color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
  medium:   { label: 'Середня', color: '#ca8a04', bg: '#fefce8', border: '#fef08a' },
  low:      { label: 'Низька',  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
}

const CATEGORIES = [...new Set(Object.values(ERROR_DB).map(e => e.category))]

function normalizeCode(input) {
  const s = input.trim().toUpperCase().replace(/\s/g, '')
  if (s.startsWith('0X')) return s
  if (/^[0-9A-F]{8}$/.test(s)) return '0x' + s
  if (/^\d+$/.test(s)) {
    const hex = parseInt(s).toString(16).toUpperCase().padStart(8, '0')
    return '0x' + hex
  }
  return s
}

export default function WindowsErrorDecoder() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [filter, setFilter] = useState('all')

  const decode = useCallback(() => {
    if (!query.trim()) return
    const normalized = normalizeCode(query)
    const found = ERROR_DB[normalized]
    if (found) {
      setResult({ code: normalized, ...found })
      setNotFound(false)
    } else {
      setResult(null)
      setNotFound(true)
    }
  }, [query])

  const handleKey = (e) => {
    if (e.key === 'Enter') decode()
  }

  const filteredErrors = filter === 'all'
    ? Object.entries(ERROR_DB)
    : Object.entries(ERROR_DB).filter(([, v]) => v.category === filter)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Декодер помилок Windows — розшифруй код помилки онлайн',
    description: 'Безкоштовний онлайн інструмент для розшифрування кодів помилок Windows. Введи код на кшталт 0x80070005 і дізнайся що він означає та як виправити.',
    url: `${SITE}/tools/windows-error-decoder`,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Windows',
    inLanguage: 'uk',
    publisher: { '@type': 'Organization', name: siteConfig.name, url: SITE },
  }

  const sev = result ? SEVERITY_CONFIG[result.severity] : null

  return (
    <Layout
      title="Декодер помилок Windows — розшифруй код помилки онлайн"
      description="Введи код помилки Windows (наприклад 0x80070005) і дізнайся що він означає, чому виникає і як виправити. Безкоштовно, без реєстрації."
      canonical={`${SITE}/tools/windows-error-decoder`}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div style={{ padding: '2rem 0 4rem' }}>
        <div className="container">

          {/* Breadcrumb */}
          <nav style={s.bc}>
            <Link href="/" style={s.bcLink}>Головна</Link>
            <span style={s.bcSep}>/</span>
            <Link href="/tools" style={s.bcLink}>Інструменти</Link>
            <span style={s.bcSep}>/</span>
            <span style={{ ...s.bcLink, color: '#64748b' }}>Декодер помилок</span>
          </nav>

          {/* Header */}
          <div style={s.header}>
            <h1 style={s.title}>🔍 Декодер помилок Windows</h1>
            <p style={s.subtitle}>
              Введи код помилки — дізнайся що він означає і як виправити
            </p>
          </div>

          {/* Search */}
          <div style={s.searchBox}>
            <div style={s.searchRow}>
              <input
                style={s.input}
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setResult(null); setNotFound(false) }}
                onKeyDown={handleKey}
                placeholder="0x80070005 або 80070005 або 2147942405..."
                autoFocus
              />
              <button style={s.btn} onClick={decode}>Декодувати</button>
            </div>
            <div style={s.examples}>
              Спробуй:{' '}
              {['0x80070005', '0x80070002', '0xC000021A', '0x80070070', '0x80248007'].map(code => (
                <button key={code} style={s.chip}
                  onClick={() => { setQuery(code); setTimeout(decode, 0) }}>
                  {code}
                </button>
              ))}
            </div>
          </div>

          {/* Result */}
          {result && sev && (
            <div style={{ ...s.resultCard, borderColor: sev.border, background: '#fff' }}>
              <div style={{ ...s.resultHeader, background: sev.bg, borderBottom: `1px solid ${sev.border}` }}>
                <div style={s.resultCode}>{result.code}</div>
                <div style={s.resultMeta}>
                  <span style={{ ...s.resultName }}>{result.name}</span>
                  <span style={{ ...s.severityBadge, color: sev.color, background: sev.bg, border: `1px solid ${sev.border}` }}>
                    {sev.label}
                  </span>
                  <span style={s.catBadge}>{result.category}</span>
                </div>
              </div>

              <div style={s.resultBody}>
                <p style={s.resultDesc}>{result.description}</p>

                <div style={s.resultCols}>
                  <div>
                    <p style={s.resultSectionTitle}>⚡ Причини</p>
                    <ul style={s.resultList}>
                      {result.causes.map((c, i) => <li key={i} style={s.resultLi}>{c}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p style={s.resultSectionTitle}>🔧 Як виправити</p>
                    <ol style={s.resultList}>
                      {result.fixes.map((f, i) => <li key={i} style={s.resultLi}>{f}</li>)}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {notFound && (
            <div style={s.notFound}>
              <p style={s.notFoundTitle}>Код не знайдено в базі</p>
              <p style={s.notFoundText}>
                Спробуй пошукати на{' '}
                <a href={`https://learn.microsoft.com/search/?terms=${query}`}
                  target="_blank" rel="noopener noreferrer" style={s.link}>
                  Microsoft Learn
                </a>{' '}або в{' '}
                <a href={`https://www.google.com/search?q=windows+error+${query}`}
                  target="_blank" rel="noopener noreferrer" style={s.link}>
                  Google
                </a>.
              </p>
            </div>
          )}

          {/* Error browser */}
          <div style={s.section}>
            <div style={s.browserHeader}>
              <h2 style={s.h2}>База помилок</h2>
              <div style={s.filters}>
                <button style={filter === 'all' ? s.filterActive : s.filterBtn}
                  onClick={() => setFilter('all')}>Всі</button>
                {CATEGORIES.map(cat => (
                  <button key={cat}
                    style={filter === cat ? s.filterActive : s.filterBtn}
                    onClick={() => setFilter(cat)}>{cat}</button>
                ))}
              </div>
            </div>

            <div style={s.errGrid}>
              {filteredErrors.map(([code, err]) => {
                const sv = SEVERITY_CONFIG[err.severity]
                return (
                  <button key={code} style={s.errCard}
                    onClick={() => { setQuery(code); setResult({ code, ...err }); setNotFound(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                    <div style={s.errCardTop}>
                      <span style={s.errCode}>{code}</span>
                      <span style={{ ...s.severityDot, background: sv.color }} title={sv.label} />
                    </div>
                    <p style={s.errName}>{err.name}</p>
                    <p style={s.errCat}>{err.category}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* SEO text */}
          <div style={s.seoBlock}>
            <h2 style={s.seoH2}>Як розшифрувати код помилки Windows</h2>
            <p style={s.seoP}>
              Коди помилок Windows зазвичай виглядають як <code style={s.code}>0x80070005</code> або
              <code style={s.code}>0xC000021A</code>. Перші чотири символи після <code style={s.code}>0x8007</code> —
              це код Win32 у шістнадцятковому форматі. Наприклад, <code style={s.code}>0005</code> = 5 =
              ERROR_ACCESS_DENIED (відмовлено в доступі).
            </p>
            <p style={s.seoP}>
              Цей інструмент допомагає швидко зрозуміти що означає код помилки і які кроки зробити для
              виправлення — без пошуку по форумах. База містить найпоширеніші помилки Windows 10 і Windows 11.
            </p>
            <p style={s.seoP}>
              Для глибшого аудиту безпеки ПК — скористайся <Link href="/tools/auditshield" style={s.link}>AuditShield</Link>,
              який перевіряє систему по 22 напрямках і видає повний HTML-звіт.
            </p>
          </div>

          {/* Back */}
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

  header: { marginBottom: '2rem', textAlign: 'center' },
  title: { fontFamily: "'Unbounded', sans-serif", fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', fontWeight: 700, color: '#0f172a', marginBottom: '8px' },
  subtitle: { fontSize: '1rem', color: '#64748b', margin: 0 },

  searchBox: {
    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px',
    padding: '1.5rem', marginBottom: '2rem',
  },
  searchRow: { display: 'flex', gap: '10px', marginBottom: '12px' },
  input: {
    flex: 1, padding: '12px 16px',
    fontFamily: 'var(--font-mono)', fontSize: '1rem',
    border: '2px solid #e2e8f0', borderRadius: '8px',
    outline: 'none', background: '#fff', color: '#0f172a',
  },
  btn: {
    padding: '12px 24px', background: '#2563eb', color: '#fff',
    border: 'none', borderRadius: '8px', fontWeight: 700,
    fontSize: '0.9rem', cursor: 'pointer', whiteSpace: 'nowrap',
  },
  examples: { display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', fontSize: '0.8rem', color: '#94a3b8' },
  chip: {
    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#2563eb',
    background: '#eff6ff', border: '1px solid #bfdbfe',
    padding: '3px 10px', borderRadius: '20px', cursor: 'pointer',
  },

  resultCard: { border: '1px solid', borderRadius: '12px', marginBottom: '2rem', overflow: 'hidden' },
  resultHeader: { padding: '1.25rem 1.5rem' },
  resultCode: { fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' },
  resultMeta: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  resultName: { fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#475569', fontWeight: 600 },
  severityBadge: { fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '20px' },
  catBadge: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' },
  resultBody: { padding: '1.5rem' },
  resultDesc: { fontSize: '0.95rem', color: '#475569', lineHeight: 1.7, marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' },
  resultCols: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' },
  resultSectionTitle: { fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' },
  resultList: { paddingLeft: '1.25rem', margin: 0 },
  resultLi: { fontSize: '0.875rem', color: '#334155', lineHeight: 1.7, marginBottom: '6px' },

  notFound: { padding: '1.5rem', background: '#fafafa', border: '1px dashed #cbd5e1', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center' },
  notFoundTitle: { fontWeight: 700, color: '#475569', marginBottom: '6px' },
  notFoundText: { fontSize: '0.875rem', color: '#64748b', margin: 0 },

  section: { marginBottom: '3rem' },
  browserHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '1rem' },
  h2: { fontFamily: "'Unbounded', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 },
  filters: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  filterBtn: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#64748b', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px 12px', borderRadius: '20px', cursor: 'pointer' },
  filterActive: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#fff', background: '#2563eb', border: '1px solid #2563eb', padding: '4px 12px', borderRadius: '20px', cursor: 'pointer' },

  errGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' },
  errCard: {
    textAlign: 'left', padding: '12px 14px', background: '#fff',
    border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer',
  },
  errCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  errCode: { fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: '#2563eb' },
  severityDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  errName: { fontSize: '0.75rem', color: '#334155', marginBottom: '2px', fontWeight: 600 },
  errCat: { fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#94a3b8', margin: 0 },

  seoBlock: { padding: '2rem', background: '#f8fafc', borderRadius: '12px', marginBottom: '2rem' },
  seoH2: { fontFamily: "'Unbounded', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' },
  seoP: { fontSize: '0.875rem', color: '#475569', lineHeight: 1.8, marginBottom: '10px' },
  code: { fontFamily: 'var(--font-mono)', background: '#e2e8f0', padding: '1px 5px', borderRadius: '4px', fontSize: '0.85em' },
  link: { color: '#2563eb', fontWeight: 500 },
  back: { marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' },
  backLink: { fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#2563eb', fontWeight: 500, textDecoration: 'none' },
}
