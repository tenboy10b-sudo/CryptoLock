---
title: "How to Speed Up Windows 11 in 2026: Proven Methods"
date: "2026-12-19"
publishDate: "2026-12-19"
description: "Windows 11 running slow? These proven methods genuinely improve performance: disable startup apps, switch power plan, reduce visual effects, clean disk, and update drivers."
tags: ["windows", "optimization", "performance", "settings"]
readTime: 6
---

Windows 11 slows down after months of use — mostly from accumulated startup programs, fragmented storage, and outdated drivers. Here's what actually works.

---

## 1. Disable Startup Programs (Biggest Impact)

`Ctrl + Shift + Esc` → **Startup apps** tab → sort by **Startup impact** → disable anything **High** you don't need at login.

Common culprits: Spotify, Discord, Teams (personal), OneDrive (if you don't use it), Adobe updaters, game launchers, Slack.

```powershell
# View startup entries via registry
Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" |
  Select-Object * -ExcludeProperty PS*
```

---

## 2. Switch Power Plan

```powershell
# High Performance
powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c

# Ultimate Performance (best for desktops)
powercfg /duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61
powercfg /setactive e9a42b02-d5df-448d-aa00-03f14749eb61

# Check current plan
powercfg /getactivescheme
```

On laptops: use High Performance only when plugged in.

---

## 3. Reduce Visual Effects

`Win + R` → `sysdm.cpl` → **Advanced** → **Performance Settings** → **Adjust for best performance** → OK

Or selectively disable only animations:
```powershell
Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Name "TaskbarAnimations" -Value 0
Set-ItemProperty "HKCU:\Control Panel\Desktop" -Name "MenuShowDelay" -Value "0"
```

Also: `Win + I` → **Accessibility** → **Visual effects** → turn off **Animation effects** and **Transparency effects**

---

## 4. Clean Up Disk Space

```powershell
# Run Disk Cleanup with system files
cleanmgr /sageset:1
cleanmgr /sagerun:1

# Find large files
Get-ChildItem C:\ -Recurse -EA 0 |
  Where-Object {$_.Length -gt 500MB} |
  Sort-Object Length -Descending |
  Select-Object -First 10 FullName, @{n='GB';e={[math]::Round($_.Length/1GB,2)}}

# Clear temp files
Remove-Item "$env:TEMP\*" -Recurse -Force -EA 0
Remove-Item "C:\Windows\Temp\*" -Recurse -Force -EA 0
```

---

## 5. Disable SysMain on SSD

SysMain (Superfetch) is designed to prefetch data for HDDs. On SSD it's unnecessary and wastes resources:

```powershell
Stop-Service SysMain -Force
Set-Service SysMain -StartupType Disabled
```

Leave it enabled on HDD systems (16GB RAM or less).

---

## 6. Update GPU Drivers

Outdated GPU drivers are a top cause of performance issues, especially with Windows 11 updates:

```powershell
# Check current GPU driver version
Get-WmiObject Win32_VideoController | Select-Object Name, DriverVersion, DriverDate
```

Download latest drivers directly from manufacturer:
- NVIDIA: [nvidia.com/drivers](https://www.nvidia.com/drivers)
- AMD: [amd.com/support](https://www.amd.com/support)
- Intel: [intel.com/download-center](https://www.intel.com/content/www/us/en/download-center/home.html)

---

## 7. Repair System Files

Corrupted system files cause slowdowns, crashes, and strange behavior:

```cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
```

Run as Administrator. DISM first, then SFC.

---

## 8. Disable Unnecessary Services

```powershell
# Safe to disable on home PCs
$toDisable = @("Fax", "RemoteRegistry", "XblGameSave", "XblAuthManager", "XboxNetApiSvc")
foreach ($svc in $toDisable) {
  Stop-Service $svc -Force -EA 0
  Set-Service $svc -StartupType Disabled -EA 0
}
```

---

## 9. Check Temperatures

Thermal throttling drops CPU/GPU to 30-50% performance to prevent damage. Download **HWiNFO64** (free) and check temperatures under load:
- CPU above 90°C → clean dust, replace thermal paste
- GPU above 85°C → clean dust, check case airflow

---

## 10. Enable Storage Sense

`Win + I` → **System** → **Storage** → **Storage Sense** → On

Configure to run monthly and clean Downloads older than 60 days.

---

## What Doesn't Actually Help

- Registry cleaners — Windows 11 doesn't slow down from registry bloat
- "PC optimizer" tools like CCleaner — often cause more problems than they fix
- Disabling Windows Update — leaves you vulnerable to security issues

---

## Summary

Best ROI: **disable startup apps** + **switch to High Performance plan** + **clean disk**. For older hardware: also disable animations and SysMain. If still slow: check temperatures and run SFC/DISM. Never use third-party "optimizers" — Windows has all the tools built in.
