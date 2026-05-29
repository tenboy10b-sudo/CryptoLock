---
title: "How to Use Group Policy Editor in Windows 10 and 11"
date: "2026-03-07"
publishDate: "2026-03-07"
description: "Group Policy Editor lets you control Windows behavior beyond what Settings allows. How to open gpedit.msc, navigate policies, and apply the most useful security and productivity settings."
tags: ["windows", "gpo", "security", "administration"]
readTime: 7
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

## Group Policy vs Registry

Most Group Policy settings write to specific registry keys. You can apply the same settings via registry on Windows Home (which lacks gpedit.msc):

```
Computer Configuration policies → HKLM\SOFTWARE\Policies\Microsoft\Windows
User Configuration policies → HKCU\SOFTWARE\Policies\Microsoft\Windows
```

---

## Summary

Open with `gpedit.msc` → navigate to policy → Enabled/Disabled → `gpupdate /force`. For security: set account lockout, password complexity, screen saver timeout, and disable AutoRun. Use `gpresult /r` to verify which policies are active. Reset with the RD commands if something breaks.
