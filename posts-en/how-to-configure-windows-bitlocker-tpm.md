---
title: "How to Enable BitLocker with TPM on Windows 10 and 11 Pro"
date: "2026-04-27"
publishDate: "2026-04-27"
description: "Enable BitLocker drive encryption on Windows 10 and 11 Pro with TPM. Step-by-step: check TPM, enable BitLocker, save recovery key, and verify encryption status."
tags: ["windows", "security", "bitlocker", "encryption"]
readTime: 5
---

BitLocker encrypts your entire drive — if someone takes your laptop or hard drive, they can't read the data without your Windows login. Here's how to enable it properly with TPM.

---

## Prerequisites

- Windows 10/11 **Pro, Enterprise, or Education** (not Home)
- TPM 2.0 chip (check with `Get-Tpm` in PowerShell)
- UEFI firmware with Secure Boot (recommended)

```powershell
# Check TPM
Get-Tpm | Select-Object TpmPresent, TpmReady, ManufacturerId

# Check current BitLocker status
Get-BitLockerVolume -MountPoint C: | Select-Object MountPoint, VolumeStatus, ProtectionStatus
```

---

## Enable BitLocker via Settings

`Win + I` → **System** → **Storage** → **BitLocker drive encryption** → **Turn on BitLocker**

Or: `Win + S` → **Manage BitLocker** → **Turn on BitLocker** for Drive C:

---

## Save the Recovery Key

Windows presents four options — choose at least one:
1. **Save to your Microsoft account** (recommended — accessible from any device)
2. **Save to a USB flash drive** — keep it separate from the PC
3. **Save to a file** — store on a different drive or cloud
4. **Print the recovery key** — paper copy in a safe place

**Never lose this key.** Without it and without your password, the data is permanently inaccessible.

---

## Enable via PowerShell

```powershell
# Enable BitLocker with TPM only (no PIN — auto-unlocks on this hardware)
Enable-BitLocker -MountPoint C: -TpmProtector

# Enable with TPM + PIN (more secure — asks for PIN at boot)
$pin = Read-Host "Enter PIN" -AsSecureString
Enable-BitLocker -MountPoint C: -TpmAndPinProtector -Pin $pin

# Add recovery password protector
Add-BitLockerKeyProtector -MountPoint C: -RecoveryPasswordProtector

# Back up recovery key to Microsoft account
$keyProtectorId = (Get-BitLockerVolume C:).KeyProtector |
  Where-Object {$_.KeyProtectorType -eq 'RecoveryPassword'} |
  Select-Object -ExpandProperty KeyProtectorId
BackupToAAD-BitLockerKeyProtector -MountPoint C: -KeyProtectorId $keyProtectorId
```

---

## Monitor Encryption Progress

Encryption runs in the background and takes 30 minutes to several hours depending on drive size and speed:

```powershell
# Check encryption progress
while ($true) {
  $vol = Get-BitLockerVolume -MountPoint C:
  Write-Host "$($vol.EncryptionPercentage)% encrypted | Status: $($vol.VolumeStatus)"
  if ($vol.VolumeStatus -eq 'FullyEncrypted') { break }
  Start-Sleep 10
}
```

The PC is fully usable during encryption.

---

## Encrypt Additional Drives

```powershell
# Encrypt D: drive with password
$pass = Read-Host "Password for D:" -AsSecureString
Enable-BitLocker -MountPoint D: -PasswordProtector -Password $pass

# Encrypt removable USB drive (BitLocker To Go)
Enable-BitLocker -MountPoint E: -PasswordProtector

# Check all volumes
Get-BitLockerVolume | Select-Object MountPoint, VolumeStatus, ProtectionStatus, EncryptionPercentage
```

---

## Auto-Unlock Additional Drives

So you don't need to enter the password for D: every time C: is unlocked:

```powershell
# Enable auto-unlock for D: when C: is unlocked
Enable-BitLockerAutoUnlock -MountPoint D:

# Check auto-unlock status
Get-BitLockerVolume D: | Select-Object AutoUnlockEnabled
```

---

## Suspend BitLocker Temporarily

Before BIOS updates or hardware changes:

```powershell
# Suspend for 1 reboot (re-enables automatically)
Suspend-BitLocker -MountPoint C: -RebootCount 1

# Resume immediately
Resume-BitLocker -MountPoint C:
```

---

## Verify Everything is Correct

```powershell
# Full status check
Get-BitLockerVolume | Format-List MountPoint, VolumeStatus, ProtectionStatus,
  EncryptionMethod, EncryptionPercentage,
  @{n='Protectors';e={$_.KeyProtector.KeyProtectorType -join ', '}}

# Confirm recovery key is saved to Microsoft account
# Visit: account.microsoft.com/devices/recoverykey
```

---

## BitLocker with Network Unlock (Enterprise)

For domain-joined PCs that should unlock automatically on the corporate network:

```powershell
# Requires AD CS with Network Unlock certificate
# And WDS server on the network
# Add network key protector
Add-BitLockerKeyProtector -MountPoint C: -ADAccountOrGroupProtector `
  -ADAccountOrGroup "DOMAIN\BitLockerGroup"
```

---


---

## 🛡️ Перевір безпеку свого ПК

Хочеш знати чи немає витоків даних, зайвих служб або підозрілих програм на твоєму ПК?

**[→ AuditShield](/tools/auditshield)** — аудит Windows по 22 напрямках за 10 хвилин. HTML-звіт з оцінкою ризику. Є безкоштовне демо.


## Summary

Enable via Settings or `Enable-BitLocker -MountPoint C: -TpmProtector`. Always save recovery key to Microsoft account and a second location. Add recovery password protector with `Add-BitLockerKeyProtector -RecoveryPasswordProtector`. Suspend before BIOS changes. Verify at `account.microsoft.com/devices/recoverykey`.
