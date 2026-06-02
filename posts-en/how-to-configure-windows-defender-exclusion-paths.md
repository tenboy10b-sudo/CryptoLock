---
title: "Windows Defender Controlled Folder Access: Ransomware Protection Guide"
date: "2026-06-05"
publishDate: "2026-06-05"
description: "Enable and configure Windows Defender Controlled Folder Access to protect against ransomware. Allow trusted apps, add protected folders and monitor blocked attempts."
tags: ["windows", "windows-defender", "ransomware", "security", "powershell"]
readTime: 5
---

Controlled Folder Access blocks unauthorized apps from modifying protected folders — your main defense against ransomware encrypting files.

---

## Enable Controlled Folder Access

```powershell
# Enable
Set-MpPreference -EnableControlledFolderAccess Enabled

# Check current status
(Get-MpPreference).EnableControlledFolderAccess
# 0 = Disabled, 1 = Enabled, 2 = Audit mode
```

Or: `Win + I` → **Windows Security** → **Virus & threat protection** → **Ransomware protection** → **Controlled folder access** → On

---

## Set Audit Mode (Test Without Blocking)

```powershell
# Audit mode — logs without blocking
Set-MpPreference -EnableControlledFolderAccess AuditMode

# Run for 1 week, check what would be blocked, then enable fully
```

---

## View Protected Folders

By default, Windows protects:
- Documents, Pictures, Videos, Music, Desktop, Favorites

```powershell
# See all protected folders
(Get-MpPreference).ControlledFolderAccessProtectedFolders
```

---

## Add Custom Protected Folders

```powershell
# Protect additional folders
Add-MpPreference -ControlledFolderAccessProtectedFolders "C:\Projects"
Add-MpPreference -ControlledFolderAccessProtectedFolders "D:\Work\Contracts"
Add-MpPreference -ControlledFolderAccessProtectedFolders "E:\Backups"

# Remove a folder from protection
Remove-MpPreference -ControlledFolderAccessProtectedFolders "C:\Projects"
```

---

## Allow Trusted Apps

Apps that legitimately need to write to protected folders:

```powershell
# Allow a specific app
Add-MpPreference -ControlledFolderAccessAllowedApplications "C:\Program Files\MyApp\app.exe"

# View allowed apps
(Get-MpPreference).ControlledFolderAccessAllowedApplications

# Remove from allowed list
Remove-MpPreference -ControlledFolderAccessAllowedApplications "C:\Program Files\MyApp\app.exe"
```

---

## Monitor Blocked Attempts

```powershell
# Event ID 1123 = blocked by Controlled Folder Access
# Event ID 1124 = blocked in audit mode

Get-WinEvent -FilterHashtable @{
  LogName = 'Microsoft-Windows-Windows Defender/Operational'
  Id = 1123, 1124
} -MaxEvents 20 -EA 0 |
  Select-Object TimeCreated, Id,
    @{n='App';e={$_.Properties[1].Value}},
    @{n='Folder';e={$_.Properties[2].Value}} |
  Format-Table -AutoSize
```

---

## Configure via Group Policy

`gpedit.msc` → `Computer Configuration` → `Administrative Templates` → `Windows Components` → `Microsoft Defender Antivirus` → `Microsoft Defender Exploit Guard` → `Controlled Folder Access`

- **Configure Controlled Folder Access** → Enabled → Mode: Enabled or Audit

---

## Ransomware Recovery with OneDrive

If ransomware does encrypt files despite protection:

```powershell
# Check if OneDrive version history is configured
# OneDrive has 30-day version history for personal, longer for Business

# Open OneDrive recycle bin
Start-Process "https://onedrive.live.com/recycle"
```

---

## Full Ransomware Protection Checklist

```powershell
# Check all ransomware protections
$cfa = (Get-MpPreference).EnableControlledFolderAccess
$rtp = (Get-MpComputerStatus).RealTimeProtectionEnabled
$np  = (Get-MpPreference).EnableNetworkProtection
$backup = Test-Path "\\BackupServer\Backups"

Write-Host "Controlled Folder Access: $(if($cfa -eq 1){'✅ Enabled'}else{'❌ Disabled'})"
Write-Host "Real-time Protection:     $(if($rtp){'✅ Enabled'}else{'❌ Disabled'})"
Write-Host "Network Protection:       $(if($np -eq 1){'✅ Enabled'}else{'❌ Disabled'})"
Write-Host "Offline Backup reachable: $(if($backup){'✅ Yes'}else{'⚠️ No'})"
```

---

## Summary

Enable with `Set-MpPreference -EnableControlledFolderAccess Enabled`. Start with Audit mode. Add folders with `Add-MpPreference -ControlledFolderAccessProtectedFolders`. Allow trusted apps to prevent false positives. Monitor Event 1123 for blocked attempts.

## Frequently Asked Questions

### An app stopped working after enabling CFA — how to fix?

Add the app to the allowed list: `Add-MpPreference -ControlledFolderAccessAllowedApplications "C:\Path\To\App.exe"`. Check Event 1123 first to confirm it's being blocked by CFA.

### Does CFA protect external drives and NAS shares?

CFA primarily protects local folders. Network shares and external drives can be added manually but protection may be limited. The best protection for NAS is enabling versioning/snapshots on the NAS device itself.

### Can ransomware bypass Controlled Folder Access?

Sophisticated ransomware may try to use allowed processes (like Explorer) to write files. CFA is one layer — combine with backups, network isolation and Defender ASR rules for comprehensive protection.
