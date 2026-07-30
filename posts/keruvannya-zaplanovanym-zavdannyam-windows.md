---
title: "Заплановані завдання Windows через PowerShell: створення і управління"
date: "2026-05-29"
publishDate: "2026-05-29"
description: "Створення і управління запланованими завданнями Windows через PowerShell і GUI. Запуск скриптів за розкладом, при вході, при старті і за подіями."
tags: ["windows", "планувальник-завдань", "powershell", "автоматизація", "адміністрування"]
readTime: 4
translatesEn: "how-to-use-task-scheduler-windows"
---

Заплановані завдання автоматизують все в Windows. PowerShell дає повний контроль без GUI.

---

## Основні компоненти

- **Тригер** — коли запускати (час, подія, вхід, запуск)
- **Дія** — що запускати (exe, скрипт)
- **Принципал** — від якого акаунту (користувач, SYSTEM)

---

## Створити завдання

```powershell
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-NonInteractive -ExecutionPolicy Bypass -File C:\Scripts\daily.ps1"

$trigger = New-ScheduledTaskTrigger -Daily -At "09:00AM"

$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -RunLevel Highest

Register-ScheduledTask -TaskName "DailyScript" `
  -Action $action -Trigger $trigger -Principal $principal
```

---

## Типи тригерів

```powershell
New-ScheduledTaskTrigger -AtStartup          # При старті
New-ScheduledTaskTrigger -AtLogOn            # При вході
New-ScheduledTaskTrigger -Once -At "10:00"   # Одноразово
New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday,Wednesday -At "08:00"
```

---

## Список і результати

```powershell
# Всі завдання
Get-ScheduledTask | Where-Object {$_.TaskPath -eq "\"} |
  Select-Object TaskName, State

# Останні запуски і результати
Get-ScheduledTask | ForEach-Object {
  $info = $_ | Get-ScheduledTaskInfo
  [PSCustomObject]@{
    Name       = $_.TaskName
    LastRun    = $info.LastRunTime
    LastResult = $info.LastTaskResult
  }
} | Sort-Object LastRun -Descending | Select-Object -First 10
```

---

## Запустити, вимкнути, видалити

```powershell
Start-ScheduledTask -TaskName "DailyScript"
Disable-ScheduledTask -TaskName "DailyScript"
Unregister-ScheduledTask -TaskName "DailyScript" -Confirm:$false
```

---

## Часті питання

### Завдання спрацьовує вручну але не за розкладом?

Найчастіші причини: акаунт не має права "Вхід як пакетне завдання" або завдання налаштоване запускатись тільки коли користувач увійшов. Використовуй SYSTEM або "Незалежно від входу користувача".

### Як запустити PowerShell скрипт без вікна?

Додай `-WindowStyle Hidden` в аргументи: `-Argument "-WindowStyle Hidden -File C:\script.ps1"`.

---

## Резюме

`New-ScheduledTaskAction/Trigger/Principal` → `Register-ScheduledTask`. Перевірка результатів: `Get-ScheduledTaskInfo`. SYSTEM для завдань без входу користувача. Увімкни історію через `wevtutil`.
