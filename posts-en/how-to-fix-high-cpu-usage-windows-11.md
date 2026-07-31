---
title: "How to Fix High CPU Usage in Windows 10 and 11 (2026)"
date: "2027-02-01"
publishDate: "2027-02-01"
description: "Fix 100% CPU usage in Windows 10 and 11. Find what process is consuming CPU, stop runaway processes, fix Windows Update, antivirus and WMI provider host issues."
tags: ["windows", "cpu", "performance", "troubleshooting", "powershell"]
readTime: 5
translatesUk: "100-zavantazhennya-cpu-windows-prychyny-vyrishennya"
---

100% CPU usage makes Windows sluggish and unresponsive. Here's how to identify the cause and fix it permanently.

---

## Identify the Culprit

```powershell
# Top 10 processes by CPU — live
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 Name, CPU, Id, @{n='RAM MB';e={[math]::Round($_.WorkingSet/1MB,1)}}

# Watch CPU usage every 2 seconds
while ($true) {
  Get-Process | Sort-Object CPU -Descending | Select-Object -First 5 Name, CPU
  Start-Sleep 2
  Clear-Host
}
```

Or: `Ctrl + Shift + Esc` → **CPU** column → sort descending → identify the top process.

---

## Common Culprits and Fixes

### WmiPrvSE.exe (WMI Provider Host)

```powershell
# Find what's triggering WMI
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-WMI-Activity/Operational'; Level=3} -MaxEvents 10 |
  Select-Object TimeCreated, Message

# Restart WMI service
Restart-Service Winmgmt -Force
```

### Windows Update (TiWorker.exe / wuauserv)

```powershell
# Check if update is in progress
Get-Process TiWorker -EA 0
Get-Service wuauserv | Select-Object Status

# Let it finish — or pause updates temporarily
Stop-Service wuauserv -Force
Set-Service wuauserv -StartupType Manual
# Re-enable after: Set-Service wuauserv -StartupType Automatic
```

### Antivirus scan (MsMpEng.exe)

```powershell
# Check Defender scan status
Get-MpComputerStatus | Select-Object AntivirusEnabled, QuickScanAge, FullScanAge

# Schedule scans during off-hours instead
Set-MpPreference -ScanScheduleTime 02:00
Set-MpPreference -ScanScheduleDay 0  # 0 = every day
```

### SearchIndexer.exe

```powershell
# Rebuild index to fix persistent high CPU
Stop-Service WSearch -Force
Remove-Item "C:\ProgramData\Microsoft\Search\Data\Applications\Windows\*" -Recurse -Force -EA 0
Start-Service WSearch
```

### Runtime Broker / System Interrupts

```powershell
# Disable background apps (reduces Runtime Broker load)
Get-AppxPackage | ForEach-Object {
  Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\BackgroundAccessApplications\$($_.PackageFamilyName)" `
    -Name "Disabled" -Value 1 -Type DWord -EA 0
}
```

---

## General Fixes

```powershell
# 1. Repair system files (corrupted files cause high CPU)
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow

# 2. Check disk health (failing disk causes CPU spikes)
Get-PhysicalDisk | Select-Object FriendlyName, HealthStatus

# 3. Scan for malware
Start-MpScan -ScanType QuickScan

# 4. Disable SysMain on SSD
Stop-Service SysMain -Force
Set-Service SysMain -StartupType Disabled

# 5. Check for high-priority tasks
Get-ScheduledTask | Where-Object {$_.State -eq "Running"} | Select-Object TaskName
```

---

## Check CPU Temperature

Throttling due to overheating causes persistent high CPU load percentages:

```powershell
winget install REALiX.HWiNFO
```

Normal temps: under 80°C at load. Above 90°C = thermal throttling.

---

## Disable Unnecessary Services

```powershell
$services = @("DiagTrack", "SysMain", "MapsBroker", "lfsvc", "WSearch")
foreach ($s in $services) {
  Stop-Service $s -Force -EA 0
  Set-Service $s -StartupType Manual -EA 0
}
```

---

## Summary

Identify with Task Manager or `Get-Process`. Common causes: WMI Provider Host, Windows Update, SearchIndexer, antivirus. Run DISM + SFC for corruption. Check temperatures for throttling. Disable SysMain on SSD. Scan for malware if CPU spikes at idle.

## Frequently Asked Questions

### Is 100% CPU usage always a problem?

No — during updates, virus scans or large file operations, 100% CPU is normal and temporary. It becomes a problem when it's persistent for hours without obvious cause.

### System Interrupts at high CPU — what does that mean?

System Interrupts represent hardware IRQ processing. High System Interrupts CPU usually means a driver or hardware issue — outdated drivers, failing hardware, or USB device conflicts.

### Will disabling Windows Update fix high CPU permanently?

Only temporarily. Windows Update runs in the background to patch security vulnerabilities. Better to schedule it for off-hours with `Set-MpPreference -ScanScheduleTime 03:00`.
