---
title: "How to Configure WSUS for Windows Update Management"
date: "2026-06-19"
publishDate: "2026-06-19"
description: "Set up Windows Server Update Services (WSUS) to centrally manage Windows updates. Install WSUS, configure clients, approve updates and troubleshoot synchronization."
tags: ["windows", "wsus", "windows-update", "administration", "powershell"]
readTime: 6
translatesUk: "nalashtuvannya-wsus-windows-update"
---

WSUS (Windows Server Update Services) lets you control which updates deploy to which PCs on your network — saving bandwidth and preventing problematic updates.

---

## Install WSUS

```powershell
# Windows Server: install WSUS role with SQL Server backend
Install-WindowsFeature UpdateServices-Services, UpdateServices-DB `
  -IncludeManagementTools

# Or with Windows Internal Database (WID)
Install-WindowsFeature UpdateServices -IncludeManagementTools

# Run post-install configuration
& "C:\Program Files\Update Services\Tools\wsusutil.exe" postinstall `
  CONTENT_DIR="D:\WSUS" `
  SQL_INSTANCE_NAME="WSUS_SERVER\SQLEXPRESS"

# Verify
Get-Service WsusService | Select-Object Status
```

---

## Configure WSUS via PowerShell

```powershell
# Get WSUS server object
$wsus = Get-WsusServer -Name "WSUSServer" -PortNumber 8530

# Configure synchronization source
$subscription = $wsus.GetSubscription()
$subscription.StartSynchronizationAutomatically = $false
$wsus.SetUpdateServerProperty($wsus.GetConfiguration())

# Set products to sync
$wsus.GetUpdateClassifications() | Where-Object {$_.Title -in @("Security Updates","Critical Updates")} |
  ForEach-Object { $_.IsSubscribed = $true; $_.Save() }

# Configure languages
$config = $wsus.GetConfiguration()
$config.AllUpdateLanguagesEnabled = $false
$config.SetEnabledUpdateLanguages("en")
$config.Save()

# Set sync schedule
$schedule = $subscription.GetSynchronizationSchedule()
$schedule.DailyInterval = 1
$schedule.StartTime = [System.TimeSpan]::FromHours(3)  # 3 AM
$schedule.SetSchedule()
```

---

## Create Computer Groups

```powershell
# Create groups for staged deployment
$wsus.CreateComputerTargetGroup("Test Machines")
$wsus.CreateComputerTargetGroup("Production Servers")
$wsus.CreateComputerTargetGroup("Workstations")

# List groups
$wsus.GetComputerTargetGroups() | Select-Object Name, Id
```

---

## Configure Clients to Use WSUS

**Via Group Policy** (recommended for domain):

`gpedit.msc` → `Computer Configuration` → `Administrative Templates` → `Windows Components` → `Windows Update`

- **Specify intranet Microsoft update service location** → `http://WSUSServer:8530`
- **Configure Automatic Updates** → 4 (Auto download and schedule install)
- **Enable client-side targeting** → group name (e.g., "Workstations")

```powershell
# Or via registry (for non-domain PCs)
$wuPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate"
New-Item -Path "$wuPath\AU" -Force | Out-Null
Set-ItemProperty "$wuPath\AU" -Name "UseWUServer" -Value 1 -Type DWord
Set-ItemProperty $wuPath -Name "WUServer" -Value "http://WSUSServer:8530"
Set-ItemProperty $wuPath -Name "WUStatusServer" -Value "http://WSUSServer:8530"

# Restart Windows Update service
Restart-Service wuauserv -Force
```

---

## Approve and Decline Updates

```powershell
# Get pending updates
$updates = $wsus.SearchUpdates("IsApproved:0 AND IsDeclined:0")
$updates | Select-Object Title, CreationDate | Sort-Object CreationDate -Descending

# Approve update for a group
$testGroup = $wsus.GetComputerTargetGroups() | Where-Object {$_.Name -eq "Test Machines"}
$update = $wsus.SearchUpdates("KB5053656") | Select-Object -First 1
$update.Approve([Microsoft.UpdateServices.Administration.UpdateApprovalAction]::Install, $testGroup)

# Decline update
$problematic = $wsus.SearchUpdates("KB5055523") | Select-Object -First 1
$problematic.Decline()
```

---

## WSUS Maintenance

```powershell
# Run WSUS cleanup wizard (removes obsolete updates)
$cleanupManager = $wsus.GetCleanupManager()
$cleanupScope = New-Object Microsoft.UpdateServices.Administration.CleanupScope
$cleanupScope.DeclineExpiredUpdates = $true
$cleanupScope.DeclineSupersededUpdates = $true
$cleanupScope.CleanupObsoleteUpdates = $true
$cleanupScope.CleanupUnneededContentFiles = $true
$cleanupScope.CompressUpdates = $true
$cleanupResult = $cleanupManager.PerformCleanup($cleanupScope)
Write-Host "Freed: $([math]::Round($cleanupResult.DiskSpaceFreed/1MB)) MB"
```

---

## Check Client Status

```powershell
# View computers and their update status
$wsus.GetComputerTargets() | Select-Object FullDomainName, LastReportedStatusTime,
  @{n='Updates Needed';e={$_.GetUpdateInstallationSummary().NotInstalledCount}} |
  Sort-Object "Updates Needed" -Descending
```

---

## Summary

Install WSUS role, run postinstall, configure products/classifications. Use GPO to point clients to WSUS. Create groups for staged rollout. Approve updates to Test first, then Production. Run cleanup monthly to free disk space.

## Frequently Asked Questions

### How much disk space does WSUS need?

Minimum 40 GB for content. With multiple products and languages, 100-500 GB is common. Store on a separate fast drive and run cleanup monthly.

### Clients aren't showing up in WSUS — why?

After configuring GPO: run `gpupdate /force` on the client, then `wuauclt /detectnow`. It may take up to 20 minutes. Check registry at `HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate` to verify settings applied.

### Can WSUS approve updates automatically?

Yes — via Automatic Approval rules: WSUS console → Options → Automatic Approvals → create rule to approve Security Updates to "Test Machines" automatically.
