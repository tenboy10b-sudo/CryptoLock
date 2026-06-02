---
title: "AppLocker Windows: обмеження запуску застосунків через правила"
date: "2026-07-05"
publishDate: "2026-07-05"
description: "Налаштування AppLocker для дозволу або блокування застосунків за підписом, шляхом або хешем. Правила для exe, скриптів і інсталяторів через PowerShell і GPO."
tags: ["windows", "applocker", "безпека", "gpo", "powershell", "адміністрування"]
readTime: 5
translatesEn: "how-to-configure-windows-applocker"
---

AppLocker контролює які застосунки можуть запускатись — за підписом видавця, шляхом або хешем.

---

## Вимоги

- Windows 10/11 **Enterprise** або **Education**
- Служба Application Identity має бути запущена

```powershell
Start-Service AppIDSvc
Set-Service AppIDSvc -StartupType Automatic
```

---

## Типи правил

- **Виконувані файли** — .exe, .com
- **Інсталятори** — .msi
- **Скрипти** — .ps1, .bat, .cmd, .vbs
- **Упаковані застосунки** — Microsoft Store

---

## Через GUI

`Win + R` → `secpol.msc` → **Политики управления приложениями** → **AppLocker**

ПКМ → **Автоматичне створення правил** для генерації на основі встановленого ПЗ.

---

## Через PowerShell

```powershell
# Дозволити за підписом видавця
New-AppLockerPolicy -RuleType Publisher `
  -FileInformation (Get-AppLockerFileInformation -Path "C:\Program Files\Notepad++\notepad++.exe") `
  -User Everyone | Set-AppLockerPolicy -Merge

# Експортувати політику
Get-AppLockerPolicy -Effective -Xml | Out-File "C:\Backup\applocker.xml"

# Імпортувати
Set-AppLockerPolicy -XmlPolicy "C:\Backup\applocker.xml"
```

---

## Режим аудиту (тест без блокування)

У `secpol.msc`: ПКМ на колекції правил → Властивості → Виконання → **Тільки аудит**

```powershell
# Тест конкретного файлу
Test-AppLockerPolicy -Path "C:\Downloads\suspicious.exe" -User Everyone
```

---

## Моніторинг подій

```powershell
# Event ID 8004 = заблоковано
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-AppLocker/EXE and DLL'; Id=8004} `
  -MaxEvents 20 | Select-Object TimeCreated, Message
```

---

## Часті питання

### AppLocker працює на Windows 10 Pro?

Частково — правила можна створювати і переглядати в аудиті, але виконання вимагає Enterprise або Education.

### AppLocker vs Windows Defender Application Control (WDAC)?

WDAC — сучасна заміна, виконується на рівні ядра (складніше обійти), працює на всіх редакціях. AppLocker простіший але менш захищений. Для нових розгортань — WDAC.

---

## Резюме

AppIDSvc має бути запущений. Правила через `secpol.msc` або PowerShell. Правила за підписом — кращі (не залежать від версії). Завжди спочатку аудит. Моніторинг Event 8004.
