---
title: "Ключі відновлення BitLocker: резервна копія і розблокування дисків"
date: "2026-07-31"
publishDate: "2026-07-31"
description: "Управління ключами відновлення BitLocker — резервна копія в AD, Microsoft акаунт або файл. Відновлення зашифрованих дисків і ротація ключів."
tags: ["windows", "bitlocker", "шифрування", "безпека", "відновлення", "powershell"]
readTime: 4
translatesEn: "how-to-configure-windows-bitlocker-recovery"
---

BitLocker блокує доступ якщо виявляє зміни заліза або ти забув PIN. Ось як управляти ключами відновлення.

---

## Переглянути і зберегти ключ відновлення

```powershell
$keyProtectors = (Get-BitLockerVolume -MountPoint "C:").KeyProtector
$recoveryKey = $keyProtectors | Where-Object {$_.KeyProtectorType -eq "RecoveryPassword"}
Write-Host "Ключ: $($recoveryKey.RecoveryPassword)"

# Зберегти у файл
$recoveryKey.RecoveryPassword | Out-File "D:\BitLocker-Recovery-$(hostname).txt"
```

---

## Розблокувати диск

```powershell
# Ключем відновлення
Unlock-BitLocker -MountPoint "D:" `
  -RecoveryPassword "123456-654321-123456-654321-123456-654321-123456-123456"

# Паролем
Unlock-BitLocker -MountPoint "D:" `
  -Password (ConvertTo-SecureString "YourPassword" -AsPlainText -Force)
```

---

## Після відновлення — змінити ключ

```powershell
# Видалити старий ключ відновлення
$oldKey = (Get-BitLockerVolume "C:").KeyProtector |
  Where-Object {$_.KeyProtectorType -eq "RecoveryPassword"}
Remove-BitLockerKeyProtector -MountPoint "C:" -KeyProtectorId $oldKey.KeyProtectorId

# Додати новий
Add-BitLockerKeyProtector -MountPoint "C:" -RecoveryPasswordProtector

# Зберегти новий ключ
$newKey = (Get-BitLockerVolume "C:").KeyProtector |
  Where-Object {$_.KeyProtectorType -eq "RecoveryPassword"}
$newKey.RecoveryPassword | Out-File "D:\BitLocker-Recovery-$(Get-Date -Format yyyyMMdd).txt"
```

---

## Перевірити стан BitLocker

```powershell
Get-BitLockerVolume | Select-Object MountPoint, VolumeStatus,
  ProtectionStatus, EncryptionPercentage
```

---

## Часті питання

### Екран відновлення після кожного оновлення BIOS?

Призупини BitLocker перед оновленням: `Suspend-BitLocker -MountPoint "C:" -RebootCount 1`.

### Маю ключ але BitLocker не розблоковується?

Переконайся що вводиш правильний 48-значний ключ для конкретного диску. ID ключа на екрані має збігатись. Кожен диск має унікальний ключ.

---

## Резюме

Зберігай ключ у 3 місцях: Microsoft акаунт + роздруківка + файл. Резервна копія в AD через `BackupToAAD-BitLockerKeyProtector`. Ротуй ключ після кожного відновлення.
