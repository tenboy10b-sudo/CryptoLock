---
title: "Як налаштувати Windows Defender через GPO"
date: "2025-04-24"
description: "Управління Windows Defender через Group Policy: вимкнення, налаштування сканування, виключення і захист в реальному часі."
tags: ["windows-defender", "gpo", "групова-політика", "безпека"]
readTime: 5
---

Group Policy дозволяє централізовано керувати Windows Defender на всіх ПК в організації — без ручного налаштування кожної машини окремо.

## Де знаходяться налаштування Defender у GPO

`gpedit.msc` → перейди:
```
Computer Configuration
  → Administrative Templates
    → Windows Components
      → Microsoft Defender Antivirus
```

Тут зібрані всі налаштування антивіруса.

---

## Вимкнути Defender (тільки якщо є інший антивірус)

Відкрий **Turn off Microsoft Defender Antivirus** → **Enabled**.

> Увага: вимикати Defender варто тільки якщо встановлений сторонній корпоративний антивірус. Без захисту система вразлива.

---

## Налаштування Real-time Protection

```
Computer Configuration
  → Administrative Templates
    → Windows Components
      → Microsoft Defender Antivirus
        → Real-time Protection
```

| Політика | Призначення |
|---|---|
| **Turn off real-time protection** | Вимкнути захист в реальному часі |
| **Turn on behavior monitoring** | Моніторинг підозрілої поведінки |
| **Scan all downloaded files and attachments** | Перевірка завантажених файлів |

---

## Налаштування розкладу сканування

```
Computer Configuration
  → Administrative Templates
    → Windows Components
      → Microsoft Defender Antivirus
        → Scan
```

**Configure scheduled scan day** → вибери день тижня.

**Specify the scan type to use** → **Full Scan** або **Quick Scan**.

**Specify the time for a daily quick scan** → введи час у хвилинах від опівночі (наприклад `120` = 2:00 ночі).

---

## Додати виключення (не перевіряти папку)

```
Computer Configuration
  → Administrative Templates
    → Windows Components
      → Microsoft Defender Antivirus
        → Exclusions
```

**Path Exclusions** → **Enabled** → Show → додай шлях, наприклад:
```
C:\DevProjects\*
D:\Backup\*
```

---

## Захист від підробки (Tamper Protection)

Tamper Protection забороняє стороннім програмам вимикати Defender. Через GPO її вимкнути не можна — тільки через Settings або MDM. Це зроблено навмисно.

---

## Перевірка поточного стану через PowerShell

```powershell
Get-MpComputerStatus | Select-Object RealTimeProtectionEnabled, AntivirusEnabled, BehaviorMonitorEnabled
```

Якщо `RealTimeProtectionEnabled: True` — захист активний.

```powershell
Get-MpPreference | Select-Object ExclusionPath, ExclusionProcess
```

Список поточних виключень.
