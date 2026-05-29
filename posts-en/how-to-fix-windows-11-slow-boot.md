---
title: "How to Fix Windows 11 Slow Boot: 10 Proven Methods"
date: "2027-01-01"
publishDate: "2027-01-01"
description: "Windows 11 taking too long to boot? Fix slow startup with these 10 proven methods: disable startup programs, enable Fast Startup, update drivers, check disk health."
tags: ["windows", "optimization", "performance", "boot"]
readTime: 6
---

A slow Windows 11 boot is usually caused by too many startup programs, a fragmented drive, or outdated drivers. Here are the most effective fixes in order of impact.

---

## 1. Disable Startup Programs (Biggest Impact)

Every program in startup delays boot. Remove what you don't need immediately:

`Ctrl + Shift + Esc` → **Startup apps** → sort by **Startup impact** → disable High impact items

```powershell
# View all startup entries with impact
Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location
```

Safe to disable: Spotify, Discord, Steam, OneDrive, Adobe updaters, Teams (personal), Skype.

---

## 2. Enable Fast Startup

`Control Panel` → **Power Options** → **Choose what the power buttons do** → **Turn on fast startup**

```powershell
# Enable via registry
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power" -Name "HiberbootEnabled" -Value 1
```

Fast Startup saves the kernel session to disk — cuts boot time by 30-50%.

---

## 3. Check Boot Times in Event Viewer

```powershell
# Find exact boot duration
Get-WinEvent -FilterHashtable @{LogName='System'; Id=100; ProviderName='Microsoft-Windows-Diagnostics-Performance'} -MaxEvents 5 |
  Select-Object TimeCreated, @{n='BootMs';e={$_.Properties[0].Value}} |
  Sort-Object BootMs -Descending
```

Event ID 100 = total boot time in milliseconds. Anything over 30,000 ms (30 sec) needs attention.

---

## 4. Run Disk Check

```powershell
# Quick scan without restart
Repair-Volume -DriveLetter C -Scan

# Check disk health
Get-PhysicalDisk | Select-Object FriendlyName, HealthStatus, MediaType
```

A failing or nearly-full SSD dramatically slows boot.

---

## 5. Update or Reinstall GPU Drivers

Outdated GPU drivers are a common cause of slow boot and black screen delays:

```powershell
# Check current GPU driver version
(Get-WmiObject Win32_VideoController).DriverVersion
```

Download latest from: nvidia.com/drivers or amd.com/support — don't use Windows Update drivers for GPU.

---

## 6. Repair System Files

```powershell
# Run as Administrator
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
```

Corrupted system files cause random boot delays. Restart after completion.

---

## 7. Disable SysMain on SSD

```powershell
Stop-Service SysMain -Force
Set-Service SysMain -StartupType Disabled
```

SysMain (Superfetch) preloads apps into RAM — helpful on HDD, counterproductive on SSD.

---

## 8. Increase Virtual Memory

Low page file causes Windows to spend extra time managing memory at startup:

`Win + R` → `sysdm.cpl` → **Advanced** → **Performance Settings** → **Advanced** → **Change**

Uncheck Automatic → Custom: Initial = RAM × 1.5, Maximum = RAM × 3

---

## 9. Check for Malware

Malware often installs itself in startup and causes significant boot delays:

```powershell
# Quick Defender scan
Start-MpScan -ScanType QuickScan
```

---

## 10. Enable Ultimate Performance Power Plan

```powershell
# Enable Ultimate Performance (best for desktop PCs)
powercfg /duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61
powercfg /setactive e9a42b02-d5df-448d-aa00-03f14749eb61
```

---

## Summary

Best quick wins: disable startup programs → enable Fast Startup → check SysMain (disable on SSD). Use Event ID 100 to measure actual boot time before and after changes. If boot time exceeds 60 seconds consistently — check disk health first.

## Frequently Asked Questions

### How long should Windows 11 boot take?

On an SSD: 10-20 seconds from power button to desktop. On an HDD: 45-90 seconds is normal. Over 2 minutes on SSD or over 5 minutes on HDD indicates a problem.

### Does reinstalling Windows fix slow boot?

Yes — a clean install is the nuclear option but works. Before doing that, try DISM + SFC and disabling startup programs. Clean install takes about 30 minutes but gives you a fresh start.

### Why is Windows 11 slower to boot than Windows 10?

Windows 11 has more visual effects and background services enabled by default. Disabling startup programs and enabling Fast Startup usually closes the gap.
