---
title: "Автоматизація задач через PowerShell і Task Scheduler"
date: "2026-06-14"
publishDate: "2026-06-14"
description: "Як створити і запланувати автоматичні задачі в Windows через Task Scheduler і PowerShell: резервне копіювання, очищення, запуск скриптів за розкладом."
tags: ["powershell", "адміністрування", "windows", "автоматизація", "інструменти"]
readTime: 7
---

Task Scheduler (Планувальник завдань) + PowerShell = автоматизація будь-яких рутинних задач: резервне копіювання, очищення тимчасових файлів, перевірка сервісів, відправка звітів.

---

## Task Scheduler — графічний інтерфейс

`Win + R` → `taskschd.msc`

Або: `Пошук` → **Планувальник завдань**

### Створити просте завдання

1. **Дія** → **Створити просте завдання**
2. Назва і опис
3. Тригер: щодня / щотижня / при запуску / при вході
4. Дія: **Запустити програму**
5. Програма: `powershell.exe`
6. Аргументи: `-ExecutionPolicy Bypass -File "C:\Scripts\backup.ps1"`

---

## Створення завдань через PowerShell

Набагато зручніше для автоматизації і масового розгортання.

### Базовий приклад — запуск скрипта щодня

```powershell
# Параметри завдання
$action = New-ScheduledTaskAction `
  -Execute "powershell.exe" `
  -Argument "-ExecutionPolicy Bypass -NonInteractive -File C:\Scripts\cleanup.ps1"

$trigger = New-ScheduledTaskTrigger `
  -Daily `
  -At "03:00"

$settings = New-ScheduledTaskSettingsSet `
  -RunOnlyIfNetworkAvailable $false `
  -StartWhenAvailable `
  -ExecutionTimeLimit (New-TimeSpan -Hours 1)

Register-ScheduledTask `
  -TaskName "Daily Cleanup" `
  -TaskPath "\MyTasks\" `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -RunLevel Highest `
  -Force
```

### Запуск при вході користувача

```powershell
$trigger = New-ScheduledTaskTrigger -AtLogOn
```

### Запуск при запуску системи

```powershell
$trigger = New-ScheduledTaskTrigger -AtStartup
```

### Запуск кожні 30 хвилин

```powershell
$trigger = New-ScheduledTaskTrigger `
  -RepetitionInterval (New-TimeSpan -Minutes 30) `
  -Once `
  -At (Get-Date)
```

### Запуск від іншого користувача (наприклад SYSTEM)

```powershell
Register-ScheduledTask `
  -TaskName "System Task" `
  -Action $action `
  -Trigger $trigger `
  -User "SYSTEM" `
  -RunLevel Highest `
  -Force
```

---

## Практичні скрипти для автоматизації

### Автоматичне резервне копіювання

```powershell
# backup.ps1
$source = "C:\Users\$env:USERNAME\Documents"
$dest   = "D:\Backups\Documents_$(Get-Date -Format 'yyyy-MM-dd')"

Copy-Item -Path $source -Destination $dest -Recurse -Force

# Видалити резервні копії старші 30 днів
Get-ChildItem "D:\Backups" -Directory |
  Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-30) } |
  Remove-Item -Recurse -Force

Write-Output "$(Get-Date): Backup completed to $dest" |
  Out-File "D:\Backups\backup.log" -Append
```

### Очищення тимчасових файлів

```powershell
# cleanup.ps1
$paths = @(
    $env:TEMP,
    "C:\Windows\Temp",
    "C:\Windows\SoftwareDistribution\Download"
)

foreach ($path in $paths) {
    Get-ChildItem $path -Recurse -ErrorAction SilentlyContinue |
        Where-Object { !$_.PSIsContainer -and $_.LastWriteTime -lt (Get-Date).AddDays(-7) } |
        Remove-Item -Force -ErrorAction SilentlyContinue
}

Write-Output "$(Get-Date): Cleanup done" | Out-File "C:\Scripts\cleanup.log" -Append
```

### Перевірка і перезапуск сервісу

```powershell
# check-service.ps1
$serviceName = "wuauserv"  # Windows Update

$service = Get-Service -Name $serviceName
if ($service.Status -ne "Running") {
    Start-Service -Name $serviceName
    Write-Output "$(Get-Date): $serviceName was stopped, restarted" |
        Out-File "C:\Scripts\services.log" -Append
}
```

### Звіт про дисковий простір

```powershell
# disk-report.ps1
$report = Get-PSDrive -PSProvider FileSystem |
    Select-Object Name,
        @{N="Total GB"; E={[math]::Round($_.Used/1GB + $_.Free/1GB, 1)}},
        @{N="Used GB";  E={[math]::Round($_.Used/1GB, 1)}},
        @{N="Free GB";  E={[math]::Round($_.Free/1GB, 1)}},
        @{N="Free %";   E={[math]::Round($_.Free/($_.Used+$_.Free)*100, 0)}}

$report | Out-File "C:\Scripts\disk-report.txt"

# Попередити якщо менше 10% вільного місця
$critical = $report | Where-Object { $_."Free %" -lt 10 }
if ($critical) {
    # Можна додати відправку email або запис в EventLog
    Write-EventLog -LogName Application -Source "DiskMonitor" `
        -EventId 1001 -EntryType Warning `
        -Message "Low disk space: $($critical | Out-String)"
}
```

---

## Управління завданнями через PowerShell

```powershell
# Список всіх завдань
Get-ScheduledTask | Select-Object TaskName, TaskPath, State

# Запустити завдання вручну
Start-ScheduledTask -TaskName "Daily Cleanup"

# Зупинити завдання
Stop-ScheduledTask -TaskName "Daily Cleanup"

# Вимкнути завдання
Disable-ScheduledTask -TaskName "Daily Cleanup"

# Увімкнути завдання
Enable-ScheduledTask -TaskName "Daily Cleanup"

# Видалити завдання
Unregister-ScheduledTask -TaskName "Daily Cleanup" -Confirm:$false

# Переглянути результат останнього запуску
Get-ScheduledTaskInfo -TaskName "Daily Cleanup"
```

---

## Налаштування ExecutionPolicy для скриптів

Щоб PowerShell скрипти запускались без помилок:

```powershell
# Дозволити запуск локальних скриптів
Set-ExecutionPolicy RemoteSigned -Scope LocalMachine

# Або в Task Scheduler вказуй аргумент:
# -ExecutionPolicy Bypass
```

---

## Підсумок

Для простих задач — графічний Task Scheduler, для масового розгортання і складних налаштувань — `Register-ScheduledTask` через PowerShell. Стандартний набір для автоматизації: резервне копіювання о 3 ночі, очищення temp щотижня, перевірка сервісів кожні 30 хвилин.
