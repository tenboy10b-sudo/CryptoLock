---
title: "How to Write and Run PowerShell Scripts to Automate Windows Tasks"
date: "2026-04-26"
publishDate: "2026-04-26"
description: "Get started writing PowerShell scripts for Windows automation: execution policy, script structure, error handling, logging, and practical examples you can use immediately."
tags: ["windows", "powershell", "automation", "administration"]
readTime: 7
---

PowerShell scripts automate repetitive Windows tasks — from cleaning temp files to generating system reports to bulk file operations. Here's a practical foundation.

---

## Enable Script Execution

By default, PowerShell blocks scripts. Check and set policy:

```powershell
# Check current policy
Get-ExecutionPolicy

# Allow scripts for current user (recommended)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Execution policy levels:
# Restricted — no scripts
# AllSigned — only signed scripts
# RemoteSigned — local scripts OK, downloaded need signature
# Unrestricted — all scripts run
```

---

## Script Structure

Save with `.ps1` extension. Basic template:

```powershell
#Requires -Version 5.1
<#
.SYNOPSIS
    Brief description
.DESCRIPTION
    Detailed description
.PARAMETER TargetPath
    Path to process
.EXAMPLE
    .\script.ps1 -TargetPath "C:\Data"
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)]
  [string]$TargetPath,

  [Parameter()]
  [switch]$WhatIf  # Dry run flag
)

# Script logic here
```

---

## Error Handling

```powershell
# Stop on any error
$ErrorActionPreference = "Stop"

# Try/catch for specific errors
try {
  $result = Get-Item "C:\NonExistent\path" -ErrorAction Stop
  Write-Host "Found: $($result.Name)"
} catch [System.IO.FileNotFoundException] {
  Write-Warning "File not found: $_"
} catch {
  Write-Error "Unexpected error: $_"
  exit 1
}

# Check result of each command
$output = robocopy source dest /MIR
if ($LASTEXITCODE -ge 8) {
  Write-Error "Robocopy failed with code $LASTEXITCODE"
}
```

---

## Logging

```powershell
function Write-Log {
  param([string]$Message, [string]$Level = "INFO")
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $logLine = "$timestamp [$Level] $Message"
  Add-Content -Path $script:LogFile -Value $logLine
  switch ($Level) {
    "ERROR"   { Write-Host $logLine -ForegroundColor Red }
    "WARNING" { Write-Host $logLine -ForegroundColor Yellow }
    default   { Write-Host $logLine -ForegroundColor Green }
  }
}

# Initialize log
$script:LogFile = "C:\Logs\script-$(Get-Date -Format 'yyyy-MM-dd').log"
New-Item -ItemType Directory -Path (Split-Path $script:LogFile) -Force | Out-Null

Write-Log "Script started"
Write-Log "Error occurred" "ERROR"
```

---

## Practical Script: System Cleanup

```powershell
# cleanup.ps1 — clean temp files and log result
param([switch]$WhatIf)

$logFile = "C:\Scripts\cleanup-$(Get-Date -Format 'yyyy-MM-dd').log"
$freedSpace = 0

$paths = @(
  "$env:TEMP",
  "$env:SystemRoot\Temp",
  "$env:SystemRoot\Prefetch"
)

foreach ($path in $paths) {
  if (Test-Path $path) {
    $sizeBefore = (Get-ChildItem $path -Recurse -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
    if (!$WhatIf) {
      Remove-Item "$path\*" -Recurse -Force -ErrorAction SilentlyContinue
    }
    $freedSpace += $sizeBefore
    Write-Host "Cleaned: $path ($([math]::Round($sizeBefore/1MB,1)) MB)"
  }
}

$msg = "$(Get-Date): Freed $([math]::Round($freedSpace/1MB,0)) MB total. WhatIf=$WhatIf"
Add-Content $logFile $msg
Write-Host $msg -ForegroundColor Green
```

---

## Practical Script: Daily Health Check

```powershell
# health-check.ps1
param([string]$ReportPath = "C:\Reports\health-$(Get-Date -Format 'yyyy-MM-dd').txt")

$report = @()
$report += "=== System Health Report $(Get-Date) ==="

# CPU
$cpu = [math]::Round((Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples.CookedValue, 0)
$report += "CPU Usage: $cpu%"

# Memory
$os = Get-WmiObject Win32_OperatingSystem
$ramFree = [math]::Round($os.FreePhysicalMemory/1MB, 1)
$ramTotal = [math]::Round($os.TotalVisibleMemorySize/1MB, 1)
$report += "RAM: $ramFree GB free of $ramTotal GB"

# Disk
Get-PSDrive -PSProvider FileSystem | ForEach-Object {
  $freeGB = [math]::Round($_.Free/1GB, 1)
  $usedGB = [math]::Round($_.Used/1GB, 1)
  $report += "Drive $($_.Name): $freeGB GB free / $usedGB GB used"
}

# Defender
$def = Get-MpComputerStatus
$report += "Defender: $(if($def.RealTimeProtectionEnabled){'ON'}else{'OFF'}) | Signatures: $($def.AntivirusSignatureAge) days old"

# Failed logins today
$failedLogins = (Get-WinEvent -FilterHashtable @{LogName='Security';Id=4625;StartTime=(Get-Date).Date} -ErrorAction SilentlyContinue).Count
$report += "Failed logins today: $failedLogins"

# Save and display
$report | Out-File $ReportPath
$report | Write-Host
Write-Host "`nReport saved to: $ReportPath" -ForegroundColor Cyan
```

---

## Run Script as Scheduled Task

```powershell
# Schedule health check to run daily at 8 AM
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-NonInteractive -WindowStyle Hidden -ExecutionPolicy RemoteSigned -File C:\Scripts\health-check.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At "08:00"
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable $true
Register-ScheduledTask -TaskName "DailyHealthCheck" `
  -Action $action -Trigger $trigger -Settings $settings `
  -RunLevel Highest -Force
```

---

## Run Script on Remote PCs

```powershell
# Run script on multiple PCs
$computers = @("PC1","PC2","Server01")
Invoke-Command -ComputerName $computers -FilePath "C:\Scripts\health-check.ps1" |
  Select-Object PSComputerName, * -ExcludeProperty RunspaceId
```

---


---

## ⚡ Looking for the right command?

**[→ PowerShell & CMD Reference](/tools/powershell-commands)** — 40+ commands searchable by task. Type "network", "disk" or "security" to get a ready-to-use command instantly.


## Summary

Set `RemoteSigned` execution policy. Always include `try/catch` and a log function. Use `param()` with `[CmdletBinding()]` for reusable scripts. Test with `-WhatIf` before running destructively. Schedule with `Register-ScheduledTask` and run as `SYSTEM` for unattended execution. Share to remote PCs with `Invoke-Command -FilePath`.
