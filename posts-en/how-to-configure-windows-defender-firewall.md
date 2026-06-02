---
title: "How to Use Windows Defender Antivirus from Command Line"
date: "2026-04-13"
publishDate: "2026-04-13"
description: "Run Windows Defender scans, update signatures, manage exclusions, and configure real-time protection entirely from PowerShell and command line — useful for scripts and remote management."
tags: ["windows", "security", "windows-defender", "powershell"]
readTime: 5
---

Windows Defender can be fully controlled from PowerShell — no GUI needed. This is useful for scripting, scheduled scans, remote management via PSRemoting, and automation.

---

## Check Defender Status

```powershell
# Full status overview
Get-MpComputerStatus | Select-Object `
  RealTimeProtectionEnabled,
  AntivirusEnabled,
  BehaviorMonitorEnabled,
  AntivirusSignatureAge,
  AntivirusSignatureVersion,
  AntivirusSignatureLastUpdated,
  FullScanAge,
  QuickScanAge

# One-liner status check
$s = Get-MpComputerStatus
"Defender: $(if($s.RealTimeProtectionEnabled){'ON'}else{'OFF'}) | Signatures: $($s.AntivirusSignatureAge) day(s) old"
```

---

## Update Signatures

```powershell
# Update antivirus definitions
Update-MpSignature

# Force update from specific source
Update-MpSignature -UpdateSource MicrosoftUpdateServer

# Check last update time
(Get-MpComputerStatus).AntivirusSignatureLastUpdated
```

---

## Run Scans

```powershell
# Quick scan (most common threats, takes 5-15 minutes)
Start-MpScan -ScanType QuickScan

# Full scan (entire system, takes 30-120 minutes)
Start-MpScan -ScanType FullScan

# Custom scan (specific path)
Start-MpScan -ScanType CustomScan -ScanPath "C:\Downloads"
Start-MpScan -ScanType CustomScan -ScanPath "D:\SuspiciousFolder"

# Offline scan (restarts PC, scans before Windows loads)
Start-MpWDOScan
```

---

## Manage Real-Time Protection

```powershell
# Disable temporarily (NOT recommended — re-enables on restart)
Set-MpPreference -DisableRealtimeMonitoring $true

# Re-enable
Set-MpPreference -DisableRealtimeMonitoring $false

# Check current setting
(Get-MpPreference).DisableRealtimeMonitoring
```

---

## Manage Exclusions

```powershell
# View all exclusions
Get-MpPreference | Select-Object ExclusionPath, ExclusionExtension, ExclusionProcess

# Add folder exclusion
Add-MpPreference -ExclusionPath "C:\Dev\Projects"
Add-MpPreference -ExclusionPath "D:\VirtualMachines"

# Add file type exclusion
Add-MpPreference -ExclusionExtension ".vmdk"
Add-MpPreference -ExclusionExtension ".log"

# Add process exclusion
Add-MpPreference -ExclusionProcess "node.exe"
Add-MpPreference -ExclusionProcess "python.exe"

# Remove exclusion
Remove-MpPreference -ExclusionPath "C:\Dev\Projects"
```

---

## Check Threat History

```powershell
# All detected threats
Get-MpThreat | Select-Object ThreatName, SeverityID, IsActive, DidThreatExecute,
  @{n='FirstDetected';e={$_.InitialDetectionTime}}

# Active threats only
Get-MpThreat | Where-Object {$_.IsActive -eq $true}

# Recent detections with actions taken
Get-MpThreatDetection | Select-Object ThreatName, ActionSuccess, Resources,
  @{n='Detected';e={$_.InitialDetectionTime}} |
  Sort-Object Detected -Descending | Select-Object -First 10
```

---

## Remove Detected Threats

```powershell
# Remove all active threats
Get-MpThreat | Where-Object {$_.IsActive} |
  ForEach-Object {Remove-MpThreat -ThreatID $_.ThreatID}

# Remove specific threat by name
Get-MpThreat | Where-Object {$_.ThreatName -like "*trojan*"} |
  ForEach-Object {Remove-MpThreat -ThreatID $_.ThreatID}
```

---

## Configure Scan Schedule

```powershell
# Schedule full scan on Sundays at 3 AM
Set-MpPreference `
  -ScanScheduleDay Sunday `
  -ScanScheduleTime 03:00:00 `
  -ScanParameters FullScan

# Quick scan every day at 2 AM
Set-MpPreference -ScanScheduleQuickScanTime 02:00:00

# Check schedule
Get-MpPreference | Select-Object ScanScheduleDay, ScanScheduleTime, ScanParameters, ScanScheduleQuickScanTime
```

---

## Enable Advanced Features via PowerShell

```powershell
# Enable all protection features
Set-MpPreference -DisableRealtimeMonitoring $false
Set-MpPreference -DisableBehaviorMonitoring $false
Set-MpPreference -DisableIOAVProtection $false
Set-MpPreference -DisableScriptScanning $false

# Enable cloud protection (SpyNet)
Set-MpPreference -MAPSReporting Advanced
Set-MpPreference -SubmitSamplesConsent SendAllSamples

# Enable PUA (Potentially Unwanted App) protection
Set-MpPreference -PUAProtection Enabled

# Enable network protection
Set-MpPreference -EnableNetworkProtection Enabled
```

---

## Run Defender from CMD

```cmd
rem Quick scan
"C:\Program Files\Windows Defender\MpCmdRun.exe" -Scan -ScanType 1

rem Full scan
"C:\Program Files\Windows Defender\MpCmdRun.exe" -Scan -ScanType 2

rem Custom scan
"C:\Program Files\Windows Defender\MpCmdRun.exe" -Scan -ScanType 3 -File "C:\Downloads"

rem Update signatures
"C:\Program Files\Windows Defender\MpCmdRun.exe" -SignatureUpdate

rem Remove all threats
"C:\Program Files\Windows Defender\MpCmdRun.exe" -RemoveDefinitions -All
```

---

## Automation Script: Daily Maintenance

```powershell
# Save as C:\Scripts\defender-maintenance.ps1
Update-MpSignature
Start-MpScan -ScanType QuickScan

$threats = Get-MpThreat | Where-Object {$_.IsActive}
if ($threats) {
  $log = "Threats found: $($threats.ThreatName -join ', ')"
  Add-Content "C:\Scripts\defender-log.txt" "$(Get-Date): $log"
} else {
  Add-Content "C:\Scripts\defender-log.txt" "$(Get-Date): Clean"
}
```

---


---



---

## ⚡ Шукаєш потрібну команду?

**[→ PowerShell і CMD довідник](/tools/powershell-commands)** — 40+ команд з пошуком за задачею. Введи "мережа", "диск" або "безпека" і одразу отримай готову команду.


## Summary

`Update-MpSignature` to update, `Start-MpScan -ScanType QuickScan` for quick scan, `Get-MpThreat` to check detections. Use `Add-MpPreference -ExclusionPath` for dev folders. Schedule regular scans with `Set-MpPreference -ScanScheduleDay`. Everything controllable without touching the Windows Security GUI.
