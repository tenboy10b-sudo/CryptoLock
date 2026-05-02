---
title: "How to Disable Windows Telemetry and Data Collection"
date: "2026-05-04"
publishDate: "2026-05-04"
description: "Windows 10 and 11 send diagnostic data to Microsoft by default. Here's how to reduce or disable telemetry using Settings, Group Policy, and the registry — and what you can't fully turn off."
tags: ["windows", "privacy", "security", "optimization"]
readTime: 6
---

Windows collects diagnostic data about how you use your PC and sends it to Microsoft. You can reduce this significantly — but not eliminate it entirely on Home editions.

---

## What Windows Collects

By default, Windows sends:
- App crash reports and usage statistics
- Hardware and driver information
- Typing and search data (if enabled)
- Location data (if enabled)
- Browser activity via Microsoft Edge

The amount depends on the diagnostic level: **Required** (minimum) or **Optional** (full telemetry).

---

## Method 1: Settings (Quickest)

`Win + I` → **Privacy & Security** → **Diagnostics & feedback**

- Set **Diagnostic data** to **Required diagnostic data only**
- Turn off **Improve inking and typing**
- Turn off **Tailored experiences**
- Click **Delete diagnostic data** to clear what's already been sent

Also check:
- `Privacy & Security` → **Activity history** → uncheck **Store my activity history**
- `Privacy & Security` → **Search permissions** → disable **Search history on this device**

---

## Method 2: Group Policy (Pro and Enterprise only)

`Win + R` → `gpedit.msc`

Navigate to:
```
Computer Configuration → Administrative Templates →
Windows Components → Data Collection and Preview Builds
```

Double-click **Allow Diagnostic Data** → set to **Enabled** → select **Diagnostic data off (not recommended)** or **Send required diagnostic data**.

Also disable:
```
Computer Configuration → Administrative Templates →
Windows Components → Windows Error Reporting → Disable Windows Error Reporting
```

---

## Method 3: Registry (All Editions)

Open `regedit` as Administrator:

```powershell
# Set telemetry to minimum (0 = off, requires Enterprise; 1 = required only)
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" `
  -Name "AllowTelemetry" -Value 1 -Type DWord

# Disable Customer Experience Improvement Program
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\SQMClient\Windows" `
  -Name "CEIPEnable" -Value 0 -Type DWord

# Disable Application telemetry
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\AppCompat" `
  -Name "AITEnable" -Value 0 -Type DWord
```

---

## Disable Telemetry Services

```powershell
# DiagTrack — Connected User Experiences and Telemetry
Stop-Service DiagTrack
Set-Service DiagTrack -StartupType Disabled

# dmwappushservice — WAP Push Message Routing
Stop-Service dmwappushservice
Set-Service dmwappushservice -StartupType Disabled
```

---

## Disable Advertising ID

Windows assigns each user an advertising ID used to target ads across apps.

`Settings` → **Privacy & Security** → **General** → turn off **Let apps show me personalized ads by using my advertising ID**

Via registry:
```powershell
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\AdvertisingInfo" `
  -Name "Enabled" -Value 0 -Type DWord
```

---

## Block Telemetry Endpoints (Advanced)

Add Microsoft's telemetry domains to your hosts file to block outgoing connections:

Open `C:\Windows\System32\drivers\etc\hosts` as Administrator and add:

```
0.0.0.0 vortex.data.microsoft.com
0.0.0.0 vortex-win.data.microsoft.com
0.0.0.0 telecommand.telemetry.microsoft.com
0.0.0.0 settings-win.data.microsoft.com
```

Note: This can interfere with Windows Update and activation. Use with caution.

---

## What You Can't Disable on Home Edition

On Windows 10/11 Home, telemetry level 0 (completely off) is not available — the minimum is "Required." For full control you need Pro, Enterprise, or Education editions.

You also can't fully disable:
- Windows Update checking (only delay it)
- Microsoft account sync if you use one
- SmartScreen URL checks

---

## Summary

For most users: set diagnostic data to **Required only** in Settings, disable Activity History, and turn off the Advertising ID. That covers 90% of the privacy concerns without registry edits or service disabling.

For maximum privacy: apply Group Policy settings (Pro+), disable DiagTrack service, and block telemetry endpoints in hosts file.
