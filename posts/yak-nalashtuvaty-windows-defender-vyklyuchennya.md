---
title: "Виключення Windows Defender: як додати без вимкнення захисту"
date: "2026-12-22"
publishDate: "2026-12-22"
description: "Windows Defender блокує легальну програму або уповільнює роботу? Додай точкові виключення для папки, файлу або процесу — захист решти системи залишиться активним."
tags: ["windows", "безпека", "windows-defender", "налаштування"]
translatesEn: "how-to-configure-windows-defender-exclusions"
readTime: 4
---

Defender іноді помилково блокує легальне ПЗ — ігрові чіт-детектори, інструменти розробника, старі програми. Правильне рішення — точкове виключення, а не вимкнення захисту.

---

## Через Параметри (найпростіше)

`Win + I` → **Конфіденційність і безпека** → **Безпека Windows** → **Захист від вірусів і загроз** → **Параметри захисту** → прокрути до **Виключення** → **Додати або видалити виключення**

Натисни **+ Додати виключення** → вибери тип:
- **Папка** — вся директорія і підпапки
- **Файл** — конкретний файл
- **Тип файлу** — всі файли з цим розширенням
- **Процес** — файли відкриті цим процесом

---

## Через PowerShell

```powershell
# Переглянути поточні виключення
Get-MpPreference | Select-Object ExclusionPath, ExclusionExtension, ExclusionProcess

# Додати виключення папки
Add-MpPreference -ExclusionPath "C:\Dev\Projects"
Add-MpPreference -ExclusionPath "D:\VirtualMachines"

# Виключення типу файлу
Add-MpPreference -ExclusionExtension ".vmdk"
Add-MpPreference -ExclusionExtension ".log"

# Виключення процесу
Add-MpPreference -ExclusionProcess "node.exe"
Add-MpPreference -ExclusionProcess "python.exe"

# Видалити виключення
Remove-MpPreference -ExclusionPath "C:\Dev\Projects"
```

---

## Типові виключення для різних задач

**Для розробників:**
```powershell
Add-MpPreference -ExclusionPath "C:\Dev"
Add-MpPreference -ExclusionProcess "node.exe"
Add-MpPreference -ExclusionProcess "python.exe"
Add-MpPreference -ExclusionExtension ".pdb"
```

**Для віртуальних машин:**
```powershell
Add-MpPreference -ExclusionExtension ".vmdk"
Add-MpPreference -ExclusionExtension ".vhd"
Add-MpPreference -ExclusionExtension ".vhdx"
Add-MpPreference -ExclusionPath "D:\VMs"
```

**Для ігор:**
```powershell
Add-MpPreference -ExclusionPath "D:\SteamLibrary"
Add-MpPreference -ExclusionPath "C:\Program Files\Epic Games"
```

---

## Чому не варто вимикати Defender повністю

```powershell
# ПОГАНО — вимикає весь захист
Set-MpPreference -DisableRealtimeMonitoring $true

# ДОБРЕ — виключає тільки конкретну папку
Add-MpPreference -ExclusionPath "C:\Dev\MyTool"
```

---

## Перевірити що Defender заблокував

```powershell
# Останні дії Defender
Get-MpThreatDetection | Select-Object -Last 10 ThreatName, ActionSuccess, Resources |
  Sort-Object @{e={$_.InitialDetectionTime}} -Descending
```

Або: **Безпека Windows** → **Журнал захисту** — показує все що Defender нещодавно заблокував або помістив в карантин.

---

## Небезпечні виключення — чого уникати

🚫 Не виключай: `C:\`, `%TEMP%`, `%APPDATA%\Local\Temp` — саме там ховається більшість малваре.

---

## Резюме

`Add-MpPreference -ExclusionPath` для папок, `-ExclusionProcess` для програм. Перевір Журнал захисту щоб зрозуміти що саме блокується перед додаванням виключення. Ніколи не виключай тимчасові папки і весь диск C:.

> 🛡️ Для повної перевірки безпеки ПК — [AuditShield](/tools/auditshield) аналізує систему по 22 напрямках.
