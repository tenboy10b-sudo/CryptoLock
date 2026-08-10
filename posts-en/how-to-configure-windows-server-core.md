---
title: "How to Manage Windows Server Core Without a GUI"
date: "2026-06-21"
publishDate: "2026-06-21"
description: "Manage Windows Server Core installation without a graphical interface. Configure networking, install roles, manage remotely via PowerShell and RSAT tools."
tags: ["windows", "server-core", "powershell", "administration", "remote"]
readTime: 5
translatesUk: "windows-server-core-osnovy"
---

Server Core is Windows Server without the GUI — smaller attack surface, lower resource usage and reduced patch frequency. Everything is managed via PowerShell or remote tools.

---

## Initial Configuration

```powershell
# Set computer name
Rename-Computer -NewName "FILESERVER01" -Restart

# Set static IP
New-NetIPAddress -InterfaceAlias "Ethernet" `
  -IPAddress "192.168.1.20" -PrefixLength 24 `
  -DefaultGateway "192.168.1.1"

Set-DnsClientServerAddress -InterfaceAlias "Ethernet" `
  -ServerAddresses ("192.168.1.10", "8.8.8.8")

# Join domain
Add-Computer -DomainName "company.local" `
  -Credential (Get-Credential) -Restart

# Set time zone
Set-TimeZone -Id "Eastern Standard Time"
```

---

## Sconfig — Server Configuration Tool

```cmd
sconfig
```

Provides a text-based menu for: rename, domain join, network, Windows Update, remote management, date/time.

---

## Enable Remote Management

```powershell
# Enable WinRM
Enable-PSRemoting -Force

# Configure firewall for Remote Desktop (for emergency access)
Enable-NetFirewallRule -DisplayGroup "Remote Desktop"

# Enable remote registry
Set-Service RemoteRegistry -StartupType Automatic
Start-Service RemoteRegistry
```

---

## Install Roles from Core

```powershell
# List available roles
Get-WindowsFeature | Where-Object {$_.InstallState -eq "Available"} |
  Select-Object Name, DisplayName | Sort-Object Name

# Install DNS role
Install-WindowsFeature DNS -IncludeManagementTools

# Install File Server
Install-WindowsFeature FS-FileServer

# Install IIS (minimal, no GUI tools)
Install-WindowsFeature Web-Server

# Install Hyper-V
Install-WindowsFeature Hyper-V -IncludeManagementTools -Restart
```

---

## Manage Remotely via PowerShell

From a management PC with RSAT installed:

```powershell
# Connect to Server Core
Enter-PSSession -ComputerName "FILESERVER01" -Credential "company\admin"

# Run commands remotely
Invoke-Command -ComputerName "FILESERVER01" -ScriptBlock {
  Get-Service | Where-Object {$_.Status -eq "Running"} | Select-Object Name
}

# Copy files to Server Core
$session = New-PSSession -ComputerName "FILESERVER01"
Copy-Item "C:\Scripts\setup.ps1" -Destination "C:\Scripts\" -ToSession $session
```

---

## Manage via RSAT on Windows 11

Install RSAT on your Windows 11 management PC:

```powershell
# Install all RSAT tools
Get-WindowsCapability -Online | Where-Object {$_.Name -like "Rsat*"} |
  Add-WindowsCapability -Online

# Or specific tools only
Add-WindowsCapability -Online -Name "Rsat.FileServices.Tools~~~~0.0.1.0"
Add-WindowsCapability -Online -Name "Rsat.DNS.Tools~~~~0.0.1.0"
Add-WindowsCapability -Online -Name "Rsat.Hyper-V.Tools~~~~0.0.1.0"
```

Then connect to Server Core using Server Manager, DNS Manager, Hyper-V Manager etc. — they connect to remote servers transparently.

---

## Convert Between Core and Full GUI

```powershell
# Add GUI to Server Core (not recommended for production)
Install-WindowsFeature Server-Gui-Shell, Server-Gui-Mgmt-Infra -Restart

# Remove GUI from Full Server (go back to Core)
Uninstall-WindowsFeature Server-Gui-Shell, Server-Gui-Mgmt-Infra -Restart
```

---

## Summary

Configure with `sconfig` or PowerShell. Enable WinRM for remote management. Install roles with `Install-WindowsFeature`. Manage remotely via `Enter-PSSession` or RSAT tools from a Windows 11 management PC. Server Core is the recommended deployment for most server roles.

## Frequently Asked Questions

### Can I switch from Server Core to Full GUI later?

Yes — `Install-WindowsFeature Server-Gui-Shell`. But going Core → GUI → Core frequently is unsupported. For production, decide at deployment time.

### What roles can't run on Server Core?

Very few — most roles run on Core. Notable exceptions: some desktop apps that require GUI, Internet Explorer-dependent features. All server roles (AD, DNS, DHCP, File Server, Hyper-V, IIS) work on Core.

### How do I troubleshoot Server Core without GUI?

Use PowerShell for most things. For event logs: `Get-WinEvent`. For network: `Test-NetConnection`. For process analysis: `Get-Process`. Connect via RDP for GUI access when needed — install `Remote Desktop Services` role or enable the firewall rule.
