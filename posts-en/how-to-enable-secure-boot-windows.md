---
title: "How to Enable Secure Boot in BIOS for Windows 10 and 11"
date: "2027-02-06"
publishDate: "2027-06-01"
description: "Enable Secure Boot in BIOS/UEFI for Windows 10 and 11. Check current status, switch from Legacy to UEFI mode, convert MBR to GPT without data loss."
tags: ["windows", "bios", "secure-boot", "uefi", "installation"]
readTime: 5
translatesUk: "yak-uvimknuty-secure-boot"
---

Secure Boot prevents unauthorized bootloaders from running at startup. Windows 11 requires it. Here's how to enable it without losing data.

---

## Check Current Secure Boot Status

```powershell
# Check if Secure Boot is enabled
Confirm-SecureBootUEFI

# More details
Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\SecureBoot\State" -EA 0

# Check BIOS mode (UEFI vs Legacy)
$env:firmware_type  # Should show "UEFI"
# Or:
(Get-WmiObject Win32_ComputerSystem).FirmwareType
```

---

## Enter BIOS/UEFI Settings

**Method 1 — Windows:**
`Win + I` → **System** → **Recovery** → **Advanced startup** → **Restart now** → **Troubleshoot** → **Advanced options** → **UEFI Firmware Settings**

**Method 2 — At boot:**
Press `Del`, `F2`, `F12` or `Esc` immediately after power on (depends on manufacturer)

**Method 3 — PowerShell:**
```powershell
# Restart directly into UEFI
shutdown /r /fw /t 0
```

---

## Enable Secure Boot in BIOS

Location varies by manufacturer but typically:

**Intel boards (MSI, ASUS, Gigabyte):**
BIOS → **Security** or **Boot** → **Secure Boot** → **Enabled**

**AMD boards:**
BIOS → **Security** → **Secure Boot Mode** → **Enabled**

If Secure Boot is grayed out:
- Boot Mode must be **UEFI** (not Legacy/CSM)
- Disable **CSM** (Compatibility Support Module) first

---

## Switch from Legacy/CSM to UEFI Mode

**Important:** Before switching, verify your disk uses GPT (not MBR):

```powershell
# Check partition style
Get-Disk | Select-Object Number, PartitionStyle, FriendlyName
```

If **MBR** → convert to GPT first (see below). If already **GPT** → just enable UEFI in BIOS.

---

## Convert MBR to GPT Without Data Loss

```powershell
# Check if conversion is possible
mbr2gpt /validate /disk:0 /allowFullOS

# Convert (requires restart into WinPE or run at startup)
mbr2gpt /convert /disk:0 /allowFullOS
```

If `mbr2gpt` fails:
1. Boot from Windows 11 USB
2. Open CMD (Shift+F10)
3. Run: `mbr2gpt /convert /disk:0`

---

## After Enabling Secure Boot

```powershell
# Verify Secure Boot is now enabled
Confirm-SecureBootUEFI
# Should return True

# Check Windows 11 compatibility
# Run PC Health Check from microsoft.com
```

---

## Troubleshoot Secure Boot Issues

```powershell
# Clear Secure Boot keys and re-enroll (advanced)
# In BIOS: Security → Secure Boot → Clear Secure Boot Keys → Restore Factory Keys

# Check if driver is blocking Secure Boot
Get-WinEvent -FilterHashtable @{LogName='System'; ProviderName='Microsoft-Windows-CodeIntegrity'} `
  -MaxEvents 10 | Select-Object TimeCreated, Message
```

---

## Summary

Check status with `Confirm-SecureBootUEFI`. Enter BIOS with `shutdown /r /fw /t 0`. Disable CSM/Legacy before enabling Secure Boot. Convert MBR to GPT with `mbr2gpt` if needed. Secure Boot must be enabled for Windows 11 — it improves boot security significantly.

## Frequently Asked Questions

### Will enabling Secure Boot erase my data?

No, Secure Boot only affects what can boot the system. Your data and Windows installation are not affected. Switching from CSM to UEFI mode also does not erase data, but converting MBR to GPT with mbr2gpt is required first.

### Secure Boot enabled but Windows 11 still says it's off — why?

Check in Windows, not BIOS: `Confirm-SecureBootUEFI` in PowerShell. Also check `msinfo32` — System Summary → Secure Boot State. Sometimes a BIOS update is needed to properly enable it.

### My old hardware shows Secure Boot option but it's grayed out?

You need to disable CSM (Legacy Mode) first. Find CSM settings in Boot section of BIOS. Disabling CSM enables UEFI-only mode which allows Secure Boot configuration.
