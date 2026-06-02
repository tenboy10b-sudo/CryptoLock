---
title: "Управління службами Windows через PowerShell: запуск, зупинка, налаштування"
date: "2026-06-28"
publishDate: "2026-06-28"
description: "Управління службами Windows через PowerShell. Запуск, зупинка, відключення, налаштування типу запуску, автовідновлення і створення власних служб."
tags: ["windows", "служби", "powershell", "адміністрування", "автоматизація"]
readTime: 4
translatesEn: "how-to-manage-windows-services-powershell"
---

Служби Windows запускаються у фоні і контролюють все — від мережі до черги друку.

---

## Переглянути служби

```powershell
# Всі служби
Get-Service | Sort-Object Status -Descending | Format-Table Name, Status, StartType

# Зупинені що мають запускатись
Get-Service | Where-Object {$_.Status -eq "Stopped" -and $_.StartType -eq "Automatic"} |
  Select-Object Name, DisplayName
```

---

## Запуск, зупинка, перезапуск

```powershell
Start-Service -Name "Spooler"
Stop-Service -Name "Spooler" -Force
Restart-Service -Name "Spooler" -Force
```

---

## Змінити тип запуску

```powershell
Set-Service -Name "WSearch" -StartupType Automatic          # Авто
Set-Service -Name "WSearch" -StartupType Manual             # Вручну
Set-Service -Name "WSearch" -StartupType Disabled           # Вимкнено
Set-Service -Name "WSearch" -StartupType AutomaticDelayedStart  # Відкладений
```

---

## Автовідновлення при збої

```powershell
sc.exe failure "Spooler" reset= 86400 actions= restart/5000/restart/10000/restart/30000
```

---

## Створити власну службу

```powershell
New-Service -Name "MyMonitor" `
  -BinaryPathName "C:\Tools\monitor.exe" `
  -DisplayName "My Monitoring Service" `
  -StartupType Automatic

Start-Service "MyMonitor"
```

---

## Видалити службу

```powershell
Stop-Service "MyMonitor" -Force
Remove-Service -Name "MyMonitor"
```

---

## Часті питання

### Критична служба постійно зупиняється — як запобігти?

Налаштуй `sc.exe failure` для автоперезапуску. Перевір журнал подій на помилки перед падінням — зазвичай вказує на проблему залежності або конфігурації.

### Різниця між Automatic і AutomaticDelayedStart?

Automatic — запускається під час завантаження Windows. AutomaticDelayedStart — через 2-3 хвилини після появи робочого столу. Зменшує час завантаження.

---

## Резюме

`Get-Service` для перегляду. `Start/Stop/Restart-Service` для керування. `Set-Service` для типу запуску. `sc.exe failure` для автовідновлення. `New-Service` для власних служб.
