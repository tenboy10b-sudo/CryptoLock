---
title: "How to Fix Blue Screen of Death (BSOD) in Windows 10 and 11"
date: "2026-04-24"
publishDate: "2026-04-24"
description: "Blue screen with a stop code? Here's how to read BSOD error codes, find the cause in Event Viewer, and fix the most common stop errors including MEMORY_MANAGEMENT, DRIVER_IRQL, and CRITICAL_PROCESS_DIED."
tags: ["windows", "troubleshooting", "bsod", "diagnostics"]
readTime: 8
---

A blue screen means Windows hit a critical error it couldn't recover from. The stop code tells you exactly what went wrong — if you know how to read it.

---

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

## Summary

1. Note the stop code
2. Check minidumps with WhoCrashed
3. Fix based on the specific error (use the table above)
4. If unsure: run SFC + DISM, update drivers, test RAM

Most BSODs are caused by three things: bad drivers, failing RAM, or corrupted system files.
