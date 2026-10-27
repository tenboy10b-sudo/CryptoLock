// Реєстр форматів, кутів (angles) і перевірених фактів для Telegram-постів про AuditShield.
// Це ЄДИНЕ джерело того, що пост може стверджувати і які команди може радити:
//  - `steps` — команди/шляхи Windows, перевірені 2026-10-26 у Windows PowerShell 5.1 без прав адміністратора;
//    валідатор (auditshieldPost.js) пропускає в код поста лише їх;
//  - `demoCovers` — що Demo справді перевіряє за цією темою (demo/demo_manifest.json у security-audit-private): місток до Demo
//    не може обіцяти більше;
//  - `limits` — чесне обмеження теми, яке має бути видно в пості;
//  - VERIFIED_FACTS — твердження про Demo/Full, звірені з demo/README.md, demo_manifest.json і PROJECT_STATE.md.
// Тексти самих постів — у auditshieldApprovedPosts.js; тут лише факти. Нових тверджень про продукт тут не вигадувати:
// змінювати лише після звірки з поточною реалізацією.

export const FORMATS = ['diagnostic', 'quick', 'checklist', 'myth', 'tool']

export const VERIFIED_FACTS = [
  'Demo безкоштовне.',
  'Demo запускається у звичайному вікні Windows PowerShell 5.1 без прав адміністратора (без UAC).',
  'Demo лише читає дані і нічого не змінює в системі.',
  'Demo перевіряє чотири області: «Стан Windows і захисту», «Що запускається разом із Windows», «USB-пристрої, які пам\'ятає Windows», «Швидка перевірка підозрілих слідів».',
  'Звіт створюється локально на ПК: HTML-звіт (відкривається автоматично) і книга Excel (.xlsx) у папці %LOCALAPPDATA%\\AuditShield_Demo\\.',
  'Те, що без прав адміністратора визначити неможливо, Demo показує як «НЕ ВДАЛОСЯ ВИЗНАЧИТИ» з причиною, а не як «все гаразд».',
  'Demo не виставляє загальних оцінок і відсотків.',
  'У звіті Demo серійні номери USB приховані (видно лише останні 4 символи).',
  'У коді Demo немає мережевих команд, звіт збирається локально.',
  'Demo надсилає бот @AuditShield_01_Bot: файл і однорядкова команда запуску, яка перевіряє контрольну суму файлу.',
  'У розділі про Windows Demo показує версію, збірку й активацію Windows, стан Defender та зареєстровані антивіруси, стан профілів брандмауера (без аналізу правил).',
  'У розділі про автозапуск Demo показує записи Run/RunOnce, папки автозапуску та активні заплановані завдання не від Microsoft.',
  'У розділі про USB Demo показує накопичувачі, які Windows зберегла в реєстрі; це історія підключень, а не вміст копіювання.',
  'Для процесів Demo дає лише швидкі ознаки за шляхом і командним рядком; історія виявлень Defender — лише довідково. Це швидка перевірка, а не пошук вірусів.',
  'Demo не охоплює мережеві підключення, служби, облікові записи й журнал входів: це області повної версії.',
  'Повна версія — глибший аудит: 24 модулі, звіти HTML і Excel, створюються локально; для найглибших перевірок рекомендовано запуск від імені адміністратора.',
]

// module — точна назва з PROMO_MODULES (autopost.js), щоб не збігатись по темі з самостійним постом цього ж слота;
// keywords — слова (нижній регістр) для звірки з останніми темами extra-постів і заголовком останньої статті.
export const ANGLES = [
  // ── DIAGNOSTIC CASE ──
  {
    id: 'startup-unknown', format: 'diagnostic', module: 'Автозапуск', keywords: ['автозапуск', 'автозавантаж', 'startup'],
    topic: 'Що запускається разом із Windows',
    steps: [
      'Диспетчер завдань (Ctrl+Shift+Esc) → розділ автозавантаження',
      'Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location',
    ],
    limits: 'Команда показує записи автозапуску з реєстру й папки «Автозавантаження»; заплановані завдання і служби вона не охоплює.',
    demoCovers: 'Demo показує записи автозапуску (Run/RunOnce, папки автозапуску) та активні заплановані завдання не від Microsoft.',
  },
  {
    id: 'usb-memory', format: 'diagnostic', module: 'USB-історія', keywords: ['usb', 'флеш'],
    topic: 'USB-накопичувачі, які пам\'ятає Windows',
    steps: [
      'Get-ChildItem \'HKLM:\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR\' | ForEach-Object { Get-ChildItem $_.PSPath } | Get-ItemProperty | Select-Object FriendlyName',
    ],
    limits: 'Команда без прав адміністратора показує лише назви пристроїв; точні дати підключень у такий спосіб не побачити.',
    demoCovers: 'Demo показує USB-накопичувачі, які Windows зберегла в реєстрі (це історія підключень, а не вміст копіювання); серійні номери у звіті приховані, видно лише останні 4 символи.',
  },
  {
    id: 'process-locations', format: 'diagnostic', module: 'Запущені процеси', keywords: ['temp', 'downloads', 'завантаження'],
    topic: 'Програми, що працюють із тимчасових папок і завантажень',
    steps: [
      String.raw`Get-Process | Where-Object { $_.Path -match '\\(Temp|Downloads)\\' } | Select-Object Name, Id, Path`,
      'Диспетчер завдань → правий клік на процесі → «Відкрити розташування файлу»',
    ],
    limits: 'Порожній результат — гарний сценарій. Інсталятори й портативні програми часом працюють із Downloads легітимно; Path для деяких системних процесів без прав адміністратора порожній.',
    demoCovers: 'Для процесів Demo дає лише швидкі ознаки за шляхом і командним рядком (наприклад, запуск із тимчасових папок чи завантажень); це швидка перевірка, а не пошук вірусів.',
  },
  // ── QUICK CHECK ──
  {
    id: 'defender-status', format: 'quick', module: 'Антивірусний захист', keywords: ['defender', 'антивір'],
    topic: 'Стан захисника Windows Defender',
    steps: [
      'Get-MpComputerStatus | Select-Object AntivirusEnabled, RealTimeProtectionEnabled, AntivirusSignatureLastUpdated',
      'Безпека Windows → Захист від вірусів і загроз',
    ],
    limits: 'Якщо встановлено сторонній антивірус, значення Defender можуть відрізнятися — це нормально.',
    demoCovers: 'Demo показує стан Defender та зареєстровані антивіруси (виключення Defender потребують прав адміністратора) разом з іншими областями.',
  },
  {
    id: 'task-sched-nonms', format: 'quick', module: 'Планувальник завдань', keywords: ['планувальник', 'scheduled', 'завдан'],
    topic: 'Заплановані завдання не від Microsoft',
    steps: [
      'Get-ScheduledTask | Where-Object { $_.State -ne \'Disabled\' -and $_.TaskPath -notlike \'\\Microsoft\\*\' } | Select-Object TaskName, TaskPath',
    ],
    limits: 'Часто це оновлювачі програм і драйверів; на незнайомі назви варто просто звернути увагу.',
    demoCovers: 'Demo показує активні заплановані завдання не від Microsoft разом із записами автозапуску.',
  },
  {
    id: 'firewall-profiles', format: 'quick', module: 'Брандмауер Windows', keywords: ['брандмауер', 'firewall'],
    topic: 'Чи ввімкнено брандмауер у всіх профілях',
    steps: [
      'Get-NetFirewallProfile | Select-Object Name, Enabled',
    ],
    limits: 'Ця команда показує лише увімкнено чи вимкнено профіль; які правила дозволяють підключення, вона не перевіряє. False сам по собі не вердикт.',
    demoCovers: 'Demo показує лише стан профілів брандмауера, без аналізу правил, разом з іншими показниками захисту Windows.',
  },
  // ── CHECKLIST (до 3 практичних перевірок) ──
  {
    id: 'odd-activity-3', format: 'checklist', module: null, keywords: ['підозр', 'дивн', 'гальмує'],
    topic: '3 перевірки, коли ПК поводиться дивно',
    steps: [
      'Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 8 Name, Id, @{n=\'MB\';e={[int]($_.WorkingSet/1MB)}}',
      'Диспетчер завдань (Ctrl+Shift+Esc) → розділ автозавантаження',
      'Безпека Windows → Захист від вірусів і загроз',
    ],
    limits: 'Жоден окремий пункт не є вироком: це спосіб зібрати факти, перш ніж робити висновки.',
    demoCovers: 'Demo за один запуск дивиться на автозапуск і стан Defender; процеси за пам\'яттю Demo не рахує.',
  },
  {
    id: 'used-pc-3', format: 'checklist', module: null, keywords: ['вживан', 'купівл', 'second'],
    topic: '3 перевірки вживаного ПК або ноутбука',
    steps: [
      'Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, BuildNumber',
      'Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntiVirusProduct | Select-Object displayName',
      'Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location',
    ],
    limits: 'Це швидкий огляд, а не повний аудит; незнайомий запис — привід розпитати продавця або майстра, а не доказ чогось поганого.',
    demoCovers: 'Demo покриває ці пункти: версію, збірку й активацію Windows, зареєстровані антивіруси та автозапуск (а ще USB-історію і профілі брандмауера).',
  },
  // ── MYTH / EXPLANATION ──
  {
    id: 'av-blind-spots', format: 'myth', module: null, keywords: ['антивірус не', 'що антивірус'],
    topic: 'Антивірус відповідає не на всі питання',
    steps: [
      'Диспетчер завдань (Ctrl+Shift+Esc) → розділ автозавантаження',
    ],
    limits: 'Не стверджувати, що антивірус гірший чи зайвий: він робить своє, а питання про автозапуск, завдання й USB — окрема перевірка.',
    demoCovers: 'Demo показує і автозапуск, і заплановані завдання, і USB-накопичувачі, які пам\'ятає Windows, разом зі станом Defender; це швидка перевірка, а не заміна антивіруса.',
  },
  {
    id: 'defender-history', format: 'myth', module: null, keywords: ['історія виявлень', 'виявлен'],
    topic: 'Виявлення в історії Defender — не завжди загроза зараз',
    steps: [
      'Get-MpThreatDetection | Select-Object -First 5 InitialDetectionTime, ThreatID',
      'Безпека Windows → Захист від вірусів і загроз → Журнал захисту',
    ],
    limits: 'За самою історією не визначити, чи загрозу видалено; поточний стан дивіться в розділі «Журнал захисту» і результатами сканування.',
    demoCovers: 'Demo показує історію виявлень Defender лише довідково (дати минулих виявлень, а не чи загроза активна зараз) і не піднімає через неї тривогу.',
  },
  {
    id: 'unknown-not-clean', format: 'myth', module: null, keywords: ['не вдалося', 'journal', 'журнал'],
    topic: '«Не вдалося перевірити» — теж результат',
    steps: [
      'Get-WinEvent -LogName Security -MaxEvents 1   (без прав адміністратора завершиться помилкою доступу)',
    ],
    limits: 'Помилка доступу ≠ порожній журнал. Не робити висновків про вміст журналу з самої помилки.',
    demoCovers: 'Demo так і працює: те, що без прав адміністратора визначити неможливо, показує як «НЕ ВДАЛОСЯ ВИЗНАЧИТИ» з причиною, а не як «все гаразд».',
  },
  // ── TOOL / DEMO ──
  {
    id: 'demo-four-areas', format: 'tool', module: null, keywords: ['demo', 'auditshield'],
    topic: 'Що перевіряє безкоштовне Demo',
    steps: [],
    limits: 'Demo — це швидка перевірка чотирьох областей, а не повний аудит.',
    demoCovers: 'Усе з блоку підтверджених фактів про Demo.',
  },
]

export const ANGLE_BY_ID = Object.fromEntries(ANGLES.map(a => [a.id, a]))
