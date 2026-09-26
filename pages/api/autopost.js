// Автопостинг в Telegram — заміна content.yml/middle.yml/extra.yml/engage_*.yml/promo.yml
// Викликається зовнішнім cron (cron-job.org) замість GitHub Actions (заблоковано).
// GET /api/autopost?type=content|middle|extra|engage&secret=...  (type=promo — призупинено, no-op)
import { randomUUID } from 'crypto'
import { getAllPosts } from '../../lib/posts'

export const config = { maxDuration: 60 }

const SITE_URL = 'https://cryptolockua.com'
const LOCK_TTL_MS = 15 * 60 * 1000 // 15 хвилин — після цього лок вважається "мертвим" і може бути перезахоплений

// AuditShield-просування ПРИЗУПИНЕНО з 2026-09-26 (верифікований аудит продукту/безпеки).
// Список лишився лише як джерело ТЕМ для самостійних практичних постів (odd-day middle):
// у промпт потрапляють тільки `module` і `when`. `promo_index` збережено як лічильник
// ротації цих тем, щоб не вводити новий persistent state.
const PROMO_MODULES = [
  { module: 'USB-історія', what: 'Сканує реєстр Windows і витягує повну історію всіх USB-пристроїв що коли-небудь підключались. Навіть якщо флешку підключали рік тому — слід залишається.', shows: 'Назва і модель пристрою, серійний номер (VID/PID), дати першого і останнього підключення, кількість підключень, тип пристрою.', when: 'Після ремонту ПК, при підозрі що співробітник виносить дані, після того як хтось мав фізичний доступ до комп\'ютера.' },
  { module: 'Автозапуск', what: 'Перевіряє всі місця де програми можуть прописатись на автоматичний запуск разом з Windows.', shows: 'Назва програми, шлях до файлу, цифровий підпис, дата додавання, чи є програма легітимною.', when: 'Шкідливе ПЗ майже завжди прописується в автозапуск. Якщо там є незнайомі записи — це серйозний сигнал.' },
  { module: 'Запущені процеси', what: 'Аналізує всі процеси що зараз працюють в системі, перевіряє їх цифрові підписи і репутацію.', shows: 'Назва процесу, PID, використання CPU і RAM, шлях до файлу, цифровий підпис, виробник.', when: 'Шпигунське ПЗ і майнери криптовалюти ховаються серед звичайних процесів.' },
  { module: 'Мережеві підключення', what: 'Показує всі активні мережеві з\'єднання — які програми зараз передають або отримують дані.', shows: 'Локальний і віддалений IP, порт, назва процесу, статус з\'єднання, країна сервера.', when: 'Якщо якась програма постійно відправляє дані на невідомий сервер — це може бути витік даних.' },
  { module: 'Браузери та розширення', what: 'Перевіряє встановлені браузери, їх розширення і збережені дані.', shows: 'Список всіх розширень в Chrome/Firefox/Edge, їх дозволи, дата встановлення, підозрілі розширення.', when: 'Після зараження комп\'ютера, якщо браузер поводиться дивно або показує рекламу.' },
  { module: 'Планувальник завдань', what: 'Сканує всі заплановані задачі в Windows включаючи приховані.', shows: 'Назва задачі, розклад запуску, яку команду виконує, коли востаннє запускалась.', when: 'Шкідливе ПЗ часто ховається в планувальнику щоб перезапускатись після видалення.' },
  { module: 'Встановлені програми', what: 'Повний список всього встановленого ПЗ з датами встановлення включаючи приховані програми.', shows: 'Назва, версія, дата встановлення, виробник, розмір, шлях встановлення.', when: 'Після ремонту або коли хтось мав доступ до ПК.' },
  { module: 'Служби Windows', what: 'Аналізує всі системні служби — активні і зупинені.', shows: 'Назва служби, статус, тип запуску, обліковий запис, шлях до виконуваного файлу.', when: 'Незнайомі служби що запускаються автоматично — класична ознака зараження.' },
  { module: 'Відкриті порти', what: 'Перевіряє які мережеві порти відкриті і які програми їх слухають.', shows: 'Номер порту, протокол, програма що слухає, статус.', when: 'Зайві відкриті порти збільшують поверхню атаки.' },
  { module: 'Брандмауер Windows', what: 'Перевіряє правила брандмауера і підозрілі виключення.', shows: 'Список правил, дозволені програми, виключення, статус по профілях.', when: 'Шкідливе ПЗ часто додає себе у виключення брандмауера.' },
  { module: 'Оновлення Windows', what: 'Перевіряє які оновлення безпеки встановлені і які відсутні.', shows: 'Встановлені KB-оновлення, дати, відсутні критичні патчі.', when: 'Незакриті вразливості — найпоширеніший спосіб зламу систем.' },
  { module: 'Антивірусний захист', what: 'Перевіряє статус антивірусного захисту — чи активний, чи актуальні бази.', shows: 'Назва антивіруса, версія, дата оновлення баз, статус реального захисту.', when: 'Деякі шкідливі програми першим ділом вимикають антивірус.' },
  { module: 'Облікові записи користувачів', what: 'Показує всі локальні облікові записи включаючи приховані.', shows: 'Список всіх акаунтів, рівень прав, статус, дата останнього входу.', when: 'Несанкціоновані акаунти — ознака злому.' },
  { module: 'Спільні папки і мережевий доступ', what: 'Перевіряє які папки відкриті для доступу по мережі.', shows: 'Назва папки, шлях, права доступу, активні підключення.', when: 'Неправильні права доступу — головна причина витоку корпоративних даних.' },
  { module: 'Точки відновлення системи', what: 'Аналізує наявні точки відновлення Windows.', shows: 'Список точок відновлення, дати створення, розмір.', when: 'Віруси-шифрувальники видаляють точки відновлення перед шифруванням.' },
  { module: 'Журнал критичних помилок', what: 'Аналізує системний журнал і збирає критичні помилки за останні дні.', shows: 'Критичні події, помилки безпеки, збої служб, підозрілі входи.', when: 'Регулярні збої можуть вказувати на проблеми до того як вони стануть помітними.' },
  { module: 'Тимчасові файли і підозрілі директорії', what: 'Перевіряє тимчасові папки де може ховатись шкідливе ПЗ.', shows: 'Підозрілі файли в системних папках, виконувані файли в тимчасових директоріях.', when: 'Шкідливе ПЗ часто розпаковується з тимчасових папок.' },
  { module: 'Hosts файл', what: 'Перевіряє файл hosts на несанкціоновані зміни.', shows: 'Вміст hosts файлу, нестандартні записи, підозрілі перенаправлення.', when: 'Змінений hosts може перенаправляти трафік на шахрайські сайти.' },
  { module: 'Реєстр — ключі автозапуску', what: 'Глибоке сканування реєстру на підозрілі ключі автозапуску.', shows: 'Всі ключі реєстру пов\'язані з автозапуском, підозрілі значення, закодовані команди.', when: 'Просунуте шкідливе ПЗ ховається глибоко в реєстрі.' },
  { module: 'RDP та віддалений доступ', what: 'Перевіряє статус RDP і інших інструментів віддаленого доступу.', shows: 'Статус RDP, журнал підключень, IP адреси з яких підключались.', when: 'Несанкціонований віддалений доступ — одна з головних загроз для бізнесу.' },
  { module: 'BitLocker та шифрування дисків', what: 'Перевіряє статус шифрування дисків BitLocker.', shows: 'Статус шифрування по кожному диску, метод захисту, наявність ключа відновлення.', when: 'Без шифрування всі дані доступні при фізичному доступі до диска.' },
  { module: 'Цифрові підписи процесів', what: 'Перевіряє цифрові підписи всіх запущених процесів.', shows: 'Список процесів з підписами, виробник, непідписані процеси виділяються червоним.', when: 'Більшість шкідливого ПЗ не має підпису або підписане фейковими сертифікатами.' },
]

const ENGAGE_STYLES = [
  `ФОРМАТ: Особисте питання про звички.
Запитай підписників про їх особисті звички пов'язані з ПК — без варіантів відповіді, просто відкрите питання.
Тема: щось що всі роблять але ніколи не обговорюють вголос.
Приклади: скільки вкладок тримають відкритими, чи вимикають ПК на ніч, як називають файли, чи роблять бекапи.
Починай з короткого особистого спостереження або зізнання — "Помітив що більшість людей..." або "Є одна річ яку всі роблять але ніхто не визнає..."
Тон: розмовний, як у друга.`,
  `ФОРМАТ: Суперечка двох підходів — без правильної відповіді.
Опиши два протилежних підходи до однієї задачі в Windows або безпеці.
НЕ говори який правильний — просто опиши обидва і запитай яким користуються підписники.
Теми: перезавантажувати чи не перезавантажувати після оновлень, тримати ПК увімкненим чи вимикати, один браузер чи кілька, зберігати паролі в браузері чи ні.
Тон: нейтральний, підписники самі вирішують.`,
  `ФОРМАТ: Несподіване порівняння.
Порівняй щось технічне з повсякденним життям несподіваним чином.
Приклади: автозапуск Windows = люди які самі себе запросили на вечірку, кеш браузера = безлад на робочому столі, оновлення Windows = похід до лікаря.
Зроби це смішно і влучно — щоб людина впізнала себе.
В кінці одне просте питання або заклик поставити реакцію.
Тон: гумористичний, легкий.`,
  `ФОРМАТ: "А ти знав що..." — маловідомий факт.
Поділись одним конкретним маловідомим фактом про Windows або комп'ютери який справді здивує.
НЕ питай "чи знали ви" — просто розкажи факт як щось цікаве що дізнався сам.
Факт має бути перевіреним і конкретним — з цифрами або назвами.
В кінці — одне коротке питання або нічого.
Тон: як повідомлення другу в месенджері — коротко і без пафосу.`,
  `ФОРМАТ: Провальна ситуація — хто так робив?
Опиши типову помилку або ситуацію яку всі колись робили з ПК.
НЕ повчай — просто визнай що це поширено і запитай чи траплялось з підписниками.
Приклади: видалив важливий файл, не зробив бекап перед переінсталяцією, натиснув "нагадати пізніше" на оновленні 100 разів, встановив тулбар випадково.
Тон: самоіронічний, без осуду — "ми всі через це проходили".`,
  `ФОРМАТ: Швидке голосування без пояснень.
Задай одне дуже просте питання з двома варіантами — реакціями або в коментарях.
Питання має бути таким щоб відповісти можна за секунду без роздумів.
Приклади: світла чи темна тема?, трекпад чи миша?, SSD чи все ще HDD?, Windows 10 чи 11?
Ніяких вступів і пояснень — тільки питання і варіанти.
Тон: максимально коротко.`,
  `ФОРМАТ: Спостереження з реального життя.
Поділись коротким спостереженням або думкою про те як люди використовують комп'ютери в реальному житті.
Це має бути щось що всі бачили або відчували — в офісі, вдома, у знайомих.
НЕ давай порад — просто спостереження.
В кінці питання "чи помічали таке?" або нічого.
Тон: як запис в особистому блозі — щиро і без фільтрів.`,
  `ФОРМАТ: Топ без рейтингу.
Назви 3-5 речей з однієї теми — але не в форматі "топ найкращих", а як особистий список.
Теми: дратівливі речі в Windows, звички яких соромишся, програми які використовуєш щодня, гарячі клавіші які змінили life.
Оформи як короткий список без нумерації — через емодзі або тире.
В кінці запитай що додали б підписники.
Тон: особистий, неформальний.`,
  `ФОРМАТ: Міні-дискусія навколо новини.
Придумай або використай реальний факт про Windows, Microsoft або кібербезпеку і запитай думку підписників.
НЕ переказуй новину детально — одне-два речення суті і одразу питання.
Тон: як друг який щойно щось прочитав і хоче обговорити.`,
  `ФОРМАТ: Визнання або зізнання.
Напиши пост від першої особи — "Зізнаюсь що я досі..." або "Є одна річ яку я роблю неправильно..."
Тема має бути пов'язана з ПК або Windows і впізнаваною для більшості.
Мета — щоб підписники написали "я теж!" в коментарях.
Тон: щирий, без пафосу, з гумором над собою.`,
  `ФОРМАТ: Питання-пастка.
Задай питання яке здається простим але насправді має неочевидну відповідь.
Не розкривай відповідь одразу — нехай підписники відповідають в коментарях.
Приклади: "Що відбувається з файлом після видалення з кошика?", "Скільки паролів в середньому зберігається в браузері середньостатистичного користувача?", "Яка програма найчастіше є в автозапуску на зараженому ПК?"
Тон: цікавий, як загадка.`,
  `ФОРМАТ: До/Після без моралі.
Опиши як змінилось щось після того як людина дізналась або зробила щось пов'язане з ПК.
Формат: коротко "до" → коротко "після" → питання чи траплялось подібне.
Приклади: до того як дізнався про менеджер паролів / після, до першого вірусу / після, до SSD / після.
Тон: легкий, без повчань.`,
  `ФОРМАТ: Непопулярна думка.
Поділись думкою яка може не подобатись більшості але є в неї логіка.
Тема: щось пов'язане з Windows, безпекою або звичками користувачів ПК.
Починай з "Непопулярна думка:" або просто з твердження.
Приклади: "Більшість антивірусів — маркетинг", "Переінсталювати Windows — найкращий спосіб її оптимізувати", "Хмарне зберігання небезпечніше ніж флешка".
В кінці — запитай чи згодні.
Тон: впевнений але не агресивний.`,
  `ФОРМАТ: Порада яку ніхто не просив.
Напиши корисну але несподівану пораду про Windows або безпеку яку більшість людей ніколи не чули.
НЕ оформляй як "топ порад" — одна порада, конкретна, з поясненням чому вона важлива.
Починай нестандартно — не з "Сьогодні розповім..." а з самої порадки або з ситуації яка до неї веде.
Тон: як підказка від людини яка набила шишки.`,
  `ФОРМАТ: Що вибрати — дилема.
Постав підписників перед реальним вибором без правильної відповіді.
Обидва варіанти мають бути прийнятними — не "хороший vs поганий" а "зручний vs безпечний" або "швидко vs правильно".
Приклади: зберігати паролі в браузері (зручно) чи в менеджері паролів (безпечно), автооновлення увімкнено (безпечно) чи вимкнено (контроль), хмара (доступно звідусіль) чи локально (приватно).
Тон: без осуду обох варіантів.`,
  `ФОРМАТ: Ностальгія або порівняння з минулим.
Згадай щось з минулого Windows або комп'ютерного світу і порівняй з тим як є зараз.
Мета — викликати впізнавання і бажання поділитись своїм досвідом.
Приклади: дефрагментація диска, завантаження Windows XP, перші віруси на флешках, ICQ і MSN.
В кінці питання про досвід підписників.
Тон: тепла ностальгія, без занудства.`,
  `ФОРМАТ: Швидкий тест знань.
Задай одне технічне питання з конкретною числовою або фактичною відповіддю.
Підписники відповідають в коментарях — правильну відповідь дай через кілька годин або в наступному коментарі.
Питання має бути цікавим а не шкільним.
Приклади: "Скільки символів мінімум потрібно щоб пароль не зламали за рік?", "Яке розширення файлу найчастіше використовують для вірусів?", "Скільки оновлень безпеки Microsoft випускає щомісяця?"
Тон: як вікторина між друзями.`,
  `ФОРМАТ: Реакція на стереотип.
Візьми поширений стереотип або міф про комп'ютери і коротко відреагуй на нього.
НЕ читай лекцію — просто коротка реакція і питання чи зустрічали таке.
Приклади стереотипів: "Маки не підхоплюють віруси", "Більше оперативки = швидший ПК", "Платний антивірус = кращий захист", "Хакери ламають тільки великі компанії".
Тон: з легкою іронією але без зарозумілості.`,
  `ФОРМАТ: Відверте питання про безпеку.
Запитай підписників про щось особисте пов'язане з безпекою їх даних — без осуду будь-якої відповіді.
Питання має бути таким щоб навіть "неправильна" відповідь була нормальною.
Приклади: чи є у вас резервна копія важливих файлів прямо зараз, чи використовуєте один пароль для кількох сайтів, чи знаєте де зберігаються ваші паролі.
Тон: як анонімне опитування — без осуду.`,
  `ФОРМАТ: Мікроісторія без повчання.
Розкажи дуже коротку (3-4 речення) реальну або правдоподібну ситуацію пов'язану з ПК або безпекою.
Без моралі в кінці — просто ситуація і питання "а у вас таке було?"
Приклади: хтось загубив всі фото через зламаний диск, колега відкрив фішинговий лист, ПК почав гальмувати після встановлення "безкоштовної" програми.
Тон: як коротка розповідь в месенджері.`,
]

const EXTRA_STYLES = [
  `ФОРМАТ: Команда дня.
Напиши пост про одну конкретну корисну команду PowerShell або CMD для Windows.
Структура:
1. Емодзі + назва команди як заголовок
2. Що робить команда — одним реченням
3. Сама команда в форматі коду
4. Що побачиш в результаті
5. 1-2 практичні ситуації коли це корисно
Команди на вибір (вибери одну, не повторюй): перевірка диску, пошук великих файлів, очищення кешу DNS, перегляд відкритих портів, список запущених служб, інформація про систему, перевірка цілісності файлів Windows, список встановлених програм, мережева діагностика, управління автозапуском, перегляд збережених Wi-Fi паролів, очищення тимчасових файлів, перевірка стану батареї ноутбука, останні помилки в журналі подій, форматування флешки, перевірка версії й білда Windows, дерево запущених процесів, пошук файлів-дублікатів.
Тон: технічний але зрозумілий, як підказка від колеги.`,
  `ФОРМАТ: Маловідома фішка Windows.
Напиши пост про одну маловідому але дуже корисну функцію або трюк Windows.
Структура:
1. Емодзі + інтригуючий заголовок ("Мало хто знає що в Windows є...")
2. Опис фішки — що це і як працює
3. Як активувати або використати — покрокова інструкція (2-4 кроки)
4. Коли це реально рятує
Теми на вибір: God Mode, приховані налаштування через regedit, секретні гарячі клавіші, прихований калькулятор в PowerToys, нічний режим для очей, вбудований скріншотер, буфер обміну з історією, режим фокусування, вбудований Linux, таємні можливості диспетчера завдань, приховане меню Win+X, Windows Sandbox (ізольоване середовище), Snap Layouts для групування вікон, Snipping Tool із затримкою знімку, віртуальні робочі столи, вбудований запис відео Xbox Game Bar, PowerToys Awake (не давати ПК засинати).
Тон: як відкриття — "ти не повіриш що це вже є в Windows".`,
  `ФОРМАТ: Питання і відповідь.
Напиши пост у форматі відповіді на типове питання про Windows яке задають найчастіше.
Структура:
1. Питання як заголовок (наприклад "Чому Windows гальмує після оновлення?")
2. Коротка чесна відповідь — без води
3. Що конкретно зробити щоб вирішити — 3-4 кроки
4. Коли це не допомагає і що тоді
Питання на вибір: чому ПК гальмує, як прискорити завантаження, чому зникає місце на диску, як вимкнути рекламу в Windows 11, як прискорити інтернет, чому ПК не вимикається, як відновити видалені файли, чому ноутбук швидко розряджається, чому вентилятор гучно шумить, чому з'являється синій екран після сну, чому не працює Bluetooth, чому програми повільно відкриваються вперше.
Тон: прямий і практичний, без зайвих слів.`,
  `ФОРМАТ: Порівняння або вибір.
Напиши пост де порівнюєш два підходи або інструменти для Windows.
Структура:
1. Заголовок з порівнянням ("X vs Y — що краще?")
2. Коротко про кожен варіант
3. Коли використовувати перший і коли другий
4. Чіткий висновок — що рекомендуєш і чому
Теми: CMD vs PowerShell, Windows Defender vs сторонній антивірус, HDD vs SSD для системи, Windows 10 vs Windows 11, вбудований брандмауер vs сторонній, режим сну vs вимкнення, OneDrive vs локальне зберігання, менеджер паролів vs збереження в браузері, автооновлення увімкнено vs вимкнено, Windows Terminal vs стандартна консоль.
Тон: аналітичний, конкретний, без маркетингу.`,
  `ФОРМАТ: Чеклист або покроковий гайд.
Напиши пост у форматі короткого чеклисту для конкретної задачі в Windows.
Структура:
1. Заголовок — для чого цей чеклист
2. 5-7 пунктів з конкретними діями
3. Скільки часу займе
4. Що отримаєш в результаті
Теми: прискорення Windows за 10 хвилин, базова безпека нового ПК, що зробити після переінсталяції Windows, щомісячне обслуговування ПК, налаштування Windows для роботи вдома, підготовка ПК до продажу, чеклист перед великим оновленням Windows, налаштування нового ноутбука з нуля, безпека перед подорожжю з ноутбуком.
Тон: структурований, практичний, як інструкція.`,
  `ФОРМАТ: Розбір помилки або проблеми.
Напиши пост про одну конкретну поширену помилку або проблему Windows і як її вирішити.
Структура:
1. Назва помилки або симптом як заголовок
2. Чому це відбувається — коротко і зрозуміло
3. Рішення — від простого до складного (3-4 варіанти)
4. Як уникнути в майбутньому
Теми: синій екран смерті, повільне завантаження, проблеми з оновленням, проблеми з драйверами, Windows не активована, проблеми з Wi-Fi, завис диспетчер завдань, помилка активації ліцензії, чорний екран після входу, "недостатньо пам'яті", принтер не друкує, звук пропав після оновлення.
Тон: діагностичний, спокійний, без паніки.`,
]

// ── GitHub API (заміна git commit/push — Vercel functions не мають persistent git) ──
async function ghGetJson(owner, repo, path, token) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' },
  })
  if (!res.ok) throw new Error(`GitHub GET ${path} — ${res.status}`)
  const json = await res.json()
  const content = Buffer.from(json.content, 'base64').toString('utf-8')
  return { data: JSON.parse(content), sha: json.sha }
}

async function ghPutJson(owner, repo, path, token, data, sha, message) {
  const content = Buffer.from(JSON.stringify(data, null, 2), 'utf-8').toString('base64')
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, content, sha }),
  })
  if (!res.ok) throw new Error(`GitHub PUT ${path} — ${res.status}: ${await res.text()}`)
  return res.json()
}

// ── Claude / Telegram ──
async function generateText(apiKey, prompt, maxTokens) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
  })
  if (!res.ok) throw new Error(`Anthropic API — ${res.status}: ${await res.text()}`)
  const json = await res.json()
  return json.content[0].text
}

// Повертає { ok, messageId } замість простого boolean — message_id потрібен для
// фіналізації стану (крок 3 надійності), щоб знати що саме пішло в канал.
async function sendTelegram(token, channelId, text) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`
  let res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: channelId, text, parse_mode: 'Markdown' }),
  })
  if (res.ok) {
    const json = await res.json()
    return { ok: true, messageId: json.result?.message_id ?? null }
  }
  const errText = await res.text()
  if (errText.toLowerCase().includes("can't parse")) {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: channelId, text }),
    })
    if (res.ok) {
      const json = await res.json()
      return { ok: true, messageId: json.result?.message_id ?? null }
    }
    return { ok: false, messageId: null }
  }
  console.error('Telegram error', res.status, errText)
  return { ok: false, messageId: null }
}

// Справжнє інтерактивне опитування Telegram (тап-щоб-проголосувати, Telegram сам рахує голоси)
async function sendTelegramPoll(token, channelId, poll) {
  const url = `https://api.telegram.org/bot${token}/sendPoll`
  const body = {
    chat_id: channelId,
    question: poll.question.slice(0, 300),
    options: poll.options.slice(0, 10).map(o => o.slice(0, 100)),
    is_anonymous: true,
  }
  if (poll.isQuiz) {
    body.type = 'quiz'
    body.correct_option_id = poll.correctIndex ?? 0
    if (poll.explanation) body.explanation = poll.explanation.slice(0, 200)
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (res.ok) {
    const json = await res.json()
    return { ok: true, messageId: json.result?.message_id ?? null }
  }
  console.error('Telegram sendPoll error', res.status, await res.text())
  return { ok: false, messageId: null }
}

// ── Логування — ніколи не передавати сюди token/secret/повний payload ──
function log(event, fields = {}) {
  console.log(JSON.stringify({ event, ts: new Date().toISOString(), ...fields }))
}

// ── Lock + pending-outbox helpers (надійність проти паралельного виконання) ──
function isExpired(isoString) {
  return !isoString || new Date(isoString).getTime() < Date.now()
}

// Best-effort звільнення локу цим виконанням (після помилки генерації/pending-запису).
// Не кидає — якщо не вдалось, TTL все одно підхопить прострочений лок пізніше.
async function safeReleaseLock(owner, repo, token, executionId) {
  try {
    const { data: fresh, sha: freshSha } = await ghGetJson(owner, repo, 'published.json', token)
    if (fresh.lock && fresh.lock.execution_id === executionId) {
      await ghPutJson(owner, repo, 'published.json', token, { ...fresh, lock: null }, freshSha, `bot: release lock ${executionId}`)
      log('lock_released', { execution_id: executionId })
    }
  } catch (e) {
    log('lock_release_failed', { execution_id: executionId, error: String(e.message || e) })
  }
}

// Стилі ENGAGE, які структурно підходять під формат опитування (явний вибір з 2+ варіантів)
// — індекси відповідають позиції в масиві ENGAGE_STYLES вище
const POLL_STYLE_INDICES = new Set([1, 5, 14]) // суперечка двох підходів / швидке голосування / дилема
const QUIZ_STYLE_INDEX = 16 // швидкий тест знань — окремо, з правильною відповіддю

// Стилі, придатні для текстової (не-poll) сторони A/B-експерименту "Telegram Poll
// Experiment" (див. TELEGRAM POLL EXPERIMENT нижче) — усі ENGAGE_STYLES, окрім тих,
// що й так структурно є опитуванням/квізом (щоб B-варіант завжди був текстовим постом,
// а не випадково теж опитуванням).
const TEXT_ONLY_ENGAGE_STYLE_INDICES = ENGAGE_STYLES.map((_, i) => i)
  .filter(i => !POLL_STYLE_INDICES.has(i) && i !== QUIZ_STYLE_INDEX)

function promptPollJSON(style, isQuiz) {
  return `Ти адміністратор Telegram каналу про Windows і кібербезпеку (CryptoLock, @cryptolock888).
На основі цього формату посту — створи дані для інтерактивного опитування Telegram:

${style}

Поверни ТІЛЬКИ валідний JSON, без жодного тексту навколо, без markdown-обгортки, у форматі:
${isQuiz
  ? `{"question": "текст питання (до 200 символів)", "options": ["варіант 1", "варіант 2", "варіант 3", "варіант 4"], "correct_index": 0, "explanation": "коротке пояснення правильної відповіді (до 150 символів)"}`
  : `{"question": "текст питання (до 200 символів)", "options": ["варіант 1", "варіант 2"]}`}

Вимоги:
- Українська мова
- Питання коротке і конкретне, без емодзі на початку
- Варіанти відповіді — короткі (2-6 слів кожен)
- ${isQuiz ? '4 варіанти, correct_index — індекс правильного (0-3)' : '2-4 варіанти'}
- НЕ рекламуй жодних продуктів`
}

async function generatePollData(apiKey, style, isQuiz) {
  const raw = await generateText(apiKey, promptPollJSON(style, isQuiz), 400)
  const cleaned = raw.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim()
  const data = JSON.parse(cleaned)
  return {
    question: data.question,
    options: data.options,
    isQuiz,
    correctIndex: data.correct_index,
    explanation: data.explanation,
  }
}

// ── TELEGRAM POLL EXPERIMENT (14-day A/B: real poll vs normal engage text) ──
// Опитування на практичну Windows/безпека/адміністрування тему — НЕ загальний
// engage-стиль (ті лишаються для B-варіанту), і НЕ реклама/промо під виглядом опитування.
function promptPracticalPoll(recentTopics = []) {
  const avoidBlock = recentTopics.length
    ? `\n\nОстанні теми опитувань, які вже публікувались (НЕ бери ту саму тему і не перефразовуй її):\n${recentTopics.map(t => `- ${t}`).join('\n')}`
    : ''
  return `Ти адміністратор Telegram каналу CryptoLock (@cryptolock888) про Windows і кібербезпеку.
Створи дані для короткого практичного опитування Telegram на тему Windows, безпеки або адміністрування ПК.

Вимоги до теми:
- Конкретна практична звичка, налаштування або ситуація користувача Windows — не абстрактна
- НЕ клікбейт, НЕ формат "а ви знали що"
- НЕ реклама жодної статті чи продукту — опитування має самостійну цінність саме як питання
- Варіанти відповіді мають бути реальними, не однобокими

Поверни ТІЛЬКИ валідний JSON, без жодного тексту навколо, без markdown-обгортки:
{"question": "текст питання (до 200 символів)", "options": ["варіант 1", "варіант 2", "варіант 3"]}

Вимоги:
- Українська мова
- 2-4 варіанти відповіді, короткі (2-6 слів кожен)${avoidBlock}`
}

async function generatePracticalPoll(apiKey, recentTopics) {
  const raw = await generateText(apiKey, promptPracticalPoll(recentTopics), 300)
  const cleaned = raw.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim()
  const data = JSON.parse(cleaned)
  return { question: data.question, options: data.options, isQuiz: false }
}

// ── Генератори промптів (1:1 з bot.py) ──
function promptContent(article, includeLink) {
  let linkInstruction = ''
  if (includeLink) {
    const url = article.lang === 'en' ? `${SITE_URL}/en/${article.slug}` : `${SITE_URL}/${article.slug}`
    linkInstruction = `\n\nВ кінці посту додай рядок: 🔗 ${url}`
  }
  return `Ти адміністратор Telegram каналу про Windows і комп'ютерну безпеку.
Напиши короткий практичний пост для Telegram на основі цієї теми:
Заголовок: ${article.title}
Опис: ${article.description}
Вимоги:
- Пиши українською мовою
- Довжина: 150-250 слів
- Починай з емодзі + короткий заголовок
- Далі 3-5 конкретних порад або кроків
- Якщо доречно — коротка команда PowerShell або CMD
- В кінці 2-4 хештеги (#windows #безпека #tips)
- НЕ додавай посилань на статтю (крім якщо явно вказано)${linkInstruction}
Стиль: дружній, технічний, як від досвідченого системного адміністратора.`
}

function promptStandaloneTopic(m) {
  return `Ти досвідчений адміністратор Telegram каналу про Windows і кібербезпеку.
Канал CryptoLock (@cryptolock888) — практичні поради про Windows для українців.
Тема посту: ${m.module}
Коли це особливо важливо: ${m.when}
Напиши самостійний практичний пост: як користувач може сам перевірити це у Windows вбудованими засобами (Параметри, Диспетчер завдань, PowerShell, CMD, Перегляд подій тощо) і як зрозуміти результат.
Структура посту:
1. Емодзі + короткий заголовок
2. Що саме перевіряємо і навіщо
3. 3-5 конкретних кроків або команд (команди в окремих рядках)
4. На що звернути увагу в результаті — ознаки, що щось не так
5. Що робити, якщо знайшов підозрілий запис
Вимоги:
- Українська мова
- Довжина: 180-250 слів
- Конкретно і технічно, без води; без вигаданих персонажів і історій
- НЕ рекламуй жодних продуктів, сервісів чи ботів; без цін, демо, ліцензій, закликів щось купити чи спробувати, без посилань
- В кінці 2-3 хештеги (#windows #безпека #tips)`
}

function promptExtra(style, recentTopics = []) {
  const avoidBlock = recentTopics.length
    ? `\n\nОстанні теми, які вже публікувались у цьому форматі (НЕ бери ту саму тему і не перефразовуй її — обери інший пункт зі списку вище або іншу конкретну ситуацію):\n${recentTopics.map(t => `- ${t}`).join('\n')}`
    : ''
  return `Ти досвідчений адміністратор Telegram каналу про Windows і кібербезпеку.
Канал CryptoLock (@cryptolock888) — практичні поради про Windows для українців.

${style}

Загальні вимоги:
- Українська мова
- Довжина: 120-200 слів
- Конкретно і по ділу — без води
- Команди або кроки в окремих рядках для зручності
- В кінці 2-3 хештеги (#windows #tips #безпека або схожі)
- НЕ рекламуй жодних продуктів${avoidBlock}`
}

function promptEngage(style) {
  return `Ти адміністратор популярного Telegram каналу про Windows і кібербезпеку.
Канал називається CryptoLock (@cryptolock888).
Аудиторія: українці які користуються Windows — від звичайних користувачів до IT спеціалістів.

${style}

Загальні вимоги:
- Українська мова
- Довжина: 80-150 слів — коротко і влучно
- Живий розмовний тон — як пише жива людина, не бот
- Має викликати бажання відреагувати або написати коментар
- НЕ рекламуй жодних продуктів
- НЕ додавай хештегів

ЗАБОРОНЕНІ фрази і кліше — НІКОЛИ не використовуй:
- "Правда чи міф?" як заголовок
- "Голосуйте реакціями"
- "Цікаво побачити вашу думку"
- "Багато хто буде здивований"
- "Обіцяю" або "Гарантую"
- "Підписники" як звертання
- Будь-які варіації "Сьогодні поговоримо про..."
- Зайві P.S. в кінці
- Фрази типу "Це важливо знати кожному"
- Занадто формальні звертання

Пиши як жива людина — нерівномірно, з характером, іноді коротко і різко, іноді з деталлю. Уникай шаблонної структури.`
}

function pickNextArticle(articles, publishedSlugs) {
  let unpublished = articles.filter(a => !publishedSlugs.includes(a.slug))
  let resetHappened = false
  if (unpublished.length === 0) {
    resetHappened = true
    unpublished = articles
  }
  const article = unpublished[Math.floor(Math.random() * unpublished.length)]
  return { article, resetHappened }
}

function withDefaults(published) {
  return {
    ...published,
    published: published.published || [],
    count: published.count || 0,
    promo_index: published.promo_index || 0,
    engage_index: published.engage_index || 0,
    extra_index: published.extra_index || 0,
    extra_recent_topics: published.extra_recent_topics || [],
    lock: published.lock || null,
    pending: published.pending || null,
    // Telegram Poll Experiment (14-day A/B, middle-engage only): деталь у
    // generateForType(). engage_ab_index визначає чи наступний middle-engage —
    // A (poll) чи B (текст); parity зберігається лише через finalizeFields, як і
    // всі інші лічильники, тож збій/повтор циклу ніколи не просуває його двічі.
    engage_ab_index: published.engage_ab_index || 0,
    poll_recent_topics: published.poll_recent_topics || [],
  }
}

// Engage-контент: якщо стиль структурно є вибором з варіантів — реальне опитування Telegram,
// інакше — звичайний текстовий пост (як і раніше). Незмінна логіка стилів/промптів.
async function generateEngageContent(anthropicKey, idx) {
  const styleIdx = idx % ENGAGE_STYLES.length
  const style = ENGAGE_STYLES[styleIdx]
  if (styleIdx === QUIZ_STYLE_INDEX) {
    return { poll: await generatePollData(anthropicKey, style, true), styleIdx }
  }
  if (POLL_STYLE_INDICES.has(styleIdx)) {
    return { poll: await generatePollData(anthropicKey, style, false), styleIdx }
  }
  return { text: await generateText(anthropicKey, promptEngage(style), 400), styleIdx }
}

// Консолідує усі 5 гілок генерації контенту (незмінні промпти/стилі/вибір статті) в один
// уніфікований результат: { text, poll, identifier, finalizeFields, commitMsg }.
// finalizeFields — це саме той диф лічильників/дедуп-стану, який раніше писався одразу
// після відправки в Telegram; тепер він лише ОБЧИСЛЮЄТЬСЯ тут і застосовується окремим
// кроком фіналізації після підтвердженої відправки.
async function generateForType(type, published, anthropicKey) {
  if (type === 'middle') {
    const dayOfMonth = new Date().getUTCDate()
    if (dayOfMonth % 2 === 0) {
      // Telegram Poll Experiment: deterministic A/B — poll (A, even engage_ab_index)
      // alternates with the existing normal engage text post (B, odd). Only this
      // middle-engage branch changes; standalone type=engage below is untouched.
      const abIdx = published.engage_ab_index || 0
      const isPollTurn = abIdx % 2 === 0

      if (isPollTurn) {
        const recentTopics = published.poll_recent_topics || []
        const poll = await generatePracticalPoll(anthropicKey, recentTopics)
        return {
          text: undefined, poll,
          identifier: `engage-ab-poll:${abIdx}`,
          finalizeFields: {
            engage_ab_index: abIdx + 1,
            poll_recent_topics: [...recentTopics, poll.question].filter(Boolean).slice(-6),
          },
          commitMsg: 'bot: update published.json [middle-engage]',
        }
      }

      const idx = published.engage_index
      const styleIdx = TEXT_ONLY_ENGAGE_STYLE_INDICES[idx % TEXT_ONLY_ENGAGE_STYLE_INDICES.length]
      const text = await generateText(anthropicKey, promptEngage(ENGAGE_STYLES[styleIdx]), 400)
      return {
        text, poll: undefined,
        identifier: `engage-ab-text:${abIdx}:style-${styleIdx}`,
        finalizeFields: { engage_ab_index: abIdx + 1, engage_index: idx + 1 },
        commitMsg: 'bot: update published.json [middle-engage]',
      }
    }
    // Odd-day middle: раніше AuditShield-промо (призупинено 2026-09-26). Слот і розклад
    // зберігаємо, але публікуємо самостійний практичний пост без згадки продукту.
    // engage_ab_index тут навмисно НЕ чіпаємо — парність Poll Experiment лишається як є.
    const idx = published.promo_index
    const topic = PROMO_MODULES[idx % PROMO_MODULES.length]
    return {
      text: await generateText(anthropicKey, promptStandaloneTopic(topic), 700), poll: undefined,
      identifier: `standalone-topic:${topic.module}`,
      finalizeFields: { promo_index: idx + 1 },
      commitMsg: 'bot: update published.json [middle-standalone]',
    }
  }

  if (type === 'extra') {
    const idx = published.extra_index
    const recentTopics = published.extra_recent_topics || []
    const text = await generateText(anthropicKey, promptExtra(EXTRA_STYLES[idx % EXTRA_STYLES.length], recentTopics), 500)
    const topicLine = (text.split('\n')[0] || '').replace(/^[#*\s]+/, '').trim()
    return {
      text, poll: undefined,
      identifier: `extra-style-${idx % EXTRA_STYLES.length}`,
      finalizeFields: {
        extra_index: idx + 1,
        // Тримаємо останні 12 (2 повних цикли по 6 стилях) — коротший список Claude реально
        // врахує, довший ризикує загубитись у промпті без явної користі.
        extra_recent_topics: [...recentTopics, topicLine].filter(Boolean).slice(-12),
      },
      commitMsg: 'bot: update published.json [extra]',
    }
  }

  if (type === 'engage') {
    const idx = published.engage_index
    const content = await generateEngageContent(anthropicKey, idx)
    return {
      text: content.text, poll: content.poll,
      identifier: `engage-style-${content.styleIdx}`,
      finalizeFields: { engage_index: idx + 1 },
      commitMsg: 'bot: update published.json [engage]',
    }
  }

  // type === 'content' (default)
  const ukPosts = getAllPosts('uk').map(p => ({ slug: p.slug, title: p.title || '', description: p.description || '', lang: 'uk' }))
  const enPosts = getAllPosts('en').map(p => ({ slug: p.slug, title: p.title || '', description: p.description || '', lang: 'en' }))
  const articles = [...ukPosts, ...enPosts].filter(a => a.title)
  if (!articles.length) throw new Error('no articles found')

  const { article, resetHappened } = pickNextArticle(articles, published.published)
  const basePublished = resetHappened ? [] : published.published
  const count = published.count
  const includeLink = count % 4 === 3
  const text = await generateText(anthropicKey, promptContent(article, includeLink), 600)
  return {
    text, poll: undefined,
    identifier: article.slug,
    finalizeFields: {
      published: [...basePublished, article.slug],
      count: count + 1,
      last_post: { slug: article.slug, title: article.title, time: new Date().toISOString() },
    },
    commitMsg: 'bot: update published.json [content]',
  }
}

export default async function handler(req, res) {
  const { type = 'content', secret, dry } = req.query
  const executionId = randomUUID()

  if (!process.env.AUTOPOST_SECRET || secret !== process.env.AUTOPOST_SECRET) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  // Окремий type=promo (AuditShield-реклама) призупинено з 2026-09-26. Повертаємо skip ДО
  // будь-якого GitHub/Anthropic/Telegram виклику — інакше невідомий type впав би в гілку
  // 'content' за замовчуванням і просунув би лічильники статей.
  if (type === 'promo') {
    log('promo_paused_skip', { execution_id: executionId, type })
    return res.status(200).json({ ok: true, skipped: true, reason: 'promo_paused' })
  }

  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
  const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN
  const GITHUB_OWNER = process.env.GITHUB_OWNER || 'tenboy10b-sudo'
  const GITHUB_REPO = process.env.GITHUB_REPO || 'CryptoLock'

  const missing = ['TELEGRAM_TOKEN', 'TELEGRAM_CHANNEL_ID', 'ANTHROPIC_API_KEY', 'GITHUB_TOKEN']
    .filter(k => !process.env[k])
  if (missing.length) {
    return res.status(500).json({ error: `missing env vars: ${missing.join(', ')}` })
  }

  log('start', { execution_id: executionId, type, dry: !!dry })

  // ── dry-run: незмінна поведінка — чистий preview, без локу/pending/запису стану ──
  if (dry) {
    try {
      const { data: published } = await ghGetJson(GITHUB_OWNER, GITHUB_REPO, 'published.json', GITHUB_TOKEN)
      const generated = await generateForType(type, withDefaults(published), ANTHROPIC_KEY)
      return res.status(200).json({ ok: true, dry: true, type, text: generated.text || null, poll: generated.poll || null })
    } catch (err) {
      log('generation_failed', { execution_id: executionId, type, dry: true, error: String(err.message || err) })
      return res.status(500).json({ error: String(err.message || err) })
    }
  }

  try {
    let { data: rawState, sha } = await ghGetJson(GITHUB_OWNER, GITHUB_REPO, 'published.json', GITHUB_TOKEN)
    let state = withDefaults(rawState)

    // 1) Активний лок — не постимо, безпечний skip.
    if (state.lock && !isExpired(state.lock.expires_at)) {
      log('lock_active_skip', { execution_id: executionId, type, locked_by: state.lock.execution_id, locked_type: state.lock.type })
      return res.status(200).json({ ok: true, skipped: true, reason: 'locked', locked_execution_id: state.lock.execution_id })
    }
    if (state.lock) {
      log('stale_lock_detected', { execution_id: executionId, type, previous_execution_id: state.lock.execution_id })
    }

    // 2) Лишок pending для ЦЬОГО Ж типу без активного локу = попереднє виконання не
    // завершилось чисто. Ми НЕ можемо надійно знати, чи Telegram вже відправив
    // повідомлення (можливо це саме крок 4 "GitHub finalization failure after
    // Telegram success") — тож НІКОЛИ не повторюємо відправку автоматично. Просто
    // чисто прибираємо застряглий запис і пропускаємо цей цикл; наступний плановий
    // запуск того ж типу піде штатно.
    if (state.pending && state.pending.type === type) {
      log('orphaned_pending_recovered', {
        execution_id: executionId, type,
        orphaned_execution_id: state.pending.execution_id,
        orphaned_identifier: state.pending.identifier,
      })
      try {
        await ghPutJson(GITHUB_OWNER, GITHUB_REPO, 'published.json', GITHUB_TOKEN,
          { ...state, lock: null, pending: null }, sha,
          `bot: recover orphaned pending [${type}] ${state.pending.execution_id}`)
      } catch (e) {
        log('orphaned_pending_clear_failed', { execution_id: executionId, type, error: String(e.message || e) })
      }
      return res.status(200).json({ ok: true, skipped: true, reason: 'recovered_orphaned_pending', orphaned_execution_id: state.pending.execution_id })
    }

    // 3) Атомарне захоплення глобального локу через CAS (SHA) на published.json.
    // Якщо хтось паралельно вже записав стан — цей PUT впаде на конфлікті SHA,
    // і ми програли гонку: безпечний skip, нічого не постимо.
    const lockedState = {
      ...state,
      lock: { execution_id: executionId, type, started_at: new Date().toISOString(), expires_at: new Date(Date.now() + LOCK_TTL_MS).toISOString() },
    }
    try {
      const putResult = await ghPutJson(GITHUB_OWNER, GITHUB_REPO, 'published.json', GITHUB_TOKEN, lockedState, sha, `bot: acquire lock [${type}] ${executionId}`)
      sha = putResult.content.sha
      state = lockedState
    } catch (e) {
      log('lock_acquire_failed', { execution_id: executionId, type, error: String(e.message || e) })
      return res.status(200).json({ ok: true, skipped: true, reason: 'lock_acquire_failed' })
    }
    log('lock_acquired', { execution_id: executionId, type })

    // 4) Генерація контенту (Anthropic). Помилка тут = ще нічого не обіцяно нікому —
    // просто звільняємо лок і повертаємо помилку, жодного посту.
    let generated
    try {
      generated = await generateForType(type, state, ANTHROPIC_KEY)
    } catch (e) {
      log('generation_failed', { execution_id: executionId, type, error: String(e.message || e) })
      await safeReleaseLock(GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN, executionId)
      return res.status(500).json({ error: String(e.message || e) })
    }

    // 5) Persist pending BEFORE Telegram send — це і є "обіцянка" що саме буде відправлено.
    const pendingRecord = {
      execution_id: executionId,
      type,
      identifier: generated.identifier,
      payload: generated.poll ? { poll: generated.poll } : { text: generated.text },
      created_at: new Date().toISOString(),
    }
    const withPending = { ...state, pending: pendingRecord }
    try {
      const putResult = await ghPutJson(GITHUB_OWNER, GITHUB_REPO, 'published.json', GITHUB_TOKEN, withPending, sha, `bot: persist pending [${type}] ${executionId}`)
      sha = putResult.content.sha
      state = withPending
    } catch (e) {
      // GitHub failure before send: fail closed — жодного посту.
      log('pending_persist_failed', { execution_id: executionId, type, error: String(e.message || e) })
      await safeReleaseLock(GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN, executionId)
      return res.status(500).json({ error: 'failed to persist pending state, no post sent' })
    }
    log('pending_persisted', { execution_id: executionId, type, identifier: generated.identifier })

    // 6) Telegram send — тільки тепер, коли намір безпечно записано.
    const sendResult = generated.poll
      ? await sendTelegramPoll(TELEGRAM_TOKEN, CHANNEL_ID, generated.poll)
      : await sendTelegram(TELEGRAM_TOKEN, CHANNEL_ID, generated.text)

    if (!sendResult.ok) {
      // Telegram definite failure: лічильники НЕ просуваємо. Pending+lock лишаємо як є —
      // це і є контрольований retry-слід для наступного запуску того ж типу (крок 2 вище).
      log('telegram_failed', { execution_id: executionId, type })
      return res.status(502).json({ error: 'telegram send failed', pending_execution_id: executionId })
    }
    log('telegram_success', { execution_id: executionId, type, message_id: sendResult.messageId })

    // 7) Фіналізація: застосувати реальні лічильники/дедуп, зберегти message_id, очистити pending+lock.
    const finalState = {
      ...state,
      ...generated.finalizeFields,
      last_message_id: sendResult.messageId,
      pending: null,
      lock: null,
    }
    try {
      await ghPutJson(GITHUB_OWNER, GITHUB_REPO, 'published.json', GITHUB_TOKEN, finalState, sha, generated.commitMsg)
    } catch (e) {
      // Final GitHub write failure after Telegram success: повідомлення вже пішло в канал,
      // і ми НЕ відправляємо його повторно "про всяк випадок". Pending лишається записаним —
      // наступний запуск ЦЬОГО Ж типу побачить його як orphaned (крок 2) і чисто прибере,
      // з явним логом. Це системна межа Telegram+GitHub-only дизайну: неможливо гарантувати
      // exact-once, коли відправка і фіксація стану — дві окремі, незалежно відмовостійкі дії.
      log('finalize_failed_after_telegram_success', { execution_id: executionId, type, error: String(e.message || e) })
      return res.status(207).json({
        ok: false,
        warning: 'telegram message was sent but finalize write failed — pending left for next-cycle recovery, no automatic resend',
        execution_id: executionId,
      })
    }
    log('finalize_success', { execution_id: executionId, type })

    return res.status(200).json({ ok: true, type, poll: !!generated.poll, execution_id: executionId })
  } catch (err) {
    log('unhandled_error', { execution_id: executionId, type, error: String(err.message || err) })
    return res.status(500).json({ error: String(err.message || err) })
  }
}
