---
title: "How to Fix Windows Update Stuck at 0%, Downloading or Installing"
date: "2026-05-13"
publishDate: "2026-05-13"
description: "Windows Update stuck at 0%, stuck downloading, or freezing during install? Step-by-step fixes: clear update cache, reset services, run troubleshooter, DISM repair."
tags: ["windows", "windows-update", "troubleshooting", "errors"]
readTime: 5
translatesUk: "yak-vypravyty-windows-update-zavisaye"
---

Windows Update getting stuck is one of the most common Windows issues. Here's a systematic approach that fixes it in most cases.

---

## Quick Fix First

```powershell
# Restart Windows Update services
Stop-Service wuauserv, bits, cryptsvc -Force
Start-Service wuauserv, bits, cryptsvc

# Check for updates again
Start-Process "ms-settings:windowsupdate"
```

If that doesn't work, proceed to the steps below.

---

## Step 1: Run Windows Update Troubleshooter

`Win + I` → **System** → **Troubleshoot** → **Other troubleshooters** → **Windows Update** → **Run**

Or via PowerShell:
```powershell
msdt.exe /id WindowsUpdateDiagnostic
```

---

## Step 2: Clear the Update Cache

This is the most effective fix for stuck downloads:

```powershell
# Stop services
Stop-Service wuauserv, bits, cryptsvc -Force

# Delete cached update files
Remove-Item "C:\Windows\SoftwareDistribution\*" -Recurse -Force -EA 0
Remove-Item "C:\Windows\System32\catroot2\*" -Recurse -Force -EA 0

# Restart services
Start-Service wuauserv, bits, cryptsvc

Write-Host "Done. Check Windows Update now."
```

---

## Step 3: Reset Windows Update Components

```cmd
net stop wuauserv
net stop cryptSvc
net stop bits
net stop msiserver

ren C:\Windows\SoftwareDistribution SoftwareDistribution.old
ren C:\Windows\System32\catroot2 catroot2.old

net start wuauserv
net start cryptSvc
net start bits
net start msiserver
```

---

## Step 4: Repair System Files

```cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
```

Run as Administrator. DISM first, then SFC. Restart after completion.

---

## Step 5: Check Disk Space

Updates need free space — at least 10-20 GB:

```powershell
Get-PSDrive C | Select-Object @{n='Free GB';e={[math]::Round($_.Free/1GB,1)}}
```

If low — run Disk Cleanup:
```powershell
cleanmgr /sageset:1
cleanmgr /sagerun:1
```

---

## Step 6: Fix Stuck Pending Update

If an update is stuck "Pending Install" or "Pending Restart":

```powershell
# Check pending operations
(New-Object -ComObject Microsoft.Update.SystemInfo).RebootRequired

# Force restart to complete pending updates
Restart-Computer -Force
```

---

## Step 7: Download Update Manually

If a specific update keeps failing — download it directly from Microsoft Update Catalog:

1. Go to `catalog.update.microsoft.com`
2. Search by KB number (e.g., `KB5055523`)
3. Download and run the `.msu` file directly

---

## Step 8: Reset Windows Update via Registry

```powershell
# Re-register Windows Update DLLs
$dlls = @(
  "atl.dll","urlmon.dll","mshtml.dll","shdocvw.dll",
  "browseui.dll","jscript.dll","vbscript.dll","scrrun.dll",
  "msxml.dll","msxml3.dll","msxml6.dll","actxprxy.dll",
  "wuapi.dll","wuaueng.dll","wucltux.dll","wups.dll",
  "wups2.dll","wusvc.dll","wuwebv.dll"
)
foreach ($dll in $dlls) {
  regsvr32.exe /s $dll
}
netsh winsock reset
```

---

## Summary

Try in order: restart WU services → clear SoftwareDistribution folder → run DISM/SFC → check disk space → manual KB download. Clearing `C:\Windows\SoftwareDistribution` fixes 80% of stuck update issues. Always run as Administrator.
