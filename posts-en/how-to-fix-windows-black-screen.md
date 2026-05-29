---
title: "How to Fix Black Screen in Windows 10 and 11"
date: "2026-03-16"
publishDate: "2026-03-16"
description: "Black screen after login, during startup, or after update? Step-by-step fixes for Windows black screen: restart Explorer, update GPU driver, fix display output, and boot issues."
tags: ["windows", "troubleshooting", "drivers", "diagnostics"]
readTime: 6
---

A black screen in Windows usually means one of three things: the display isn't getting a signal, Windows loaded but Explorer crashed, or a driver or update broke the display stack. Here's how to diagnose and fix each.

---

## Identify the Type of Black Screen

- **Black screen before Windows logo** — BIOS/hardware or bootloader issue
- **Black screen after Windows logo, then desktop appears** — normal, ignore if brief
- **Black screen after login with cursor** — Explorer crashed or GPU driver issue
- **Black screen with no cursor** — display driver completely failed
- **Black screen after update** — driver incompatibility

---

## Fix 1: Check the Basics

- Press `Win + Ctrl + Shift + B` — resets the graphics subsystem. Screen flashes briefly, then returns. Works from a black screen if Windows is loaded.
- Try a different HDMI/DisplayPort cable or port on the GPU
- If using multiple monitors: unplug all except one
- Check if the monitor's power light is on and input source is correct

---

## Fix 2: Restart Windows Explorer

If you have a cursor but no taskbar or desktop:

`Ctrl + Alt + Del` → **Task Manager** → **File** → **Run new task** → type `explorer.exe` → OK

Or: `Ctrl + Alt + Del` → Task Manager → **Details** tab → find `explorer.exe` → **End task** → **File** → **Run new task** → `explorer.exe`

```powershell
# If you can open PowerShell (Win + X → Terminal)
Stop-Process -Name explorer -Force
Start-Process explorer
```

---

## Fix 3: Boot into Safe Mode

Safe Mode loads minimal drivers — if the screen works in Safe Mode, a driver is causing the black screen.

**If Windows won't boot normally:**
Interrupt boot 3 times (hold power during logo) → Windows enters Recovery → **Troubleshoot** → **Advanced options** → **Startup Settings** → **Restart** → press **F4**

**From Windows:**
`Win + I` → **System** → **Recovery** → **Advanced startup** → **Restart now** → **Troubleshoot** → **Startup Settings** → **F4**

In Safe Mode: check Device Manager for GPU errors, roll back or uninstall GPU driver.

---

## Fix 4: Update or Roll Back GPU Driver

The most common cause of black screen after Windows Update.

**Roll back** (if it worked before the update):
Device Manager → **Display adapters** → right-click GPU → **Properties** → **Driver** tab → **Roll Back Driver**

**Update** (if driver is outdated):
- NVIDIA: download from [nvidia.com/drivers](https://www.nvidia.com/drivers)
- AMD: download from [amd.com/support](https://www.amd.com/support)
- Intel: download from [intel.com/download-center](https://www.intel.com/content/www/us/en/download-center/home.html)

**Clean reinstall** (if driver is corrupted):
Use DDU (Display Driver Uninstaller) in Safe Mode → uninstall completely → install fresh driver.

---

## Fix 5: Check Display Output Settings

If you recently changed display settings or connected a new monitor:

`Win + P` — toggles between PC screen / Duplicate / Extend / Second screen only. Press blindly even on black screen — it cycles through modes.

```powershell
# Reset display settings to defaults (run from Task Manager if screen is black)
DisplaySwitch.exe /internal
```

---

## Fix 6: Disable Fast Startup

Fast Startup can cause black screen on some hardware combinations:

Boot into Safe Mode → `Control Panel` → **Power Options** → **Choose what the power buttons do** → uncheck **Turn on fast startup** → Save.

---

## Fix 7: System Restore

If black screen started after a specific change:

Boot into Recovery → **Troubleshoot** → **Advanced options** → **System Restore** → pick a date before the problem.

---

## Fix 8: SFC and DISM

Corrupted system files cause display issues:

Boot into Safe Mode → open PowerShell as Administrator:
```cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
```

---

## Fix 9: Reinstall Windows

If nothing works and you can access Recovery:

**Troubleshoot** → **Reset this PC** → **Keep my files** → **Cloud download**

---


---

## 🔍 Не знаєш що означає код помилки Windows?

Якщо Windows показує код на кшталт `0x80070005`, `0x80070002` або `0xC000021A` — скористайся безкоштовним інструментом:

**[→ Декодер помилок Windows](/tools/windows-error-decoder)** — введи код і одразу дізнайся що він означає та як виправити.


## Summary

Try in order: `Win + Ctrl + Shift + B` to reset graphics → restart Explorer → boot Safe Mode → roll back GPU driver → check display output with `Win + P` → disable Fast Startup → System Restore → SFC/DISM. Most black screen issues are GPU driver related — rolling back or reinstalling the driver with DDU fixes them.
