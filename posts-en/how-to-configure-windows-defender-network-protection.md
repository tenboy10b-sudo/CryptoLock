---
title: "How to Enable Windows Defender Network Protection"
date: "2026-06-27"
publishDate: "2026-06-27"
description: "Enable Windows Defender Network Protection to block connections to malicious IP addresses and domains. Configure via PowerShell, GPO and monitor blocked connections."
tags: ["windows", "windows-defender", "network", "security", "powershell"]
readTime: 4
translatesUk: "windows-defender-network-protection"
---

Network Protection extends SmartScreen to all apps — it blocks outbound connections to known malicious IP addresses and domains, not just in Edge.

---

## Enable Network Protection

```powershell
# Enable (Block mode)
Set-MpPreference -EnableNetworkProtection Enabled

# Audit mode (log without blocking — test first)
Set-MpPreference -EnableNetworkProtection AuditMode

# Disable
Set-MpPreference -EnableNetworkProtection Disabled

# Check current status
# 0 = Disabled, 1 = Enabled (Block), 2 = AuditMode
(Get-MpPreference).EnableNetworkProtection
```

---

## Requirements

```powershell
# Network Protection requires:
# - Windows 10 1709+
# - Windows Defender real-time protection enabled
# - Microsoft Defender Antivirus (not a third-party AV)

(Get-MpComputerStatus).RealTimeProtectionEnabled
```

---

## Configure via Group Policy

`gpedit.msc` → `Computer Configuration` → `Administrative Templates` → `Windows Components` → `Microsoft Defender Antivirus` → `Microsoft Defender Exploit Guard` → `Network Protection`

- **Prevent users and apps from accessing dangerous websites** → Enabled → Block

---

## Monitor Network Protection Events

```powershell
# Event IDs: 1125 (blocked), 1126 (audited)
Get-WinEvent -FilterHashtable @{
  LogName='Microsoft-Windows-Windows Defender/Operational'
  Id=1125,1126
} -MaxEvents 20 -EA 0 |
  Select-Object TimeCreated, Id,
    @{n='URL/IP';e={$_.Properties[1].Value}},
    @{n='Process';e={$_.Properties[5].Value}} |
  Format-Table -AutoSize
```

---

## Custom Block List

```powershell
# Add custom indicator (block specific IP)
# Via Microsoft 365 Defender portal: Settings → Endpoints → Indicators → IP addresses

# Or via PowerShell with Defender for Endpoint API
# (requires M365 Defender license)
```

---

## Test Network Protection

```powershell
# Test if Network Protection is working
# Microsoft provides a test URL: smartscreentestratings.com

# In browser, navigate to:
# http://smartscreen-demo.com/phishing.html
# Should be blocked by Network Protection
```

---

## Summary

Enable with `Set-MpPreference -EnableNetworkProtection Enabled`. Start with AuditMode. Monitor with Event 1125 (blocked). Requires real-time protection enabled. Works with all apps — not just Edge. Use GPO for domain-wide deployment.

## Frequently Asked Questions

### Network Protection vs Windows Firewall — what's the difference?

Firewall controls which ports and protocols are allowed. Network Protection uses threat intelligence to block connections to known malicious sites/IPs regardless of port. They complement each other.

### An app I trust is being blocked — how to allow it?

Add an exclusion for the specific process:
```powershell
Add-MpPreference -ExclusionProcess "C:\TrustedApp\app.exe"
```

Or switch to AuditMode temporarily to identify what's being blocked with Event 1126.

### Does Network Protection work with Chrome and Firefox?

Yes. Network Protection operates at the Windows network stack level, below individual browsers. It affects all applications including Chrome, Firefox, PowerShell and custom apps.
