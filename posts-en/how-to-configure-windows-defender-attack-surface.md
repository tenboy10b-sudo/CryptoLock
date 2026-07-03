---
title: "How to Enable Windows Defender Attack Surface Reduction Rules"
date: "2026-06-04"
publishDate: "2026-06-04"
description: "Enable Windows Defender Attack Surface Reduction (ASR) rules to block common attack techniques. Configure ASR via PowerShell and Group Policy, monitor blocked actions."
tags: ["windows", "windows-defender", "security", "asr", "powershell"]
readTime: 5
translatesUk: "pravyla-zmenshennya-poverkhni-ataky-asr"
---

Attack Surface Reduction (ASR) rules block specific behaviors that malware commonly uses — Office macros calling child processes, credential dumping, ransomware-style file encryption attempts.

---

## Check ASR Support

```powershell
# ASR requires Windows Defender with real-time protection enabled
(Get-MpComputerStatus).RealTimeProtectionEnabled

# Check Windows 11 version
(Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion").DisplayVersion
```

ASR requires Windows 10 1709+ or Windows 11, with Windows Defender active.

---

## ASR Rule Modes

- **0** = Disabled
- **1** = Block (prevents the action)
- **2** = Audit (logs without blocking — use first)
- **6** = Warn (shows warning, user can proceed)

---

## Enable ASR Rules

```powershell
# Start in Audit mode to see what would be blocked
$auditRules = @(
  "D4F940AB-401B-4EFC-AADC-AD5F3C50688A",  # Block Office from creating child processes
  "3B576869-A4EC-4529-8536-B80A7769E899",  # Block Office from injecting into processes
  "75668C1F-73B5-4CF0-BB93-3ECF5CB7CC84",  # Block Office from creating executable content
  "BE9BA2D9-53EA-4CDC-84E5-9B1EEEE46550",  # Block Office from creating executable files
  "E6DB77E5-3DF2-4CF1-B95A-636979351E5B",  # Block persistence via WMI
  "9E6C4E1F-7D60-472F-BA1A-A39EF669E4B2",  # Block credential stealing from LSASS
  "D3E037E1-3EB8-44C8-A917-57927947596D",  # Block JS/VBS from executing downloaded content
  "5BEB7EFE-FD9A-4556-801D-275E5FFC04CC",  # Block execution from USB drives
  "92E97FA1-2EDF-4476-BDD6-9DD0B4DDDC7B",  # Block Win32 API calls from macros
  "26190899-1602-49E8-8B27-EB1D0A1CE869",  # Block Office comm apps from creating child processes
  "7674BA52-37EB-4A4F-A9A1-F0F9A1619A2C",  # Block Adobe Reader child processes
  "B2B3F03D-6A65-4F7B-A9C7-1C7EF74A9BA4",  # Block untrusted/unsigned USB processes
  "C1DB55AB-C21A-4637-BB3F-A12568109D35",  # Block ransomware-style file operations
  "01443614-CD74-433A-B99E-2ECDC07BFC25",  # Block executable files from email/webmail
  "56A863A9-875E-4185-98A7-B882C64B5CE5"   # Block abuse of exploited vulnerable signed drivers
)

foreach ($rule in $auditRules) {
  Add-MpPreference -AttackSurfaceReductionRules_Ids $rule `
    -AttackSurfaceReductionRules_Actions AuditMode
}

Write-Host "ASR rules set to Audit mode - monitor for 1 week before enabling Block"
```

---

## Switch to Block Mode

After reviewing audit logs and confirming no false positives:

```powershell
# Enable all previously audited rules in Block mode
foreach ($rule in $auditRules) {
  Add-MpPreference -AttackSurfaceReductionRules_Ids $rule `
    -AttackSurfaceReductionRules_Actions Enabled
}
```

---

## View ASR Status

```powershell
# List all ASR rules and their status
Get-MpPreference | Select-Object -ExpandProperty AttackSurfaceReductionRules_Ids
Get-MpPreference | Select-Object -ExpandProperty AttackSurfaceReductionRules_Actions

# Combine for readable output
$ids = (Get-MpPreference).AttackSurfaceReductionRules_Ids
$actions = (Get-MpPreference).AttackSurfaceReductionRules_Actions

for ($i = 0; $i -lt $ids.Count; $i++) {
  $actionName = switch ($actions[$i]) {
    0 { "Disabled" }; 1 { "Block" }; 2 { "Audit" }; 6 { "Warn" }
  }
  Write-Host "$($ids[$i]) = $actionName"
}
```

---

## Monitor ASR Events

```powershell
# ASR blocks and audits appear in Event Viewer
# Provider: Microsoft-Windows-Windows Defender
# Event IDs: 1121 (blocked), 1122 (audited)

Get-WinEvent -FilterHashtable @{
  LogName='Microsoft-Windows-Windows Defender/Operational'
  Id=1121,1122
} -MaxEvents 20 | Select-Object TimeCreated, Id, Message | Format-List
```

---

## Disable Specific Rule (False Positive)

```powershell
# Disable only the rule causing false positives
Add-MpPreference -AttackSurfaceReductionRules_Ids "D4F940AB-401B-4EFC-AADC-AD5F3C50688A" `
  -AttackSurfaceReductionRules_Actions Disabled
```

---

## Summary

Start in Audit mode for 1 week. Review Event IDs 1121/1122. Switch to Block after confirming no false positives. Most impactful rules: Office child process block, LSASS credential stealing block, ransomware file operation block.

## Frequently Asked Questions

### ASR blocked a legitimate app — how to add an exclusion?

```powershell
Add-MpPreference -AttackSurfaceReductionOnlyExclusions "C:\LegitApp\app.exe"
```
This excludes the specific path from all ASR rules.

### Will ASR rules affect Microsoft Office functionality?

Some rules block specific Office behaviors that malware exploits. Legitimate macro use may be affected. Run in Audit mode first and review what's blocked in your environment before enabling Block mode.

### Can I configure ASR via Group Policy?

Yes: `gpedit.msc` → `Computer Configuration` → `Administrative Templates` → `Windows Components` → `Microsoft Defender Antivirus` → `Microsoft Defender Exploit Guard` → `Attack Surface Reduction` → **Configure Attack Surface Reduction rules**
