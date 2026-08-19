---
title: "Windows Server 2022 і 2019: що це таке, редакції і основні налаштування"
date: "2026-08-25"
publishDate: "2026-08-25"
updated: "2026-08-21"
description: "Що таке Windows Server, чим відрізняється від Windows 10/11, редакції Standard і Datacenter. Початкове налаштування після встановлення, Active Directory, DNS, DHCP."
tags: ["windows", "windows-server", "адміністрування", "active-directory", "мережа"]
readTime: 9
translatesEn: "windows-server-2022-2019-setup-guide"
---

Потрібен покроковий чеклист одразу після встановлення (перейменування, IP, оновлення, безпека) — окремий гайд: [Windows Server 2022 — початкове налаштування](/yak-nalashtuvanty-windows-server-2022).

Windows Server — серверна операційна система від Microsoft для корпоративних середовищ. Якщо Windows 10/11 — для робочого столу, то Windows Server — для керування мережею, зберігання даних і запуску корпоративних додатків.

---

## Windows Server vs Windows 10/11

| | Windows 10/11 | Windows Server |
|-|--------------|----------------|
| Призначення | Робочий стіл | Сервер, мережа |
| Ліцензія | ~$200 | $500–6000+ |
| Active Directory | ❌ | ✅ |
| Hyper-V Server | Обмежено | Повний |
| Кількість з'єднань RDP | 1 | Необмежено (з ліцензіями) |
| RAM | До 2 ТБ | До 48 ТБ |
| Ядра CPU | До 2 сокетів | Необмежено |
| Графічний інтерфейс | Завжди | Опціонально (Core) |

---

## Редакції Windows Server 2022

### Standard
- До 2 віртуальних машин Hyper-V
- Всі серверні ролі
- Ціна: ~$1000 за 2 процесори + CAL

### Datacenter
- Необмежена кількість VM
- Додаткові функції: Storage Spaces Direct, Shielded VMs
- Ціна: ~$6000 за 2 процесори + CAL

### Essentials
- До 25 користувачів і 50 пристроїв
- Без Hyper-V ролі
- Ціна: ~$500

> **CAL (Client Access License)** — додаткова ліцензія для кожного користувача або пристрою що підключається до сервера.

---

## Встановлення Windows Server

Процес схожий на встановлення Windows 10/11:

1. Завантаж ISO з [microsoft.com/evalcenter](https://www.microsoft.com/en-us/evalcenter/evaluate-windows-server-2022) (180 днів безкоштовно)
2. Запиши на флешку через Rufus (GPT + UEFI)
3. При встановленні вибери редакцію:
   - **"Desktop Experience"** — з GUI
   - **"Server Core"** — тільки командний рядок (менше навантаження)

---

## Початкове налаштування після встановлення

### Server Manager запускається автоматично

Або вручну: `Win + R` → `servermanager`

### Обов'язкові кроки після встановлення

```powershell
# 1. Задати ім'я комп'ютера
Rename-Computer -NewName "SRV-DC01" -Restart

# 2. Задати статичний IP
$adapter = Get-NetAdapter | Where-Object {$_.Status -eq "Up"} | Select-Object -First 1
New-NetIPAddress -InterfaceIndex $adapter.InterfaceIndex `
    -IPAddress "192.168.1.10" -PrefixLength 24 -DefaultGateway "192.168.1.1"
Set-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex `
    -ServerAddresses "192.168.1.10","8.8.8.8"

# 3. Синхронізація часу
w32tm /config /manualpeerlist:"time.windows.com" /syncfromflags:manual /reliable:YES /update
net stop w32tm && net start w32tm

# 4. Оновлення Windows
Install-Module PSWindowsUpdate -Force
Install-WindowsUpdate -AcceptAll -AutoReboot
```

---

## Active Directory Domain Services (AD DS)

AD DS — центральна роль Windows Server. Керує користувачами, комп'ютерами і правилами в організації.

### Встановлення AD DS

```powershell
# Встановити роль AD DS
Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools

# Налаштувати перший контролер домену
Install-ADDSForest `
    -DomainName "company.local" `
    -DomainNetbiosName "COMPANY" `
    -ForestMode "WinThreshold" `
    -DomainMode "WinThreshold" `
    -InstallDns:$true `
    -SafeModeAdministratorPassword (Read-Host -AsSecureString "DSRM Password") `
    -Force:$true
```

Після перезавантаження сервер стане контролером домену.

### Основні команди AD

```powershell
# Додати користувача
New-ADUser -Name "Іван Петренко" `
    -SamAccountName "i.petrenko" `
    -UserPrincipalName "i.petrenko@company.local" `
    -AccountPassword (Read-Host -AsSecureString "Password") `
    -Enabled $true

# Додати до групи
Add-ADGroupMember -Identity "Domain Admins" -Members "i.petrenko"

# Список всіх користувачів
Get-ADUser -Filter * | Select-Object Name, SamAccountName, Enabled

# Список комп'ютерів в домені
Get-ADComputer -Filter * | Select-Object Name, OperatingSystem
```

---

## DNS сервер

Windows Server автоматично встановлює DNS разом з AD DS. Базові команди:

```powershell
# Список DNS зон
Get-DnsServerZone

# Додати A запис
Add-DnsServerResourceRecordA -ZoneName "company.local" `
    -Name "webserver" -IPv4Address "192.168.1.20"

# Додати CNAME запис
Add-DnsServerResourceRecordCName -ZoneName "company.local" `
    -Name "www" -HostNameAlias "webserver.company.local"

# Переглянути всі записи зони
Get-DnsServerResourceRecord -ZoneName "company.local"
```

---

## DHCP сервер

DHCP автоматично видає IP адреси пристроям в мережі:

```powershell
# Встановити DHCP роль
Install-WindowsFeature -Name DHCP -IncludeManagementTools

# Авторизувати DHCP сервер в AD
Add-DhcpServerInDC

# Створити DHCP scope (діапазон адрес)
Add-DhcpServerv4Scope `
    -Name "Main Network" `
    -StartRange "192.168.1.100" `
    -EndRange "192.168.1.200" `
    -SubnetMask "255.255.255.0" `
    -State Active

# Задати шлюз і DNS для клієнтів
Set-DhcpServerv4OptionValue -ScopeId "192.168.1.0" `
    -Router "192.168.1.1" `
    -DnsServer "192.168.1.10"
```

---

## Hyper-V — віртуалізація

```powershell
# Встановити Hyper-V
Install-WindowsFeature -Name Hyper-V -IncludeManagementTools -Restart

# Створити віртуальний комутатор
New-VMSwitch -Name "ExternalSwitch" -NetAdapterName "Ethernet" -AllowManagementOS $true

# Створити VM
New-VM -Name "Ubuntu-Server" -MemoryStartupBytes 2GB `
    -Generation 2 -NewVHDPath "D:\VMs\Ubuntu.vhdx" -NewVHDSizeBytes 60GB

# Підключити ISO
Add-VMDvdDrive -VMName "Ubuntu-Server"
Set-VMDvdDrive -VMName "Ubuntu-Server" -Path "D:\ISOs\ubuntu-24.04.iso"

# Запустити VM
Start-VM -Name "Ubuntu-Server"
```

---

## Моніторинг і журнали

```powershell
# Переглянути системні події (помилки)
Get-EventLog -LogName System -EntryType Error -Newest 20 |
    Select-Object TimeGenerated, Source, Message

# Навантаження CPU
Get-Counter '\Processor(_Total)\% Processor Time' -SampleInterval 2 -MaxSamples 5

# Використання пам'яті
Get-Counter '\Memory\Available MBytes'

# Список запущених служб
Get-Service | Where-Object {$_.Status -eq "Running"} | Sort-Object Name
```

---

## Резюме

| Задача | Команда / Місце |
|--------|----------------|
| Встановити роль | `Install-WindowsFeature -Name [роль]` |
| Налаштувати AD | `Install-ADDSForest -DomainName domain.local` |
| Додати користувача | `New-ADUser` |
| Налаштувати DNS | `Add-DnsServerResourceRecordA` |
| Налаштувати DHCP | `Add-DhcpServerv4Scope` |
| Гіпервізор | `Install-WindowsFeature -Name Hyper-V` |
