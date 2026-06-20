---
title: "Taskbar Not Working in Windows 10 and 11: Fix Freezing and Missing Taskbar"
date: "2026-06-20"
publishDate: "2026-10-10"
updated: "2026-06-20"
description: "What to do when the taskbar freezes, won't respond or disappears in Windows 10 and 11. Restart Explorer, fix via PowerShell, re-register system apps and repair system files."
tags: ["windows", "taskbar", "explorer", "fix", "settings"]
readTime: 6
translatesUk: "panel-zavdan-ne-pratsyuie-windows-vyrishennya"
---

Taskbar frozen, not responding to clicks or completely gone? Here are quick fixes from restarting Explorer to deep repair.

---

## Step 1 — Restart Explorer

Fixes 80% of taskbar issues:

```powershell
Stop-Process -Name explorer -Force
Start-Process explorer
```

Or: `Ctrl+Shift+Esc` → find "Windows Explorer" → right-click → **Restart**

---

## Step 2 — Kill Related Processes

```powershell
Get-Process -Name "ShellExperienceHost" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "SearchHost" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Process "explorer.exe"
```

---

## Step 3 — Re-register System Apps

```powershell
Get-AppXPackage -AllUsers |
    Where-Object {$_.InstallLocation -like "*SystemApps*"} |
    ForEach-Object {
        Add-AppxPackage -DisableDevelopmentMode -Register "$($_.InstallLocation)\AppXManifest.xml"
    }
```

---

## Step 4 — Repair System Files

```powershell
sfc /scannow
DISM /Online /Cleanup-Image /RestoreHealth
```

---

## Common Issues

### Taskbar disappeared

```
Win + I → Personalization → Taskbar →
"Automatically hide the taskbar" → turn OFF
```

### Start button not responding

```powershell
Get-AppXPackage -Name Microsoft.Windows.StartMenuExperienceHost |
    ForEach-Object {Add-AppxPackage -DisableDevelopmentMode -Register "$($_.InstallLocation)\AppXManifest.xml"}
```

### Taskbar broke after Windows update

```powershell
# View recent updates
Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 5

# Uninstall problematic update
wusa /uninstall /kb:KBNUMBER /quiet /norestart
```

---

## Last Resort — New User Profile

```powershell
net user TempAdmin Password123! /add
net localgroup Administrators TempAdmin /add
```

If taskbar works under new account — the issue is in your old profile. Transfer files and use the new profile.

---

## Summary

| Problem | Fix |
|---------|-----|
| Frozen | Restart Explorer |
| Disappeared | Disable auto-hide |
| Start not responding | Re-register StartMenuExperienceHost |
| After update | Uninstall the update |
| Nothing works | Create new user profile |
