---
title: "How to Manage Windows Services via PowerShell: Start, Stop, Configure"
date: "2026-06-03"
publishDate: "2026-06-03"
description: "Manage Windows services via PowerShell. Start, stop, disable, configure startup type, set recovery options, create custom services and troubleshoot failures."
tags: ["windows", "services", "powershell", "administration", "automation"]
readTime: 5
translatesUk: "powershell-robota-z-sluzhbamy-windows"
---

Windows Services run in the background and control everything from networking to print spooling. PowerShell gives you complete control over all of them.

---

## View Services

```powershell
# All services with status
Get-Service | Sort-Object Status -Descending | Format-Table Name, Status, StartType

# Running services only
Get-Service | Where-Object {$_.Status -eq "Running"} | Select-Object Name, DisplayName

# Stopped services that should be running
Get-Service | Where-Object {$_.Status -eq "Stopped" -and $_.StartType -eq "Automatic"} |
  Select-Object Name, DisplayName

# Detailed info about specific service
Get-Service Spooler | Select-Object *
```

---

## Start, Stop, Restart

```powershell
# Start
Start-Service -Name "Spooler"
Start-Service -DisplayName "Print Spooler"

# Stop
Stop-Service -Name "Spooler" -Force

# Restart
Restart-Service -Name "Spooler" -Force

# Suspend (if supported)
Suspend-Service -Name "ServiceName"

# Resume
Resume-Service -Name "ServiceName"
```

---

## Change Startup Type

```powershell
# Startup types: Automatic, Manual, Disabled, AutomaticDelayedStart

# Set to Auto (start with Windows)
Set-Service -Name "WSearch" -StartupType Automatic

# Set to Manual (start on demand)
Set-Service -Name "WSearch" -StartupType Manual

# Disable (won't start at all)
Set-Service -Name "WSearch" -StartupType Disabled

# AutomaticDelayedStart (start 2-3 min after boot)
Set-Service -Name "ServiceName" -StartupType AutomaticDelayedStart
```

---

## Configure Service Recovery (Auto-Restart on Failure)

```powershell
# Set service to restart on failure via sc.exe
sc.exe failure "Spooler" reset= 86400 actions= restart/5000/restart/10000/restart/30000

# Parameters:
# reset= 86400  = reset failure count after 86400 seconds (1 day)
# actions=       = restart/delay_ms for each failure (1st, 2nd, 3rd)
```

---

## Run Service as Specific Account

```powershell
# Change service account via WMI
$svc = Get-WmiObject Win32_Service -Filter "Name='MyService'"
$svc.Change($null, $null, $null, $null, $null, $null, "Domain\ServiceUser", "Password")

# Or via sc.exe
sc.exe config "MyService" obj= "Domain\ServiceUser" password= "Password"
```

---

## Create a Custom Service

```powershell
# Create a new service from an executable
New-Service -Name "MyMonitor" `
  -BinaryPathName "C:\Tools\monitor.exe" `
  -DisplayName "My Monitoring Service" `
  -Description "Monitors system health" `
  -StartupType Automatic

# Start it
Start-Service -Name "MyMonitor"
```

---

## Find Services by Executable

```powershell
# Which service uses a specific executable
Get-WmiObject Win32_Service | Where-Object {$_.PathName -like "*spoolsv*"} |
  Select-Object Name, PathName, State

# Services running as a specific account
Get-WmiObject Win32_Service | Where-Object {$_.StartName -like "*LocalSystem*"} |
  Select-Object Name, StartName, State
```

---

## Services Safe to Disable on a Home PC

```powershell
$toDisable = @(
  "Fax", "RemoteRegistry", "XblGameSave", "XblAuthManager",
  "XboxNetApiSvc", "lfsvc", "MapsBroker", "WbioSrvc"
)
foreach ($svc in $toDisable) {
  Stop-Service $svc -Force -EA 0
  Set-Service $svc -StartupType Disabled -EA 0
}
```

## Services You Should NOT Disable

| Service | Why it's needed |
|---------|----------------|
| Windows Defender Antivirus | Core security |
| Windows Update | Security patches |
| Windows Firewall | Network security |
| Cryptographic Services | SSL, Windows Update |
| DCOM Server Process Launcher | Core Windows functionality |
| RPC (Remote Procedure Call) | Required by most Windows features |
| Windows Management Instrumentation | Required by many management tools |
| Task Scheduler | Scheduled maintenance tasks |

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

Common fixes: `sfc /scannow` (repairs corrupted service files), `DISM /Online /Cleanup-Image /RestoreHealth` (fixes the Windows image).

---

## Security Audit

```powershell
# Services running as SYSTEM (highest privilege)
Get-WmiObject Win32_Service |
  Where-Object {$_.StartName -eq 'LocalSystem' -and $_.State -eq 'Running'} |
  Select-Object Name, DisplayName, PathName
```

---

## Bulk Operations

```powershell
# Stop all non-essential services (for troubleshooting)
$nonEssential = @("Fax", "WSearch", "DiagTrack", "MapsBroker", "lfsvc")
$nonEssential | ForEach-Object { Stop-Service $_ -Force -EA 0 }

# Restart all stopped Automatic services
Get-Service | Where-Object {$_.StartType -eq "Automatic" -and $_.Status -eq "Stopped"} |
  ForEach-Object {
    Start-Service $_ -EA 0
    Write-Host "Started: $($_.Name)"
  }
```

---

## Delete a Service

```powershell
Stop-Service "MyMonitor" -Force
Remove-Service -Name "MyMonitor"
# Or for older Windows:
sc.exe delete "MyMonitor"
```

---

## Summary

`Get-Service` to view, `Start/Stop/Restart-Service` to control, `Set-Service` for startup type. `sc.exe failure` for recovery settings. `New-Service` to create custom services. Remove-Service to delete.

## Frequently Asked Questions

### A critical service keeps stopping — how do I prevent it?

Configure recovery with `sc.exe failure` to auto-restart. Check Event Log for the error before the crash — usually points to a dependency or configuration issue.

### Can I start a service without Administrator rights?

Only if you've been granted explicit permission via security descriptor. By default, starting/stopping services requires Administrator. Use Task Scheduler with SYSTEM account as a workaround for specific use cases.

### What's the difference between Automatic and AutomaticDelayedStart?

Automatic starts during boot sequence, adding to boot time. AutomaticDelayedStart starts 2-3 minutes after desktop appears — reduces boot time for non-critical services.
