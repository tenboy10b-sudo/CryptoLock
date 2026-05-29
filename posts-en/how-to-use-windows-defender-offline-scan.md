---
title: "How to Run Windows Defender Offline Scan to Remove Stubborn Malware"
date: "2026-05-25"
publishDate: "2026-05-25"
description: "Run Windows Defender Offline Scan to detect and remove malware that hides from normal scans. Boots outside Windows to catch rootkits and boot-sector viruses."
tags: ["windows", "security", "malware", "windows-defender", "antivirus"]
readTime: 4
---

Windows Defender Offline Scan runs before Windows starts — it catches rootkits, boot-sector malware and threats that hide from normal scans by loading before the OS.

---

## When to Use Offline Scan

- Suspected rootkit or boot-sector infection
- Malware keeps coming back after removal
- Antivirus can't remove a threat because the file is locked
- PC behaves strangely but normal scan finds nothing

---

## Run Offline Scan

**Method 1 — Windows Security:**

`Win + I` → **Privacy & Security** → **Windows Security** → **Virus & threat protection** → **Scan options** → **Microsoft Defender Antivirus (offline scan)** → **Scan now**

Windows will restart immediately. The scan takes 15-20 minutes. PC boots back to Windows when done.

**Method 2 — PowerShell (requires restart):**

```powershell
# Schedule offline scan for next boot
Start-MpWDOScan
```

**Method 3 — CMD (Admin):**

```cmd
MpCmdRun.exe -BootSectorScan
```

---

## What Happens During Offline Scan

1. Windows saves current state
2. PC restarts into Windows PE (minimal environment)
3. Defender scans all drives before the OS loads
4. Results are saved to: `C:\Windows\Temp\MpCmdRun.log`
5. PC restarts back to normal Windows

---

## Check Scan Results

```powershell
# View protection history
Get-MpThreatDetection | Select-Object ThreatName, ActionSuccess, InitialDetectionTime |
  Sort-Object InitialDetectionTime -Descending | Select-Object -First 10

# View scan logs
Get-Content "C:\Windows\Temp\MpCmdRun.log" | Select-Object -Last 50

# Full threat history
Get-MpThreat | Select-Object ThreatName, SeverityID, IsActive
```

---

## After the Offline Scan

```powershell
# Verify Defender is up to date
Update-MpSignature

# Check real-time protection is on
(Get-MpComputerStatus).RealTimeProtectionEnabled

# Run a full scan after offline scan to confirm clean
Start-MpScan -ScanType FullScan
```

---

## Full Security Check Sequence

```powershell
# 1. Update signatures
Update-MpSignature

# 2. Quick scan first
Start-MpScan -ScanType QuickScan

# 3. If threats found or suspected — offline scan
Start-MpWDOScan
# (PC will restart)

# 4. After restart — full scan to confirm
Start-MpScan -ScanType FullScan

# 5. View results
Get-MpThreatDetection | Select-Object ThreatName, ActionSuccess
```

---

## Summary

Offline scan runs before Windows loads — use it when normal scans miss persistent malware. Trigger via Windows Security or `Start-MpWDOScan` in PowerShell. Results in `C:\Windows\Temp\MpCmdRun.log`. Run a full scan after to confirm the system is clean.

## Frequently Asked Questions

### How is offline scan different from a full scan?

Full scan runs inside Windows — sophisticated malware can hide from it. Offline scan boots a clean environment before Windows loads, so malware has nowhere to hide.

### Will offline scan delete my files?

No. It only removes detected malware. Personal files, documents and applications are not affected.

### My PC has no threats but is still acting strangely — what else can I try?

After a clean offline scan: run `sfc /scannow` and `DISM /RestoreHealth` to check for corrupted system files. Also check startup programs, recently installed software, and browser extensions.
