---
title: "How to Secure Windows 10 and 11: Essential Security Checklist"
date: "2026-05-21"
publishDate: "2026-05-21"
description: "A practical security checklist for Windows 10 and 11: enable the right protections, lock down accounts, configure updates, and avoid the most common attack vectors."
tags: ["windows", "security", "tools", "administration"]
readTime: 7
---

Most Windows PCs ship with reasonable defaults but leave several important protections disabled or misconfigured. This checklist covers the essential steps — in order of impact.

---

## 1. Keep Windows Updated

Security patches are the single most important protection. Configure updates to install automatically:

`Win + I` → **Windows Update** → **Advanced options** → enable **Receive updates for other Microsoft products** and set **Active hours** so updates don't interrupt you.

```powershell
# Check for updates immediately
Install-Module PSWindowsUpdate -Force
Get-WindowsUpdate -Install -AcceptAll
```

---

## 2. Use a Standard Account for Daily Use

Running as Administrator means every program you run has admin rights — including malware.

Create a standard account for daily use:

```powershell
New-LocalUser -Name "Daily" -Password (ConvertTo-SecureString "StrongPass123!" -AsPlainText -Force)
Add-LocalGroupMember -Group "Users" -Member "Daily"
```

Keep your admin account for system changes only. When an app needs elevation, Windows will prompt for the admin password.

---

## 3. Enable BitLocker

Without disk encryption, anyone with physical access to your PC can read your files by booting from USB.

`Win + S` → **Manage BitLocker** → **Turn on BitLocker** for drive C.

Save the recovery key to your Microsoft account or print it — don't lose it.

```powershell
# Check BitLocker status
Get-BitLockerVolume | Select-Object MountPoint, ProtectionStatus, EncryptionPercentage
```

---

## 4. Configure Windows Defender Properly

Defender is good — but check these settings:

```powershell
# Verify real-time protection is on
Get-MpPreference | Select-Object DisableRealtimeMonitoring

# Enable cloud protection
Set-MpPreference -MAPSReporting Advanced
Set-MpPreference -SubmitSamplesConsent SendAllSamples

# Schedule weekly full scan
Set-MpPreference -ScanScheduleDay Sunday -ScanParameters FullScan
```

---

## 5. Use Strong, Unique Passwords

Enable password complexity requirements:

`Win + R` → `secpol.msc` → **Account Policies** → **Password Policy**:
- Minimum password length: **12**
- Password must meet complexity requirements: **Enabled**
- Maximum password age: **90 days**

Use a password manager (Bitwarden, KeePass) — don't reuse passwords.

---

## 6. Enable Account Lockout

Lock accounts after failed login attempts to prevent brute force:

```powershell
# Lock account after 5 failed attempts for 15 minutes
net accounts /lockoutthreshold:5 /lockoutduration:15 /lockoutwindow:15
```

Or: `secpol.msc` → **Account Policies** → **Account Lockout Policy**

---

## 7. Disable Unnecessary Services

Reduce attack surface by disabling services you don't use:

```powershell
# Remote Registry — allows remote registry editing (rarely needed)
Set-Service RemoteRegistry -StartupType Disabled

# Telnet (if installed)
Set-Service TlntSvr -StartupType Disabled -ErrorAction SilentlyContinue

# Check for open ports
Get-NetTCPConnection -State Listen | Select-Object LocalPort, OwningProcess | Sort-Object LocalPort
```

---

## 8. Configure Windows Firewall

Ensure all profiles are enabled and block inbound by default:

```powershell
Set-NetFirewallProfile -All -Enabled True -DefaultInboundAction Block -DefaultOutboundAction Allow
```

---

## 9. Enable Secure Boot and TPM

`Win + R` → `msinfo32` → check:
- **Secure Boot State**: On
- **BIOS Mode**: UEFI (required for Secure Boot)

If Secure Boot is off — enable it in BIOS/UEFI settings.

---

## 10. Disable AutoRun for USB Drives

AutoRun is a classic malware vector — USB plugged in, malware runs automatically.

```powershell
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer" `
  -Name "NoDriveTypeAutoRun" -Value 255 -Type DWord
```

Or: `Win + R` → `gpedit.msc` → **Computer Configuration** → **Administrative Templates** → **Windows Components** → **AutoPlay Policies** → **Turn off AutoPlay** → **Enabled**

---

## 11. Use DNS over HTTPS

Encrypts DNS queries so your ISP can't log the sites you visit:

`Settings` → **Network & Internet** → your connection → **DNS server assignment** → **Edit** → Manual → enter `1.1.1.1`, set **DNS over HTTPS** to **On**

---

## 12. Review App Permissions

Check which apps have access to your camera, microphone, and location:

`Win + I` → **Privacy & Security** → review **Camera**, **Microphone**, **Location** — revoke access for apps that don't need it.

---

## Quick Audit Script

```powershell
Write-Host "=== Security Audit ===" -ForegroundColor Cyan

# Firewall
$fw = Get-NetFirewallProfile
Write-Host "Firewall: $($fw | ForEach-Object {"$($_.Name)=$($_.Enabled)"} | Join-String ', ')"

# Defender
$def = Get-MpComputerStatus
Write-Host "Defender RealTime: $($def.RealTimeProtectionEnabled)"

# BitLocker
$bl = Get-BitLockerVolume -MountPoint C:
Write-Host "BitLocker C: $($bl.ProtectionStatus)"

# Pending updates
$updates = (New-Object -ComObject Microsoft.Update.Session).CreateUpdateSearcher().Search("IsInstalled=0").Updates.Count
Write-Host "Pending updates: $updates"
```

---

## Summary

Priority order: keep Windows updated → use a standard account → enable BitLocker → verify Defender is configured correctly → enable account lockout. These five steps block the vast majority of common attacks.
