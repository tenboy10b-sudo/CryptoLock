---
title: "Windows 10 and 11 High CPU Usage: Find the Cause and Fix It"
date: "2026-06-18"
publishDate: "2026-10-03"
updated: "2026-06-18"
description: "Why CPU usage is at 100% in Windows 10 and 11 and how to fix it. Find which process is causing high CPU, fix WMI, disable SysMain and telemetry, update drivers."
tags: ["windows", "cpu", "performance", "optimization", "diagnostics"]
readTime: 8
translatesUk: "100-zavantazhennya-cpu-windows-prychyny-vyrishennya"
---

100% CPU usage freezes your PC — browser tabs hang, video lags, apps stop responding. Here's how to find the culprit and fix it.

---

## Step 1 — Find Which Process Uses CPU

```
Ctrl+Shift+Esc → Processes → sort by CPU
```

```powershell
Get-Counter '\Process(*)\% Processor Time' |
    Select-Object -ExpandProperty CounterSamples |
    Where-Object {$_.CookedValue -gt 5} |
    Sort-Object CookedValue -Descending |
    Select-Object InstanceName, @{N='CPU%';E={[math]::Round($_.CookedValue,1)}} |
    Select-Object -First 10
```

---

## Common Culprits and Fixes

### antimalware service executable (MsMpEng.exe) — Windows Defender

```powershell
# Add exclusions for safe folders
Add-MpPreference -ExclusionPath "C:\Program Files"
Add-MpPreference -ExclusionPath "$env:LOCALAPPDATA\Temp"
```

Or change scan schedule to run at night.

### WMI Provider Host (WmiPrvSE.exe)

```powershell
Stop-Service winmgmt -Force
Start-Service winmgmt
```

### System Interrupts > 20%

Caused by bad drivers:
```powershell
Get-WmiObject Win32_PnPEntity |
    Where-Object {$_.ConfigManagerErrorCode -ne 0} |
    Select-Object Name, ConfigManagerErrorCode
```
Update or reinstall the problematic driver (usually network card or audio).

### SysMain (Superfetch)

On HDD systems:
```powershell
Stop-Service SysMain -Force
Set-Service SysMain -StartupType Disabled
```

### SearchIndexer.exe (Windows Search)

```powershell
Restart-Service WSearch
```

### TiWorker.exe (Windows Update)

Wait 30–60 minutes. If it goes on for hours:
```powershell
Stop-Service wuauserv -Force
Remove-Item C:\Windows\SoftwareDistribution\* -Recurse -Force
Start-Service wuauserv
```

---

## System Diagnostics

```powershell
# Check system files
sfc /scannow

# Restore Windows image
DISM /Online /Cleanup-Image /RestoreHealth

# Critical errors in event log
Get-WinEvent -LogName System -EntryType Error -MaxEvents 10 |
    Select-Object TimeCreated, Message | Format-List
```

---

## CPU Temperature

If CPU overheats, throttling keeps it at 100% load. Check with HWiNFO — if CPU > 90°C under load, replace thermal paste.

---

## Summary

| Process | Cause | Fix |
|---------|-------|-----|
| MsMpEng.exe | Defender scanning | Add folder exclusions |
| WmiPrvSE.exe | WMI issue | Restart winmgmt |
| System Interrupts | Bad driver | Update/reinstall driver |
| SysMain | Prefetch on HDD | Stop-Service SysMain |
| SearchIndexer | Indexing | Restart WSearch |
| TiWorker | Windows Update | Wait or clear cache |
