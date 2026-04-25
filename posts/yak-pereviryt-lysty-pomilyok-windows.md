---
title: "Як переглянути і зрозуміти журнали помилок Windows"
date: "2026-05-23"
publishDate: "2026-05-23"
description: "Де знайти журнали помилок Windows, як читати Event Viewer, фільтрувати критичні події і знаходити причину зависань і синього екрана через логи."
tags: ["windows", "діагностика", "відновлення", "моніторинг", "cmd"]
readTime: 6
---

Коли Windows зависає, перезавантажується або щось перестає працювати — причина майже завжди є у журналах. Розберемо як їх знайти і прочитати.

---

## Event Viewer — основний інструмент

`Win + R` → `eventvwr.msc`

Або: `Win + X` → **Перегляд подій**

### Структура журналів

- **Windows Logs → System** — системні події: драйвери, служби, обладнання
- **Windows Logs → Application** — помилки програм
- **Windows Logs → Security** — входи в систему, зміни прав, аудит
- **Windows Logs → Setup** — встановлення Windows і компонентів
- **Applications and Services Logs** — детальні логи конкретних компонентів

---

## Як знайти причину синього екрана (BSOD)

Після BSOD найважливіша інформація в **System**:

1. Відкрий **Windows Logs → System**
2. Клікни **Фільтрувати поточний журнал** (права панель)
3. Вибери рівні: **Критичний** і **Помилка**
4. Знайди записи з часом що збігається з часом BSOD

Джерела на які варто звертати увагу: `Kernel-Power` (помилка живлення), `BugCheck` (код BSOD), `disk` (проблеми з диском).

Детальніше про BSOD: [Синій екран смерті — причини і рішення](/siniy-ekran-smerti-bsod-yak-vypravyty)

---

## Як знайти причину зависання

Зависання зазвичай не залишає BSOD. Шукай:

**Windows Logs → System** → фільтруй по `Критичний`:
- `EventID 41` (Kernel-Power) — система перезавантажилась без коректного вимкнення
- `EventID 6008` — несподіване вимкнення

```powershell
# Знайти всі несподівані перезавантаження за останній місяць
Get-WinEvent -FilterHashtable @{
  LogName = 'System'
  Id = 41, 6008
  StartTime = (Get-Date).AddDays(-30)
} | Select-Object TimeCreated, Id, Message | Format-List
```

---

## Як фільтрувати події в Event Viewer

**Через GUI:**
1. Вибери журнал (наприклад, System)
2. Права панель → **Фільтрувати поточний журнал**
3. Вибери рівні, часовий діапазон, ID подій

**Через PowerShell** — швидше для пошуку конкретних подій:

```powershell
# Всі критичні події за останні 24 години
Get-WinEvent -FilterHashtable @{
  LogName = 'System'
  Level = 1,2  # 1=Critical, 2=Error
  StartTime = (Get-Date).AddHours(-24)
} | Select-Object TimeCreated, Id, ProviderName, Message | Format-List

# Помилки конкретного джерела
Get-WinEvent -FilterHashtable @{
  LogName = 'System'
  ProviderName = 'disk'
} | Select-Object TimeCreated, Id, Message

# Всі входи в систему за сьогодні
Get-WinEvent -FilterHashtable @{
  LogName = 'Security'
  Id = 4624
  StartTime = (Get-Date).Date
} | Select-Object TimeCreated, Message
```

---

## Важливі EventID які варто знати

| ID | Журнал | Що означає |
|----|--------|-----------|
| 41 | System | Несподіване перезавантаження |
| 6008 | System | Система не вимкнулась коректно |
| 7034 | System | Служба несподівано завершилась |
| 7036 | System | Служба запущена або зупинена |
| 1001 | Application | Аварійне завершення програми |
| 4624 | Security | Успішний вхід |
| 4625 | Security | Невдала спроба входу |
| 4648 | Security | Вхід з явними обліковими даними |
| 4740 | Security | Обліковий запис заблокований |

---

## Зберегти і відправити журнал

Якщо потрібно відправити лог в підтримку:

1. Клікни правою кнопкою на журнал → **Зберегти всі події як**
2. Вибери формат `.evtx` (читається в Event Viewer) або `.csv`

Або через PowerShell:

```powershell
# Зберегти відфільтровані події в CSV
Get-WinEvent -FilterHashtable @{LogName='System'; Level=1,2} |
  Select-Object TimeCreated, Id, ProviderName, Message |
  Export-Csv "C:\errors.csv" -Encoding UTF8 -NoTypeInformation
```

---

## Очистити журнали

Якщо журнали переповнені і уповільнюють систему:

**GUI:** клікни правою на журнал → **Очистити журнал**

**PowerShell:**

```powershell
# Очистити журнал System
Clear-EventLog -LogName System

# Очистити всі журнали Windows
Get-EventLog -List | ForEach-Object { Clear-EventLog -LogName $_.Log }
```

> Перед очисткою збережи копію якщо розслідуєш проблему.

---

## Підсумок

Для діагностики зависань і BSOD — **Windows Logs → System**, фільтр по Critical і Error, EventID 41 і 6008. Для безпеки — **Security**, EventID 4625 (невдалі входи) і 4740 (блокування). PowerShell дозволяє автоматизувати пошук і зберігати звіти.
