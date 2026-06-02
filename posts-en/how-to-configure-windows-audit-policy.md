---
title: "How to Configure Windows Audit Policy for Security Monitoring"
date: "2026-06-02"
publishDate: "2026-06-02"
description: "Configure Windows audit policy to track logons, account changes, process creation and privilege use. Enable advanced audit via PowerShell and Group Policy."
tags: ["windows", "audit", "security", "event-log", "powershell", "administration"]
readTime: 5
---

Windows Audit Policy controls what security events get recorded in the Security Event Log. Without it, you're flying blind — attacks happen but leave no trace.

---

## View Current Audit Settings

```powershell
# Basic audit policy
auditpol /get /category:*

# Advanced audit policy (more granular)
auditpol /get /subcategory:* | Where-Object {$_ -match "Logon|Account|Process|Policy"}
```

---

## Enable Recommended Audit Categories

```powershell
# Logon events (detect brute force, unauthorized access)
auditpol /set /subcategory:"Logon" /success:enable /failure:enable
auditpol /set /subcategory:"Logoff" /success:enable

# Account management (detect new accounts, group changes)
auditpol /set /subcategory:"User Account Management" /success:enable /failure:enable
auditpol /set /subcategory:"Security Group Management" /success:enable /failure:enable

# Process creation (detect malware execution)
auditpol /set /subcategory:"Process Creation" /success:enable
auditpol /set /subcategory:"Process Termination" /success:enable

# Policy changes (detect audit tampering)
auditpol /set /subcategory:"Audit Policy Change" /success:enable /failure:enable
auditpol /set /subcategory:"Authentication Policy Change" /success:enable

# Privilege use (detect elevation abuse)
auditpol /set /subcategory:"Sensitive Privilege Use" /success:enable /failure:enable

# Object access (detect file access — enable only on specific folders)
auditpol /set /subcategory:"File System" /success:enable /failure:enable
```

---

## Enable Command Line Logging

Critical for detecting malicious PowerShell and CMD commands:

```powershell
# Enable process command line in logs
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Audit" `
  -Name "ProcessCreationIncludeCmdLine_Enabled" -Value 1 -Type DWord -Force
```

After enabling, Event ID 4688 will include full command line.

---

## Verify Key Events Are Logging

```powershell
# Test that logon events are captured
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4624} -MaxEvents 3 |
  Select-Object TimeCreated, @{n='Account';e={$_.Properties[5].Value}}

# Test that process creation is captured
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4688} -MaxEvents 3 |
  Select-Object TimeCreated, @{n='Process';e={$_.Properties[5].Value}},
    @{n='CommandLine';e={$_.Properties[8].Value}}
```

---

## Configure via Group Policy

`gpedit.msc` → `Computer Configuration` → `Windows Settings` → `Security Settings` → `Advanced Audit Policy Configuration`

Recommended minimum settings:
- **Account Logon** → Credential Validation: Success, Failure
- **Account Management** → User/Group Management: Success, Failure
- **Logon/Logoff** → Logon: Success, Failure
- **Object Access** → File System: Failure (Success only for sensitive paths)
- **Policy Change** → Audit Policy Change: Success
- **Privilege Use** → Sensitive Privilege Use: Success, Failure
- **System** → Security State Change: Success

---

## Monitor Critical Event IDs

```powershell
# Suspicious activity dashboard
$criticalEvents = @{
  4625 = "Failed logon"
  4720 = "User account created"
  4726 = "User account deleted"
  4728 = "Member added to privileged group"
  4732 = "Member added to local admin group"
  4698 = "Scheduled task created"
  7045 = "New service installed"
  1102 = "Audit log cleared"
  4719 = "Audit policy changed"
}

foreach ($id in $criticalEvents.Keys) {
  $count = (Get-WinEvent -FilterHashtable @{
    LogName='Security','System'; Id=$id;
    StartTime=(Get-Date).AddHours(-24)
  } -EA 0).Count
  if ($count -gt 0) {
    Write-Host "⚠️ Event $id ($($criticalEvents[$id])): $count in last 24h"
  }
}
```

---

## Increase Security Log Size

```powershell
# Default 20 MB is too small — increase to 256 MB
wevtutil sl Security /ms:268435456

# Verify
wevtutil gl Security | Select-String "maxSize"
```

---

## Export Audit Report

```powershell
# Daily security report
$events = Get-WinEvent -FilterHashtable @{
  LogName='Security'
  Level=0,1,2,3
  StartTime=(Get-Date).AddHours(-24)
} -MaxEvents 1000 -EA 0

$events | Select-Object TimeCreated, Id, Message |
  Export-Csv "C:\Reports\security-$(Get-Date -Format 'yyyy-MM-dd').csv" -NoTypeInformation
```

---

## Summary

Enable with `auditpol /set`. Command line logging requires registry key. Always audit: Logon (success+failure), Account Management, Process Creation, Policy Change. Increase log size to 256 MB. Monitor Event IDs 4625, 4720, 7045, 1102 daily.

## Frequently Asked Questions

### Does enabling all audit categories slow Windows down?

Minimally — 1-3% overhead for high-volume categories like File System. Process Creation and Logon have negligible impact. The security benefit far outweighs the cost.

### Audit log fills up too fast — what to do?

Increase log size with `wevtutil sl Security /ms:268435456`. Also review what you're auditing — Object Access (File System) generates massive volume. Enable it only for specific sensitive folders using SACL, not system-wide.

### How do I know if someone cleared the audit log?

Event ID 1102 is logged before the log is cleared — in the Security log itself. This is why you need to export logs regularly or use Event Forwarding to a central collector.
