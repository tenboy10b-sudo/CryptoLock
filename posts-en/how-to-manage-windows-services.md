---
title: "How to Manage Windows Services: Start, Stop, Disable and Troubleshoot"
date: "2026-05-12"
publishDate: "2026-05-12"
description: "Start, stop, disable and configure Windows services via Services.msc, PowerShell and SC command. Find which services are safe to disable and fix service errors."
tags: ["windows", "services", "administration", "powershell", "optimization"]
readTime: 5
translatesUk: "powershell-robota-z-sluzhbamy-windows"
---

Windows runs dozens of background services. Knowing how to manage them helps fix errors, improve performance, and secure your system.

---

## Open Services Manager

`Win + R` → `services.msc`

Or search: **Services** in Start menu

---

## Start, Stop and Restart Services

**Via GUI:** Right-click a service → Start / Stop / Restart

**PowerShell:**

```powershell
# Start a service
Start-Service -Name "wuauserv"    # Windows Update
Start-Service -Name "Spooler"     # Print Spooler

# Stop a service
Stop-Service -Name "wuauserv" -Force

# Restart
Restart-Service -Name "wuauserv" -Force

# Check status
Get-Service -Name "wuauserv" | Select-Object Name, Status, StartType
```

**SC command (CMD):**

```cmd
sc start wuauserv
sc stop wuauserv
sc query wuauserv
```

---

## Change Service Startup Type

```powershell
# Automatic — starts with Windows
Set-Service -Name "wuauserv" -StartupType Automatic

# Manual — starts only when needed
Set-Service -Name "Fax" -StartupType Manual

# Disabled — never starts
Set-Service -Name "RemoteRegistry" -StartupType Disabled

# Automatic (Delayed Start) — starts after other services
Set-Service -Name "wuauserv" -StartupType AutomaticDelayedStart
```

---

## View All Services with Status

```powershell
# All services sorted by status
Get-Service | Sort-Object Status -Descending |
  Format-Table Name, DisplayName, Status, StartType

# Only running services
Get-Service | Where-Object {$_.Status -eq "Running"} |
  Select-Object Name, DisplayName

# Only stopped services that should be running
Get-Service | Where-Object {$_.Status -eq "Stopped" -and $_.StartType -eq "Automatic"} |
  Select-Object Name, DisplayName
```

---

## Services Safe to Disable on Home PC

```powershell
$toDisable = @(
  "Fax",              # Fax service
  "RemoteRegistry",   # Remote Registry (security risk)
  "XblGameSave",      # Xbox Game Save
  "XblAuthManager",   # Xbox Live Auth
  "XboxNetApiSvc",    # Xbox Network
  "lfsvc",            # Geolocation
  "MapsBroker",       # Downloaded Maps Manager
  "WbioSrvc"          # Windows Biometric (if not using fingerprint)
)

foreach ($svc in $toDisable) {
  Stop-Service $svc -Force -EA 0
  Set-Service $svc -StartupType Disabled -EA 0
  Write-Host "Disabled: $svc"
}
```

---

## Find Which Process Is Running a Service

```powershell
# Get PID of a service
$svc = Get-WmiObject Win32_Service -Filter "Name='wuauserv'"
$pid = $svc.ProcessId
Get-Process -Id $pid | Select-Object Name, Id, CPU, WorkingSet
```

---

## Fix "Service Failed to Start" Errors

```powershell
# Check Event Log for service errors
Get-WinEvent -FilterHashtable @{LogName='System'; Level=2,1} -MaxEvents 20 |
  Where-Object {$_.Message -like "*service*"} |
  Select-Object TimeCreated, Message | Format-List

# Check service dependencies
(Get-Service -Name "wuauserv").DependentServices
(Get-Service -Name "wuauserv").ServicesDependedOn
```

Common fixes:
- `sfc /scannow` — repairs corrupted service files
- `DISM /Online /Cleanup-Image /RestoreHealth` — fixes Windows image
- Delete service registry key (advanced) — recreates corrupted service entry

---

## Create a Custom Service

```powershell
# Register a script as a Windows service using NSSM (Non-Sucking Service Manager)
winget install NSSM.NSSM

# Then: nssm install "MyService" "C:\path\to\program.exe"
# Or use SC for simple executables:
sc create "MyMonitor" binPath= "C:\Scripts\monitor.exe" start= auto
sc description "MyMonitor" "Custom monitoring service"
sc start "MyMonitor"
```

---

## Summary

`services.msc` for GUI management. `Get-Service` and `Set-Service` for PowerShell. `Start-Service`, `Stop-Service`, `Restart-Service` for control. Safe to disable on home PCs: Fax, RemoteRegistry, Xbox services. Check Event Log for service errors. Use `sfc /scannow` to fix corrupted services.
