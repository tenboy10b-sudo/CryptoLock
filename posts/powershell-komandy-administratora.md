---
title: "PowerShell команди для адміністратора Windows: топ-20"
date: "2026-04-10"
description: "Найкорисніші PowerShell команди для системного адміністрування Windows: управління користувачами, процесами, мережею і службами."
tags: ["powershell", "інструменти", "адміністрування", "windows"]
readTime: 8
---

PowerShell потужніший за CMD для адміністрування. Ось 20 команд які реально використовуються в роботі.

## Управління користувачами

```powershell
# Список всіх локальних користувачів
Get-LocalUser

# Створити користувача
$pass = ConvertTo-SecureString "Password123!" -AsPlainText -Force
New-LocalUser -Name "john" -Password $pass -FullName "John Smith"

# Додати до групи адмінів
Add-LocalGroupMember -Group "Administrators" -Member "john"

# Вимкнути користувача
Disable-LocalUser -Name "john"

# Видалити користувача
Remove-LocalUser -Name "john"
```

---

## Управління процесами

```powershell
# Топ-10 процесів по CPU
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 Name, CPU, Id

# Топ-10 по RAM (МБ)
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 10 Name, @{N="RAM(MB)";E={[Math]::Round($_.WorkingSet/1MB)}}

# Зупинити процес
Stop-Process -Name "notepad" -Force

# Зупинити по ID
Stop-Process -Id 1234 -Force
```

---

## Управління службами

```powershell
# Список запущених служб
Get-Service | Where-Object {$_.Status -eq "Running"}

# Зупинити службу
Stop-Service -Name "wuauserv"

# Запустити службу
Start-Service -Name "wuauserv"

# Змінити тип запуску
Set-Service -Name "wuauserv" -StartupType Disabled
```

---

## Мережа

```powershell
# IP-адреси всіх адаптерів
Get-NetIPAddress | Select-Object InterfaceAlias, IPAddress, PrefixLength

# Таблиця маршрутизації
Get-NetRoute | Select-Object DestinationPrefix, NextHop, InterfaceAlias

# Тест підключення (аналог ping)
Test-NetConnection google.com

# Відкриті порти
Get-NetTCPConnection | Where-Object {$_.State -eq "Listen"} | Select-Object LocalPort, OwningProcess
```

---

## Диски і файли

```powershell
# Місце на дисках
Get-PSDrive -PSProvider FileSystem | Select-Object Name, @{N="Free(GB)";E={[Math]::Round($_.Free/1GB,1)}}, @{N="Used(GB)";E={[Math]::Round(($_.Used)/1GB,1)}}

# Знайти великі файли (більше 100 МБ)
Get-ChildItem C:\ -Recurse -ErrorAction SilentlyContinue | Where-Object {$_.Length -gt 100MB} | Sort-Object Length -Descending | Select-Object FullName, @{N="Size(MB)";E={[Math]::Round($_.Length/1MB)}}
```

---

## Оновлення Windows

```powershell
# Перевірити оновлення (потрібен модуль PSWindowsUpdate)
Install-Module PSWindowsUpdate -Force
Get-WindowsUpdate

# Встановити всі оновлення
Install-WindowsUpdate -AcceptAll -AutoReboot
```

---

## Системна інформація

```powershell
# Коли останній раз перезавантажувались
(Get-CimInstance Win32_OperatingSystem).LastBootUpTime

# Серійний номер ПК
(Get-CimInstance Win32_BIOS).SerialNumber

# Модель процесора
(Get-CimInstance Win32_Processor).Name

# Обсяг RAM
[Math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory/1GB) 
```

> Також дивись: [Як заборонити запуск PowerShell через групову політику](/zaborona-zapusku-powershell)
