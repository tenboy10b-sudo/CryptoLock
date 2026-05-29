---
title: "How to Use Windows Event Viewer to Diagnose Problems"
date: "2026-05-01"
publishDate: "2026-05-01"
description: "Use Windows Event Viewer to diagnose crashes, errors and security events. Filter logs, find critical errors, export events and automate monitoring with PowerShell."
tags: ["windows", "event-viewer", "diagnostics", "powershell", "administration"]
readTime: 5
---

Event Viewer records everything that happens in Windows. It's the first place to look when diagnosing crashes, slow boot, or security incidents.

---

## Open Event Viewer

```
Win + R → eventvwr.msc
```

Or: `Win + X` → **Event Viewer**

---

## Log Structure

```
Windows Logs
├── Application   ← app errors and crashes
├── Security      ← login events, policy changes
├── Setup         ← Windows installation events
├── System        ← driver, hardware, service errors
└── Forwarded Events

Applications and Services Logs
└── Microsoft → Windows → (component-specific logs)
```

**Start here:** System and Application logs contain 90% of useful diagnostic information.

---

## Find Critical Errors Quickly

```powershell
# Last 10 critical and error events from System log
Get-WinEvent -FilterHashtable @{LogName='System'; Level=1,2} -MaxEvents 10 |
  Select-Object TimeCreated, Id, ProviderName, Message | Format-List

# Same for Application log
Get-WinEvent -FilterHashtable @{LogName='Application'; Level=1,2} -MaxEvents 10 |
  Select-Object TimeCreated, Id, ProviderName, Message | Format-List

# All errors in last 24 hours
Get-WinEvent -FilterHashtable @{
  LogName='System','Application'
  Level=1,2
  StartTime=(Get-Date).AddHours(-24)
} | Select-Object TimeCreated, LogName, Id, Message | Format-List
```

---

## Key Event IDs to Monitor

```powershell
# System crashes and unexpected shutdowns
Get-WinEvent -FilterHashtable @{LogName='System'; Id=41,6008,1001} -MaxEvents 10

# Failed login attempts
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625} -MaxEvents 20 |
  Select-Object TimeCreated, @{n='Account';e={$_.Properties[5].Value}},
    @{n='IP';e={$_.Properties[19].Value}}

# New service installed (potential malware)
Get-WinEvent -FilterHashtable @{LogName='System'; Id=7045} -MaxEvents 10

# Audit log cleared (attacker covering tracks)
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=1102} -MaxEvents 5
```

---

## Filter Events in GUI

1. Open Event Viewer → select log (e.g. System)
2. Right panel → **Filter Current Log**
3. Set Event level (Critical, Error, Warning)
4. Set time range
5. Enter specific Event IDs (comma-separated)

---

## Search for Specific Events

```powershell
# Find all events related to a specific driver
Get-WinEvent -FilterHashtable @{LogName='System'} |
  Where-Object {$_.Message -like "*nvlddmkm*"}  # NVIDIA driver

# Find events from specific provider
Get-WinEvent -ProviderName "Microsoft-Windows-WindowsUpdateClient" -MaxEvents 10

# Search by keywords across all logs
Get-WinEvent -ListLog * | Where-Object {$_.RecordCount -gt 0} |
  ForEach-Object {
    Get-WinEvent -LogName $_.LogName -MaxEvents 100 -EA 0 |
    Where-Object {$_.Message -like "*YourKeyword*"}
  }
```

---

## Export Events

```powershell
# Export to CSV
Get-WinEvent -FilterHashtable @{LogName='System'; Level=2} -MaxEvents 100 |
  Select-Object TimeCreated, Id, Message |
  Export-Csv "C:\Reports\system-errors.csv" -NoTypeInformation

# Export log file (.evtx) for sharing
wevtutil epl System C:\Backup\System.evtx

# Import and read exported log
Get-WinEvent -Path "C:\Backup\System.evtx" | Select-Object -First 20
```

---

## Clear Old Logs

```powershell
# Clear specific log (requires Admin)
Clear-EventLog -LogName "Application"
wevtutil cl System

# Set max log size to prevent disk fill
wevtutil sl System /ms:52428800  # 50 MB max
```

---

## Summary

Open with `eventvwr.msc`. Start in System and Application logs. Use Level 1 (Critical) and 2 (Error) filter. Key IDs: 41 (crash), 4625 (failed login), 7045 (new service), 1102 (log cleared). Export with `wevtutil epl` for offline analysis.

## Frequently Asked Questions

### Event Viewer shows thousands of errors — is that normal?

Yes. Warnings and informational events are very common. Focus on Level 1 (Critical) and Level 2 (Error) events, and correlate their timestamps with when you noticed the problem.

### How far back does Event Viewer keep logs?

By default System and Application logs keep up to 20 MB of events — typically 1-4 weeks depending on activity. Increase with `wevtutil sl System /ms:104857600` (100 MB).

### Can I monitor events in real time?

Yes — in Event Viewer: right panel → **Attach Task To This Event** to get notified when specific events occur. Or use PowerShell: `Register-WmiEvent` for scripted real-time monitoring.
