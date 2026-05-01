---
title: "How to Speed Up Windows 10 and 11: 15 Proven Methods"
date: "2026-04-18"
publishDate: "2026-04-18"
description: "Speed up Windows 10 and 11 with 15 proven methods: disable startup programs, clean temp files, optimize visual settings, and get faster boot without reinstalling."
tags: ["windows", "optimization", "performance", "tools"]
readTime: 7
translatesUk: "yak-pryskoryt-windows"
---

A slow Windows PC is fixable without reinstalling. These 15 methods go from quick wins to deeper optimizations.

---

## 1. Disable Startup Programs

`Ctrl + Shift + Esc` → **Startup** → right-click anything with **High** impact → **Disable**.

Keep: antivirus, audio drivers. Disable: Spotify, Discord, Steam, launchers.

---

## 2. Clean Temp Files

`Win + R` → `%temp%` → `Ctrl+A` → `Delete`

Then: **Disk Cleanup** → drive C → **Clean up system files** → check all → OK.

---

## 3. Set High Performance Power Plan

```powershell
powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c
```

---

## 4. Disable Visual Effects

`Win + R` → `sysdm.cpl` → **Advanced** → **Performance Settings** → **Adjust for best performance** → OK.

---

## 5. Scan for Malware

```powershell
Start-MpScan -ScanType FullScan
```

---

## 6. Enable Fast Startup

`Control Panel` → `Power Options` → **Choose what the power buttons do** → check **Turn on fast startup**.

---

## 7. Upgrade to SSD

Biggest single upgrade. Boot time drops from 60s to under 10s. After installing:
```powershell
fsutil behavior set DisableDeleteNotify 0  # Enable TRIM
```

---

## 8. Add More RAM

Task Manager → **Performance** → **Memory**. Over 80% in use regularly = you need more RAM.

---

## 9. Adjust Virtual Memory (Page File)

`Win + R` → `sysdm.cpl` → **Advanced** → **Performance** → **Virtual Memory** → uncheck automatic → set Initial and Maximum to 1.5× your RAM.

---

## 10. Disable SysMain on HDD Systems

```powershell
Set-Service SysMain -StartupType Disabled
Stop-Service SysMain
```

On SSD — leave it enabled.

---

## 11. Update GPU Drivers

- NVIDIA: nvidia.com/drivers
- AMD: amd.com/drivers

Outdated drivers cause stuttering and crashes.

---

## 12. Defragment HDD (Not SSD)

```powershell
Optimize-Volume -DriveLetter C -Defrag  # HDD only
```

Never defragment an SSD.

---

## 13. Disable Search Indexing on HDD

```powershell
Set-Service WSearch -StartupType Disabled
Stop-Service WSearch
```

---

## 14. Turn Off Transparency

`Settings` → `Personalization` → `Colors` → disable **Transparency effects**.

---

## 15. Reset Windows (Last Resort)

`Settings` → `Recovery` → **Reset this PC** → **Remove everything**. Back up files first.

---

## Summary

Start with: disable startup programs + clean temp files + High Performance power plan. Still slow? Upgrade to SSD — it's the single biggest improvement you can make.
