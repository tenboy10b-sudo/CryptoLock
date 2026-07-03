---
title: "How to Use Group Policy Editor (gpedit.msc) in Windows 10 and 11"
date: "2026-07-02"
publishDate: "2026-07-02"
description: "Use Group Policy Editor to configure Windows security, restrictions and settings. Apply GPO policies, force refresh, troubleshoot with gpresult and rsop.msc."
tags: ["windows", "gpo", "group-policy", "administration", "security", "powershell"]
readTime: 5
translatesUk: "redaktor-hrupovykh-polityky-gpedit"
---

Group Policy Editor is the most powerful configuration tool in Windows — letting you enforce settings that can't be changed through the normal Settings app.

---

## Open Group Policy Editor

```powershell
# Open gpedit.msc (Pro/Enterprise/Education only)
gpedit.msc

# Open for specific user
runas /user:Administrator "gpedit.msc"
```

**Note:** gpedit.msc is not available on Windows Home. Use registry edits instead.

---

## Structure of Group Policy

```
Computer Configuration (applies to machine regardless of user)
├── Software Settings
├── Windows Settings
│   ├── Security Settings
│   └── Scripts
└── Administrative Templates (registry-based settings)

User Configuration (applies to logged-in user)
├── Software Settings
├── Windows Settings
└── Administrative Templates
```

---

## Common Useful Policies

```
Computer Configuration → Administrative Templates:

Windows Components → Windows Update
  → Configure Automatic Updates
  → Specify intranet Microsoft update service (WSUS)

Windows Components → BitLocker Drive Encryption
  → Operating System Drives → Require additional authentication

Windows Components → Windows Defender Antivirus
  → Turn off Windows Defender Antivirus → Disabled (keep it on)

System → Logon
  → Do not display last signed-in user → Enabled

Windows Settings → Security Settings → Account Policies
  → Password Policy → Minimum password length: 12
  → Account Lockout Policy → 5 attempts
```

---

## Apply and Refresh Group Policy

```powershell
# Force immediate refresh
gpupdate /force

# Refresh only Computer policy
gpupdate /target:computer /force

# Refresh only User policy
gpupdate /target:user /force

# Refresh and log off (required for some policies)
gpupdate /force /logoff

# Refresh and restart
gpupdate /force /boot
```

---

## Check Which Policies Are Applied

```powershell
# Full report of applied policies
gpresult /r

# HTML report (most readable)
gpresult /h "C:\gpo-report.html"
Start-Process "C:\gpo-report.html"

# For specific user
gpresult /user Username /r

# Check specific setting
gpresult /r | Select-String "Windows Update"
```

---

## Troubleshoot Group Policy

```powershell
# Open Resultant Set of Policy (visual tool)
rsop.msc

# Check GPO processing events
Get-WinEvent -FilterHashtable @{
  LogName='System'
  ProviderName='Microsoft-Windows-GroupPolicy'
} -MaxEvents 20 | Select-Object TimeCreated, Id, Message | Format-List

# Clear cached GPO data (force full reapply)
Remove-Item "C:\ProgramData\Microsoft\Group Policy\History" -Recurse -Force -EA 0
gpupdate /force
```

---

## Enable gpedit.msc on Windows Home

```powershell
# Script to install Group Policy Editor on Windows Home
# Run as Administrator
$gpeditBat = @"
@echo off
pushd "%~dp0"
dir /b %SystemRoot%\servicing\Packages\Microsoft-Windows-GroupPolicy-ClientExtensions-Package~3*.mum >List.txt
dir /b %SystemRoot%\servicing\Packages\Microsoft-Windows-GroupPolicy-ClientTools-Package~3*.mum >>List.txt
for /f %%i in ('findstr /i . List.txt 2^>nul') do dism /online /norestart /add-package:"%SystemRoot%\servicing\Packages\%%i"
pause
"@

$gpeditBat | Out-File "C:\temp\install-gpedit.bat" -Encoding ASCII
Write-Host "Run C:\temp\install-gpedit.bat as Administrator"
```

---

## Summary

`gpedit.msc` for GUI, `gpupdate /force` to apply, `gpresult /h` for HTML report. Use Computer Configuration for machine-wide settings, User Configuration for per-user. Check `rsop.msc` when policies seem not to apply.

## Frequently Asked Questions

### A Group Policy setting isn't applying — how to troubleshoot?

1. Run `gpupdate /force` and restart
2. Check `gpresult /r` to see if policy is in Applied or Denied GPOs
3. Verify the policy path in gpedit matches what you configured
4. Check Event Viewer → System for Group Policy errors (Event ID 1085, 1125)

### Can users override Group Policy settings?

No — Computer Configuration policies are enforced and users cannot change them through Settings or Registry (the registry key is protected). User Configuration policies can sometimes be overridden if the user has admin rights.

### gpedit.msc shows a setting but it's not working — why?

Some policies require the feature to be installed. For example, Windows Defender policies don't apply if a third-party AV is active. Check the policy's "Supported on" field in the Explain tab for prerequisites.
