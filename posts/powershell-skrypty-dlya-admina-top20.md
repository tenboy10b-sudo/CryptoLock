---
title: "20 PowerShell скриптів які має кожен адміністратор Windows"
date: "2026-02-08"
publishDate: "2026-02-08"
description: "Збірка готових PowerShell скриптів для системного адміністратора: інвентаризація, моніторинг, безпека, очищення, управління акаунтами, мережа, автоматичні звіти — і швидкі однорядкові команди на щодень."
tags: ["powershell", "адміністрування", "windows", "автоматизація", "інструменти"]
readTime: 12
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

### 5а. Перевірка і автоматичний перезапуск критичних служб на конкретних серверах

Розширена версія скрипта 5 — не просто попереджає, а сама перезапускає службу на віддаленому сервері:

```powershell
$criticalServices = @(
    @{Server="DC01"; Service="NTDS"},
    @{Server="DC01"; Service="DNS"},
    @{Server="FileServer"; Service="LanmanServer"},
    @{Server="PrintServer"; Service="Spooler"}
)

foreach ($item in $criticalServices) {
    $svc = Get-Service -Name $item.Service -ComputerName $item.Server -ErrorAction SilentlyContinue
    if ($svc.Status -ne "Running") {
        Write-Warning "$($item.Server): служба $($item.Service) не запущена — перезапускаю"
        Invoke-Command -ComputerName $item.Server -ScriptBlock {
            param($svcName)
            Start-Service -Name $svcName
        } -ArgumentList $item.Service
    } else {
        Write-Output "OK: $($item.Server)\$($item.Service)"
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

### 11а. Очищення профілів застарілих користувачів

```powershell
# Знайти профілі на ПК що не використовувались більше 90 днів
$computers = Get-ADComputer -Filter * | Select-Object -ExpandProperty Name

foreach ($pc in $computers) {
    try {
        $profiles = Get-WmiObject Win32_UserProfile -ComputerName $pc |
          Where-Object {
            -not $_.Special -and
            $_.LastUseTime -lt (Get-Date).AddDays(-90).ToFileTime()
          }

        foreach ($profile in $profiles) {
            $sid = New-Object System.Security.Principal.SecurityIdentifier($profile.SID)
            $user = $sid.Translate([System.Security.Principal.NTAccount]).Value
            Write-Output "$pc : видаляю профіль $user (останній вхід: $($profile.LastUseTime))"
            # $profile.Delete()  # розкоментуй щоб реально видаляти
        }
    } catch { }
}
```

---

## Управління акаунтами

### 12а. Масове розблокування і скидання паролів

```powershell
# Розблокувати всі заблоковані акаунти
$locked = Search-ADAccount -LockedOut
$locked | ForEach-Object {
    Unlock-ADAccount -Identity $_
    Write-Output "Розблоковано: $($_.SamAccountName)"
}
Write-Output "Всього розблоковано: $($locked.Count)"

# Примусово скинути паролі для групи
$newPass = ConvertTo-SecureString "TempPass123!" -AsPlainText -Force
Get-ADGroupMember "IT_Department" | ForEach-Object {
    Set-ADAccountPassword -Identity $_.SamAccountName -NewPassword $newPass -Reset
    Set-ADUser -Identity $_.SamAccountName -ChangePasswordAtLogon $true
    Write-Output "Пароль скинуто: $($_.SamAccountName)"
}
```

### 12б. Звіт про акаунти чий пароль скоро закінчується

На відміну від скрипта 9 (шукає акаунти де пароль взагалі ніколи не закінчується) — цей знаходить акаунти де закінчення вже близько:

```powershell
$maxAge = (Get-ADDefaultDomainPasswordPolicy).MaxPasswordAge.Days

Get-ADUser -Filter {Enabled -eq $true -and PasswordNeverExpires -eq $false} `
  -Properties PasswordLastSet, EmailAddress |
  ForEach-Object {
    $expiry = $_.PasswordLastSet.AddDays($maxAge)
    $daysLeft = ($expiry - (Get-Date)).Days
    if ($daysLeft -le 14 -and $daysLeft -ge 0) {
        [PSCustomObject]@{
            User     = $_.SamAccountName
            Email    = $_.EmailAddress
            Expires  = $expiry.ToString("dd.MM.yyyy")
            DaysLeft = $daysLeft
        }
    }
} | Sort-Object DaysLeft | Format-Table -AutoSize
```

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

### 18а. Масова установка програм через winget на кількох ПК

```powershell
$computers = @("PC-001", "PC-002", "PC-003")
$apps = @("7zip.7zip", "VideoLAN.VLC", "Notepad++.Notepad++")

Invoke-Command -ComputerName $computers -ScriptBlock {
    param($appList)
    foreach ($app in $appList) {
        winget install $app --silent --accept-package-agreements --accept-source-agreements
        Write-Output "Встановлено: $app на $env:COMPUTERNAME"
    }
} -ArgumentList (,$apps)
```

### 18б. Аудит прав на спільних папках файлового сервера

```powershell
$shares = Get-SmbShare -Special $false |
  Where-Object { $_.Name -ne "IPC$" }

foreach ($share in $shares) {
    Write-Output "`n=== $($share.Name) ($($share.Path)) ==="
    Get-SmbShareAccess -Name $share.Name |
      Select-Object AccountName, AccessRight, AccessControlType |
      Format-Table -AutoSize
}
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

## Швидкі однорядкові команди (без Active Directory)

Не завжди потрібен цілий скрипт — іноді достатньо одного рядка. Ці працюють і на самотньому ПК, без домену:

**Користувачі:**
```powershell
Get-LocalUser
$pass = ConvertTo-SecureString "Password123!" -AsPlainText -Force
New-LocalUser -Name "john" -Password $pass -FullName "John Smith"
Add-LocalGroupMember -Group "Administrators" -Member "john"
Disable-LocalUser -Name "john"
Remove-LocalUser -Name "john"
```

**Процеси:**
```powershell
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 Name, CPU, Id
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 10 Name, @{N="RAM(MB)";E={[Math]::Round($_.WorkingSet/1MB)}}
Stop-Process -Name "notepad" -Force
```

**Мережа:**
```powershell
Get-NetIPAddress | Select-Object InterfaceAlias, IPAddress, PrefixLength
Get-NetRoute | Select-Object DestinationPrefix, NextHop, InterfaceAlias
Test-NetConnection google.com
Get-NetTCPConnection | Where-Object {$_.State -eq "Listen"} | Select-Object LocalPort, OwningProcess
```

**Диски і файли:**
```powershell
Get-PSDrive -PSProvider FileSystem | Select-Object Name, @{N="Free(GB)";E={[Math]::Round($_.Free/1GB,1)}}, @{N="Used(GB)";E={[Math]::Round(($_.Used)/1GB,1)}}
Get-ChildItem C:\ -Recurse -ErrorAction SilentlyContinue | Where-Object {$_.Length -gt 100MB} | Sort-Object Length -Descending | Select-Object FullName, @{N="Size(MB)";E={[Math]::Round($_.Length/1MB)}}
```

**Оновлення Windows:**
```powershell
Install-Module PSWindowsUpdate -Force
Get-WindowsUpdate
Install-WindowsUpdate -AcceptAll -AutoReboot
```

**Системна інформація:**
```powershell
(Get-CimInstance Win32_OperatingSystem).LastBootUpTime
(Get-CimInstance Win32_BIOS).SerialNumber
(Get-CimInstance Win32_Processor).Name
[Math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory/1GB)
```

> Також дивись: [Як заборонити запуск PowerShell через групову політику](/zaborona-zapusku-powershell)

---

## Підсумок

Скрипти на цій сторінці — для домену/автоматизації, однорядкові команди вище — для швидкої разової перевірки на одному ПК. Збережи скрипти в папку `C:\Scripts\` і додай найважливіші в Task Scheduler для автоматичного запуску. Скрипти 4, 5, 7 — запускай щодня. Скрипти 1, 8, 9, 12б, 13 — щотижня. Скрипт 16 — щодня для зберігання в архів.

---

## ⚡ Шукаєш потрібну команду?

**[→ PowerShell і CMD довідник](/tools/powershell-commands)** — 40+ команд з пошуком за задачею. Введи "мережа", "диск" або "безпека" і одразу отримай готову команду.

