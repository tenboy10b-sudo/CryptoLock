---
title: "How to Configure AppLocker to Restrict Application Execution in Windows"
date: "2026-06-07"
publishDate: "2026-06-07"
description: "Configure AppLocker in Windows to allow or block apps by publisher, path or hash. Create rules for executables, scripts and installers via PowerShell and GPO."
tags: ["windows", "applocker", "security", "gpo", "powershell", "administration"]
readTime: 6
translatesUk: "nalashtuvannya-applocker-windows"
---

AppLocker lets you control which applications can run on a PC — by publisher signature, file path, or cryptographic hash. It's the enterprise answer to "how do I stop users from running unauthorized software."

---

## Requirements

- Windows 10/11 **Enterprise** or **Education** (Pro has limited AppLocker)
- Application Identity service must be running

```powershell
# Start and enable Application Identity service
Start-Service AppIDSvc
Set-Service AppIDSvc -StartupType Automatic
```

---

## AppLocker Rule Types

- **Executable rules** — .exe, .com files
- **Windows Installer rules** — .msi, .msp files
- **Script rules** — .ps1, .bat, .cmd, .vbs, .js
- **DLL rules** — .dll, .ocx (advanced, use carefully)
- **Packaged app rules** — Microsoft Store apps

---

## Create Rules via GUI

`Win + R` → `secpol.msc` → **Application Control Policies** → **AppLocker**

Right-click **Executable Rules** → **Create New Rule** → wizard

Or right-click → **Automatically Generate Rules** to create rules based on installed software.

---

## Create Rules via PowerShell

```powershell
# Create policy object
$policy = New-Object Microsoft.Security.ApplicationId.PolicyManagement.PolicyModel.AppLockerPolicy

# Allow by Publisher (preferred — works across versions)
New-AppLockerPolicy -RuleType Publisher -FileInformation (Get-AppLockerFileInformation -Path "C:\Program Files\Notepad++\notepad++.exe") -User Everyone | Set-AppLockerPolicy -Merge

# Allow by Path
New-AppLockerPolicy -RuleType Path -FileInformation (Get-AppLockerFileInformation -Directory "C:\Program Files") -User Everyone | Set-AppLockerPolicy -Merge

# Allow by Hash (specific file version)
New-AppLockerPolicy -RuleType Hash -FileInformation (Get-AppLockerFileInformation -Path "C:\Tools\app.exe") -User Everyone | Set-AppLockerPolicy -Merge
```

---

## Get AppLocker Policy Information

```powershell
# Get current effective policy
Get-AppLockerPolicy -Effective | Format-List

# Export policy to XML
Get-AppLockerPolicy -Effective -Xml | Out-File "C:\Backup\applocker-policy.xml"

# Import policy from XML
Set-AppLockerPolicy -XmlPolicy "C:\Backup\applocker-policy.xml"

# Get file information for rule creation
Get-AppLockerFileInformation -Path "C:\Program Files\Chrome\chrome.exe"
Get-AppLockerFileInformation -Directory "C:\Windows\System32" -Recurse
```

---

## Test Policy (Audit Mode)

```powershell
# Test if a file would be allowed or blocked
Test-AppLockerPolicy -Path "C:\Downloads\suspicious.exe" -User Everyone

# Set rules to Audit mode first (logs without blocking)
# In secpol.msc: right-click rule collection → Properties → Enforcement → Audit only
```

---

## Block Specific App

```powershell
# Block a specific executable by hash (cannot be bypassed by rename)
$fileInfo = Get-AppLockerFileInformation -Path "C:\Downloads\blocked.exe"

$rule = New-AppLockerPolicy -RuleType Hash `
  -FileInformation $fileInfo `
  -User Everyone `
  -Action Deny

$rule | Set-AppLockerPolicy -Merge
```

---

## Configure via Group Policy

`gpedit.msc` → `Computer Configuration` → `Windows Settings` → `Security Settings` → `Application Control Policies` → `AppLocker`

Steps:
1. Configure rule enforcement (Executable Rules → Enforced)
2. Create default rules (right-click → Create Default Rules) — allows Windows and Program Files
3. Add specific allow/deny rules

---

## Monitor AppLocker Events

```powershell
# Blocked executions (Event ID 8004)
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-AppLocker/EXE and DLL'; Id=8004} -MaxEvents 20 |
  Select-Object TimeCreated, Message

# Allowed (8002)
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-AppLocker/EXE and DLL'; Id=8002} -MaxEvents 10 |
  Select-Object TimeCreated, @{n='File';e={$_.Properties[8].Value}}
```

---

## Summary

Requires AppIDSvc running. Create rules via `secpol.msc` or PowerShell. Prefer Publisher rules (version-independent). Always create default rules before enforcing. Start with Audit mode. Monitor Event 8004 for blocks.

## Frequently Asked Questions

### Does AppLocker work on Windows 10 Pro?

Partially — rules can be created and audited but enforcement requires Enterprise or Education. On Pro, AppLocker runs in audit-only mode regardless of settings.

### A user renamed an executable to bypass AppLocker — how to prevent?

Publisher and Hash rules can't be bypassed by renaming. Path rules can. Always use Publisher rules when available, Hash rules for unsigned executables.

### AppLocker vs Windows Defender Application Control (WDAC)?

WDAC is the modern replacement. It's enforced in kernel mode (harder to bypass), works on all editions, but is more complex to configure. AppLocker is simpler but less secure. Use WDAC for new deployments.
