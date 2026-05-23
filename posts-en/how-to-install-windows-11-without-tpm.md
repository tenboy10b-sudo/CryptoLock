---
title: "How to Install Windows 11 Without TPM 2.0 in 2026"
date: "2026-12-21"
publishDate: "2026-12-21"
description: "Windows 11 requires TPM 2.0 and Secure Boot, but you can install it on older hardware. Three methods: enable fTPM in BIOS, use Rufus bypass, or registry workaround."
tags: ["windows", "installation", "bios", "settings"]
readTime: 5
---

Windows 11 officially requires TPM 2.0, Secure Boot, and a CPU from 2017 or newer. But you can install it on older hardware using one of these methods.

---

## Method 1: Enable fTPM in BIOS (Try This First)

Many older CPUs have a built-in TPM module that's simply disabled in BIOS:

1. Restart and enter BIOS (Del, F2, or F12 depending on manufacturer)
2. Look for **fTPM** (AMD), **PTT** (Intel Platform Trust Technology), or **Security Device**
3. Enable → Save → Restart
4. Verify: `Win + R` → `tpm.msc` → should show **TPM is ready for use**

If this works, Windows 11 installs normally — no workarounds needed.

---

## Method 2: Rufus with Bypass (Recommended)

Rufus can create a Windows 11 USB with TPM and Secure Boot checks disabled:

1. Download **Rufus** from rufus.ie or `winget install Rufus.Rufus`
2. Insert USB (min. 8 GB)
3. In Rufus → click **Download** next to Boot selection → download Windows 11 ISO directly
4. Click **Start** → a dialog appears with options:
   - ✅ **Remove requirement for TPM 2.0**
   - ✅ **Remove requirement for Secure Boot**
   - ✅ **Remove requirement for 4GB+ RAM** (optional)
5. Click OK → Rufus writes the USB

Boot from the USB and install normally.

---

## Method 3: Registry Workaround During Setup

When the "This PC can't run Windows 11" screen appears during setup:

1. Press `Shift + F10` → CMD opens
2. Type `regedit` → Registry Editor opens
3. Navigate to `HKEY_LOCAL_MACHINE\SYSTEM\Setup\MoSetup`
4. Create the key if it doesn't exist
5. Create a DWORD value: `AllowUpgradesWithUnsupportedTPMOrCPU` = `1`
6. Close regedit and CMD → continue setup

This method works for in-place upgrades from Windows 10.

---

## Check Requirements Before Installing

```powershell
# TPM status
Get-Tpm | Select-Object TpmPresent, TpmReady

# Secure Boot
Confirm-SecureBootUEFI

# RAM
[math]::Round((Get-WmiObject Win32_ComputerSystem).TotalPhysicalMemory/1GB, 1)

# CPU name (check compatibility at aka.ms/CPUlist)
(Get-WmiObject Win32_Processor).Name
```

Or use Microsoft's official **PC Health Check** app.

---

## What to Expect on Unsupported Hardware

Microsoft officially states that unsupported PCs **may not receive future updates**. In practice, updates have continued arriving — but this could change. For very old hardware (pre-2012), consider **Linux Mint** as a free, Windows-like alternative with 5 years of support.

---

## Summary

**If your CPU has fTPM/PTT** — enable it in BIOS, problem solved. **Otherwise** — use Rufus with bypass: fastest, most reliable method. **For in-place upgrade from Windows 10** — registry method. After installing on unsupported hardware, monitor Windows Update to ensure updates continue arriving.
