---
title: "How to Use Windows Security Key Features: SmartScreen, Core Isolation, and Secure Boot"
date: "2026-08-31"
publishDate: "2026-08-31"
description: "Enable Windows 11 advanced security features: Core Isolation with Memory Integrity, SmartScreen, Secure Boot verification, and Reputation-based protection."
tags: ["windows", "security", "bios", "tools"]
readTime: 6
---

Windows 11 includes several hardware-backed security features that most users never enable. Together they significantly raise the bar for malware and exploit attempts.

---

## Check Current Security Status

`Win + I` → **Privacy & Security** → **Windows Security** → **Device Security**

This page shows the status of:
- Core isolation (Memory Integrity)
- Secure Boot
- TPM

Or via PowerShell:
```powershell
# Security features summary
$features = @{
  "Secure Boot" = (Confirm-SecureBootUEFI 2>$null)
  "TPM Present" = (Get-Tpm).TpmPresent
  "TPM Ready" = (Get-Tpm).TpmReady
}
$features.GetEnumerator() | Format-Table Name, Value
```

---

## Core Isolation: Memory Integrity

Memory Integrity (HVCI) uses hardware virtualization to protect kernel memory from malware — even if the OS is compromised.

**Enable:**
`Windows Security` → **Device Security** → **Core isolation details** → toggle **Memory Integrity** to On → restart

```powershell
# Enable via registry
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\DeviceGuard\Scenarios\HypervisorEnforcedCodeIntegrity" `
  -Name "Enabled" -Value 1 -Type DWord
```

**Why it might be off:** incompatible driver installed. Windows will tell you which driver is blocking it.

```powershell
# Find incompatible drivers blocking Memory Integrity
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Kernel-PnP/Configuration'; Id=25} -MaxEvents 10 |
  Select-Object TimeCreated, Message
```

Update or remove the incompatible driver, then re-enable Memory Integrity.

---

## SmartScreen: Reputation-Based Protection

SmartScreen checks downloaded files and websites against Microsoft's threat database.

`Windows Security` → **App & browser control** → **Reputation-based protection**

Settings:
- **Check apps and files** → **Warn** (recommended) — alerts before running unknown files
- **SmartScreen for Microsoft Edge** → On
- **Potentially unwanted app blocking** → On — blocks adware and bundled software

```powershell
# Check SmartScreen status
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer" -Name SmartScreenEnabled
```

---

## Exploit Protection

Configure exploit mitigations for the system and individual apps.

`Windows Security` → **App & browser control** → **Exploit protection** → **System settings**

Default settings work well for most users. Advanced: export your configuration and apply to other PCs:

```powershell
# Export current exploit protection config
Get-ProcessMitigation -RegistryConfigFilePath "C:\ExploitProtection.xml"

# Apply on another PC
Set-ProcessMitigation -PolicyFilePath "C:\ExploitProtection.xml"
```

---

## Verify Secure Boot

Secure Boot prevents unauthorized bootloaders from running before Windows loads.

```powershell
Confirm-SecureBootUEFI
# Returns True if enabled, False if not, error if BIOS mode
```

If Secure Boot is off: enter BIOS → **Security** or **Boot** section → enable **Secure Boot** → save.

Check BIOS mode: `msinfo32` → look for **BIOS Mode**: UEFI is required for Secure Boot.

---

## Controlled Folder Access (Ransomware Protection)

Blocks unauthorized apps from modifying protected folders — stops most ransomware.

`Windows Security` → **Virus & threat protection** → **Ransomware protection** → **Manage ransomware protection** → turn on **Controlled folder access**

Add additional folders:
```powershell
Add-MpPreference -ControlledFolderAccessProtectedFolders "D:\ImportantFiles"
```

Allow a specific trusted app:
```powershell
Add-MpPreference -ControlledFolderAccessAllowedApplications "C:\MyApp\app.exe"
```

---

## Virtualization-Based Security (VBS)

VBS uses Hyper-V to isolate sensitive Windows processes.

```powershell
# Check if VBS is enabled
Get-ComputerInfo | Select-Object DeviceGuardVirtualizationBasedSecurityStatus
```

To enable fully:
- Enable Hyper-V in Windows features
- Enable Memory Integrity (enables VBS automatically)
- Ensure Secure Boot is on

---

## Security Baseline Check Script

```powershell
Write-Host "=== Windows Security Check ===" -ForegroundColor Cyan

# Secure Boot
try {
  $sb = Confirm-SecureBootUEFI
  Write-Host "Secure Boot: $(if($sb){'✅ Enabled'}else{'❌ Disabled'})"
} catch { Write-Host "Secure Boot: ⚠️ BIOS mode (not UEFI)" }

# TPM
$tpm = Get-Tpm
Write-Host "TPM: $(if($tpm.TpmPresent -and $tpm.TpmReady){'✅ Ready'}else{'❌ Not ready'})"

# Defender
$def = Get-MpComputerStatus
Write-Host "Defender: $(if($def.RealTimeProtectionEnabled){'✅ Active'}else{'❌ Inactive'})"

# Memory Integrity
$hvci = Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\DeviceGuard\Scenarios\HypervisorEnforcedCodeIntegrity" -ErrorAction SilentlyContinue
Write-Host "Memory Integrity: $(if($hvci.Enabled -eq 1){'✅ Enabled'}else{'⚠️ Disabled'})"

# BitLocker
$bl = Get-BitLockerVolume -MountPoint C: -ErrorAction SilentlyContinue
Write-Host "BitLocker C: $(if($bl.ProtectionStatus -eq 'On'){'✅ On'}else{'❌ Off'})"
```

---

## Summary

Enable in order: **Secure Boot** in BIOS → **TPM** in BIOS → **Memory Integrity** in Windows Security → **Controlled Folder Access** for ransomware protection → **SmartScreen** set to Warn. Run the security check script to verify your current status at a glance.
