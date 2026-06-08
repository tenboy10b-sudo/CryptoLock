---
title: "Windows 10 and 11 Settings: Complete Guide to System Configuration"
date: "2026-06-08"
publishDate: "2026-08-06"
updated: "2026-06-08"
description: "Most important Windows 10 and 11 settings: performance, security, network, privacy, startup programs. Hidden settings and registry tweaks for power users."
tags: ["windows", "settings", "optimization", "performance"]
readTime: 9
translatesUk: "nalashtuvannya-windows-10-11-povnyy-hid"
---

Windows has hundreds of settings scattered across Settings, Control Panel, Registry, and Group Policy. Here are the most important ones in one place.

---

## Performance

### Power Mode

```
Win + I → System → Power → Power mode → Best performance
```

```powershell
# Set High Performance plan
powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c
```

### Disable Visual Effects

```
Win + R → sysdm.cpl → Advanced → Settings (Performance) → Adjust for best performance
```

### Manage Startup Programs

```
Ctrl + Shift + Esc → Startup
```

```powershell
Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location
```

---

## Privacy

### Disable Telemetry

```
Win + I → Privacy & security → Diagnostics & feedback → Required diagnostic data
```

```powershell
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" `
  -Name "AllowTelemetry" -Value 0
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\AdvertisingInfo" `
  -Name "Enabled" -Value 0
```

---

## Network

### Set DNS Servers

```powershell
# Cloudflare DNS (1.1.1.1) — faster and more private
$adapter = Get-NetAdapter | Where-Object {$_.Status -eq "Up"} | Select-Object -First 1
Set-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex `
  -ServerAddresses ("1.1.1.1","1.0.0.1")
```

---

## Security

### Windows Firewall

```powershell
Get-NetFirewallProfile | Select-Object Name, Enabled
Set-NetFirewallProfile -All -Enabled True
```

### BitLocker

```powershell
Get-BitLockerVolume | Select-Object MountPoint, ProtectionStatus, EncryptionPercentage
```

---

## Hidden Settings

### God Mode — All Settings in One Folder

Create a folder with exactly this name:
```
GodMode.{ED7BA470-8E54-465E-825C-99712043E01C}
```

### Fast Startup — Disable if Issues

```
Win + R → powercfg.cpl → Choose what power buttons do → Turn off fast startup
```

```powershell
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power" `
  -Name "HiberbootEnabled" -Value 0
```

---

## Quick Setup Script for New PC

```powershell
# Basic Windows hardening
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -Name "AllowTelemetry" -Value 0
Set-NetFirewallProfile -All -Enabled True
$a = (Get-NetAdapter | Where-Object Status -eq "Up" | Select-Object -First 1).InterfaceIndex
Set-DnsClientServerAddress -InterfaceIndex $a -ServerAddresses ("1.1.1.1","1.0.0.1")
Write-Host "Basic setup complete" -ForegroundColor Green
```

---

## Summary

| Setting | Location | Recommendation |
|---------|----------|----------------|
| Power mode | Win+I → System → Power | High performance |
| Startup programs | Ctrl+Shift+Esc → Startup | Disable unnecessary |
| Telemetry | Win+I → Privacy | Required only |
| DNS | PowerShell | 1.1.1.1 or 8.8.8.8 |
| Firewall | PowerShell | Enabled |
