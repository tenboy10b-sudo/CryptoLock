---
title: "Планувальник завдань Windows: розширені тригери, умови і приховані задачі"
date: "2026-08-02"
publishDate: "2026-08-02"
description: "Розширені можливості Планувальника завдань Windows. Тригери за подіями, умови простою, запуск без UAC, пошук прихованих задач і діагностика збоїв."
tags: ["windows", "планувальник-завдань", "автоматизація", "powershell", "адміністрування"]
readTime: 5
translatesEn: "how-to-configure-windows-task-scheduler-advanced"
---

Крім базового розкладу, Планувальник має потужні типи тригерів і умов виконання.

---

## Тригер за подією журналу

```powershell
# Запустити при невдалій спробі входу (Event ID 4625)
$trigger = New-ScheduledTaskTrigger -OnEvent `
  -Subscription '<QueryList><Query><Select Path="Security">*[System[EventID=4625]]</Select></Query></QueryList>' `
  -Delay "00:01:00"
```

---

## Умови простою

```powershell
# Запускати тільки коли ПК простоює 10+ хвилин
$settings = New-ScheduledTaskSettingsSet `
  -RunOnlyIfIdle `
  -IdleDuration "00:10:00" `
  -IdleWaitTimeout "04:00:00"
```

---

## Запуск без UAC (SYSTEM)

```powershell
$principal = New-ScheduledTaskPrincipal `
  -UserId "NT AUTHORITY\SYSTEM" `
  -LogonType ServiceAccount `
  -RunLevel Highest

Register-ScheduledTask -TaskName "SilentAdminTask" `
  -Action $action -Trigger $trigger -Principal $principal
```

---

## Пошук підозрілих задач

```powershell
# Задачі поза \Microsoft\ (можливий малваре)
Get-ScheduledTask | Where-Object {$_.TaskPath -notlike "*\Microsoft\*"} |
  Select-Object TaskPath, TaskName, @{n='Action';e={$_.Actions.Execute}}

# Задачі з Temp або AppData (підозрілі)
Get-ScheduledTask | Where-Object {
  $_.Actions.Execute -like "*\Temp\*" -or $_.Actions.Execute -like "*\AppData\*"
} | Select-Object TaskName, @{n='Exe';e={$_.Actions.Execute}}
```

---

## Діагностика збоїв

```powershell
# Результат останнього запуску
Get-ScheduledTaskInfo -TaskName "DailyScript" |
  Select-Object LastRunTime, LastTaskResult

# Коди результатів
# 0x0 = Успіх
# 0x1 = Помилка в скрипті
# 0x41301 = Ще виконується
```

---

## Часті питання

### Задача показує LastTaskResult 0x1?

Скрипт повернув код виходу 1 — помилка в скрипті. Додай `-ErrorAction Stop` і обробку помилок для корисних кодів виходу.

### Задача спрацьовує вручну але не за розкладом?

1. Неправильна робоча директорія — використовуй повні шляхи
2. Відсутні модулі — явно `Import-Module` в скрипті
3. ExecutionPolicy — додай `-ExecutionPolicy Bypass` в дію
4. Мережеві диски недоступні для SYSTEM

---

## Резюме

Тригери за подіями з XML `<QueryList>`. Умови простою через `-RunOnlyIfIdle`. SYSTEM для запуску без UAC. Аудит всіх не-Microsoft задач на малваре. Увімкни історію через `wevtutil sl`. 0x0 = успіх.
