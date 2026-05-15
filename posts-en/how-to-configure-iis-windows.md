---
title: "How to Enable and Configure IIS Web Server on Windows"
date: "2026-11-15"
publishDate: "2026-11-15"
description: "Enable IIS (Internet Information Services) on Windows 10 and 11 to host websites and web applications locally or on a home server. Setup, virtual hosts, and SSL configuration."
tags: ["windows", "administration", "network", "tools"]
readTime: 6
---

IIS (Internet Information Services) is Microsoft's built-in web server — included free in Windows 10/11 Pro and Enterprise. It's useful for local development, testing websites, or running a home server.

---

## Enable IIS

**Via Windows Features:**
`Win + R` → `optionalfeatures` → expand **Internet Information Services** → check:
- Web Management Tools → IIS Management Console
- World Wide Web Services → Common HTTP Features → Static Content, Default Document
- Application Development Features → if you need ASP.NET or PHP

Click OK → Windows installs IIS (no restart needed).

**Via PowerShell:**
```powershell
# Enable IIS with common features
Enable-WindowsOptionalFeature -Online -FeatureName `
  IIS-WebServerRole,
  IIS-WebServer,
  IIS-CommonHttpFeatures,
  IIS-StaticContent,
  IIS-DefaultDocument,
  IIS-DirectoryBrowsing,
  IIS-HttpErrors,
  IIS-ManagementConsole `
  -All
```

---

## Open IIS Manager

`Win + S` → **Internet Information Services (IIS) Manager**

Or: `Win + R` → `inetmgr`

---

## Test Default Website

After enabling IIS, open a browser and go to `http://localhost`

You should see the IIS welcome page. Your website files go in `C:\inetpub\wwwroot\`.

---

## Add a New Website

In IIS Manager → **Sites** → **Default Web Site** → right-click → **Remove** (optional, to start fresh)

Right-click **Sites** → **Add Website**:
- **Site name**: MyWebsite
- **Physical path**: `C:\Websites\mysite` (create this folder first)
- **Binding**: HTTP, All Unassigned, Port 80
- Click OK

```powershell
# Create website via PowerShell (requires WebAdministration module)
Import-Module WebAdministration

New-Item "C:\Websites\mysite" -ItemType Directory
New-Website -Name "MyWebsite" -Port 80 -PhysicalPath "C:\Websites\mysite"
Start-Website -Name "MyWebsite"
```

---

## Set Up Multiple Sites on Different Ports

Each site needs a unique port:

```powershell
# Site 1 on port 8080
New-Website -Name "DevSite1" -Port 8080 -PhysicalPath "C:\Dev\site1"

# Site 2 on port 8081
New-Website -Name "DevSite2" -Port 8081 -PhysicalPath "C:\Dev\site2"

# List all sites
Get-Website | Select-Object Name, State, PhysicalPath, Bindings
```

Access at `http://localhost:8080` and `http://localhost:8081`.

---

## Host-Header Based Sites (Multiple Domains, Port 80)

Map different domain names to different sites on the same IP and port:

Add to `C:\Windows\System32\drivers\etc\hosts`:
```
127.0.0.1    site1.local
127.0.0.1    site2.local
```

Then in IIS Manager → Site → **Bindings** → Add:
- Type: HTTP, Port: 80, Host name: `site1.local`

```powershell
New-WebBinding -Name "DevSite1" -IPAddress "*" -Port 80 -HostHeader "site1.local"
```

Access at `http://site1.local`.

---

## Enable PHP (Optional)

Download PHP from [windows.php.net](https://windows.php.net) → Non-Thread Safe x64 .zip

```powershell
# Extract PHP to C:\PHP
Expand-Archive "php-8.2.zip" -DestinationPath "C:\PHP"

# Add C:\PHP to system PATH
$env:Path += ";C:\PHP"
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\PHP", "Machine")

# Add PHP handler to IIS (in IIS Manager)
# Handler Mappings → Add Module Mapping
# Request path: *.php, Module: FastCgiModule, Executable: C:\PHP\php-cgi.exe
```

---

## Configure Logging

```powershell
# View access logs
Get-Item "C:\inetpub\logs\LogFiles\W3SVC1\*.log" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1 |
  Get-Content | Select-Object -Last 20
```

---

## Common IIS Commands

```powershell
Import-Module WebAdministration

# List sites and their status
Get-Website

# Start/stop site
Start-Website -Name "MyWebsite"
Stop-Website -Name "MyWebsite"

# Restart app pool
Restart-WebAppPool -Name "DefaultAppPool"

# List app pools
Get-WebConfiguration system.applicationHost/applicationPools/add |
  Select-Object name, state

# Check site bindings
Get-WebBinding -Name "MyWebsite"
```

---

## Open Port in Firewall for Remote Access

To allow access from other PCs on your network:

```powershell
New-NetFirewallRule -DisplayName "IIS HTTP" `
  -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow

New-NetFirewallRule -DisplayName "IIS HTTPS" `
  -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

---

## Summary

Enable via `optionalfeatures` → IIS. Test at `http://localhost`. Put website files in `C:\inetpub\wwwroot\` or create a new site pointing to any folder. Use host headers for multiple local domains. For development: IIS is great for testing ASP.NET apps; for PHP or Node, consider IIS Express or just running the dev server directly.
