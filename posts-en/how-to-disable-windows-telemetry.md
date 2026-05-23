---
title: "How to Disable Windows Telemetry and DiagTrack in Windows 10 and 11"
date: "2024-04-01"
publishDate: "2024-04-01"
updated: "2026-05-23"
description: "Step-by-step guide to disabling Windows telemetry, DiagTrack service, and Connected User Experiences. Registry, Group Policy, PowerShell, and hosts file methods."
tags: ["windows", "privacy", "settings", "administration"]
readTime: 6
---

Windows sends diagnostic data (telemetry) to Microsoft by default. The DiagTrack service (Connected User Experiences and Telemetry) handles this collection. Here's how to minimize or disable it completely.

---

## What Is Windows Telemetry

Telemetry collects:
- Crash reports and error logs
- App usage statistics
- Device configuration data
- Browser activity (if using Edge)

The **DiagTrack** service (`Connected User Experiences and Telemetry`) is the main component. Windows calls it "diagnostic data" — it runs automatically and sends data to Microsoft servers like `vortex.data.microsoft.com`.

---

## Method 1: Settings UI (Simplest)

`Win + I` → **Privacy & Security** → **Diagnostics & feedback**

- **Diagnostic data**: switch from **Full** to **Required only** (minimum allowed on Home)
- **Improve inking & typing**: Off
- **Tailored experiences**: Off
- **View diagnostic data**: Off

---

## Method 2: Disable DiagTrack Service

```powershell
# Stop and disable the telemetry service
Stop-Service DiagTrack -Force
Set-Service DiagTrack -StartupType Disabled

# Verify
Get-Service DiagTrack | Select-Object Name, Status, StartType
```

---

## Method 3: Group Policy (Pro/Enterprise)

`gpedit.msc` → **Computer Configuration** → **Administrative Templates** → **Windows Components** → **Data Collection and Preview Builds**

- **Allow Diagnostic Data** → Enabled → set to **0 - Security** (Enterprise only) or **1 - Required**
- **Do not show feedback notifications** → Enabled

```powershell
# Apply via registry (works on Home too)
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection"
New-Item -Path $path -Force | Out-Null
Set-ItemProperty -Path $path -Name "AllowTelemetry" -Value 0 -Type DWord
```

---

## Method 4: Registry (All Editions)

```powershell
# Minimum telemetry level
Set-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -Name "AllowTelemetry" -Value 1 -Type DWord -Force

# Disable CEIP
New-Item "HKLM:\SOFTWARE\Policies\Microsoft\SQMClient\Windows" -Force | Out-Null
Set-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\SQMClient\Windows" -Name "CEIPEnable" -Value 0 -Type DWord

# Disable feedback
Set-ItemProperty "HKCU:\Software\Microsoft\Siuf\Rules" -Name "NumberOfSIUFInPeriod" -Value 0 -Type DWord -Force

# Disable Delivery Optimization (sharing updates with other PCs)
Set-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DeliveryOptimization" -Name "DODownloadMode" -Value 0 -Type DWord -Force

# Disable advertising ID
Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\AdvertisingInfo" -Name "Enabled" -Value 0 -Type DWord
```

---

## Method 5: Block Telemetry Domains via Hosts File

Add these to `C:\Windows\System32\drivers\etc\hosts` as Administrator:

```
0.0.0.0 vortex.data.microsoft.com
0.0.0.0 vortex-win.data.microsoft.com
0.0.0.0 telecommand.telemetry.microsoft.com
0.0.0.0 settings-win.data.microsoft.com
0.0.0.0 watson.telemetry.microsoft.com
0.0.0.0 sqm.telemetry.microsoft.com
0.0.0.0 v10.events.data.microsoft.com
0.0.0.0 v20.events.data.microsoft.com
```

```powershell
# Flush DNS after editing hosts
Clear-DnsClientCache
ipconfig /flushdns
```

---

## Disable Connected User Experiences Completely

```powershell
# Full script — run as Administrator
Write-Host "Disabling telemetry..." -ForegroundColor Cyan

# Stop and disable DiagTrack
Stop-Service DiagTrack -Force -EA 0
Set-Service DiagTrack -StartupType Disabled

# Disable dmwappushservice
Stop-Service dmwappushservice -Force -EA 0
Set-Service dmwappushservice -StartupType Disabled

# Registry settings
$policies = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection"
New-Item $policies -Force | Out-Null
Set-ItemProperty $policies "AllowTelemetry" 1 -Type DWord
Set-ItemProperty $policies "DisableEnterpriseAuthProxy" 1 -Type DWord

# Disable advertising
Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\AdvertisingInfo" "Enabled" 0 -Type DWord

# Disable activity tracking
Set-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System" "PublishUserActivities" 0 -Type DWord
Set-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System" "UploadUserActivities" 0 -Type DWord

Write-Host "Done. Restart for all changes to take effect." -ForegroundColor Green
```

---

## Verify Telemetry is Reduced

```powershell
# Check DiagTrack service status
Get-Service DiagTrack | Select-Object Status, StartType

# Check current telemetry level
(Get-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -EA 0).AllowTelemetry

# Check active connections to Microsoft telemetry servers
Get-NetTCPConnection -State Established |
  Where-Object {(Resolve-DnsName $_.RemoteAddress -EA 0).NameHost -like "*microsoft*"} |
  Select-Object RemoteAddress, @{n='Process';e={(Get-Process -Id $_.OwningProcess -EA 0).Name}}
```

---

## What You Can't Fully Disable on Home

Windows 10/11 Home always sends some telemetry regardless of settings — level 1 (Required) is the minimum. Full disable (level 0) is only available on Enterprise and Education editions.

For maximum control: Windows LTSC (Long Term Servicing Channel) removes most telemetry components entirely.

---

## Summary

Quickest method: disable DiagTrack service (`Stop-Service DiagTrack -Force; Set-Service DiagTrack -StartupType Disabled`) + set telemetry policy to 1 via registry. Add hosts file entries to block telemetry domains. On Windows Home, level 0 isn't available — level 1 (Required) is the minimum you can set.
