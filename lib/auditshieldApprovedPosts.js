// Бібліотека заздалегідь написаних постів AuditShield для Telegram. Під час cron нічого не генерується: autopost лише вибирає
// наступний ЗАТВЕРДЖЕНИЙ пост звідси (lib/auditshieldPost.js → selectApprovedPost) і додає CTA та посилання з атрибуцією кодом.
//
// Запис: id (asp###, він же content id атрибуції a1_tc_auditshield_asp###), format, angle (id з auditshieldAngles.js: звідти
// беруться перевірені команди і теми), topic, body, cta_variant (індекс CTA_VARIANTS), approved_version, approved_sha.
//
// ЗАТВЕРДЖЕННЯ: пост публікується лише коли approved_version непорожній І approved_sha збігається з bodyHash(body).
// Кандидат має обидва поля null і ніколи не виходить у канал. Правка тексту без нового затвердження блокує пост (approved_sha_mismatch).
//   Узяти хеш: node --import ./tests/helpers/register-hooks.mjs -e "import('./lib/auditshieldPost.js').then(m=>console.log(m.bodyHash(<текст>)))"
// ВИЧЕРПАННЯ: опублікований id більше не використовується; коли всі затверджені пости вийшли, autopost пише auditshield_library_exhausted
// і публікує звичайний пост. Нова партія = нові записи з новими id і новим approved_version (старі не перезапускаються).
//
// Правила тексту (перевіряє validateApprovedPost): HOOK з одним емодзі → VALUE → CONTEXT/обмеження → SOFT BRIDGE з AuditShield
// (одне коротке речення); до 1100 символів (чеклист до 1400); не більше 1 команди (чеклист до 3); команди лише з реєстру кутів;
// без страшилок, «піратської Windows», сторонніх брендів, абсолютних тверджень про мережу чи приватність, цін і «22 модулів».

const fence = cmd => '```\n' + cmd + '\n```'
const text = (...paragraphs) => paragraphs.join('\n\n')

const CMD = {
  startup: 'Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location',
  usb: 'Get-ChildItem \'HKLM:\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR\' | ForEach-Object { Get-ChildItem $_.PSPath } | Get-ItemProperty | Select-Object FriendlyName',
  tempProcs: String.raw`Get-Process | Where-Object { $_.Path -match '\\(Temp|Downloads)\\' } | Select-Object Name, Id, Path`,
  defender: 'Get-MpComputerStatus | Select-Object AntivirusEnabled, RealTimeProtectionEnabled, AntivirusSignatureLastUpdated',
  tasks: 'Get-ScheduledTask | Where-Object { $_.State -ne \'Disabled\' -and $_.TaskPath -notlike \'\\Microsoft\\*\' } | Select-Object TaskName, TaskPath',
  firewall: 'Get-NetFirewallProfile | Select-Object Name, Enabled',
  memory: 'Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 8 Name, Id, @{n=\'MB\';e={[int]($_.WorkingSet/1MB)}}',
  os: 'Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, BuildNumber',
  av: 'Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntiVirusProduct | Select-Object displayName',
  threats: 'Get-MpThreatDetection | Select-Object -First 5 InitialDetectionTime, ThreatID',
  secLog: 'Get-WinEvent -LogName Security -MaxEvents 1',
}

export const APPROVED_POSTS = [
  {
    id: 'asp001', format: 'diagnostic', angle: 'startup-unknown', topic: 'Скільки програм стартує разом із Windows', cta_variant: 0,
    approved_version: null, approved_sha: null,
    body: text(
      '🚀 Скільки програм запускається разом із Windows, щойно ви вмикаєте ПК? Багато хто не знає, а це впливає і на швидкість завантаження, і на те, що працює у фоні.',
      'Найпростіше глянути в Диспетчері завдань (Ctrl+Shift+Esc), у розділі автозавантаження: там видно назви, стан і вплив кожної програми на запуск.',
      'Щоб побачити, звідки саме береться запис, є команда в PowerShell:',
      fence(CMD.startup),
      'У колонці Command — файл, який стартує. Незнайома назва ще не вирок: спершу з\'ясуйте, що це за програма. Команда показує реєстр і папки автозапуску; заплановані завдання — окремий список.',
      'Автозапуск разом із запланованими завданнями не від Microsoft AuditShield Demo збирає в один звіт.',
    ),
  },
  {
    id: 'asp002', format: 'quick', angle: 'defender-status', topic: 'Чи працює захист Windows і чи свіжі бази', cta_variant: 1,
    approved_version: null, approved_sha: null,
    body: text(
      '🛡 Чи справді працює захист Windows? Це можна перевірити однією командою в PowerShell, права адміністратора не потрібні.',
      fence(CMD.defender),
      'AntivirusEnabled і RealTimeProtectionEnabled мають показувати True: антивірус увімкнено й перевіряє файли в реальному часі. AntivirusSignatureLastUpdated — коли востаннє оновлювалися бази; якщо там дата багатотижневої давнини, відкрийте Безпеку Windows і перевірте оновлення.',
      'Стоїть сторонній антивірус? Тоді значення Defender можуть відрізнятися, і це нормально: стан захисту дивіться вже в налаштуваннях того антивіруса.',
      'Стан Defender і зареєстровані антивіруси AuditShield Demo показує разом з іншими областями.',
    ),
  },
  {
    id: 'asp003', format: 'myth', angle: 'av-blind-spots', topic: 'Антивірус відповідає не на всі питання', cta_variant: 3,
    approved_version: null, approved_sha: null,
    body: text(
      '🧩 «У мене стоїть антивірус, тож перевіряти нічого не треба». Звучить логічно, але антивірус насамперед відповідає на одне питання: чи є на ПК шкідливий файл.',
      'Це його робота, і він її виконує. А от що запускається разом із Windows, які завдання працюють за розкладом і які USB-накопичувачі колись підключали — це вже інші питання.',
      'Тому раз на кілька місяців варто глянути на це самому. Почніть із Диспетчера завдань (Ctrl+Shift+Esc), розділ автозавантаження: незнайомий запис — привід з\'ясувати, що це, а не видаляти все підряд.',
      'Усі три речі разом AuditShield Demo показує як доповнення до антивіруса, а не його заміну.',
    ),
  },
  {
    id: 'asp004', format: 'checklist', angle: 'odd-activity-3', topic: 'Три перевірки, коли ПК раптом став повільним', cta_variant: 2,
    approved_version: null, approved_sha: null,
    body: text(
      '🧐 ПК раптом став повільним, а що змінилося — незрозуміло? Три перевірки на п\'ять хвилин допоможуть зібрати факти, перш ніж щось видаляти.',
      '1. Що займає пам\'ять. Вісім найбільших процесів, з ідентифікатором і розміром у мегабайтах:',
      fence(CMD.memory),
      '2. Що стартує разом із Windows: Диспетчер завдань (Ctrl+Shift+Esc) → розділ автозавантаження. Зайве можна вимкнути прямо там.',
      '3. Чи працює захист: Безпека Windows → Захист від вірусів і загроз. Там видно, чи ввімкнено захист і коли оновлювалися бази.',
      'Великий браузер угорі списку — звичайна річ. Жоден пункт сам нічого не доводить: мета — побачити картину, а не шукати винного.',
      'Автозапуск і стан Defender AuditShield Demo перевіряє за один запуск.',
    ),
  },
  {
    id: 'asp005', format: 'diagnostic', angle: 'usb-memory', topic: 'USB-накопичувачі, які пам\'ятає Windows', cta_variant: 0,
    approved_version: null, approved_sha: null,
    body: text(
      '🔌 Windows запам\'ятовує USB-накопичувачі, які колись підключали, навіть якщо самої флешки давно немає поруч. Це корисно знати, коли ПК побував у сервісі чи в чужих руках.',
      'Назви таких пристроїв покаже одна команда в PowerShell, права адміністратора не потрібні:',
      fence(CMD.usb),
      'У списку — флешки й зовнішні диски, які Windows бачила хоч раз. Це історія підключень, а не вміст копіювання. Точні дати цією командою без прав адміністратора не побачити.',
      'Ця історія є й серед чотирьох областей AuditShield Demo, де серійні номери накопичувачів у звіті приховані.',
    ),
  },
  {
    id: 'asp006', format: 'quick', angle: 'task-sched-nonms', topic: 'Заплановані завдання поза Microsoft', cta_variant: 1,
    approved_version: null, approved_sha: null,
    body: text(
      '⏰ Програма може запускатися щоразу, коли ви вмикаєте Windows, і не бути в автозавантаженні: для цього існують заплановані завдання.',
      'Активні завдання поза папкою Microsoft покаже одна команда в PowerShell:',
      fence(CMD.tasks),
      'TaskName — назва завдання, TaskPath — де воно лежить у Планувальнику. Часто це оновлювачі програм і драйверів, тож саме завдання проблемою не є. Але якщо назва зовсім незнайома, з\'ясуйте, звідки вона взялася.',
      'Ці завдання AuditShield Demo показує разом із записами автозапуску.',
    ),
  },
  {
    id: 'asp007', format: 'myth', angle: 'defender-history', topic: 'Запис в історії Defender — не завжди загроза зараз', cta_variant: 3,
    approved_version: null, approved_sha: null,
    body: text(
      '📜 Побачили в журналі Defender запис про виявлення й одразу подумали, що загроза досі на ПК? Журнал показує, що колись було виявлено, а не що є зараз.',
      'Історія зберігає записи і про вже усунуті загрози. Тож запис у ній — це довідка про минуле, а не діагноз на сьогодні.',
      'Подивитись останні записи можна командою в PowerShell:',
      fence(CMD.threats),
      'Те саме є в інтерфейсі: Безпека Windows → Захист від вірусів і загроз → Журнал захисту. Там зазвичай видно й дію, яку виконано. Чи загроза активна зараз, за самим записом не визначити — для цього дивіться результат останнього сканування.',
      'AuditShield Demo теж показує історію виявлень Defender лише довідково й не піднімає через неї тривогу.',
    ),
  },
  {
    id: 'asp008', format: 'checklist', angle: 'used-pc-3', topic: 'Три перевірки вживаного ноутбука або ПК після ремонту', cta_variant: 2,
    approved_version: null, approved_sha: null,
    body: text(
      '🛒 Купили вживаний ноутбук або забрали ПК із ремонту? Перш ніж ставити свої програми, огляньте три речі в PowerShell, це кілька хвилин.',
      '1. Яка Windows і яка збірка (порівняйте з тим, що вам обіцяли):',
      fence(CMD.os),
      '2. Які антивіруси зареєстровані в системі:',
      fence(CMD.av),
      'Порожній список означає, що Windows не бачить жодної зареєстрованої захисної програми. Кілька антивірусів одночасно — привід розібратися.',
      '3. Що запускається разом із Windows:',
      fence(CMD.startup),
      'Незнайомий запис — привід спитати продавця чи майстра, а не доказ чогось поганого. Це швидкий огляд, а не повний аудит.',
      'Ці пункти, а ще USB-історію й профілі брандмауера, AuditShield Demo перевіряє за один запуск.',
    ),
  },
  {
    id: 'asp009', format: 'tool', angle: 'demo-four-areas', topic: 'Що перевіряє безкоштовне Demo', cta_variant: 0,
    approved_version: null, approved_sha: null,
    body: text(
      '🧰 Автозапуск, USB-історію чи стан Defender можна подивитись вручну, кожне окремо. Якщо хочеться побачити все за один раз, є безкоштовний AuditShield Demo.',
      'Він перевіряє чотири області: стан Windows і захисту, те, що запускається разом із Windows, USB-пристрої, які пам\'ятає система, і швидкі ознаки підозрілих слідів.',
      'Demo запускається у звичайному вікні PowerShell без прав адміністратора й лише читає дані. Звіт створюється локально на вашому ПК у двох форматах: HTML і Excel.',
      'Чого він не робить: це не антивірус і не повний аудит. Там, де без прав адміністратора щось не визначити, у звіті буде «НЕ ВДАЛОСЯ ВИЗНАЧИТИ» з причиною, а не «все гаразд». Мережу, служби й облікові записи перевіряє вже повна версія.',
      'Demo надсилає бот AuditShield: файл і однорядкова команда запуску, яка перевіряє контрольну суму файлу.',
    ),
  },
  {
    id: 'asp010', format: 'diagnostic', angle: 'process-locations', topic: 'Процеси, що працюють з Temp або Downloads', cta_variant: 1,
    approved_version: null, approved_sha: null,
    body: text(
      '🗂 Звичайні програми зазвичай встановлені в Program Files, а не запускаються з тимчасової папки чи із завантажень. Тому погляд на те, звідки зараз працюють процеси, може дещо підказати.',
      'Одна команда в PowerShell покаже процеси, шлях яких проходить через Temp або Downloads:',
      fence(CMD.tempProcs),
      'Порожній результат — гарний сценарій. Якщо щось знайшлося, не поспішайте з висновками: інсталятори й портативні програми інколи працюють із завантажень цілком легітимно. Щоб подивитись, що це, у Диспетчері завдань клацніть процес правою кнопкою й виберіть «Відкрити розташування файлу».',
      'Для деяких системних процесів поле Path без прав адміністратора порожнє, і це нормально.',
      'Запуск із тимчасових папок і завантажень входить до швидких ознак, які перевіряє AuditShield Demo.',
    ),
  },
  {
    id: 'asp011', format: 'quick', angle: 'firewall-profiles', topic: 'Три профілі брандмауера Windows', cta_variant: 3,
    approved_version: null, approved_sha: null,
    body: text(
      '🔥 У брандмауера Windows три профілі мережі, і в кожного свій стан. Чи ввімкнено кожен із них, покаже одна команда в PowerShell:',
      fence(CMD.firewall),
      'У колонці Name побачите Domain, Private і Public, а в Enabled — True або False. Private — для довірених мереж, як домашня, Public — для публічних, як у кафе, Domain — для ПК, підключеного до корпоративного домену.',
      'False означає лише, що в цьому профілі брандмауер Windows вимкнено. Причин може бути кілька, і саме це значення вердикту не дає. Які правила дозволяють підключення, команда не перевіряє.',
      'Стан профілів брандмауера, без аналізу правил, AuditShield Demo показує разом з іншими показниками захисту Windows.',
    ),
  },
  {
    id: 'asp012', format: 'myth', angle: 'unknown-not-clean', topic: '«Не вдалося перевірити» — теж результат', cta_variant: 0,
    approved_version: null, approved_sha: null,
    body: text(
      '🔍 Перевірка, яка не змогла щось прочитати, — не те саме, що перевірка, яка нічого не знайшла. Різницю легко побачити самому.',
      'Журнал безпеки Windows без прав адміністратора не читається. Спробуйте в звичайному вікні PowerShell:',
      fence(CMD.secLog),
      'Ви побачите помилку доступу, і це нормально. Вона не означає, що журнал порожній, лише те, що вам не дозволено його прочитати. Висновків про вміст із самої помилки робити не можна. (Якщо PowerShell запущено від адміністратора, запис прочитається, тому тут потрібне звичайне вікно.)',
      'Так само й будь-яка перевірка має казати «не вдалося визначити» там, де їй бракує прав, а не «все гаразд».',
      'AuditShield Demo так і працює: те, що без прав адміністратора не визначити, у звіті позначено «НЕ ВДАЛОСЯ ВИЗНАЧИТИ» з причиною.',
    ),
  },
]
