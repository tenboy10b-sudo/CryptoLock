---
title: "Як встановити і налаштувати IIS веб-сервер на Windows"
date: "2026-07-18"
publishDate: "2026-07-18"
description: "Встановлення і налаштування IIS на Windows 10 і Server. Створення сайтів, SSL сертифікати, пули застосунків і управління через PowerShell."
tags: ["windows", "iis", "веб-сервер", "ssl", "адміністрування", "powershell"]
readTime: 5
translatesEn: "how-to-configure-windows-iis"
---

IIS — вбудований веб-сервер Windows включений в Windows 10/11 Pro і всі Server редакції.

---

## Встановити IIS

```powershell
# Windows 10/11
Enable-WindowsOptionalFeature -Online -FeatureName "IIS-WebServerRole" -All -NoRestart

# Windows Server
Install-WindowsFeature Web-Server -IncludeManagementTools

# Відкрити менеджер IIS
inetmgr
```

---

## Створити сайт

```powershell
Import-Module WebAdministration

New-WebSite -Name "MySite" -Port 80 `
  -PhysicalPath "C:\inetpub\MySite" `
  -ApplicationPool "DefaultAppPool"

New-Item "C:\inetpub\MySite" -ItemType Directory -Force
Start-WebSite -Name "MySite"

Get-WebSite | Select-Object Name, State, PhysicalPath
```

---

## SSL сертифікат

```powershell
# Самопідписаний (для тестування)
$cert = New-SelfSignedCertificate `
  -DnsName "mysite.local" `
  -CertStoreLocation "cert:\LocalMachine\My" `
  -NotAfter (Get-Date).AddYears(2)

# Прив'язати до HTTPS
$binding = Get-WebBinding -Name "MySite" -Protocol "https"
$binding.AddSslCertificate($cert.Thumbprint, "My")
```

---

## Пул застосунків

```powershell
New-WebAppPool -Name "MyAppPool"
Set-ItemProperty "IIS:\AppPools\MyAppPool" -Name "managedRuntimeVersion" -Value "v4.0"
Restart-WebAppPool -Name "MyAppPool"
```

---

## Часті питання

### IIS vs Apache vs nginx — коли обирати IIS?

IIS коли: Windows Server, ASP.NET застосунки, інтеграція з AD. Apache/nginx коли: Linux сервер або PHP. IIS глибоко інтегрований з Windows і обробляє .NET нативно.

### Пул застосунків постійно падає — як діагностувати?

Event Viewer → Application для деталей. Логи IIS в `C:\inetpub\logs\`. Failed Request Tracing в IIS Manager. Перевір права доступу пулу на папку сайту.

---

## Резюме

Встановити через `Enable-WindowsOptionalFeature` або `Install-WindowsFeature`. Сайти через `New-WebSite`. Пули через `New-WebAppPool`. SSL через `New-SelfSignedCertificate`. GUI через `inetmgr`.
