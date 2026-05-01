---
title: "How to Enable BitLocker Drive Encryption in Windows 10 and 11"
date: "2026-04-03"
publishDate: "2026-04-03"
description: "Step-by-step guide to enabling BitLocker disk encryption in Windows 10 and 11: TPM requirements, recovery key backup, and encrypting external drives with BitLocker To Go."
tags: ["windows", "security", "bitlocker", "encryption"]
readTime: 5
---

BitLocker encrypts your entire drive — if your laptop is stolen, the data is unreadable without your password. Here's how to enable it.

---

## Requirements

- Windows 10/11 Pro, Enterprise, or Education (not Home)
- TPM 2.0 chip (most PCs since 2016 have it)

Check TPM:
```powershell
Get-Tpm | Select-Object TpmPresent, TpmReady
```

If `TpmPresent = True` — you're good. If not — enable TPM in BIOS.

---

## Enable BitLocker via GUI

1. `Win + S` → search "Manage BitLocker"
2. Click **Turn on BitLocker** next to drive C:
3. Choose how to unlock: **TPM** (automatic) or **Password**
4. **Save recovery key** — choose **Save to Microsoft account** or **Save to a file**
   - Never lose this key — it's your only recovery option
5. Choose **Encrypt used disk space only** (faster for new PCs) or **Encrypt entire drive** (more secure)
6. Click **Start encrypting**

Encryption takes 30 minutes to several hours depending on drive size.

---

## Enable via PowerShell

```powershell
# Encrypt drive C with TPM
Enable-BitLocker -MountPoint "C:" -EncryptionMethod XtsAes256 -TpmProtector

# Check encryption status
Get-BitLockerVolume -MountPoint C: | Select-Object MountPoint, EncryptionMethod, ProtectionStatus, EncryptionPercentage
```

---

## Backup Recovery Key

```powershell
# Backup to Active Directory (domain environments)
$keyProtectorId = (Get-BitLockerVolume C:).KeyProtector[0].KeyProtectorId
Backup-BitLockerKeyProtector -MountPoint "C:" -KeyProtectorId $keyProtectorId
```

Store the recovery key in a safe place — NOT on the encrypted drive itself.

---

## Encrypt External Drive (BitLocker To Go)

Works on USB drives and external HDDs.

1. Connect the drive
2. Right-click it in File Explorer → **Turn on BitLocker**
3. Set a password
4. Save recovery key
5. Click **Start encrypting**

The drive can be read on any Windows PC — just enter the password when prompted.

---

## Check Encryption Status

```powershell
Get-BitLockerVolume | Select-Object MountPoint, EncryptionMethod, ProtectionStatus
```

- `ProtectionStatus: On` — drive is protected
- `ProtectionStatus: Off` — encryption is paused (normal during Windows updates)

---

## Summary

`Manage BitLocker` → Turn on → save recovery key → start encrypting. Use `XtsAes256` for strongest encryption. Always backup the recovery key — without it, encrypted data is permanently inaccessible.
