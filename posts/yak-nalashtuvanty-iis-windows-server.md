---
title: "IIS на Windows Server: встановлення і налаштування веб-сервера"
date: "2026-08-01"
publishDate: "2026-08-01"
description: "Встановлення і базове налаштування IIS (Internet Information Services) на Windows Server: сайти, пули додатків, HTTPS, логування і управління через PowerShell."
tags: ["адміністрування", "windows", "мережа", "безпека", "powershell"]
readTime: 7
---

IIS (Internet Information Services) — вбудований веб-сервер Windows. Використовується для хостингу ASP.NET додатків, статичних сайтів і як зворотний проксі.

---

## Встановлення IIS

```powershell
# Встановити IIS з основними компонентами
Install-WindowsFeature -Name Web-Server -IncludeManagementTools

# Встановити з підтримкою ASP.NET
Install-WindowsFeature -Name Web-Server, Web-Asp-Net45, Web-Net-Ext45 -IncludeManagementTools

# Переглянути що встановлено
Get-WindowsFeature | Where-Object { $_.Name -like "Web-*" -and $_.InstallState -eq "Installed" }
```

Перевірити що IIS запущений:
```
http://localhost
```
Має відкритись стандартна сторінка IIS.

---

## Структура IIS

- **Sites** — колекція веб-сайтів
- **Application Pools** — ізольовані процеси для запуску додатків
- **Applications** — веб-додатки всередині сайту
- **Virtual Directories** — папки що відображаються як URL

---

## Створити новий сайт

```powershell
Import-Module WebAdministration

# Створити папку для сайту
New-Item -Path "C:\inetpub\mysite" -ItemType Directory

# Створити Application Pool
New-WebAppPool -Name "MySitePool"
Set-ItemProperty "IIS:\AppPools\MySitePool" -Name "managedRuntimeVersion" -Value "v4.0"

# Створити сайт
New-Website `
  -Name "MySite" `
  -Port 80 `
  -PhysicalPath "C:\inetpub\mysite" `
  -ApplicationPool "MySitePool"

# Запустити сайт
Start-WebSite -Name "MySite"

# Переглянути всі сайти
Get-Website
```

---

## Налаштування HTTPS (SSL)

```powershell
# Імпортувати SSL сертифікат
$cert = Import-PfxCertificate `
  -FilePath "C:\certs\mysite.pfx" `
  -CertStoreLocation "Cert:\LocalMachine\My" `
  -Password (ConvertTo-SecureString "certpassword" -AsPlainText -Force)

# Додати HTTPS binding до сайту
New-WebBinding `
  -Name "MySite" `
  -Protocol "https" `
  -Port 443 `
  -HostHeader "mysite.com"

# Прив'язати сертифікат до binding
$binding = Get-WebBinding -Name "MySite" -Protocol "https"
$binding.AddSslCertificate($cert.Thumbprint, "My")

# Перенаправлення HTTP → HTTPS (через URL Rewrite)
# Потрібен модуль URL Rewrite (встановлюється окремо)
```

---

## Налаштування Application Pool

```powershell
# Переглянути всі пули
Get-ChildItem "IIS:\AppPools"

# Змінити акаунт під яким працює пул
Set-ItemProperty "IIS:\AppPools\MySitePool" `
  -Name "processModel.userName" -Value "DOMAIN\serviceaccount"
Set-ItemProperty "IIS:\AppPools\MySitePool" `
  -Name "processModel.password" -Value "password"
Set-ItemProperty "IIS:\AppPools\MySitePool" `
  -Name "processModel.identityType" -Value 3  # 3 = SpecificUser

# Налаштувати автоматичний перезапуск при помилці
Set-ItemProperty "IIS:\AppPools\MySitePool" `
  -Name "failure.rapidFailProtection" -Value $false
Set-ItemProperty "IIS:\AppPools\MySitePool" `
  -Name "recycling.periodicRestart.time" -Value "02:00:00"  # щодня о 2 ночі
```

---

## Управління сайтами

```powershell
# Зупинити сайт
Stop-WebSite -Name "MySite"

# Запустити
Start-WebSite -Name "MySite"

# Перезапустити Application Pool
Restart-WebAppPool -Name "MySitePool"

# Видалити сайт
Remove-Website -Name "MySite"

# Переглянути статус всіх сайтів і пулів
Get-Website | Select-Object Name, State, PhysicalPath
Get-ChildItem "IIS:\AppPools" | Select-Object Name, State
```

---

## Логування

```powershell
# Де зберігаються логи
Get-WebConfigurationProperty -Filter "system.applicationHost/sites/site[@name='MySite']" `
  -Name "logFile.directory"

# Логи за замовчуванням: C:\inetpub\logs\LogFiles\W3SVC1\
# Формат файлів: u_ex240101.log

# Аналіз логів (знайти 500 помилки)
Get-Content "C:\inetpub\logs\LogFiles\W3SVC1\u_ex*.log" |
  Select-String " 500 " |
  Select-Object -Last 20
```

---

## Типові проблеми

### Помилка 403 — Forbidden

Перевір права доступу до папки сайту:
```powershell
$path = "C:\inetpub\mysite"
icacls $path /grant "IIS_IUSRS:(OI)(CI)R"
icacls $path /grant "IUSR:(OI)(CI)R"
```

### Помилка 500 — Internal Server Error

```powershell
# Увімкнути детальні помилки для діагностики
Set-WebConfigurationProperty `
  -Filter "system.webServer/httpErrors" `
  -Name "errorMode" `
  -Value "Detailed" `
  -PSPath "IIS:\Sites\MySite"
```

### Порт 80 зайнятий

```cmd
netstat -anob | findstr :80
```
Знайди який процес займає порт і зупини або перенастрой IIS на інший порт.

---

## Підсумок

`Install-WindowsFeature -Name Web-Server` — встановлення. `New-Website` — новий сайт. `New-WebAppPool` — пул додатків. Логи в `C:\inetpub\logs`. Права для папки — `IIS_IUSRS` і `IUSR`. Для HTTPS — імпортуй PFX сертифікат і додай binding через `New-WebBinding`.
