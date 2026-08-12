---
title: "CrystalDiskInfo on Windows: Check HDD and SSD Health via SMART"
date: "2026-06-15"
publishDate: "2026-09-05"
updated: "2026-06-15"
description: "How to use CrystalDiskInfo to check hard drive and SSD health via SMART data on Windows. Understand health ratings, temperature, warning signs and what to do when status is Caution or Bad."
tags: ["windows", "crystaldiskinfo", "disk", "diagnostics", "tools", "ssd"]
readTime: 6
translatesUk: "crystaldiskinfo-windows-stan-dysku"
---

CrystalDiskInfo reads SMART data from drives and warns about potential failure before the drive dies. Free, no ads — 5 minutes to know the state of all your drives.

---

## Install

```powershell
winget install CrystalDewWorld.CrystalDiskInfo
```
Or from [crystalmark.info](https://crystalmark.info/en/software/crystaldiskinfo/)

---

## Health Ratings

| Rating | Color | Meaning |
|--------|-------|---------|
| **Good** | 🔵 Blue | Drive is healthy |
| **Caution** | 🟡 Yellow | Warning signs present |
| **Bad** | 🔴 Red | Drive is unreliable — backup immediately |

---

## Critical SMART Attributes

### HDD
| ID | Attribute | Meaning |
|----|-----------|---------|
| **05** | Reallocated Sectors Count | Remapped sectors. >0 = problem |
| **C5** | Current Pending Sector Count | Sectors awaiting check. >0 = alert |
| **C6** | Uncorrectable Sector Count | Unrecoverable errors. >0 = drive failing |

### SSD
| ID | Attribute | Meaning |
|----|-----------|---------|
| **05** | Reallocated Sectors | Bad blocks |
| **E8** | Available Reserved Space | Remaining reserve (0 = fully worn) |

---

## Safe Temperatures

| Drive type | Normal | Dangerous |
|-----------|--------|-----------|
| HDD | 25–45°C | >55°C |
| SSD SATA | 25–50°C | >65°C |
| NVMe M.2 | 35–70°C | >85°C |

---

## Check via PowerShell

```powershell
Get-PhysicalDisk | Select-Object FriendlyName, HealthStatus, OperationalStatus

Get-Disk | Get-StorageReliabilityCounter |
    Select-Object DeviceId, Temperature, Wear, ReadErrorsTotal, WriteErrorsTotal
```

---

## What to Do When Status Changes

### Caution (yellow)
1. Back up important data **now**
2. Monitor weekly
3. Plan drive replacement

### Bad (red)
1. **Immediately** copy all data to another drive
2. Don't turn off PC until backup is done
3. Replace drive

**Emergency backup:**
```powershell
robocopy C:\Users D:\Backup\Users /E /COPYALL /R:3 /W:5 /LOG:backup.log
```

---

## Summary

| Rating | Action |
|--------|--------|
| Good (blue) | Normal — check monthly |
| Caution (yellow) | Backup now, monitor weekly |
| Bad (red) | Emergency backup, replace drive |
| Attribute 05 > 0 | Drive has bad sectors — alert |
| HDD temp > 55°C | Check cooling |
