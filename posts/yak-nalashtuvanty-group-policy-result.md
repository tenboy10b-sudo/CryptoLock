---
title: "Gpresult і RSoP: перевірка застосованих групових політик"
date: "2026-09-26"
publishDate: "2026-09-26"
description: "Як перевірити які групові політики застосовані до користувача і комп'ютера через gpresult, RSoP і GPMC. Діагностика конфліктів і проблем застосування GPO."
tags: ["групова-політика", "gpo", "адміністрування", "windows", "cmd"]
readTime: 6
---

Після налаштування GPO завжди потрібно перевірити чи вона застосувалась правильно. Gpresult і RSoP — основні інструменти для цього.

---

## gpresult — найшвидша перевірка

```cmd
rem Зведений звіт для поточного користувача і комп'ютера
gpresult /r

rem Тільки комп'ютерні політики
gpresult /r /scope computer

rem Тільки користувацькі
gpresult /r /scope user

rem Детальний HTML звіт (відкрий у браузері)
gpresult /h C:\gp-report.html

rem Звіт для іншого користувача
gpresult /r /user DOMAIN\username

rem Звіт для іншого ПК (потрібні права адміна на ньому)
gpresult /r /s PC-NAME /u DOMAIN\admin /p password
```

---

## Що показує gpresult /r

```
RSOP data for DOMAIN\UserName on PC-NAME

OS Configuration:           Member Workstation
OS Version:                 10.0.22631

Applied Group Policy Objects
-------------------------------
  Default Domain Policy     ← застосована
  Office Security Policy    ← застосована

The following GPOs were not applied because they were filtered out
-------------------------------
  Test Policy               ← НЕ застосована
      Filtering: Not Applied (Empty)
```

Якщо GPO в списку "not applied" — шукай причину: Empty (немає налаштувань), Disabled, або Security Filtering.

---

## RSoP — графічний інтерфейс

`Win + R` → `rsop.msc` — відкриває повне дерево застосованих політик у тому ж форматі що і gpedit.msc але показує реальні значення що застосовані.

---

## GPMC — перевірка через Group Policy Management

```
gpmc.msc → Group Policy Results → правою → Group Policy Results Wizard
→ вибери комп'ютер і користувача → Next → Finish
```

Генерує детальний звіт з вкладками:
- **Summary** — які GPO застосовані
- **Settings** — конкретні налаштування і звідки вони прийшли
- **Policy Events** — події застосування GPO

---

## PowerShell

```powershell
# Застосувати GPO негайно
gpupdate /force

# Тільки комп'ютерні
gpupdate /target:computer /force

# Тільки користувацькі
gpupdate /target:user /force

# Переглянути застосовані GPO через PowerShell
Get-GPResultantSetOfPolicy -ReportType Html -Path "C:\rsop.html"

# Звіт для конкретного ПК і користувача
Get-GPResultantSetOfPolicy `
  -Computer "PC-NAME" `
  -User "DOMAIN\username" `
  -ReportType Xml |
  Out-File "C:\rsop.xml"
```

---

## Типові проблеми застосування GPO

### GPO не застосовується

1. Перевір Security Filtering:
```
gpmc.msc → GPO → Scope → Security Filtering
Має бути: Authenticated Users або конкретна група де є цей комп'ютер/користувач
```

2. Перевір WMI Filter:
```
gpmc.msc → GPO → Scope → WMI Filtering
Якщо є WMI фільтр — він може блокувати застосування
```

3. Перевір Link:
```
GPO має бути прив'язана до OU де знаходиться об'єкт
```

### GPO застосовується але налаштування не діє

```cmd
rem Перевірити Event Log застосування GPO
eventvwr.msc → Applications and Services → Microsoft → Windows → GroupPolicy → Operational
```

```powershell
Get-WinEvent -FilterHashtable @{
    LogName = "Microsoft-Windows-GroupPolicy/Operational"
    Level = 2  # Error
    StartTime = (Get-Date).AddDays(-1)
} | Select-Object TimeCreated, Message | Format-List
```

---

## Loopback Processing

```
Computer Configuration → Administrative Templates → System → Group Policy
→ Configure user Group Policy loopback processing mode
→ Enabled → Mode: Replace або Merge
```

Використовується для термінальних серверів і кіосків де потрібно застосувати одні користувацькі налаштування незалежно від того хто входить.

---

## Підсумок

`gpresult /r` — швидка перевірка. `gpresult /h report.html` — детальний звіт. `gpupdate /force` — примусове застосування. Якщо GPO в "not applied" — перевір Security Filtering, WMI Filter і чи прив'язана до правильного OU.
