---
title: "How to Fix Blue Screen of Death (BSOD) in Windows 10 and 11"
date: "2026-04-24"
updated: "2026-08-12"
publishDate: "2026-04-24"
description: "Blue screen with a stop code? Fix the known Windows 11 24H2 update crash (0x18B) plus how to read any BSOD error code, find the cause in Event Viewer, and fix the most common stop errors."
tags: ["windows", "troubleshooting", "bsod", "diagnostics", "windows-update"]
readTime: 11
translatesUk: "siniy-ekran-smerti-windows-11-24h2"
---

A blue screen means Windows hit a critical error it couldn't recover from. The stop code tells you exactly what went wrong — if you know how to read it. In most cases it's fixed in 10-20 minutes.

---

## First, Check: Is This the Known 24H2 Update Incident?

Starting March 2026, Microsoft confirmed a series of BSOD crashes caused by Windows 11 24H2 cumulative updates. If your PC crashed immediately after a restart following a Windows Update, check this table first — it's a much faster fix than general diagnostics below.

| Error Code | Name | Cause |
|------------|------|-------|
| `0x0000018B` | SECURE_KERNEL_ERROR | Conflict from KB5053656 / KB5055523 |
| `0x000000C5` | DRIVER_CORRUPTED_EXPOOL | Corrupted driver post-update |
| `0xC000021A` | SYSTEM_PROCESS_TERMINATED | Critical system process crashed |
| `0x0000007E` | SYSTEM_THREAD_EXCEPTION | Incompatible driver |
| `UNSUPPORTED_PROCESSOR` | — | MSI/Intel motherboard conflict |

Most reports involve:
- **KB5053656** (March 2026) — triggers `SECURE_KERNEL_ERROR` with stop code `0x18B`
- **KB5055523** (April 2026) — expanded the issue to more devices
- **KB5029351** (earlier) — `UNSUPPORTED_PROCESSOR` BSOD on MSI boards

Microsoft deployed a **Known Issue Rollback (KIR)** — an automatic fix that rolls back the problematic changes. It can take up to 24 hours to reach your device and doesn't always trigger automatically.

### Step 1: Check for the Microsoft KIR Fix

```powershell
(New-Object -ComObject Microsoft.Update.SystemInfo).RebootRequired
```

`Win + I` → **Windows Update** → **Check for updates** → install everything available and restart.

### Step 2: Boot into Safe Mode if PC Won't Start

Interrupt the boot 3 times with the power button → **Recovery Mode** → **Troubleshoot** → **Advanced options** → **Startup Settings** → **Restart** → **F4** (Safe Mode). All subsequent steps can be done from Safe Mode.

### Step 3: Remove the Problematic Update

```powershell
# View recently installed updates
Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 10

# Remove specific update (replace KB number with yours)
wusa /uninstall /kb:5053656 /quiet /norestart
wusa /uninstall /kb:5055523 /quiet /norestart
```

Via GUI: `Win + I` → **Windows Update** → **Update history** → **Uninstall updates** → find KB and remove.

### Step 4: Repair System Files and Check for Driver Conflicts

```cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
```

BSOD after an update is often caused by a conflict between the update and GPU or chipset drivers:

```powershell
Get-WinEvent -FilterHashtable @{LogName='System'; Id=7034,7023} -MaxEvents 10 |
  Select-Object TimeCreated, Message

Get-PnpDevice | Where-Object {$_.Status -ne 'OK'} | Select-Object Name, Status, Class
```

**NVIDIA/AMD GPU:** download the latest driver from the manufacturer's website — not through Windows Update.

### Step 5: Update BIOS (MSI, ASUS, Gigabyte boards)

Several BSODs are caused by incompatibility between the Windows update and old BIOS firmware.

```powershell
# Check current BIOS version
(Get-WmiObject Win32_BIOS).SMBIOSBIOSVersion

# Motherboard model
(Get-WmiObject Win32_BaseBoard) | Select-Object Manufacturer, Product, Version
```

### Step 6: Pause Updates to Prevent Recurrence

```powershell
$pause = (Get-Date).AddDays(35).ToString("yyyy-MM-ddTHH:mm:ssZ")
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings" `
  -Name "PauseQualityUpdatesEndTime" -Value $pause
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings" `
  -Name "PauseFeatureUpdatesEndTime" -Value $pause
```

Or via Settings: `Win + I` → **Windows Update** → **Pause for 1-4 weeks**.

### Step 7: Reset Windows if Nothing Else Works

Recovery → **Troubleshoot** → **Reset this PC** → **Remove everything** → **Cloud download**. Cloud download gets a fresh Windows image from Microsoft — guaranteed clean without the corrupted update.

---

## General BSOD Diagnostics (if the cause isn't a specific update)

## Read the Stop Code

When a BSOD occurs, Windows shows a stop code like `MEMORY_MANAGEMENT` or `DRIVER_IRQL_NOT_LESS_OR_EQUAL`. Write it down or photograph the screen.

If it rebooted too fast to read:

```powershell
Get-EventLog -LogName System -EntryType Error -Newest 10 | Where-Object {$_.Source -eq "BugCheck"}
```

Or check Event Viewer: `Win + R` → `eventvwr.msc` → **Windows Logs** → **System** → filter by **Critical**.

---

## Find the Crash Dump File

Windows saves crash details to a minidump file:

```powershell
Get-ChildItem C:\Windows\Minidump\ | Sort-Object LastWriteTime -Descending | Select-Object -First 5
```

To read minidumps, use [WinDbg](https://learn.microsoft.com/en-us/windows-hardware/drivers/debugger/) or the free tool **WhoCrashed** — it reads the dump and tells you which driver caused the crash in plain English.

---

## Most Common BSODs and How to Fix Them

### MEMORY_MANAGEMENT

Points to RAM problems.

1. Run Windows Memory Diagnostic: `Win + R` → `mdsched.exe` → **Restart now and check for problems**
2. If errors found — test sticks individually to find the bad one
3. Reseat RAM modules (remove and reinsert)

```powershell
# Check RAM in use
Get-WmiObject Win32_PhysicalMemory | Select-Object Capacity, Speed, Manufacturer
```

---

### DRIVER_IRQL_NOT_LESS_OR_EQUAL

A driver tried to access memory it shouldn't. Usually caused by a recently installed or updated driver.

Check which driver: the BSOD screen often shows a `.sys` filename (e.g. `nvlddmkm.sys` = NVIDIA driver).

```powershell
# Find recently installed drivers
Get-WinEvent -LogName System | Where-Object {$_.Id -eq 7045} | Select-Object -First 10 TimeCreated, Message
```

Roll back the driver: `Device Manager` → find the device → **Properties** → **Driver** → **Roll Back Driver**.

---

### CRITICAL_PROCESS_DIED

A core Windows process crashed. Usually caused by corrupted system files or a bad update.

```cmd
sfc /scannow
DISM /Online /Cleanup-Image /RestoreHealth
```

If that doesn't help, try System Restore to a point before the BSODs started.

---

### KERNEL_SECURITY_CHECK_FAILURE

Often caused by incompatible drivers or RAM issues. Run memory diagnostic first, then check for driver updates.

Also check disk health:
```cmd
chkdsk C: /f /r
```

Requires a restart to run on the system drive.

---

### PAGE_FAULT_IN_NONPAGED_AREA

Windows tried to access a memory page that doesn't exist. Causes: bad RAM, failing SSD/HDD, or corrupt drivers.

Check disk:
```powershell
Get-PhysicalDisk | Select-Object FriendlyName, OperationalStatus, HealthStatus
```

Check SMART status:
```cmd
wmic diskdrive get status
```

If status is anything other than `OK` — back up immediately, the drive is failing.

---

### IRQL_NOT_LESS_OR_EQUAL

Similar to DRIVER_IRQL — usually a driver or hardware issue. Run Driver Verifier to identify the problematic driver:

```cmd
verifier /standard /all
```

Restart. If a BSOD occurs, it will name the offending driver. Then disable Driver Verifier:
```cmd
verifier /reset
```

---

## General Fixes for Any BSOD

**1. Update all drivers** — especially GPU, chipset, and network drivers. Don't use Windows Update for this — download directly from manufacturer websites.

**2. Check for Windows Updates** — sometimes a patch fixes a known BSOD-causing bug.

**3. Uninstall recent software** — if BSODs started after installing something, uninstall it.

**4. Test RAM** — use MemTest86 for thorough testing (runs outside Windows, more reliable than mdsched).

**5. Check temperatures** — overheating causes BSODs.
```powershell
# Check CPU temp (requires OpenHardwareMonitor or similar)
Get-WmiObject MSAcpi_ThermalZoneTemperature -Namespace "root/wmi" |
  Select-Object @{n='Temp(C)';e={($_.CurrentTemperature - 2732) / 10}}
```

**6. Run SFC and DISM** — corrupted Windows files cause many BSODs (see CRITICAL_PROCESS_DIED section above).

---

## If BSODs Happen in a Loop (Can't Boot)

Boot into **Safe Mode**: hold `Shift` while clicking Restart → Troubleshoot → Advanced options → Startup Settings → Restart → press **F4**.

In Safe Mode, uninstall recently added drivers or run SFC.

If Safe Mode also crashes: boot from Windows installation USB → **Repair your computer** → **Startup Repair** or **System Restore**.

---

## Frequently Asked Questions

### How do I tell if it's a driver or failing hardware?

**Driver:** BSOD appears right after installing/updating software, always shows the same code, and stops after removing or rolling back the driver. **Hardware:** random BSODs with different codes that keep recurring even after a clean Windows reinstall.

### The PC restarts too fast to read the stop code

Disable automatic restart: `sysdm.cpl` → Advanced → Startup and Recovery → uncheck **Automatically restart**. The BSOD will then stay on screen until you restart manually.

### The BSOD appeared right after a Windows update — where do I start?

Check the "24H2 Update Incident" section above first — if your code matches the table, that fix is much faster than the general diagnostics below it.

---

## Summary

**If the BSOD happened right after a Windows update:** check the known error code table above, remove the problematic update (`wusa /uninstall /kb:NUMBER`), or go through Recovery Mode.

**For everything else:** note the stop code → undo the last change (driver/update/new software) → `DISM /RestoreHealth` + `sfc /scannow` → test RAM (`mdsched`) and disk (`chkdsk`) → check temperatures. The error code points you in a direction — it isn't a verdict.

---

## 🔍 Not sure what a Windows error code means?

If Windows shows a code like `0x80070005`, `0x80070002` or `0xC000021A` — use this free tool:

**[→ Windows Error Decoder](/tools/windows-error-decoder)** — enter the code and instantly find out what it means and how to fix it.

Most BSODs are caused by three things: bad drivers, failing RAM, or corrupted system files.
