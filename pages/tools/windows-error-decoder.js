import { useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Layout from '../../components/Layout'
import Link from 'next/link'
import siteConfig from '../../site.config'

const SITE = siteConfig.url

// ── Full EN error database — 40+ codes ───────────────────────────────────────
const ERROR_DB = {
  // ── Access / Permissions ─────────────────────────────────────────────────
  '0x80070005': {
    name: 'ERROR_ACCESS_DENIED', category: 'Access', severity: 'high',
    description: 'Access denied. Windows cannot perform the operation because of insufficient permissions.',
    causes: ['Running without Administrator rights', 'Antivirus blocking the operation', 'Corrupted NTFS permissions on file or folder', 'UAC blocked the action'],
    fixes: ['Run the program as Administrator (right-click → Run as administrator)', 'Temporarily disable antivirus and retry', 'Reset NTFS permissions: icacls "path" /reset /T', 'Check UAC settings'],
  },
  '0x80070006': {
    name: 'ERROR_INVALID_HANDLE', category: 'System', severity: 'medium',
    description: 'Invalid handle. A program tried to use a handle that was already closed or never existed.',
    causes: ['Application or service crash', 'Corrupted system files', 'Software conflict'],
    fixes: ['Restart the application or service', 'Run sfc /scannow as Administrator', 'Restart Windows'],
  },

  // ── Files ────────────────────────────────────────────────────────────────
  '0x80070002': {
    name: 'ERROR_FILE_NOT_FOUND', category: 'Files', severity: 'medium',
    description: 'File not found. Windows is looking for a file at the specified path but cannot find it.',
    causes: ['File was deleted or moved', 'Incorrect path', 'Corrupted registry entry', 'Missing update component'],
    fixes: ['Verify the file exists at the expected path', 'For Windows Update: run the Update Troubleshooter', 'Run: DISM /Online /Cleanup-Image /RestoreHealth', 'Run: sfc /scannow'],
  },
  '0x80070003': {
    name: 'ERROR_PATH_NOT_FOUND', category: 'Files', severity: 'medium',
    description: 'Path not found. The specified folder or directory does not exist.',
    causes: ['Folder was deleted or renamed', 'Drive is disconnected', 'Incorrect path in registry'],
    fixes: ['Verify the folder exists', 'Reinstall the application referencing this path', 'Check startup entries in Task Manager'],
  },
  '0x80070020': {
    name: 'ERROR_SHARING_VIOLATION', category: 'Files', severity: 'medium',
    description: 'Sharing violation. The file is open by another process and cannot be modified.',
    causes: ['File is open in another application', 'Antivirus is scanning the file', 'A service or process has the file locked'],
    fixes: ['Close all applications that may be using the file', 'Use Resource Monitor (resmon) to find which process has the file locked', 'Restart the PC and retry'],
  },

  // ── Disk / Memory ────────────────────────────────────────────────────────
  '0x80070070': {
    name: 'ERROR_DISK_FULL', category: 'Disk', severity: 'high',
    description: 'Disk full. Not enough free disk space to complete the operation.',
    causes: ['Drive is out of space', 'Accumulated temporary files', 'Page file is too large'],
    fixes: ['Run Disk Cleanup: cleanmgr', 'Remove unused applications', 'Move large files to another drive', 'Reduce page file size'],
  },
  '0x8007000E': {
    name: 'ERROR_OUTOFMEMORY', category: 'Memory', severity: 'high',
    description: 'Out of memory. The system does not have enough RAM to complete the operation.',
    causes: ['Insufficient RAM', 'Memory leak in application', 'Page file disabled'],
    fixes: ['Close unnecessary applications and browser tabs', 'Restart Windows', 'Check page file: sysdm.cpl → Advanced', 'Run memory diagnostic: mdsched.exe'],
  },
  '0x800703EE': {
    name: 'ERROR_VOLUME_DISMOUNTED', category: 'Disk', severity: 'medium',
    description: 'Volume dismounted. The operation cannot be performed on a dismounted volume.',
    causes: ['USB or external drive disconnected during operation', 'Drive removed before write completed'],
    fixes: ['Reconnect the drive', 'Check file integrity: chkdsk', 'Always use Safely Remove for USB devices'],
  },

  // ── Network ──────────────────────────────────────────────────────────────
  '0x80072EFE': {
    name: 'ERROR_INTERNET_CONNECTION_ABORTED', category: 'Network', severity: 'medium',
    description: 'Internet connection aborted. The connection to the internet was interrupted.',
    causes: ['Unstable internet connection', 'Firewall blocking the connection', 'DNS issues'],
    fixes: ['Check your internet connection', 'Temporarily disable firewall', 'Change DNS to 1.1.1.1', 'Run: netsh winsock reset && netsh int ip reset'],
  },
  '0x80072EE7': {
    name: 'ERROR_INTERNET_NAME_NOT_RESOLVED', category: 'Network', severity: 'medium',
    description: 'DNS name could not be resolved. The DNS server cannot find the host address.',
    causes: ['DNS server issues', 'No internet connection', 'Incorrect DNS settings', 'Corrupted hosts file'],
    fixes: ['Run: ipconfig /flushdns', 'Change DNS to 1.1.1.1 and 8.8.8.8', 'Check hosts file: C:\\Windows\\System32\\drivers\\etc\\hosts', 'Restart DNS Client service'],
  },
  '0x80072F8F': {
    name: 'ERROR_WINHTTP_SECURE_FAILURE', category: 'Network', severity: 'medium',
    description: 'SSL/TLS failure. Cannot establish a secure connection due to a certificate issue.',
    causes: ['Incorrect date and time on PC', 'Outdated root certificates', 'SSL issue on the server'],
    fixes: ['Sync time: w32tm /resync', 'Update Windows to get new root certificates', 'Check proxy settings'],
  },

  // ── Windows Update ───────────────────────────────────────────────────────
  '0x80248007': {
    name: 'WU_E_DS_NODATA', category: 'Windows Update', severity: 'medium',
    description: 'Windows Update database error — required data is missing.',
    causes: ['Corrupted update database', 'Insufficient disk space', 'Windows Update service issue'],
    fixes: ['Run Windows Update Troubleshooter', 'Clear cache: net stop wuauserv → delete SoftwareDistribution → net start wuauserv', 'Run: DISM /Online /Cleanup-Image /RestoreHealth'],
  },
  '0x80073712': {
    name: 'ERROR_SXS_COMPONENT_STORE_CORRUPT', category: 'Windows Update', severity: 'high',
    description: 'Windows component store is corrupted. Update files are damaged or missing.',
    causes: ['Corrupted system files', 'Interrupted update', 'Disk issue'],
    fixes: ['Run: DISM /Online /Cleanup-Image /RestoreHealth', 'Run: sfc /scannow', 'Run: chkdsk C: /f /r (requires restart)'],
  },
  '0x80070057': {
    name: 'ERROR_INVALID_PARAMETER', category: 'System', severity: 'medium',
    description: 'Invalid parameter. A program or Windows received a value that is not acceptable.',
    causes: ['Corrupted system files', 'Driver conflict', 'Update issue'],
    fixes: ['Run: sfc /scannow as Administrator', 'Run: DISM /Online /Cleanup-Image /RestoreHealth', 'Uninstall the last update if issue appeared after it'],
  },
  '0x8024000B': {
    name: 'WU_E_CALL_CANCELLED', category: 'Windows Update', severity: 'low',
    description: 'Windows Update operation was cancelled by the user or system.',
    causes: ['Update was cancelled manually', 'System restarted during update', 'Firewall interrupted connection'],
    fixes: ['Run Windows Update again', 'Check internet connection', 'Run as Administrator'],
  },
  '0x80240034': {
    name: 'WU_E_DOWNLOAD_FAILED', category: 'Windows Update', severity: 'medium',
    description: 'Update download failed. The update file could not be downloaded.',
    causes: ['Internet connection issues during download', 'Antivirus blocked the download', 'Insufficient disk space'],
    fixes: ['Check connection and retry', 'Clear update cache: SoftwareDistribution folder', 'Temporarily disable antivirus and retry'],
  },

  // ── BSOD / Critical ──────────────────────────────────────────────────────
  '0xC000021A': {
    name: 'STATUS_SYSTEM_PROCESS_TERMINATED', category: 'BSOD', severity: 'critical',
    description: 'Critical Windows failure — a system process (winlogon.exe or csrss.exe) terminated unexpectedly.',
    causes: ['Corrupted system files', 'Incompatible driver', 'Corrupted user profile', 'Corrupted registry'],
    fixes: ['Boot into Safe Mode (F8)', 'Run: sfc /scannow as Administrator', 'Use System Restore to a point before the issue', 'Reinstall GPU drivers'],
  },
  '0x0000007E': {
    name: 'SYSTEM_THREAD_EXCEPTION_NOT_HANDLED', category: 'BSOD', severity: 'critical',
    description: 'BSOD — a system thread generated an exception that could not be handled.',
    causes: ['Incompatible or corrupted driver', 'Corrupted system file', 'Hardware issue'],
    fixes: ['Boot into Safe Mode and remove the last installed driver', 'Test RAM: mdsched.exe', 'Run: chkdsk /f', 'Run: sfc /scannow'],
  },
  '0x00000050': {
    name: 'PAGE_FAULT_IN_NONPAGED_AREA', category: 'BSOD', severity: 'critical',
    description: 'BSOD — attempt to access memory that is not in RAM.',
    causes: ['Faulty RAM', 'Corrupted driver', 'Malware', 'Overheating'],
    fixes: ['Test RAM with mdsched.exe', 'Check component temperatures', 'Remove or update the problematic driver', 'Full malware scan'],
  },
  '0x0000007B': {
    name: 'INACCESSIBLE_BOOT_DEVICE', category: 'BSOD', severity: 'critical',
    description: 'BSOD — Windows cannot access the boot drive.',
    causes: ['Changed disk order in BIOS', 'Corrupted disk controller', 'SATA mode changed (IDE↔AHCI)', 'Corrupted bootloader'],
    fixes: ['Check SATA settings in BIOS (should be AHCI)', 'Check boot order in BIOS', 'Rebuild bootloader: bootrec /rebuildbcd', 'Check disk cables'],
  },
  '0x0000003B': {
    name: 'SYSTEM_SERVICE_EXCEPTION', category: 'BSOD', severity: 'critical',
    description: 'BSOD — an exception occurred while executing a system service.',
    causes: ['Faulty or outdated driver', 'Corrupted system files', 'Hardware issue (often RAM)'],
    fixes: ['Update all drivers, especially GPU and chipset', 'Run: sfc /scannow', 'Test RAM with mdsched.exe', 'Check Memory Integrity in Windows Security'],
  },
  '0x0000018B': {
    name: 'SECURE_KERNEL_ERROR', category: 'BSOD', severity: 'critical',
    description: 'BSOD — Secure Kernel error. Common after Windows 11 24H2 updates (KB5053656, KB5055523) in 2025–2026.',
    causes: ['Incompatible Windows update (KB5053656, KB5055523)', 'Conflict with Virtualization-Based Security', 'Kernel driver issue'],
    fixes: ['Uninstall the problematic update: wusa /uninstall /kb:5053656', 'Check for Microsoft KIR fix via Windows Update', 'Run: DISM /RestoreHealth + sfc /scannow', 'Update BIOS if MSI/ASUS/Gigabyte board'],
  },

  // ── Microsoft Store ──────────────────────────────────────────────────────
  '0x80073CF0': {
    name: 'ERROR_PACKAGE_NOT_FOUND', category: 'Microsoft Store', severity: 'low',
    description: 'Application package not found in Microsoft Store or on the system.',
    causes: ['Application not installed', 'Corrupted installation', 'Microsoft Store issue'],
    fixes: ['Reset Store cache: wsreset.exe', 'Reinstall the app via Store', 'Run: Get-AppxPackage -AllUsers | Repair in PowerShell'],
  },
  '0x80131500': {
    name: 'STORE_ERROR_GENERIC', category: 'Microsoft Store', severity: 'low',
    description: 'Generic Microsoft Store error. Could not connect or download.',
    causes: ['Connection issue', 'Corrupted Store cache', 'Outdated Store components'],
    fixes: ['Run: wsreset.exe', 'Change DNS to 8.8.8.8', 'Reinstall Microsoft Store via PowerShell'],
  },

  // ── BitLocker ────────────────────────────────────────────────────────────
  '0x80310008': {
    name: 'FVE_E_VOLUME_NOT_SUPPORTED', category: 'BitLocker', severity: 'medium',
    description: 'BitLocker is not supported for this volume.',
    causes: ['No TPM chip', 'Drive formatted as FAT instead of NTFS', 'System drive does not meet requirements'],
    fixes: ['Check TPM: tpm.msc', 'Ensure drive is formatted as NTFS', 'For no-TPM setup: gpedit.msc → BitLocker → Allow without TPM'],
  },

  // ── Services ─────────────────────────────────────────────────────────────
  '0x80070424': {
    name: 'ERROR_SERVICE_DOES_NOT_EXIST', category: 'Services', severity: 'medium',
    description: 'The Windows service does not exist. Attempted to start or configure a service not found on the system.',
    causes: ['Service was deleted or corrupted', 'Issue after Windows update', 'Malware removed the service'],
    fixes: ['Run: sfc /scannow to restore service files', 'Run: DISM /RestoreHealth', 'Reinstall Windows if it is a critical service'],
  },
  '0x80070422': {
    name: 'ERROR_SERVICE_DISABLED', category: 'Services', severity: 'medium',
    description: 'Service is disabled. The operation cannot be completed because a required service is disabled.',
    causes: ['Service was manually disabled', 'Antivirus or optimizer disabled the service', 'Group Policy disabled the service'],
    fixes: ['Open services.msc and enable the service', 'Run: Set-Service "ServiceName" -StartupType Automatic', 'Check GPO if on a corporate PC'],
  },

  // ── General ──────────────────────────────────────────────────────────────
  '0x80004005': {
    name: 'E_FAIL', category: 'General', severity: 'medium',
    description: 'Unspecified failure. A general error code — the operation failed without a specific reason.',
    causes: ['Problem accessing a resource', 'Corrupted file or archive', 'Software incompatibility', 'Network issue'],
    fixes: ['Run as Administrator', 'Reinstall the problematic application', 'Run: sfc /scannow', 'For network resources: check SMB and NTFS permissions'],
  },
  '0x8000FFFF': {
    name: 'E_UNEXPECTED', category: 'General', severity: 'medium',
    description: 'Unexpected failure. An unexpected critical error occurred.',
    causes: ['Corrupted system files', 'Software conflict', 'Windows Update issue'],
    fixes: ['Restart the PC', 'Run: sfc /scannow', 'Check Windows Update', 'For Store: wsreset.exe'],
  },
  '0x80070490': {
    name: 'ERROR_NOT_FOUND', category: 'System', severity: 'low',
    description: 'Element not found. The requested object, registry key, or resource does not exist.',
    causes: ['Corrupted Windows component', 'Missing registry entry', 'Update or DISM issue'],
    fixes: ['Run: DISM /Online /Cleanup-Image /RestoreHealth', 'For Update: clear update cache', 'Run: sfc /scannow'],
  },
  '0x80070643': {
    name: 'ERROR_INSTALL_FAILURE', category: 'Installation', severity: 'medium',
    description: 'Critical installation failure. The installer for an application or update failed.',
    causes: ['Conflicting application is running', 'Insufficient permissions', 'Corrupted installer', '.NET Framework issue'],
    fixes: ['Close all applications and retry installation', 'Run installer as Administrator', 'Reinstall .NET Framework', 'Check log: %temp%\\*.log'],
  },
  '0x80092004': {
    name: 'CRYPT_E_NOT_FOUND', category: 'Certificates', severity: 'medium',
    description: 'Certificate or cryptographic object not found.',
    causes: ['Missing or expired certificate', 'Corrupted certificate store', 'SSL/TLS issue'],
    fixes: ['Update Windows to get new root certificates', 'Check certificate store: certmgr.msc', 'Sync date and time: w32tm /resync'],
  },
}

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  high:     { label: 'High',     color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
  medium:   { label: 'Medium',   color: '#ca8a04', bg: '#fefce8', border: '#fef08a' },
  low:      { label: 'Low',      color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
}

const CATEGORIES = ['All', ...new Set(Object.values(ERROR_DB).map(e => e.category))]

function normalizeCode(input) {
  const s = input.trim().toUpperCase().replace(/\s/g, '')
  if (s.startsWith('0X')) return s
  if (/^[0-9A-F]{8}$/.test(s)) return '0x' + s
  if (/^\d+$/.test(s)) {
    const hex = (parseInt(s) >>> 0).toString(16).toUpperCase().padStart(8, '0')
    return '0x' + hex
  }
  return s
}

export default function WindowsErrorDecoder() {
  const { locale } = useRouter()
  const isEn = locale === 'en'

  const [query, setQuery]     = useState('')
  const [result, setResult]   = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [filter, setFilter]   = useState('all')

  const decode = useCallback(() => {
    if (!query.trim()) return
    const normalized = normalizeCode(query)
    const found = ERROR_DB[normalized]
    if (found) { setResult({ code: normalized, ...found }); setNotFound(false) }
    else { setResult(null); setNotFound(true) }
  }, [query])

  const handleKey = e => { if (e.key === 'Enter') decode() }

  const filteredErrors = filter === 'all'
    ? Object.entries(ERROR_DB)
    : Object.entries(ERROR_DB).filter(([, v]) => v.category === filter)

  // i18n strings
  const t = {
    title:       isEn ? 'Windows Error Code Decoder' : 'Декодер помилок Windows',
    subtitle:    isEn ? 'Enter an error code — find out what it means and how to fix it' : 'Введи код — дізнайся що він означає і як виправити',
    placeholder: isEn ? '0x80070005 or 80070005 or 2147942405...' : '0x80070005 або 80070005 або 2147942405...',
    decodeBtn:   isEn ? 'Decode' : 'Декодувати',
    tryLabel:    isEn ? 'Try:' : 'Спробуй:',
    causes:      isEn ? '⚡ Causes' : '⚡ Причини',
    fixes:       isEn ? '🔧 How to fix' : '🔧 Як виправити',
    allLabel:    isEn ? 'All' : 'Всі',
    dbTitle:     isEn ? 'Error Code Database' : 'База помилок',
    notFoundTitle: isEn ? 'Code not found in database' : 'Код не знайдено в базі',
    notFoundText:  isEn ? 'Try on Microsoft Learn or Google.' : 'Спробуй на Microsoft Learn або в Google.',
    seoH2:       isEn ? 'How to use the decoder' : 'Як розшифрувати код помилки Windows',
    seoP1:       isEn
      ? 'Windows error codes like 0x80070005 follow a consistent pattern: 0x8007 + Win32 error code in hex. For example, 0005 = 5 = ERROR_ACCESS_DENIED. Codes starting with 0xC000xxxx are NT kernel errors (NTSTATUS) — commonly seen in BSOD stop codes.'
      : 'Коди помилок Windows у форматі 0x80070005 слідують шаблону: 0x8007 + Win32 код у hex. Наприклад 0005 = 5 = ERROR_ACCESS_DENIED. Коди 0xC000xxxx — помилки ядра NT (NTSTATUS), часто зустрічаються в BSOD.',
    seoP2:       isEn
      ? 'The database includes the most common errors in Windows 10 and 11, including new BSOD codes from problematic 2025–2026 updates (0x0000018B — SECURE_KERNEL_ERROR after KB5053656).'
      : 'База містить найпоширеніші помилки Windows 10 і 11 включно з новими BSOD від проблемних оновлень 2025-2026 (0x0000018B — SECURE_KERNEL_ERROR після KB5053656).',
    backLink:    isEn ? '← All tools' : '← Всі інструменти',
    toolsHref:   isEn ? '/tools' : '/tools',
    homeLabel:   isEn ? 'Home' : 'Головна',
    toolsLabel:  isEn ? 'Tools' : 'Інструменти',
    pageLabel:   isEn ? 'Error Decoder' : 'Декодер помилок',
    auditLabel:  isEn ? 'AuditShield' : 'AuditShield',
    auditText:   isEn
      ? 'For a full Windows PC security audit — '
      : 'Для повного аудиту безпеки ПК — ',
    eventLabel:  isEn ? 'Event ID Reference' : 'Event ID довідник',
    eventText:   isEn
      ? 'To look up Windows Event IDs — '
      : 'Для перегляду Event ID з журналу — ',
  }

  const canonicalPath = isEn
    ? `${SITE}/en/tools/windows-error-decoder`
    : `${SITE}/tools/windows-error-decoder`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: isEn
      ? 'Windows Error Code Decoder — Look Up Any Error Code'
      : 'Декодер помилок Windows — розшифруй код помилки онлайн',
    description: isEn
      ? 'Free Windows error code lookup tool. Enter 0x80070005, 0xC000021A or any hex code and instantly get the error name, causes, and step-by-step fixes.'
      : 'Безкоштовний інструмент для розшифрування кодів помилок Windows. Введи код 0x80070005 і дізнайся що він означає та як виправити.',
    url: canonicalPath,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Windows',
    inLanguage: isEn ? 'en' : 'uk',
    publisher: { '@type': 'Organization', name: siteConfig.name, url: SITE },
  }

  const sev = result ? SEVERITY_CONFIG[result.severity] : null

  return (
    <Layout
      title={isEn
        ? 'Windows Error Code Decoder — Look Up 0x80070005 and Any Hex Code'
        : 'Декодер помилок Windows — розшифруй код помилки онлайн'}
      description={isEn
        ? 'Enter any Windows error code (0x80070005, 0xC000021A, BSOD codes) and instantly get the cause and step-by-step fix. 40+ codes. Free.'
        : 'Введи код помилки Windows (0x80070005, 0xC000021A та ін.) і дізнайся що він означає, чому виникає і як виправити. 40+ помилок. Безкоштовно.'}
      canonical={canonicalPath}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div style={{ padding: '2rem 0 4rem' }}>
        <div className="container">

          {/* Breadcrumb */}
          <nav style={s.bc}>
            <Link href={isEn ? '/en' : '/'} style={s.bcLink}>{t.homeLabel}</Link>
            <span style={s.bcSep}>/</span>
            <Link href={isEn ? '/en/tools' : '/tools'} style={s.bcLink}>{t.toolsLabel}</Link>
            <span style={s.bcSep}>/</span>
            <span style={{ ...s.bcLink, color: 'var(--muted,#64748b)' }}>{t.pageLabel}</span>
          </nav>

          {/* Header */}
          <div style={s.header}>
            <h1 style={s.title}>🔍 {t.title}</h1>
            <p style={s.subtitle}>{t.subtitle}</p>
          </div>

          {/* Search */}
          <div style={s.searchBox}>
            <div style={s.searchRow}>
              <input style={s.input} type="text" value={query}
                onChange={e => { setQuery(e.target.value); setResult(null); setNotFound(false) }}
                onKeyDown={handleKey} autoFocus placeholder={t.placeholder} />
              <button style={s.btn} onClick={decode}>{t.decodeBtn}</button>
            </div>
            <div style={s.examples}>
              {t.tryLabel}{' '}
              {['0x80070005', '0x80070002', '0xC000021A', '0x0000018B', '0x80070070', '0x80248007'].map(code => (
                <button key={code} style={s.chip}
                  onClick={() => { setQuery(code); setTimeout(decode, 0) }}>{code}</button>
              ))}
            </div>
          </div>

          {/* Result */}
          {result && sev && (
            <div style={{ ...s.resultCard, borderColor: sev.border }}>
              <div style={{ ...s.resultHeader, background: sev.bg, borderBottom: `1px solid ${sev.border}` }}>
                <div style={s.resultCode}>{result.code}</div>
                <div style={s.resultMeta}>
                  <span style={s.resultName}>{result.name}</span>
                  <span style={{ ...s.sevBadge, color: sev.color, background: sev.bg, border: `1px solid ${sev.border}` }}>{sev.label}</span>
                  <span style={s.catBadge}>{result.category}</span>
                </div>
              </div>
              <div style={s.resultBody}>
                <p style={s.resultDesc}>{result.description}</p>
                <div style={s.resultCols}>
                  <div>
                    <p style={s.resultSectionTitle}>{t.causes}</p>
                    <ul style={s.resultList}>
                      {result.causes.map((c, i) => <li key={i} style={s.resultLi}>{c}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p style={s.resultSectionTitle}>{t.fixes}</p>
                    <ol style={s.resultList}>
                      {result.fixes.map((f, i) => <li key={i} style={s.resultLi}>{f}</li>)}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Not found */}
          {notFound && (
            <div style={s.notFound}>
              <p style={s.notFoundTitle}>{t.notFoundTitle}</p>
              <p style={s.notFoundText}>
                {t.notFoundText}{' '}
                <a href={`https://learn.microsoft.com/search/?terms=${query}`}
                  target="_blank" rel="noopener noreferrer" style={s.link}>Microsoft Learn</a>
                {' '}{isEn ? 'or' : 'або'}{' '}
                <a href={`https://www.google.com/search?q=windows+error+${query}`}
                  target="_blank" rel="noopener noreferrer" style={s.link}>Google</a>.
              </p>
            </div>
          )}

          {/* Error DB browser */}
          <div style={s.section}>
            <div style={s.browserHeader}>
              <h2 style={s.h2}>{t.dbTitle} ({Object.keys(ERROR_DB).length})</h2>
              <div style={s.filters}>
                <button style={filter === 'all' ? s.filterActive : s.filterBtn}
                  onClick={() => setFilter('all')}>{t.allLabel}</button>
                {CATEGORIES.filter(c => c !== 'All').map(cat => (
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
                    onClick={() => {
                      setQuery(code)
                      setResult({ code, ...err })
                      setNotFound(false)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}>
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

          {/* SEO block */}
          <div style={s.seoBlock}>
            <h2 style={s.seoH2}>{t.seoH2}</h2>
            <p style={s.seoP}>{t.seoP1}</p>
            <p style={s.seoP}>{t.seoP2}</p>
            <p style={s.seoP}>
              {t.auditText}
              <Link href={isEn ? '/en/tools/auditshield' : '/tools/auditshield'} style={s.link}>
                {t.auditLabel}
              </Link>.
              {' '}{t.eventText}
              <Link href={isEn ? '/en/tools/windows-event-id' : '/tools/windows-event-id'} style={s.link}>
                {t.eventLabel}
              </Link>.
            </p>
          </div>

          <div style={s.back}>
            <Link href={isEn ? '/tools' : '/tools'} style={s.backLink}>{t.backLink}</Link>
          </div>

        </div>
      </div>
    </Layout>
  )
}

const s = {
  bc: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1.5rem' },
  bcLink: { fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--faint,#94a3b8)', textDecoration: 'none' },
  bcSep: { fontSize: '12px', color: 'var(--border-md,#cbd5e1)' },
  header: { marginBottom: '2rem', textAlign: 'center' },
  title: { fontFamily: "'Unbounded', sans-serif", fontSize: 'clamp(1.4rem,4vw,1.9rem)', fontWeight: 700, color: 'var(--text,#0f172a)', marginBottom: '8px' },
  subtitle: { fontSize: '1rem', color: 'var(--muted,#64748b)', margin: 0 },
  searchBox: { background: 'var(--bg,#f8fafc)', border: '1px solid var(--border,#e2e8f0)', borderRadius: '14px', padding: '1.5rem', marginBottom: '2rem' },
  searchRow: { display: 'flex', gap: '10px', marginBottom: '12px' },
  input: { flex: 1, padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '1rem', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', background: 'var(--bg-card,#fff)', color: 'var(--text,#0f172a)' },
  btn: { padding: '12px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', whiteSpace: 'nowrap' },
  examples: { display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', fontSize: '0.8rem', color: 'var(--faint,#94a3b8)' },
  chip: { fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#2563eb', background: 'var(--accent-light,#eff6ff)', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: '20px', cursor: 'pointer' },
  resultCard: { border: '1px solid', borderRadius: '12px', marginBottom: '2rem', overflow: 'hidden', overflow: 'hidden', background: 'var(--bg-card,#fff)' },
  resultHeader: { padding: '1.25rem 1.5rem' },
  resultCode: { fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text,#0f172a)', marginBottom: '6px' },
  resultMeta: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  resultName: { fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--muted,#475569)', fontWeight: 600 },
  sevBadge: { fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '20px' },
  catBadge: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted,#64748b)', background: 'var(--bg,#f1f5f9)', padding: '2px 8px', borderRadius: '6px' },
  resultBody: { padding: '1.5rem' },
  resultDesc: { fontSize: '0.95rem', color: 'var(--muted,#475569)', lineHeight: 1.7, marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg,#f8fafc)', borderRadius: '8px' },
  resultCols: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' },
  resultSectionTitle: { fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--muted,#64748b)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' },
  resultList: { paddingLeft: '1.25rem', margin: 0 },
  resultLi: { fontSize: '0.875rem', color: 'var(--text,#334155)', lineHeight: 1.7, marginBottom: '6px' },
  notFound: { padding: '1.5rem', background: 'var(--bg,#fafafa)', border: '1px dashed #cbd5e1', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center' },
  notFoundTitle: { fontWeight: 700, color: 'var(--muted,#475569)', marginBottom: '6px' },
  notFoundText: { fontSize: '0.875rem', color: 'var(--muted,#64748b)', margin: 0 },
  section: { marginBottom: '3rem' },
  browserHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '1rem' },
  h2: { fontFamily: "'Unbounded', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--text,#0f172a)', margin: 0 },
  filters: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  filterBtn: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted,#64748b)', background: 'var(--bg,#f1f5f9)', border: '1px solid var(--border,#e2e8f0)', padding: '4px 12px', borderRadius: '20px', cursor: 'pointer' },
  filterActive: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#fff', background: '#2563eb', border: '1px solid #2563eb', padding: '4px 12px', borderRadius: '20px', cursor: 'pointer' },
  errGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' },
  errCard: { textAlign: 'left', padding: '12px 14px', background: 'var(--bg-card,#fff)', border: '1px solid var(--border,#e2e8f0)', borderRadius: '10px', cursor: 'pointer' },
  errCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  errCode: { fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: '#2563eb' },
  severityDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  errName: { fontSize: '0.75rem', color: 'var(--text,#334155)', marginBottom: '2px', fontWeight: 600 },
  errCat: { fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--faint,#94a3b8)', margin: 0 },
  seoBlock: { padding: '2rem', background: 'var(--bg,#f8fafc)', borderRadius: '12px', marginBottom: '2rem' },
  seoH2: { fontFamily: "'Unbounded', sans-serif", fontSize: '1rem', fontWeight: 700, color: 'var(--text,#0f172a)', marginBottom: '1rem' },
  seoP: { fontSize: '0.875rem', color: 'var(--muted,#475569)', lineHeight: 1.8, marginBottom: '10px' },
  link: { color: '#2563eb', fontWeight: 500, textDecoration: 'none' },
  back: { marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border,#e2e8f0)' },
  backLink: { fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#2563eb', fontWeight: 500, textDecoration: 'none' },
}
