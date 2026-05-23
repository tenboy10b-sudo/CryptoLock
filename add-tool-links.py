#!/usr/bin/env python3
"""
add-tool-links.py
Автоматично додає посилання на інструменти сайту в релевантні статті.
Запускай з папки проекту: python add-tool-links.py
"""

import os
import re

# ─── Налаштування ────────────────────────────────────────────────────────────

POSTS_DIR    = 'posts'
POSTS_EN_DIR = 'posts-en'

# Блок для статей про помилки/BSOD/відновлення
BLOCK_ERROR_DECODER = """
---

## 🔍 Не знаєш що означає код помилки Windows?

Якщо Windows показує код на кшталт `0x80070005`, `0x80070002` або `0xC000021A` — скористайся безкоштовним інструментом:

**[→ Декодер помилок Windows](/tools/windows-error-decoder)** — введи код і одразу дізнайся що він означає та як виправити.

"""

# Блок для статей про безпеку/аудит
BLOCK_AUDITSHIELD = """
---

## 🛡️ Перевір безпеку свого ПК

Хочеш знати чи немає витоків даних, зайвих служб або підозрілих програм на твоєму ПК?

**[→ AuditShield](/tools/auditshield)** — аудит Windows по 22 напрямках за 10 хвилин. HTML-звіт з оцінкою ризику. Є безкоштовне демо.

"""

# ─── Правила — які ключові слова → який блок ────────────────────────────────

RULES = [
    {
        'name': 'error-decoder',
        'block': BLOCK_ERROR_DECODER,
        'marker': '/tools/windows-error-decoder',  # не дублювати якщо вже є
        'uk_slugs': [
            'siniy-ekran-smerti', 'bsod', 'pomylky', 'sfc-dism', 'vidnovlennya',
            'chkdsk', 'diahnostyk', 'zhurnal-podiy', 'event-viewer',
            'vidklyuchennya-avtoonovlennya', 'system-restore',
        ],
        'en_slugs': [
            'error', 'fix-windows', 'bsod', 'troubleshoot', 'reliability-monitor',
            'sfc', 'dism', 'chkdsk', 'slow-boot', 'black-screen',
        ],
        'title_keywords': [
            'помилк', 'виправ', 'синій екран', 'відновлення', 'діагностик',
            'error', 'fix', 'bsod', 'troubleshoot', 'repair', 'restore',
        ],
    },
    {
        'name': 'auditshield',
        'block': BLOCK_AUDITSHIELD,
        'marker': '/tools/auditshield',
        'uk_slugs': [
            'bezpeka', 'bezpechnoi', 'virus', 'zakhyst', 'usb-zakhyst',
            'defender', 'brandmauer', 'audit', 'monitorynh',
        ],
        'en_slugs': [
            'security', 'defender', 'malware', 'virus', 'audit',
            'applocker', 'sandbox-malware', 'firewall', 'bitlocker',
        ],
        'title_keywords': [
            'безпек', 'захист', 'вірус', 'аудит', 'перевір',
            'security', 'audit', 'malware', 'protect', 'defender',
        ],
    },
]


# ─── Логіка ──────────────────────────────────────────────────────────────────

def get_title(content):
    for line in content.split('\n'):
        if line.startswith('title:'):
            return line.split(':', 1)[1].strip().strip('"\'')
    return ''


def should_add(content, slug, rule, is_en):
    """Перевіряє чи потрібно додати блок до цієї статті"""
    # Вже є — пропускаємо
    if rule['marker'] in content:
        return False

    slug_lower = slug.lower()
    title = get_title(content).lower()

    # Перевіряємо slug
    slug_keywords = rule['en_slugs'] if is_en else rule['uk_slugs']
    for kw in slug_keywords:
        if kw in slug_lower:
            return True

    # Перевіряємо заголовок
    for kw in rule['title_keywords']:
        if kw.lower() in title:
            return True

    return False


def insert_block(content, block):
    """Вставляє блок перед розділом Резюме або в кінці"""
    # Шукаємо ## Резюме або ## Summary
    patterns = [
        r'\n## Резюме\n',
        r'\n## Summary\n',
        r'\n## Висновок\n',
        r'\n## Conclusion\n',
    ]
    for pattern in patterns:
        match = re.search(pattern, content)
        if match:
            pos = match.start()
            return content[:pos] + '\n' + block + content[pos:]

    # Якщо не знайшли — додаємо в кінець
    return content.rstrip() + '\n' + block


def process_dir(directory, is_en):
    if not os.path.exists(directory):
        print(f'  Папка не знайдена: {directory}')
        return 0, 0

    files = [f for f in os.listdir(directory) if f.endswith('.md')]
    modified = 0
    skipped = 0

    for filename in sorted(files):
        slug = filename.replace('.md', '')
        filepath = os.path.join(directory, filename)

        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        changed = False
        for rule in RULES:
            if should_add(content, slug, rule, is_en):
                content = insert_block(content, rule['block'])
                print(f'  ✅ [{rule["name"]}] {filename}')
                changed = True

        if changed:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            modified += 1
        else:
            skipped += 1

    return modified, skipped


def main():
    print('=' * 50)
    print('Додавання посилань на інструменти в статті')
    print('=' * 50)

    print(f'\n📁 UK статті ({POSTS_DIR}):')
    uk_mod, uk_skip = process_dir(POSTS_DIR, is_en=False)

    print(f'\n📁 EN статті ({POSTS_EN_DIR}):')
    en_mod, en_skip = process_dir(POSTS_EN_DIR, is_en=True)

    total_mod = uk_mod + en_mod
    total_skip = uk_skip + en_skip

    print(f'\n{"=" * 50}')
    print(f'Оновлено файлів:  {total_mod}')
    print(f'Пропущено:        {total_skip}')
    print(f'{"=" * 50}')
    print('\nГотово! Перевір зміни і зроби git commit.')


if __name__ == '__main__':
    main()
