---
title: "How to Enable Windows Defender Application Guard for Edge"
date: "2026-06-08"
publishDate: "2026-06-08"
description: "Enable Windows Defender Application Guard to open untrusted websites in an isolated Hyper-V container. Configure WDAG for Edge, manage trusted sites and monitor sessions."
tags: ["windows", "application-guard", "security", "edge", "virtualization"]
readTime: 5
translatesUk: "windows-defender-application-guard"
---

Application Guard opens untrusted websites in a disposable Hyper-V container — if the site delivers malware, it can't escape to your real PC.

---

## Requirements

- Windows 10/11 **Pro**, **Enterprise**, or **Education**
- Virtualization enabled in BIOS
- At least 8 GB RAM (4 GB for the container)

---

## Enable Application Guard

```powershell
# Enable Windows Defender Application Guard
Enable-WindowsOptionalFeature -Online -FeatureName "Windows-Defender-ApplicationGuard" -NoRestart
Restart-Computer
```

Or: `Win + R` → `optionalfeatures` → **Windows Defender Application Guard** → OK → Restart

---

## Open a Site in Application Guard

In Microsoft Edge:
- Click the three-dot menu `...`
- Select **New Application Guard window**
- Browse to the untrusted site

Or right-click a link → **Open link in Application Guard window**

---

## Configure via Group Policy

`gpedit.msc` → `Computer Configuration` → `Administrative Templates` → `Windows Components` → `Microsoft Defender Application Guard`

Key settings:
- **Turn on Microsoft Defender Application Guard in Managed Mode** → Enabled → `1` (Enable for Edge)
- **Configure Microsoft Defender Application Guard clipboard settings** → set clipboard behavior
- **Allow files to download and save to the host operating system from Microsoft Defender Application Guard** → Enabled/Disabled
- **Allow auditing events in Microsoft Defender Application Guard** → Enabled

---

## Configure Trusted Sites (Won't Open in Container)

```powershell
# Add trusted enterprise sites via registry
$enterpriseSites = "HKLM:\SOFTWARE\Policies\Microsoft\AppHVSI\DomainList"
New-Item -Path $enterpriseSites -Force | Out-Null

# Add domains that should NOT open in Application Guard
Set-ItemProperty $enterpriseSites -Name "1" -Value "*.company.com"
Set-ItemProperty $enterpriseSites -Name "2" -Value "intranet.example.com"
Set-ItemProperty $enterpriseSites -Name "3" -Value "*.internal.local"
```

---

## Configure Clipboard and File Behavior

```powershell
# Clipboard settings
# 0 = no clipboard sharing
# 1 = host to container only
# 2 = container to host only
# 3 = bidirectional (least secure)

Set-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\AppHVSI" `
  -Name "AppHVSIClipboardSettings" -Value 1 -Type DWord

# Allow downloading files from container
Set-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\AppHVSI" `
  -Name "SaveFilesToHost" -Value 1 -Type DWord
```

---

## Manage Container Persistence

```powershell
# Allow data persistence across sessions (container retains cookies, history)
# gpedit.msc: Allow data persistence for Windows Defender Application Guard → Enabled

# Clear all Application Guard data
# Edge menu → Application Guard window → Clear Application Guard data
```

---

## Monitor Application Guard Events

```powershell
# Application Guard events in Event Log
Get-WinEvent -FilterHashtable @{
  LogName='Microsoft-Windows-Windows Defender Application Guard/Operational'
} -MaxEvents 20 -EA 0 |
  Select-Object TimeCreated, Id, Message | Format-List
```

---

## Check Application Guard Status

```powershell
# Verify Application Guard is installed and operational
Get-WindowsOptionalFeature -Online -FeatureName "Windows-Defender-ApplicationGuard" |
  Select-Object FeatureName, State

# Check if running in an Application Guard session (from inside container)
(Get-WmiObject -Namespace root\cimv2 -Class Win32_DeviceGuardStatus -EA 0).VirtualizationBasedSecurityStatus
```

---

## Summary

Enable via `optionalfeatures` or PowerShell. Open untrusted sites from Edge menu → New Application Guard window. Configure trusted sites via GPO or registry. Set clipboard to host-only for safety. Use Audit mode to monitor sessions.

## Frequently Asked Questions

### Application Guard window opens slowly — is that normal?

Yes — first launch takes 10-30 seconds as Hyper-V starts the container. Subsequent launches in the same session are faster. The delay is normal and unavoidable.

### Can malware from Application Guard infect my PC?

The container shares no file system with the host. Clipboard and file transfer can be vectors — keep clipboard at "host to container only" and be careful about what you download from the container.

### Is Application Guard available in Windows 11 Home?

No. Windows 11 Home doesn't support Hyper-V or Application Guard. It requires Pro, Enterprise, or Education editions.
