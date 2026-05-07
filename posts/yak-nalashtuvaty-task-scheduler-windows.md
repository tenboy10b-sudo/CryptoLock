---
title: "Task Scheduler в Windows: автоматизація завдань покроково"
date: "2026-06-11"
publishDate: "2026-06-11"
description: "Як створити автоматичне завдання в Task Scheduler Windows: запуск скриптів по розкладу, при вході або при події. Приклади через GUI і PowerShell."
tags: ["windows", "автоматизація", "інструменти", "планувальник"]
readTime: 6
---

Task Scheduler запускає програми і скрипти автоматично — по розкладу, при старті Windows, при вході користувача або при конкретній події в системі. Ось як цим користуватись.

---

## Відкрити Task Scheduler

`Win + R` → `taskschd.msc`

Або: `Win + S` → **Планувальник завдань**

---

## Створити просте завдання (GUI)

**Дія** → **Створити просте завдання** → майстер налаштування:

1. **Ім'я** — опиши що робить завдання (наприклад "Щотижневе очищення temp")
2. **Тригер** — коли запускати: щодня, щотижня, при вході, при запуску ПК
3. **Дія** — запустити програму / відкрити URL / надіслати email
4. **Програма** — вкажи шлях до exe або скрипта

Натисни **Готово**.

---

## Запуск PowerShell скрипта по розкладу

Найпоширеніший сценарій. Важливо вказати правильні аргументи:

**Програма:** `powershell.exe`

**Аргументи:**
```
-NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File "C:\Scripts\myscript.ps1"
```

- `-NonInteractive` — не показує інтерактивні запити
- `-WindowStyle Hidden` — вікно не з'являється
- `-ExecutionPolicy Bypass` — дозволяє запуск скрипта без зміни системної політики

---

## Через PowerShell

```powershell
# Запускати скрипт щодня о 3:00
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-NonInteractive -WindowStyle Hidden -File C:\Scripts\cleanup.ps1"

$trigger = New-ScheduledTaskTrigger -Daily -At "03:00"

$settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable $true `
  -ExecutionTimeLimit (New-TimeSpan -Hours 1)

Register-ScheduledTask -TaskName "Daily Cleanup" `
  -Action $action -Trigger $trigger -Settings $settings `
  -RunLevel Highest -Force
```

---

## Корисні приклади

**Очищення temp при вході:**
```powershell
$action = New-ScheduledTaskAction -Execute "cmd.exe" `
  -Argument '/c del /q /f /s "%TEMP%\*" 2>nul'
$trigger = New-ScheduledTaskTrigger -AtLogOn
Register-ScheduledTask -TaskName "Clean Temp on Login" `
  -Action $action -Trigger $trigger -Force
```

**Резервна копія папки щотижня:**
```powershell
$action = New-ScheduledTaskAction -Execute "robocopy.exe" `
  -Argument "C:\Important D:\Backup\Important /MIR /R:3 /W:5"
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At "02:00"
Register-ScheduledTask -TaskName "Weekly Backup" `
  -Action $action -Trigger $trigger -RunLevel Highest -Force
```

---

## Запуск без входу користувача

Щоб завдання виконувалось навіть коли ніхто не залогінений:

В налаштуваннях завдання → **Загальне** → вибери **Виконувати незалежно від входу користувача** → введи пароль облікового запису.

Або для завдань що не потребують UI:
```powershell
Register-ScheduledTask -TaskName "Background Task" `
  -Action $action -Trigger $trigger `
  -User "SYSTEM" -RunLevel Highest -Force
```

SYSTEM не потребує пароля і завжди доступний.

---

## Перевірити результат виконання

```powershell
# Останній результат і час виконання
Get-ScheduledTaskInfo -TaskName "Daily Cleanup" |
  Select-Object LastRunTime, LastTaskResult, NextRunTime
```

`LastTaskResult: 0` — успішно. Інше значення — помилка.

Або в GUI: вибери завдання → вкладка **Журнал** — покаже всі запуски і помилки.

---

## Видалити завдання

```powershell
Unregister-ScheduledTask -TaskName "Daily Cleanup" -Confirm:$false
```

---

## Резюме

Task Scheduler + PowerShell = проста автоматизація будь-яких рутинних завдань. Для завдань що мають виконуватись у фоні — використовуй SYSTEM як користувача. Завжди перевіряй `LastTaskResult` після першого запуску.
