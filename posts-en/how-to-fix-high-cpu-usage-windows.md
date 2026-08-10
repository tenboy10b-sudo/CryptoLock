---
title: "How to Fix High CPU Usage in Windows 10 and 11"
date: "2026-03-10"
publishDate: "2026-03-10"
description: "CPU running at 100% for no reason? Find what's causing high CPU usage in Windows and fix common culprits: Windows Update, antivirus scans, WMI, and background services."
tags: ["windows", "optimization", "performance", "diagnostics"]
readTime: 6
translatesUk: "100-zavantazhennya-cpu-windows-prychyny-vyrishennya"
---

High CPU usage slows everything down — apps lag, the fan spins up, battery drains fast. Here's how to find the cause and fix it.

---

## Identify the Culprit

`Ctrl + Shift + Esc` → **Processes** tab → click **CPU** column to sort by usage

Find the process at the top. The fix depends on which process it is.

```powershell
# Top CPU consumers via PowerShell
Get-Process | Sort-Object CPU -Descending |
  Select-Object -First 10 Name, CPU, Id,
    @{n='RAM(MB)';e={[math]::Round($_.WorkingSet/1MB,0)}}
```

---

## Common Causes and Fixes

### Windows Update (TiWorker.exe, WUDFHost.exe, svchost.exe)

Windows Update downloads and installs updates in the background — CPU usage is normal during this, but should stop within an hour.

**If it runs for hours:**
```powershell
# Restart Update service
Restart-Service wuauserv
Restart-Service UsoSvc
```

Or wait — let the update complete, then restart.

---

### Antivirus Scan (MsMpEng.exe — Windows Defender)

Defender runs scheduled scans in the background.

**Check when it runs and reschedule:**
```powershell
Get-ScheduledTask -TaskPath "\Microsoft\Windows\Windows Defender\" |
  Select-Object TaskName, State
```

Reschedule to off-hours:
```powershell
Set-MpPreference -ScanScheduleDay Saturday
Set-MpPreference -ScanScheduleTime 03:00:00
```

Add exclusions for development folders or large file directories:
```powershell
Add-MpPreference -ExclusionPath "C:\Dev"
```

---

### WMI Provider Host (WmiPrvSE.exe)

WMI is used by many system tools. When it spikes, another process is querying it constantly.

Find which process is using WMI:
```powershell
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-WMI-Activity/Operational'; Id=5858} -MaxEvents 5 |
  Select-Object TimeCreated, Message
```

Usually caused by monitoring software, third-party antivirus, or a misconfigured scheduled task.

---

### System Interrupts

If **System Interrupts** shows high CPU, it's a hardware or driver issue.

```powershell
# Check for driver issues
Get-WinEvent -LogName System -EntryType Error -Newest 10 |
  Where-Object {$_.Source -like "*driver*"} |
  Select-Object TimeCreated, Source, Message
```

Common causes: outdated network or audio driver, failing hardware. Update drivers and check Event Viewer.

---

### Runtime Broker (RuntimeBroker.exe)

Handles permissions for Windows Store apps. Normally uses minimal CPU — spikes indicate a misbehaving app.

```powershell
# Restart Runtime Broker
Stop-Process -Name RuntimeBroker -Force
```

If it keeps spiking: check Settings → Apps → check which apps have permission to run in background.

---

### SearchIndexer.exe (Windows Search)

Search indexing runs in background after updates or when many files change.

**Pause indexing temporarily:**
```powershell
Stop-Service WSearch
```

**Rebuild index if it's stuck:**
`Win + I` → **Privacy & Security** → **Searching Windows** → **Advanced indexing options** → **Advanced** → **Rebuild**

---

### svchost.exe (Service Host)

`svchost.exe` is a container for Windows services — multiple instances are normal. To see which service is inside a specific svchost:

Right-click high-CPU svchost in Task Manager → **Go to details** → right-click → **Analyze wait chain** or **Services** tab to see which services are inside.

```powershell
# List services in a specific svchost PID
$pid = 1234  # replace with actual PID
Get-Process -Id $pid | Select-Object -ExpandProperty Modules |
  Where-Object {$_.ModuleName -like "*.exe"}
```

---

### Malware

Cryptomining malware causes constant high CPU.

Signs: CPU high even when PC is idle, unknown process name, high CPU when browser is closed.

```powershell
# Quick malware scan
Start-MpScan -ScanType QuickScan
```

Run Defender Offline Scan if quick scan finds nothing.

---

## General Fixes

**Reduce startup programs:**
`Ctrl + Shift + Esc` → Startup apps → disable high-impact items

**Set power plan to Balanced (not High Performance):**
High Performance keeps CPU at maximum clock speed even at idle.
```powershell
powercfg /setactive SCHEME_BALANCED
```

**Update Windows and drivers:**
Outdated drivers cause inefficient CPU usage.

---

## If Nothing Helps

```powershell
# Generate detailed performance report
perfmon /report
```

Wait 60 seconds — Windows generates a full system health report. Open it and check the **Software Configuration** and **CPU** sections for anomalies.

**Repair system files (corruption can cause high CPU):**
```powershell
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
```

**Check disk health (a failing disk causes CPU spikes too):**
```powershell
Get-PhysicalDisk | Select-Object FriendlyName, HealthStatus
```

**Check for a driver-related problem:**
```powershell
Get-WmiObject Win32_PnPEntity |
  Where-Object {$_.ConfigManagerErrorCode -ne 0} |
  Select-Object Name, ConfigManagerErrorCode
```

**Check CPU temperature (thermal throttling keeps usage pinned):**
```powershell
winget install REALiX.HWiNFO
```
Normal temps: under 80°C at load. Above 90°C — check cooling or replace thermal paste.

**Disable a batch of background services at once:**
```powershell
$services = @("DiagTrack", "SysMain", "MapsBroker", "lfsvc", "WSearch")
foreach ($s in $services) {
  Stop-Service $s -Force -EA 0
  Set-Service $s -StartupType Manual -EA 0
}
```

---


---

## 🔍 Not sure what a Windows error code means?

If Windows shows a code like `0x80070005`, `0x80070002` or `0xC000021A` — use this free tool:

**[→ Windows Error Decoder](/tools/windows-error-decoder)** — enter the code and instantly find out what it means and how to fix it.


## Summary

Check Task Manager first — identify the exact process. For Windows Update: wait or restart the service. For Defender: reschedule scans. For System Interrupts: update drivers. For unknown processes: run a malware scan. For persistent high CPU with no obvious cause: run `perfmon /report`.

## Frequently Asked Questions

### Is 100% CPU usage always a problem?

No — during updates, virus scans or large file operations, 100% CPU is normal and temporary. It becomes a problem when it's persistent for hours without an obvious cause.

### System Interrupts at high CPU — what does that mean?

System Interrupts represent hardware IRQ processing. High System Interrupts CPU usually means a driver or hardware issue — outdated drivers, failing hardware, or USB device conflicts.

### Will disabling Windows Update fix high CPU permanently?

Only temporarily. Windows Update runs in the background to patch security vulnerabilities. Better to schedule it for off-hours instead of disabling it.
