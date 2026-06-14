#!/usr/bin/env python3
"""
CryptoLock Telegram Bot
POST_TYPE=content — корисний пост про Windows
POST_TYPE=promo   — рекламний пост про AuditShield (22 модулі по черзі)
POST_TYPE=engage  — залученість: опитування, провокації, квізи, факти
"""

import os
import json
import glob
import random
import subprocess
import anthropic
import requests
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_TOKEN = os.environ.get("TELEGRAM_TOKEN")
CHANNEL_ID     = os.environ.get("TELEGRAM_CHANNEL_ID")
ANTHROPIC_KEY  = os.environ.get("ANTHROPIC_API_KEY")

POSTS_DIR_UK   = os.environ.get("POSTS_DIR_UK", "posts")
POSTS_DIR_EN   = os.environ.get("POSTS_DIR_EN", "posts-en")

PUBLISHED_FILE = "published.json"
POST_LANGUAGE  = os.environ.get("POST_LANGUAGE", "uk")
LINK_EVERY_N   = int(os.environ.get("LINK_EVERY_N", "4"))
POST_TYPE      = os.environ.get("POST_TYPE", "content")
SITE_URL       = "https://cryptolockua.com"

PRODUCT_BASE = {
    "name": "AuditShield — Windows Security Audit Tool",
    "description": "Програма яка аналізує Windows ПК по 22 напрямках і видає детальний HTML-звіт з оцінкою ризику за 10 хвилин.",
    "report": "Детальний HTML-звіт з кольоровими індикаторами: зелений (норма), жовтий (увага), червоний (загроза). Зберігається локально.",
    "pricing": "Старт — 3 запуски | $9\nБазовий — 5 запусків | $13\nПро — 10 запусків | $22\nОплата Monobank або USDT",
    "link": "@AuditShield\\_01\\_Bot",
}

PROMO_MODULES = [
    {"module": "USB-історія", "what": "Сканує реєстр Windows і витягує повну історію всіх USB-пристроїв що коли-небудь підключались. Навіть якщо флешку підключали рік тому — слід залишається.", "shows": "Назва і модель пристрою, серійний номер (VID/PID), дати першого і останнього підключення, кількість підключень, тип пристрою.", "when": "Після ремонту ПК, при підозрі що співробітник виносить дані, після того як хтось мав фізичний доступ до комп'ютера."},
    {"module": "Автозапуск", "what": "Перевіряє всі місця де програми можуть прописатись на автоматичний запуск разом з Windows.", "shows": "Назва програми, шлях до файлу, цифровий підпис, дата додавання, чи є програма легітимною.", "when": "Шкідливе ПЗ майже завжди прописується в автозапуск. Якщо там є незнайомі записи — це серйозний сигнал."},
    {"module": "Запущені процеси", "what": "Аналізує всі процеси що зараз працюють в системі, перевіряє їх цифрові підписи і репутацію.", "shows": "Назва процесу, PID, використання CPU і RAM, шлях до файлу, цифровий підпис, виробник.", "when": "Шпигунське ПЗ і майнери криптовалюти ховаються серед звичайних процесів."},
    {"module": "Мережеві підключення", "what": "Показує всі активні мережеві з'єднання — які програми зараз передають або отримують дані.", "shows": "Локальний і віддалений IP, порт, назва процесу, статус з'єднання, країна сервера.", "when": "Якщо якась програма постійно відправляє дані на невідомий сервер — це може бути витік даних."},
    {"module": "Браузери та розширення", "what": "Перевіряє встановлені браузери, їх розширення і збережені дані.", "shows": "Список всіх розширень в Chrome/Firefox/Edge, їх дозволи, дата встановлення, підозрілі розширення.", "when": "Після зараження комп'ютера, якщо браузер поводиться дивно або показує рекламу."},
    {"module": "Планувальник завдань", "what": "Сканує всі заплановані задачі в Windows включаючи приховані.", "shows": "Назва задачі, розклад запуску, яку команду виконує, коли востаннє запускалась.", "when": "Шкідливе ПЗ часто ховається в планувальнику щоб перезапускатись після видалення."},
    {"module": "Встановлені програми", "what": "Повний список всього встановленого ПЗ з датами встановлення включаючи приховані програми.", "shows": "Назва, версія, дата встановлення, виробник, розмір, шлях встановлення.", "when": "Після ремонту або коли хтось мав доступ до ПК."},
    {"module": "Служби Windows", "what": "Аналізує всі системні служби — активні і зупинені.", "shows": "Назва служби, статус, тип запуску, обліковий запис, шлях до виконуваного файлу.", "when": "Незнайомі служби що запускаються автоматично — класична ознака зараження."},
    {"module": "Відкриті порти", "what": "Перевіряє які мережеві порти відкриті і які програми їх слухають.", "shows": "Номер порту, протокол, програма що слухає, статус.", "when": "Зайві відкриті порти збільшують поверхню атаки."},
    {"module": "Брандмауер Windows", "what": "Перевіряє правила брандмауера і підозрілі виключення.", "shows": "Список правил, дозволені програми, виключення, статус по профілях.", "when": "Шкідливе ПЗ часто додає себе у виключення брандмауера."},
    {"module": "Оновлення Windows", "what": "Перевіряє які оновлення безпеки встановлені і які відсутні.", "shows": "Встановлені KB-оновлення, дати, відсутні критичні патчі.", "when": "Незакриті вразливості — найпоширеніший спосіб зламу систем."},
    {"module": "Антивірусний захист", "what": "Перевіряє статус антивірусного захисту — чи активний, чи актуальні бази.", "shows": "Назва антивіруса, версія, дата оновлення баз, статус реального захисту.", "when": "Деякі шкідливі програми першим ділом вимикають антивірус."},
    {"module": "Облікові записи користувачів", "what": "Показує всі локальні облікові записи включаючи приховані.", "shows": "Список всіх акаунтів, рівень прав, статус, дата останнього входу.", "when": "Несанкціоновані акаунти — ознака злому."},
    {"module": "Спільні папки і мережевий доступ", "what": "Перевіряє які папки відкриті для доступу по мережі.", "shows": "Назва папки, шлях, права доступу, активні підключення.", "when": "Неправильні права доступу — головна причина витоку корпоративних даних."},
    {"module": "Точки відновлення системи", "what": "Аналізує наявні точки відновлення Windows.", "shows": "Список точок відновлення, дати створення, розмір.", "when": "Віруси-шифрувальники видаляють точки відновлення перед шифруванням."},
    {"module": "Журнал критичних помилок", "what": "Аналізує системний журнал і збирає критичні помилки за останні дні.", "shows": "Критичні події, помилки безпеки, збої служб, підозрілі входи.", "when": "Регулярні збої можуть вказувати на проблеми до того як вони стануть помітними."},
    {"module": "Тимчасові файли і підозрілі директорії", "what": "Перевіряє тимчасові папки де може ховатись шкідливе ПЗ.", "shows": "Підозрілі файли в системних папках, виконувані файли в тимчасових директоріях.", "when": "Шкідливе ПЗ часто розпаковується з тимчасових папок."},
    {"module": "Hosts файл", "what": "Перевіряє файл hosts на несанкціоновані зміни.", "shows": "Вміст hosts файлу, нестандартні записи, підозрілі перенаправлення.", "when": "Змінений hosts може перенаправляти трафік на шахрайські сайти."},
    {"module": "Реєстр — ключі автозапуску", "what": "Глибоке сканування реєстру на підозрілі ключі автозапуску.", "shows": "Всі ключі реєстру пов'язані з автозапуском, підозрілі значення, закодовані команди.", "when": "Просунуте шкідливе ПЗ ховається глибоко в реєстрі."},
    {"module": "RDP та віддалений доступ", "what": "Перевіряє статус RDP і інших інструментів віддаленого доступу.", "shows": "Статус RDP, журнал підключень, IP адреси з яких підключались.", "when": "Несанкціонований віддалений доступ — одна з головних загроз для бізнесу."},
    {"module": "BitLocker та шифрування дисків", "what": "Перевіряє статус шифрування дисків BitLocker.", "shows": "Статус шифрування по кожному диску, метод захисту, наявність ключа відновлення.", "when": "Без шифрування всі дані доступні при фізичному доступі до диска."},
    {"module": "Цифрові підписи процесів", "what": "Перевіряє цифрові підписи всіх запущених процесів.", "shows": "Список процесів з підписами, виробник, непідписані процеси виділяються червоним.", "when": "Більшість шкідливого ПЗ не має підпису або підписане фейковими сертифікатами."},
]

ENGAGE_STYLES = [
    """ФОРМАТ: Опитування з інтригою.
Напиши пост з опитуванням на тему Windows або кібербезпеки.
Структура: коротка інтригуюча фраза або факт (1-2 речення) → опитування з 3-4 варіантами відповіді → заклик проголосувати.
Варіанти відповідей мають бути такими щоб кожен впізнав себе — від параноїка до того хто взагалі не думає про безпеку.
Приклади тем: антивірус, паролі, оновлення Windows, автозапуск, резервні копії.
Тон: легкий, з гумором, без повчань.""",

    """ФОРМАТ: Провокативне твердження.
Напиши пост з суперечливим твердженням про Windows або безпеку ПК яке хочеться або підтримати або заперечити.
Структура: емодзі + тверде твердження → коротке пояснення чому так думають одні → коротке пояснення чому інші проти → питання "А ти як вважаєш?" з двома emoji-реакціями для відповіді.
Приклади тверджень: "Windows Defender — найкращий антивірус", "Переінсталювати Windows раз на рік — норма", "Пароль на ПК вдома — зайвий клопіт".
Тон: провокативний але дружній.""",

    """ФОРМАТ: Шокуючий факт + питання.
Напиши пост з одним конкретним фактом або статистикою про кібербезпеку або Windows який справді здивує.
Структура: факт з цифрою або конкретним прикладом → коротке пояснення чому це важливо → питання до аудиторії яке змушує задуматись про себе.
Приклади фактів: скільки часу потрібно щоб зламати простий пароль, скільки програм в середньому в автозапуску, який % людей не оновлює Windows.
В кінці запитай чи перевіряли вони це у себе.
Тон: журналістський, без страшилок.""",

    """ФОРМАТ: Квіз — правда чи міф.
Напиши пост у форматі "Правда чи міф?" про Windows або кібербезпеку.
Дай одне твердження і попроси аудиторію відповісти реакцією: ✅ якщо правда, ❌ якщо міф.
Правильну відповідь НЕ давай в цьому ж пості — скажи що відповідь в коментарях або завтра.
Приклади тверджень: "Режим інкогніто захищає від слідкування", "Антивірус сповільнює ПК на 30%", "Форматування диска повністю видаляє дані".
Тон: грайливий, цікавий.""",

    """ФОРМАТ: Виклик — зроби прямо зараз.
Напиши пост з конкретним завданням яке читач може виконати за 1-2 хвилини прямо зараз і поділитись результатом.
Завдання має бути пов'язане з Windows або безпекою і мати конкретну команду або дію.
Структура: виклик → конкретна команда або дія → що перевіряти в результаті → "Напиши в коментар що знайшов".
Приклади: перевір автозапуск через msconfig, подивись скільки програм у тебе встановлено, перевір коли востаннє оновлювався Windows.
Тон: енергійний, як спортивний виклик.""",

    """ФОРМАТ: Рейтинг або вибір.
Напиши пост де аудиторія обирає свій варіант з кількох варіантів реакціями або в коментарях.
Тема: щось пов'язане з Windows, залізом або звичками користувача ПК.
Структура: питання → 3-4 варіанти з емодзі → заклик поставити реакцію або написати в коментар.
Приклади: який браузер використовуєш, як часто перезавантажуєш ПК, скільки вкладок тримаєш відкритими, де зберігаєш паролі.
Тон: легкий, розважальний.""",

    """ФОРМАТ: Цікавий кейс або сценарій.
Напиши пост у форматі короткого сценарію — "Що б ти зробив якщо...?" або "Як ти реагуєш коли...?".
Ситуація має бути знайомою кожному хто користується ПК.
Структура: опис ситуації (2-3 речення) → питання що робити → кілька варіантів відповіді з емодзі.
Приклади ситуацій: ПК почав гальмувати, вийшло важливе оновлення Windows, антивірус знайшов загрозу, ПК не вимикається.
Тон: гумористичний але практичний.""",
]

EXTRA_STYLES = [
    """ФОРМАТ: Команда дня.
Напиши пост про одну конкретну корисну команду PowerShell або CMD для Windows.
Структура:
1. Емодзі + назва команди як заголовок
2. Що робить команда — одним реченням
3. Сама команда в форматі коду
4. Що побачиш в результаті
5. 1-2 практичні ситуації коли це корисно
Команди на вибір (вибери одну, не повторюй): перевірка диску, пошук великих файлів, очищення кешу DNS, перегляд відкритих портів, список запущених служб, інформація про систему, перевірка цілісності файлів Windows, список встановлених програм, мережева діагностика, управління автозапуском.
Тон: технічний але зрозумілий, як підказка від колеги.""",

    """ФОРМАТ: Маловідома фішка Windows.
Напиши пост про одну маловідому але дуже корисну функцію або трюк Windows.
Структура:
1. Емодзі + інтригуючий заголовок ("Мало хто знає що в Windows є...")
2. Опис фішки — що це і як працює
3. Як активувати або використати — покрокова інструкція (2-4 кроки)
4. Коли це реально рятує
Теми на вибір: God Mode, приховані налаштування через regedit, секретні гарячі клавіші, прихований калькулятор в PowerToys, нічний режим для очей, вбудований скріншотер, буфер обміну з історією, режим фокусування, вбудований Linux, таємні можливості диспетчера завдань.
Тон: як відкриття — "ти не повіриш що це вже є в Windows".""",

    """ФОРМАТ: Питання і відповідь.
Напиши пост у форматі відповіді на типове питання про Windows яке задають найчастіше.
Структура:
1. Питання як заголовок (наприклад "Чому Windows гальмує після оновлення?")
2. Коротка чесна відповідь — без води
3. Що конкретно зробити щоб вирішити — 3-4 кроки
4. Коли це не допомагає і що тоді
Питання на вибір: чому ПК гальмує, як прискорити завантаження, чому Windows займає багато місця, як вимкнути рекламу в Windows 11, чому зникає місце на диску, як прискорити інтернет, чому ПК не вимикається, як відновити видалені файли.
Тон: прямий і практичний, без зайвих слів.""",

    """ФОРМАТ: Порівняння або вибір.
Напиши пост де порівнюєш два підходи або інструменти для Windows.
Структура:
1. Заголовок з порівнянням ("X vs Y — що краще?")
2. Коротко про кожен варіант
3. Коли використовувати перший і коли другий
4. Чіткий висновок — що рекомендуєш і чому
Теми: CMD vs PowerShell, Windows Defender vs сторонній антивірус, HDD vs SSD для системи, Windows 10 vs Windows 11, вбудований брандмауер vs сторонній, режим сну vs вимкнення, OneDrive vs локальне зберігання.
Тон: аналітичний, конкретний, без маркетингу.""",

    """ФОРМАТ: Чеклист або покроковий гайд.
Напиши пост у форматі короткого чеклисту для конкретної задачі в Windows.
Структура:
1. Заголовок — для чого цей чеклист
2. 5-7 пунктів з конкретними діями
3. Скільки часу займе
4. Що отримаєш в результаті
Теми: прискорення Windows за 10 хвилин, базова безпека нового ПК, що зробити після переінсталяції Windows, щомісячне обслуговування ПК, налаштування Windows для роботи вдома, підготовка ПК до продажу.
Тон: структурований, практичний, як інструкція.""",

    """ФОРМАТ: Розбір помилки або проблеми.
Напиши пост про одну конкретну поширену помилку або проблему Windows і як її вирішити.
Структура:
1. Назва помилки або симптом як заголовок
2. Чому це відбувається — коротко і зрозуміло
3. Рішення — від простого до складного (3-4 варіанти)
4. Як уникнути в майбутньому
Теми: синій екран смерті, повільне завантаження, проблеми з оновленням, зникнення місця на диску, проблеми з драйверами, Windows не активована, проблеми з Wi-Fi, завис диспетчер завдань.
Тон: діагностичний, спокійний, без паніки.""",
]

def load_published() -> dict:
    if os.path.exists(PUBLISHED_FILE):
        with open(PUBLISHED_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"published": [], "count": 0, "promo_index": 0, "engage_index": 0, "extra_index": 0}

def save_published(data: dict):
    with open(PUBLISHED_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def git_commit_published():
    try:
        subprocess.run(["git", "config", "user.email", "bot@cryptolockua.com"], check=True)
        subprocess.run(["git", "config", "user.name", "CryptoLock Bot"], check=True)
        subprocess.run(["git", "add", PUBLISHED_FILE], check=True)
        result = subprocess.run(["git", "diff", "--cached", "--quiet"])
        if result.returncode != 0:
            subprocess.run(["git", "commit", "-m", f"bot: update published.json [{POST_TYPE}]"], check=True)
            subprocess.run(["git", "push"], check=True)
            print("✅ published.json збережено в git")
    except Exception as e:
        print(f"⚠️ Не вдалось зберегти в git: {e}")

def get_all_articles() -> list[dict]:
    articles = []
    dirs = []
    if POST_LANGUAGE in ("uk", "mixed"):
        dirs.append((POSTS_DIR_UK, "uk"))
    if POST_LANGUAGE in ("en", "mixed"):
        dirs.append((POSTS_DIR_EN, "en"))
    for posts_dir, lang in dirs:
        pattern = os.path.join(posts_dir, "*.md")
        for filepath in glob.glob(pattern):
            slug = Path(filepath).stem
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                title = ""
                description = ""
                for line in content.split("\n"):
                    if line.startswith("title:"):
                        title = line.split(":", 1)[1].strip().strip('"')
                    elif line.startswith("description:"):
                        description = line.split(":", 1)[1].strip().strip('"')
                if title:
                    articles.append({"slug": slug, "title": title, "description": description, "lang": lang, "filepath": filepath})
            except Exception as e:
                print(f"  Помилка читання {filepath}: {e}")
    return articles

def pick_next_article(articles, published_data):
    published_slugs = set(published_data.get("published", []))
    unpublished = [a for a in articles if a["slug"] not in published_slugs]
    if not unpublished:
        print("Всі статті опубліковані! Починаємо з початку...")
        published_data["published"] = []
        save_published(published_data)
        unpublished = articles
    return random.choice(unpublished) if unpublished else None

def generate_content_post(article, include_link):
    client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)
    link_instruction = ""
    if include_link:
        slug = article["slug"]
        url = f"{SITE_URL}/en/{slug}" if article["lang"] == "en" else f"{SITE_URL}/{slug}"
        link_instruction = f"\n\nВ кінці посту додай рядок: 🔗 {url}"
    prompt = f"""Ти адміністратор Telegram каналу про Windows і комп'ютерну безпеку.
Напиши короткий практичний пост для Telegram на основі цієї теми:
Заголовок: {article['title']}
Опис: {article['description']}
Вимоги:
- Пиши українською мовою
- Довжина: 150-250 слів
- Починай з емодзі + короткий заголовок
- Далі 3-5 конкретних порад або кроків
- Якщо доречно — коротка команда PowerShell або CMD
- В кінці 2-4 хештеги (#windows #безпека #tips)
- НЕ додавай посилань на статтю (крім якщо явно вказано){link_instruction}
Стиль: дружній, технічний, як від досвідченого системного адміністратора."""
    message = client.messages.create(model="claude-sonnet-4-5", max_tokens=600, messages=[{"role": "user", "content": prompt}])
    return message.content[0].text

def generate_promo_post(module_data):
    client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)
    prompt = f"""Ти копірайтер який пише про реальний продукт для Telegram каналу про Windows і безпеку.
Продукт: {PRODUCT_BASE['name']}
Що робить: {PRODUCT_BASE['description']}
Звіт: {PRODUCT_BASE['report']}
Ціни: {PRODUCT_BASE['pricing']}
Модуль: {module_data['module']}
Що перевіряє: {module_data['what']}
Що показує в звіті: {module_data['shows']}
Коли особливо важливо: {module_data['when']}
Структура посту:
1. Емодзі + заголовок про цей модуль
2. Що саме перевіряє цей модуль і як це працює технічно
3. Що конкретно побачиш у звіті
4. 2-3 конкретні ситуації коли ця інформація критично важлива
5. Заклик спробувати демо: @AuditShield\\_01\\_Bot
Вимоги:
- Українська мова
- Довжина: 180-250 слів
- Пиши про реальний функціонал — конкретно і технічно
- Без вигаданих персонажів і історій
- В кінці хештеги: #безпека #windows #аудит #AuditShield
- Посилання пиши ТІЛЬКИ так: @AuditShield\\_01\\_Bot"""
    message = client.messages.create(model="claude-sonnet-4-5", max_tokens=700, messages=[{"role": "user", "content": prompt}])
    return message.content[0].text

def generate_extra_post(style):
    client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)
    prompt = f"""Ти досвідчений адміністратор Telegram каналу про Windows і кібербезпеку.
Канал CryptoLock (@cryptolock888) — практичні поради про Windows для українців.

{style}

Загальні вимоги:
- Українська мова
- Довжина: 120-200 слів
- Конкретно і по ділу — без води
- Команди або кроки в окремих рядках для зручності
- В кінці 2-3 хештеги (#windows #tips #безпека або схожі)
- НЕ рекламуй жодних продуктів"""
    message = client.messages.create(model="claude-sonnet-4-5", max_tokens=500, messages=[{"role": "user", "content": prompt}])
    return message.content[0].text

def generate_engage_post(style):
    client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)
    prompt = f"""Ти адміністратор популярного Telegram каналу про Windows і кібербезпеку.
Канал називається CryptoLock (@cryptolock888).
Аудиторія: українці які користуються Windows — від звичайних користувачів до IT спеціалістів.

{style}

Загальні вимоги:
- Українська мова
- Довжина: 80-150 слів — коротко і влучно
- Живий розмовний тон
- Має викликати бажання відреагувати або написати коментар
- НЕ рекламуй жодних продуктів
- НЕ додавай хештегів"""
    message = client.messages.create(model="claude-sonnet-4-5", max_tokens=400, messages=[{"role": "user", "content": prompt}])
    return message.content[0].text

def send_telegram(text):
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    payload = {"chat_id": CHANNEL_ID, "text": text, "parse_mode": "Markdown"}
    response = requests.post(url, json=payload, timeout=30)
    if response.status_code == 200:
        return True
    print(f"Помилка Telegram: {response.status_code} — {response.text}")
    if "can't parse" in response.text.lower():
        payload["parse_mode"] = None
        response2 = requests.post(url, json=payload, timeout=30)
        return response2.status_code == 200
    return False

def main():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M')}] Запуск бота... режим: {POST_TYPE}")
    missing = []
    if not TELEGRAM_TOKEN: missing.append("TELEGRAM_TOKEN")
    if not CHANNEL_ID: missing.append("TELEGRAM_CHANNEL_ID")
    if not ANTHROPIC_KEY: missing.append("ANTHROPIC_API_KEY")
    if missing:
        print(f"ПОМИЛКА: не задані змінні: {', '.join(missing)}")
        return
    published_data = load_published()

    if POST_TYPE == "extra":
        extra_index = published_data.get("extra_index", 0)
        style = EXTRA_STYLES[extra_index % len(EXTRA_STYLES)]
        print(f"Генеруємо extra пост (стиль {extra_index % len(EXTRA_STYLES) + 1}/{len(EXTRA_STYLES)})...")
        extra_text = generate_extra_post(style)
        print(f"Згенеровано ({len(extra_text)} символів)")
        if send_telegram(extra_text):
            print("✅ Extra пост опубліковано!")
            published_data["extra_index"] = extra_index + 1
            save_published(published_data)
            git_commit_published()
        else:
            print("❌ Помилка публікації")

    elif POST_TYPE == "engage":
        engage_index = published_data.get("engage_index", 0)
        style = ENGAGE_STYLES[engage_index % len(ENGAGE_STYLES)]
        print(f"Генеруємо engage пост (стиль {engage_index % len(ENGAGE_STYLES) + 1}/{len(ENGAGE_STYLES)})...")
        engage_text = generate_engage_post(style)
        print(f"Згенеровано ({len(engage_text)} символів)")
        if send_telegram(engage_text):
            print("✅ Engage пост опубліковано!")
            published_data["engage_index"] = engage_index + 1
            save_published(published_data)
            git_commit_published()
        else:
            print("❌ Помилка публікації")

    elif POST_TYPE == "promo":
        promo_index = published_data.get("promo_index", 0)
        module_data = PROMO_MODULES[promo_index % len(PROMO_MODULES)]
        print(f"Генеруємо пост про модуль: {module_data['module']} ({promo_index % len(PROMO_MODULES) + 1}/{len(PROMO_MODULES)})...")
        promo_text = generate_promo_post(module_data)
        print(f"Згенеровано ({len(promo_text)} символів)")
        if send_telegram(promo_text):
            print("✅ Рекламний пост опубліковано!")
            published_data["promo_index"] = promo_index + 1
            save_published(published_data)
            git_commit_published()
        else:
            print("❌ Помилка публікації")

    else:
        articles = get_all_articles()
        if not articles:
            print("ПОМИЛКА: статті не знайдені.")
            return
        print(f"Знайдено статей: {len(articles)}")
        article = pick_next_article(articles, published_data)
        if not article:
            return
        print(f"Обрано: [{article['lang']}] {article['title']}")
        count = published_data.get("count", 0)
        include_link = (LINK_EVERY_N > 0) and (count % LINK_EVERY_N == LINK_EVERY_N - 1)
        print("Генеруємо контентний пост...")
        content_text = generate_content_post(article, include_link)
        print(f"Згенеровано ({len(content_text)} символів)")
        if send_telegram(content_text):
            print("✅ Контентний пост опубліковано!")
            published_data["published"].append(article["slug"])
            published_data["count"] = count + 1
            published_data["last_post"] = {"slug": article["slug"], "title": article["title"], "time": datetime.now().isoformat()}
            save_published(published_data)
            git_commit_published()
        else:
            print("❌ Помилка публікації")

if __name__ == "__main__":
    main()
