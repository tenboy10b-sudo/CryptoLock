---
title: "How to Enable BitLocker Drive Encryption in Windows 10 and 11"
date: "2026-05-28"
publishDate: "2026-05-28"
description: "Enable BitLocker encryption on Windows 10 and 11 Pro. Encrypt C: drive and external drives, save recovery keys, manage via PowerShell and Group Policy."
tags: ["windows", "bitlocker", "encryption", "security", "powershell"]
readTime: 6
---

BitLocker encrypts your drive — if someone steals the laptop or pulls out the hard drive, the data is unreadable without your PIN or recovery key.

---

## Requirements

- Windows 10/11 **Pro**, **Enterprise**, or **Education** (not Home)
- TPM 2.0 recommended (can bypass with Group Policy)
- Administrator rights

---

## Enable BitLocker via Settings

`Win + I` → **System** → **Storage** → **Advanced storage settings** → **Disks & volumes** → click C: drive → **Properties** → **Turn on BitLocker**

Or: `Control Panel` → **BitLocker Drive Encryption** → **Turn on BitLocker**

---

## Enable BitLocker via PowerShell

```powershell
# Check BitLocker status on all drives
Get-BitLockerVolume | Select-Object MountPoint, VolumeStatus, ProtectionStatus, EncryptionPercentage

# Enable on C: with TPM + PIN
Enable-BitLocker -MountPoint "C:" -EncryptionMethod XtsAes256 `
  -TpmAndPinProtector -Pin (ConvertTo-SecureString "YourPIN" -AsPlainText -Force)

# Enable on C: with password only (no TPM)
Enable-BitLocker -MountPoint "C:" -EncryptionMethod XtsAes256 `
  -PasswordProtector -Password (ConvertTo-SecureString "StrongPassword!" -AsPlainText -Force)

# Encrypt removable USB drive
Enable-BitLocker -MountPoint "E:" -EncryptionMethod XtsAes128 `
  -PasswordProtector -Password (ConvertTo-SecureString "USBPassword!" -AsPlainText -Force)
```

---

## Save the Recovery Key

**Critical:** Save the recovery key before encryption completes — without it, lost PIN = lost data.

```powershell
# View recovery key
(Get-BitLockerVolume -MountPoint "C:").KeyProtector |
  Where-Object {$_.KeyProtectorType -eq "RecoveryPassword"} |
  Select-Object RecoveryPassword

# Save recovery key to file
$key = (Get-BitLockerVolume -MountPoint "C:").KeyProtector |
  Where-Object {$_.KeyProtectorType -eq "RecoveryPassword"}
$key.RecoveryPassword | Out-File "D:\BitLocker-Recovery-Key.txt"

# Back up to Azure AD / Microsoft account
BackupToAAD-BitLockerKeyProtector -MountPoint "C:" -KeyProtectorId $key.KeyProtectorId
```

---

## Enable BitLocker Without TPM (Group Policy)

On PCs without TPM 2.0:

`gpedit.msc` → `Computer Configuration` → `Administrative Templates` → `Windows Components` → `BitLocker Drive Encryption` → `Operating System Drives`

- **Require additional authentication at startup** → Enabled
- Check **Allow BitLocker without a compatible TPM**

Then enable BitLocker via Control Panel — it will prompt for a startup password instead of TPM.

---

## Manage BitLocker

```powershell
# Suspend BitLocker (for BIOS update, etc.)
Suspend-BitLocker -MountPoint "C:" -RebootCount 1

# Resume protection
Resume-BitLocker -MountPoint "C:"

# Lock a drive
Lock-BitLocker -MountPoint "E:" -ForceDismount

# Unlock with recovery key
Unlock-BitLocker -MountPoint "E:" -RecoveryPassword "123456-654321-..."

# Disable BitLocker (decrypts drive)
Disable-BitLocker -MountPoint "C:"
```

---

## BitLocker via Command Line

```cmd
REM Check status
manage-bde -status C:

REM Enable with recovery password
manage-bde -on C: -RecoveryPassword -SkipHardwareTest

REM Get recovery key
manage-bde -protectors -get C:

REM Disable
manage-bde -off C:
```

---

## Summary

Enable via Control Panel or `Enable-BitLocker`. Always save the recovery key to a safe location — not on the encrypted drive. Use XtsAes256 for maximum security. Suspend before BIOS updates to avoid recovery key prompts.

## Frequently Asked Questions

### Does BitLocker slow down my PC?

On modern CPUs with AES-NI hardware acceleration: negligible impact (1-3%). On very old CPUs without hardware acceleration: up to 10% in heavy disk I/O workloads.

### What happens if I forget my BitLocker PIN?

You need the recovery key. Without both the PIN and the recovery key, the data is permanently inaccessible. Always save recovery keys to Microsoft account, USB drive and printed copy.

### Can I enable BitLocker on Windows 11 Home?

No. BitLocker is Pro/Enterprise only. Windows 11 Home has a limited version called "Device Encryption" — check Settings → Privacy & Security → Device encryption. It requires a Microsoft account.
