import { useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import Link from 'next/link'
import siteConfig from '../../site.config'

const SITE = siteConfig.url

const COMMANDS = [
  // ── Мережа ──────────────────────────────────────────────────────────────
  { id: 1, shell: 'both', category: 'Network', task: 'Test host connectivity', cmd: 'ping google.com', ps: 'Test-NetConnection -ComputerName google.com', desc: 'Checks if a host is reachable over the network. Shows latency and packet loss.' },
  { id: 2, shell: 'both', category: 'Network', task: 'Show IP address', cmd: 'ipconfig', ps: 'Get-NetIPAddress | Where-Object {$_.AddressFamily -eq "IPv4"}', desc: 'Displays IP address, subnet mask and gateway for all network adapters.' },
  { id: 3, shell: 'both', category: 'Network', task: 'Flush DNS cache', cmd: 'ipconfig /flushdns', ps: 'Clear-DnsClientCache', desc: 'Clears the DNS cache. Helps when sites fail to load after a DNS change.' },
  { id: 4, shell: 'ps', category: 'Network', task: 'Show open listening ports', cmd: '', ps: 'Get-NetTCPConnection -State Listen | Select-Object LocalPort, @{n="Process";e={(Get-Process -Id $_.OwningProcess -EA 0).Name}} | Sort-Object LocalPort', desc: 'Lists all ports currently listening for connections with process names.' },
  { id: 5, shell: 'both', category: 'Network', task: 'Show active connections', cmd: 'netstat -ano', ps: 'Get-NetTCPConnection -State Established | Select-Object LocalPort, RemoteAddress, RemotePort', desc: 'Shows all active TCP connections with remote addresses and ports.' },
  { id: 6, shell: 'both', category: 'Network', task: 'Reset network settings', cmd: 'netsh winsock reset && netsh int ip reset', ps: 'netsh winsock reset; netsh int ip reset', desc: 'Resets Winsock and TCP/IP stack. Fixes most network connectivity issues.' },
  { id: 7, shell: 'ps', category: 'Network', task: 'Change DNS server', cmd: '', ps: 'Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses ("1.1.1.1","8.8.8.8")', desc: 'Sets Cloudflare and Google DNS servers for the Wi-Fi adapter.' },
  { id: 8, shell: 'both', category: 'Network', task: 'Trace network route', cmd: 'tracert google.com', ps: 'Test-NetConnection -ComputerName google.com -TraceRoute', desc: 'Shows the packet route to a host and latency at each hop.' },

  // ── Файли і папки ───────────────────────────────────────────────────────
  { id: 9, shell: 'both', category: 'Files', task: 'List folder contents', cmd: 'dir', ps: 'Get-ChildItem', desc: 'Lists files and folders in the current directory.' },
  { id: 10, shell: 'both', category: 'Files', task: 'Change directory', cmd: 'cd C:\\Users\\Name', ps: 'Set-Location C:\\Users\\Name', desc: 'Changes the current directory. cd .. goes up one level.' },
  { id: 11, shell: 'both', category: 'Files', task: 'Copy file', cmd: 'copy file.txt C:\\dest\\', ps: 'Copy-Item file.txt -Destination C:\\dest\\', desc: 'Copies a file or folder. For folders with contents add /S (cmd) or -Recurse (PS).' },
  { id: 12, shell: 'both', category: 'Files', task: 'Delete file', cmd: 'del file.txt', ps: 'Remove-Item file.txt -Force', desc: 'Deletes a file. -Force removes read-only files. For folders: rd /s (cmd) or Remove-Item -Recurse (PS).' },
  { id: 13, shell: 'ps', category: 'Files', task: 'Find large files', cmd: '', ps: 'Get-ChildItem C:\\ -Recurse -EA 0 | Where-Object {$_.Length -gt 500MB} | Sort-Object Length -Descending | Select-Object FullName, @{n="GB";e={[math]::Round($_.Length/1GB,1)}}', desc: 'Finds files larger than 500 MB on the C: drive.' },
  { id: 14, shell: 'ps', category: 'Files', task: 'Get folder size', cmd: '', ps: '"{0:N1} GB" -f ((Get-ChildItem "C:\\Folder" -Recurse -EA 0 | Measure-Object Length -Sum).Sum / 1GB)', desc: 'Calculates the total size of a folder including all subfolders.' },
  { id: 15, shell: 'both', category: 'Files', task: 'Пошук файлів за ім\'ям', cmd: 'dir /s /b *keyword*', ps: 'Get-ChildItem C:\\ -Recurse -Filter "*keyword*" -EA 0', desc: 'Recursively searches for files matching a name pattern.' },

  // ── Процеси і служби ────────────────────────────────────────────────────
  { id: 16, shell: 'both', category: 'Processes', task: 'List all processes', cmd: 'tasklist', ps: 'Get-Process | Sort-Object CPU -Descending | Select-Object -First 20 Name, CPU, Id', desc: 'Shows running processes. PowerShell sorts by CPU usage.' },
  { id: 17, shell: 'both', category: 'Processes', task: 'Kill process by name', cmd: 'taskkill /f /im notepad.exe', ps: 'Stop-Process -Name notepad -Force', desc: 'Forcefully terminates a process by its executable name.' },
  { id: 18, shell: 'both', category: 'Processes', task: 'List Windows services', cmd: 'sc query', ps: 'Get-Service | Sort-Object Status -Descending | Format-Table Name, Status, StartType', desc: 'Shows all Windows services with their status and startup type.' },
  { id: 19, shell: 'both', category: 'Processes', task: 'Start / stop a service', cmd: 'net start/stop "ServiceName"', ps: 'Start-Service "ServiceName" / Stop-Service "ServiceName" -Force', desc: 'Starts or stops a Windows service by name.' },
  { id: 20, shell: 'ps', category: 'Processes', task: 'Find which process uses a port', cmd: '', ps: 'Get-NetTCPConnection -LocalPort 3389 | Select-Object @{n="Process";e={(Get-Process -Id $_.OwningProcess).Name}}, State', desc: 'Finds the process listening on the specified port (replace 3389).' },

  // ── Система і діагностика ───────────────────────────────────────────────
  { id: 21, shell: 'both', category: 'System', task: 'Check system file integrity', cmd: 'sfc /scannow', ps: 'sfc /scannow', desc: 'Scans and repairs corrupted Windows system files. Requires Administrator rights.' },
  { id: 22, shell: 'both', category: 'System', task: 'Repair Windows image (DISM)', cmd: 'DISM /Online /Cleanup-Image /RestoreHealth', ps: 'DISM /Online /Cleanup-Image /RestoreHealth', desc: 'Downloads and repairs corrupted Windows components via Windows Update.' },
  { id: 23, shell: 'ps', category: 'System', task: 'System information', cmd: '', ps: 'Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, OsBuildNumber, CsProcessors, @{n="RAM GB";e={[math]::Round($_.CsTotalPhysicalMemory/1GB,1)}}', desc: 'Shows Windows version, processor and RAM in one line.' },
  { id: 24, shell: 'both', category: 'System', task: 'System uptime', cmd: 'systeminfo | find "Boot Time"', ps: '(Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime', desc: 'Shows how long the system has been running since last reboot.' },
  { id: 25, shell: 'both', category: 'System', task: 'Check disk for errors', cmd: 'chkdsk C: /f /r', ps: 'Repair-Volume -DriveLetter C -Scan', desc: 'Checks drive C: for file system errors and bad sectors.' },
  { id: 26, shell: 'ps', category: 'System', task: 'View Event Log errors', cmd: '', ps: 'Get-WinEvent -FilterHashtable @{LogName="System"; Level=2} -MaxEvents 10 | Select-Object TimeCreated, ProviderName, Message', desc: 'Shows the last 10 errors from the System Event Log.' },
  { id: 27, shell: 'both', category: 'System', task: 'Windows version', cmd: 'winver', ps: '(Get-ItemProperty "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion").DisplayVersion', desc: 'winver opens a GUI window. PowerShell returns the version string (e.g. 23H2) for scripts.' },

  // ── Безпека ─────────────────────────────────────────────────────────────
  { id: 28, shell: 'ps', category: 'Security', task: 'Windows Defender status', cmd: '', ps: 'Get-MpComputerStatus | Select-Object RealTimeProtectionEnabled, AntivirusEnabled, AntivirusSignatureAge', desc: 'Checks if Defender is active and how many days ago signatures were last updated.' },
  { id: 29, shell: 'ps', category: 'Security', task: 'Run antivirus scan', cmd: '', ps: 'Start-MpScan -ScanType QuickScan', desc: 'Runs a Windows Defender quick scan. Use FullScan for a complete scan.' },
  { id: 30, shell: 'ps', category: 'Security', task: 'List PC administrators', cmd: '', ps: 'Get-LocalGroupMember -Group "Administrators" | Select-Object Name, ObjectClass', desc: 'Shows all accounts with Administrator privileges on this PC.' },
  { id: 31, shell: 'ps', category: 'Security', task: 'BitLocker encryption status', cmd: '', ps: 'Get-BitLockerVolume | Select-Object MountPoint, VolumeStatus, ProtectionStatus, EncryptionPercentage', desc: 'Shows BitLocker encryption status for all drives.' },
  { id: 32, shell: 'ps', category: 'Security', task: 'Check firewall status', cmd: '', ps: 'Get-NetFirewallProfile | Select-Object Name, Enabled, DefaultInboundAction', desc: 'Shows firewall status for Domain, Private and Public profiles.' },
  { id: 33, shell: 'both', category: 'Security', task: 'Show startup programs', cmd: 'reg query HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', ps: 'Get-ItemProperty "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"', desc: 'Shows programs that launch when a user logs in.' },

  // ── Управління дисками ──────────────────────────────────────────────────
  { id: 34, shell: 'ps', category: 'Disks', task: 'Free space on drives', cmd: '', ps: 'Get-PSDrive -PSProvider FileSystem | Select-Object Name, @{n="Free GB";e={[math]::Round($_.Free/1GB,1)}}, @{n="Used GB";e={[math]::Round($_.Used/1GB,1)}}', desc: 'Shows free and used space on all drives.' },
  { id: 35, shell: 'ps', category: 'Disks', task: 'Drive health status', cmd: '', ps: 'Get-PhysicalDisk | Select-Object FriendlyName, MediaType, HealthStatus, OperationalStatus', desc: 'Shows drive health (Healthy/Warning/Unhealthy) and type (SSD/HDD).' },
  { id: 36, shell: 'both', category: 'Disks', task: 'Check TRIM for SSD', cmd: '', ps: 'fsutil behavior query DisableDeleteNotify', desc: '0 = TRIM enabled (normal for SSD). 1 = TRIM disabled (needs to be enabled).' },
  { id: 37, shell: 'both', category: 'Disks', task: 'Disk cleanup', cmd: 'cleanmgr', ps: 'Start-Process cleanmgr -ArgumentList "/sagerun:1"', desc: 'Launches Disk Cleanup utility. Removes temporary files, cache and system leftovers.' },

  // ── Оновлення Windows ───────────────────────────────────────────────────
  { id: 38, shell: 'ps', category: 'Updates', task: 'Restart Windows Update service', cmd: '', ps: 'Restart-Service wuauserv, bits -Force', desc: 'Restarts Windows Update and BITS services. Fixes stuck update downloads.' },
  { id: 39, shell: 'both', category: 'Updates', task: 'Clear Windows Update cache', cmd: 'net stop wuauserv && rd /s /q C:\\Windows\\SoftwareDistribution && net start wuauserv', ps: 'Stop-Service wuauserv -Force; Remove-Item "C:\\Windows\\SoftwareDistribution\\*" -Recurse -Force -EA 0; Start-Service wuauserv', desc: 'Clears downloaded update files. Fixes errors during update installation.' },
  { id: 40, shell: 'ps', category: 'Updates', task: 'List installed updates', cmd: '', ps: 'Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 10 HotFixID, Description, InstalledOn', desc: 'Shows the 10 most recently installed updates with dates.' },
]

const CATEGORIES = ['All', ...new Set(COMMANDS.map(c => c.category))]
const SHELLS = [
  { value: 'all', label_uk: 'PowerShell і CMD', label_en: 'All shells' },
  { value: 'ps',  label_uk: 'PowerShell',        label_en: 'PowerShell' },
  { value: 'cmd', label_uk: 'CMD',               label_en: 'CMD' },
]

export default function PowershellCommands() {
  const { locale } = useRouter()
  const isEn = locale === 'en'

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
      const matchCat = category === 'All' || c.category === category
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

  const canonicalPath = isEn
    ? `${SITE}/en/tools/powershell-commands`
    : `${SITE}/tools/powershell-commands`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: isEn
      ? 'PowerShell and CMD Commands Reference for Windows'
      : 'PowerShell і CMD команди Windows — довідник',
    description: isEn
      ? 'Search 40+ PowerShell and CMD commands by task. Find the right command for networking, files, security, system, disks and updates. Copy with one click.'
      : 'Пошук по 40+ PowerShell і CMD командах Windows. Знайди команду за задачею — мережа, файли, безпека, система, диски.',
    url: canonicalPath,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Windows',
    inLanguage: isEn ? 'en' : 'uk',
    publisher: { '@type': 'Organization', name: siteConfig.name, url: SITE },
  }

  return (
    <Layout
      title={isEn
        ? 'PowerShell and CMD Commands Reference — Search by Task'
        : 'PowerShell і CMD команди Windows — довідник із пошуком'}
      description={isEn
        ? 'Search 40+ PowerShell and CMD commands by task. Network, files, processes, security, disks, updates. Copy with one click. Free.'
        : 'Пошук по 40+ PowerShell і CMD командах. Знайди команду за задачею: мережа, файли, процеси, безпека, диски, оновлення. Копіюй одним кліком.'}
      canonical={canonicalPath}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div style={{ padding: '2rem 0 4rem' }}>
        <div className="container">

          {/* Breadcrumb */}
          <nav style={s.bc}>
            <Link href={isEn ? '/en' : '/'} style={s.bcLink}>{isEn ? 'Home' : 'Головна'}</Link>
            <span style={s.bcSep}>/</span>
            <Link href={isEn ? '/en/tools' : '/tools'} style={s.bcLink}>{isEn ? 'Tools' : 'Інструменти'}</Link>
            <span style={s.bcSep}>/</span>
            <span style={{ ...s.bcLink, color: '#64748b' }}>{isEn ? 'PowerShell & CMD Reference' : 'PowerShell і CMD довідник'}</span>
          </nav>

          {/* Header */}
          <div style={s.header}>
            <h1 style={s.title}>⚡ {isEn ? 'PowerShell & CMD Reference' : 'PowerShell і CMD довідник'}</h1>
            <p style={s.subtitle}>
              {isEn ? 'Search by task — not by command name' : 'Шукай команду за задачею — не за назвою'}
            </p>
          </div>

          {/* Search + filters */}
          <div style={s.controls}>
            <input
              style={s.search}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isEn ? 'e.g. "flush dns", "free space", "open ports"...' : 'Наприклад: "очистити dns", "вільне місце", "відкриті порти"...'}
              autoFocus
            />
            <div style={s.filterRow}>
              <div style={s.filterGroup}>
                {CATEGORIES.map(cat => (
                  <button key={cat}
                    style={category === cat ? s.filterActive : s.filterBtn}
                    onClick={() => setCategory(cat)}>
                    {cat === 'All' ? (isEn ? 'All' : 'Всі') : cat}
                  </button>
                ))}
              </div>
              <div style={s.filterGroup}>
                {SHELLS.map(sh => (
                  <button key={sh.value}
                    style={shell === sh.value ? s.filterActive : s.filterBtn}
                    onClick={() => setShell(sh.value)}>
                    {isEn ? sh.label_en : sh.label_uk}
                  </button>
                ))}
              </div>
            </div>
            <p style={s.count}>{filtered.length} {isEn ? 'commands' : 'команд'}</p>
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
            <Link href={isEn ? '/tools' : '/tools'} style={s.backLink}>
              {isEn ? '← All tools' : '← Всі інструменти'}
            </Link>
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
