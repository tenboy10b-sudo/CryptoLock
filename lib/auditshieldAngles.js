// Реєстр форматів, кутів (angles) і перевірених фактів для Telegram-постів про AuditShield.
// Це ЄДИНЕ джерело того, що пост може стверджувати і які команди може радити:
//  - `steps` — команди/шляхи Windows, перевірені 2026-10-26 у Windows PowerShell 5.1 без прав адміністратора;
//  - `demoCovers` — що Demo справді перевіряє за цією темою (demo/demo_manifest.json у security-audit-private): місток до Demo
//    не може обіцяти більше;
//  - VERIFIED_FACTS — твердження про Demo/Full, звірені з demo/README.md, demo_manifest.json і PROJECT_STATE.md;
//  - FORBIDDEN_CLAIMS — те, що пост не має права казати (частково дублюється валідатором у auditshieldPost.js).
// Нових тверджень про продукт тут не вигадувати: змінювати лише після звірки з поточною реалізацією.

export const FORMATS = ['diagnostic', 'quick', 'checklist', 'myth', 'tool']

// Детермінований цикл форматів за номером AuditShield-поста: «Tool/Demo» — найпрямніший, тому раз на 9.
export const FORMAT_CYCLE = ['diagnostic', 'quick', 'checklist', 'myth', 'diagnostic', 'quick', 'checklist', 'myth', 'tool']

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

export const FORBIDDEN_CLAIMS = [
  'Не називати «22 модулі» (їх 24 у повній версії, 4 області в Demo).',
  'Не писати, що «нічого/жодних даних не передається» для повної версії: її запуск використовує сервер (ліцензія і модуль).',
  'Не обіцяти захист, безпеку, виявлення «всіх» загроз чи вірусів, не порівнювати з антивірусом як з гіршим.',
  'Не давати оцінок у балах/відсотках, «рівня ризику», не лякати («вас зламали», «дані вже крадуть»), не створювати терміновість.',
  'Не називати ціни, тарифи, не закликати купувати; основний шлях — безкоштовне Demo.',
  'Про Demo казати лише те, що сказано в блоці «Що Demo справді перевіряє по цій темі»; не приписувати Demo перевірок, яких там немає.',
]

// module — точна назва з PROMO_MODULES (autopost.js), щоб не збігатись по темі з самостійним постом цього ж слота;
// keywords — слова (нижній регістр) для звірки з останніми темами extra-постів і заголовком останньої статті.
// id ≤ 17 символів [a-z0-9-]: content-id = as<номер 4 цифри>-<id> має вміститись у 24 символи схеми a1.
export const ANGLES = [
  // ── DIAGNOSTIC CASE ──
  {
    id: 'startup-unknown', format: 'diagnostic', module: 'Автозапуск', keywords: ['автозапуск', 'автозавантаж', 'startup'],
    topic: 'Що запускається разом із Windows',
    brief: 'Користувач зазвичай не перевіряє, які програми стартують разом із Windows, а саме це впливає і на швидкість, і на те, що працює на ПК без його відома. Дай 3 способи подивитись вручну.',
    steps: [
      'Диспетчер завдань (Ctrl+Shift+Esc) → розділ автозавантаження',
      'Параметри → Програми → Автозавантаження',
      'Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location',
    ],
    limits: 'Команда показує записи автозапуску з реєстру й папки «Автозавантаження»; заплановані завдання і служби вона не охоплює.',
    demoCovers: 'Demo показує записи автозапуску (Run/RunOnce, папки автозапуску) та активні заплановані завдання не від Microsoft.',
  },
  {
    id: 'usb-memory', format: 'diagnostic', module: 'USB-історія', keywords: ['usb', 'флеш'],
    topic: 'USB-накопичувачі, які пам\'ятає Windows',
    brief: 'Windows запам\'ятовує USB-накопичувачі, які колись підключали, навіть якщо флешки вже давно немає. Покажи, як побачити назви таких пристроїв, і чому це корисно після сервісу чи чужого доступу до ПК.',
    steps: [
      'Get-ChildItem \'HKLM:\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR\' | ForEach-Object { Get-ChildItem $_.PSPath } | Get-ItemProperty | Select-Object FriendlyName',
    ],
    limits: 'Команда без прав адміністратора показує лише назви пристроїв; точні дати підключень у такий спосіб не побачити — це чесне обмеження.',
    demoCovers: 'Demo показує USB-накопичувачі, які Windows зберегла в реєстрі (це історія підключень, а не вміст копіювання); серійні номери у звіті приховані, видно лише останні 4 символи.',
  },
  {
    id: 'memory-hogs', format: 'diagnostic', module: 'Запущені процеси', keywords: ['процес', 'диспетчер завдань'],
    topic: 'Які процеси займають пам\'ять',
    brief: 'ПК гальмує або вентилятор шумить — а користувач не знає, що саме працює. Дай спосіб подивитись найбільші процеси й пояснити, що назва процесу ще нічого не доводить.',
    steps: [
      'Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 8 Name, Id, @{n=\'MB\';e={[int]($_.WorkingSet/1MB)}}',
      'Диспетчер завдань → правий клік на процесі → «Відкрити розташування файлу»',
    ],
    limits: 'Назва процесу сама по собі не доводить, що він безпечний чи небезпечний; потрібен шлях до файлу і розуміння, що це за програма.',
    demoCovers: 'Для процесів Demo дає лише швидкі ознаки за шляхом і командним рядком; це швидка перевірка, а не пошук вірусів і не рейтинг за пам\'яттю.',
  },
  {
    id: 'process-locations', format: 'diagnostic', module: 'Запущені процеси', keywords: ['temp', 'downloads', 'завантаження'],
    topic: 'Програми, що працюють із тимчасових папок і завантажень',
    brief: 'Звичайні програми живуть у Program Files, а не в Temp чи Downloads. Покажи, як швидко побачити, чи не працює щось зараз просто з папки завантажень або тимчасової папки — і чому це лише привід придивитись, а не вирок.',
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
    brief: 'Одна команда, яка показує, чи ввімкнено захист у реальному часі і коли оновлювались бази.',
    steps: [
      'Get-MpComputerStatus | Select-Object AntivirusEnabled, RealTimeProtectionEnabled, AntivirusSignatureLastUpdated',
      'Безпека Windows → Захист від вірусів і загроз',
    ],
    limits: 'Якщо встановлено сторонній антивірус, значення Defender можуть відрізнятися — це нормально.',
    demoCovers: 'Demo показує стан Defender та зареєстровані антивіруси (виключення Defender потребують прав адміністратора) разом з іншими областями.',
  },
  {
    id: 'av-registered', format: 'quick', module: 'Антивірусний захист', keywords: ['зареєстрован', 'securitycenter'],
    topic: 'Які антивіруси зареєстровані в Windows',
    brief: 'Іноді на ПК одночасно «живуть» кілька антивірусів або жодного, а користувач про це не знає. Одна команда показує, які захисні програми зареєстровані в Центрі безпеки Windows.',
    steps: [
      'Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntiVirusProduct | Select-Object displayName',
    ],
    limits: 'Команда показує лише те, що програми самі зареєстрували в Windows, і не доводить, що вони працюють; кілька постійно активних антивірусів одночасно — привід розібратися.',
    demoCovers: 'Demo показує стан Defender та зареєстровані антивіруси разом з іншими областями.',
  },
  {
    id: 'task-sched-nonms', format: 'quick', module: 'Планувальник завдань', keywords: ['планувальник', 'scheduled', 'завдан'],
    topic: 'Заплановані завдання не від Microsoft',
    brief: 'Програми можуть планувати свої запуски, не потрапляючи в автозавантаження. Одна команда показує активні завдання поза папкою Microsoft.',
    steps: [
      'Get-ScheduledTask | Where-Object { $_.State -ne \'Disabled\' -and $_.TaskPath -notlike \'\\Microsoft\\*\' } | Select-Object TaskName, TaskPath',
    ],
    limits: 'Більшість записів — це оновлювачі браузерів, драйверів і програм; на незнайомі назви варто просто звернути увагу.',
    demoCovers: 'Demo показує активні заплановані завдання не від Microsoft разом із записами автозапуску.',
  },
  {
    id: 'firewall-profiles', format: 'quick', module: 'Брандмауер Windows', keywords: ['брандмауер', 'firewall'],
    topic: 'Чи ввімкнено брандмауер у всіх профілях',
    brief: 'Брандмауер Windows має три профілі мережі. Одна команда показує, чи ввімкнено кожен.',
    steps: [
      'Get-NetFirewallProfile | Select-Object Name, Enabled',
    ],
    limits: 'Ця команда показує лише увімкнено чи вимкнено профіль; які правила дозволяють підключення, вона не перевіряє.',
    demoCovers: 'Demo показує лише стан профілів брандмауера, без аналізу правил, разом з іншими показниками захисту Windows.',
  },
  // ── CHECKLIST ──
  {
    id: 'odd-activity-5', format: 'checklist', module: null, keywords: ['підозр', 'дивн', 'гальмує'],
    topic: '5 перевірок, коли ПК поводиться дивно',
    brief: 'Чеклист із 5 пунктів для ситуації «щось змінилось, а що — незрозуміло»: найбільші процеси, програми з Temp і Downloads, автозапуск, заплановані завдання, стан Defender. Без паніки.',
    steps: [
      'Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 8 Name, Id, @{n=\'MB\';e={[int]($_.WorkingSet/1MB)}}',
      String.raw`Get-Process | Where-Object { $_.Path -match '\\(Temp|Downloads)\\' } | Select-Object Name, Id, Path`,
      'Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location',
      'Get-ScheduledTask | Where-Object { $_.State -ne \'Disabled\' -and $_.TaskPath -notlike \'\\Microsoft\\*\' } | Select-Object TaskName, TaskPath',
      'Get-MpComputerStatus | Select-Object AntivirusEnabled, RealTimeProtectionEnabled, AntivirusSignatureLastUpdated',
    ],
    limits: 'Жоден окремий пункт не є вироком: це спосіб зібрати факти, перш ніж робити висновки.',
    demoCovers: 'Demo за один запуск дивиться на процеси (швидкі ознаки), автозапуск і заплановані завдання, стан Defender; перші пункти за пам\'яттю Demo не рахує.',
  },
  {
    id: 'used-pc-5', format: 'checklist', module: null, keywords: ['вживан', 'купівл', 'second'],
    topic: '5 перевірок вживаного ПК або ноутбука',
    brief: 'Чеклист із 5 пунктів для комп\'ютера, який ви купили вживаним або отримали після ремонту: версія Windows, зареєстровані антивіруси, брандмауер, USB-історія, автозапуск.',
    steps: [
      'Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, BuildNumber',
      'Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntiVirusProduct | Select-Object displayName',
      'Get-NetFirewallProfile | Select-Object Name, Enabled',
      'Get-ChildItem \'HKLM:\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR\' | ForEach-Object { Get-ChildItem $_.PSPath } | Get-ItemProperty | Select-Object FriendlyName',
      'Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location',
    ],
    limits: 'Це швидкий огляд, а не повний аудит; незнайомий запис — привід розпитати продавця або майстра, а не доказ чогось поганого.',
    demoCovers: 'Demo покриває всі п\'ять пунктів: версію, збірку й активацію Windows, зареєстровані антивіруси, стан профілів брандмауера, USB-історію та автозапуск.',
  },
  {
    id: 'monthly-5', format: 'checklist', module: null, keywords: ['щомісяч', 'обслуговування'],
    topic: '5-хвилинний огляд ПК раз на місяць',
    brief: 'Чеклист із 5 пунктів для регулярного короткого огляду: Defender, останні оновлення, автозапуск, заплановані завдання, брандмауер. Подай як звичку, а не як тривогу.',
    steps: [
      'Get-MpComputerStatus | Select-Object AntivirusEnabled, RealTimeProtectionEnabled, AntivirusSignatureLastUpdated',
      'Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 3 HotFixID, InstalledOn',
      'Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location',
      'Get-ScheduledTask | Where-Object { $_.State -ne \'Disabled\' -and $_.TaskPath -notlike \'\\Microsoft\\*\' } | Select-Object TaskName, TaskPath',
      'Get-NetFirewallProfile | Select-Object Name, Enabled',
    ],
    limits: 'Get-HotFix показує не всі види оновлень (наприклад, не всі оновлення компонентів); це орієнтир, а не повний облік.',
    demoCovers: 'Demo покриває чотири з п\'яти пунктів (Defender, автозапуск, заплановані завдання, профілі брандмауера); оновлення Windows він не перевіряє.',
  },
  // ── MYTH / EXPLANATION ──
  {
    id: 'av-blind-spots', format: 'myth', module: null, keywords: ['антивірус не', 'що антивірус'],
    topic: 'Антивірус відповідає не на всі питання',
    brief: 'Антивірус відповідає на питання «чи є шкідливий файл», але не на «що запускається разом із Windows» та «які USB пам\'ятає система». Це не недолік антивіруса, а просто інші питання. Спокійне пояснення без страшилок і без протиставлення.',
    steps: [
      'Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location',
      'Get-ChildItem \'HKLM:\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR\' | ForEach-Object { Get-ChildItem $_.PSPath } | Get-ItemProperty | Select-Object FriendlyName',
    ],
    limits: 'Не стверджуй, що антивірус гірший чи зайвий; він робить своє, а ці питання — окрема перевірка.',
    demoCovers: 'Demo показує і автозапуск, і USB-накопичувачі, які пам\'ятає Windows, разом зі станом Defender; це швидка перевірка, а не заміна антивіруса.',
  },
  {
    id: 'defender-history', format: 'myth', module: null, keywords: ['історія виявлень', 'виявлен'],
    topic: 'Виявлення в історії Defender — не завжди загроза зараз',
    brief: 'Побачивши в історії Defender запис про виявлення, люди часто вирішують, що загроза досі на ПК. Але історія показує, що колись було виявлено, а не чи вона лишилась зараз. Спокійно поясни різницю й покажи, як подивитись історію.',
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
    brief: 'Якщо перевірка не має доступу, чесний результат — «не вдалося визначити», а не «все чисто». Покажи на прикладі: журнал безпеки Windows без прав адміністратора не читається, і це не означає, що в ньому порожньо.',
    steps: [
      'Get-WinEvent -LogName Security -MaxEvents 1   (без прав адміністратора завершиться помилкою доступу)',
    ],
    limits: 'Помилка доступу ≠ порожній журнал. Не роби висновків про вміст журналу з самої помилки.',
    demoCovers: 'Demo так і працює: те, що без прав адміністратора визначити неможливо, показує як «НЕ ВДАЛОСЯ ВИЗНАЧИТИ» з причиною, а не як «все гаразд».',
  },
  // ── TOOL / DEMO ──
  {
    id: 'demo-four-areas', format: 'tool', module: null, keywords: ['demo', 'auditshield'],
    topic: 'Що перевіряє безкоштовне Demo',
    brief: 'Прямо розкажи, що робить безкоштовний AuditShield Demo: чотири області перевірки, без прав адміністратора, лише читає, звіт локально. Спокійний пояснювальний тон, без обіцянок.',
    steps: [],
    limits: 'Demo — це швидка перевірка чотирьох областей, а не повний аудит.',
    demoCovers: 'Усе з блоку підтверджених фактів про Demo.',
  },
  {
    id: 'demo-reports', format: 'tool', module: null, keywords: ['demo', 'excel', 'звіт'],
    topic: 'Які звіти створює Demo',
    brief: 'Розкажи, що користувач отримує після Demo: HTML-звіт, що відкривається автоматично, і книгу Excel у тій самій папці; як це зручно (фільтри, таблиці).',
    steps: [],
    limits: 'Excel автоматично не відкривається; файли лежать у %LOCALAPPDATA%\\AuditShield_Demo\\.',
    demoCovers: 'Усе з блоку підтверджених фактів про Demo.',
  },
  {
    id: 'demo-vs-full', format: 'tool', module: null, keywords: ['demo', 'повна версія'],
    topic: 'Чим Demo відрізняється від повної версії',
    brief: 'Чесно порівняй: Demo — чотири області, безкоштовно, без прав адміністратора; повна версія — глибший аудит, 24 модулі, для найглибших перевірок рекомендовано запуск від імені адміністратора. Тему вартості не зачіпай.',
    steps: [],
    limits: 'Не стверджуй, що повна версія нічого не передає в мережу, і не обговорюй вартість.',
    demoCovers: 'Усе з блоку підтверджених фактів про Demo і про повну версію (24 модулі, HTML і Excel, локальні звіти).',
  },
]

export const ANGLE_BY_ID = Object.fromEntries(ANGLES.map(a => [a.id, a]))
