---
title: "Windows Defender Advanced Threat Protection: Configuration Guide"
date: "2026-06-26"
publishDate: "2026-06-26"
description: "Configure Microsoft Defender for Endpoint (ATP) for advanced threat detection. Onboard devices, configure policies, review alerts and respond to incidents."
tags: ["windows", "windows-defender", "atp", "security", "administration"]
readTime: 5
---

Microsoft Defender for Endpoint (formerly ATP) provides enterprise-grade threat detection beyond what standard Defender offers — behavioral analysis, endpoint detection and response (EDR).

---

## What Defender for Endpoint Adds

Standard Defender: signature-based detection + cloud heuristics
Defender for Endpoint adds:
- **EDR** — detect and investigate attacks in progress
- **Threat & Vulnerability Management** — inventory known vulnerabilities
- **Attack Surface Reduction rules** — block attack techniques
- **Automated Investigation** — auto-respond to common incidents
- **Advanced Hunting** — query 6-month behavioral history with KQL

---

## Prerequisites

- Microsoft 365 Defender license (P1 or P2)
- Windows 10 1607+ or Windows 11
- Azure AD joined or hybrid joined device (recommended)

---

## Check Defender for Endpoint Status

```powershell
# Check if device is onboarded
$sense = Get-Service -Name "Sense" -EA 0
if ($sense) {
  Write-Host "Defender for Endpoint service: $($sense.Status)"
} else {
  Write-Host "Defender for Endpoint: Not installed"
}

# Check onboarding status via registry
$dfeStatus = Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows Advanced Threat Protection\Status" -EA 0
if ($dfeStatus) {
  Write-Host "Onboarded: $($dfeStatus.OnboardingState)"
  Write-Host "Org ID: $($dfeStatus.OrgID)"
}
```

---

## Onboard via Local Script (Manual)

```powershell
# Download onboarding package from Microsoft 365 Defender portal:
# security.microsoft.com → Settings → Endpoints → Device management → Onboarding

# Run the downloaded onboarding script as Administrator
# Example:
& "C:\Downloads\WindowsDefenderATPOnboardingScript.cmd"

# Verify onboarding after 5-10 minutes
Get-Service Sense | Select-Object Status
```

---

## Onboard via Group Policy

1. Download onboarding package (.zip) from Microsoft 365 Defender portal
2. Extract the `.admx` and `.adml` templates to `C:\Windows\PolicyDefinitions\`
3. `gpedit.msc` → `Computer Configuration` → `Administrative Templates` → `Windows Components` → `Microsoft Defender for Endpoint`
4. **Configure Microsoft Defender for Endpoint onboarding** → Enabled → paste onboarding blob

---

## Check Device Health

```powershell
# Sensor health
Get-WinEvent -FilterHashtable @{
  LogName='Microsoft-Windows-SENSE/Operational'
} -MaxEvents 10 -EA 0 | Select-Object TimeCreated, Id, Message

# Defender Platform version
(Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows Defender").PlatformVersion

# Engine and signature versions
Get-MpComputerStatus | Select-Object AMEngineVersion, AMProductVersion,
  AntivirusSignatureVersion, AntivirusSignatureLastUpdated
```

---

## Configure ASR Rules (ATP Integration)

```powershell
# With Defender for Endpoint, ASR telemetry goes to M365 Defender portal
# Rules are the same as standard ASR but violations appear in Incidents

# Enable all recommended rules
$rules = @(
  "D4F940AB-401B-4EFC-AADC-AD5F3C50688A",  # Block Office child processes
  "9E6C4E1F-7D60-472F-BA1A-A39EF669E4B2",  # Block LSASS credential stealing
  "C1DB55AB-C21A-4637-BB3F-A12568109D35",  # Block ransomware behavior
  "5BEB7EFE-FD9A-4556-801D-275E5FFC04CC"   # Block untrusted USB execution
)
foreach ($rule in $rules) {
  Add-MpPreference -AttackSurfaceReductionRules_Ids $rule `
    -AttackSurfaceReductionRules_Actions Enabled
}
```

---

## Advanced Hunting (KQL)

From Microsoft 365 Defender portal → Advanced Hunting:

```kql
// Find all PowerShell executions in last 24h
DeviceProcessEvents
| where Timestamp > ago(24h)
| where ProcessVersionInfoProductName == "Windows PowerShell"
| project Timestamp, DeviceName, InitiatingProcessFileName,
    ProcessCommandLine, AccountName
| order by Timestamp desc

// Failed logons
DeviceLogonEvents
| where Timestamp > ago(24h)
| where ActionType == "LogonFailed"
| summarize count() by DeviceName, AccountName, FailureReason
| order by count_ desc
```

---

## Summary

Standard Defender handles most consumer threats. Defender for Endpoint adds EDR, Advanced Hunting and automated response for enterprise. Onboard via script or GPO. Check status with `Get-Service Sense`. Use Advanced Hunting KQL for threat investigations.

## Frequently Asked Questions

### Is Defender for Endpoint available without Microsoft 365?

Defender for Endpoint is available standalone (Defender for Endpoint P1/P2) or as part of Microsoft 365 Business Premium, E3/E5 or Security E3/E5.

### How long does it take for a device to appear in the portal after onboarding?

5-30 minutes for the device to appear. Full telemetry collection starts immediately. If device doesn't appear after 30 minutes, check the Sense service is running and the device has internet connectivity.

### Can I use Defender for Endpoint with third-party antivirus?

In passive mode — Defender for Endpoint's EDR sensors still collect telemetry while the third-party AV handles detection. Recommended: switch to Defender as primary AV to get the full platform benefit.
