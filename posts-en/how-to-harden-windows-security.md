---
title: "How to Harden Windows 10 and 11 Security: Complete Checklist 2026"
date: "2026-05-20"
publishDate: "2026-05-20"
description: "Complete Windows 10 and 11 security hardening checklist for 2026. Enable all built-in protections, configure account security, network settings and audit policies."
tags: ["windows", "security", "hardening", "powershell", "administration"]
readTime: 6
translatesUk: "posylennya-bezpeky-windows-cheklist"
---

A properly hardened Windows PC is dramatically harder to compromise. Here's a practical checklist organized by priority.

---

## Account Security

```powershell
# 1. Disable Guest account
Disable-LocalUser -Name "Guest"

# 2. Rename built-in Administrator
Rename-LocalUser -Name "Administrator" -NewName "LocalAdmin2026"

# 3. Check for accounts without passwords
Get-LocalUser | Where-Object {$_.PasswordRequired -eq $false -and $_.Enabled -eq $true} |
  Select-Object Name

# 4. Set account lockout (5 failed attempts)
net accounts /lockoutthreshold:5 /lockoutduration:30 /lockoutwindow:30

# 5. Enable Windows Hello PIN (removes password from login screen)
# Win + I → Accounts → Sign-in options → PIN → Set up
```

---

## Windows Defender Configuration

```powershell
# Verify all protections are enabled
Get-MpComputerStatus | Select-Object `
  RealTimeProtectionEnabled, `
  BehaviorMonitorEnabled, `
  IoavProtectionEnabled, `
  AntispywareEnabled, `
  AntivirusEnabled, `
  NISEnabled

# Enable cloud protection (highest detection rate)
Set-MpPreference -MAPSReporting Advanced
Set-MpPreference -SubmitSamplesConsent SendAllSamples
Set-MpPreference -DisableRealtimeMonitoring $false

# Enable network protection
Set-MpPreference -EnableNetworkProtection Enabled
```

---

## Firewall

```powershell
# Verify all profiles have firewall enabled
Get-NetFirewallProfile | Select-Object Name, Enabled

# Enable if any profile is off
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True

# Block inbound by default (secure baseline)
Set-NetFirewallProfile -Profile Public -DefaultInboundAction Block
```

---

## Disable Unnecessary Attack Surface

```powershell
# Disable SMB1 (major ransomware vector)
Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol -NoRestart

# Disable Remote Registry
Set-Service RemoteRegistry -StartupType Disabled
Stop-Service RemoteRegistry -Force

# Disable Autorun (prevents USB malware)
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer" `
  -Name "NoDriveTypeAutoRun" -Value 255 -Type DWord

# Disable LLMNR (prevents credential theft attacks)
New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient" -Force | Out-Null
Set-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient" `
  -Name "EnableMulticast" -Value 0 -Type DWord
```

---

## UAC and Credentials

```powershell
# Set UAC to highest level
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" `
  -Name "ConsentPromptBehaviorAdmin" -Value 2 -Type DWord

# Enable Credential Guard (requires UEFI + Secure Boot + TPM)
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\DeviceGuard" `
  -Name "EnableVirtualizationBasedSecurity" -Value 1 -Type DWord

# Disable storing LM password hashes (legacy, insecure)
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa" `
  -Name "NoLMHash" -Value 1 -Type DWord
```

---

## Audit Policies

```powershell
# Enable key audit categories
auditpol /set /subcategory:"Logon" /success:enable /failure:enable
auditpol /set /subcategory:"Account Lockout" /success:enable /failure:enable
auditpol /set /subcategory:"Process Creation" /success:enable
auditpol /set /subcategory:"Security Group Management" /success:enable /failure:enable
auditpol /set /subcategory:"Audit Policy Change" /success:enable /failure:enable
```

---

## System Hardening

```powershell
# Enable Windows Defender Application Guard (Edge isolation)
Enable-WindowsOptionalFeature -Online -FeatureName Windows-Defender-ApplicationGuard -NoRestart

# Enable Controlled Folder Access (ransomware protection)
Set-MpPreference -EnableControlledFolderAccess Enabled

# Enable Attack Surface Reduction rules
Add-MpPreference -AttackSurfaceReductionRules_Ids "D4F940AB-401B-4EFC-AADC-AD5F3C50688A" `
  -AttackSurfaceReductionRules_Actions Enabled  # Block Office macro abuse
```

---

## Quick Security Audit

```powershell
$checks = @{
  "Guest disabled"      = -not (Get-LocalUser "Guest").Enabled
  "Firewall enabled"    = (Get-NetFirewallProfile | Where-Object {-not $_.Enabled}).Count -eq 0
  "SMB1 disabled"       = (Get-WindowsOptionalFeature -Online -FeatureName SMB1Protocol).State -eq "Disabled"
  "Defender active"     = (Get-MpComputerStatus).RealTimeProtectionEnabled
  "Autorun disabled"    = (Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer" -EA 0).NoDriveTypeAutoRun -eq 255
}

$checks.GetEnumerator() | ForEach-Object {
  Write-Host "$(if($_.Value){'✅'}else{'❌'}) $($_.Key)"
}
```

---

## Summary

Priority order: enable Defender fully → firewall on → disable SMB1 → disable Guest → set UAC to max → enable audit policies → disable autorun. Run the quick audit script to check your current state.

## Frequently Asked Questions

### Is Windows Defender good enough or do I need third-party antivirus?

For most home users — yes, Defender with cloud protection is sufficient. It consistently scores 99%+ in AV-TEST benchmarks. Third-party AV often adds bloat and attack surface without meaningful security benefit.

### How do I know if my PC has been compromised?

Signs: unexpected outbound network traffic, unknown processes at high CPU, new user accounts, modified startup entries, antivirus disabled. Run `Get-ScheduledTask | Where {$_.TaskPath -eq "\"}` to check for suspicious tasks.

### Does hardening affect performance?

Minimally. The biggest performance impact is Controlled Folder Access (adds 1-3% overhead on disk writes). All other settings have negligible impact.
