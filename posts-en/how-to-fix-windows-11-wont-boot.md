---
title: "Windows 11 Won't Boot: Complete Fix Guide for 2025-2026"
date: "2026-05-23"
updated: "2026-08-12"
publishDate: "2026-05-23"
description: "Windows won't start, stuck on logo, black screen, or blue screen after update? Complete step-by-step fix from safe mode and driver rollback to bootloader repair and clean install."
tags: ["windows", "troubleshooting", "bsod", "recovery", "boot"]
translatesUk: "windows-11-ne-zapuskaetsya-yak-vypravyty"
readTime: 10
---

Windows 11 failing to boot after an update is one of the most common issues in 2025-2026, especially after the problematic 24H2 cumulative updates. Here's a systematic fix guide from quickest to most involved.

---

## Identify Your Symptom First

| What you see | Likely cause | Go to |
|-------------|-------------|-------|
| Black screen, cursor visible | GPU driver or Explorer crash | Step 2 |
| Stuck on Windows logo | Corrupted system files | Step 3 |
| Blue screen with error code | Critical error | Step 4 |
| "Automatic Repair" loop | Corrupted bootloader | Step 5 |
| BIOS loads but Windows doesn't | Disk or MBR issue | Step 6 |

---

## Step 1: Quick Checks First

Before advanced steps:
- Remove all USB drives and external storage
- Disconnect extra monitors (use only one)
- Try `Ctrl + Alt + Del` — if it responds, Windows is partially alive
- Press `Win + Ctrl + Shift + B` — resets the GPU driver

---

## Step 2: Access Recovery Mode

**Method 1:** If Windows partially loads — `Win + I` → **System** → **Recovery** → **Advanced startup** → **Restart now**

**Method 2:** Interrupt boot 3 times with the power button → Recovery appears automatically

**Method 3:** Boot from Windows 11 USB → choose **Repair your computer** (not Install)

**Black screen with a visible cursor?** Windows may have loaded but Explorer crashed:
- Press `Ctrl + Alt + Del` — if Task Manager opens, it's a shell/explorer issue, not a boot failure
- In Task Manager → **File** → **Run new task** → `explorer.exe`

---

## Step 3: Boot into Safe Mode

From Recovery: **Troubleshoot** → **Advanced options** → **Startup Settings** → **Restart** → press **F4** (Safe Mode)

If Windows works in Safe Mode — the problem is a driver or startup program, not Windows itself.

```powershell
# In Safe Mode — check startup entries
Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"

# Open MSConfig to disable third-party startup items
msconfig
```

**Recently installed an unsigned driver?** From the same Startup Settings menu, press **F7** (Disable driver signature enforcement) instead of F4. If Windows boots, remove the unsigned driver via Device Manager.

---

## Step 4: Repair System Files

From Recovery → **Troubleshoot** → **Advanced options** → **Command Prompt**

```cmd
sfc /scannow
DISM /Online /Cleanup-Image /RestoreHealth
```

If DISM fails without internet (common in Recovery):
```cmd
DISM /Online /Cleanup-Image /RestoreHealth /Source:WIM:D:\sources\install.wim:1 /LimitAccess
```

---

## Step 5: Rebuild the Bootloader

For the "Automatic Repair" loop — the BCD (Boot Configuration Data) is corrupted:

```cmd
bootrec /fixmbr
bootrec /fixboot
bootrec /scanos
bootrec /rebuildbcd
```

For UEFI systems specifically:
```cmd
bcdboot C:\Windows /s C: /f UEFI
```

If `bootrec /fixboot` returns "Access is denied":
```cmd
bcdedit /export C:\BCD_Backup
attrib C:\boot\bcd -h -r -s
ren C:\boot\bcd bcd.old
bootrec /rebuildbcd
```

Or roll back a driver offline via Command Prompt if a recently installed one is blocking boot:
```cmd
# List installed drivers
dism /image:C:\ /get-drivers

# Remove a specific driver
dism /image:C:\ /remove-driver /driver:oem5.inf
```

---

## Step 6: Check the Disk

Disk errors frequently prevent Windows from booting:

```cmd
chkdsk C: /f /r /x
wmic diskdrive get status,model
```

If chkdsk finds and fixes errors — restart and test.

**RAM issues:** remove one stick at a time and try booting with each individually. **Loose connections:** reseat RAM, GPU, and storage cables.

---

## Step 7: System Restore

If a restore point exists from before the problem:

Recovery → **Troubleshoot** → **Advanced options** → **System Restore** → choose a date before the issue started

---

## Step 8: Uninstall the Problematic Update

If the problem started after a specific update:

Recovery → **Troubleshoot** → **Advanced options** → **Uninstall Updates** → remove the latest Quality or Feature update

---

## Step 9: Reset Windows (Keep Files)

Recovery → **Troubleshoot** → **Reset this PC** → **Keep my files** → **Cloud download**

Cloud download gets a fresh Windows image from Microsoft. Personal files are kept, apps are removed.

---

## Step 10: Clean Install

If nothing else works — download the Media Creation Tool from `microsoft.com/software-download/windows11`, create a bootable USB, and do a clean install.

---

## 🔍 Got an error code on the blue screen?

**[→ Windows Error Code Decoder](/tools/windows-error-decoder)** — enter the code (0x18B, 0x0000007E, etc.) and get the cause and fix steps instantly.

---

## Summary

Work through in order: Safe Mode → SFC/DISM → Bootloader repair → chkdsk → System Restore → Uninstall update → Reset with files → Clean install. Most issues resolve at steps 3-6. Don't skip steps — each one narrows down the cause.
