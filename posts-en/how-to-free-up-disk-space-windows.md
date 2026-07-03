---
title: "How to Free Up Disk Space in Windows 10 and 11: Complete Guide"
date: "2027-02-10"
publishDate: "2027-02-10"
description: "Free up disk space in Windows 10 and 11. Delete temp files, Windows Update cache, WinSxS folder, old Windows installations, compress files and find large files."
tags: ["windows", "disk", "storage", "optimization", "cleanup"]
readTime: 5
translatesUk: "yak-zvilvyty-mistse-na-dysku-windows"
---

Low disk space slows Windows and prevents updates. Here's how to recover gigabytes of space safely.

---

## Quick Win: Disk Cleanup

```powershell
# Run extended Disk Cleanup (includes system files)
cleanmgr /sageset:1
cleanmgr /sagerun:1

# Or manually:
# Win + S → Disk Cleanup → select C: → Clean up system files
```

Typically recovers 2-10 GB — Windows Update cache, temp files, Recycle Bin.

---

## Delete Temp Files Manually

```powershell
# User temp files
Remove-Item "$env:TEMP\*" -Recurse -Force -EA 0

# Windows temp files
Remove-Item "C:\Windows\Temp\*" -Recurse -Force -EA 0

# Prefetch (Windows re-creates automatically)
Remove-Item "C:\Windows\Prefetch\*" -Force -EA 0

Write-Host "Cleaned: $([math]::Round((Get-ChildItem $env:TEMP -Recurse -EA 0 | Measure-Object Length -Sum).Sum / 1MB)) MB freed"
```

---

## Remove Old Windows Installations

After upgrading to Windows 11, the previous Windows stays as `Windows.old`:

```powershell
# Check size
(Get-ChildItem "C:\Windows.old" -Recurse -EA 0 | Measure-Object Length -Sum).Sum / 1GB

# Remove via Disk Cleanup (safest method)
# Disk Cleanup → Clean up system files → Previous Windows installation(s)

# Or command line (no recovery after this)
Remove-Item "C:\Windows.old" -Recurse -Force -EA 0
```

---

## Clean Windows Update Cache

```powershell
Stop-Service wuauserv -Force
Remove-Item "C:\Windows\SoftwareDistribution\Download\*" -Recurse -Force -EA 0
Start-Service wuauserv
```

---

## Shrink WinSxS Folder

WinSxS stores component backups. It can grow to 10-20 GB:

```powershell
# Analyze WinSxS size
Dism /Online /Cleanup-Image /AnalyzeComponentStore

# Clean up superseded components
Dism /Online /Cleanup-Image /StartComponentCleanup /ResetBase

# This is permanent — cannot roll back to previous Windows versions after
```

---

## Find Large Files

```powershell
# Top 20 largest files on C:
Get-ChildItem C:\ -Recurse -File -EA 0 |
  Sort-Object Length -Descending |
  Select-Object -First 20 FullName, @{n='GB';e={[math]::Round($_.Length/1GB,2)}}

# Files larger than 1 GB
Get-ChildItem C:\ -Recurse -File -EA 0 |
  Where-Object {$_.Length -gt 1GB} |
  Select-Object FullName, @{n='GB';e={[math]::Round($_.Length/1GB,2)}} |
  Sort-Object GB -Descending
```

---

## Remove Unused User Profiles

```powershell
# List all user profiles with size
Get-WmiObject Win32_UserProfile | Where-Object {-not $_.Special} |
  Select-Object LocalPath, @{n='GB';e={
    try { [math]::Round((Get-ChildItem $_.LocalPath -Recurse -EA 0 | Measure-Object Length -Sum).Sum/1GB,1) } catch { 0 }
  }}

# Delete a profile
(Get-WmiObject Win32_UserProfile | Where-Object {$_.LocalPath -like "*OldUser*"}).Delete()
```

---

## Enable Storage Sense

Automatically cleans up temp files and Recycle Bin:

```powershell
# Enable Storage Sense
Set-ItemProperty "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\StorageSense\Parameters\StoragePolicy" `
  -Name "01" -Value 1 -Type DWord
```

Or: `Win + I` → **System** → **Storage** → **Storage Sense** → On

---

## Compact OS (Laptops/Low Storage Devices)

```powershell
# Compress Windows installation (saves 1-3 GB, minimal performance impact on SSD)
compact /compactos:always

# Undo compression
compact /compactos:never
```

---

## Summary

Run Disk Cleanup with system files first. Delete temp files. Remove Windows.old if exists. Clean SoftwareDistribution cache. Run DISM /StartComponentCleanup for WinSxS. Find large files with PowerShell. Enable Storage Sense for ongoing maintenance.

## Frequently Asked Questions

### How much free space should Windows 10/11 have?

Minimum 20 GB free for Windows to function properly. Windows 11 needs at least 64 GB total and recommends 15-20 GB always free for updates and page file.

### Is it safe to delete Windows.old?

Yes, once you confirm Windows 11 works correctly. Windows.old is only needed to roll back — after 10 days Windows offers to remove it automatically.

### WinSxS folder is 20 GB — can I just delete it?

Never delete WinSxS manually. Use `DISM /Cleanup-Image /StartComponentCleanup` instead — it safely removes only superseded and unneeded components.
