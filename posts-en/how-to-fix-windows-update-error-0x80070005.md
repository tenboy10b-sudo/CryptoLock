---
title: "How to Fix Windows Update Error 0x80070005 (Access Denied)"
date: "2026-03-19"
publishDate: "2026-03-19"
description: "Windows Update error 0x80070005 means access denied — a permissions problem preventing updates from installing. Here are all the fixes: reset permissions, restart services, and run as SYSTEM."
tags: ["windows", "windows-update", "troubleshooting", "security"]
readTime: 6
---

Error 0x80070005 during Windows Update means "Access Denied" — something is blocking the update process from writing files or accessing a registry key. Here's how to fix it.

---

## Common Causes

- Third-party antivirus blocking the update
- Corrupted Windows Update permissions
- SoftwareDistribution folder corruption
- Group Policy restriction
- Running Windows without admin rights

---

## Fix 1: Run Windows Update Troubleshooter

`Win + I` → **System** → **Troubleshoot** → **Other troubleshooters** → **Windows Update** → **Run**

This automatically resets permissions and services. Try updating again after it completes.

---

## Fix 2: Temporarily Disable Antivirus

Third-party antivirus frequently causes 0x80070005. Disable it temporarily:

- Right-click antivirus tray icon → disable protection for 10 minutes
- Run Windows Update
- Re-enable antivirus

If the update succeeds — add Windows Update folders to antivirus exclusions:
```
C:\Windows\SoftwareDistribution
C:\Windows\Temp
```

---

## Fix 3: Reset Windows Update Permissions

```cmd
rem Run as Administrator
net stop wuauserv
net stop cryptSvc
net stop bits
net stop msiserver

icacls %SystemRoot%\SoftwareDistribution /reset /T /C /Q
icacls %SystemRoot%\System32\catroot2 /reset /T /C /Q

net start wuauserv
net start cryptSvc
net start bits
net start msiserver
```

---

## Fix 4: Reset SoftwareDistribution Folder

```powershell
Stop-Service wuauserv -Force
Stop-Service bits -Force

Rename-Item "C:\Windows\SoftwareDistribution" "SoftwareDistribution.old" -Force
New-Item -ItemType Directory -Path "C:\Windows\SoftwareDistribution"

Start-Service wuauserv
Start-Service bits
```

Then try Windows Update again — it downloads fresh update metadata.

---

## Fix 5: Fix Registry Permissions

Some updates fail because registry keys have wrong permissions:

```cmd
rem Reset registry permissions for Windows Update keys
secedit /configure /cfg %windir%\inf\defltbase.inf /db defltbase.sdb /verbose
```

Or use SubInACL (Microsoft tool) to reset permissions:
```cmd
subinacl /subkeyreg HKEY_LOCAL_MACHINE /grant=administrators=f
subinacl /subkeyreg HKEY_CURRENT_USER /grant=administrators=f
subinacl /subdirectories %SystemDrive% /grant=administrators=f
```

---

## Fix 6: Run SFC and DISM

```cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
```

Restart after both complete.

---

## Fix 7: Check Group Policy

If this is a work PC, Group Policy may be restricting updates:

```powershell
gpresult /r | Select-String "Update"
```

Contact your IT administrator if Group Policy is blocking updates.

---

## Fix 8: Install Update Manually

Find the failing KB number in **Windows Update** → **Update history** → search on [catalog.update.microsoft.com](https://www.catalog.update.microsoft.com) → download and run the `.msu` file directly.

Manual installation bypasses the Windows Update agent that's getting the access denied error.

---

## Fix 9: Run the Update as Administrator via PSWindowsUpdate

```powershell
Install-Module PSWindowsUpdate -Force -EA 0
Start-Process powershell -Verb RunAs -ArgumentList {
  Import-Module PSWindowsUpdate
  Get-WUInstall -AcceptAll -AutoReboot
}
```

This runs the update check and install with full elevated privileges — sometimes fixes access-denied errors that persist even when you're already an administrator.

---

## Fix 10: Check User Account Control

```powershell
# Check UAC level
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" |
  Select-Object EnableLUA, ConsentPromptBehaviorAdmin
```

`EnableLUA` should be `1`. If it's `0` — UAC is disabled which can cause permission issues:

```powershell
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" `
  -Name "EnableLUA" -Value 1 -Type DWord
```

Restart required.

---

## Fix 11: Reset Windows Update Components Script

```powershell
# Comprehensive reset script
$services = "wuauserv","cryptSvc","bits","msiserver","appidsvc","sppsvc"
$services | ForEach-Object { Stop-Service $_ -Force -ErrorAction SilentlyContinue }

# Reset BITS and Windows Update database
Remove-Item "$env:ALLUSERSPROFILE\Application Data\Microsoft\Network\Downloader\qmgr*.dat" -Force -ErrorAction SilentlyContinue

# Re-register DLLs
$dlls = "atl.dll","urlmon.dll","mshtml.dll","shdocvw.dll","browseui.dll",
        "jscript.dll","vbscript.dll","scrrun.dll","msxml.dll","msxml3.dll",
        "msxml6.dll","actxprxy.dll","softpub.dll","wintrust.dll","dssenh.dll",
        "rsaenh.dll","gpkcsp.dll","sccbase.dll","slbcsp.dll","cryptdlg.dll",
        "oleaut32.dll","ole32.dll","shell32.dll","wuapi.dll","wuaueng.dll",
        "wucltui.dll","wups.dll","wups2.dll","wuweb.dll","qmgr.dll","qmgrprxy.dll",
        "wucltux.dll","muweb.dll","wuwebv.dll"

$dlls | ForEach-Object { regsvr32.exe /s $_ }

# Reset network settings
netsh winsock reset
netsh winhttp reset proxy

$services | ForEach-Object { Start-Service $_ -ErrorAction SilentlyContinue }

Write-Host "Reset complete. Restart and try Windows Update again." -ForegroundColor Green
```

---


---

## 🔍 Not sure what a Windows error code means?

If Windows shows a code like `0x80070005`, `0x80070002` or `0xC000021A` — use this free tool:

**[→ Windows Error Decoder](/tools/windows-error-decoder)** — enter the code and instantly find out what it means and how to fix it.


## Summary

Most common fix: disable antivirus temporarily → run Windows Update → re-enable. If that fails: reset SoftwareDistribution folder and restart update services. For persistent cases: run the comprehensive reset script above or install the failing update manually from Microsoft Update Catalog.

Update stuck rather than erroring out? See [How to Fix Windows Update Stuck at 0%, Downloading or Installing](/en/how-to-fix-windows-update-stuck). Seeing a different error code? See [How to Fix Windows Update Errors: The Complete Guide](/en/how-to-fix-windows-update-errors).
