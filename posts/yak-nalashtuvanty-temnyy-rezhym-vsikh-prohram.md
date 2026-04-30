---
title: "Темна тема в Windows і програмах: як увімкнути скрізь"
date: "2026-04-28"
publishDate: "2026-04-28"
description: "Як увімкнути темний режим в Windows 10 і 11, Office, браузерах і більшості програм одночасно через системні налаштування."
tags: ["windows", "налаштування", "персоналізація"]
readTime: 4
---

`Параметри` → `Персоналізація` → `Кольори` → **Виберіть режим**: Темний — вмикає темну тему для системи і підтримуваних програм одразу.

---

## Браузери

**Chrome/Edge:** `...` → Налаштування → Вигляд → Тема → вибери темну або "Слідувати системним".

**Firefox:** Налаштування → Загальні → Управління кольорами → Системна тема.

---

## Microsoft Office

Файл → Обліковий запис → Тема Office → **Чорна**.

---

## Програми без темного режиму

```powershell
# Примусово темний режим для win32 програм
Set-ItemProperty "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize" `
  -Name "AppsUseLightTheme" -Value 0 -Type DWord
Set-ItemProperty "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Themes\Personalize" `
  -Name "SystemUsesLightTheme" -Value 0 -Type DWord
```

---

## Підсумок

`Параметри` → `Персоналізація` → `Кольори` → **Темний** — один крок для більшості програм.
