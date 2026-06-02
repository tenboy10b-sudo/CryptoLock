---
title: "How to Enable BitLocker Without TPM in Windows 10 and 11"
date: "2026-03-06"
publishDate: "2026-03-06"
description: "Enable BitLocker drive encryption on PCs without a TPM chip using Group Policy. Step-by-step guide for Windows 10 and 11 Home and Pro editions."
tags: ["windows", "security", "bitlocker", "encryption"]
readTime: 5
---

BitLocker normally requires a TPM (Trusted Platform Module) chip. But you can enable it without TPM using a Group Policy tweak — the drive will be unlocked with a USB key or password at startup instead.

---

## Check If You Have TPM

```powershell
Get-Tpm | Select-Object TpmPresent, TpmReady
```

If `TpmPresent: False` — you don't have TPM, or it's disabled. Check BIOS first — many PCs have TPM disabled by default (look for fTPM, PTT, or TPM settings).

---

## Enable BitLocker Without TPM (Pro and Enterprise)

**Step 1: Configure Group Policy**

`Win + R` → `gpedit.msc`

Navigate to:
```
Computer Configuration → Administrative Templates →
Windows Components → BitLocker Drive Encryption →
Operating System Drives
```

Double-click **Require additional authentication at startup** → **Enabled**

Under options, check:
- **Allow BitLocker without a compatible TPM** ✅
- **Configure TPM startup**: **Allow TPM**
- **Configure TPM startup PIN**: **Allow startup PIN with TPM**
- **Configure TPM startup key**: **Allow startup key with TPM**
- **Configure TPM startup key and PIN**: **Allow startup key and PIN with TPM**

Click **OK**.

---

**Step 2: Enable BitLocker**

`Win + S` → **Manage BitLocker** → click **Turn on BitLocker** for drive C:

Since there's no TPM, Windows will ask how to unlock at startup:
- **Insert a USB flash drive** — you'll need this USB to boot
- **Enter a password** — type a password every time Windows starts (recommended for most users)

Choose **Enter a password** → enter a strong password → **Next**

**Step 3: Save Recovery Key**

Save to your Microsoft account, a file, or print it. **Do not lose this.** Without it and without your password, the drive is permanently locked.

**Step 4: Choose encryption scope**

- **Encrypt used disk space only** — faster, good for new drives
- **Encrypt entire drive** — more thorough, better for drives already in use

**Step 5: Run the compatibility check**

BitLocker runs a system check before encrypting. Leave **Run BitLocker system check** enabled → **Continue** → restart.

After restart: BitLocker starts encrypting. You can use the PC normally during this process.

---

## Check Encryption Status

```powershell
Get-BitLockerVolume -MountPoint C: |
  Select-Object MountPoint, EncryptionPercentage, ProtectionStatus, VolumeStatus
```

**ProtectionStatus: On** = encrypted and protected.

---

## Enable on Windows Home

`gpedit.msc` is not available on Windows Home. Options:

**Option 1: Use Device Encryption** (if supported)
`Win + I` → **Privacy & Security** → **Device encryption** — simpler version of BitLocker, available on some Home editions if hardware supports it.

**Option 2: VeraCrypt** (free, open source)
Download from [veracrypt.fr](https://www.veracrypt.fr) — encrypts the system drive similarly to BitLocker, works on all Windows editions.

---

## Suspend BitLocker Temporarily

Before BIOS updates or hardware changes, suspend BitLocker to avoid recovery key prompts:

```powershell
Suspend-BitLocker -MountPoint C: -RebootCount 1
```

BitLocker resumes automatically after the next restart.

---

## Remove BitLocker

```powershell
Disable-BitLocker -MountPoint C:
```

Decryption runs in the background — takes same time as encryption. PC usable during the process.

---


---


## Summary

`gpedit.msc` → Require additional authentication at startup → check **Allow BitLocker without TPM** → then enable BitLocker normally and choose password unlock. Save the recovery key somewhere safe — losing both the password and recovery key means permanent data loss.
