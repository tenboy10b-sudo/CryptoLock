#!/usr/bin/env python3
"""
CryptoLock Telegram Bot
POST_TYPE=content — публікує корисний пост про Windows
POST_TYPE=promo   — публікує рекламний пост про AuditShield (22 модулі по черзі)
"""

import os
import json
import glob
import random
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

# 22 модулі — кожен окремий пост
PROMO_MODULES = [
    {
        "module": "USB-історія",
        "what": "Сканує реєстр Windows і витягує повну історію всіх USB-пристроїв що коли-небудь підключались. Навіть якщо флешку підключали рік тому — слід залишається.",
        "shows": "Назва і модель пристрою, серійний номер (VID/PID), дати першого і останнього підключення, кількість підключень, тип пристрою.",
        "when": "Після ремонту ПК, при підозрі що співробітник виносить дані, після того як хтось мав фізичний доступ до комп'ютера.",
    },
    {
        "module": "Автозапуск",
        "what": "Перевіряє всі місця де програми можуть прописатись на автоматичний запуск разом з Windows — реєстр, папки автозапуску, служби, планувальник.",
        "shows": "Назва програми, шлях до файлу, цифровий підпис, дата додавання, чи є програма легітимною.",
        "when": "Шкідливе ПЗ майже завжди прописується в автозапуск. Якщо там є незнайомі записи — це серйозний сигнал.",
    },
    {
        "module": "Запущені процеси",
        "what": "Аналізує всі процеси що зараз працюють в системі, перевіряє їх цифрові підписи і репутацію.",
        "shows": "Назва процесу, PID, використання CPU і RAM, шлях до файлу, цифровий підпис, виробник.",
        "when": "Шпигунське ПЗ і майнери криптовалюти ховаються серед звичайних процесів. Непідписані процеси — перший сигнал тривоги.",
    },
    {
        "module": "Мережеві підключення",
        "what": "Показує всі активні мережеві з'єднання — які програми зараз передають або отримують дані і з якими адресами.",
        "shows": "Локальний і віддалений IP, порт, назва процесу, статус з'єднання, країна сервера.",
        "when": "Якщо якась програма постійно відправляє дані на невідомий сервер — це може бути витік даних або шпигунське ПЗ.",
    },
    {
        "module": "Браузери та розширення",
        "what": "Перевіряє встановлені браузери, їх розширення і збережені дані. Шкідливі розширення — один з найпоширеніших векторів атак.",
        "shows": "Список всіх розширень в Chrome/Firefox/Edge, їх дозволи, дата встановлення, підозрілі розширення.",
        "when": "Після зараження комп'ютера, якщо браузер поводиться дивно, показує рекламу або перенаправляє на інші сайти.",
    },
    {
        "module": "Планувальник завдань",
        "what": "Сканує всі заплановані задачі в Windows — включаючи приховані системні і користувацькі. Популярний спосіб для зловмисників забезпечити постійну присутність.",
        "shows": "Назва задачі, розклад запуску, яку команду виконує, коли востаннє запускалась, статус.",
        "when": "Шкідливе ПЗ часто ховається в планувальнику щоб перезапускатись після видалення. Незнайомі задачі — серйозний сигнал.",
    },
    {
        "module": "Встановлені програми",
        "what": "Повний список всього встановленого ПЗ з датами встановлення — включаючи програми що не відображаються в стандартному списку Windows.",
        "shows": "Назва, версія, дата встановлення, виробник, розмір, шлях встановлення.",
        "when": "Після ремонту або коли хтось мав доступ до ПК — перевірте чи не встановили щось зайве без вашого відома.",
    },
    {
        "module": "Служби Windows",
        "what": "Аналізує всі системні служби — активні і зупинені. Шкідливе ПЗ часто реєструється як служба для непомітної роботи у фоні.",
        "shows": "Назва служби, статус, тип запуску, обліковий запис, шлях до виконуваного файлу.",
        "when": "Незнайомі служби що запускаються автоматично — класична ознака зараження або прихованого ПЗ.",
    },
    {
        "module": "Відкриті порти",
        "what": "Перевіряє які мережеві порти відкриті на комп'ютері і які програми їх слухають. Відкритий порт — потенційна точка входу для зловмисників.",
        "shows": "Номер порту, протокол, програма що слухає, статус, чи є порт стандартним.",
        "when": "Особливо важливо для корпоративних ПК і серверів. Зайві відкриті порти збільшують поверхню атаки.",
    },
    {
        "module": "Брандмауер Windows",
        "what": "Перевіряє правила брандмауера — які програми мають дозвіл на мережеву активність і чи не було додано підозрілих виключень.",
        "shows": "Список правил, дозволені програми, виключення, статус брандмауера по профілях (домашній/робочий/публічний).",
        "when": "Шкідливе ПЗ часто додає себе у виключення брандмауера. Якщо там є незнайомі правила — варто розібратись.",
    },
    {
        "module": "Оновлення Windows",
        "what": "Перевіряє які оновлення безпеки встановлені і які відсутні. Незакриті вразливості — найпоширеніший спосіб зламу систем.",
        "shows": "Встановлені KB-оновлення, дати, відсутні критичні патчі, час останньої перевірки оновлень.",
        "when": "Регулярна перевірка критична для корпоративних систем. Одне пропущене оновлення може коштувати дуже дорого.",
    },
    {
        "module": "Антивірусний захист",
        "what": "Перевіряє статус антивірусного захисту — чи активний, чи актуальні бази, чи немає конфліктів між кількома антивірусами.",
        "shows": "Назва антивіруса, версія, дата оновлення баз, статус реального захисту, останнє сканування.",
        "when": "Деякі шкідливі програми першим ділом вимикають антивірус. Якщо захист неактивний — ПК беззахисний.",
    },
    {
        "module": "Облікові записи користувачів",
        "what": "Показує всі локальні облікові записи на ПК — включаючи приховані і системні. Несанкціоновані акаунти — ознака злому.",
        "shows": "Список всіх акаунтів, рівень прав (адміністратор/користувач), статус, дата останнього входу, чи активний.",
        "when": "Після звільнення співробітника, після підозрілої активності, при перевірці корпоративного ПК.",
    },
    {
        "module": "Спільні папки і мережевий доступ",
        "what": "Перевіряє які папки відкриті для доступу по локальній мережі і хто має до них права.",
        "shows": "Назва спільної папки, шлях, права доступу, активні підключення, приховані адміністративні шери.",
        "when": "Критично для офісних ПК. Неправильно налаштовані права доступу — одна з головних причин витоку корпоративних даних.",
    },
    {
        "module": "Точки відновлення системи",
        "what": "Аналізує наявні точки відновлення Windows — їх кількість, дати і стан. Також перевіряє чи не вимкнена функція відновлення.",
        "shows": "Список точок відновлення, дати створення, розмір, статус служби тіньового копіювання.",
        "when": "Деякі віруси-шифрувальники видаляють точки відновлення перед шифруванням. Якщо їх нема — ви вразливі.",
    },
    {
        "module": "Журнал критичних помилок",
        "what": "Аналізує системний журнал подій Windows і збирає критичні помилки за останні дні — збої, попередження, підозрілу активність.",
        "shows": "Критичні події, помилки безпеки, збої служб, підозрілі входи в систему, дати і джерела.",
        "when": "Регулярні збої або помилки безпеки в журналі можуть вказувати на проблеми ще до того як вони стануть помітними.",
    },
    {
        "module": "Тимчасові файли і підозрілі директорії",
        "what": "Перевіряє тимчасові папки і нестандартні директорії де може ховатись шкідливе ПЗ — %TEMP%, AppData, ProgramData.",
        "shows": "Підозрілі файли в системних папках, виконувані файли в тимчасових директоріях, нестандартні розташування ПЗ.",
        "when": "Шкідливе ПЗ часто розпаковується і запускається з тимчасових папок. Це перше місце де варто шукати.",
    },
    {
        "module": "Hosts файл",
        "what": "Перевіряє файл hosts на несанкціоновані зміни. Змінений hosts може перенаправляти трафік на шахрайські сайти непомітно для користувача.",
        "shows": "Вміст hosts файлу, нестандартні записи, підозрілі перенаправлення, дата останньої зміни.",
        "when": "Якщо банківський сайт або пошта поводяться дивно — можливо hosts файл змінений і ви потрапляєте на підроблений сайт.",
    },
    {
        "module": "Реєстр — ключі автозапуску",
        "what": "Глибоке сканування реєстру Windows на підозрілі ключі автозапуску в нестандартних місцях які не видно звичайними інструментами.",
        "shows": "Всі ключі реєстру пов'язані з автозапуском, підозрілі значення, нестандартні шляхи, закодовані команди.",
        "when": "Просунуте шкідливе ПЗ ховається глибоко в реєстрі. Стандартний msconfig цього не побачить.",
    },
    {
        "module": "RDP та віддалений доступ",
        "what": "Перевіряє статус RDP і інших інструментів віддаленого доступу — чи увімкнені, хто підключався і коли.",
        "shows": "Статус RDP, журнал підключень, IP адреси з яких підключались, встановлені програми віддаленого доступу (TeamViewer, AnyDesk тощо).",
        "when": "Особливо важливо для корпоративних ПК. Несанкціонований віддалений доступ — одна з головних загроз для бізнесу.",
    },
    {
        "module": "BitLocker та шифрування дисків",
        "what": "Перевіряє статус шифрування дисків BitLocker — чи увімкнено, який метод шифрування, де зберігається ключ відновлення.",
        "shows": "Статус шифрування по кожному диску, метод захисту, наявність ключа відновлення, чи є TPM.",
        "when": "Критично якщо ноутбук може бути вкрадений або втрачений. Без шифрування всі дані доступні при фізичному доступі до диска.",
    },
    {
        "module": "Цифрові підписи процесів",
        "what": "Перевіряє цифрові підписи всіх запущених процесів. Легітимне ПЗ завжди підписане. Непідписані або підписані невідомими сертифікатами процеси — серйозний сигнал.",
        "shows": "Список процесів з підписами, виробник, дійсність сертифіката, непідписані процеси виділяються червоним.",
        "when": "Більшість шкідливого ПЗ або не має підпису або підписане фейковими сертифікатами. Цей модуль виявляє це одразу.",
    },
]

def load_published() -> dict:
    if os.path.exists(PUBLISHED_FILE):
        with open(PUBLISHED_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"published": [], "count": 0, "promo_index": 0}

def save_published(data: dict):
    with open(PUBLISHED_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

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

Сьогодні пишемо про конкретний модуль продукту:
Модуль: {module_data['module']}
Що перевіряє: {module_data['what']}
Що показує в звіті: {module_data['shows']}
Коли особливо важливо: {module_data['when']}

Структура посту:
1. Емодзі + заголовок про цей модуль (не копіюй назву дослівно)
2. Що саме перевіряє цей модуль і як це працює технічно
3. Що конкретно побачиш у звіті — які дані, як виглядає
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
    if POST_TYPE == "promo":
        promo_index = published_data.get("promo_index", 0)
        module_data = PROMO_MODULES[promo_index % len(PROMO_MODULES)]
        print(f"Генеруємо пост про модуль: {module_data['module']} ({promo_index % len(PROMO_MODULES) + 1}/{len(PROMO_MODULES)})...")
        promo_text = generate_promo_post(module_data)
        print(f"Згенеровано ({len(promo_text)} символів)")
        if send_telegram(promo_text):
            print("✅ Рекламний пост опубліковано!")
            published_data["promo_index"] = promo_index + 1
            save_published(published_data)
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
        else:
            print("❌ Помилка публікації")

if __name__ == "__main__":
    main()
