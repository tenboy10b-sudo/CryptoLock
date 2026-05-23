import { useState, useCallback } from 'react'
import Layout from '../../components/Layout'
import Link from 'next/link'
import siteConfig from '../../site.config'

const SITE = siteConfig.url

const ERROR_DB = {
  // ── Доступ / Права ───────────────────────────────────────────────────────
  '0x80070005': { name: 'ERROR_ACCESS_DENIED', category: 'Доступ', severity: 'high', description: 'Відмовлено в доступі. Windows не може виконати операцію через недостатні права.', causes: ['Запуск без прав адміністратора', 'Антивірус блокує операцію', 'Пошкоджені права NTFS на файл або папку', 'UAC заблокував дію'], fixes: ['Запусти програму від імені адміністратора (ПКМ → Запуск від адміністратора)', 'Тимчасово вимкни антивірус і повтори', 'Виконай: icacls "шлях" /reset /T для відновлення прав', 'Перевір налаштування UAC'] },
  '0x80070006': { name: 'ERROR_INVALID_HANDLE', category: 'Система', severity: 'medium', description: 'Недійсний дескриптор. Програма звернулась до вже закритого або неіснуючого ресурсу.', causes: ['Збій у програмі або службі', 'Пошкоджені системні файли', 'Конфлікт програм'], fixes: ['Перезапустити програму або службу', 'sfc /scannow від адміна', 'Перезавантажити Windows'] },

  // ── Файли ───────────────────────────────────────────────────────────────
  '0x80070002': { name: 'ERROR_FILE_NOT_FOUND', category: 'Файли', severity: 'medium', description: 'Файл не знайдено. Система шукає файл за вказаним шляхом, але не може його знайти.', causes: ['Файл видалено або переміщено', 'Неправильний шлях', 'Пошкоджений реєстр', 'Відсутній компонент оновлення'], fixes: ['Перевір чи існує файл', 'Для Windows Update: запусти засіб усунення неполадок', 'DISM /Online /Cleanup-Image /RestoreHealth', 'sfc /scannow'] },
  '0x80070003': { name: 'ERROR_PATH_NOT_FOUND', category: 'Файли', severity: 'medium', description: 'Шлях не знайдено. Вказана папка або директорія не існує.', causes: ['Папку видалено або перейменовано', 'Диск відключений', 'Неправильний шлях в реєстрі'], fixes: ['Перевір чи існує папка', 'Перевстанови програму що звертається до неї', 'Перевір записи автозавантаження'] },
  '0x80070020': { name: 'ERROR_SHARING_VIOLATION', category: 'Файли', severity: 'medium', description: 'Помилка спільного використання файлу. Файл відкрито іншим процесом і не може бути змінений.', causes: ['Файл відкритий в іншій програмі', 'Антивірус сканує файл', 'Служба або процес тримає файл'], fixes: ['Закрий всі програми що можуть використовувати файл', 'Перевір через Resource Monitor (resmon) який процес тримає файл', 'Перезавантаж ПК і повтори'] },

  // ── Диск / Пам\'ять ──────────────────────────────────────────────────────
  '0x80070070': { name: 'ERROR_DISK_FULL', category: 'Диск', severity: 'high', description: 'Диск заповнений. Недостатньо вільного місця для виконання операції.', causes: ['Диск переповнений', 'Накопичились тимчасові файли', 'Файл підкачки займає багато місця'], fixes: ['Запусти cleanmgr і видали тимчасові файли', 'Видали непотрібні програми', 'Перемісти великі файли на інший диск', 'Зменши розмір файлу підкачки'] },
  '0x8007000E': { name: 'ERROR_OUTOFMEMORY', category: "Пам'ять", severity: 'high', description: "Недостатньо пам'яті. Системі не вистачає RAM для виконання операції.", causes: ['Замало RAM', "Витік пам'яті в програмі", 'Файл підкачки вимкнений'], fixes: ['Закрий непотрібні програми і вкладки', 'Перезавантаж Windows', 'Перевір файл підкачки: sysdm.cpl → Додатково', 'Запусти перевірку RAM: mdsched.exe'] },
  '0x80070718': { name: 'ERROR_NOT_ENOUGH_QUOTA', category: 'Диск', severity: 'medium', description: 'Перевищено квоту диска. Для операції недостатньо дискового простору або квоти.', causes: ['Квота диска для користувача вичерпана', 'Диск переповнений', 'Обмеження на мережевому ресурсі'], fixes: ['Очисти непотрібні файли', 'Збільш квоту диска (адмін: Управление дисками → Квоты)', 'Перемісти файли на інший розділ'] },

  // ── Мережа ──────────────────────────────────────────────────────────────
  '0x80072EFE': { name: 'ERROR_INTERNET_CONNECTION_ABORTED', category: 'Мережа', severity: 'medium', description: "З'єднання перервано. Підключення до інтернету було перервано.", causes: ['Нестабільне інтернет-підключення', 'Брандмауер блокує', 'Проблеми з DNS'], fixes: ['Перевір інтернет', 'Тимчасово вимкни брандмауер', 'Зміни DNS на 1.1.1.1', 'netsh winsock reset && netsh int ip reset'] },
  '0x80072EE7': { name: 'ERROR_INTERNET_NAME_NOT_RESOLVED', category: 'Мережа', severity: 'medium', description: "Ім'я сервера не вдалося розпізнати. DNS не може знайти адресу хоста.", causes: ['Проблеми з DNS', 'Немає інтернету', 'Неправильні DNS налаштування', 'Hosts файл з неправильними записами'], fixes: ['ipconfig /flushdns', 'Зміни DNS на 1.1.1.1 і 8.8.8.8', 'Перевір hosts файл: C:\\Windows\\System32\\drivers\\etc\\hosts', 'Перезапусти службу DNS Client'] },
  '0x80072F8F': { name: 'ERROR_WINHTTP_SECURE_FAILURE', category: 'Мережа', severity: 'medium', description: 'Помилка SSL/TLS. Неможливо встановити безпечне з\'єднання через проблему з сертифікатом.', causes: ['Неправильна дата і час на ПК', 'Застарілі кореневі сертифікати', 'Проблема з SSL на сервері'], fixes: ['Синхронізуй час: w32tm /resync', 'Оновіть Windows — нові кореневі сертифікати', 'Перевір налаштування проксі'] },
  '0x80072F76': { name: 'ERROR_HTTP_HEADER_NOT_FOUND', category: 'Мережа', severity: 'low', description: 'HTTP заголовок не знайдено. Проблема з HTTP відповіддю від сервера.', causes: ['Проксі-сервер змінює відповіді', 'Антивірус з HTTPS-скануванням', 'Брандмауер блокує пакети'], fixes: ['Вимкни HTTPS-сканування в антивірусі', 'Перевір налаштування проксі', 'Додай виняток в брандмауері'] },

  // ── Windows Update ───────────────────────────────────────────────────────
  '0x80248007': { name: 'WU_E_DS_NODATA', category: 'Windows Update', severity: 'medium', description: 'Помилка Windows Update — відсутні необхідні дані в базі оновлень.', causes: ['Пошкоджена база даних Update', 'Недостатньо місця на диску', 'Проблема зі службою Update'], fixes: ['Запусти засіб усунення неполадок Update', 'net stop wuauserv → видали SoftwareDistribution → net start wuauserv', 'DISM /Online /Cleanup-Image /RestoreHealth'] },
  '0x80073712': { name: 'ERROR_SXS_COMPONENT_STORE_CORRUPT', category: 'Windows Update', severity: 'high', description: 'Сховище компонентів Windows пошкоджено. Файли Windows Update пошкоджені або відсутні.', causes: ['Пошкоджені системні файли', 'Перерване оновлення', 'Проблема з диском'], fixes: ['DISM /Online /Cleanup-Image /RestoreHealth', 'sfc /scannow', 'chkdsk C: /f /r (потребує перезавантаження)'] },
  '0x80070057': { name: 'ERROR_INVALID_PARAMETER', category: 'Система', severity: 'medium', description: 'Невірний параметр. Програма або Windows отримала недопустиме значення.', causes: ['Пошкоджені системні файли', 'Конфлікт драйверів', 'Проблема з оновленням'], fixes: ['sfc /scannow від адміна', 'DISM /Online /Cleanup-Image /RestoreHealth', 'Видали останнє оновлення якщо проблема після нього'] },
  '0x8024000B': { name: 'WU_E_CALL_CANCELLED', category: 'Windows Update', severity: 'low', description: 'Операція Windows Update скасована користувачем або системою.', causes: ['Оновлення скасоване вручну', 'Система перезавантажилась під час оновлення', 'Брандмауер перервав підключення'], fixes: ['Запусти Windows Update знову', 'Перевір підключення до інтернету', 'Запусти як адміністратор'] },
  '0x80240034': { name: 'WU_E_DOWNLOAD_FAILED', category: 'Windows Update', severity: 'medium', description: 'Завантаження оновлення не вдалось. Файл оновлення не міг бути завантажений.', causes: ['Проблеми з інтернетом під час завантаження', 'Антивірус заблокував завантаження', 'Недостатньо місця на диску'], fixes: ['Перевір підключення і повтори', 'Очисти кеш оновлень: SoftwareDistribution', 'Вимкни антивірус тимчасово і повтори'] },

  // ── BSOD / Критичні ─────────────────────────────────────────────────────
  '0xC000021A': { name: 'STATUS_SYSTEM_PROCESS_TERMINATED', category: 'BSOD', severity: 'critical', description: 'Критична помилка Windows — системний процес (winlogon.exe або csrss.exe) завершився аварійно.', causes: ['Пошкоджені системні файли', 'Несумісний драйвер', 'Пошкоджений профіль користувача', 'Пошкоджений реєстр'], fixes: ['Завантажся в безпечному режимі (F8)', 'sfc /scannow від адміністратора', 'Відновлення системи до точки до появи проблеми', 'Перевстанови драйвери відеокарти'] },
  '0x0000007E': { name: 'SYSTEM_THREAD_EXCEPTION_NOT_HANDLED', category: 'BSOD', severity: 'critical', description: 'BSOD — системний потік згенерував виключення яке не вдалося обробити.', causes: ['Несумісний або пошкоджений драйвер', 'Пошкоджений системний файл', 'Проблема з обладнанням'], fixes: ['Завантажся в безпечному режимі і видали останній драйвер', 'Перевір RAM: mdsched.exe', 'chkdsk /f', 'sfc /scannow'] },
  '0x00000050': { name: 'PAGE_FAULT_IN_NONPAGED_AREA', category: 'BSOD', severity: 'critical', description: "BSOD — спроба звернутись до пам'яті що не знаходиться в оперативній пам'яті.", causes: ['Несправна оперативна пам\'ять', 'Пошкоджений драйвер', 'Вірус або шкідливе ПЗ', 'Перегрів'], fixes: ['mdsched.exe — перевірка RAM', 'Перевір температури компонентів', 'Видали або оновіть проблемний драйвер', 'Повне сканування на віруси'] },
  '0x0000007B': { name: 'INACCESSIBLE_BOOT_DEVICE', category: 'BSOD', severity: 'critical', description: 'BSOD — Windows не може отримати доступ до завантажувального диску.', causes: ['Змінено порядок дисків в BIOS', 'Пошкоджений контролер диску', 'Зміна режиму SATA (IDE↔AHCI)', 'Пошкоджений завантажувач'], fixes: ['Перевір налаштування SATA в BIOS (має бути AHCI)', 'Перевір порядок завантаження в BIOS', 'Відновити завантажувач: bootrec /rebuildbcd', 'Перевір кабелі диску'] },
  '0x0000003B': { name: 'SYSTEM_SERVICE_EXCEPTION', category: 'BSOD', severity: 'critical', description: 'BSOD — виключення виникло під час виконання системної служби.', causes: ['Несправний або застарілий драйвер', 'Пошкоджені системні файли', 'Апаратна несправність (частіше RAM)'], fixes: ['Оновіть всі драйвери особливо відеокарти і чипсету', 'sfc /scannow', 'mdsched.exe для перевірки RAM', 'Перевір Memory Integrity в Windows Security'] },
  '0x0000018B': { name: 'SECURE_KERNEL_ERROR', category: 'BSOD', severity: 'critical', description: 'BSOD — помилка захищеного ядра. Часто виникає після оновлень Windows 11 24H2 у 2025-2026.', causes: ['Несумісне оновлення Windows (KB5053656, KB5055523)', 'Конфлікт з Virtualization-Based Security', 'Проблема з драйвером ядра'], fixes: ['Видали проблемне оновлення: wusa /uninstall /kb:5053656', 'Перевір наявність KIR від Microsoft через Windows Update', 'DISM /RestoreHealth + sfc /scannow', 'Оновити BIOS якщо MSI/ASUS/Gigabyte плата'] },

  // ── Microsoft Store / Activation ─────────────────────────────────────────
  '0x80073CF0': { name: 'ERROR_PACKAGE_NOT_FOUND', category: 'Microsoft Store', severity: 'low', description: 'Пакет програми не знайдено в Microsoft Store або в системі.', causes: ['Програма не встановлена', 'Пошкоджена установка', 'Проблема з Microsoft Store'], fixes: ['Скинь кеш Store: wsreset.exe', 'Перевстанови програму через Store', 'Get-AppxPackage -AllUsers | Repair в PowerShell'] },
  '0x803FB005': { name: 'WU_E_REDIRECTOR_S_FALSE', category: 'Microsoft Store', severity: 'low', description: 'Помилка завантаження з Microsoft Store.', causes: ['Проблема з інтернетом', 'Недостатньо місця', 'Пошкоджений кеш Store'], fixes: ['wsreset.exe', 'Перевір інтернет і вільне місце', 'Перевстанови Microsoft Store через PowerShell'] },
  '0x80131500': { name: 'STORE_ERROR_GENERIC', category: 'Microsoft Store', severity: 'low', description: 'Загальна помилка Microsoft Store. Не вдалось підключитись або завантажити.', causes: ['Проблема з підключенням', 'Пошкоджений кеш Store', 'Застарілі компоненти Store'], fixes: ['wsreset.exe', 'Зміни DNS на 8.8.8.8', 'Виконай: Get-AppxPackage *store* | Remove-AppxPackage і перевстанови'] },

  // ── BitLocker ────────────────────────────────────────────────────────────
  '0x80310008': { name: 'FVE_E_VOLUME_NOT_SUPPORTED', category: 'BitLocker', severity: 'medium', description: 'BitLocker не підтримується для цього тому.', causes: ['Відсутній TPM чіп', 'Диск у FAT замість NTFS', 'Системний диск не відповідає вимогам'], fixes: ['Перевір TPM: tpm.msc', 'Переконайся що диск у форматі NTFS', 'Для без-TPM: gpedit.msc → BitLocker → Allow without TPM'] },
  '0x8031006A': { name: 'FVE_E_BAD_INFORMATION', category: 'BitLocker', severity: 'high', description: 'Пошкоджена інформація BitLocker. Метадані шифрування пошкоджені або недійсні.', causes: ['Пошкоджений том', 'Помилка при шифруванні', 'Апаратна проблема з диском'], fixes: ['Спробуй ключ відновлення з account.microsoft.com/devices/recoverykey', 'manage-bde -unlock C: -RecoveryPassword КЛЮЧ', 'Якщо не допомогло — дані можуть бути втрачені'] },

  // ── Служби ──────────────────────────────────────────────────────────────
  '0x80070424': { name: 'ERROR_SERVICE_DOES_NOT_EXIST', category: 'Служби', severity: 'medium', description: 'Служба Windows не існує. Спроба запустити або налаштувати службу що відсутня в системі.', causes: ['Служба видалена або пошкоджена', 'Проблема після оновлення Windows', 'Шкідливе ПЗ видалило службу'], fixes: ['sfc /scannow для відновлення службових файлів', 'DISM /RestoreHealth', 'Перевстанови Windows якщо критична служба'] },
  '0x80070422': { name: 'ERROR_SERVICE_DISABLED', category: 'Служби', severity: 'medium', description: 'Служба відключена. Операція не може бути виконана бо потрібна служба вимкнена.', causes: ['Служба вимкнена вручну', 'Антивірус або оптимізатор вимкнув службу', 'Групова політика вимкнула службу'], fixes: ['services.msc — знайди службу і увімкни', 'Set-Service "ServiceName" -StartupType Automatic', 'Перевір GPO якщо корпоративний ПК'] },

  // ── Загальні ────────────────────────────────────────────────────────────
  '0x80004005': { name: 'E_FAIL', category: 'Загальна', severity: 'medium', description: 'Невизначена помилка. Загальний код — операція не вдалась без конкретної причини.', causes: ['Проблема з доступом до ресурсу', 'Пошкоджений файл або архів', 'Несумісність програм', 'Мережева проблема'], fixes: ['Запусти від адміністратора', 'Перевстанови проблемну програму', 'sfc /scannow', 'Для мережевих ресурсів: перевір SMB і NTFS дозволи'] },
  '0x8000FFFF': { name: 'E_UNEXPECTED', category: 'Загальна', severity: 'medium', description: 'Непередбачена помилка. Виникла неочікувана критична помилка.', causes: ['Пошкоджені системні файли', 'Конфлікт програм', 'Проблема з Update'], fixes: ['Перезавантаж', 'sfc /scannow', 'Перевір Windows Update', 'Для Store: wsreset.exe'] },
  '0x80070490': { name: 'ERROR_NOT_FOUND', category: 'Система', severity: 'low', description: 'Елемент не знайдено. Запитаний об\'єкт, ключ реєстру або ресурс не існує.', causes: ['Пошкоджений компонент Windows', 'Відсутній запис в реєстрі', 'Проблема з Update або DISM'], fixes: ['DISM /Online /Cleanup-Image /RestoreHealth', 'Для Update: очисти кеш оновлень', 'sfc /scannow'] },
  '0x80070643': { name: 'ERROR_INSTALL_FAILURE', category: 'Встановлення', severity: 'medium', description: 'Критична помилка під час встановлення. Інсталятор програми або оновлення завершився з помилкою.', causes: ['Конфліктуюча програма запущена', 'Недостатньо прав', 'Пошкоджений інсталятор', 'Проблема з .NET Framework'], fixes: ['Закрий всі програми і повтори встановлення', 'Запусти інсталятор від адміністратора', 'Перевстанови .NET Framework', 'Перевір журнал: %temp%\\*.log'] },
  '0x80070BC9': { name: 'ERROR_FAIL_REBOOT_REQUIRED', category: 'Встановлення', severity: 'low', description: 'Потрібне перезавантаження. Операція буде завершена після перезавантаження системи.', causes: ['Файли заблоковані запущеними процесами', 'Попереднє оновлення чекає перезавантаження'], fixes: ['Збережи роботу і перезавантаж', 'Перед повторною спробою завжди виконуй повне перезавантаження'] },
  '0x800703EE': { name: 'ERROR_VOLUME_DISMOUNTED', category: 'Диск', severity: 'medium', description: 'Том відмонтовано. Операція не може бути виконана на відмонтованому томі.', causes: ['USB або зовнішній диск від\'єднаний під час операції', 'Диск виймутий до завершення запису'], fixes: ['Підключи диск знову', 'Перевір цілісність файлів на диску: chkdsk', 'Завжди використовуй "Безпечне вилучення" для USB'] },
  '0x80092004': { name: 'CRYPT_E_NOT_FOUND', category: 'Сертифікати', severity: 'medium', description: 'Сертифікат або криптографічний об\'єкт не знайдено.', causes: ['Відсутній або прострочений сертифікат', 'Пошкоджене сховище сертифікатів', 'Проблема з SSL/TLS'], fixes: ['Оновіть Windows для отримання нових кореневих сертифікатів', 'certmgr.msc — перевір сховище сертифікатів', 'Синхронізуй дату і час: w32tm /resync'] },
}

const SEVERITY_CONFIG = {
  critical: { label: 'Критична', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  high:     { label: 'Висока',   color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
  medium:   { label: 'Середня', color: '#ca8a04', bg: '#fefce8', border: '#fef08a' },
  low:      { label: 'Низька',  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
}

const CATEGORIES = ['Всі', ...new Set(Object.values(ERROR_DB).map(e => e.category))]

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
  const [query, setQuery]   = useState('')
  const [result, setResult] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [filter, setFilter] = useState('all')
  const [copied, setCopied] = useState(false)

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

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Декодер помилок Windows — розшифруй код помилки онлайн',
    description: 'Безкоштовний інструмент для розшифрування кодів помилок Windows. Введи код 0x80070005 і дізнайся що він означає та як виправити.',
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
      description="Введи код помилки Windows (0x80070005, 0xC000021A та ін.) і дізнайся що він означає, чому виникає і як виправити. 40+ помилок. Безкоштовно."
      canonical={`${SITE}/tools/windows-error-decoder`}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div style={{ padding: '2rem 0 4rem' }}>
        <div className="container">

          <nav style={s.bc}>
            <Link href="/" style={s.bcLink}>Головна</Link>
            <span style={s.bcSep}>/</span>
            <Link href="/tools" style={s.bcLink}>Інструменти</Link>
            <span style={s.bcSep}>/</span>
            <span style={{ ...s.bcLink, color: '#64748b' }}>Декодер помилок</span>
          </nav>

          <div style={s.header}>
            <h1 style={s.title}>🔍 Декодер помилок Windows</h1>
            <p style={s.subtitle}>Введи код — дізнайся що він означає і як виправити</p>
          </div>

          <div style={s.searchBox}>
            <div style={s.searchRow}>
              <input style={s.input} type="text" value={query}
                onChange={e => { setQuery(e.target.value); setResult(null); setNotFound(false) }}
                onKeyDown={handleKey} autoFocus
                placeholder="0x80070005 або 80070005 або 2147942405..." />
              <button style={s.btn} onClick={decode}>Декодувати</button>
            </div>
            <div style={s.examples}>
              Спробуй:{' '}
              {['0x80070005', '0x80070002', '0xC000021A', '0x0000018B', '0x80070070', '0x80248007'].map(code => (
                <button key={code} style={s.chip}
                  onClick={() => { setQuery(code); setTimeout(decode, 0) }}>{code}</button>
              ))}
            </div>
          </div>

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
                Спробуй на{' '}
                <a href={`https://learn.microsoft.com/search/?terms=${query}`} target="_blank" rel="noopener noreferrer" style={s.link}>Microsoft Learn</a>{' '}або в{' '}
                <a href={`https://www.google.com/search?q=windows+error+${query}`} target="_blank" rel="noopener noreferrer" style={s.link}>Google</a>.
              </p>
            </div>
          )}

          <div style={s.section}>
            <div style={s.browserHeader}>
              <h2 style={s.h2}>База помилок ({Object.keys(ERROR_DB).length})</h2>
              <div style={s.filters}>
                <button style={filter==='all' ? s.filterActive : s.filterBtn} onClick={() => setFilter('all')}>Всі</button>
                {CATEGORIES.filter(c => c !== 'Всі').map(cat => (
                  <button key={cat} style={filter===cat ? s.filterActive : s.filterBtn} onClick={() => setFilter(cat)}>{cat}</button>
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

          <div style={s.seoBlock}>
            <h2 style={s.seoH2}>Як розшифрувати код помилки Windows</h2>
            <p style={s.seoP}>Коди помилок Windows у форматі <code style={s.code}>0x80070005</code> слідують шаблону: <code style={s.code}>0x8007</code> + Win32 код у hex. Наприклад <code style={s.code}>0005</code> = 5 = ERROR_ACCESS_DENIED. Коди <code style={s.code}>0xC000xxxx</code> — помилки ядра NT (NTSTATUS), часто зустрічаються в BSOD.</p>
            <p style={s.seoP}>База містить найпоширеніші помилки Windows 10 і Windows 11 включно з новими BSOD від проблемних оновлень 2025-2026 (0x0000018B — SECURE_KERNEL_ERROR після KB5053656).</p>
            <p style={s.seoP}>Для повного аудиту безпеки ПК — <Link href="/tools/auditshield" style={s.link}>AuditShield</Link>. Для перегляду Event ID з журналу — <Link href="/tools/windows-event-id" style={s.link}>Event ID довідник</Link>.</p>
          </div>

          <div style={s.back}><Link href="/tools" style={s.backLink}>← Всі інструменти</Link></div>
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
  title: { fontFamily: "'Unbounded', sans-serif", fontSize: 'clamp(1.4rem,4vw,1.9rem)', fontWeight: 700, color: '#0f172a', marginBottom: '8px' },
  subtitle: { fontSize: '1rem', color: '#64748b', margin: 0 },
  searchBox: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', marginBottom: '2rem' },
  searchRow: { display: 'flex', gap: '10px', marginBottom: '12px' },
  input: { flex: 1, padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '1rem', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', background: '#fff', color: '#0f172a' },
  btn: { padding: '12px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', whiteSpace: 'nowrap' },
  examples: { display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', fontSize: '0.8rem', color: '#94a3b8' },
  chip: { fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: '20px', cursor: 'pointer' },
  resultCard: { border: '1px solid', borderRadius: '12px', marginBottom: '2rem', overflow: 'hidden', background: '#fff' },
  resultHeader: { padding: '1.25rem 1.5rem' },
  resultCode: { fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' },
  resultMeta: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  resultName: { fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#475569', fontWeight: 600 },
  sevBadge: { fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '20px' },
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
  errCard: { textAlign: 'left', padding: '12px 14px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer' },
  errCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  errCode: { fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: '#2563eb' },
  severityDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  errName: { fontSize: '0.75rem', color: '#334155', marginBottom: '2px', fontWeight: 600 },
  errCat: { fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#94a3b8', margin: 0 },
  seoBlock: { padding: '2rem', background: '#f8fafc', borderRadius: '12px', marginBottom: '2rem' },
  seoH2: { fontFamily: "'Unbounded', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' },
  seoP: { fontSize: '0.875rem', color: '#475569', lineHeight: 1.8, marginBottom: '10px' },
  code: { fontFamily: 'var(--font-mono)', background: '#e2e8f0', padding: '1px 5px', borderRadius: '4px', fontSize: '0.85em' },
  link: { color: '#2563eb', fontWeight: 500, textDecoration: 'none' },
  back: { marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' },
  backLink: { fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#2563eb', fontWeight: 500, textDecoration: 'none' },
}
