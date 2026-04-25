---
title: "PowerShell скрипти для системного адміністратора: топ-10 готових рішень"
date: "2026-08-08"
publishDate: "2026-08-08"
description: "Готові PowerShell скрипти для щоденних задач адміністратора: інвентаризація ПК, моніторинг диску, перевірка служб, масові операції в домені та автоматичні звіти."
tags: ["powershell", "адміністрування", "windows", "автоматизація", "інструменти"]
readTime: 8
---

Збірка готових скриптів які вирішують реальні задачі адміністратора. Бери і використовуй — або адаптуй під своє середовище.

---

## 1. Інвентаризація всіх ПК у домені

```powershell
# Зібрати інформацію про всі ПК і зберегти в CSV
$computers = Get-ADComputer -Filter * -Properties OperatingSystem, LastLogonDate |
  Where-Object { $_.LastLogonDate -gt (Get-Date).AddDays(-30) }

$inventory = foreach ($pc in $computers) {
    try {
        $info = Get-WmiObject Win32_ComputerSystem -ComputerName $pc.Name -ErrorAction Stop
        $os   = Get-WmiObject Win32_OperatingSystem -ComputerName $pc.Name -ErrorAction Stop
        $disk = Get-WmiObject Win32_LogicalDisk -ComputerName $pc.Name -Filter "DeviceID='C:'" -ErrorAction Stop

        [PSCustomObject]@{
            Name       = $pc.Name
            User       = $info.UserName
            OS         = $os.Caption
            RAM_GB     = [math]::Round($info.TotalPhysicalMemory/1GB, 1)
            Disk_Free  = [math]::Round($disk.FreeSpace/1GB, 1)
            Disk_Total = [math]::Round($disk.Size/1GB, 1)
            LastLogon  = $pc.LastLogonDate
        }
    } catch {
        [PSCustomObject]@{ Name = $pc.Name; User = "OFFLINE"; OS = "N/A" }
    }
}

$inventory | Export-Csv "C:\Reports\inventory-$(Get-Date -Format 'yyyyMMdd').csv" -Encoding UTF8 -NoTypeInformation
Write-Output "Інвентаризація завершена: $($inventory.Count) ПК"
```

---

## 2. Моніторинг місця на диску з оповіщенням

```powershell
# Перевірити місце на дисках всіх серверів
$servers = @("Server01", "Server02", "FileServer")
$threshold = 15  # відсоток вільного місця

foreach ($server in $servers) {
    Get-WmiObject Win32_LogicalDisk -ComputerName $server -Filter "DriveType=3" |
      ForEach-Object {
        $freePercent = [math]::Round($_.FreeSpace / $_.Size * 100, 1)
        if ($freePercent -lt $threshold) {
            $msg = "ПОПЕРЕДЖЕННЯ: $server диск $($_.DeviceID) — вільно тільки $freePercent% ($([math]::Round($_.FreeSpace/1GB,1)) ГБ)"
            Write-Warning $msg
            # Записати в EventLog
            Write-EventLog -LogName Application -Source "DiskMonitor" `
              -EventId 1001 -EntryType Warning -Message $msg
        }
    }
}
```

---

## 3. Масова зміна паролів і розблокування акаунтів

```powershell
# Знайти і розблокувати всі заблоковані акаунти
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

---

## 4. Звіт по активності користувачів

```powershell
# Невдалі спроби входу за останні 24 години по всіх DC
$domainControllers = (Get-ADDomainController -Filter *).Name

$failedLogins = foreach ($dc in $domainControllers) {
    Get-WinEvent -ComputerName $dc -FilterHashtable @{
        LogName = 'Security'
        Id = 4625
        StartTime = (Get-Date).AddHours(-24)
    } -ErrorAction SilentlyContinue | ForEach-Object {
        [PSCustomObject]@{
            DC       = $dc
            Time     = $_.TimeCreated
            Account  = $_.Properties[5].Value
            IP       = $_.Properties[19].Value
        }
    }
}

# Топ акаунтів з найбільшою кількістю невдалих входів
$failedLogins | Group-Object Account |
  Sort-Object Count -Descending |
  Select-Object -First 10 Name, Count |
  Format-Table -AutoSize
```

---

## 5. Перевірка і перезапуск критичних служб

```powershell
# Список критичних служб і сервер
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

---

## 6. Очищення профілів застарілих користувачів

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

## 7. Масова установка програм через winget

```powershell
# Встановити набір програм на кількох ПК
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

---

## 8. Звіт про закінчення паролів

```powershell
# Знайти акаунти чий пароль закінчується в наступні 14 днів
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

---

## 9. Аудит прав на папках файлового сервера

```powershell
# Переглянути хто має доступ до спільних папок
$shares = Get-SmbShare -Special $false |
  Where-Object { $_.Name -ne "IPC$" }

foreach ($share in $shares) {
    Write-Output "`n=== $($share.Name) ($($share.Path)) ==="
    Get-SmbShareAccess -Name $share.Name |
      Select-Object AccountName, AccessRight, AccessControlType |
      Format-Table -AutoSize
}
```

---

## 10. Автоматичний щотижневий звіт по системі

```powershell
# Генерувати HTML звіт кожного понеділка
$report = @"
<html><body>
<h2>Системний звіт — $(Get-Date -Format 'dd.MM.yyyy')</h2>
<h3>Заблоковані акаунти</h3>
$(Search-ADAccount -LockedOut | Select-Object Name, SamAccountName | ConvertTo-Html -Fragment)
<h3>ПК що не виходили в мережу 30+ днів</h3>
$(Get-ADComputer -Filter {LastLogonDate -lt $((Get-Date).AddDays(-30))} -Properties LastLogonDate |
  Select-Object Name, LastLogonDate | ConvertTo-Html -Fragment)
</body></html>
"@

$report | Out-File "C:\Reports\weekly-$(Get-Date -Format 'yyyyMMdd').html"
Write-Output "Звіт збережено"
```

---

## Підсумок

Запусти ці скрипти через Task Scheduler для автоматизації: інвентаризація щомісяця, моніторинг дисків щогодини, звіт по паролях щотижня. Всі скрипти адаптуй під своє середовище — змінюй імена серверів, порогові значення і шляхи збереження звітів.
