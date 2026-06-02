---
title: "Як увімкнути Windows Defender Network Protection"
date: "2026-08-07"
publishDate: "2026-08-07"
description: "Увімкнення Windows Defender Network Protection для блокування підключень до шкідливих IP і доменів. Налаштування через PowerShell і GPO, моніторинг заблокованих."
tags: ["windows", "windows-defender", "мережа", "безпека", "powershell"]
readTime: 3
translatesEn: "how-to-configure-windows-defender-network-protection"
---

Network Protection розширює SmartScreen на всі застосунки — блокує вихідні підключення до відомих шкідливих IP і доменів.

---

## Увімкнути

```powershell
# Блокувати
Set-MpPreference -EnableNetworkProtection Enabled

# Режим аудиту (логувати без блокування)
Set-MpPreference -EnableNetworkProtection AuditMode

# Перевірити (0=вимк, 1=блок, 2=аудит)
(Get-MpPreference).EnableNetworkProtection
```

---

## Моніторинг заблокованих підключень

```powershell
# Event ID 1125 = заблоковано, 1126 = аудит
Get-WinEvent -FilterHashtable @{
  LogName='Microsoft-Windows-Windows Defender/Operational'
  Id=1125,1126
} -MaxEvents 20 -EA 0 |
  Select-Object TimeCreated, Id,
    @{n='URL/IP';e={$_.Properties[1].Value}},
    @{n='Процес';e={$_.Properties[5].Value}}
```

---

## Часті питання

### Network Protection vs Windows Firewall?

Firewall контролює порти і протоколи. Network Protection блокує підключення до відомих шкідливих сайтів/IP незалежно від порту. Вони доповнюють один одного.

### Довірений застосунок блокується — як дозволити?

```powershell
Add-MpPreference -ExclusionProcess "C:\TrustedApp\app.exe"
```

### Чи працює з Chrome і Firefox?

Так. Network Protection діє на рівні мережевого стека Windows — нижче окремих браузерів. Впливає на всі застосунки.

---

## Резюме

`Set-MpPreference -EnableNetworkProtection Enabled`. Починай з AuditMode. Моніторинг Event 1125. Потрібен увімкнений захист в реальному часі. GPO для розгортання на домен.
