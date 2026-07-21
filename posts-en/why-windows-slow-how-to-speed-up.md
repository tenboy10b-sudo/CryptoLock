---
title: "Why Is Windows 10 and 11 Slow and How to Speed It Up: Complete Guide"
date: "2026-06-18"
publishDate: "2026-10-02"
updated: "2026-06-18"
description: "Reasons why Windows 10 and 11 runs slow and step-by-step fixes. Clean up startup, optimize services, update drivers, fix disk issues and configure power settings for maximum speed."
tags: ["windows", "optimization", "performance", "settings", "speed"]
readTime: 9
translatesUk: "yak-pryskoryt-windows"
---

Windows slows down over time — that's normal. But causes and solutions differ. Here's a systematic approach: from quick wins to deep optimization.

---

## Step 1 — Diagnose the Bottleneck

```powershell
Get-Counter '\Processor(_Total)\% Processor Time',
    '\Memory\Available MBytes',
    '\PhysicalDisk(_Total)\% Disk Time' |
    Select-Object -ExpandProperty CounterSamples |
    Select-Object Path, CookedValue
```

Or Task Manager: `Ctrl+Shift+Esc` → Performance tab

| Metric | Normal | Problem |
|--------|--------|---------|
| CPU | < 70% | > 90% constantly |
| RAM | < 80% | > 90% or pagefile active |
| Disk | < 50% | 100% constantly |

---

## Step 2 — Startup Programs (Biggest Impact)

```
Ctrl+Shift+Esc → Startup tab → disable unnecessary
```

**Safe to disable:** Spotify, Discord, Steam, Skype, Adobe updaters, "helper" apps.

**Don't disable:** Windows Security, audio services, drivers.

---

## Step 3 — Clean Up Disk

```powershell
cleanmgr /sageset:1
cleanmgr /sagerun:1
```

---

## Step 4 — Power Plan

```powershell
# High Performance
powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c
powercfg /list  # see available plans
```

---

## Step 5 — Disable Visual Effects

```
Win+R → sysdm.cpl → Advanced → Performance Settings → "Adjust for best performance"
```

---

## Step 6 — Check Disk Health

```powershell
Get-PhysicalDisk | Select-Object FriendlyName, HealthStatus
chkdsk C: /f /r
```

If disk shows "Caution" — **this is the main cause of slowness**. Replace the drive.

---

## Step 7 — RAM Check

```powershell
$os = Get-CimInstance Win32_OperatingSystem
$used = [math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory)/1MB, 1)
$total = [math]::Round($os.TotalVisibleMemorySize/1MB, 1)
Write-Host "RAM: $used / $total GB"
```

**Less than 8 GB RAM** is the #1 cause of slowness in 2026. Add more RAM.

---

## Step 8 — SSD vs HDD

```powershell
Get-PhysicalDisk | Select-Object FriendlyName, MediaType
```

If Windows is on HDD — upgrading to SSD gives 5–10x speed improvement. A 256 GB SSD costs $25–40.

---

## Quick Checklist (10 minutes)

```
☐ Disable unnecessary startup programs
☐ Run disk cleanup (cleanmgr)
☐ Set High Performance power plan
☐ Check Task Manager for bottleneck
☐ Check disk health (Get-PhysicalDisk)
```

---

## Summary — What Helps Most

| Action | Impact | Time |
|--------|--------|------|
| Clean startup | ⭐⭐⭐ | 5 min |
| SSD instead of HDD | ⭐⭐⭐⭐⭐ | Hardware upgrade |
| More RAM | ⭐⭐⭐⭐ | Hardware upgrade |
| Disk cleanup | ⭐⭐ | 10 min |
| High Performance plan | ⭐⭐ | 1 min |
