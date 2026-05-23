---
title: "How to Fix Windows 11 Blue Screen (BSOD) After Update in 2025-2026"
date: "2026-05-22"
publishDate: "2026-05-22"
description: "Windows 11 24H2 showing blue screen after KB5055523 or KB5053656 update? Fix SECURE_KERNEL_ERROR (0x18B), black screen, and other post-update BSOD issues step by step."
tags: ["windows", "bsod", "windows-11", "troubleshooting", "fix"]
readTime: 7
---

Windows 11 24H2 updates released in March-April 2026 triggered blue screen crashes on millions of PCs. Microsoft has acknowledged the issue and released an emergency Known Issue Rollback — but not everyone received it automatically. Here's what to do right now.

---

## Common BSODs After 2025-2026 Updates

| Error Code | Name | Cause |
|------------|------|-------|
| `0x0000018B` | SECURE_KERNEL_ERROR | Conflict from KB5053656 / KB5055523 |
| `0x000000C5` | DRIVER_CORRUPTED_EXPOOL | Corrupted driver post-update |
| `0xC000021A` | SYSTEM_PROCESS_TERMINATED | Critical system process crashed |
| `0x0000007E` | SYSTEM_THREAD_EXCEPTION | Incompatible driver |
| `UNSUPPORTED_PROCESSOR` | — | MSI/Intel motherboard conflict |

---

## Step 1: Check if Known Issue Rollback Applied

Microsoft released a KIR that automatically rolls back the problematic update — but it can take up to 24 hours to reach your device.

```powershell
# Check current Windows version and recent updates
(Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion").DisplayVersion
Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 3 HotFixID, InstalledOn
```

If the PC won't boot at all, skip to Step 3.

---

## Step 2: Uninstall the Problematic Update (if Windows boots)

```powershell
# List recent updates
Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 5 HotFixID, InstalledOn

# Uninstall specific update (replace KB number)
wusa /uninstall /kb:5055523 /quiet /norestart
```

Or via Settings: `Win + I` → **Windows Update** → **Update history** → **Uninstall updates**

---

## Step 3: If Windows Won't Boot — Recovery Mode

Press **F8** at startup, or force 3 interrupted boots in a row to trigger Automatic Repair.

**Troubleshoot** → **Advanced options**:

### Option A: Uninstall Update
**Uninstall Updates** → **Uninstall latest quality update**

### Option B: System Restore
**System Restore** → pick a restore point before the BSOD appeared

### Option C: Safe Mode
**Startup Settings** → F4 (Safe Mode) or F5 (Safe Mode with Networking)

In Safe Mode:
```powershell
# Check and repair system files
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
```

---

## Step 4: Update or Roll Back Drivers

BSOD is often caused by a conflict between the update and GPU or chipset drivers:

```powershell
# Find problematic drivers in Event Log
Get-WinEvent -FilterHashtable @{LogName='System'; Id=7034,7023} -MaxEvents 10 |
  Select-Object TimeCreated, Message

# Check Device Manager for errors
Get-PnpDevice | Where-Object {$_.Status -ne 'OK'} | Select-Object Name, Status, Class
```

- **NVIDIA/AMD GPU**: download latest driver from manufacturer's website — not through Windows Update
- **MSI boards + Intel 12th/13th Gen**: update BIOS from MSI's website

---

## Step 5: Analyze Minidump File

```powershell
# Find minidump files
Get-ChildItem "C:\Windows\Minidump" -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending | Select-Object -First 5

# Check Event Log for BSOD details
Get-WinEvent -FilterHashtable @{LogName='System'; Id=41} -MaxEvents 3 |
  Select-Object TimeCreated, @{n='BugCheckCode';e={$_.Properties[0].Value}}
```

Event ID 41 with BugCheckCode `0x18B` = confirmed SECURE_KERNEL_ERROR from the update.

---

## Step 6: Reset Windows (Last Resort)

`Win + I` → **System** → **Recovery** → **Reset this PC** → **Cloud download**

Cloud download gets a fresh Windows image from Microsoft — guaranteed clean, no update conflicts.

---

## 🔍 Don't Know What Your Error Code Means?

**[→ Windows Error Code Decoder](/tools/windows-error-decoder)** — enter your BSOD code (e.g. `0x0000018B` or `0xC000021A`) to get a plain-language explanation and fix steps.

---

## Prevent Future Issues

```powershell
# Defer quality updates by 14 days (time to catch bugs before they reach you)
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU"
New-Item -Path $path -Force | Out-Null
Set-ItemProperty -Path $path -Name "DeferQualityUpdatesPeriodInDays" -Value 14 -Type DWord
```

---

## Summary

**If Windows boots:** uninstall the update with `wusa /uninstall /kb:NUMBER`. **If it doesn't:** Recovery Mode → Uninstall latest quality update. After recovery: run `DISM /RestoreHealth` and `sfc /scannow`. Unknown error code — use the [Error Decoder](/tools/windows-error-decoder).
