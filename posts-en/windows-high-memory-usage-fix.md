---
title: "Windows 10 and 11 High Memory Usage: Why RAM Is Full and How to Free It"
date: "2026-06-18"
publishDate: "2027-06-01"
updated: "2026-06-18"
description: "Why Windows uses all your RAM and how to fix it. Find which process uses memory, disable unnecessary services, configure pagefile and speed up your PC."
tags: ["windows", "ram", "memory", "performance", "optimization", "diagnostics"]
readTime: 7
translatesUk: "100-vykorystannya-ram-windows-zvilvyty-pamiat"
---

Windows using all available RAM is normal — the OS caches data for faster access. The problem is when there's no RAM left and Windows starts using the pagefile — everything slows dramatically.

---

## How Much RAM Do You Need in 2026

| Use case | Minimum | Recommended |
|---------|---------|-------------|
| Basic (browser, office) | 4 GB | 8 GB |
| Work + multiple apps | 8 GB | 16 GB |
| Gaming | 8 GB | 16 GB |
| Development, video editing | 16 GB | 32 GB |

---

## Step 1 — Check RAM Usage

```powershell
$os = Get-CimInstance Win32_OperatingSystem
$used = [math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory)/1MB, 1)
$total = [math]::Round($os.TotalVisibleMemorySize/1MB, 1)
Write-Host "RAM: $used GB / $total GB ($([math]::Round($used/$total*100))%)"
```

---

## Step 2 — Find Memory-Hungry Processes

```powershell
Get-Process | Sort-Object WorkingSet64 -Descending |
    Select-Object Name, @{N='RAM_MB';E={[math]::Round($_.WorkingSet64/1MB,0)}} |
    Select-Object -First 10 | Format-Table
```

---

## Fix Chrome Memory Usage

In Chrome: `chrome://settings` → System → Memory Saver → Enable

**OneTab extension** — collapses all tabs into a list, frees 80% of Chrome's memory.

Disable unused extensions: `chrome://extensions`

---

## Disable Memory-Hungry Services

```powershell
# SysMain — caches apps, can waste RAM on older systems
Stop-Service SysMain -Force
Set-Service SysMain -StartupType Disabled

# Telemetry
Stop-Service DiagTrack -Force
Set-Service DiagTrack -StartupType Disabled
```

---

## Configure Pagefile

```
Win+R → sysdm.cpl → Advanced → Performance Settings →
Advanced → Change (pagefile)
```

Disable "Automatically manage" → set Custom size:
- Initial: RAM × 1.5 (e.g., 8 GB → 12288 MB)
- Maximum: RAM × 2 (16384 MB)

**Important:** pagefile on SSD is vastly faster than on HDD.

---

## Understanding Task Manager Memory

| Status | Meaning |
|--------|---------|
| **In Use** | Actively used |
| **Standby** | Cache — freed when needed |
| **Available** | Truly free |

Real problem: when **Available** is near 0 and system uses pagefile.

---

## Summary

| Cause | Fix |
|-------|-----|
| Chrome eating RAM | Memory Saver + OneTab |
| Too many tabs | Close or use OneTab |
| SysMain | Stop-Service SysMain |
| Not enough physical RAM | Add more (8–16 GB) |
| Pagefile on HDD | Move pagefile to SSD |
| Startup programs | Disable in Task Manager |
