---
title: "Windows Server Core: управління сервером без графічного інтерфейсу"
date: "2026-07-28"
publishDate: "2026-07-28"
description: "Основи роботи з Windows Server Core: базові команди, встановлення ролей, Remote Management і підключення через PowerShell Remoting і Windows Admin Center."
tags: ["адміністрування", "windows", "powershell", "cmd", "мережа"]
readTime: 7
---

Windows Server Core — версія без графічного інтерфейсу. Займає менше місця, споживає менше ресурсів і має меншу поверхню атаки. Управляється через командний рядок і PowerShell.

---

## Базові команди після першого запуску

```cmd
rem Переглянути IP адресу
ipconfig

rem Налаштувати IP (якщо немає DHCP)
netsh interface ip set address "Ethernet" static 192.168.1.10 255.255.255.0 192.168.1.1

rem Налаштувати DNS
netsh interface ip set dns "Ethernet" static 192.168.1.1

rem Перейменувати сервер
netdom renamecomputer %computername% /newname:SERVER01 /reboot:5

rem Приєднати до домену
netdom join %computername% /domain:company.local /userd:administrator /passwordd:*
```

---

## Початкове налаштування через sconfig

`sconfig` — текстовий майстер налаштування Server Core:

```cmd
sconfig
```

Меню дозволяє:
1. Налаштувати домен або робочу групу
2. Перейменувати комп'ютер
3. Налаштувати Remote Management
4. Налаштувати Windows Update
5. Змінити мережеві параметри
6. Встановити дату і час

---

## Встановлення ролей і компонентів

```powershell
# Переглянути доступні ролі
Get-WindowsFeature | Where-Object { $_.InstallState -eq "Available" } |
  Select-Object Name, DisplayName | Format-Table

# Встановити роль (наприклад DNS Server)
Install-WindowsFeature -Name DNS -IncludeManagementTools

# Встановити AD DS
Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools

# Встановити Web Server (IIS)
Install-WindowsFeature -Name Web-Server -IncludeAllSubFeature

# Видалити роль
Remove-WindowsFeature -Name DNS
```

---

## Увімкнути Remote Management

Щоб управляти сервером з іншого ПК:

```powershell
# Увімкнути WinRM
Enable-PSRemoting -Force

# Перевірити статус
Get-Service WinRM

# Переглянути налаштування
winrm get winrm/config
```

---

## Підключитись до Server Core з іншого ПК

```powershell
# PowerShell Remoting (рекомендовано)
Enter-PSSession -ComputerName SERVER01 -Credential (Get-Credential)

# Або виконати команду без інтерактивного сеансу
Invoke-Command -ComputerName SERVER01 -ScriptBlock { Get-Service | Where-Object { $_.Status -ne "Running" } }

# RDP якщо дозволено
mstsc /v:SERVER01
```

---

## Windows Admin Center

Графічний веб-інтерфейс для управління Server Core з браузера.

**На сервері:**
```powershell
# Завантажити і встановити (або через winget)
winget install Microsoft.WindowsAdminCenter
```

**На адміністраторській машині:**
Відкрий браузер → `https://SERVER01:443` → управляй сервером через GUI.

---

## Корисні команди для Server Core

```powershell
# Статус всіх служб
Get-Service | Sort-Object Status | Format-Table Name, Status, StartType

# Встановлені ролі
Get-WindowsFeature | Where-Object { $_.InstallState -eq "Installed" }

# Використання ресурсів
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 Name, CPU, WorkingSet
Get-Counter "\Processor(_Total)\% Processor Time"

# Переглянути журнал подій
Get-WinEvent -FilterHashtable @{LogName='System'; Level=1,2; StartTime=(Get-Date).AddHours(-24)}

# Перезавантаження і вимкнення
Restart-Computer -Force
Stop-Computer -Force
```

---

## Налаштування брандмауера через netsh

```cmd
rem Відкрити порт 443
netsh advfirewall firewall add rule name="HTTPS" dir=in action=allow protocol=TCP localport=443

rem Переглянути правила
netsh advfirewall firewall show rule name=all | findstr "Rule Name"
```

---

## Перемикання між Core і Desktop Experience

```powershell
# Додати GUI (Desktop Experience) до Server Core
Install-WindowsFeature -Name Server-Gui-Shell -Restart

# Прибрати GUI і повернутись до Core
Uninstall-WindowsFeature -Name Server-Gui-Shell -Restart
```

---

## Переваги Server Core

- **Менша поверхня атаки** — менше компонентів = менше вразливостей
- **Менше ресурсів** — ~1 ГБ RAM замість 2 ГБ для Desktop Experience
- **Менше оновлень** — рідше перезавантаження
- **Швидший старт** — без завантаження графічного стеку

---

## Підсумок

`sconfig` — початкове налаштування. `Install-WindowsFeature` — ролі. `Enable-PSRemoting` + `Enter-PSSession` — дистанційне управління. Windows Admin Center — якщо потрібен GUI без встановлення Desktop Experience. Server Core — стандарт для продакшн серверів де не потрібен постійний GUI.
