---
title: "How to Monitor Windows Performance: CPU, RAM, Disk and Network"
date: "2026-05-19"
publishDate: "2026-05-19"
description: "Monitor Windows CPU, RAM, disk and network performance using Task Manager, Resource Monitor, Performance Monitor and PowerShell. Find what's slowing down your PC."
tags: ["windows", "performance", "diagnostics", "powershell", "administration"]
readTime: 5
---

Windows has several built-in tools for performance monitoring. Here's how to use each one and what to look for.

---

## Task Manager — Quick Overview

`Ctrl + Shift + Esc` → **Performance** tab

Shows real-time graphs for CPU, Memory, Disk, and Network. Click any graph to see details.

**What to look for:**
- CPU > 90% constantly → runaway process or malware
- Memory > 85% → need more RAM or close apps
- Disk 100% → HDD bottleneck, SSD check, or malware
- Network spikes at idle → background downloads or malware

---

## Resource Monitor — Detailed View

`Win + R` → `resmon`

More detail than Task Manager:
- **CPU** tab → which process uses which CPU cycles
- **Disk** tab → which files are being read/written
- **Network** tab → which process is making network connections
- **Memory** tab → hard faults (page file usage)

**Tip:** Sort by CPU or Disk I/O to find the bottleneck instantly.

---

## PowerShell Performance Commands

```powershell
# Top 10 processes by CPU
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 Name, CPU, Id

# Top 10 processes by RAM
Get-Process | Sort-Object WorkingSet -Descending |
  Select-Object -First 10 Name, @{n='RAM MB';e={[math]::Round($_.WorkingSet/1MB,1)}}, Id

# Total RAM usage
$os = Get-CimInstance Win32_OperatingSystem
$used = [math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory)/1MB, 1)
$total = [math]::Round($os.TotalVisibleMemorySize/1MB, 1)
Write-Host "RAM: $used GB used of $total GB"

# CPU usage (5-second average)
(Get-CimInstance Win32_Processor).LoadPercentage

# Disk I/O statistics
Get-PhysicalDisk | Select-Object FriendlyName, @{n='Read MB/s';e={$_.TransferRateMbps}}
```

---

## Performance Monitor (perfmon)

`Win + R` → `perfmon`

For advanced monitoring and logging:

1. **Performance Monitor** → click **+** → add counters (Processor, Memory, PhysicalDisk)
2. **Data Collector Sets** → **User Defined** → New → create a log
3. Run the log during slowdowns, then analyze

**Key counters to add:**
- `Processor(_Total)\% Processor Time`
- `Memory\Available MBytes`
- `PhysicalDisk(_Total)\Disk Transfers/sec`
- `Network Interface\Bytes Total/sec`

---

## Check Disk Read/Write Speed

```powershell
# Quick disk speed test using WinSAT
winsat disk -drive c

# Check disk queue length (>2 = disk bottleneck)
Get-Counter '\PhysicalDisk(_Total)\Current Disk Queue Length' -SampleInterval 1 -MaxSamples 5
```

---

## Network Performance

```powershell
# Current network adapter stats
Get-NetAdapterStatistics | Select-Object Name, ReceivedBytes, SentBytes

# Active connections with traffic
netstat -e

# Test network latency
Test-NetConnection -ComputerName "8.8.8.8" -InformationLevel Detailed
```

---

## Reliability Monitor

`Win + S` → search **Reliability Monitor**

Shows a timeline of crashes, errors and warnings. Much easier than Event Viewer for finding what went wrong on a specific date.

---

## Summary

**Quick check:** Task Manager Performance tab. **Find the bottleneck:** Resource Monitor. **Deep logging:** perfmon Data Collector Sets. **Scripted monitoring:** PowerShell Get-Process and Get-Counter. Always check Reliability Monitor first when diagnosing intermittent issues.

## Frequently Asked Questions

### My PC is slow but Task Manager shows low CPU and RAM — what's wrong?

Check the Disk column in Task Manager. 100% disk usage (especially on HDD) is the most common hidden bottleneck. Also check for malware and run `chkdsk /scan`.

### How do I log performance data automatically?

Use perfmon Data Collector Sets — create a new set, add counters, schedule it to run automatically, and save logs to analyze later.

### What's a normal CPU temperature under load?

For most CPUs: under 80°C is fine, 85–90°C is high, above 95°C is critical. Use HWiNFO64 or Core Temp to monitor temperatures alongside performance data.
