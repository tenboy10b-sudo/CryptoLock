---
title: "Windows 10 and 11 Activation Errors: Error Codes and Step-by-Step Fixes"
date: "2026-06-20"
publishDate: "2027-06-01"
updated: "2026-06-20"
description: "How to fix Windows 10 and 11 activation errors. Error codes 0xC004F213, 0x803F7001, 0xC004C003 explained with solutions. Activate by phone, after hardware change and KMS."
tags: ["windows", "activation", "license", "fix", "settings"]
readTime: 8
translatesUk: "pomylky-aktyvatsii-windows-vyrishennya"
---

Windows showing an activation error after reinstall, hardware upgrade or out of nowhere? Here's a full guide to error codes and activation methods.

---

## Check Current Activation Status

```powershell
slmgr /xpr          # expiry info
slmgr /dlv          # detailed info

Get-WmiObject SoftwareLicensingProduct |
    Where-Object {$_.PartialProductKey -and $_.Name -like '*Windows*'} |
    Select-Object Name, LicenseStatus
# LicenseStatus 1 = Licensed, 0 = Unlicensed
```

---

## Error Codes and Fixes

### 0xC004F213 — Hardware Changed

**Cause:** Changed motherboard or major hardware upgrade — Windows treats it as a new PC.

**Fix 1 — Phone activation:**
```
Win + R → slui 4 → select country → call → enter confirmation ID
```

**Fix 2 — Troubleshooter:**
```
Settings → Update → Activation → Troubleshoot activation
```

**Fix 3 — Link to Microsoft account** (before hardware change):
```
Settings → Activation → Add a Microsoft account
```
After linking, you can reactivate via your account after hardware changes.

---

### 0x803F7001 — License Not Found

```powershell
# Check BIOS/UEFI embedded key
(Get-WmiObject -query 'select * from SoftwareLicensingService').OA3xOriginalProductKey

# If key found, activate with it:
slmgr /ipk XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
slmgr /ato
```

---

### 0xC004C003 — Key Blocked

Key is already used on another PC or is invalid. Use phone activation (slui 4) or get a new legitimate key.

---

### 0xC004F074 — Activation Server Unavailable

```powershell
# Check connectivity
Test-NetConnection -ComputerName activation.sls.microsoft.com -Port 443

# Force activate
slmgr /ato
```

---

## Phone Activation (Free, Official)

```
Win + R → slui 4
```

1. Select country
2. Call the shown number
3. Enter the 9-part Installation ID shown on screen
4. Get Confirmation ID from the automated system
5. Enter Confirmation ID → Activate

---

## After Reinstalling Windows

If your license was genuine and you reinstalled on the same PC:

```powershell
# Digital License activates automatically when connected to internet
# Or force it:
slmgr /ato
```

Digital License is tied to your hardware — not to a product key.

---

## Summary

| Error code | Cause | Fix |
|-----------|-------|-----|
| 0xC004F213 | Hardware changed | Phone activation (slui 4) |
| 0x803F7001 | License not found | Check BIOS key |
| 0xC004C003 | Key blocked | Phone activation |
| 0xC004F074 | Server unavailable | Check internet, slmgr /ato |
| After reinstall | Digital License | Connect to internet |
