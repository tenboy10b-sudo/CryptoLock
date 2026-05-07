---
title: "Windows Won't Boot: How to Fix Startup Problems"
date: "2026-06-14"
publishDate: "2026-06-14"
description: "Windows won't start, gets stuck on logo, or loops back to error screen? Step-by-step fixes for startup failures — from Startup Repair to rebuilding the bootloader."
tags: ["windows", "recovery", "troubleshooting", "bios"]
readTime: 7
---

A PC that won't boot is alarming but usually fixable. The approach depends on how far Windows gets before failing — here's how to diagnose and fix each scenario.

---

## Identify Where It Fails

- **No POST, black screen** — hardware issue (RAM, GPU, power)
- **BIOS shows, then black screen** — bootloader missing or corrupt
- **Windows logo appears, then restarts** — driver or system file corruption
- **Spinning dots freeze** — update stuck or driver conflict
- **Blue screen on boot** — driver or hardware failure
- **Login screen, then crash** — user profile or driver issue

---

## Access Windows Recovery Environment

Most fixes happen in the Recovery Environment (WinRE).

**If Windows starts repair automatically:**
After 2–3 failed boots, Windows shows **Automatic Repair** screen → click **Advanced options**

**Force it manually:**
Interrupt boot 3 times: press power button during Windows logo to force off, repeat 3 times. Windows detects this and boots into recovery.

**From installation USB:**
Boot from Windows USB → **Repair your computer** → **Troubleshoot** → **Advanced options**

---

## Fix 1: Startup Repair

WinRE → **Troubleshoot** → **Advanced options** → **Startup Repair**

Windows automatically scans for and fixes common boot problems. Takes 5–15 minutes. Try this first.

---

## Fix 2: Rebuild Bootloader (BCD)

If Windows can't find the boot configuration:

WinRE → **Command Prompt**:

```cmd
bootrec /fixmbr
bootrec /fixboot
bootrec /scanos
bootrec /rebuildbcd
```

Run in this order. When `rebuildbcd` asks to add Windows to boot list — press **Y**.

If `bootrec /fixboot` returns "Access is denied":
```cmd
bcdedit /export C:\BCD_Backup
attrib C:\boot\bcd -h -r -s
ren C:\boot\bcd bcd.old
bootrec /rebuildbcd
```

---

## Fix 3: System File Repair

Corrupt system files prevent boot:

WinRE → **Command Prompt**:
```cmd
sfc /scannow /offbootdir=C:\ /offwindir=C:\Windows
DISM /Image:C:\ /Cleanup-Image /RestoreHealth
```

---

## Fix 4: Roll Back a Bad Update or Driver

If Windows stopped booting after an update:

WinRE → **Troubleshoot** → **Advanced options** → **Uninstall Updates** → **Uninstall latest quality update**

Or roll back a driver via Command Prompt:
```cmd
# List installed drivers
dism /image:C:\ /get-drivers

# Remove a specific driver
dism /image:C:\ /remove-driver /driver:oem5.inf
```

---

## Fix 5: System Restore

If you have restore points:

WinRE → **Troubleshoot** → **Advanced options** → **System Restore** → pick a date before the problem started

This undoes system changes without affecting personal files.

---

## Fix 6: Safe Mode

If Windows partially boots, try Safe Mode to isolate the problem:

WinRE → **Troubleshoot** → **Advanced options** → **Startup Settings** → **Restart** → press **F4** for Safe Mode

In Safe Mode: uninstall recently added software or drivers, run `sfc /scannow`, or roll back drivers via Device Manager.

---

## Fix 7: Disable Driver Signature Enforcement

If a recently installed unsigned driver is causing the crash:

WinRE → **Startup Settings** → **Restart** → press **F7** (Disable driver signature enforcement)

If Windows boots — the unsigned driver is the problem. Remove it via Device Manager in Safe Mode.

---

## Fix 8: Reset Windows

If nothing else works:

WinRE → **Troubleshoot** → **Reset this PC** → **Keep my files** → **Cloud download**

This reinstalls Windows while keeping personal files. Apps and settings will be lost.

---

## Hardware Checks

If software fixes don't work, the problem may be hardware:

```cmd
# Check disk from WinRE Command Prompt
chkdsk C: /f /r

# Check disk health
wmic diskdrive get status
```

**RAM issues**: remove one stick at a time, try booting with each individually.

**Loose connections**: reseat RAM, GPU, and storage cables.

---

## Black Screen With Cursor

Windows loaded but display isn't working:

- Press `Ctrl + Alt + Del` — if Task Manager opens, it's a shell/explorer issue
- In Task Manager → **File** → **Run new task** → `explorer.exe`
- Or try: `Win + R` → `explorer.exe`

If that doesn't work, boot into Safe Mode and check display drivers.

---

## Summary

Try in order: Startup Repair → rebuild BCD → SFC/DISM → System Restore → uninstall recent updates → Safe Mode to remove bad drivers → Reset as last resort. For BSOD on boot: note the stop code and fix the specific driver or component named.
