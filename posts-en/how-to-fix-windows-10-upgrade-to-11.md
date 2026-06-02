---
title: "How to Upgrade from Windows 10 to Windows 11 in 2026"
date: "2026-05-12"
publishDate: "2026-05-12"
description: "Upgrade from Windows 10 to Windows 11 in 2026. Check compatibility, use PC Health Check, upgrade via Windows Update or ISO, and troubleshoot common upgrade errors."
tags: ["windows", "windows-11", "upgrade", "installation", "migration"]
readTime: 5
---

Windows 10 reaches end of support in October 2025. Here's how to upgrade to Windows 11 safely — with or without hardware requirements.

---

## Check Compatibility First

```powershell
# Run PC Health Check (download from microsoft.com if missing)
Start-Process "ms-settings:windowsupdate"

# Or check manually
$cpu = (Get-WmiObject Win32_Processor).Name
$ram = [math]::Round((Get-WmiObject Win32_ComputerSystem).TotalPhysicalMemory/1GB,1)
$tpm = (Get-WmiObject -Namespace "ROOT\CIMV2\Security\MicrosoftTpm" -Class Win32_Tpm -EA 0).SpecVersion
$secureBoot = Confirm-SecureBootUEFI -EA 0
$disk = Get-Disk | Where-Object {$_.IsSystem} | Select-Object -ExpandProperty PartitionStyle

Write-Host "CPU: $cpu"
Write-Host "RAM: $ram GB (need 4+)"
Write-Host "TPM: $tpm (need 2.0)"
Write-Host "Secure Boot: $secureBoot"
Write-Host "Disk: $disk (need GPT)"
```

---

## Method 1: Windows Update (Easiest)

`Win + I` → **Windows Update** → if eligible, you'll see **Upgrade to Windows 11**

If not appearing:
```powershell
# Force update check
(New-Object -ComObject Microsoft.Update.AutoUpdate).DetectNow()
```

---

## Method 2: Installation Assistant

1. Download **Windows 11 Installation Assistant** from microsoft.com/software-download/windows11
2. Run as Administrator
3. Follow prompts — keeps files and apps

---

## Method 3: ISO (Clean Install or In-Place Upgrade)

```powershell
# Download Windows 11 ISO via PowerShell (uses media creation approach)
# Or visit: microsoft.com/software-download/windows11
```

For in-place upgrade: mount ISO → run `setup.exe` → choose "Keep personal files and apps"

---

## Method 4: Upgrade Unsupported Hardware

For PCs without TPM 2.0 or Secure Boot:

```powershell
# Registry bypass before running setup.exe from ISO
reg add "HKLM\SYSTEM\Setup\MoSetup" /v AllowUpgradesWithUnsupportedTPMOrCPU /t REG_DWORD /d 1 /f
```

Or use Rufus (rufus.ie) to create a bootable USB with bypass options checked.

---

## Before Upgrading — Checklist

```powershell
# 1. Create system image backup
wbadmin start backup -backupTarget:E: -include:C: -allCritical -quiet

# 2. Export installed app list
winget export -o "C:\backup-apps.json"

# 3. Check disk space (need 64+ GB total, 20+ GB free)
Get-PSDrive C | Select-Object @{n='Free GB';e={[math]::Round($_.Free/1GB,1)}}

# 4. Run Windows Update — install all pending updates first
```

---

## Fix Common Upgrade Errors

```powershell
# Error 0xC1900101 — driver incompatibility
# Update or remove the flagged driver before upgrading
Get-WindowsDriver -Online | Sort-Object Date | Select-Object -First 10 Driver, Date, Version

# Error 0x800F0922 — system partition too small
# Windows needs a 500 MB+ system partition
Get-Partition | Select-Object DriveLetter, Size, Type

# Error 0x8007042B — setup process terminated
# Run: DISM /Online /Cleanup-Image /RestoreHealth
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
```

---

## After Upgrading

```powershell
# Verify Windows 11 version
(Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion").DisplayVersion

# Reinstall apps from backup list
winget import -i "C:\backup-apps.json" --accept-package-agreements

# Update all drivers
winget upgrade --all --silent
```

---

## Summary

Check compatibility with PC Health Check. Upgrade via Windows Update if eligible. Use Installation Assistant for easiest path. ISO for clean install. Bypass TPM with registry key or Rufus for unsupported hardware. Always backup before upgrading.

## Frequently Asked Questions

### Will upgrading to Windows 11 delete my files?

In-place upgrade (keep files and apps) preserves everything. Clean install removes all data. The in-place upgrade is safe — but always backup beforehand.

### Windows 10 support ends October 2025 — do I have to upgrade?

You can keep using Windows 10 after support ends, but you won't receive security updates. Microsoft offers Extended Security Updates (ESU) for $30/year for home users as an option.

### The upgrade keeps failing at 85% — why?

Usually a driver or antivirus conflict. Temporarily disable antivirus, then retry. Check Windows Update error logs at `C:\$WINDOWS.~BT\Sources\Panther\setuperr.log`.
