---
title: "Як заблокувати сайти через GPO в Windows"
date: "2026-04-03"
description: "Блокування веб-сайтів для всіх користувачів через Group Policy і файл hosts без стороннього ПЗ в Windows 10 і 11."
tags: ["gpo", "групова-політика", "безпека", "мережа"]
readTime: 5
---

Потрібно заблокувати соціальні мережі або розважальні сайти на робочих ПК? GPO і файл hosts — два надійних способи без додаткового ПЗ.

## Спосіб 1: Через файл hosts (простий)

Файл hosts перенаправляє домени на неіснуючий IP — сайт не відкривається.

**Крок 1.** Відкрий Блокнот від адміністратора.

**Крок 2.** Файл → Відкрити → перейди до:
```
C:\Windows\System32\drivers\etc\hosts
```

**Крок 3.** Додай рядки в кінець файлу:
```
0.0.0.0 youtube.com
0.0.0.0 www.youtube.com
0.0.0.0 facebook.com
0.0.0.0 www.facebook.com
```

**Крок 4.** Збережи → очисти DNS кеш:
```cmd
ipconfig /flushdns
```

---

## Спосіб 2: Через GPO (для корпоративних мереж)

Якщо потрібно застосувати до всіх ПК у домені через доменну GPO.

**Крок 1.** `gpedit.msc` → перейди:
```
Computer Configuration
  → Windows Settings
    → Scripts (Startup/Shutdown)
      → Startup
```

**Крок 2.** Створи `.bat` скрипт який додає рядки в hosts:
```bat
@echo off
echo 0.0.0.0 youtube.com >> C:\Windows\System32\drivers\etc\hosts
echo 0.0.0.0 facebook.com >> C:\Windows\System32\drivers\etc\hosts
ipconfig /flushdns
```

**Крок 3.** Додай скрипт у Startup → він виконається при кожному запуску.

---

## Спосіб 3: Заблокувати в Internet Explorer/Edge через GPO

```
User Configuration
  → Administrative Templates
    → Windows Components
      → Internet Explorer
        → Internet Control Panel
          → Security Page
```

Додай сайти у **Restricted Sites Zone**.

Для Edge:
```
Computer Configuration
  → Administrative Templates
    → Microsoft Edge
      → Content settings
```

**Block access to a list of URLs** → увімкни → додай URLs.

---

## Як перевірити що блокування працює

```cmd
ping youtube.com
```

Якщо показує `0.0.0.0` або `Destination host unreachable` — блокування активне.

---

## Зняти блокування

Видали відповідні рядки з файлу hosts → збережи → `ipconfig /flushdns`.
