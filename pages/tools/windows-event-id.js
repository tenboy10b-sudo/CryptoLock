import { useState, useMemo } from 'react'
import Layout from '../../components/Layout'
import Link from 'next/link'
import siteConfig from '../../site.config'

const SITE = siteConfig.url

const EVENTS = [
  // ── Входи / Виходи ──────────────────────────────────────────────────────
  { id: 4624, log: 'Security', category: 'Входи', severity: 'info', title: 'Успішний вхід в систему', desc: 'Обліковий запис успішно увійшов. Найпоширеніша подія в журналі безпеки.', details: 'Logon Type 2 = інтерактивний вхід (консоль). Type 3 = мережевий. Type 10 = Remote Desktop. Type 5 = служба. Перевіряй поле Account Name і Logon Type.', threat: 'low', action: 'Моніторинг: незнайомі акаунти або незвичний час входу — підозрілі.' },
  { id: 4625, log: 'Security', category: 'Входи', severity: 'warn', title: 'Невдала спроба входу', desc: 'Невдала спроба автентифікації — неправильний пароль або акаунт.', details: 'Failure Reason пояснює причину: %%2313 = неправильний пароль, %%2304 = акаунт не існує. Поле Caller Computer Name = звідки спроба. Багато подій підряд = атака brute-force.', threat: 'high', action: 'Кілька 4625 підряд з одного IP → заблокуй IP у брандмауері. Перевір Account Name.' },
  { id: 4634, log: 'Security', category: 'Входи', severity: 'info', title: 'Вихід з системи', desc: 'Сесія користувача завершена. Парна подія до 4624.', details: 'Logon ID зв\'язує вхід (4624) і вихід (4634). Відсутність 4634 після 4624 може означати що сесія ще активна або була обірвана.', threat: 'low', action: 'Норма. Моніторинг у разі підозрілої активності — перевір тривалість сесії.' },
  { id: 4648, log: 'Security', category: 'Входи', severity: 'warn', title: 'Вхід з явними обліковими даними', desc: 'Процес увійшов використовуючи явно вказані credentials (runas або мережеве підключення).', details: 'Часто генерується при runas, PsExec або підключенні до мережевого ресурсу з іншими credentials. Поле Target Server Name показує до якого ресурсу.', threat: 'medium', action: 'Перевір Target Account Name і Target Server — незнайоме поєднання підозріле.' },
  { id: 4720, log: 'Security', category: 'Акаунти', severity: 'warn', title: 'Створено новий обліковий запис', desc: 'Новий локальний або доменний обліковий запис створено.', details: 'Subject — хто створив. New Account Name — ім\'я нового акаунту. Перевіряй чи авторизована ця операція.', threat: 'high', action: 'Негайно перевір хто і чому створив новий акаунт. Особливо підозрілі акаунти створені вночі.' },
  { id: 4722, log: 'Security', category: 'Акаунти', severity: 'info', title: 'Обліковий запис увімкнено', desc: 'Раніше вимкнений акаунт було увімкнено.', details: 'Subject — хто увімкнув. Target Account — який акаунт. Увімкнення вбудованого Administrator або Guest — підозріло.', threat: 'medium', action: 'Перевір чи це авторизована дія. Guest або Administrator що увімкнувся сам — інцидент.' },
  { id: 4724, log: 'Security', category: 'Акаунти', severity: 'warn', title: 'Зміна пароля акаунту', desc: 'Адміністратор скинув пароль для облікового запису.', details: 'Відрізняється від 4723 (користувач змінив свій пароль). Subject = хто змінив, Target Account = чий пароль.', threat: 'medium', action: 'Несанкціонована зміна пароля = компрометація акаунту адміністратора.' },
  { id: 4728, log: 'Security', category: 'Групи', severity: 'warn', title: 'Додано члена до привілейованої групи', desc: 'Акаунт додано до групи безпеки (Domain Admins, Administrators тощо).', details: 'Group Name — яка група. Member Account Name — хто доданий. Subject — хто додав. Кожне додавання до Administrators потребує перевірки.', threat: 'high', action: 'Кожне додавання до Administrators або Domain Admins — перевіряй негайно.' },
  { id: 4732, log: 'Security', category: 'Групи', severity: 'warn', title: 'Додано члена до локальної групи', desc: 'Акаунт додано до локальної групи безпеки (наприклад Administrators).', details: 'Аналогічно 4728 але для локальних груп. Особливо небезпечно якщо акаунт додано до Administrators.', threat: 'high', action: 'Незаплановане додавання до Administrators — перевір негайно.' },

  // ── Процеси ─────────────────────────────────────────────────────────────
  { id: 4688, log: 'Security', category: 'Процеси', severity: 'info', title: 'Запущено новий процес', desc: 'Новий процес створено. Потребує увімкнення аудиту Process Creation.', details: 'Process Name — шлях до exe. Creator Process Name — батьківський процес. Command Line — повна команда (якщо увімкнено). Ключова подія для виявлення шкідливого ПЗ.', threat: 'medium', action: 'Підозрілі батьківські процеси: cmd.exe або powershell.exe запущений з Word/Excel — можлива атака.' },
  { id: 4689, log: 'Security', category: 'Процеси', severity: 'info', title: 'Процес завершено', desc: 'Процес завершив роботу. Парна подія до 4688.', details: 'Status 0x0 = нормальне завершення. Ненульовий Status = завершення з помилкою або примусове завершення.', threat: 'low', action: 'Норма. Аналізуй в парі з 4688 для побудови таймлайну подій.' },

  // ── Служби і завдання ────────────────────────────────────────────────────
  { id: 7034, log: 'System', category: 'Служби', severity: 'warn', title: 'Служба несподівано завершилась', desc: 'Служба Windows впала і була перезапущена або завершила роботу аварійно.', details: 'Service Name — яка служба. Повторювані падіння однієї служби вказують на проблему. Перевір залежності і системний журнал навколо цього часу.', threat: 'medium', action: 'Перевір причину падіння в Application Log. Оновіть або перевстанови службу.' },
  { id: 7045, log: 'System', category: 'Служби', severity: 'warn', title: 'Встановлено нову службу', desc: 'Нова служба зареєстрована в системі.', details: 'Service Name і Service File Name — назва і шлях до exe служби. Малварі часто встановлюють себе як службу. Перевір шлях — підозрілі: Temp, AppData, рандомне ім\'я.', threat: 'high', action: 'Перевір шлях служби. Exe в %TEMP%, %APPDATA% або з рандомним іменем — підозрілий.' },
  { id: 4698, log: 'Security', category: 'Завдання', severity: 'warn', title: 'Створено заплановане завдання', desc: 'Нове завдання додано в планувальник Windows. Популярний метод persistence малварі.', details: 'Task Name — ім\'я завдання. Task Content — XML опис включаючи команду. Перевір Task Content на підозрілі команди, Base64, PowerShell -EncodedCommand.', threat: 'high', action: 'Перевір Task Content. PowerShell -EncodedCommand або незвична команда = підозра на малваре.' },

  // ── Мережа і доступ ──────────────────────────────────────────────────────
  { id: 5156, log: 'Security', category: 'Мережа', severity: 'info', title: 'Дозволено мережеве підключення', desc: 'Windows Filtering Platform дозволила мережеве підключення.', details: 'Application Name, Source/Destination Address і Port. Потребує увімкнення Filtering Platform Connection аудиту.', threat: 'low', action: 'Норма. Корисний для аналізу мережевих підключень процесів.' },
  { id: 5152, log: 'Security', category: 'Мережа', severity: 'warn', title: 'Заблоковано мережевий пакет', desc: 'Windows Filtering Platform заблокувала мережеве підключення (правило брандмауера).', details: 'Application Name — який процес намагався підключитись. Destination Address і Port — куди намагався.', threat: 'medium', action: 'Часті блокування з одного процесу — можливо малваре намагається вийти в мережу.' },
  { id: 4776, log: 'Security', category: 'Входи', severity: 'info', title: 'Перевірка credentials (NTLM)', desc: 'DC перевірив credentials через NTLM. Може вказувати на NTLMv1 або Kerberos fallback.', details: 'Authentication Package = NTLM означає що Kerberos не використовувався. Error Code 0xC000006A = неправильний пароль.', threat: 'medium', action: 'Багато NTLM без успішного Kerberos = можлива Pass-the-Hash атака.' },

  // ── Система ──────────────────────────────────────────────────────────────
  { id: 41, log: 'System', category: 'Система', severity: 'critical', title: 'Система перезавантажилась без чистого вимкнення', desc: 'Windows завантажилась після неочікуваного вимкнення (BSOD, знеструмлення, зависання).', details: 'Поле BugCheckCode = код BSOD (якщо був синій екран). 0x0 = знеструмлення або жорстке вимкнення кнопкою. Шукай подію 1001 для деталей BSOD.', threat: 'high', action: 'Перевір наявність файлів дампу пам\'яті в C:\\Windows\\Minidump. Аналізуй разом з Event ID 1001.' },
  { id: 6008, log: 'System', category: 'Система', severity: 'warn', title: 'Неочікуване вимкнення системи', desc: 'Windows зафіксувала що попереднє вимкнення було неочікуваним.', details: 'Час останньої роботи вказаний в повідомленні. Разом з Event 41 дозволяє визначити коли стався збій.', threat: 'medium', action: 'Якщо повторюється — перевір температури, RAM і живлення ПК.' },
  { id: 1074, log: 'System', category: 'Система', severity: 'info', title: 'Система вимкнена / перезавантажена', desc: 'Система була навмисно вимкнена або перезавантажена (оновлення, команда, Пуск → Вимкнути).', details: 'User — хто ініціював. Reason — причина (наприклад "Application: Maintenance (Planned)"). Process — яка програма ініціювала.', threat: 'low', action: 'Перевір якщо ПК перезавантажився в незвичний час — можливо без твого відома.' },
  { id: 1102, log: 'Security', category: 'Аудит', severity: 'critical', title: 'Журнал аудиту очищено', desc: 'Security Event Log був очищений. Це класична ознака спроби приховати сліди зловмисника.', details: 'Subject Account Name — хто очистив. Очищення журналу аудиту ЗАВЖДИ підозріле, якщо не є частиною штатного обслуговування.', threat: 'critical', action: 'ТЕРМІНОВА реакція: хто і чому очистив журнал? Перевір всі інші системи на ознаки компрометації.' },
  { id: 4719, log: 'Security', category: 'Аудит', severity: 'critical', title: 'Змінено системну політику аудиту', desc: 'Налаштування аудиту Windows були змінені. Зловмисники вимикають аудит щоб приховати дії.', details: 'Changes — що змінилось. Вимикання категорій аудиту (Success/Failure → No Auditing) — підозрілий знак.', threat: 'critical', action: 'Перевір чи не вимкнено важливі категорії аудиту. Відновіть якщо так.' },
]

const CATEGORIES = ['Всі', ...new Set(EVENTS.map(e => e.category))]
const SEVERITY_CFG = {
  info:     { label: 'Інфо',     color: '#2563eb', bg: '#eff6ff' },
  warn:     { label: 'Увага',    color: '#ca8a04', bg: '#fefce8' },
  critical: { label: 'Критична', color: '#dc2626', bg: '#fef2f2' },
}
const THREAT_CFG = {
  low:      { label: '● Низька',    color: '#16a34a' },
  medium:   { label: '● Середня',  color: '#ca8a04' },
  high:     { label: '● Висока',   color: '#ea580c' },
  critical: { label: '● Критична', color: '#dc2626' },
}

export default function WindowsEventId() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Всі')
  const [expanded, setExpanded] = useState(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return EVENTS.filter(e => {
      const matchSearch = !q ||
        String(e.id).includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.desc.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      const matchCat = category === 'Всі' || e.category === category
      return matchSearch && matchCat
    })
  }, [search, category])

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Windows Event ID довідник — що означає Event ID',
    description: 'Розшифруй Event ID з Windows Event Viewer. Пошук по 20+ ключових подіях безпеки: входи, акаунти, процеси, служби.',
    url: `${SITE}/tools/windows-event-id`,
    applicationCategory: 'UtilityApplication',
    inLanguage: 'uk',
    publisher: { '@type': 'Organization', name: siteConfig.name, url: SITE },
  }

  return (
    <Layout
      title="Windows Event ID довідник — що означає Event ID"
      description="Розшифруй Event ID з Windows Event Viewer: 4624, 4625, 4688, 1102 і ще 20+. Опис, рівень загрози і дії для кожної події. Безкоштовно."
      canonical={`${SITE}/tools/windows-event-id`}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div style={{ padding: '2rem 0 4rem' }}>
        <div className="container">

          <nav style={s.bc}>
            <Link href="/" style={s.bcLink}>Головна</Link>
            <span style={s.bcSep}>/</span>
            <Link href="/tools" style={s.bcLink}>Інструменти</Link>
            <span style={s.bcSep}>/</span>
            <span style={{ ...s.bcLink, color: '#64748b' }}>Event ID довідник</span>
          </nav>

          <div style={s.header}>
            <h1 style={s.title}>📋 Windows Event ID довідник</h1>
            <p style={s.subtitle}>Що означає подія з журналу Windows — пошук за номером або ключовим словом</p>
          </div>

          {/* Controls */}
          <div style={s.controls}>
            <input
              style={s.search}
              type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Введи номер (4625) або ключове слово (вхід, служба, пароль)...'
              autoFocus
            />
            <div style={s.filters}>
              {CATEGORIES.map(cat => (
                <button key={cat}
                  style={category === cat ? s.filterActive : s.filterBtn}
                  onClick={() => setCategory(cat)}>{cat}</button>
              ))}
            </div>
            <p style={s.count}>{filtered.length} подій</p>
          </div>

          {/* Events */}
          <div style={s.list}>
            {filtered.map(ev => {
              const sev = SEVERITY_CFG[ev.severity]
              const thr = THREAT_CFG[ev.threat]
              const isOpen = expanded === ev.id
              return (
                <div key={ev.id} style={s.card}>
                  <button style={s.cardBtn} onClick={() => setExpanded(isOpen ? null : ev.id)}>
                    <div style={s.cardLeft}>
                      <span style={s.eventId}>{ev.id}</span>
                      <div>
                        <div style={s.cardTitle}>{ev.title}</div>
                        <div style={s.cardMeta}>
                          <span style={{ ...s.sevBadge, color: sev.color, background: sev.bg }}>{sev.label}</span>
                          <span style={s.logBadge}>{ev.log}</span>
                          <span style={{ ...s.catBadge }}>{ev.category}</span>
                        </div>
                      </div>
                    </div>
                    <span style={s.arrow}>{isOpen ? '▲' : '▼'}</span>
                  </button>

                  {isOpen && (
                    <div style={s.cardBody}>
                      <p style={s.cardDesc}>{ev.desc}</p>
                      <div style={s.detailGrid}>
                        <div>
                          <p style={s.detailLabel}>📌 Деталі</p>
                          <p style={s.detailText}>{ev.details}</p>
                        </div>
                        <div>
                          <p style={s.detailLabel}>⚡ Що робити</p>
                          <p style={{ ...s.detailText, color: thr.color, fontWeight: 600 }}>
                            {thr.label}
                          </p>
                          <p style={s.detailText}>{ev.action}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {filtered.length === 0 && (
              <p style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)', textAlign: 'center', padding: '2rem' }}>
                Нічого не знайдено. Спробуй інший запит.
              </p>
            )}
          </div>

          {/* SEO */}
          <div style={s.seoBlock}>
            <h2 style={s.seoH2}>Як користуватись</h2>
            <p style={s.seoP}>
              Відкрий <strong>Event Viewer</strong> (<code style={s.code}>eventvwr.msc</code>), знайди
              підозрілу подію, скопіюй Event ID і вставте у пошук вище — отримаєш опис і рекомендації.
            </p>
            <p style={s.seoP}>
              Найважливіші Event ID для безпеки: <strong>4625</strong> (невдалий вхід),{' '}
              <strong>4720</strong> (новий акаунт), <strong>7045</strong> (нова служба),{' '}
              <strong>1102</strong> (очищення журналу), <strong>4698</strong> (нове заплановане завдання).
            </p>
            <p style={s.seoP}>
              Для автоматичного аудиту безпеки Windows ПК по 22 параметрах —{' '}
              <Link href="/tools/auditshield" style={s.link}>AuditShield</Link>.
              Для розшифрування кодів помилок —{' '}
              <Link href="/tools/windows-error-decoder" style={s.link}>Декодер помилок</Link>.
            </p>
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
  header: { marginBottom: '1.5rem', textAlign: 'center' },
  title: { fontFamily: "'Unbounded', sans-serif", fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', fontWeight: 700, color: '#0f172a', marginBottom: '8px' },
  subtitle: { fontSize: '1rem', color: '#64748b', margin: 0 },
  controls: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem' },
  search: { width: '100%', padding: '12px 16px', marginBottom: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', background: '#fff', color: '#0f172a', boxSizing: 'border-box' },
  filters: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' },
  filterBtn: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#64748b', background: '#fff', border: '1px solid #e2e8f0', padding: '4px 12px', borderRadius: '20px', cursor: 'pointer' },
  filterActive: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#fff', background: '#2563eb', border: '1px solid #2563eb', padding: '4px 12px', borderRadius: '20px', cursor: 'pointer' },
  count: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#94a3b8', margin: 0 },
  list: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '2.5rem' },
  card: { border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', background: '#fff' },
  cardBtn: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '12px' },
  cardLeft: { display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 },
  eventId: { fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 800, color: '#2563eb', minWidth: '48px', flexShrink: 0, paddingTop: '2px' },
  cardTitle: { fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', marginBottom: '5px' },
  cardMeta: { display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' },
  sevBadge: { fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' },
  logBadge: { fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' },
  catBadge: { fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#94a3b8' },
  arrow: { fontSize: '10px', color: '#94a3b8', flexShrink: 0 },
  cardBody: { padding: '1.25rem', borderTop: '1px solid #f1f5f9', background: '#fafafa' },
  cardDesc: { fontSize: '0.9rem', color: '#475569', lineHeight: 1.7, marginBottom: '1rem', padding: '0.75rem 1rem', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' },
  detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' },
  detailLabel: { fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' },
  detailText: { fontSize: '0.825rem', color: '#334155', lineHeight: 1.7, margin: 0 },
  seoBlock: { padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', marginBottom: '2rem' },
  seoH2: { fontFamily: "'Unbounded', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' },
  seoP: { fontSize: '0.875rem', color: '#475569', lineHeight: 1.8, marginBottom: '8px' },
  code: { fontFamily: 'var(--font-mono)', background: '#e2e8f0', padding: '1px 5px', borderRadius: '4px', fontSize: '0.85em' },
  link: { color: '#2563eb', fontWeight: 500, textDecoration: 'none' },
  back: { paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' },
  backLink: { fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#2563eb', fontWeight: 500, textDecoration: 'none' },
}
