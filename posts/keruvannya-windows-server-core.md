---
title: "Як керувати Windows Server Core без графічного інтерфейсу"
date: "2026-07-28"
publishDate: "2026-07-28"
description: "Управління Windows Server Core без GUI. Налаштування мережі, встановлення ролей, дистанційне управління через PowerShell і інструменти RSAT."
tags: ["windows", "server-core", "powershell", "адміністрування", "remote"]
readTime: 4
translatesEn: "how-to-configure-windows-server-core"
---

Server Core — Windows Server без GUI. Менша поверхня атаки, менше ресурсів і рідші патчі. Все управляється через PowerShell або дистанційно.

---

## Початкова конфігурація

```powershell
# Перейменувати сервер
Rename-Computer -NewName "FILESERVER01" -Restart

# Статичний IP
New-NetIPAddress -InterfaceAlias "Ethernet" `
  -IPAddress "192.168.1.20" -PrefixLength 24 `
  -DefaultGateway "192.168.1.1"

# Приєднатись до домену
Add-Computer -DomainName "company.local" -Credential (Get-Credential) -Restart
```

---

## Sconfig — текстове меню конфігурації

```cmd
sconfig
```

Меню для: перейменування, домену, мережі, Windows Update, дистанційного управління.

---

## Встановити ролі

```powershell
Install-WindowsFeature DNS -IncludeManagementTools
Install-WindowsFeature FS-FileServer
Install-WindowsFeature Web-Server
Install-WindowsFeature Hyper-V -IncludeManagementTools -Restart
```

---

## Дистанційне управління

```powershell
Enable-PSRemoting -Force
Enable-NetFirewallRule -DisplayGroup "Remote Desktop"

# Підключення з управляючого ПК
Enter-PSSession -ComputerName "FILESERVER01" -Credential "company\admin"
```

---

## RSAT на Windows 11

```powershell
# Встановити всі RSAT інструменти
Get-WindowsCapability -Online | Where-Object {$_.Name -like "Rsat*"} |
  Add-WindowsCapability -Online
```

Потім підключай через Server Manager, DNS Manager тощо — вони прозоро підключаються до віддалених серверів.

---

## Часті питання

### Чи можна перейти з Core на Full GUI пізніше?

Так — `Install-WindowsFeature Server-Gui-Shell`. Але часте перемикання Core→GUI→Core не підтримується. Вирішуй при розгортанні.

### Які ролі не працюють на Server Core?

Дуже мало. Більшість ролей (AD, DNS, DHCP, File Server, Hyper-V, IIS) працюють на Core.

---

## Резюме

Налаштування через `sconfig` або PowerShell. WinRM для дистанційного управління. Ролі через `Install-WindowsFeature`. Дистанційне управління через `Enter-PSSession` або RSAT. Server Core рекомендований для більшості серверних ролей.
