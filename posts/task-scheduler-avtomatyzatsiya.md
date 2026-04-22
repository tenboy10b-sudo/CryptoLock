---
title: "Як налаштувати Task Scheduler для автоматичного запуску завдань"
date: "2025-05-12"
description: "Створення автоматичних завдань через Task Scheduler і PowerShell: запуск скриптів, резервне копіювання, очищення по розкладу."
tags: ["планувальник", "автоматизація", "інструменти", "windows"]
readTime: 6
---

Task Scheduler дозволяє автоматизувати будь-які задачі: запуск скриптів, очищення диска, резервне копіювання. Все без сторонніх програм.

## Відкрити Task Scheduler

```cmd
taskschd.msc
```

Або: `Win + S` → **Task Scheduler**.

---

## Створити просте завдання через майстер

**Крок 1.** Клікни **Create Basic Task** у правій панелі.

**Крок 2.** Введи назву і опис → Next.

**Крок 3.** Вибери тригер:
- **Daily** — щодня
- **Weekly** — щотижня
- **Monthly** — щомісяця
- **One time** — один раз
- **When the computer starts** — при запуску
- **When I log on** — при вході користувача

**Крок 4.** Встанови час → Next.

**Крок 5.** Дія → **Start a program** → Browse → вибери .exe або .bat файл.

**Крок 6.** Finish.

---

## Через PowerShell — повний контроль

**Запускати скрипт щодня о 2:00 ночі:**
```powershell
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File C:\Scripts\cleanup.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At "2:00AM"
$settings = New-ScheduledTaskSettingsSet -RunOnlyIfIdle -IdleDuration 00:10:00
Register-ScheduledTask -TaskName "Daily Cleanup" -Action $action -Trigger $trigger -Settings $settings -RunLevel Highest
```

**Запускати при запуску Windows:**
```powershell
$action = New-ScheduledTaskAction -Execute "C:\Scripts\startup.bat"
$trigger = New-ScheduledTaskTrigger -AtStartup
Register-ScheduledTask -TaskName "Startup Script" -Action $action -Trigger $trigger -RunLevel Highest -User "SYSTEM"
```

**Запускати кожні 30 хвилин:**
```powershell
$action = New-ScheduledTaskAction -Execute "C:\Scripts\monitor.ps1"
$trigger = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Minutes 30) -Once -At (Get-Date)
Register-ScheduledTask -TaskName "Monitor" -Action $action -Trigger $trigger
```

---

## Практичні приклади завдань

**Автоматичне очищення Temp щотижня:**
```powershell
$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument '/c del /q /f /s "%TEMP%\*"'
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At "3:00AM"
Register-ScheduledTask -TaskName "Weekly Temp Cleanup" -Action $action -Trigger $trigger -RunLevel Highest
```

**Резервне копіювання папки:**
```powershell
$action = New-ScheduledTaskAction -Execute "robocopy.exe" -Argument "C:\Documents D:\Backup\Documents /MIR /LOG:D:\backup.log"
$trigger = New-ScheduledTaskTrigger -Daily -At "23:00"
Register-ScheduledTask -TaskName "Daily Backup" -Action $action -Trigger $trigger
```

---

## Переглянути всі завдання

```powershell
Get-ScheduledTask | Select-Object TaskName, State, TaskPath | Sort-Object TaskName
```

**Запустити завдання вручну:**
```powershell
Start-ScheduledTask -TaskName "Daily Cleanup"
```

**Видалити завдання:**
```powershell
Unregister-ScheduledTask -TaskName "Daily Cleanup" -Confirm:$false
```

---

## Перевірити журнал виконання

В Task Scheduler → вибери завдання → вкладка **History** — показує коли і з яким результатом виконувалось.

Код `0x0` = успішно, будь-який інший = помилка.
