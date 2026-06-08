---
title: "How to Activate Windows 10 and 11: All Methods — Key, Digital License, Phone"
date: "2026-06-08"
publishDate: "2027-02-13"
updated: "2026-06-08"
description: "How to activate Windows 10 and 11 using a product key, digital license, or phone activation. Check activation status, fix errors 0xC004F213 and 0x803F7001."
tags: ["windows", "activation", "license", "settings"]
readTime: 6
translatesUk: "aktyvatsiya-windows-10-11-vsi-sposoby"
---

Windows activation confirms your copy is genuine and not used on other devices. Without activation, some features are unavailable — like desktop personalization.

---

## Check Activation Status

```powershell
# Quick check
slmgr /xpr

# Detailed info
slmgr /dlv
```

Or: **Settings → System → Activation**

---

## Method 1 — Product Key (25 characters)

If you have a key in format `XXXXX-XXXXX-XXXXX-XXXXX-XXXXX`:

**Via Settings:**
1. `Win + I` → **System → Activation**
2. **"Change product key"**
3. Enter the key → **"Next"** → **"Activate"**

**Via Command Prompt (as administrator):**
```powershell
slmgr /ipk XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
slmgr /ato
```

---

## Method 2 — Digital License (automatic)

If Windows was previously activated on this PC, it will activate automatically after reinstallation. The digital license is tied to your hardware.

**If it didn't activate automatically:**
1. `Win + I` → **System → Activation**
2. **"Troubleshoot activation"**
3. **"I changed hardware on this device recently"**
4. Sign in to the Microsoft account linked to the license

---

## Method 3 — Phone Activation

For volume licenses or when internet activation fails:

```cmd
slui 4
```

1. Select your country → **"Next"**
2. Call the toll-free Microsoft number
3. Read the **Installation ID** (54 digits)
4. Receive the **Confirmation ID**
5. Enter it in the wizard

---

## Method 4 — Link to Microsoft Account

Link your license to an account — so you can reactivate on a new PC:

1. `Win + I` → **System → Activation**
2. **"Add a Microsoft account"**
3. Sign in or create an account

---

## Fixing Activation Errors

### Error 0xC004F213 — key doesn't match edition
A Windows Home key won't work on Windows Pro. Check your edition:
```powershell
Get-WindowsEdition -Online
```

### Error 0x803F7001 — no product key found
```powershell
# Check embedded BIOS key
wmic path SoftwareLicensingService get OA3xOriginalProductKey
```

### Error 0xC004C003 — blocked key
The key is used on too many devices. Contact Microsoft Support.

---

## Summary

| Situation | Solution |
|-----------|---------|
| Have a product key | `slmgr /ipk key` → `slmgr /ato` |
| Reinstall on same PC | Automatic or Troubleshoot |
| Have Microsoft account with license | Settings → Activation → Sign in |
| No internet | `slui 4` → phone activation |
