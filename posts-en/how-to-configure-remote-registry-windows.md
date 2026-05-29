---
title: "Windows Registry: How to Edit, Backup and Restore Registry Keys"
date: "2026-05-23"
publishDate: "2026-05-23"
description: "Edit Windows Registry safely using regedit and PowerShell. Create, modify and delete keys, export backups before changes, and restore if something breaks."
tags: ["windows", "registry", "administration", "powershell", "security"]
readTime: 5
---

The Windows Registry stores system settings, hardware configuration and application data. Editing it incorrectly can break Windows — always back up first.

---

## Open Registry Editor

```
Win + R → regedit
```

---

## Registry Structure

```
HKEY_LOCAL_MACHINE (HKLM)  ← system-wide settings
HKEY_CURRENT_USER (HKCU)   ← current user settings
HKEY_CLASSES_ROOT (HKCR)   ← file associations
HKEY_USERS (HKU)           ← all user profiles
HKEY_CURRENT_CONFIG (HKCC) ← current hardware profile
```

---

## Back Up Before Editing

**Export a specific key:**
1. Navigate to the key in regedit
2. Right-click → **Export** → save as `.reg` file

**Via PowerShell:**
```powershell
# Export a key to .reg file
reg export "HKCU\Software\Microsoft\Windows" "C:\Backup\windows-key.reg"

# Export entire HKCU (careful — large file)
reg export HKCU "C:\Backup\hkcu-full.reg"
```

---

## Read Registry Values

```powershell
# Get a single value
Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"

# Get specific value
(Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion").ProductName

# Check if a key exists
Test-Path "HKCU:\Software\MyApp"

# List all subkeys
Get-ChildItem "HKCU:\Software\Microsoft"
```

---

## Create and Modify Keys

```powershell
# Create a new key
New-Item -Path "HKCU:\Software\MyApp" -Force

# Create a value (String)
New-ItemProperty "HKCU:\Software\MyApp" -Name "Setting" -Value "Enabled" -PropertyType String

# Modify an existing value
Set-ItemProperty "HKCU:\Software\MyApp" -Name "Setting" -Value "Disabled"

# Create DWORD value
New-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows" `
  -Name "AllowCortana" -Value 0 -PropertyType DWord -Force
```

---

## Delete Keys and Values

```powershell
# Delete a value
Remove-ItemProperty "HKCU:\Software\MyApp" -Name "OldSetting"

# Delete a key and all subkeys
Remove-Item "HKCU:\Software\MyApp" -Recurse -Force

# Via reg command
reg delete "HKCU\Software\MyApp" /va /f  # delete all values
reg delete "HKCU\Software\MyApp" /f      # delete key and subkeys
```

---

## Restore a Registry Backup

**Double-click** the `.reg` file → Allow → Yes

**Via CMD:**
```cmd
reg import "C:\Backup\windows-key.reg"
```

---

## Useful Registry Tweaks

```powershell
# Disable telemetry data collection
Set-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" `
  -Name "AllowTelemetry" -Value 0 -Type DWord -Force

# Show file extensions in Explorer
Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" `
  -Name "HideFileExt" -Value 0

# Disable Cortana
New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Windows Search" -Force
Set-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Windows Search" `
  -Name "AllowCortana" -Value 0 -Type DWord

# Enable Ultimate Performance power plan
powercfg /duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61
```

---

## Find Registry Key for a Setting

When you change a setting in the GUI and want to find its registry key:

```powershell
# Export registry snapshot before change
reg export HKCU "C:\before.reg"

# Make your change in Settings/Control Panel

# Export after change
reg export HKCU "C:\after.reg"

# Compare the two files to find what changed
Compare-Object (Get-Content "C:\before.reg") (Get-Content "C:\after.reg")
```

---

## Summary

Always export a backup before editing with `reg export`. Use PowerShell `Get-ItemProperty` / `Set-ItemProperty` for scripted changes. Restore with `reg import` or double-click the `.reg` file. Compare before/after exports to find what a setting change does in the registry.

## Frequently Asked Questions

### Can a bad registry edit break Windows?

Yes, serious mistakes (deleting critical keys) can prevent Windows from booting. Always export the key before editing and boot into Safe Mode if needed to restore. System Restore also preserves registry state.

### How do I find a registry key path from a program name?

Search in regedit: `Ctrl + F` → enter program name or part of a path. Also try `HKLM:\SOFTWARE` and `HKCU:\Software` — most apps store settings in one of these.

### Is registry cleaning safe?

No. Registry cleaners (like CCleaner's registry cleaner) remove entries they think are unused but often delete valid keys. Microsoft does not recommend registry cleaning — it rarely improves performance and can cause problems.
