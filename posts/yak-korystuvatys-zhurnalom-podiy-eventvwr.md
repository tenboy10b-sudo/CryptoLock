---
title: "Як користуватись Event Viewer для діагностики Windows"
date: "2026-05-03"
publishDate: "2026-05-03"
description: "Використання Event Viewer для діагностики збоїв і помилок Windows. Фільтрація журналів, пошук критичних помилок, експорт подій і моніторинг через PowerShell."
tags: ["windows", "event-viewer", "діагностика", "powershell", "адміністрування"]
readTime: 4
translatesEn: "how-to-configure-windows-event-log"
---

Event Viewer записує все що відбувається в Windows. Це перше місце для діагностики збоїв, повільного завантаження або інцидентів безпеки.

---

## Відкрити Event Viewer

```
Win + R → eventvwr.msc
```

---

## Структура журналів

```
Журнали Windows
├── Приложение   ← помилки застосунків
├── Безпека      ← входи, зміни політик
├── Система      ← драйвери, залізо, служби
└── Установка    ← події встановлення
```

---

## Знайти критичні помилки швидко

```powershell
# Останні 10 критичних і помилок — Система
Get-WinEvent -FilterHashtable @{LogName='System'; Level=1,2} -MaxEvents 10 |
  Select-Object TimeCreated, Id, ProviderName, Message | Format-List

# Помилки за останні 24 години
Get-WinEvent -FilterHashtable @{
  LogName='System','Application'
  Level=1,2
  StartTime=(Get-Date).AddHours(-24)
} | Select-Object TimeCreated, LogName, Id, Message | Format-List
```

---

## Ключові Event ID

```powershell
# Збої і несподівані вимкнення
Get-WinEvent -FilterHashtable @{LogName='System'; Id=41,6008,1001} -MaxEvents 10

# Невдалі спроби входу
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625} -MaxEvents 20

# Нова служба (можливий малваре)
Get-WinEvent -FilterHashtable @{LogName='System'; Id=7045} -MaxEvents 10
```

---

## Експорт журналу

```powershell
# Зберегти журнал для передачі
wevtutil epl System C:\Backup\System.evtx

# Відкрити збережений журнал
Get-WinEvent -Path "C:\Backup\System.evtx" | Select-Object -First 20
```

---

## Часті питання

### Event Viewer показує тисячі помилок — це нормально?

Так. Попередження і інформаційні події дуже поширені. Фокусуйся на Level 1 (Критична) і Level 2 (Помилка) і зіставляй час з коли виникла проблема.

### Як далеко зберігаються логи?

За замовчуванням до 20 МБ — зазвичай 1-4 тижні. Збільшити: `wevtutil sl System /ms:104857600` (100 МБ).

---

## Резюме

Відкрити: `eventvwr.msc`. Починай з System і Application. Фільтруй Level 1 і 2. Ключові ID: 41 (збій), 4625 (невдалий вхід), 7045 (нова служба). Експорт: `wevtutil epl`.
