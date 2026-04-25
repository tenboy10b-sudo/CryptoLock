---
title: "20 PowerShell скриптів які має кожен адміністратор Windows"
date: "2026-08-16"
publishDate: "2026-08-16"
description: "Збірка готових PowerShell скриптів для системного адміністратора: інвентаризація, моніторинг, очищення, управління акаунтами і автоматичні звіти."
tags: ["powershell", "адміністрування", "windows", "автоматизація", "інструменти"]
readTime: 8
---

Збірка перевірених скриптів для щоденної роботи адміністратора. Кожен можна запустити відразу або адаптувати під своє середовище.

---

## Інвентаризація

### 1. Інформація про всі ПК в домені

```powershell
Get-ADComputer -Filter * -Properties OperatingSystem, LastLogonDate, IPv4Address |
  Select-Object Name, OperatingSystem, LastLogonDate, IPv4Address |
  Export-Csv "C:\Reports\computers.csv" -Encoding UTF8 -NoTypeInformation
```

### 2. Встановлені програми на локальному ПК

```powershell
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*",
    "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*" |
  Where-Object { $_.DisplayName } |
  Select-Object DisplayName, DisplayVersion, Publisher, InstallDate |
  Sort-Object DisplayName |
  Export-Csv "C:\Reports\installed-apps.csv" -Encoding UTF8 -NoTypeInformation
```

### 3. Розмір папок на диску

```powershell
Get-ChildItem "C:\Users" -Directory | ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse -ErrorAction SilentlyContinue |
        Measure-Object Length -Sum).Sum
    [PSCustomObject]@{
        Folder  = $_.Name
        "Size GB" = [math]::Round($size/1GB, 2)
    }
} | Sort-Object "Size GB" -Descending | Format-Table -AutoSize
```

---

## Моніторинг

### 4. Вільне місце на дисках всіх серверів

```powershell
$servers = @("Server01", "Server02", "Server03")
foreach ($srv in $servers) {
    Get-WmiObject Win32_LogicalDisk -ComputerName $srv -Filter "DriveType=3" |
      Select-Object @{N="Server";E={$srv}}, DeviceID,
        @{N="Free GB"; E={[math]::Round($_.FreeSpace/1GB,1)}},
        @{N="Total GB";E={[math]::Round($_.Size/1GB,1)}},
        @{N="Free %";  E={[math]::Round($_.FreeSpace/$_.Size*100,0)}}
} | Format-Table -AutoSize
```

### 5. Запущені служби що не повинні бути зупинені

```powershell
$criticalServices = @("wuauserv", "WinDefend", "EventLog", "Dnscache")
foreach ($svc in $criticalServices) {
    $s = Get-Service $svc -ErrorAction SilentlyContinue
    if ($s.Status -ne "Running") {
        Write-Warning "$svc не запущений! Статус: $($s.Status)"
    }
}
```

### 6. Останні 10 перезавантажень системи

```powershell
Get-WinEvent -FilterHashtable @{LogName='System'; Id=1074,6006,6008} |
  Select-Object TimeCreated, Id,
    @{N="Reason"; E={$_.Message.Split("`n")[0]}} |
  Select-Object -First 10 |
  Format-List
```

---

## Безпека

### 7. Невдалі спроби входу за добу

```powershell
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625; StartTime=(Get-Date).AddHours(-24)} |
  Group-Object {($_.Properties[5].Value)} |
  Sort-Object Count -Descending |
  Select-Object @{N="Account";E={$_.Name}}, Count |
  Format-Table -AutoSize
```

### 8. Локальні адміністратори на ПК (несанкціоновані?)

```powershell
$computers = Get-ADComputer -Filter * | Select-Object -ExpandProperty Name
foreach ($pc in $computers) {
    $admins = Invoke-Command -ComputerName $pc -ErrorAction SilentlyContinue -ScriptBlock {
        Get-LocalGroupMember -Group "Administrators" | Select-Object Name, PrincipalSource
    }
    $admins | ForEach-Object {
        [PSCustomObject]@{ Computer = $pc; Admin = $_.Name; Source = $_.PrincipalSource }
    }
} | Export-Csv "C:\Reports\local-admins.csv" -Encoding UTF8 -NoTypeInformation
```

### 9. Акаунти з паролем що ніколи не закінчується

```powershell
Get-ADUser -Filter {PasswordNeverExpires -eq $true -and Enabled -eq $true} |
  Select-Object Name, SamAccountName, DistinguishedName |
  Export-Csv "C:\Reports\never-expire-passwords.csv" -Encoding UTF8 -NoTypeInformation
```

---

## Очищення

### 10. Видалити тимчасові файли старші 7 днів

```powershell
$tempPaths = @($env:TEMP, "C:\Windows\Temp")
$deleted = 0
foreach ($path in $tempPaths) {
    Get-ChildItem $path -Recurse -ErrorAction SilentlyContinue |
      Where-Object { !$_.PSIsContainer -and $_.LastWriteTime -lt (Get-Date).AddDays(-7) } |
      ForEach-Object { Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue; $deleted++ }
}
Write-Output "Видалено файлів: $deleted"
```

### 11. Очистити журнали подій старші 30 днів

```powershell
$logs = @("Application", "System", "Security")
foreach ($log in $logs) {
    $path = "C:\Backup\EventLogs\$log-$(Get-Date -Format 'yyyyMMdd').evtx"
    wevtutil epl $log $path
    Clear-EventLog -LogName $log
    Write-Output "Очищено і збережено: $log"
}
```

---

## Управління акаунтами

### 12. Масове створення користувачів з CSV

```powershell
# Файл users.csv: Name,SamAccount,Password,Department,OU
Import-Csv "C:\users.csv" | ForEach-Object {
    New-ADUser `
      -Name $_.Name `
      -SamAccountName $_.SamAccount `
      -AccountPassword (ConvertTo-SecureString $_.Password -AsPlainText -Force) `
      -Path $_.OU `
      -Department $_.Department `
      -Enabled $true `
      -ChangePasswordAtLogon $true
    Write-Output "Створено: $($_.Name)"
}
```

### 13. Відключити неактивних користувачів (90+ днів без входу)

```powershell
$cutoff = (Get-Date).AddDays(-90)
Get-ADUser -Filter {LastLogonDate -lt $cutoff -and Enabled -eq $true} |
  ForEach-Object {
    Disable-ADAccount -Identity $_
    Write-Output "Вимкнено: $($_.SamAccountName) (останній вхід: $($_.LastLogonDate))"
  }
```

---

## Мережа

### 14. Сканування мережі — хто підключений

```powershell
1..254 | ForEach-Object -Parallel {
    $ip = "192.168.1.$_"
    if (Test-Connection $ip -Count 1 -Quiet -TimeoutSeconds 1) {
        $hostname = try { [System.Net.Dns]::GetHostEntry($ip).HostName } catch { "N/A" }
        [PSCustomObject]@{ IP = $ip; Hostname = $hostname }
    }
} -ThrottleLimit 50 | Sort-Object { [version]$_.IP }
```

### 15. Перевірити DNS резолвінг для списку доменів

```powershell
$domains = @("google.com", "microsoft.com", "company.local", "dc01.company.local")
foreach ($domain in $domains) {
    try {
        $result = Resolve-DnsName $domain -ErrorAction Stop
        Write-Output "✓ $domain → $($result[0].IPAddress)"
    } catch {
        Write-Warning "✗ $domain — не резолвиться!"
    }
}
```

---

## Автоматичні звіти

### 16. HTML звіт про стан системи

```powershell
$report = @{
    ComputerName = $env:COMPUTERNAME
    OS           = (Get-CimInstance Win32_OperatingSystem).Caption
    Uptime       = (Get-Date) - (gcim Win32_OperatingSystem).LastBootUpTime
    CPU_Load     = (Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples.CookedValue
    RAM_Free_GB  = [math]::Round((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory/1MB, 2)
    Disk_C_Free  = [math]::Round((Get-PSDrive C).Free/1GB, 1)
}

$html = $report.GetEnumerator() | Sort-Object Key |
  ConvertTo-Html -Title "System Report" -PreContent "<h2>$env:COMPUTERNAME — $(Get-Date)</h2>"
$html | Out-File "C:\Reports\system-report.html"
```

### 17. Щотижневий звіт на email

```powershell
$smtpServer = "smtp.company.local"
$from = "monitoring@company.local"
$to = "admin@company.local"

$body = "Щотижневий звіт системи`n" +
    "ПК: $env:COMPUTERNAME`n" +
    "Дата: $(Get-Date)`n" +
    "Вільно на C: $([math]::Round((Get-PSDrive C).Free/1GB, 1)) ГБ"

Send-MailMessage -SmtpServer $smtpServer -From $from -To $to `
  -Subject "Weekly Report — $env:COMPUTERNAME" -Body $body -Encoding UTF8
```

---

## Різне

### 18. Запустити скрипт на всіх ПК домену

```powershell
$computers = Get-ADComputer -Filter * | Select-Object -ExpandProperty Name
Invoke-Command -ComputerName $computers -ThrottleLimit 20 -ScriptBlock {
    # Виконати будь-яку дію
    gpupdate /force
} -ErrorAction SilentlyContinue
```

### 19. Знайти файли з чутливими даними

```powershell
# Шукати файли що можуть містити паролі або картки
Get-ChildItem "C:\Users" -Recurse -Include "*.txt","*.xlsx","*.csv" -ErrorAction SilentlyContinue |
  Select-String -Pattern "password|пароль|credit.card|картк" -ErrorAction SilentlyContinue |
  Select-Object Path, LineNumber, Line |
  Export-Csv "C:\Reports\sensitive-files.csv" -Encoding UTF8
```

### 20. Перевірити термін дії сертифікатів

```powershell
Get-ChildItem Cert:\LocalMachine\My |
  Where-Object { $_.NotAfter -lt (Get-Date).AddDays(30) } |
  Select-Object Subject, Thumbprint, NotAfter |
  Format-Table -AutoSize
```

---

## Підсумок

Збережи ці скрипти в папку `C:\Scripts\` і додай найважливіші в Task Scheduler для автоматичного запуску. Скрипти 4, 5, 7 — запускай щодня. Скрипти 1, 8, 9, 13 — щотижня. Скрипт 16 — щодня для зберігання в архів.
