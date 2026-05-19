#!/usr/bin/env python3
"""
CryptoLock Telegram Bot
POST_TYPE=content — публікує корисний пост про Windows
POST_TYPE=promo   — публікує рекламний пост про AuditShield
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

PRODUCT = {
    "name": "AuditShield — Windows Security Audit Tool",
    "description": "Програма яка аналізує Windows ПК по 22 напрямках і видає детальний HTML-звіт з оцінкою ризику за 10 хвилин.",
    "modules": [
        "USB-історія — всі пристрої що коли-небудь підключались до ПК",
        "Автозапуск — всі програми що стартують разом з Windows",
        "Запущені процеси — що зараз працює в системі",
        "Мережеві підключення — активні з'єднання і підозрілі адреси",
        "Браузери — розширення, збережені паролі, історія",
        "Планувальник завдань — приховані задачі які запускаються по розкладу",
        "Встановлені програми — повний список з датами встановлення",
        "Служби Windows — активні і вимкнені системні служби",
        "Відкриті порти — які порти слухають підключення ззовні",
        "Брандмауер — правила і виключення",
        "Оновлення Windows — які патчі встановлені і які відсутні",
        "Антивірус — статус і актуальність баз",
        "Облікові записи — всі локальні користувачі і адміністратори",
        "Спільні папки — що відкрито для доступу по мережі",
        "Точки відновлення системи",
        "Журнал помилок — критичні події за останні дні",
        "Тимчасові файли і підозрілі директорії",
        "Hosts файл — чи не змінений для перенаправлення трафіку",
        "Реєстр — підозрілі ключі автозапуску",
        "RDP і віддалений доступ — чи увімкнений і хто підключався",
        "BitLocker і шифрування дисків",
        "Цифрові підписи запущених процесів — чи всі підписані легітимно",
    ],
    "report": "Детальний HTML-звіт з кольоровими індикаторами ризику: зелений (норма), жовтий (увага), червоний (загроза). Зберігається локально на ПК.",
    "pricing": "Старт — 3 запуски | $9\nБазовий — 5 запусків | $13\nПро — 10 запусків | $22\nОплата Monobank або USDT",
    "link": "@AuditShield\\_01\\_Bot",
    "demo": "Безкоштовне демо на 4 модулі в @AuditShield\\_01\\_Bot",
}

PROMO_STYLES = [
    f"""ФОРМАТ: Один модуль детально.
Вибери ОДИН модуль з цього списку і розкажи про нього детально:
{chr(10).join('- ' + m for m in PRODUCT['modules'])}

Структура посту:
- Назва модуля і що він перевіряє (конкретно і технічно)
- Які саме дані показує в звіті
- 2-3 реальні ситуації коли ця інформація критично важлива (наприклад: взяв ПК з ремонту, підключили чужий USB, новий співробітник)
- В кінці — заклик спробувати демо в @AuditShield\\_01\\_Bot

Тон: технічний, конкретний, без вигаданих історій.""",

    f"""ФОРМАТ: Як виглядає звіт AuditShield.
Розкажи підписникам як виглядає HTML-звіт який генерує програма.
Деталі звіту: {PRODUCT['report']}

Структура посту:
- Що таке HTML-звіт і чому це зручно (відкривається в браузері, не треба нічого встановлювати)
- Система кольорових індикаторів: зелений/жовтий/червоний — що означає кожен
- Як структурований звіт — розділи по модулях, загальна оцінка ризику
- Чому звіт зберігається локально — приватність, ніхто не бачить твої дані
- Заклик подивитись демо в @AuditShield\\_01\\_Bot

Тон: описовий, як огляд продукту.""",

    f"""ФОРМАТ: Сценарії використання — коли саме потрібен AuditShield.
Опиши 4-5 конкретних ситуацій коли запустити аудит — це must:
- Купив або отримав вживаний ПК
- ПК повернули з ремонту
- Звільнив або прийняв нового співробітника
- Підключили чужий USB або флешку
- Підозра що хтось має доступ до даних
- Новий орендований офіс з готовими ПК

Для кожної ситуації — що конкретно перевіряє AuditShield і що може знайти.
В кінці — ціни і заклик: @AuditShield\\_01\\_Bot

Тон: практичний, як чеклист.""",

    f"""ФОРМАТ: Порівняння — AuditShield vs ручна перевірка vs IT спеціаліст.
Структура посту:
- Що потрібно перевірити вручну щоб отримати те саме що дає AuditShield (скільки годин, які команди, чи реально це зробити звичайному користувачу)
- Скільки коштує викликати IT спеціаліста для аудиту безпеки (порівняй з $9-22)
- Що AuditShield робить за 10 хвилин автоматично
- Висновок: ціна питання очевидна
- Ціни: {PRODUCT['pricing']}
- Заклик: @AuditShield\\_01\\_Bot

Тон: аналітичний, з конкретними цифрами.""",

    f"""ФОРМАТ: Технічні деталі — як це працює під капотом.
Розкажи технічно як влаштований AuditShield:
- Що значить "нічого не встановлюється" — як запускається програма
- Чому звіт зберігається тільки локально — де дані, хто їх бачить
- Що значить "не змінює систему" — тільки читає, нічого не пише
- Як програма збирає дані з 22 модулів — які системні інструменти використовує
- Чому результат саме в HTML форматі — зручність, читабельність, можна зберегти

В кінці — заклик: @AuditShield\\_01\\_Bot

Тон: технічний, для людей які хочуть розуміти що відбувається.""",

    f"""ФОРМАТ: Огляд групи модулів — мережева безпека.
Зроби детальний огляд модулів пов'язаних з мережею:
- Мережеві підключення (що показує, які дані)
- Відкриті порти (що це означає, коли небезпечно)
- Брандмауер (правила і виключення — що підозріле)
- RDP і віддалений доступ (хто підключався, коли)
- Hosts файл (навіщо перевіряти, що може бути змінено)

Для кожного — що конкретно показує в звіті і що означає якщо там щось знайдено.
В кінці — заклик: @AuditShield\\_01\\_Bot

Тон: освітній, технічний.""",

    f"""ФОРМАТ: Огляд групи модулів — прихована активність.
Зроби детальний огляд модулів які виявляють приховану активність на ПК:
- Автозапуск (що стартує з Windows і навіщо це знати)
- Планувальник завдань (приховані задачі — як їх бачить AuditShield)
- Реєстр (підозрілі ключі автозапуску)
- Цифрові підписи процесів (непідписані процеси — що це означає)
- Тимчасові файли і підозрілі директорії

Для кожного — що конкретно показує в звіті і на що звертати увагу.
В кінці — заклик: @AuditShield\\_01\\_Bot

Тон: освітній, технічний.""",
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

def generate_promo_post(style):
    client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)
    prompt = f"""Ти копірайтер який пише про реальний продукт для Telegram каналу про Windows і безпеку.

Продукт: {PRODUCT['name']}
Що робить: {PRODUCT['description']}
Звіт: {PRODUCT['report']}
Ціни: {PRODUCT['pricing']}
Посилання: {PRODUCT['link']}

{style}

Загальні вимоги:
- Українська мова
- Довжина: 180-250 слів
- Пиши про реальний функціонал продукту — без вигаданих персонажів і історій
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
        style = PROMO_STYLES[promo_index % len(PROMO_STYLES)]
        print(f"Генеруємо рекламний пост (стиль {promo_index % len(PROMO_STYLES) + 1}/{len(PROMO_STYLES)})...")
        promo_text = generate_promo_post(style)
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
