---
title: "How to Encrypt a USB Drive in Windows with BitLocker To Go"
date: "2026-05-17"
publishDate: "2026-05-17"
description: "Encrypt a USB flash drive or external hard drive with BitLocker To Go in Windows 10 and 11. Step-by-step setup, password protection, and how to access the drive on other PCs."
tags: ["windows", "security", "bitlocker", "encryption"]
readTime: 5
---

A lost USB drive with unencrypted files is a data breach. BitLocker To Go encrypts the entire drive — without the password, the contents are unreadable.

---

## Requirements

- Windows 10/11 **Pro, Enterprise, or Education** to encrypt
- Any Windows edition (including Home) can **read** an encrypted drive
- USB drive formatted as NTFS, FAT32, or exFAT

---

## Encrypt the Drive

1. Plug in the USB drive
2. Open **File Explorer** → right-click the drive → **Turn on BitLocker**
3. Choose **Use a password to unlock the drive** → enter a strong password
4. **Save the recovery key** — choose where to save it (Microsoft account, file, or print it). Don't skip this.
5. Choose encryption mode: **Compatible mode** (works on older Windows) or **New encryption mode** (faster, Windows 10+ only)
6. Click **Start encrypting**

Encryption takes a few minutes for small drives, longer for large ones. The drive is usable during encryption.

---

## Via PowerShell

```powershell
# Enable BitLocker on drive E:
Enable-BitLocker -MountPoint "E:" `
  -EncryptionMethod Aes256 `
  -Password (ConvertTo-SecureString "YourPassword" -AsPlainText -Force) `
  -PasswordProtector

# Check encryption status
Get-BitLockerVolume -MountPoint "E:" | Select-Object MountPoint, EncryptionPercentage, VolumeStatus
```

---

## Access the Encrypted Drive

On any Windows PC: plug in the drive → File Explorer will prompt for the password → enter it → drive unlocks.

On Windows Home: you can unlock and read the drive but can't encrypt new ones.

**Auto-unlock on your main PC:**
After unlocking once: right-click drive in File Explorer → **Manage BitLocker** → **Turn on auto-unlock**. The drive unlocks automatically when plugged into your PC.

---

## Change or Remove the Password

```powershell
# Change password
$old = ConvertTo-SecureString "OldPassword" -AsPlainText -Force
$new = ConvertTo-SecureString "NewPassword" -AsPlainText -Force
Change-BitLockerPassword -MountPoint "E:" -OldPassword $old -NewPassword $new

# Remove BitLocker encryption
Disable-BitLocker -MountPoint "E:"
```

Or: File Explorer → right-click → **Manage BitLocker** → **Turn off BitLocker**

---

## If You Forget the Password

You need the **recovery key** you saved during setup.

```powershell
# Unlock with recovery key
Unlock-BitLocker -MountPoint "E:" -RecoveryPassword "XXXXXX-XXXXXX-..."
```

Without the password AND the recovery key — the data is permanently inaccessible. There is no backdoor.

---

## BitLocker To Go vs VeraCrypt

| | BitLocker To Go | VeraCrypt |
|---|---|---|
| Built into Windows | ✅ Yes | ❌ No |
| Works on Windows Home | Read only | ✅ Full |
| Works on macOS/Linux | ❌ No | ✅ Yes |
| Open source | ❌ No | ✅ Yes |
| Speed | Fast | Slightly slower |

Use BitLocker if you only use Windows. Use VeraCrypt if you need cross-platform access.

---

## Summary

Right-click the USB drive → Turn on BitLocker → set a strong password → save the recovery key somewhere safe. Use **Compatible mode** if the drive will be used on older PCs. Enable auto-unlock on your main machine so you don't enter the password every time.
