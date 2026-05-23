---
title: "How to Fix Microsoft Store Not Working in Windows 10 and 11"
date: "2026-09-16"
publishDate: "2026-09-16"
description: "Microsoft Store won't open, apps fail to download, or the store is blank? Step-by-step fixes: reset Store cache, re-register the app, and fix common error codes."
tags: ["windows", "troubleshooting", "tools", "windows-11"]
readTime: 5
---

Microsoft Store problems range from a blank white screen to download errors to the app not opening at all. Here's how to fix the most common cases.

---

## Fix 1: Reset Store Cache

The most common fix — clears corrupted cache files:

`Win + R` → type `wsreset.exe` → Enter

A black command window opens, does nothing visible for 30-60 seconds, then the Store opens automatically. Try your download again.

---

## Fix 2: Run Windows Store Apps Troubleshooter

`Win + I` → **System** → **Troubleshoot** → **Other troubleshooters** → **Windows Store Apps** → **Run**

This fixes permission and service issues automatically.

---

## Fix 3: Check Date and Time

Incorrect date/time causes Store authentication to fail.

```powershell
# Sync time with internet server
w32tm /resync /force
```

Or: `Win + I` → **Time & language** → **Date & time** → **Sync now**

---

## Fix 4: Sign Out and Back Into Microsoft Account

`Win + I` → **Accounts** → **Your info** → **Sign out** → sign back in.

In Microsoft Store: click your profile icon → **Sign out** → sign back in.

---

## Fix 5: Re-register Microsoft Store

```powershell
# Re-register Store for current user
Get-AppxPackage -AllUsers Microsoft.WindowsStore |
  ForEach-Object {Add-AppxPackage -DisableDevelopmentMode -Register "$($_.InstallLocation)\AppXManifest.xml"}

# Re-register all Store apps
Get-AppxPackage -AllUsers |
  ForEach-Object {
    Add-AppxPackage -DisableDevelopmentMode -Register "$($_.InstallLocation)\AppXManifest.xml" -ErrorAction SilentlyContinue
  }
```

---

## Fix 6: Reinstall Microsoft Store

```powershell
# Remove Store
Get-AppxPackage -AllUsers Microsoft.WindowsStore | Remove-AppxPackage

# Reinstall from online source
winget install --id=9WZDNCRFJBMP -e --accept-source-agreements
```

---

## Fix 7: Check Windows Update

Pending updates sometimes block Store functionality:

`Win + I` → **Windows Update** → **Check for updates** → install all pending updates → restart.

---

## Fix 8: Reset Store via Settings

`Win + I` → **Apps** → **Installed apps** → search **Microsoft Store** → click three dots → **Advanced options** → **Reset**

This resets the app without uninstalling it — similar to a clean reinstall.

---

## Fix 9: Check Proxy Settings

Store uses its own connection and proxy settings can interfere:

```powershell
# Reset proxy
netsh winhttp reset proxy
```

Or: `Win + I` → **Network & Internet** → **Proxy** → turn off manual proxy.

---

## Common Error Codes

| Code | Meaning | Fix |
|------|---------|-----|
| 0x80131500 | Network error | Check internet, reset cache |
| 0x80073CF0 | App not found | Re-register Store |
| 0x803FB005 | Download failed | Reset cache, check disk space |
| 0x80073CF3 | Package update failed | Re-register all apps |
| 0xC002001B | Sign-in error | Sign out and back in |

---

## Check Store Service

```powershell
# StorSvc service must be running
Get-Service StorSvc | Select-Object Status, StartType

# Start if stopped
Start-Service StorSvc
Set-Service StorSvc -StartupType Automatic
```

---


---

## 🔍 Не знаєш що означає код помилки Windows?

Якщо Windows показує код на кшталт `0x80070005`, `0x80070002` або `0xC000021A` — скористайся безкоштовним інструментом:

**[→ Декодер помилок Windows](/tools/windows-error-decoder)** — введи код і одразу дізнайся що він означає та як виправити.


## Summary

Start with `wsreset.exe` — fixes 80% of Store problems. If still broken: re-register Store via PowerShell. For sign-in errors: sign out and back in. For download failures: check disk space and proxy settings. For persistent issues: reset or reinstall Store via `winget`.
