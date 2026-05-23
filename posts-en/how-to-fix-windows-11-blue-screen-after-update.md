---
title: "How to Fix Windows 11 Blue Screen After Update (BSOD 0x18B, 2025-2026)"
date: "2026-05-23"
publishDate: "2026-05-23"
description: "Windows 11 24H2 crashing with BSOD after KB5053656 or KB5055523 update? Fix SECURE_KERNEL_ERROR 0x18B and UNSUPPORTED_PROCESSOR blue screens with Known Issue Rollback and update removal."
tags: ["windows", "errors", "bsod", "troubleshooting", "windows-update"]
readTime: 6
---

Starting March 2026, Microsoft confirmed a series of BSOD crashes caused by Windows 11 24H2 cumulative updates. If your PC crashes immediately after restart with a blue screen — here's how to fix it.

---

## Which Updates Cause the Problem

Most reports involve:
- **KB5053656** (March 2026) — triggers `SECURE_KERNEL_ERROR` with stop code `0x18B`
- **KB5055523** (April 2026) — expanded the issue to more devices
- **KB5029351** (earlier) — `UNSUPPORTED_PROCESSOR` BSOD on MSI boards

Microsoft deployed a **Known Issue Rollback (KIR)** — an automatic fix that rolls back the problematic changes. It can take up to 24 hours to reach your device and doesn't always trigger automatically.

---

## Step 1: Check for the Microsoft KIR Fix

First, check if Windows Update has a fix waiting:

```powershell
(New-Object -ComObject Microsoft.Update.SystemInfo).RebootRequired
```

`Win + I` → **Windows Update** → **Check for updates** → install everything available and restart.

---

## Step 2: Boot into Safe Mode if PC Won't Start

Interrupt the boot 3 times with the power button → **Recovery Mode**

→ **Troubleshoot** → **Advanced options** → **Startup Settings** → **Restart** → **F4** (Safe Mode)

All subsequent steps can be done from Safe Mode.

---

## Step 3: Remove the Problematic Update

```powershell
# View recently installed updates
Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 10

# Remove specific update (replace KB number with yours)
wusa /uninstall /kb:5053656 /quiet /norestart
wusa /uninstall /kb:5055523 /quiet /norestart
```

Via GUI: `Win + I` → **Windows Update** → **Update history** → **Uninstall updates** → find KB and remove.

---

## Step 4: Repair System Files

After uninstalling the update, repair any damage:

```cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
```

Restart after completion.

---

## Step 5: Update BIOS (MSI, ASUS, Gigabyte boards)

Several BSODs are caused by incompatibility between the Windows update and old BIOS firmware. Check your motherboard manufacturer's site for BIOS updates.

```powershell
# Check current BIOS version
(Get-WmiObject Win32_BIOS).SMBIOSBIOSVersion

# Motherboard model
(Get-WmiObject Win32_BaseBoard) | Select-Object Manufacturer, Product, Version
```

---

## Step 6: Pause Updates to Prevent Recurrence

```powershell
# Pause updates for 35 days
$pause = (Get-Date).AddDays(35).ToString("yyyy-MM-ddTHH:mm:ssZ")
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings" `
  -Name "PauseQualityUpdatesEndTime" -Value $pause
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings" `
  -Name "PauseFeatureUpdatesEndTime" -Value $pause
```

Or via Settings: `Win + I` → **Windows Update** → **Pause for 1-4 weeks**.

---

## Step 7: Reset Windows if Nothing Else Works

Recovery → **Troubleshoot** → **Reset this PC** → **Remove everything** → **Cloud download**

Cloud download gets a fresh Windows image from Microsoft — guaranteed clean without the corrupted update.

---

## 🔍 Got a specific error code on the blue screen?

**[→ Windows Error Code Decoder](/tools/windows-error-decoder)** — enter the stop code (0x18B, 0x7E, 0x50) and get the exact cause and step-by-step fix.

---

## Summary

1. Check Windows Update — Microsoft's KIR may have already arrived
2. Remove the problematic update: `wusa /uninstall /kb:XXXXXXX`
3. Run `DISM /RestoreHealth` and `sfc /scannow`
4. Update BIOS if on MSI/ASUS/Gigabyte board
5. Pause updates for 2-4 weeks after fixing
6. If nothing works — cloud reset from Recovery
