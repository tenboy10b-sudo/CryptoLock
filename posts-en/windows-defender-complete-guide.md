---
title: "Windows Defender: Complete Setup and Configuration Guide"
date: "2026-04-28"
publishDate: "2026-04-28"
description: "How to configure Windows Defender properly: enable real-time protection, run scans, add exclusions, use offline scan, and check if Defender is actually working."
tags: ["windows", "security", "windows-defender", "tools"]
readTime: 7
---

Windows Defender (Microsoft Defender Antivirus) is built into Windows 10 and 11 and is genuinely good — independent tests consistently rank it alongside paid antivirus software. But the default settings aren't always optimal. Here's how to configure it properly.

---

## Check If Defender Is Active

First, confirm Defender is actually running:

```powershell
Get-MpComputerStatus | Select-Object AMRunningMode, RealTimeProtectionEnabled, AntivirusEnabled
```

You want to see `RealTimeProtectionEnabled: True`. If it shows `False`, a third-party antivirus has likely disabled it.

---

## Enable Real-Time Protection

`Win + I` → **Privacy & Security** → **Windows Security** → **Virus & threat protection** → **Manage settings** → turn on **Real-time protection**.

Or via PowerShell (run as Administrator):

```powershell
Set-MpPreference -DisableRealtimeMonitoring $false
```

---

## Run a Full Scan

A quick scan checks the most common infection locations. A full scan checks everything.

```powershell
# Quick scan
Start-MpScan -ScanType QuickScan

# Full scan
Start-MpScan -ScanType FullScan

# Custom path scan
Start-MpScan -ScanType CustomScan -ScanPath "C:\Users\YourName\Downloads"
```

Full scan takes 30–90 minutes depending on drive size.

---

## Offline Scan (Most Powerful)

Some malware hides while Windows is running. The offline scan runs before Windows loads — malware can't hide.

`Virus & threat protection` → `Scan options` → **Microsoft Defender Offline scan** → **Scan now**

The PC restarts, scans for ~15 minutes, then boots normally.

---

## Add Exclusions

If Defender is flagging a legitimate file or slowing down a specific folder (like a development directory), add an exclusion:

`Virus & threat protection` → `Manage settings` → scroll to **Exclusions** → **Add or remove exclusions**

Via PowerShell:
```powershell
# Exclude a folder
Add-MpPreference -ExclusionPath "C:\Dev\Projects"

# Exclude a file extension
Add-MpPreference -ExclusionExtension ".log"

# Exclude a process
Add-MpPreference -ExclusionProcess "node.exe"
```

**Don't exclude**: Downloads folder, Desktop, temp folders — these are high-risk locations.

---

## Update Definitions Manually

Defender updates automatically, but you can force an immediate update:

```powershell
Update-MpSignature
```

Or: `Virus & threat protection` → **Protection updates** → **Check for updates**

---

## Enable Cloud Protection and Automatic Sample Submission

These features send suspicious files to Microsoft for analysis — they significantly improve detection rates.

```powershell
Set-MpPreference -MAPSReporting Advanced
Set-MpPreference -SubmitSamplesConsent SendAllSamples
```

---

## Configure Scheduled Scans

By default, Defender runs a quick scan weekly. To change the schedule:

```powershell
# Run a full scan every Sunday at 2 AM
Set-MpPreference -ScanScheduleDay Sunday
Set-MpPreference -ScanScheduleTime 02:00:00
Set-MpPreference -ScanParameters FullScan
```

---

## Check Threat History

See what Defender has detected and quarantined:

```powershell
Get-MpThreatDetection | Select-Object ActionSuccess, DetectionID, DomainUser, ProcessName, Resources
```

Or in the UI: `Virus & threat protection` → **Protection history**

---

## Restore a Quarantined File

If Defender quarantined something you need:

```powershell
# List quarantined threats
Get-MpThreat

# Restore by threat ID
Remove-MpThreat -ThreatID <ID>
```

Or in the UI: **Protection history** → find the item → **Actions** → **Restore**

---

## What Defender Doesn't Cover

- **Browser extensions**: Defender doesn't scan these. Check manually in your browser's extensions page.
- **Password theft via phishing**: Use Microsoft Edge's SmartScreen or a browser extension like uBlock Origin.
- **Already-running rootkits**: Use the Offline Scan for these.

---

## Summary

Enable real-time protection, keep definitions updated, and run an offline scan if you suspect an active infection. For most home and business users, a properly configured Defender is all the antivirus you need.
