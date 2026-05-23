#!/usr/bin/env python3
"""
add-tool-links.py v2
Автоматично додає посилання на всі 6 інструментів сайту в релевантні статті.
Запускай з папки проекту: python add-tool-links.py
"""

import os
import re

POSTS_DIR    = 'posts'
POSTS_EN_DIR = 'posts-en'

BLOCK_ERROR_DECODER = """
---

## 🔍 Не знаєш що означає код помилки Windows?

Якщо Windows показує код на кшталт `0x80070005`, `0x80070002` або `0xC000021A` — скористайся безкоштовним інструментом:

**[→ Декодер помилок Windows](/tools/windows-error-decoder)** — введи код і одразу дізнайся що він означає та як виправити.

"""

BLOCK_AUDITSHIELD = """
---

## 🛡️ Перевір безпеку свого ПК

Хочеш знати чи немає витоків даних, зайвих служб або підозрілих програм?

**[→ AuditShield](/tools/auditshield)** — аудит Windows по 22 напрямках за 10 хвилин. HTML-звіт з оцінкою ризику. Є безкоштовне демо.

"""

BLOCK_POWERSHELL = """
---

## ⚡ Шукаєш потрібну команду?

**[→ PowerShell і CMD довідник](/tools/powershell-commands)** — 40+ команд з пошуком за задачею. Введи "мережа", "диск" або "безпека" і одразу отримай готову команду.

"""

BLOCK_EVENT_ID = """
---

## 📋 Не знаєш що означає Event ID?

**[→ Windows Event ID довідник](/tools/windows-event-id)** — пошук по 20+ ключових подіях безпеки з описом, рівнем загрози і рекомендаціями.

"""

BLOCK_PASSWORD = """
---

## 🔑 Потрібен надійний пароль?

**[→ Генератор паролів](/tools/password-generator)** — криптографічно надійні паролі прямо в браузері. Нічого не передається на сервер.

"""

BLOCK_SUBNET = """
---

## 🌐 Розрахувати параметри підмережі?

**[→ IP/Subnet калькулятор](/tools/subnet-calculator)** — введи IP і CIDR, отримай маску, broadcast, діапазон хостів і бінарне представлення.

"""

RULES = [
    {
        'name': 'error-decoder',
        'block': BLOCK_ERROR_DECODER,
        'marker': '/tools/windows-error-decoder',
        'uk_slugs': ['pomylk','bsod','siniy-ekran','sfc-dism','vidnovlennya','chkdsk','zhurnal-podiy','event-viewer','update-pomylk','ne-zapuskaetsya','chornyi-ekran','galmuje'],
        'en_slugs': ['error','fix-','bsod','troubleshoot','reliability','sfc','dism','chkdsk','slow-boot','black-screen','not-boot','wont-boot','update-error','blue-screen'],
        'title_kw': ['помилк','виправ','синій екран','відновлення','діагностик','error','fix','bsod','troubleshoot','repair','restore','не запуск','гальм','зависа'],
    },
    {
        'name': 'auditshield',
        'block': BLOCK_AUDITSHIELD,
        'marker': '/tools/auditshield',
        'uk_slugs': ['bezpek','zakhyst','virus','defender','brandmauer','audit','monitorynh','usb-zakhyst','ransomware','antyvirus','firewall','bitlocker','vpn','ssh'],
        'en_slugs': ['security','defender','malware','virus','audit','applocker','sandbox-malware','firewall','bitlocker','ransomware','antivirus','secure-','protect'],
        'title_kw': ['безпек','захист','вірус','аудит','перевір','security','audit','malware','protect','defender','шкідлив','витік'],
    },
    {
        'name': 'powershell',
        'block': BLOCK_POWERSHELL,
        'marker': '/tools/powershell-commands',
        'uk_slugs': ['powershell','cmd-komand','terminal','skrypt','avtomatyz','komandn'],
        'en_slugs': ['powershell','cmd-command','command-line','terminal','script','automat','cli'],
        'title_kw': ['powershell','cmd','командний','команд','скрипт','автоматиз','terminal','command','script'],
    },
    {
        'name': 'event-id',
        'block': BLOCK_EVENT_ID,
        'marker': '/tools/windows-event-id',
        'uk_slugs': ['event-viewer','zhurnal-podiy','podiy-windows','event-log','monitorynh-bezpeky'],
        'en_slugs': ['event-viewer','event-log','event-id','security-events','monitor-security','windows-logs'],
        'title_kw': ['event viewer','журнал подій','event id','event log','перегляд подій','security event'],
    },
    {
        'name': 'password',
        'block': BLOCK_PASSWORD,
        'marker': '/tools/password-generator',
        'uk_slugs': ['parol','oblikovyy-zapys','autentyfik','credential','dvofaktornu','2fa'],
        'en_slugs': ['password','account-','credential','authentication','2fa','two-factor'],
        'title_kw': ['пароль','паролі','обліковий запис','автентифікац','password','credential','authentication'],
    },
    {
        'name': 'subnet',
        'block': BLOCK_SUBNET,
        'marker': '/tools/subnet-calculator',
        'uk_slugs': ['merezh','ip-adres','pidmerzh','tcp-ip','wifi','ethernet','static-ip','pidsystem'],
        'en_slugs': ['network-adapter','ip-address','subnet','tcp-ip','static-ip','configure-ip','configure-network'],
        'title_kw': ['підмережа','subnet','ip address','static ip','мережевий адаптер','network adapter'],
    },
]


def get_title(content):
    for line in content.split('\n'):
        if line.startswith('title:'):
            return line.split(':', 1)[1].strip().strip('"\'').lower()
    return ''


def should_add(content, slug, rule, is_en):
    if rule['marker'] in content:
        return False
    slug_lower = slug.lower()
    title = get_title(content)
    keywords = rule['en_slugs'] if is_en else rule['uk_slugs']
    for kw in keywords:
        if kw in slug_lower:
            return True
    for kw in rule['title_kw']:
        if kw.lower() in title:
            return True
    return False


def insert_block(content, block):
    for pattern in [r'\n## Резюме\n', r'\n## Summary\n', r'\n## Висновок\n', r'\n## Conclusion\n']:
        match = re.search(pattern, content)
        if match:
            pos = match.start()
            return content[:pos] + '\n' + block + content[pos:]
    return content.rstrip() + '\n' + block


def process_dir(directory, is_en):
    if not os.path.exists(directory):
        print(f'  Папка не знайдена: {directory}')
        return 0, 0
    files = [f for f in os.listdir(directory) if f.endswith('.md')]
    modified, skipped = 0, 0
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
    print('Додавання посилань на інструменти v2')
    print('=' * 50)
    print(f'\n📁 UK статті ({POSTS_DIR}):')
    uk_mod, uk_skip = process_dir(POSTS_DIR, is_en=False)
    print(f'\n📁 EN статті ({POSTS_EN_DIR}):')
    en_mod, en_skip = process_dir(POSTS_EN_DIR, is_en=True)
    total = uk_mod + en_mod
    print(f'\n{"=" * 50}')
    print(f'Оновлено файлів:  {total}')
    print(f'Пропущено:        {uk_skip + en_skip}')
    print(f'{"=" * 50}')
    print('\nГотово! Зроби git commit.')


if __name__ == '__main__':
    main()
