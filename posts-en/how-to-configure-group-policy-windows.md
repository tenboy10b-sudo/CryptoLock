---
title: "How to Use Group Policy Editor in Windows 10 and 11"
date: "2026-03-07"
publishDate: "2026-03-07"
description: "Group Policy Editor lets you control Windows behavior beyond what Settings allows. How to open gpedit.msc, navigate policies, and apply the most useful security and productivity settings."
tags: ["windows", "gpo", "security", "administration"]
readTime: 7
translatesUk: "grupova-polityka-gpedit-windows"
---

Group Policy Editor (gpedit.msc) gives you fine-grained control over Windows — far beyond what Settings and Control Panel expose. It's available on Windows 10/11 Pro, Enterprise, and Education.

---

## Open Group Policy Editor

`Win + R` → `gpedit.msc`

Or: `Win + S` → search **Edit group policy**

The editor has two main sections:
- **Computer Configuration** — applies to the machine regardless of who's logged in
- **User Configuration** — applies to the current user

---

## How to Apply a Policy

1. Navigate to the policy using the left panel tree
2. Double-click the policy
3. Select **Enabled**, **Disabled**, or **Not Configured**
4. Configure options if available
5. Click **OK**

Apply immediately without restarting:
```cmd
gpupdate /force
```

---

## Most Useful Security Policies

### Require password after screen saver

```
User Configuration → Administrative Templates →
Control Panel → Personalization
```
- **Enable screen saver** → Enabled
- **Screen saver timeout** → 300 seconds
- **Password protect the screen saver** → Enabled

---

### Account lockout after failed logins

```
Computer Configuration → Windows Settings →
Security Settings → Account Policies → Account Lockout Policy
```
- **Account lockout threshold**: 5 attempts
- **Account lockout duration**: 15 minutes
- **Reset account lockout counter after**: 15 minutes

---

### Disable USB storage devices

```
Computer Configuration → Administrative Templates →
System → Removable Storage Access
```
- **Removable Disks: Deny read access** → Enabled
- **Removable Disks: Deny write access** → Enabled

---

### Block access to Command Prompt

```
User Configuration → Administrative Templates → System
```
- **Prevent access to the command prompt** → Enabled
- Also disable script processing: **Yes**

---

### Disable AutoRun

```
Computer Configuration → Administrative Templates →
Windows Components → AutoPlay Policies
```
- **Turn off AutoPlay** → Enabled → **All drives**

---

### Minimum password length and complexity

```
Computer Configuration → Windows Settings →
Security Settings → Account Policies → Password Policy
```
- **Minimum password length**: 12
- **Password must meet complexity requirements**: Enabled
- **Maximum password age**: 90 days

---

## Most Useful Productivity Policies

### Remove items from Start Menu

```
User Configuration → Administrative Templates → Start Menu and Taskbar
```
Many options: remove search, remove power button, disable taskbar customization.

---

### Disable Windows tips and suggestions

```
User Configuration → Administrative Templates →
Windows Components → Cloud Content
```
- **Turn off Microsoft consumer experiences** → Enabled
- **Do not show Windows tips** → Enabled

---

### Redirect My Documents to a network share

```
User Configuration → Windows Settings →
Folder Redirection → Documents
```
Right-click → Properties → set target to a network path.

---

### Disable access to Control Panel

```
User Configuration → Administrative Templates →
Control Panel
```
- **Prohibit access to Control Panel and PC settings** → Enabled

Useful for kiosk or shared PCs.

---

## Check Applied Policies

```cmd
gpresult /r
```

Shows which policies are applied to the current user and computer.

For detailed HTML report:
```cmd
gpresult /h C:\GPReport.html
start C:\GPReport.html
```

---

## Export and Import Policies

**Export current local policy:**
```cmd
secedit /export /cfg C:\LocalPolicy.inf
```

**Import on another PC:**
```cmd
secedit /configure /db secedit.sdb /cfg C:\LocalPolicy.inf /overwrite
gpupdate /force
```

---

## Reset All Policies to Default

If policies are misconfigured and causing problems:

```cmd
RD /S /Q "%WinDir%\System32\GroupPolicyUsers"
RD /S /Q "%WinDir%\System32\GroupPolicy"
gpupdate /force
```

This resets all local group policy settings to Windows defaults.

---

## More Useful Policies

```
Computer Configuration → Administrative Templates:

Windows Components → Windows Update
  → Configure Automatic Updates
  → Specify intranet Microsoft update service (WSUS)

Windows Components → BitLocker Drive Encryption
  → Operating System Drives → Require additional authentication

System → Logon
  → Do not display last signed-in user → Enabled
```

---

## Refresh Specific Policy Scope

```cmd
gpupdate /target:computer /force
gpupdate /target:user /force
gpupdate /force /logoff
```

---

## Troubleshoot Group Policy Not Applying

```powershell
# Visual tool — what applied and from where
rsop.msc

# Group Policy processing events
Get-WinEvent -FilterHashtable @{
  LogName='System'
  ProviderName='Microsoft-Windows-GroupPolicy'
} -MaxEvents 20 | Select-Object TimeCreated, Id, Message | Format-List

# Clear cached GPO data and reapply
Remove-Item "C:\ProgramData\Microsoft\Group Policy\History" -Recurse -Force -EA 0
gpupdate /force
```

---

## Enable gpedit.msc on Windows Home

```powershell
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

## Group Policy vs Registry

Most Group Policy settings write to specific registry keys. You can apply the same settings via registry on Windows Home (which lacks gpedit.msc):

```
Computer Configuration policies → HKLM\SOFTWARE\Policies\Microsoft\Windows
User Configuration policies → HKCU\SOFTWARE\Policies\Microsoft\Windows
```

---

## Summary

Open with `gpedit.msc` → navigate to policy → Enabled/Disabled → `gpupdate /force`. For security: set account lockout, password complexity, screen saver timeout, and disable AutoRun. Use `gpresult /r` to verify which policies are active. Reset with the RD commands if something breaks.

## Frequently Asked Questions

### A Group Policy setting isn't applying — how to troubleshoot?

1. Run `gpupdate /force` and restart
2. Check `gpresult /r` to see if policy is in Applied or Denied GPOs
3. Verify the policy path in gpedit matches what you configured
4. Check Event Viewer → System for Group Policy errors (Event ID 1085, 1125)

### Can users override Group Policy settings?

No — Computer Configuration policies are enforced and users cannot change them through Settings or Registry. User Configuration policies can sometimes be overridden if the user has admin rights.
