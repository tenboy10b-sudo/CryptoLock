---
title: "WMI в Windows: запити, управління і автоматизація через PowerShell"
date: "2026-09-22"
publishDate: "2026-09-22"
description: "Робота з WMI (Windows Management Instrumentation) через PowerShell: Get-WmiObject, CIM, запити до системної інформації, BIOS, диски, процеси і мережа."
tags: ["powershell", "адміністрування", "windows", "інструменти", "автоматизація"]
readTime: 7
---

WMI (Windows Management Instrumentation) — вбудована в Windows інфраструктура для управління і моніторингу системи. Через неї можна отримати практично будь-яку системну інформацію.

---

## Get-WmiObject vs Get-CimInstance

Обидві команди звертаються до WMI але CIM є сучасною заміною:

```powershell
# Старий спосіб (все ще працює)
Get-WmiObject Win32_OperatingSystem

# Сучасний спосіб (рекомендовано)
Get-CimInstance Win32_OperatingSystem
```

`Get-CimInstance` підтримує WSMan (HTTPS), працює з Linux через PowerShell Core, і є стандартом для нового коду.

---

## Системна інформація

```powershell
# ОС і версія
Get-CimInstance Win32_OperatingSystem |
  Select-Object Caption, Version, BuildNumber, OSArchitecture, LastBootUpTime

# BIOS
Get-CimInstance Win32_BIOS |
  Select-Object Manufacturer, Name, Version, SerialNumber, ReleaseDate

# Материнська плата
Get-CimInstance Win32_BaseBoard |
  Select-Object Manufacturer, Product, Version, SerialNumber

# Процесор
Get-CimInstance Win32_Processor |
  Select-Object Name, NumberOfCores, NumberOfLogicalProcessors, MaxClockSpeed, CurrentClockSpeed

# RAM (кожна планка)
Get-CimInstance Win32_PhysicalMemory |
  Select-Object BankLabel, Capacity, Speed, Manufacturer, PartNumber |
  ForEach-Object {
    $_ | Add-Member -MemberType NoteProperty -Name "GB" -Value ([math]::Round($_.Capacity/1GB))
    $_
  } | Format-Table BankLabel, GB, Speed, Manufacturer, PartNumber
```

---

## Диски і зберігання

```powershell
# Логічні диски з вільним місцем
Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" |
  Select-Object DeviceID,
    @{N="Total GB";E={[math]::Round($_.Size/1GB,1)}},
    @{N="Free GB"; E={[math]::Round($_.FreeSpace/1GB,1)}},
    @{N="Free %";  E={[math]::Round($_.FreeSpace/$_.Size*100)}} |
  Format-Table -AutoSize

# Фізичні диски
Get-CimInstance Win32_DiskDrive |
  Select-Object Model, Size, MediaType, Status

# Розділи
Get-CimInstance Win32_DiskPartition |
  Select-Object Name, Size, Type, BootPartition
```

---

## Мережа

```powershell
# Мережеві адаптери з IP
Get-CimInstance Win32_NetworkAdapterConfiguration -Filter "IPEnabled=True" |
  Select-Object Description, IPAddress, IPSubnet, DefaultIPGateway, DNSServerSearchOrder

# Тільки активні адаптери
Get-CimInstance Win32_NetworkAdapter -Filter "NetEnabled=True" |
  Select-Object Name, MACAddress, Speed, AdapterType
```

---

## Процеси і служби

```powershell
# Процеси з деталями (більше інформації ніж Get-Process)
Get-CimInstance Win32_Process |
  Select-Object Name, ProcessId, ParentProcessId, CreationDate,
    @{N="RAM MB";E={[math]::Round($_.WorkingSetSize/1MB)}} |
  Sort-Object "RAM MB" -Descending |
  Select-Object -First 10

# Знайти батьківський процес
$proc = Get-CimInstance Win32_Process -Filter "ProcessId=1234"
$parent = Get-CimInstance Win32_Process -Filter "ProcessId=$($proc.ParentProcessId)"
Write-Output "Батьківський: $($parent.Name)"

# Служби
Get-CimInstance Win32_Service -Filter "StartMode='Auto' AND State='Stopped'" |
  Select-Object Name, DisplayName, StartMode, State
```

---

## Програмне забезпечення

```powershell
# Встановлені програми
Get-CimInstance Win32_Product |
  Select-Object Name, Version, Vendor, InstallDate |
  Sort-Object Name |
  Format-Table -AutoSize

# Або швидший спосіб (Win32_Product запускає MSI repair на деяких системах!)
# Безпечніший варіант через реєстр:
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*",
                 "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*" |
  Where-Object { $_.DisplayName } |
  Select-Object DisplayName, DisplayVersion, Publisher |
  Sort-Object DisplayName
```

---

## Запити до кількох ПК

```powershell
# CIM Session — ефективніше ніж повторні підключення
$computers = @("Server01", "Server02", "Server03")
$sessions = New-CimSession -ComputerName $computers

# Отримати дані з усіх через одну сесію
Get-CimInstance Win32_OperatingSystem -CimSession $sessions |
  Select-Object PSComputerName, Caption, LastBootUpTime

# Закрити сесії
$sessions | Remove-CimSession
```

---

## Зміна параметрів через WMI

```powershell
# Перейменувати комп'ютер
$cs = Get-CimInstance Win32_ComputerSystem
Invoke-CimMethod -InputObject $cs -MethodName Rename -Arguments @{Name="NEW-PC-NAME"}

# Приєднати до домену
Invoke-CimMethod -InputObject $cs -MethodName JoinDomainOrWorkgroup `
  -Arguments @{
    Name = "company.local"
    UserName = "company\administrator"
    Password = "password"
    FJoinOptions = 3
  }
```

---

## Підсумок

`Get-CimInstance` замість `Get-WmiObject` — для нового коду. `Win32_OperatingSystem` — ОС, `Win32_Processor` — CPU, `Win32_PhysicalMemory` — RAM, `Win32_LogicalDisk` — диски, `Win32_Process` — процеси. `New-CimSession` — ефективне підключення до кількох серверів одночасно.
