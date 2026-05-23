---
title: "How to Add Exclusions to Windows Defender Without Disabling Protection"
date: "2026-12-17"
publishDate: "2026-12-17"
description: "Windows Defender blocking a legitimate app or slowing down your dev environment? Add folder, file, process, or extension exclusions without turning off antivirus protection."
tags: ["windows", "security", "windows-defender", "settings"]
translatesUk: "yak-nalashtuvaty-windows-defender-vyklyuchennya"
readTime: 5
---

Windows Defender sometimes flags legitimate software — dev tools, build artifacts, VMs, or older software. The right solution is targeted exclusions, not disabling protection entirely.

---

## Via Settings (Easiest)

`Win + I` → **Privacy & Security** → **Windows Security** → **Virus & threat protection** → **Manage settings** → scroll to **Exclusions** → **Add or remove exclusions**

Click **+ Add an exclusion** → choose type:
- **Folder** — entire directory and subdirectories
- **File** — specific file
- **File type** — all files with that extension
- **Process** — all files opened by this process

---

## Via PowerShell

```powershell
# View current exclusions
Get-MpPreference | Select-Object ExclusionPath, ExclusionExtension, ExclusionProcess

# Add folder exclusion (most common)
Add-MpPreference -ExclusionPath "C:\Dev\Projects"
Add-MpPreference -ExclusionPath "D:\VirtualMachines"
Add-MpPreference -ExclusionPath "$env:USERPROFILE\AppData\Local\JetBrains"

# Add file type exclusion
Add-MpPreference -ExclusionExtension ".vmdk"
Add-MpPreference -ExclusionExtension ".vhd"

# Add process exclusion (files opened by this process are not scanned)
Add-MpPreference -ExclusionProcess "node.exe"
Add-MpPreference -ExclusionProcess "python.exe"
Add-MpPreference -ExclusionProcess "java.exe"

# Remove exclusion
Remove-MpPreference -ExclusionPath "C:\Dev\Projects"
```

---

## Common Legitimate Exclusions

**Development:**
```powershell
# Node.js projects (node_modules gets massive)
Add-MpPreference -ExclusionPath "C:\Dev"
Add-MpPreference -ExclusionProcess "node.exe"
Add-MpPreference -ExclusionProcess "npm.exe"

# Python
Add-MpPreference -ExclusionProcess "python.exe"
Add-MpPreference -ExclusionProcess "python3.exe"

# .NET / Visual Studio build output
Add-MpPreference -ExclusionPath "C:\Users\$env:USERNAME\source\repos"
Add-MpPreference -ExclusionExtension ".pdb"
```

**Virtual Machines:**
```powershell
Add-MpPreference -ExclusionExtension ".vmdk"
Add-MpPreference -ExclusionExtension ".vmx"
Add-MpPreference -ExclusionExtension ".vhd"
Add-MpPreference -ExclusionExtension ".vhdx"
Add-MpPreference -ExclusionPath "D:\VMs"
```

**Games and launchers:**
```powershell
Add-MpPreference -ExclusionPath "D:\SteamLibrary"
Add-MpPreference -ExclusionPath "C:\Program Files\Epic Games"
```

---

## Why Not Just Disable Defender?

Disabling Defender removes all protection — exclusions surgically exclude only what's needed. The rest of your system stays protected.

```powershell
# BAD — turns off all protection
Set-MpPreference -DisableRealtimeMonitoring $true

# GOOD — only excludes specific folder
Add-MpPreference -ExclusionPath "C:\Dev\MyTool"
```

---

## Check if Defender is Blocking Something

If an app fails to run or files disappear — check the protection history:

```powershell
# Recent detections and actions
Get-MpThreatDetection | Select-Object -Last 10 ThreatName, ActionSuccess, Resources,
  @{n='Time';e={$_.InitialDetectionTime}} | Sort-Object Time -Descending
```

Or: **Windows Security** → **Protection history** — shows everything Defender quarantined or blocked recently.

---

## Audit Your Exclusions

Exclusions are a security risk if set too broadly. Review regularly:

```powershell
# Full exclusion audit
$prefs = Get-MpPreference
Write-Host "=== Folder Exclusions ===" -ForegroundColor Yellow
$prefs.ExclusionPath | ForEach-Object { Write-Host "  $_" }

Write-Host "=== Extension Exclusions ===" -ForegroundColor Yellow
$prefs.ExclusionExtension | ForEach-Object { Write-Host "  $_" }

Write-Host "=== Process Exclusions ===" -ForegroundColor Yellow
$prefs.ExclusionProcess | ForEach-Object { Write-Host "  $_" }
```

**Red flags:** excluding entire `C:\`, `%TEMP%`, or `%APPDATA%` — these are exactly where malware lives.

---


---

## 🛡️ Перевір безпеку свого ПК

Хочеш знати чи немає витоків даних, зайвих служб або підозрілих програм на твоєму ПК?

**[→ AuditShield](/tools/auditshield)** — аудит Windows по 22 напрямках за 10 хвилин. HTML-звіт з оцінкою ризику. Є безкоштовне демо.


## Summary

Use `Add-MpPreference -ExclusionPath` for folders, `-ExclusionProcess` for apps. Never exclude `C:\`, `%TEMP%`, or `%AppData%` — those are high-risk locations. Check Protection History to identify what Defender is blocking before adding exclusions. Audit exclusions quarterly — remove any that are no longer needed.
