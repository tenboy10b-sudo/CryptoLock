---
title: "How to Manage BitLocker Recovery Keys and Unlock Encrypted Drives"
date: "2026-06-23"
publishDate: "2026-06-23"
description: "Manage BitLocker recovery keys — back up to Active Directory, Microsoft account or file. Recover encrypted drives, rotate keys and troubleshoot BitLocker issues."
tags: ["windows", "bitlocker", "encryption", "security", "recovery", "powershell"]
readTime: 5
translatesUk: "bitlocker-klyuchi-vidnovlennya"
---

BitLocker locks you out if it detects hardware changes or you forget your PIN. Here's how to manage recovery keys and unlock encrypted drives.

---

## Back Up Recovery Key

```powershell
# View recovery key for C:
$keyProtectors = (Get-BitLockerVolume -MountPoint "C:").KeyProtector
$recoveryKey = $keyProtectors | Where-Object {$_.KeyProtectorType -eq "RecoveryPassword"}
Write-Host "Recovery Key ID: $($recoveryKey.KeyProtectorId)"
Write-Host "Recovery Password: $($recoveryKey.RecoveryPassword)"

# Save to file
$recoveryKey.RecoveryPassword | Out-File "D:\BitLocker-Recovery-$(hostname).txt"

# Back up to Active Directory (domain environment)
BackupToAAD-BitLockerKeyProtector -MountPoint "C:" `
  -KeyProtectorId $recoveryKey.KeyProtectorId

# Verify backup
Get-BitLockerVolume -MountPoint "C:" |
  Select-Object MountPoint, VolumeStatus, ProtectionStatus
```

---

## Add Recovery Key After Encryption

```powershell
# Add additional recovery password (in case primary is lost)
Add-BitLockerKeyProtector -MountPoint "C:" -RecoveryPasswordProtector

# Add USB key protector
Add-BitLockerKeyProtector -MountPoint "C:" -StartupKeyProtector `
  -StartupKeyPath "E:\"  # E: is the USB drive

# View all key protectors
(Get-BitLockerVolume -MountPoint "C:").KeyProtector |
  Select-Object KeyProtectorType, KeyProtectorId
```

---

## Unlock BitLocker Drive

```powershell
# Unlock with recovery password
Unlock-BitLocker -MountPoint "D:" `
  -RecoveryPassword "123456-654321-123456-654321-123456-654321-123456-123456"

# Unlock with recovery key file
Unlock-BitLocker -MountPoint "D:" `
  -RecoveryKeyPath "E:\BitLocker-Recovery.bek"

# Unlock with password
Unlock-BitLocker -MountPoint "D:" `
  -Password (ConvertTo-SecureString "YourPassword" -AsPlainText -Force)
```

---

## Recover from BitLocker Recovery Screen

If Windows shows the BitLocker recovery screen at boot:

1. **Find your recovery key** — check:
   - Microsoft account: account.microsoft.com/devices/recoverykey
   - Active Directory: `Get-BitLockerVolume` on another domain PC
   - File backup
   - Azure AD: Azure portal → Devices

2. **Enter 48-digit recovery key** when prompted

3. **After login, investigate cause:**
   ```powershell
   # Why did BitLocker trigger recovery?
   manage-bde -protectors -get C:
   Get-BitLockerVolume C: | Select-Object *
   ```

---

## Rotate (Change) Recovery Key

After using a recovery key, rotate it to prevent unauthorized use:

```powershell
# Remove old recovery password protector
$oldKey = (Get-BitLockerVolume "C:").KeyProtector |
  Where-Object {$_.KeyProtectorType -eq "RecoveryPassword"}
Remove-BitLockerKeyProtector -MountPoint "C:" `
  -KeyProtectorId $oldKey.KeyProtectorId

# Add new recovery password
Add-BitLockerKeyProtector -MountPoint "C:" -RecoveryPasswordProtector

# Back up new key
$newKey = (Get-BitLockerVolume "C:").KeyProtector |
  Where-Object {$_.KeyProtectorType -eq "RecoveryPassword"}
$newKey.RecoveryPassword | Out-File "D:\BitLocker-Recovery-$(Get-Date -Format yyyyMMdd).txt"
```

---

## Check BitLocker Status on All Drives

```powershell
Get-BitLockerVolume | Select-Object MountPoint, VolumeStatus,
  ProtectionStatus, EncryptionPercentage,
  @{n='Key Protectors';e={($_.KeyProtector | Select-Object -ExpandProperty KeyProtectorType) -join ', '}}
```

---

## Summary

Always save recovery key in at least 3 places: Microsoft account + printed copy + secure file. Back up to Active Directory with `BackupToAAD-BitLockerKeyProtector`. Rotate recovery key after any recovery event. Use `manage-bde` for command-line management.

## Frequently Asked Questions

### BitLocker recovery screen appears after every BIOS update — how to prevent?

Suspend BitLocker before BIOS update: `Suspend-BitLocker -MountPoint "C:" -RebootCount 1`. This lets the BIOS update without triggering recovery mode.

### I have the recovery key but BitLocker still won't unlock — why?

Ensure you're entering the correct 48-digit key for the specific drive. Each drive has a unique key — the Key ID shown on screen must match. Also check if the drive itself has failed.

### Can I decrypt a BitLocker drive on a different PC?

Yes — use the recovery key to unlock, then disable BitLocker: `Disable-BitLocker -MountPoint "D:"`. Or keep it encrypted and just access it with the recovery password.
