---
title: "How to Fix Slow Boot in Windows 10 and 11"
date: "2026-05-19"
publishDate: "2026-05-19"
description: "Windows taking too long to start? Find out what's slowing your boot with Event Viewer and fix it: startup programs, services, fast startup, and driver issues."
tags: ["windows", "optimization", "performance", "startup"]
readTime: 6
---

A slow boot is almost always caused by one of three things: too many startup programs, a slow or failing drive, or a problematic driver. Here's how to find the culprit and fix it.

---

## Measure Your Boot Time

First, get a baseline:

```powershell
# Last boot time
(Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
```

For detailed boot analysis, open Event Viewer:

`Win + R` → `eventvwr.msc` → **Applications and Services Logs** → **Microsoft** → **Windows** → **Diagnostics-Performance** → **Operational**

Filter for **Event ID 100** — this shows total boot time in milliseconds and lists which processes delayed startup.

---

## Step 1: Disable Startup Programs

The most common cause of slow boot.

`Ctrl + Shift + Esc` → **Startup apps** → sort by **Startup impact** → disable everything with **High** impact that you don't need immediately.

```powershell
# See what's registered to start with Windows
Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location
```

---

## Step 2: Enable Fast Startup

Fast Startup saves the kernel session to disk on shutdown, cutting boot time significantly.

`Control Panel` → `Power Options` → **Choose what the power buttons do** → **Turn on fast startup** (check the box)

Note: Fast Startup can occasionally cause issues with dual-boot setups or when applying BIOS updates. Disable it temporarily if you run into problems.

---

## Step 3: Check Drive Speed

A slow HDD is often the bottleneck. SSDs boot Windows in under 10 seconds; HDDs take 30-60+.

```powershell
winsat disk -drive c
```

If sequential read is below 100 MB/s on an HDD — the drive is degraded. Consider upgrading to SSD.

Also check for bad sectors:
```cmd
chkdsk C: /f /r
```

---

## Step 4: Find Slow Drivers

Problematic drivers delay boot without showing obvious errors.

In Event Viewer (Diagnostics-Performance → Operational), look for **Event ID 101** — these show driver load times. Any driver taking over 1000ms is worth investigating.

```powershell
# List all drivers with load order
Get-WmiObject Win32_SystemDriver | Where-Object {$_.State -eq "Running"} | 
  Select-Object Name, PathName | Sort-Object Name
```

Update or roll back drivers that appear in slow boot events.

---

## Step 5: Delay Non-Essential Services

Some services start at boot but don't need to. Delaying them improves boot time without disabling them.

`Win + R` → `services.msc` → find services you don't need immediately → double-click → change **Startup type** from **Automatic** to **Automatic (Delayed Start)**

Good candidates for delayed start:
- Windows Search (WSearch)
- Print Spooler (if you rarely print)
- Windows Update (wuauserv)
- Bluetooth support (if not using Bluetooth)

```powershell
# Delay a service via PowerShell
Set-Service -Name "WSearch" -StartupType AutomaticDelayedStart
```

---

## Step 6: Check for Malware

Malware often installs itself as a startup item and slows boot considerably.

```powershell
Start-MpScan -ScanType QuickScan
```

Also run a full scan if the quick scan finds nothing but boot is still slow.

---

## Step 7: Rebuild BCD (If Boot Is Very Slow Before Login)

If Windows is slow before the login screen appears, the Boot Configuration Data may be corrupted.

Boot from Windows installation USB → **Repair your computer** → **Troubleshoot** → **Advanced options** → **Command Prompt**:

```cmd
bootrec /fixmbr
bootrec /fixboot
bootrec /rebuildbcd
```

---

## Expected Boot Times

| Storage | Expected boot time |
|---------|-------------------|
| NVMe SSD | 5–10 seconds |
| SATA SSD | 10–20 seconds |
| HDD (7200rpm) | 30–60 seconds |
| HDD (5400rpm) | 45–90 seconds |

If your SSD boots slower than expected — check startup programs and drivers first.

---

## Summary

Check Event Viewer (Event ID 100) to see total boot time and what's slowing it. Fix in order: disable high-impact startup programs → enable Fast Startup → check drive health → delay non-essential services. If nothing helps, upgrade from HDD to SSD — it's the single biggest improvement possible.
