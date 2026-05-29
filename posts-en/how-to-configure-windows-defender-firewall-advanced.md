---
title: "How to Use Windows Defender Offline Scan to Remove Hidden Malware"
date: "2026-03-08"
publishDate: "2026-03-08"
description: "Windows Defender Offline Scan runs before Windows loads, catching rootkits and malware that hide from normal scans. How to start it, what it does, and how to read the results."
tags: ["windows", "security", "windows-defender", "tools"]
readTime: 4
---

Some malware hides from antivirus tools by loading itself before Windows — or by hooking into running processes. The only way to detect and remove it is to scan before Windows starts. That's what Windows Defender Offline Scan does.

---

## What It Does Differently

A regular Windows Defender scan runs while Windows is active. Sophisticated malware can:
- Intercept file reads to hide itself
- Disable antivirus processes
- Reload after being "removed"

The Offline Scan boots into a minimal environment outside of Windows, then scans your drive. Malware can't hide or interfere.

---

## When to Use It

- Normal scans detect threats but can't remove them
- PC is behaving strangely but regular scan shows nothing
- You suspect a rootkit
- After visiting a compromised website
- Before selling or repurposing a PC

---

## Start the Offline Scan

**Method 1: Windows Security**

`Win + S` → **Windows Security** → **Virus & threat protection** → **Scan options** → select **Microsoft Defender Antivirus (offline scan)** → **Scan now**

Windows will warn you that the PC will restart. Save and close everything → click **Scan**.

**Method 2: PowerShell**

```powershell
Start-MpWDOScan
```

The PC restarts automatically and begins scanning.

---

## What Happens During the Scan

1. PC restarts into the Windows PE (pre-installation) environment
2. Defender loads with the latest definitions
3. Full system scan runs — takes 10–20 minutes
4. PC restarts back into Windows normally

You'll see a blue progress screen with a percentage counter. Don't interrupt it.

---

## View the Results

After the PC restarts, open **Windows Security** → **Virus & threat protection** → **Protection history**

Look for recent entries from the offline scan. Threats found will show as **Quarantined** or **Removed**.

Via PowerShell:
```powershell
Get-MpThreatDetection |
  Where-Object {$_.ActionSuccess -eq $true} |
  Select-Object DetectionID, ThreatName, ActionSuccess, Resources |
  Sort-Object -Descending
```

---

## Update Definitions Before Scanning

Outdated definitions miss newer threats. Update first:

```powershell
Update-MpSignature
```

Or: **Windows Security** → **Virus & threat protection** → **Protection updates** → **Check for updates**

---

## If Threats Were Found But Not Removed

Some malware resists removal even from offline scan. Next steps:

1. Note the malware name from Protection History
2. Search Microsoft's [Malware Encyclopedia](https://www.microsoft.com/en-us/wdsi/threats) for specific removal instructions
3. Run the scan again — sometimes requires two passes
4. Consider using **Malwarebytes Free** as a second opinion scanner
5. Last resort: reset Windows

---

## Combine With Full Scan

For thorough cleaning, run both:

```powershell
# First, offline scan (requires restart)
Start-MpWDOScan

# After restart, run a full scan
Start-MpScan -ScanType FullScan
```

---


---

## 🛡️ Перевір безпеку свого ПК

Хочеш знати чи немає витоків даних, зайвих служб або підозрілих програм на твоєму ПК?

**[→ AuditShield](/tools/auditshield)** — аудит Windows по 22 напрямках за 10 хвилин. HTML-звіт з оцінкою ризику. Є безкоштовне демо.


## Summary

**Windows Security** → **Scan options** → **Microsoft Defender Antivirus (offline scan)** → **Scan now**. Update definitions first. The scan takes 15–20 minutes and requires a restart. Check **Protection history** for results afterward. Use this when regular scans aren't working or you suspect a rootkit.
