---
title: "How to Disable or Pause Windows Update in Windows 10 and 11"
date: "2026-02-26"
publishDate: "2026-02-26"
description: "Stop Windows from automatically installing updates using Settings, Group Policy, and services. Includes how to pause updates temporarily and block specific problematic updates."
tags: ["windows", "windows-update", "optimization", "administration"]
readTime: 6
---

Automatic updates are important for security, but sometimes you need to delay or stop them — before a big presentation, when an update breaks something, or on a metered connection. Here's how to do it properly.

---

## Method 1: Pause Updates (Recommended)

The safest approach — temporarily delays updates without fully disabling them.

`Win + I` → **Windows Update** → **Pause updates** → select pause duration (1–5 weeks on Windows 11, up to 35 days on Windows 10)

After the pause period, updates resume automatically.

---

## Method 2: Set Connection as Metered

Windows limits background downloads on metered connections.

`Win + I` → **Network & Internet** → click your Wi-Fi or Ethernet connection → turn on **Metered connection**

Windows will stop downloading large updates automatically. You can still check for and install updates manually.

---

## Method 3: Group Policy (Pro and Enterprise)

`Win + R` → `gpedit.msc`

Navigate to:
```
Computer Configuration → Administrative Templates →
Windows Components → Windows Update → Manage end user experience
```

**Configure Automatic Updates** → **Enabled** → set to:
- **2 - Notify for download and auto install** — Windows asks before downloading
- **3 - Auto download and notify for install** — downloads but asks before installing
- **Disabled** — turns off automatic updates completely (not recommended long-term)

---

## Method 4: Disable Windows Update Service

```powershell
# Stop and disable the service
Stop-Service wuauserv
Set-Service wuauserv -StartupType Disabled

# Re-enable when needed
Set-Service wuauserv -StartupType Manual
Start-Service wuauserv
```

Also disable the Update Orchestrator:
```powershell
Stop-Service UsoSvc
Set-Service UsoSvc -StartupType Disabled
```

---

## Method 5: Block Updates via Registry

```powershell
# Disable automatic updates
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU"
New-Item -Path $path -Force | Out-Null
Set-ItemProperty -Path $path -Name "NoAutoUpdate" -Value 1 -Type DWord
Set-ItemProperty -Path $path -Name "AUOptions" -Value 1 -Type DWord

# Re-enable
Remove-Item -Path $path -Force
```

---

## Block a Specific Problematic Update

If a specific update is causing problems, block it by KB number:

1. Download the **Show or Hide Updates troubleshooter** from Microsoft (search "wushowhide.diagcab")
2. Run it → **Hide updates** → select the update to block

Or via PowerShell (Windows 10):
```powershell
# Hide specific update by KB number
$updateSession = New-Object -ComObject Microsoft.Update.Session
$updateSearcher = $updateSession.CreateUpdateSearcher()
$updates = $updateSearcher.Search("IsInstalled=0").Updates
$updates | Where-Object {$_.KBArticleIDs -contains "5034441"} |
  ForEach-Object {$_.IsHidden = $true}
```

---

## Delay Feature Updates Only (Keep Security Patches)

This keeps security patches but delays major version upgrades:

`Win + I` → **Windows Update** → **Advanced options**:
- **Receive updates for other Microsoft products** — keep on
- **Defer feature updates** — set to maximum (365 days)

Via Group Policy:
```
Computer Configuration → Administrative Templates →
Windows Components → Windows Update → Windows Update for Business
→ Select when Preview Builds and Feature Updates are received
→ Set to 365 days deferral
```

---

## What You Shouldn't Do Long-Term

Disabling Windows Update completely is a security risk. Without patches:
- Known vulnerabilities remain unpatched
- Malware specifically targets unpatched systems
- Some features stop working over time

**Recommended approach**: pause for 1–2 weeks if you need stability, then let updates install. Use Group Policy to defer feature updates by 60–90 days while still getting security patches.

---

## Re-enable Everything Quickly

```powershell
Set-Service wuauserv -StartupType Automatic
Start-Service wuauserv
Set-Service UsoSvc -StartupType Automatic
Start-Service UsoSvc
Remove-Item "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate" -Recurse -Force -ErrorAction SilentlyContinue
gpupdate /force
```

---

## Summary

For temporary pause: **Settings → Windows Update → Pause** (safest). For metered connections: set as Metered. For long-term control on Pro: use Group Policy to defer feature updates while keeping security patches. Fully disabling updates is not recommended — pause instead.
