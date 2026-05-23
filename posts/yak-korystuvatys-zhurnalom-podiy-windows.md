---
title: "Event Viewer: як читати журнал подій Windows"
date: "2026-12-05"
publishDate: "2026-12-05"
description: "Як відкрити і читати Event Viewer в Windows. Що означають рівні Critical, Error, Warning. Найважливіші Event ID для безпеки і пошуку проблем."
tags: ["windows", "діагностика", "безпека", "моніторинг"]
readTime: 5
---

Event Viewer — вбудований інструмент Windows що записує все що відбувається в системі. Якщо щось пішло не так — відповідь майже завжди тут.

---

## Як відкрити

`Win + R` → `eventvwr.msc`

Або: `Win + S` → **Перегляд подій**

---

## Структура журналів

**Windows Logs** — основні журнали:
- **Application** — події програм і служб
- **Security** — входи, зміни прав, аудит
- **System** — події ядра Windows, драйверів, служб

**Applications and Services Logs** — деталізовані журнали окремих компонентів.

---

## Рівні подій

| Рівень | Що означає |
|--------|-----------|
| **Critical** | Збій системи або компонента — потребує негайної уваги |
| **Error** | Серйозна проблема — функція або служба не працює |
| **Warning** | Потенційна проблема — варто перевірити |
| **Information** | Нормальні операції системи |

---

## Як читати подію

Двічі клікни на будь-яку подію → відкриється деталі:

- **Event ID** — унікальний номер типу події
- **Source** — яка програма або служба згенерувала
- **Level** — рівень серйозності
- **Date and Time** — коли сталось
- **Description** — опис що відбулось

**Event ID** — ключ до розуміння. Одне і те ж число завжди означає одне і те ж.

---

## Найважливіші Event ID для безпеки

```powershell
# Невдалі спроби входу за останній день
Get-WinEvent -FilterHashtable @{
  LogName='Security'; Id=4625
  StartTime=(Get-Date).AddDays(-1)
} | Select-Object TimeCreated, Message | Select-Object -First 10
```

Найкритичніші для моніторингу:

- **4625** — невдала спроба входу (brute-force)
- **4720** — створено новий обліковий запис
- **7045** — встановлено нову службу (малваре)
- **4698** — нове заплановане завдання
- **1102** — журнал безпеки очищено (приховування слідів)

---

## Фільтрація подій

Правий клік на журналі → **Фільтрувати поточний журнал**:
- Event level: вибери Error і Critical
- Event ID: введи конкретний номер (наприклад 4625)
- Logged: Last 24 hours

```powershell
# Останні 10 критичних системних подій
Get-WinEvent -FilterHashtable @{
  LogName='System'; Level=1,2
} -MaxEvents 10 | Select-Object TimeCreated, Id, ProviderName, Message
```

---

## Корисні команди

```powershell
# Перевірити конкретний Event ID
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4624} -MaxEvents 5

# Знайти BSOD події
Get-WinEvent -FilterHashtable @{LogName='System'; Id=41} -MaxEvents 5

# Експортувати журнал
wevtutil epl System C:\system-log.evtx
```

---

## 📋 Не знаєш що означає Event ID?

Скористайся нашим безкоштовним довідником:

**[→ Windows Event ID довідник](/tools/windows-event-id)** — пошук по 20+ ключових подіях з описом, рівнем загрози і рекомендаціями.

---

## Резюме

Event Viewer відкривається через `eventvwr.msc`. Для безпеки моніторинг: Security Log, Event ID 4625, 4720, 7045, 1102. PowerShell `Get-WinEvent` для скриптованого аналізу. Незнайомий Event ID — перевір у [довіднику](/tools/windows-event-id).
