---
title: "PowerShell і EventLog: автоматизація аналізу журналів Windows"
date: "2026-07-08"
publishDate: "2026-07-08"
description: "Автоматизація читання і аналізу журналів подій Windows через PowerShell: Get-WinEvent, фільтри, звіти, моніторинг критичних подій і відправка сповіщень."
tags: ["powershell", "моніторинг", "адміністрування", "windows", "безпека"]
readTime: 7
---

Ручний перегляд Event Viewer займає багато часу. PowerShell дозволяє автоматизувати аналіз журналів: знаходити критичні події, генерувати звіти і сповіщати про проблеми.

---

## Get-WinEvent — основна команда

```powershell
# Всі журнали доступні в системі
Get-WinEvent -ListLog * | Where-Object { $_.RecordCount -gt 0 } |
  Select-Object LogName, RecordCount | Sort-Object RecordCount -Descending

# Читати журнал System
Get-WinEvent -LogName System -MaxEvents 50

# Читати за фільтром хеш-таблиці (найшвидший спосіб)
Get-WinEvent -FilterHashtable @{
    LogName   = 'System'
    Level     = 1,2          # 1=Critical, 2=Error, 3=Warning
    StartTime = (Get-Date).AddHours(-24)
}
```

---

## Рівні подій

| Level | Значення | Код |
|-------|----------|-----|
| Critical | Критичний збій | 1 |
| Error | Помилка | 2 |
| Warning | Попередження | 3 |
| Information | Інформація | 4 |
| Verbose | Детальна інформація | 5 |

---

## Корисні фільтри

```powershell
# Критичні та помилки за останній тиждень
Get-WinEvent -FilterHashtable @{
    LogName   = 'System','Application'
    Level     = 1,2
    StartTime = (Get-Date).AddDays(-7)
} | Select-Object TimeCreated, LogName, Id, ProviderName,
    @{N="Message"; E={$_.Message.Split("`n")[0]}} |
  Format-Table -AutoSize -Wrap

# Події конкретного джерела
Get-WinEvent -FilterHashtable @{
    LogName      = 'System'
    ProviderName = 'Microsoft-Windows-Kernel-Power'
}

# Конкретний EventID
Get-WinEvent -FilterHashtable @{
    LogName = 'Security'
    Id      = 4625          # невдала спроба входу
    StartTime = (Get-Date).AddDays(-1)
}

# Кілька EventID
Get-WinEvent -FilterHashtable @{
    LogName = 'System'
    Id      = 41, 6008, 1074  # перезавантаження і вимкнення
}
```

---

## Аналіз безпеки

```powershell
# Невдалі спроби входу за останню добу — хто і звідки
Get-WinEvent -FilterHashtable @{
    LogName   = 'Security'
    Id        = 4625
    StartTime = (Get-Date).AddHours(-24)
} | ForEach-Object {
    $xml = [xml]$_.ToXml()
    [PSCustomObject]@{
        Time     = $_.TimeCreated
        Account  = $xml.Event.EventData.Data | Where-Object { $_.Name -eq "TargetUserName" } | Select-Object -ExpandProperty '#text'
        IP       = $xml.Event.EventData.Data | Where-Object { $_.Name -eq "IpAddress" } | Select-Object -ExpandProperty '#text'
        Workstation = $xml.Event.EventData.Data | Where-Object { $_.Name -eq "WorkstationName" } | Select-Object -ExpandProperty '#text'
    }
} | Format-Table -AutoSize

# Заблоковані акаунти
Get-WinEvent -FilterHashtable @{
    LogName = 'Security'
    Id      = 4740
    StartTime = (Get-Date).AddDays(-7)
} | Select-Object TimeCreated, Message

# Хто і коли входив
Get-WinEvent -FilterHashtable @{
    LogName   = 'Security'
    Id        = 4624
    StartTime = (Get-Date).Date
} | Select-Object TimeCreated,
    @{N="User"; E={($_.Properties[5].Value)}} |
  Where-Object { $_.User -ne "SYSTEM" -and $_.User -ne "" }
```

---

## Генерація звітів

```powershell
# HTML звіт про критичні події за тиждень
$events = Get-WinEvent -FilterHashtable @{
    LogName   = 'System','Application'
    Level     = 1,2
    StartTime = (Get-Date).AddDays(-7)
} | Select-Object TimeCreated, LogName, Id, ProviderName,
    @{N="Message"; E={$_.Message.Split("`n")[0]}}

$html = $events | ConvertTo-Html -Title "Windows Event Report" `
  -PreContent "<h2>Критичні події за $(Get-Date -Format 'dd.MM.yyyy')</h2>" |
  Out-String

$html | Out-File "C:\Reports\events-$(Get-Date -Format 'yyyyMMdd').html"
Write-Output "Звіт збережено: $($events.Count) подій"

# CSV для Excel
$events | Export-Csv "C:\Reports\events.csv" -Encoding UTF8 -NoTypeInformation
```

---

## Моніторинг у реальному часі

```powershell
# Стежити за новими критичними подіями
Register-WmiEvent -Class Win32_NTLogEvent `
  -Filter "Type = 'Error' OR Type = 'Critical'" `
  -SourceIdentifier "CriticalEvents" `
  -Action {
    $event = $EventArgs.NewEvent
    Write-Output "$(Get-Date): КРИТИЧНА ПОДІЯ — $($event.Message)"
    # Тут можна додати відправку email або Teams/Slack сповіщення
  }

# Або через FileSystemWatcher на лог-файл
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = "C:\Logs"
$watcher.EnableRaisingEvents = $true
```

---

## Очистити журнали

```powershell
# Очистити конкретний журнал
Clear-EventLog -LogName Application

# Очистити всі стандартні журнали
"Application","Security","System" | ForEach-Object {
    Clear-EventLog -LogName $_
    Write-Output "Очищено: $_"
}

# Зберегти перед очищенням
wevtutil epl System C:\Backup\System-$(Get-Date -Format 'yyyyMMdd').evtx
Clear-EventLog -LogName System
```

---

## Аналіз на віддалених ПК

```powershell
# Читати журнал на віддаленому ПК
Get-WinEvent -ComputerName "Server01" -FilterHashtable @{
    LogName = 'System'
    Level   = 1,2
    StartTime = (Get-Date).AddDays(-1)
}

# Масова перевірка всіх серверів
$servers = @("Server01", "Server02", "Server03")
$allEvents = foreach ($srv in $servers) {
    Get-WinEvent -ComputerName $srv -FilterHashtable @{
        LogName = 'System'
        Level   = 1,2
        StartTime = (Get-Date).AddHours(-24)
    } -ErrorAction SilentlyContinue |
    Add-Member -MemberType NoteProperty -Name Server -Value $srv -PassThru
}
$allEvents | Sort-Object TimeCreated -Descending | Format-Table Server, TimeCreated, Id, Message -AutoSize
```

---

## Підсумок

`Get-WinEvent -FilterHashtable` — найшвидший спосіб читати журнали. Для безпеки: EventID 4625 (невдалі входи) і 4740 (блокування). Для стабільності: EventID 41 і 6008 (аварійні перезавантаження). HTML-звіти + розклад через Task Scheduler = автоматичний щоденний моніторинг без ручної роботи.
