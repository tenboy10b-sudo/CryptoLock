---
title: "How to Fix Windows Update Error 0x80070005 (Access Denied)"
date: "2027-02-05"
publishDate: "2027-02-05"
description: "Fix Windows Update error 0x80070005 Access Denied in Windows 10 and 11. Reset permissions, run as admin, reset Windows Update components and fix registry access."
tags: ["windows", "windows-update", "errors", "troubleshooting", "powershell"]
readTime: 5
---

Error 0x80070005 during Windows Update means "Access Denied" — Windows can't write to a file or registry key it needs. Here's how to fix it.

---

## Quick Fix: Reset Windows Update Components

```powershell
# Run as Administrator
Stop-Service wuauserv, bits, cryptsvc, msiserver -Force

# Clear update cache
Remove-Item "C:\Windows\SoftwareDistribution\*" -Recurse -Force -EA 0
Remove-Item "C:\Windows\System32\catroot2\*" -Recurse -Force -EA 0

# Restart services
Start-Service wuauserv, bits, cryptsvc, msiserver

# Try update again
Start-Process "ms-settings:windowsupdate"
```

---

## Run Windows Update Troubleshooter

```powershell
msdt.exe /id WindowsUpdateDiagnostic
```

---

## Fix Permissions on SoftwareDistribution

```powershell
# Take ownership and reset permissions
$path = "C:\Windows\SoftwareDistribution"
takeown /f $path /r /d y
icacls $path /grant Administrators:F /t /c
icacls $path /grant SYSTEM:F /t /c
```

---

## Fix via Registry Permissions

```powershell
# Reset Windows Update registry key permissions
$key = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate"

# Take ownership of the key
$regKey = [Microsoft.Win32.Registry]::LocalMachine.OpenSubKey(
  "SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate",
  [Microsoft.Win32.RegistryKeyPermissionCheck]::ReadWriteSubTree,
  [System.Security.AccessControl.RegistryRights]::ChangePermissions
)
$acl = $regKey.GetAccessControl()
$rule = New-Object System.Security.AccessControl.RegistryAccessRule(
  "Administrators", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow"
)
$acl.SetAccessRule($rule)
$regKey.SetAccessControl($acl)
Write-Host "Registry permissions reset"
```

---

## Repair System Files

```powershell
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
```

---

## Disable Third-Party Antivirus Temporarily

Third-party antivirus sometimes blocks Windows Update file writes:

1. Right-click antivirus tray icon → disable protection
2. Run Windows Update
3. Re-enable protection after update completes

---

## Run Update as Administrator

```powershell
# Force update check with elevated privileges
Start-Process powershell -Verb RunAs -ArgumentList {
  Install-Module PSWindowsUpdate -Force -EA 0
  Get-WUInstall -AcceptAll -AutoReboot -EA 0
}
```

---

## Summary

Reset update cache + services → run troubleshooter → fix SoftwareDistribution permissions → repair system files → disable antivirus temporarily. Most 0x80070005 errors are fixed by the cache reset + DISM combination.

## Frequently Asked Questions

### Why does 0x80070005 appear only for some updates?

The specific update may require access to a file or registry key that has restricted permissions. DISM /RestoreHealth usually fixes this by downloading fresh copies of affected components.

### Error persists after all fixes — what's next?

Try a manual update: download the specific KB from catalog.update.microsoft.com and install directly. This bypasses the Windows Update service entirely.

### Can third-party tools like Malwarebytes cause 0x80070005?

Yes. Security software that uses driver-level file monitoring can block Windows Update writes. Disable it temporarily for the update, then re-enable.
