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
    "audience": "Власники бізнесу, ФОП, HR менеджери, IT спеціалісти — всі хто хоче знати чи зливають дані з корпоративного або особистого ПК.",
    "benefits": [
        "22 модулі перевірки — USB, мережа, процеси, браузери, автозапуск, витоки файлів та інше",
        "Нічого не встановлюється і не змінюється в системі",
        "Звіт зберігається тільки локально на вашому ПК",
        "Результат за 10 хвилин у зрозумілому HTML форматі",
        "Є безкоштовне демо на 4 модулі — одразу в боті",
    ],
    "pricing": "Старт — 3 запуски | $9 USDT\nБазовий — 5 запусків | $13 USDT\nПро — 10 запусків | $22 USDT\nОплата карткою Monobank або USDT",
    "link": "@AuditShield\\_01\\_Bot",
    "demo": "Безкоштовне демо на 4 модулі — одразу в боті @AuditShield\\_01\\_Bot",
}

PROMO_STYLES = [
    "біль і страх втрати: покажи що може статись якщо не перевірити ПК. Конкретні страшні сценарії — злив даних, шпигунське ПЗ, крадіжка паролів. В кінці — рішення це AuditShield.",
    "соціальний доказ і довіра: пиши від імені людини яка вже використала інструмент і була шокована результатом. Знайшла щось підозріле. Конкретно і живо.",
    "цікавість і виклик: постав питання які змушують людину засумніватись в безпеці свого ПК прямо зараз. Чи знаєш ти що зараз підключено до твого ПК? Хто має доступ? Що запускається при старті?",
    "вигода і швидкість: акцент на тому що за 10 хвилин людина отримує повну картину безпеки. Порівняй з тим скільки коштує найняти IT спеціаліста або що коштує витік даних.",
    "ексклюзивність і терміновість: унікальний інструмент якого немає аналогів на ринку. Демо безкоштовно — але треба діяти зараз.",
    "освітній підхід: поясни одну конкретну загрозу (наприклад USB-атаки або підозрілий автозапуск) і покажи що AuditShield це виявляє за хвилини.",
    "прямий продаж: чітко і агресивно. Ціна, що отримуєш, чому варто. Заклик до дії максимально прямий.",
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
    prompt = f"""Ти топовий копірайтер і маркетолог. Пишеш рекламний пост для Telegram каналу про Windows і безпеку.
Продукт:
Назва: {PRODUCT['name']}
Що робить: {PRODUCT['description']}
Для кого: {PRODUCT['audience']}
Переваги:
{chr(10).join('- ' + b for b in PRODUCT['benefits'])}
Ціни: {PRODUCT['pricing']}
Посилання: {PRODUCT['link']}
Демо: {PRODUCT['demo']}
Стиль цього посту: {style}
Вимоги:
- Пиши українською мовою
- Довжина: 150-220 слів
- Максимально переконливо — людина має захотіти натиснути прямо зараз
- Починай з потужного емодзі + заголовок який б'є в саму точку
- Заклик до дії в кінці — чіткий і прямий
- В кінці хештеги: #безпека #windows #аудит #AuditShield
- НЕ пиши що це реклама чи спонсорський пост
- Посилання на бот пиши ТІЛЬКИ так: @AuditShield\_01\_Bot"""
    message = client.messages.create(model="claude-sonnet-4-5", max_tokens=600, messages=[{"role": "user", "content": prompt}])
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
