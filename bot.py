#!/usr/bin/env python3
"""
CryptoLock Telegram Bot
Автоматично генерує і публікує пости з тематики Windows/Security
Бере теми з папок posts/ і posts-en/ проекту
"""

import os
import json
import glob
import random
import anthropic
import requests
from datetime import datetime
from pathlib import Path

# ─── Конфігурація ────────────────────────────────────────────────────────────

TELEGRAM_TOKEN = os.environ.get("TELEGRAM_TOKEN")
CHANNEL_ID     = os.environ.get("TELEGRAM_CHANNEL_ID")  # наприклад @mychannel або -1001234567890
ANTHROPIC_KEY  = os.environ.get("ANTHROPIC_API_KEY")

# Папка з постами (відносно місця запуску скрипту)
POSTS_DIR_UK   = os.environ.get("POSTS_DIR_UK", "../pctips-template/posts")
POSTS_DIR_EN   = os.environ.get("POSTS_DIR_EN", "../pctips-template/posts-en")

# Файл що зберігає вже опубліковані slug-и
PUBLISHED_FILE = "published.json"

# Мова постів: "uk" = українська, "en" = англійська, "mixed" = обидві
POST_LANGUAGE  = os.environ.get("POST_LANGUAGE", "uk")

# Посилання на сайт кожні N постів (0 = ніколи)
LINK_EVERY_N   = int(os.environ.get("LINK_EVERY_N", "4"))
SITE_URL       = "https://cryptolockua.com"

# ─── Утиліти ─────────────────────────────────────────────────────────────────

def load_published() -> dict:
    """Завантажує список опублікованих статей"""
    if os.path.exists(PUBLISHED_FILE):
        with open(PUBLISHED_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"published": [], "count": 0}


def save_published(data: dict):
    """Зберігає список опублікованих статей"""
    with open(PUBLISHED_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def get_all_articles() -> list[dict]:
    """Збирає всі статті з posts/ і posts-en/"""
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
            # Читаємо frontmatter
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                title = ""
                description = ""
                tags = []
                for line in content.split("\n"):
                    if line.startswith("title:"):
                        title = line.split(":", 1)[1].strip().strip('"')
                    elif line.startswith("description:"):
                        description = line.split(":", 1)[1].strip().strip('"')
                    elif line.startswith("tags:"):
                        tags_raw = line.split(":", 1)[1].strip()
                        tags = [t.strip().strip('"[]') for t in tags_raw.split(",") if t.strip()]

                if title:
                    articles.append({
                        "slug": slug,
                        "title": title,
                        "description": description,
                        "tags": tags,
                        "lang": lang,
                        "filepath": filepath,
                    })
            except Exception as e:
                print(f"  Помилка читання {filepath}: {e}")

    return articles


def pick_next_article(articles: list[dict], published_data: dict) -> dict | None:
    """Обирає наступну непублікновану статтю"""
    published_slugs = set(published_data.get("published", []))
    unpublished = [a for a in articles if a["slug"] not in published_slugs]

    if not unpublished:
        print("Всі статті опубліковані! Починаємо з початку...")
        published_data["published"] = []
        save_published(published_data)
        unpublished = articles

    # Випадковий вибір з непублікованих
    return random.choice(unpublished) if unpublished else None


def generate_post(article: dict, include_link: bool) -> str:
    """Генерує текст посту через Claude API"""
    client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)

    lang_instruction = (
        "Пиши українською мовою." if article["lang"] == "uk"
        else "Write in Ukrainian language (the channel is for Ukrainian audience)."
    )

    link_instruction = ""
    if include_link:
        slug = article["slug"]
        if article["lang"] == "en":
            url = f"{SITE_URL}/en/{slug}"
        else:
            url = f"{SITE_URL}/{slug}"
        link_instruction = f"\n\nВ кінці посту додай рядок: 🔗 {url}"

    prompt = f"""Ти адміністратор Telegram каналу про Windows і комп'ютерну безпеку.

Напиши короткий практичний пост для Telegram на основі цієї теми:
Заголовок: {article['title']}
Опис: {article['description']}

Вимоги:
- {lang_instruction}
- Довжина: 150-250 слів
- Формат: практично і по суті, без зайвої води
- Починай з емодзі + короткий заголовок (не копіюй заголовок статті дослівно)
- Далі 3-5 конкретних порад або кроків
- Якщо доречно — коротка команда PowerShell або CMD у форматі коду
- В кінці 2-4 хештеги (наприклад #windows #безпека #tips)
- НЕ додавай посилань на статтю (крім якщо явно вказано){link_instruction}

Стиль: дружній, технічний, як від досвідченого системного адміністратора."""

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=600,
        messages=[{"role": "user", "content": prompt}]
    )

    return message.content[0].text


def send_telegram(text: str) -> bool:
    """Публікує пост в Telegram канал"""
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    payload = {
        "chat_id": CHANNEL_ID,
        "text": text,
        "parse_mode": "Markdown",
    }
    response = requests.post(url, json=payload, timeout=30)

    if response.status_code == 200:
        return True
    else:
        print(f"Помилка Telegram: {response.status_code} — {response.text}")
        # Спробуй без Markdown якщо є помилка форматування
        if "can't parse" in response.text.lower():
            payload["parse_mode"] = None
            response2 = requests.post(url, json=payload, timeout=30)
            return response2.status_code == 200
        return False


# ─── Головна функція ──────────────────────────────────────────────────────────

def main():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M')}] Запуск бота...")

    # Перевірка конфігурації
    missing = []
    if not TELEGRAM_TOKEN:  missing.append("TELEGRAM_TOKEN")
    if not CHANNEL_ID:      missing.append("TELEGRAM_CHANNEL_ID")
    if not ANTHROPIC_KEY:   missing.append("ANTHROPIC_API_KEY")

    if missing:
        print(f"ПОМИЛКА: не задані змінні середовища: {', '.join(missing)}")
        print("Встанови їх у файлі .env або в середовищі системи")
        return

    # Завантажуємо статті
    articles = get_all_articles()
    if not articles:
        print("ПОМИЛКА: статті не знайдені. Перевір шляхи POSTS_DIR_UK і POSTS_DIR_EN")
        return
    print(f"Знайдено статей: {len(articles)}")

    # Вибираємо наступну
    published_data = load_published()
    article = pick_next_article(articles, published_data)
    if not article:
        print("Немає статей для публікації")
        return

    print(f"Обрано: [{article['lang']}] {article['title']}")

    # Визначаємо чи додавати посилання
    count = published_data.get("count", 0)
    include_link = (LINK_EVERY_N > 0) and (count % LINK_EVERY_N == LINK_EVERY_N - 1)

    # Генеруємо пост
    print("Генеруємо пост через Claude API...")
    post_text = generate_post(article, include_link)
    print(f"Згенеровано ({len(post_text)} символів)")

    # Публікуємо
    print("Публікуємо в Telegram...")
    success = send_telegram(post_text)

    if success:
        print("✅ Пост опубліковано!")
        published_data["published"].append(article["slug"])
        published_data["count"] = count + 1
        published_data["last_post"] = {
            "slug": article["slug"],
            "title": article["title"],
            "time": datetime.now().isoformat(),
        }
        save_published(published_data)
    else:
        print("❌ Помилка публікації")


if __name__ == "__main__":
    main()
