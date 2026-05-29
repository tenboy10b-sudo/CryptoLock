---
title: "Базове налаштування Windows Server для початківців"
date: "2026-04-28"
publishDate: "2026-04-28"
description: "Перші кроки після встановлення Windows Server: оновлення, мережа, Active Directory, Hyper-V або ролі файлового сервера. Короткий огляд що і коли вмикати."
tags: ["windows", "адміністрування", "сервер", "мережа"]
readTime: 5
---

Windows Server на перший погляд схожий на Windows 10/11, але з кардинально іншим призначенням. Ось що налаштовувати першим.

---

## Після встановлення: Server Manager

Відкривається автоматично. Звідси управляєш всім:
- Dashboard — загальний стан
- Add roles and features — додавати ролі
- Local Server — налаштування сервера
- Events — журнал подій

---

## Крок 1: Ім'я і IP-адреса

Сервер повинен мати статичну IP і зрозуміле ім'я:

```powershell
# Змінити ім'я сервера
Rename-Computer -NewName "DC01" -Restart

# Задати статичну IP
New-NetIPAddress -InterfaceAlias "Ethernet" `
  -IPAddress "192.168.1.10" -PrefixLength 24 -DefaultGateway "192.168.1.1"
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses "1.1.1.1","8.8.8.8"
```

---

## Крок 2: Windows Update

```powershell
# Перевірити і встановити всі оновлення
Install-Module PSWindowsUpdate -Force -Scope AllUsers
Get-WindowsUpdate
Install-WindowsUpdate -AcceptAll -AutoReboot
```

---

## Крок 3: Вибрати ролі

Залежно від призначення сервера:

**Файловий сервер:**
```powershell
Install-WindowsFeature -Name FS-FileServer -IncludeManagementTools
```

**Web-сервер (IIS):**
```powershell
Install-WindowsFeature -Name Web-Server -IncludeManagementTools
```

**Hyper-V (віртуалізація):**
```powershell
Install-WindowsFeature -Name Hyper-V -IncludeManagementTools -Restart
```

**Active Directory Domain Services:**
```powershell
Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools
# Потім просувати до контролера домену:
Install-ADDSForest -DomainName "company.local"
```

**DNS Server:**
```powershell
Install-WindowsFeature -Name DNS -IncludeManagementTools
```

---

## Крок 4: Базова безпека

```powershell
# Вимкнути невикористовувані служби
Set-Service "Fax" -StartupType Disabled
Set-Service "RemoteRegistry" -StartupType Disabled
Set-Service "Spooler" -StartupType Disabled  # якщо немає принтерів

# Вимкнути непотрібні мережеві протоколи
Disable-NetAdapterBinding -Name "Ethernet" -ComponentID ms_tcpip6  # IPv6 якщо не потрібен

# Налаштувати брандмауер
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

---

## Крок 5: Резервне копіювання

```powershell
# Windows Server Backup (вбудований)
Install-WindowsFeature Windows-Server-Backup

# Налаштувати щоденний бекап на D:
$policy = New-WBPolicy
$fileSpec = New-WBFileSpec -FileSpec "C:\"
Add-WBVolume -Policy $policy -Volume (Get-WBVolume -VolumePath "C:\")
Set-WBSchedule -Policy $policy -Schedule 02:00
Set-WBBackupTarget -Policy $policy -Target (New-WBBackupTarget -VolumePath "D:\")
Set-WBPolicy -Policy $policy
```

---

## Корисні команди для адміністрування

```powershell
# Стан ролей і функцій
Get-WindowsFeature | Where-Object {$_.Installed} | Select-Object Name, DisplayName

# Відкриті TCP порти (що слухає сервер)
Get-NetTCPConnection -State Listen | Select-Object LocalPort,
  @{n='Process';e={(Get-Process -Id $_.OwningProcess -EA 0).Name}} |
  Sort-Object LocalPort

# Використання ресурсів
Get-Counter '\Processor(_Total)\% Processor Time', '\Memory\Available MBytes' |
  Select-Object -ExpandProperty CounterSamples | Select-Object Path, CookedValue

# Активні сесії
query session

# Список локальних адміністраторів
Get-LocalGroupMember -Group "Administrators"
```

---

## Core (без GUI) vs Desktop Experience

Windows Server може встановлюватись без графічного інтерфейсу (Core) — менше атаки, менше ресурсів.

Перемикання:
```powershell
# Перейти в Core режим (вимагає перезавантаження)
Uninstall-WindowsFeature Server-Gui-Shell, Server-Gui-Mgmt-Infra -Restart
```

На Core всі команди через PowerShell або Remote Server Administration Tools (RSAT) з іншого ПК.

---

## Резюме

Після встановлення: Ім'я → Статична IP → Windows Update → Ролі → Безпека → Резервне копіювання. Вибір ролей залежить від призначення: файловий сервер, веб-сервер, AD, Hyper-V. Для малого бізнесу зазвичай достатньо Active Directory + File Server + Hyper-V на одному сервері.
