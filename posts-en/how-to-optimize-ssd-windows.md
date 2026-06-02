---
title: "How to Optimize SSD Performance in Windows 10 and 11"
date: "2026-05-11"
publishDate: "2026-05-11"
description: "Optimize SSD performance in Windows 10 and 11. Enable TRIM, disable defragmentation, configure page file, check health and get maximum speed from your SSD."
tags: ["windows", "ssd", "performance", "optimization", "disk"]
readTime: 5
---

SSDs perform best when Windows is properly configured for them. Several default settings designed for HDDs can hurt SSD performance and longevity.

---

## Check Your Drive Type

```powershell
# Confirm you have an SSD
Get-PhysicalDisk | Select-Object FriendlyName, MediaType, HealthStatus

# Check if Windows recognizes it as SSD
$disk = Get-PhysicalDisk | Where-Object {$_.MediaType -eq "SSD"}
Write-Host "SSD detected: $($disk.FriendlyName)"
```

---

## Verify TRIM is Enabled

TRIM prevents performance degradation over time by telling the SSD to clean up deleted blocks:

```powershell
# 0 = TRIM enabled (correct for SSD)
# 1 = TRIM disabled (fix this)
fsutil behavior query DisableDeleteNotify

# Enable TRIM if disabled
fsutil behavior set DisableDeleteNotify 0
```

---

## Disable Defragmentation for SSD

Windows automatically disables traditional defragmentation for SSDs, but verify:

```powershell
# Check defrag schedule
Get-ScheduledTask -TaskName "ScheduledDefrag" |
  Select-Object TaskName, State, Triggers

# Disable scheduled defrag for SSD volumes
$defragTask = Get-ScheduledTask -TaskName "ScheduledDefrag"
# Check in Defragment and Optimize Drives app that SSD shows "Retrim" not "Defragment"
```

`Win + S` → **Defragment and Optimize Drives** → verify SSD shows **Retrim** (not Analyze/Defragment)

---

## Disable Prefetch and Superfetch on SSD

These services preload data into RAM — useful on HDDs, counterproductive on SSDs:

```powershell
# Disable SysMain (Superfetch)
Stop-Service SysMain -Force
Set-Service SysMain -StartupType Disabled

# Disable Prefetch via registry
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management\PrefetchParameters" `
  -Name "EnablePrefetcher" -Value 0 -Type DWord
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management\PrefetchParameters" `
  -Name "EnableSuperfetch" -Value 0 -Type DWord
```

---

## Configure Page File

```powershell
# View current page file settings
Get-WmiObject Win32_PageFileSetting | Select-Object Name, InitialSize, MaximumSize

# System-managed page file (recommended)
$cs = Get-WmiObject Win32_ComputerSystem
$cs.AutomaticManagedPagefile = $true
$cs.Put()
```

For SSDs: system-managed page file is fine. Writing to SSD is fast enough that page file isn't a performance concern — but don't disable it completely.

---

## Check SSD Health and Wear

```powershell
# Basic health check
Get-PhysicalDisk | Select-Object FriendlyName, HealthStatus, OperationalStatus

# Detailed wear and temperature
Get-StorageReliabilityCounter -PhysicalDisk (Get-PhysicalDisk | Where-Object {$_.MediaType -eq "SSD"}) |
  Select-Object Temperature, Wear, PowerOnHours, ReadErrorsUncorrected

# Install CrystalDiskInfo for full SMART data
winget install CrystalDewWorld.CrystalDiskInfo
```

---

## Enable Write Caching

```powershell
# Enable disk write caching for better performance
$disk = Get-WmiObject -Class Win32_DiskDrive | Select-Object -First 1
# Device Manager → Disk Drives → Properties → Policies → Better performance
```

`Device Manager` → **Disk drives** → right-click SSD → **Properties** → **Policies** → **Better performance** → OK

---

## Keep SSD at Least 10-15% Free

```powershell
# Check free space
Get-PSDrive C | Select-Object @{n='Free GB';e={[math]::Round($_.Free/1GB,1)}},
  @{n='Used GB';e={[math]::Round($_.Used/1GB,1)}},
  @{n='Free %';e={[math]::Round($_.Free/($_.Free+$_.Used)*100,0)}}
```

SSDs slow down significantly when over 85% full — maintain at least 10-15% free space.

---

## Summary

Verify TRIM enabled with `fsutil`. Disable SysMain on SSD. Keep defrag as Retrim (not Defragment). Enable write caching in Device Manager. Monitor health with `Get-StorageReliabilityCounter`. Keep 10-15% free space.

## Frequently Asked Questions

### Should I disable the page file on SSD to reduce writes?

No. Disabling the page file can cause system crashes. The write load from a page file is minimal — modern SSDs last decades even with heavy page file use.

### How many years does an SSD last?

Most consumer SSDs are rated for 100-300 TBW (terabytes written). At 50 GB written per day, that's 5-16 years. Check `Wear` in `Get-StorageReliabilityCounter` — below 10% wear remaining means plan for replacement.

### NVMe vs SATA SSD — which needs different optimization?

Same Windows settings apply. NVMe is significantly faster but both benefit equally from TRIM, SysMain disable and proper space management.
