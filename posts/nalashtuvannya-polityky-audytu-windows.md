---
title: "Як налаштувати політику аудиту Windows для моніторингу безпеки"
date: "2026-06-26"
publishDate: "2026-06-26"
description: "Налаштування політики аудиту Windows для відстеження входів, змін акаунтів і запуску процесів. Розширений аудит через PowerShell і групові політики."
tags: ["windows", "аудит", "безпека", "event-log", "powershell", "адміністрування"]
readTime: 5
translatesEn: "how-to-configure-windows-audit-policy"
---

Політика аудиту Windows контролює які події безпеки записуються в журнал. Без неї атаки відбуваються але не залишають слідів.

---

## Переглянути поточні налаштування

```powershell
auditpol /get /subcategory:* | Where-Object {$_ -match "Logon|Account|Process"}
```

---

## Увімкнути рекомендовані категорії

```powershell
# Входи (виявити brute force)
auditpol /set /subcategory:"Logon" /success:enable /failure:enable

# Управління акаунтами
auditpol /set /subcategory:"User Account Management" /success:enable /failure:enable
auditpol /set /subcategory:"Security Group Management" /success:enable /failure:enable

# Створення процесів (виявити малваре)
auditpol /set /subcategory:"Process Creation" /success:enable

# Зміна політик
auditpol /set /subcategory:"Audit Policy Change" /success:enable /failure:enable

# Використання привілеїв
auditpol /set /subcategory:"Sensitive Privilege Use" /success:enable /failure:enable
```

---

## Увімкнути логування командного рядка

```powershell
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Audit" `
  -Name "ProcessCreationIncludeCmdLine_Enabled" -Value 1 -Type DWord -Force
```

Після увімкнення Event ID 4688 міститиме повний командний рядок.

---

## Моніторинг критичних подій

```powershell
$criticalEvents = @{4625="Невдалий вхід"; 4720="Новий акаунт"; 4726="Видалено акаунт"; 7045="Нова служба"; 1102="Очищено журнал"}

foreach ($id in $criticalEvents.Keys) {
  $count = (Get-WinEvent -FilterHashtable @{LogName='Security','System'; Id=$id; StartTime=(Get-Date).AddHours(-24)} -EA 0).Count
  if ($count -gt 0) { Write-Host "⚠️ Event $id ($($criticalEvents[$id])): $count за 24г" }
}
```

---

## Збільшити розмір журналу безпеки

```powershell
# Замість 20 МБ — 256 МБ
wevtutil sl Security /ms:268435456
```

---

## Часті питання

### Увімкнення всіх категорій гальмує Windows?

Мінімально — 1-3% для категорій з великим обсягом. Входи і Process Creation мають незначний вплив.

### Журнал заповнюється надто швидко?

Збільш розмір. Переглянь що ти аудируєш — Object Access генерує величезний обсяг. Увімкни тільки для конкретних чутливих папок через SACL, не системно.

---

## Резюме

Увімкнути через `auditpol /set`. Логування командного рядка через реєстр. Обов'язково: Входи, Управління акаунтами, Створення процесів, Зміна політик. Збільш журнал до 256 МБ. Моніторинг 4625, 4720, 7045, 1102 щодня.
