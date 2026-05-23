import { useState, useMemo } from 'react'
import Layout from '../../components/Layout'
import Link from 'next/link'
import siteConfig from '../../site.config'

const SITE = siteConfig.url

const COMMANDS = [
  // ── Мережа ──────────────────────────────────────────────────────────────
  { id: 1, shell: 'both', category: 'Мережа', task: 'Перевірити підключення до хоста', cmd: 'ping google.com', ps: 'Test-NetConnection -ComputerName google.com', desc: 'Перевіряє чи доступний хост по мережі. Показує затримку і втрати пакетів.' },
  { id: 2, shell: 'both', category: 'Мережа', task: 'Показати IP-адресу', cmd: 'ipconfig', ps: 'Get-NetIPAddress | Where-Object {$_.AddressFamily -eq "IPv4"}', desc: 'Відображає IP-адресу, маску підмережі і шлюз для всіх мережевих адаптерів.' },
  { id: 3, shell: 'both', category: 'Мережа', task: 'Очистити DNS кеш', cmd: 'ipconfig /flushdns', ps: 'Clear-DnsClientCache', desc: 'Очищає кеш DNS. Допомагає якщо сайти не відкриваються після зміни DNS.' },
  { id: 4, shell: 'ps', category: 'Мережа', task: 'Показати відкриті порти', cmd: '', ps: 'Get-NetTCPConnection -State Listen | Select-Object LocalPort, @{n="Process";e={(Get-Process -Id $_.OwningProcess -EA 0).Name}} | Sort-Object LocalPort', desc: 'Список всіх портів що зараз слухають підключення з іменами процесів.' },
  { id: 5, shell: 'both', category: 'Мережа', task: 'Показати активні підключення', cmd: 'netstat -ano', ps: 'Get-NetTCPConnection -State Established | Select-Object LocalPort, RemoteAddress, RemotePort', desc: 'Показує всі активні TCP підключення.' },
  { id: 6, shell: 'both', category: 'Мережа', task: 'Скинути налаштування мережі', cmd: 'netsh winsock reset && netsh int ip reset', ps: 'netsh winsock reset; netsh int ip reset', desc: 'Скидає Winsock і TCP/IP стек. Виправляє більшість проблем з мережею.' },
  { id: 7, shell: 'ps', category: 'Мережа', task: 'Змінити DNS сервер', cmd: '', ps: 'Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses ("1.1.1.1","8.8.8.8")', desc: 'Встановлює DNS сервери Cloudflare і Google для адаптера Wi-Fi.' },
  { id: 8, shell: 'both', category: 'Мережа', task: 'Трасування маршруту', cmd: 'tracert google.com', ps: 'Test-NetConnection -ComputerName google.com -TraceRoute', desc: 'Показує маршрут пакета до хоста і затримку на кожному вузлі.' },

  // ── Файли і папки ───────────────────────────────────────────────────────
  { id: 9, shell: 'both', category: 'Файли', task: 'Показати вміст папки', cmd: 'dir', ps: 'Get-ChildItem', desc: 'Виводить список файлів і папок в поточній директорії.' },
  { id: 10, shell: 'both', category: 'Файли', task: 'Перейти в папку', cmd: 'cd C:\\Users\\Name', ps: 'Set-Location C:\\Users\\Name', desc: 'Змінює поточну директорію. cd .. — перехід на рівень вище.' },
  { id: 11, shell: 'both', category: 'Файли', task: 'Копіювати файл', cmd: 'copy file.txt C:\\dest\\', ps: 'Copy-Item file.txt -Destination C:\\dest\\', desc: 'Копіює файл або папку. Для папок з вмістом додай /S (cmd) або -Recurse (PS).' },
  { id: 12, shell: 'both', category: 'Файли', task: 'Видалити файл', cmd: 'del file.txt', ps: 'Remove-Item file.txt -Force', desc: 'Видаляє файл. -Force видаляє файли тільки для читання. Для папок: rd /s (cmd) або Remove-Item -Recurse (PS).' },
  { id: 13, shell: 'ps', category: 'Файли', task: 'Знайти великі файли', cmd: '', ps: 'Get-ChildItem C:\\ -Recurse -EA 0 | Where-Object {$_.Length -gt 500MB} | Sort-Object Length -Descending | Select-Object FullName, @{n="GB";e={[math]::Round($_.Length/1GB,1)}}', desc: 'Знаходить файли розміром більше 500 МБ на диску C:.' },
  { id: 14, shell: 'ps', category: 'Файли', task: 'Отримати розмір папки', cmd: '', ps: '"{0:N1} GB" -f ((Get-ChildItem "C:\\Folder" -Recurse -EA 0 | Measure-Object Length -Sum).Sum / 1GB)', desc: 'Підраховує загальний розмір папки і всіх підпапок.' },
  { id: 15, shell: 'both', category: 'Файли', task: 'Пошук файлів за ім\'ям', cmd: 'dir /s /b *keyword*', ps: 'Get-ChildItem C:\\ -Recurse -Filter "*keyword*" -EA 0', desc: 'Рекурсивний пошук файлів за частиною імені.' },

  // ── Процеси і служби ────────────────────────────────────────────────────
  { id: 16, shell: 'both', category: 'Процеси', task: 'Список всіх процесів', cmd: 'tasklist', ps: 'Get-Process | Sort-Object CPU -Descending | Select-Object -First 20 Name, CPU, Id', desc: 'Показує запущені процеси. PowerShell сортує по споживанню CPU.' },
  { id: 17, shell: 'both', category: 'Процеси', task: 'Завершити процес за іменем', cmd: 'taskkill /f /im notepad.exe', ps: 'Stop-Process -Name notepad -Force', desc: 'Примусово завершує процес за іменем виконуваного файлу.' },
  { id: 18, shell: 'both', category: 'Процеси', task: 'Список служб Windows', cmd: 'sc query', ps: 'Get-Service | Sort-Object Status -Descending | Format-Table Name, Status, StartType', desc: 'Показує всі служби Windows з їх статусом.' },
  { id: 19, shell: 'both', category: 'Процеси', task: 'Запустити / зупинити службу', cmd: 'net start/stop "ServiceName"', ps: 'Start-Service "ServiceName" / Stop-Service "ServiceName" -Force', desc: 'Запускає або зупиняє службу Windows за іменем.' },
  { id: 20, shell: 'ps', category: 'Процеси', task: 'Знайти який процес займає порт', cmd: '', ps: 'Get-NetTCPConnection -LocalPort 3389 | Select-Object @{n="Process";e={(Get-Process -Id $_.OwningProcess).Name}}, State', desc: 'Знаходить процес що слухає на вказаному порті (замінити 3389).' },

  // ── Система і діагностика ───────────────────────────────────────────────
  { id: 21, shell: 'both', category: 'Система', task: 'Перевірити системні файли', cmd: 'sfc /scannow', ps: 'sfc /scannow', desc: 'Перевіряє і відновлює пошкоджені системні файли Windows. Потребує прав адміністратора.' },
  { id: 22, shell: 'both', category: 'Система', task: 'Відновити образ Windows (DISM)', cmd: 'DISM /Online /Cleanup-Image /RestoreHealth', ps: 'DISM /Online /Cleanup-Image /RestoreHealth', desc: 'Завантажує і відновлює пошкоджені компоненти Windows через Windows Update.' },
  { id: 23, shell: 'ps', category: 'Система', task: 'Інформація про систему', cmd: '', ps: 'Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, OsBuildNumber, CsProcessors, @{n="RAM GB";e={[math]::Round($_.CsTotalPhysicalMemory/1GB,1)}}', desc: 'Показує версію Windows, процесор і обсяг RAM одним рядком.' },
  { id: 24, shell: 'both', category: 'Система', task: 'Час роботи системи (uptime)', cmd: 'systeminfo | find "Boot Time"', ps: '(Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime', desc: 'Показує скільки часу система працює без перезавантаження.' },
  { id: 25, shell: 'both', category: 'Система', task: 'Перевірити диск на помилки', cmd: 'chkdsk C: /f /r', ps: 'Repair-Volume -DriveLetter C -Scan', desc: 'Перевіряє диск C: на помилки файлової системи і погані сектори.' },
  { id: 26, shell: 'ps', category: 'Система', task: 'Переглянути Event Log помилки', cmd: '', ps: 'Get-WinEvent -FilterHashtable @{LogName="System"; Level=2} -MaxEvents 10 | Select-Object TimeCreated, ProviderName, Message', desc: 'Останні 10 помилок з системного журналу подій.' },
  { id: 27, shell: 'both', category: 'Система', task: 'Версія Windows', cmd: 'winver', ps: '(Get-ItemProperty "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion").DisplayVersion', desc: 'Winver відкриває графічне вікно. PowerShell повертає версію (наприклад 23H2) для скриптів.' },

  // ── Безпека ─────────────────────────────────────────────────────────────
  { id: 28, shell: 'ps', category: 'Безпека', task: 'Статус Windows Defender', cmd: '', ps: 'Get-MpComputerStatus | Select-Object RealTimeProtectionEnabled, AntivirusEnabled, AntivirusSignatureAge', desc: 'Перевіряє чи активний Defender і скільки днів тому оновлювались сигнатури.' },
  { id: 29, shell: 'ps', category: 'Безпека', task: 'Сканування на віруси', cmd: '', ps: 'Start-MpScan -ScanType QuickScan', desc: 'Запускає швидке сканування Windows Defender. FullScan для повного.' },
  { id: 30, shell: 'ps', category: 'Безпека', task: 'Список адміністраторів ПК', cmd: '', ps: 'Get-LocalGroupMember -Group "Administrators" | Select-Object Name, ObjectClass', desc: 'Показує всі облікові записи з правами адміністратора.' },
  { id: 31, shell: 'ps', category: 'Безпека', task: 'Статус BitLocker', cmd: '', ps: 'Get-BitLockerVolume | Select-Object MountPoint, VolumeStatus, ProtectionStatus, EncryptionPercentage', desc: 'Показує статус шифрування BitLocker для всіх дисків.' },
  { id: 32, shell: 'ps', category: 'Безпека', task: 'Перевірити брандмауер', cmd: '', ps: 'Get-NetFirewallProfile | Select-Object Name, Enabled, DefaultInboundAction', desc: 'Показує статус брандмауера для профілів Domain, Private і Public.' },
  { id: 33, shell: 'both', category: 'Безпека', task: 'Показати автозавантаження', cmd: 'reg query HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', ps: 'Get-ItemProperty "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"', desc: 'Показує програми що запускаються при вході користувача.' },

  // ── Управління дисками ──────────────────────────────────────────────────
  { id: 34, shell: 'ps', category: 'Диски', task: 'Вільне місце на дисках', cmd: '', ps: 'Get-PSDrive -PSProvider FileSystem | Select-Object Name, @{n="Free GB";e={[math]::Round($_.Free/1GB,1)}}, @{n="Used GB";e={[math]::Round($_.Used/1GB,1)}}', desc: 'Показує вільне і зайняте місце на всіх дисках.' },
  { id: 35, shell: 'ps', category: 'Диски', task: 'Стан здоров\'я диску', cmd: '', ps: 'Get-PhysicalDisk | Select-Object FriendlyName, MediaType, HealthStatus, OperationalStatus', desc: 'Показує стан дисків (Healthy/Warning/Unhealthy) і тип (SSD/HDD).' },
  { id: 36, shell: 'both', category: 'Диски', task: 'Перевірка TRIM для SSD', cmd: '', ps: 'fsutil behavior query DisableDeleteNotify', desc: '0 = TRIM увімкнений (норма для SSD). 1 = TRIM вимкнений (потрібно увімкнути).' },
  { id: 37, shell: 'both', category: 'Диски', task: 'Очистити диск', cmd: 'cleanmgr', ps: 'Start-Process cleanmgr -ArgumentList "/sagerun:1"', desc: 'Запускає утиліту очищення диску. Видаляє тимчасові файли, кеш і системні залишки.' },

  // ── Оновлення Windows ───────────────────────────────────────────────────
  { id: 38, shell: 'ps', category: 'Оновлення', task: 'Перезапустити службу оновлень', cmd: '', ps: 'Restart-Service wuauserv, bits -Force', desc: 'Перезапускає Windows Update і BITS. Виправляє зависання оновлень.' },
  { id: 39, shell: 'both', category: 'Оновлення', task: 'Очистити кеш оновлень', cmd: 'net stop wuauserv && rd /s /q C:\\Windows\\SoftwareDistribution && net start wuauserv', ps: 'Stop-Service wuauserv -Force; Remove-Item "C:\\Windows\\SoftwareDistribution\\*" -Recurse -Force -EA 0; Start-Service wuauserv', desc: 'Очищає завантажені файли оновлень. Виправляє помилки при встановленні оновлень.' },
  { id: 40, shell: 'ps', category: 'Оновлення', task: 'Список встановлених оновлень', cmd: '', ps: 'Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 10 HotFixID, Description, InstalledOn', desc: 'Показує 10 останніх встановлених оновлень з датою.' },
]

const CATEGORIES = ['Всі', ...new Set(COMMANDS.map(c => c.category))]
const SHELLS = [
  { value: 'all', label: 'PowerShell і CMD' },
  { value: 'ps', label: 'PowerShell' },
  { value: 'cmd', label: 'CMD' },
]

export default function PowershellCommands() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Всі')
  const [shell, setShell] = useState('all')
  const [copied, setCopied] = useState(null)

  const filtered = useMemo(() => {
    return COMMANDS.filter(c => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        c.task.toLowerCase().includes(q) ||
        c.cmd.toLowerCase().includes(q) ||
        c.ps.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q)
      const matchCat = category === 'Всі' || c.category === category
      const matchShell = shell === 'all' ||
        (shell === 'ps' && c.ps) ||
        (shell === 'cmd' && c.cmd)
      return matchSearch && matchCat && matchShell
    })
  }, [search, category, shell])

  const copy = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 1500)
    })
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PowerShell і CMD команди Windows — довідник',
    description: 'Пошук по 40+ PowerShell і CMD командах Windows. Знайди команду за задачею — мережа, файли, безпека, система, диски.',
    url: `${SITE}/tools/powershell-commands`,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Windows',
    inLanguage: 'uk',
    publisher: { '@type': 'Organization', name: siteConfig.name, url: SITE },
  }

  return (
    <Layout
      title="PowerShell і CMD команди Windows — довідник із пошуком"
      description="Пошук по 40+ PowerShell і CMD командах. Знайди команду за задачею: мережа, файли, процеси, безпека, диски, оновлення. Копіюй одним кліком."
      canonical={`${SITE}/tools/powershell-commands`}
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
            <span style={{ ...s.bcLink, color: '#64748b' }}>PowerShell і CMD довідник</span>
          </nav>

          {/* Header */}
          <div style={s.header}>
            <h1 style={s.title}>⚡ PowerShell і CMD довідник</h1>
            <p style={s.subtitle}>
              Шукай команду за задачею — не за назвою
            </p>
          </div>

          {/* Search + filters */}
          <div style={s.controls}>
            <input
              style={s.search}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Наприклад: "очистити dns", "вільне місце", "відкриті порти"...'
              autoFocus
            />
            <div style={s.filterRow}>
              <div style={s.filterGroup}>
                {CATEGORIES.map(cat => (
                  <button key={cat}
                    style={category === cat ? s.filterActive : s.filterBtn}
                    onClick={() => setCategory(cat)}>
                    {cat}
                  </button>
                ))}
              </div>
              <div style={s.filterGroup}>
                {SHELLS.map(sh => (
                  <button key={sh.value}
                    style={shell === sh.value ? s.filterActive : s.filterBtn}
                    onClick={() => setShell(sh.value)}>
                    {sh.label}
                  </button>
                ))}
              </div>
            </div>
            <p style={s.count}>{filtered.length} команд</p>
          </div>

          {/* Commands list */}
          <div style={s.list}>
            {filtered.length === 0 && (
              <div style={s.empty}>
                <p style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                  Нічого не знайдено. Спробуй інший запит.
                </p>
              </div>
            )}

            {filtered.map(cmd => (
              <div key={cmd.id} style={s.card}>
                <div style={s.cardHeader}>
                  <div style={s.taskRow}>
                    <span style={s.catTag}>{cmd.category}</span>
                    <h3 style={s.task}>{cmd.task}</h3>
                  </div>
                  <p style={s.desc}>{cmd.desc}</p>
                </div>

                <div style={s.codeBlocks}>
                  {cmd.ps && (shell === 'all' || shell === 'ps') && (
                    <div style={s.codeBlock}>
                      <div style={s.codeHeader}>
                        <span style={s.shellTag}>PowerShell</span>
                        <button
                          style={copied === `ps-${cmd.id}` ? s.copyDone : s.copyBtn}
                          onClick={() => copy(cmd.ps, `ps-${cmd.id}`)}>
                          {copied === `ps-${cmd.id}` ? '✓ Скопійовано' : 'Копіювати'}
                        </button>
                      </div>
                      <pre style={s.code}>{cmd.ps}</pre>
                    </div>
                  )}
                  {cmd.cmd && (shell === 'all' || shell === 'cmd') && (
                    <div style={{ ...s.codeBlock, ...s.cmdBlock }}>
                      <div style={s.codeHeader}>
                        <span style={s.cmdTag}>CMD</span>
                        <button
                          style={copied === `cmd-${cmd.id}` ? s.copyDone : s.copyBtn}
                          onClick={() => copy(cmd.cmd, `cmd-${cmd.id}`)}>
                          {copied === `cmd-${cmd.id}` ? '✓ Скопійовано' : 'Копіювати'}
                        </button>
                      </div>
                      <pre style={s.code}>{cmd.cmd}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* SEO */}
          <div style={s.seoBlock}>
            <h2 style={s.seoH2}>Про довідник</h2>
            <p style={s.seoP}>
              PowerShell і CMD — основні інструменти адміністрування Windows. Цей довідник містить
              найпоширеніші команди згруповані за задачами: мережа, файли, процеси, безпека, диски, оновлення.
            </p>
            <p style={s.seoP}>
              Всі команди перевірені на Windows 10 і Windows 11. PowerShell команди потребують
              версії 5.1 або новішої (вбудована в Windows 10/11).
            </p>
            <p style={s.seoP}>
              Для глибокої перевірки безпеки ПК — скористайся{' '}
              <Link href="/tools/auditshield" style={s.link}>AuditShield</Link>,
              а для розшифрування кодів помилок —{' '}
              <Link href="/tools/windows-error-decoder" style={s.link}>Декодером помилок Windows</Link>.
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

  controls: {
    background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem',
  },
  search: {
    width: '100%', padding: '12px 16px', marginBottom: '12px',
    fontFamily: 'var(--font-mono)', fontSize: '0.9rem',
    border: '2px solid #e2e8f0', borderRadius: '8px',
    outline: 'none', background: '#fff', color: '#0f172a',
    boxSizing: 'border-box',
  },
  filterRow: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' },
  filterGroup: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  filterBtn: {
    fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#64748b',
    background: '#fff', border: '1px solid #e2e8f0',
    padding: '4px 12px', borderRadius: '20px', cursor: 'pointer',
  },
  filterActive: {
    fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#fff',
    background: '#2563eb', border: '1px solid #2563eb',
    padding: '4px 12px', borderRadius: '20px', cursor: 'pointer',
  },
  count: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#94a3b8', margin: 0 },

  list: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '2.5rem' },
  empty: { padding: '3rem', textAlign: 'center' },

  card: {
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: '12px', overflow: 'hidden',
  },
  cardHeader: { padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9' },
  taskRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' },
  catTag: {
    fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700,
    color: '#2563eb', background: '#eff6ff', padding: '2px 8px',
    borderRadius: '6px', whiteSpace: 'nowrap',
  },
  task: { fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 },
  desc: { fontSize: '0.825rem', color: '#64748b', margin: 0, lineHeight: 1.6 },

  codeBlocks: { display: 'flex', flexDirection: 'column' },
  codeBlock: { borderTop: '1px solid #f1f5f9' },
  cmdBlock: { background: '#fafafa' },
  codeHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '6px 1.25rem',
  },
  shellTag: {
    fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700,
    color: '#2563eb', letterSpacing: '0.5px',
  },
  cmdTag: {
    fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700,
    color: '#64748b', letterSpacing: '0.5px',
  },
  copyBtn: {
    fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#94a3b8',
    background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 0',
  },
  copyDone: {
    fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#16a34a',
    background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 0',
    fontWeight: 700,
  },
  code: {
    fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#0f172a',
    background: 'transparent', margin: 0,
    padding: '8px 1.25rem 12px',
    whiteSpace: 'pre-wrap', wordBreak: 'break-all',
    lineHeight: 1.6,
  },

  seoBlock: { padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', marginBottom: '2rem' },
  seoH2: { fontFamily: "'Unbounded', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' },
  seoP: { fontSize: '0.875rem', color: '#475569', lineHeight: 1.8, marginBottom: '8px' },
  link: { color: '#2563eb', fontWeight: 500, textDecoration: 'none' },
  back: { paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' },
  backLink: { fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#2563eb', fontWeight: 500, textDecoration: 'none' },
}
