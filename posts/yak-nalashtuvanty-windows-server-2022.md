---
title: "Windows Server 2022: початкове налаштування після встановлення"
date: "2026-08-23"
publishDate: "2026-08-23"
description: "Перші кроки після встановлення Windows Server 2022: ім'я сервера, статичний IP, оновлення, базова безпека, ролі і моніторинг. Покрокова інструкція."
tags: ["адміністрування", "windows", "мережа", "безпека", "powershell"]
readTime: 7
---

Свіжо встановлений Windows Server 2022 потребує базового налаштування перш ніж вводити його в роботу. Ось стандартний чеклист.

---

## 1. Перейменувати сервер

За замовчуванням ім'я типу `WIN-ABCD1234` — змініть на щось зрозуміле.

```powershell
Rename-Computer -NewName "SRV-DC01" -Restart
```

Правило іменування: роль-номер (SRV-DC01, SRV-FILE02, SRV-APP01).

---

## 2. Налаштувати статичний IP

Сервер завжди повинен мати статичний IP.

```powershell
# Знайти адаптер
Get-NetAdapter | Select-Object Name, Status

# Встановити статичний IP
$adapter = "Ethernet"
New-NetIPAddress `
  -InterfaceAlias $adapter `
  -IPAddress "192.168.1.10" `
  -PrefixLength 24 `
  -DefaultGateway "192.168.1.1"

Set-DnsClientServerAddress `
  -InterfaceAlias $adapter `
  -ServerAddresses "192.168.1.1", "8.8.8.8"
```

---

## 3. Встановити оновлення

```powershell
# Встановити модуль PSWindowsUpdate якщо потрібно
Install-Module PSWindowsUpdate -Force

# Встановити всі оновлення
Get-WUInstall -AcceptAll -AutoReboot
```

Або через Server Manager → **Local Server** → **Windows Update**.

---

## 4. Налаштувати часовий пояс і NTP

```powershell
# Встановити часовий пояс
Set-TimeZone -Name "FLE Standard Time"  # Київ

# Синхронізувати час
w32tm /config /manualpeerlist:"time.windows.com" /syncfromflags:manual /update
Restart-Service w32tm
w32tm /resync /force
```

---

## 5. Вимкнути IE Enhanced Security

IE Enhanced Security Configuration блокує завантаження файлів через браузер — заважає роботі адміністратора.

```powershell
# Вимкнути для адміністраторів
$AdminKey = "HKLM:\SOFTWARE\Microsoft\Active Setup\Installed Components\{A509B1A7-37EF-4b3f-8CFC-4F3A74704073}"
Set-ItemProperty -Path $AdminKey -Name "IsInstalled" -Value 0

# Вимкнути для користувачів
$UserKey = "HKLM:\SOFTWARE\Microsoft\Active Setup\Installed Components\{A509B1A8-37EF-4b3f-8CFC-4F3A74704073}"
Set-ItemProperty -Path $UserKey -Name "IsInstalled" -Value 0

Stop-Process -Name Explorer -Force
```

---

## 6. Налаштувати брандмауер

```powershell
# Перевірити статус
Get-NetFirewallProfile | Select-Object Name, Enabled

# Увімкнути ICMP (ping) для моніторингу
New-NetFirewallRule -Name "Allow-ICMPv4" -DisplayName "Allow ICMPv4" `
  -Protocol ICMPv4 -IcmpType 8 -Direction Inbound -Action Allow

# RDP (якщо потрібен)
Enable-NetFirewallRule -DisplayGroup "Remote Desktop"
```

---

## 7. Встановити необхідні ролі

```powershell
# Переглянути доступні ролі
Get-WindowsFeature | Where-Object { $_.InstallState -eq "Available" } |
  Select-Object Name, DisplayName | Format-Table

# Приклад: встановити File Server
Install-WindowsFeature -Name FS-FileServer -IncludeManagementTools

# DNS Server
Install-WindowsFeature -Name DNS -IncludeManagementTools

# AD DS (контролер домену)
Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools
```

---

## 8. Налаштувати аудит безпеки

```powershell
# Увімкнути аудит входів і виходів
auditpol /set /subcategory:"Logon" /success:enable /failure:enable
auditpol /set /subcategory:"Logoff" /success:enable
auditpol /set /subcategory:"Account Lockout" /success:enable /failure:enable

# Переглянути поточну конфігурацію
auditpol /get /category:*
```

---

## 9. Налаштувати Remote Management

```powershell
# Увімкнути WinRM для PowerShell Remoting
Enable-PSRemoting -Force

# Перевірити
Test-WSMan -ComputerName localhost
```

---

## 10. Налаштувати резервне копіювання

```powershell
# Встановити Windows Server Backup
Install-WindowsFeature -Name Windows-Server-Backup

# Налаштувати щоденний backup на зовнішній диск
$policy = New-WBPolicy
$volume = Get-WBVolume -AllVolumes | Where-Object { $_.DriveLetter -eq "C" }
Add-WBVolume -Policy $policy -Volume $volume
$target = New-WBBackupTarget -VolumePath "D:"
Add-WBBackupTarget -Policy $policy -Target $target
Set-WBSchedule -Policy $policy -Schedule 02:00
Set-WBPolicy -Policy $policy
```

---

## Чеклист після налаштування

```powershell
# Швидка перевірка стану сервера
Write-Output "=== System Info ==="
Get-ComputerInfo | Select-Object CsName, OsName, OsVersion

Write-Output "=== Network ==="
Get-NetIPConfiguration | Select-Object InterfaceAlias, IPv4Address, IPv4DefaultGateway

Write-Output "=== Services ==="
Get-Service | Where-Object { $_.StartType -eq "Automatic" -and $_.Status -ne "Running" } |
  Select-Object Name, Status

Write-Output "=== Disk Space ==="
Get-PSDrive -PSProvider FileSystem | Select-Object Name,
  @{N="Free GB";E={[math]::Round($_.Free/1GB,1)}},
  @{N="Used GB";E={[math]::Round($_.Used/1GB,1)}}
```

---

## Підсумок

Мінімальний чеклист для нового Server 2022: перейменувати → статичний IP → оновлення → часовий пояс → вимкнути IE ESC → налаштувати аудит → увімкнути WinRM. Після цього сервер готовий до встановлення ролей.
