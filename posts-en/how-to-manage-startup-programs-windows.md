---
title: "How to Manage Startup Programs in Windows 10 and 11"
date: "2026-04-19"
publishDate: "2026-04-19"
description: "Slow Windows boot? Disable unnecessary startup programs using Task Manager, registry, and Group Policy. Includes which programs are safe to disable and which to keep."
tags: ["windows", "optimization", "performance", "startup"]
readTime: 5
---

Every program that starts with Windows adds 1–5 seconds to boot time and uses RAM in the background. Most of them don't need to start automatically. Here's how to take control.

---

## Method 1: Task Manager (Fastest)

`Ctrl + Shift + Esc` → **Startup apps** tab

Each item shows:
- **Status**: Enabled / Disabled
- **Startup impact**: High / Medium / Low / Not measured

Right-click any item → **Disable** to prevent it from starting automatically.

This doesn't uninstall the program — it just won't start with Windows.

---

## Method 2: Settings App (Windows 11)

`Win + I` → **Apps** → **Startup**

Toggle off anything you don't need running at boot. Same effect as Task Manager, cleaner interface.

---

## Method 3: Registry (Advanced)

Startup entries are stored in the registry:

```
HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run       ← current user
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Run      ← all users
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce  ← runs once, then deletes
```

Open: `Win + R` → `regedit` → navigate to the key → delete unwanted entries.

Via PowerShell:
```powershell
# List all startup entries
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"
Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"

# Remove a specific entry (replace AppName with actual name)
Remove-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "AppName"
```

---

## Method 4: Startup Folder

Some programs add themselves to the startup folder instead of the registry:

```
C:\Users\YourName\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup
C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup
```

Open with: `Win + R` → `shell:startup` (current user) or `shell:common startup` (all users)

Delete any shortcuts you don't want.

---

## Method 5: Sysinternals Autoruns (Most Complete View)

Task Manager only shows a subset of startup items. **Autoruns** from Microsoft Sysinternals shows everything:

Download from [learn.microsoft.com/sysinternals/downloads/autoruns](https://learn.microsoft.com/en-us/sysinternals/downloads/autoruns)

Run as Administrator. Uncheck items to disable. Items highlighted in **yellow** have missing files — safe to delete.

---

## What's Safe to Disable

**Safe to disable:**
- Spotify, Discord, Steam, Epic Games Launcher
- OneDrive (if you don't use it)
- Teams (if you don't use it at login)
- Adobe Updater, Creative Cloud
- Skype
- Anything from `%APPDATA%` or `%TEMP%`

**Keep enabled:**
- Antivirus (Windows Defender, third-party)
- Audio drivers (Realtek, NVIDIA audio)
- GPU software if you use its features (NVIDIA Control Panel, AMD Software)
- Cloud backup software if actively used
- Hardware utilities for your specific device (Lenovo Vantage, Dell Update, etc.)

**Never disable:**
- `SecurityHealthSystray` — Windows Security tray icon
- `ctfmon` — input method editor, needed for some keyboard layouts
- Driver-related entries from your hardware manufacturer

---

## Measure the Impact

Check how much startup programs are slowing your boot:

```powershell
# Boot performance events
Get-WinEvent -LogName "Microsoft-Windows-Diagnostics-Performance/Operational" |
  Where-Object {$_.Id -eq 100} |
  Select-Object -First 1 |
  Select-Object -ExpandProperty Message
```

Or: Event Viewer → **Applications and Services Logs** → **Microsoft** → **Windows** → **Diagnostics-Performance** → **Operational** → Event ID 100 shows total boot time and which apps delayed startup.

---

## Delay Instead of Disable

Some programs need to start with Windows but don't need to start immediately. Use Task Scheduler to delay them by 2–5 minutes after boot:

`Win + R` → `taskschd.msc` → **Create Basic Task** → Trigger: **When the computer starts** → add a **1 minute delay** in the trigger settings.

---

## Summary

Start with Task Manager → Startup tab. Disable anything with **High** impact that you don't need immediately at login. For a complete view, use Autoruns. Don't disable your antivirus or audio drivers.

Typical result: 20–40% faster boot time after disabling 3–5 unnecessary startup programs.
