---
title: "How to Install and Configure IIS Web Server on Windows"
date: "2026-06-15"
updated: "2026-08-13"
publishDate: "2026-06-15"
description: "Install and configure IIS (Internet Information Services) on Windows 10 and Server. Set up websites, SSL certificates, PHP, virtual directories and manage via PowerShell or GUI."
tags: ["windows", "iis", "web-server", "ssl", "administration", "powershell"]
readTime: 8
translatesUk: "nalashtuvannya-iis-web-server-windows"
---

IIS is Windows' built-in web server — included in Windows 10/11 Pro and all Server editions. Here's how to install it and configure production-ready websites.

---

## Install IIS

**Via Windows Features (GUI):** `Win + R` → `optionalfeatures` → expand **Internet Information Services** → check **Web Management Tools** and the **World Wide Web Services** features you need → OK. No restart needed.

**Via PowerShell:**

```powershell
# Windows 10/11 — basic IIS
Enable-WindowsOptionalFeature -Online -FeatureName "IIS-WebServerRole" -All -NoRestart

# Windows Server — full IIS with management tools
Install-WindowsFeature Web-Server -IncludeManagementTools

# Install additional features
Install-WindowsFeature `
  Web-Server, Web-Mgmt-Tools, Web-CGI,
  Web-ISAPI-Ext, Web-ISAPI-Filter,
  Web-Asp-Net45, Web-Net-Ext45 `
  -IncludeManagementTools

# Open IIS Manager
inetmgr
```

---

## Create a Website

```powershell
# Import WebAdministration module
Import-Module WebAdministration

# Create new website
New-WebSite -Name "MyWebsite" `
  -Port 80 `
  -PhysicalPath "C:\inetpub\MyWebsite" `
  -ApplicationPool "DefaultAppPool"

# Create the web root
New-Item "C:\inetpub\MyWebsite" -ItemType Directory -Force

# Start the website
Start-WebSite -Name "MyWebsite"

# List all websites
Get-WebSite | Select-Object Name, State, PhysicalPath, Bindings
```

---

## Configure Bindings (Host Headers)

```powershell
# Add host header binding
New-WebBinding -Name "MyWebsite" -Protocol "http" `
  -Port 80 -HostHeader "mysite.local"

# Add HTTPS binding
New-WebBinding -Name "MyWebsite" -Protocol "https" `
  -Port 443 -HostHeader "mysite.local"

# View bindings
Get-WebBinding -Name "MyWebsite"
```

---

## Configure Application Pool

```powershell
# Create custom app pool
New-WebAppPool -Name "MyAppPool"

# Set .NET version
Set-ItemProperty "IIS:\AppPools\MyAppPool" -Name "managedRuntimeVersion" -Value "v4.0"

# Set to run as specific account
$appPool = Get-Item "IIS:\AppPools\MyAppPool"
$appPool.processModel.userName = "DOMAIN\ServiceUser"
$appPool.processModel.password = "Password"
$appPool.processModel.identityType = "SpecificUser"
$appPool | Set-Item

# Recycle app pool
Restart-WebAppPool -Name "MyAppPool"
```

---

## Configure SSL Certificate

```powershell
# Self-signed certificate for testing
$cert = New-SelfSignedCertificate `
  -DnsName "mysite.local" `
  -CertStoreLocation "cert:\LocalMachine\My" `
  -NotAfter (Get-Date).AddYears(2)

# Bind certificate to HTTPS site
$binding = Get-WebBinding -Name "MyWebsite" -Protocol "https"
$binding.AddSslCertificate($cert.Thumbprint, "My")

# For production: import certificate from file
$pfx = Import-PfxCertificate `
  -FilePath "C:\Certs\mysite.pfx" `
  -CertStoreLocation "cert:\LocalMachine\My" `
  -Password (ConvertTo-SecureString "PfxPassword" -AsPlainText -Force)
```

---

## Configure Authentication

```powershell
# Enable Windows Authentication
Set-WebConfigurationProperty -Filter "system.webServer/security/authentication/windowsAuthentication" `
  -PSPath "IIS:\Sites\MyWebsite" -Name "enabled" -Value $true

# Disable Anonymous Authentication
Set-WebConfigurationProperty -Filter "system.webServer/security/authentication/anonymousAuthentication" `
  -PSPath "IIS:\Sites\MyWebsite" -Name "enabled" -Value $false
```

---

## Enable PHP (Optional)

Download PHP from [windows.php.net](https://windows.php.net) → Non-Thread Safe x64 .zip

```powershell
Expand-Archive "php-8.2.zip" -DestinationPath "C:\PHP"
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\PHP", "Machine")

# Then in IIS Manager: Handler Mappings → Add Module Mapping
# Request path: *.php, Module: FastCgiModule, Executable: C:\PHP\php-cgi.exe
```

---

## Open Ports for Remote Access

To allow access from other PCs on your network:

```powershell
New-NetFirewallRule -DisplayName "IIS HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "IIS HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

---

## View and Manage IIS Logs

```powershell
# View recent IIS access log
$logPath = "C:\inetpub\logs\LogFiles\W3SVC1"
Get-ChildItem $logPath | Sort-Object LastWriteTime -Descending | Select-Object -First 1 |
  ForEach-Object { Get-Content $_.FullName -Tail 20 }

# Parse logs for 500 errors
Get-Content "$logPath\*.log" | Where-Object {$_ -match " 500 "}
```

---

## Summary

Install via `Enable-WindowsOptionalFeature` or `Install-WindowsFeature`. Create sites with `New-WebSite`. Configure app pools with `New-WebAppPool`. Bind SSL certs to HTTPS bindings. Manage via `inetmgr` GUI or PowerShell `WebAdministration` module.

## Frequently Asked Questions

### IIS vs Apache vs nginx — when to choose IIS?

IIS when: Windows Server, ASP.NET apps, Active Directory integration, Windows Authentication. Apache/nginx when: Linux server, PHP apps, or cross-platform. IIS is deeply integrated with Windows and handles .NET apps natively.

### How do I redirect HTTP to HTTPS in IIS?

```powershell
# Via URL Rewrite module (download from microsoft.com)
# Or via web.config:
# <rule name="HTTPS Redirect">
#   <conditions><add input="{HTTPS}" pattern="^OFF$"/></conditions>
#   <action type="Redirect" url="https://{HTTP_HOST}{REQUEST_URI}"/>
# </rule>
```

### Application pool keeps crashing — how to troubleshoot?

Check: 1) Event Viewer → Windows Logs → Application for error details, 2) IIS logs at `C:\inetpub\logs\`, 3) Failed Request Tracing in IIS Manager, 4) Application pool identity has permissions on the website folder.
