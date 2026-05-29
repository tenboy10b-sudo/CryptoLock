---
title: "Планувальник завдань Windows: автоматизація без програмування"
date: "2026-05-14"
publishDate: "2026-05-14"
description: "Як використовувати Планувальник завдань Windows для автозапуску скриптів, очищення диску і резервного копіювання. Налаштування через GUI і PowerShell."
tags: ["windows", "автоматизація", "powershell", "адміністрування"]
readTime: 5
---

Планувальник завдань запускає будь-яку програму або скрипт автоматично — за розкладом, при вході, при старті або при підключенні пристрою.

---

## Відкрити Планувальник завдань

`Win + R` → `taskschd.msc`

---

## Створити просте завдання

1. ПКМ на **Бібліотека планувальника** → **Створити просте завдання**
2. Назва: наприклад `Очищення TEMP`
3. Тригер: **Щотижня** → неділя, 02:00
4. Дія: **Запустити програму**
5. Програма: `powershell.exe`
6. Аргументи: `-NonInteractive -Command "Remove-Item $env:TEMP\* -Recurse -Force -EA 0"`
7. Готово

---

## Створити завдання через PowerShell

```powershell
# Автоочищення TEMP щонеділі
$action  = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument '-NonInteractive -ExecutionPolicy Bypass -File "C:\Scripts\cleanup.ps1"'
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At "02:00AM"

Register-ScheduledTask -TaskName "WeeklyCleanup" `
  -Action $action -Trigger $trigger -RunLevel Highest `
  -Description "Очищення тимчасових файлів"
```

---

## Корисні тригери

```powershell
# При старті Windows (без входу користувача)
$trigger = New-ScheduledTaskTrigger -AtStartup

# При вході користувача
$trigger = New-ScheduledTaskTrigger -AtLogOn

# Щогодини
$trigger = New-ScheduledTaskTrigger -Once -At "00:00" `
  -RepetitionInterval (New-TimeSpan -Hours 1)
```

---

## Керування завданнями

```powershell
# Список всіх власних завдань
Get-ScheduledTask | Where-Object {$_.TaskPath -eq "\"} |
  Select-Object TaskName, State

# Запустити завдання вручну
Start-ScheduledTask -TaskName "WeeklyCleanup"

# Вимкнути
Disable-ScheduledTask -TaskName "WeeklyCleanup"

# Видалити
Unregister-ScheduledTask -TaskName "WeeklyCleanup" -Confirm:$false

# Перевірити результат останнього запуску (0 = успішно)
(Get-ScheduledTaskInfo -TaskName "WeeklyCleanup").LastTaskResult
```

---

## Практичні приклади

**Резервне копіювання раз на тиждень:**
```powershell
$action  = New-ScheduledTaskAction -Execute "robocopy.exe" `
  -Argument "C:\Documents D:\Backup\Documents /MIR /R:3"
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Saturday -At "23:00"
Register-ScheduledTask -TaskName "WeeklyBackup" -Action $action -Trigger $trigger
```

**Запускати скрипт при вході:**
```powershell
$action  = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-File C:\Scripts\startup.ps1"
$trigger = New-ScheduledTaskTrigger -AtLogOn
Register-ScheduledTask -TaskName "OnLogin" -Action $action -Trigger $trigger
```

---

## Часті питання

### Чому завдання не виконується хоча час настав?

Перевір в Планувальнику: ПКМ на завданні → Властивості → вкладка **Умови** — чи не стоїть "Тільки при підключенні до мережі" або "Тільки при бездіяльності". Також перевір вкладку **Параметри** → чи не вимкнено завдання.

### Як запустити завдання без входу користувача?

В Властивостях → **Загальні** → вибери **Виконувати незалежно від входу користувача** → вкажи обліковий запис SYSTEM або адміністратора.

### Як переглянути журнал виконання?

Планувальник завдань → **Дія** → **Включити журнал всіх завдань**. Потім у властивостях завдання → вкладка **Журнал**.

---

## Резюме

`taskschd.msc` відкриває Планувальник. Для скриптів PowerShell використовуй `-NonInteractive -ExecutionPolicy Bypass`. Результат 0 = успішно. Для запуску без входу — вибери SYSTEM як обліковий запис.
