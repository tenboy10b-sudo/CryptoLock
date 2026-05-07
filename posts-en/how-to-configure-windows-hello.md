---
title: "How to Set Up Windows Hello: Fingerprint, Face, and PIN Login"
date: "2026-07-04"
publishDate: "2026-07-04"
description: "Set up Windows Hello for fast, secure login without typing a password. Configure fingerprint reader, facial recognition, or PIN — and fix common Windows Hello problems."
tags: ["windows", "security", "accounts", "tools"]
readTime: 5
---

Windows Hello lets you sign in with a fingerprint, face scan, or PIN instead of typing your password every time. It's faster, more secure than passwords, and the biometric data never leaves your PC.

---

## Why Windows Hello Is More Secure Than Passwords

- Biometric data is stored in a secure enclave (TPM chip) — never uploaded to Microsoft
- PIN is device-specific — even if someone knows your PIN, they can't use it on another PC
- Face/fingerprint can't be guessed, phished, or leaked in database breaches

---

## Requirements

- **PIN**: works on any PC
- **Fingerprint**: requires a fingerprint sensor (built-in or USB)
- **Face recognition**: requires an IR camera (not regular webcam) — most modern laptops have one, most desktops don't

---

## Set Up PIN

`Win + I` → **Accounts** → **Sign-in options** → **PIN (Windows Hello)** → **Set up**

Enter your current account password to verify → set a 4+ digit PIN.

For a more complex PIN: check **Include letters and symbols** — allows passphrase-style PINs like `BlueSky42!`

PIN is required as a fallback — you'll need it if biometrics fail or after reboot.

---

## Set Up Fingerprint

`Win + I` → **Accounts** → **Sign-in options** → **Fingerprint recognition (Windows Hello)** → **Set up**

- Follow prompts: place your finger repeatedly at different angles
- Add multiple fingers — especially one from each hand
- Re-scan if recognition feels inconsistent

```powershell
# Check if fingerprint sensor is detected
Get-PnpDevice | Where-Object {$_.FriendlyName -like "*fingerprint*"}
```

---

## Set Up Face Recognition

`Win + I` → **Accounts** → **Sign-in options** → **Facial recognition (Windows Hello)** → **Set up**

Look directly at the camera, follow the guide. Takes 10–15 seconds.

**Improve recognition with glasses:**
After initial setup, click **Improve recognition** → complete the scan wearing glasses. Windows stores both profiles.

---

## Require Windows Hello (Disable Password Login)

To prevent signing in with just a password:

`Win + I` → **Accounts** → **Sign-in options** → enable **For improved security, only allow Windows Hello sign-in for Microsoft accounts on this device**

---

## Manage Windows Hello via PowerShell

```powershell
# Check Windows Hello status
$ngcPath = "$env:LOCALAPPDATA\Microsoft\Ngc"
if (Test-Path $ngcPath) {
  "Windows Hello is configured"
  Get-ChildItem $ngcPath
} else {
  "Windows Hello not set up"
}

# Check TPM (required for Windows Hello)
Get-Tpm | Select-Object TpmPresent, TpmEnabled, TpmReady

# Check if PIN is set
$pinPath = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\PasswordLess\Device"
(Get-ItemProperty $pinPath -ErrorAction SilentlyContinue).DevicePasswordLessBuildVersion
```

---

## Troubleshooting

**"Windows Hello isn't available on this device":**
TPM is required. Check in BIOS: enable fTPM (AMD) or PTT (Intel).

```powershell
# Verify TPM
Get-Tpm
```

**Fingerprint not recognized reliably:**
- Clean the sensor with a dry cloth
- Delete and re-enroll the finger: Sign-in options → Fingerprint → **Remove** → Set up again
- Scan from multiple angles including slightly tilted

**Face recognition fails in different lighting:**
- Add an improved recognition scan
- Clean the IR camera lens
- Update camera driver

**PIN forgotten:**
Sign in with your Microsoft account password → Sign-in options → PIN → **I forgot my PIN** → reset it

**Windows Hello options greyed out:**
Group Policy may be blocking it. Check:
```powershell
Get-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\PassportForWork" -ErrorAction SilentlyContinue
```
If `Enabled = 0` — an administrator has disabled Windows Hello via policy.

---

## Dynamic Lock

Automatically locks your PC when you walk away with your paired phone.

`Win + I` → **Accounts** → **Sign-in options** → **Dynamic lock** → pair your phone via Bluetooth → enable.

When your phone moves out of Bluetooth range, Windows locks after ~30 seconds.

---

## Summary

Set up PIN first (required as fallback), then add fingerprint or face based on available hardware. For maximum security: enable **only allow Windows Hello sign-in** option. For automatic locking: configure Dynamic Lock with your phone.
