---
title: "How to Manage Startup Programs in Windows 10 and 11"
date: "2024-04-20"
publishDate: "2024-04-20"
updated: "2026-05-23"
description: "Disable, enable, and manage startup programs in Windows 10 and 11. Task Manager, MSConfig, registry, and PowerShell methods to speed up Windows boot time."
tags: ["windows", "optimization", "performance", "settings"]
readTime: 5
---

Too many startup programs slow down Windows boot significantly. Disabling unnecessary ones is the single fastest way to improve startup time — no hardware needed.

---

## Method 1: Task Manager (Easiest)

`Ctrl + Shift + Esc` → **Startup apps** tab

Columns:
- **Name** — the app
- **Publisher** — who made it
- **Status** — Enabled/Disabled
- **Startup impact** — Low/Medium/High

Right-click any entry → **Disable** to prevent it from running at startup.

**Safe to disable:** Spotify, Discord, Teams (personal), Steam, Adobe updaters, game launchers, OneDrive (if you don't use it), Slack, Skype.

**Keep enabled:** antivirus, driver software (audio, GPU), cloud sync if you use it.

---

## Method 2: Settings (Windows 11)

`Win + I` → **Apps** → **Startup**

Same list as Task Manager with toggle switches. Shows impact rating for each app.

---

## Method 3: MSConfig

`Win + R` → `msconfig` → **Startup** tab → **Open Task Manager**

On Windows 10/11 this redirects to Task Manager's Startup tab.

---

## Method 4: PowerShell

```powershell
# View startup programs from registry
Write-Host "=== Current User Startup ===" -ForegroundColor Yellow
Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" |
  Select-Object * -ExcludeProperty PS*

Write-Host "=== All Users Startup ===" -ForegroundColor Yellow
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" |
  Select-Object * -ExcludeProperty PS*

# View startup folder contents
Write-Host "=== Startup Folder ===" -ForegroundColor Yellow
Get-ChildItem "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
Get-ChildItem "C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup"
```

---

## Method 5: Autoruns (Most Complete View)

Microsoft's **Autoruns** shows everything that runs at startup — more than Task Manager:

```powershell
# Download Autoruns from Microsoft Sysinternals
winget install Microsoft.Sysinternals.Autoruns
```

Or download from [learn.microsoft.com/sysinternals/downloads/autoruns](https://learn.microsoft.com/en-us/sysinternals/downloads/autoruns)

Autoruns shows: registry run keys, startup folders, scheduled tasks, browser extensions, services, and more.

---

## Disable a Startup Item via Registry

```powershell
# Remove a startup entry (example: Spotify)
Remove-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "Spotify" -EA 0

# Add a startup entry
Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "MyApp" -Value "C:\Path\To\App.exe"
```

---

## Measure Boot Time Before and After

```powershell
# View boot time history from Event Log
Get-WinEvent -FilterHashtable @{LogName='System'; Id=@(12,13)} |
  Select-Object TimeCreated, Id,
    @{n='Event';e={if($_.Id -eq 12){'Boot Start'}else{'Boot End'}}} |
  Sort-Object TimeCreated -Descending | Select-Object -First 10

# Current boot time
(Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
```

---

## What Actually Slows Down Boot

In order of impact:
1. **Too many startup apps** — biggest factor for most users
2. **HDD instead of SSD** — 5-10x difference
3. **Not enough RAM** — causes disk paging
4. **Fast Startup disabled** — Windows 11 feature that pre-loads some boot data

Enable Fast Startup:
`Control Panel` → **Power Options** → **Choose what the power buttons do** → check **Turn on fast startup**

---

## Summary

Task Manager `Startup apps` tab is the quickest way — sort by **Startup impact** and disable everything **High** you don't need. PowerShell shows registry entries Task Manager might miss. Autoruns gives the most complete picture. After disabling startup apps, reboot and measure the difference — most users see 30-60% faster boot.
