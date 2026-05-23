---
title: "How to Install Windows 11 Without TPM 2.0 and Secure Boot (2026)"
date: "2024-05-01"
publishDate: "2024-05-01"
updated: "2026-05-23"
description: "Three methods to install Windows 11 without TPM 2.0 and Secure Boot: enable fTPM in BIOS, use Rufus bypass, or registry workaround. Works on any PC in 2025-2026."
tags: ["windows", "installation", "bios", "settings"]
translatesUk: "yak-vstanovyty-windows-11-bez-tpm"
readTime: 6
---

Windows 11 officially requires TPM 2.0, Secure Boot, and a supported CPU. But you can bypass these requirements and install it on any PC. Here are the three most reliable methods in 2026.

---

## Check Why Your PC Fails

Run the official check first:

```powershell
# Check TPM
Get-Tpm | Select-Object TpmPresent, TpmReady

# Check Secure Boot
Confirm-SecureBootUEFI

# Check RAM
[math]::Round((Get-WmiObject Win32_ComputerSystem).TotalPhysicalMemory/1GB, 1)

# CPU name
(Get-WmiObject Win32_Processor).Name
```

Or download **PC Health Check** from Microsoft for a GUI result.

---

## Method 1: Enable fTPM in BIOS (Try First)

Many older CPUs have a built-in TPM that's simply turned off in BIOS:

1. Restart → press **Del**, **F2**, or **F12** to enter BIOS
2. Look for one of these options:
   - **AMD fTPM** (AMD CPUs)
   - **Intel PTT** — Platform Trust Technology (Intel CPUs)
   - **Security Device** or **TPM Device**
3. Set to **Enabled**
4. Save and restart
5. Verify: `Win + R` → `tpm.msc` → should show **TPM is ready for use**

**This works for most PCs from 2016+.** If it shows "TPM ready" — install Windows 11 normally, no other workarounds needed.

---

## Method 2: Rufus with Bypass (Recommended for Clean Install)

Rufus creates a Windows 11 USB with TPM and Secure Boot checks disabled:

**Step 1:** Install Rufus
```powershell
winget install Rufus.Rufus
```
Or download from [rufus.ie](https://rufus.ie)

**Step 2:** Insert USB (minimum 8 GB)

**Step 3:** In Rufus:
- Boot selection: click **Download** → select Windows 11 → download the ISO directly

**Step 4:** Click **Start** → a dialog appears:
- ✅ **Remove requirement for TPM 2.0**
- ✅ **Remove requirement for Secure Boot**
- ✅ **Remove requirement for 4GB+ RAM** (optional)
- ✅ **Create a local account** (skips Microsoft account requirement)

**Step 5:** Click OK → wait for Rufus to write the USB

**Step 6:** Boot from USB → install Windows 11 normally

This is the most reliable method for a clean install on unsupported hardware.

---

## Method 3: Registry Bypass During In-Place Upgrade

Use this when upgrading from Windows 10 without clean install:

**When the "This PC can't run Windows 11" screen appears:**

1. Press `Shift + F10` → Command Prompt opens
2. Type `regedit` → Enter
3. Navigate to: `HKEY_LOCAL_MACHINE\SYSTEM\Setup\MoSetup`
4. If the key doesn't exist: right-click **Setup** → **New** → **Key** → name it `MoSetup`
5. Right-click `MoSetup` → **New** → **DWORD (32-bit) Value**
6. Name: `AllowUpgradesWithUnsupportedTPMOrCPU`
7. Value: `1`
8. Close regedit and CMD → click **Refresh** on the compatibility screen → proceed

---

## Method 4: Skip TPM Check via appraiserres.dll

For ISO-based installation when Rufus isn't available:

```cmd
rem After mounting/extracting the Windows 11 ISO
rem Run setup with compatibility check disabled
setup.exe /product-key XXXXX-XXXXX-XXXXX-XXXXX-XXXXX /compat IgnoreWarning
```

---

## After Installing on Unsupported Hardware

```powershell
# Verify Windows 11 is installed
(Get-WmiObject Win32_OperatingSystem).Caption

# Check if updates are coming through
(New-Object -ComObject Microsoft.Update.SystemInfo).RebootRequired
```

Microsoft officially states unsupported PCs **may not receive future updates**. In practice, updates continue arriving — but monitor this quarterly.

---

## Which Method to Use

| Situation | Best method |
|-----------|------------|
| CPU from 2016+, fTPM just disabled | Method 1 (BIOS) |
| Clean install on old hardware | Method 2 (Rufus) |
| Upgrading from Windows 10 | Method 3 (Registry) |
| No USB available | Method 4 (setup.exe) |

---

---

**Читай також:**
- [speed up Windows 11](/en/how-to-speed-up-windows-11)
- [control Windows Update](/en/how-to-configure-windows-update-policies)

## Summary

**First:** try enabling fTPM/PTT in BIOS — this fixes most cases instantly. **For clean install:** Rufus with bypass options is the most reliable. **For upgrade from Windows 10:** registry key `AllowUpgradesWithUnsupportedTPMOrCPU = 1`. All methods work on Windows 11 23H2 and 24H2 in 2026.
