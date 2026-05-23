---
title: "Windows Task Scheduler Advanced: Triggers, Conditions, and Scripting"
date: "2026-11-05"
publishDate: "2026-11-05"
description: "Go beyond basic Task Scheduler: use event-based triggers, condition settings, run tasks as SYSTEM, create complex automation workflows, and troubleshoot failed tasks."
tags: ["windows", "automation", "powershell", "administration"]
readTime: 6
---

Task Scheduler does far more than run a script at a set time. Event-based triggers, idle conditions, and network requirements make it a powerful automation platform.

---

## Task Anatomy

A task has four parts:
- **General** — name, account, run level, hidden
- **Triggers** — when to run
- **Actions** — what to run
- **Conditions** — additional requirements (idle, AC power, network)
- **Settings** — behavior on failure, timeout, overlap

---

## All Trigger Types

```powershell
# Time-based triggers
$daily = New-ScheduledTaskTrigger -Daily -At "03:00"
$weekly = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday,Wednesday,Friday -At "09:00"
$monthly = New-ScheduledTaskTrigger -Monthly -DaysOfMonth 1 -At "00:00"
$once = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(5)

# Login/boot triggers
$atLogon = New-ScheduledTaskTrigger -AtLogOn
$atBoot = New-ScheduledTaskTrigger -AtStartup

# With delay (e.g., run 2 minutes after login)
$atLogon = New-ScheduledTaskTrigger -AtLogOn
$atLogon.Delay = "PT2M"  # ISO 8601 duration: 2 minutes
```

---

## Event-Based Triggers

Run a task when a specific event occurs in Event Viewer:

```powershell
# Run when Event ID 4625 (failed login) occurs in Security log
$eventTrigger = Get-ScheduledTask -TaskName "ExistingTask" -ErrorAction SilentlyContinue

# Create via XML (most reliable for event triggers)
$xml = @"
<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.4" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <Triggers>
    <EventTrigger>
      <Subscription><![CDATA[
        <QueryList>
          <Query Id="0" Path="Security">
            <Select Path="Security">*[System[EventID=4625]]</Select>
          </Query>
        </QueryList>
      ]]></Subscription>
    </EventTrigger>
  </Triggers>
  <Actions Context="Author">
    <Exec>
      <Command>powershell.exe</Command>
      <Arguments>-File C:\Scripts\alert-login-fail.ps1</Arguments>
    </Exec>
  </Actions>
</Task>
"@
Register-ScheduledTask -Xml $xml -TaskName "AlertOnFailedLogin" -Force
```

---

## Run as SYSTEM (No Password, No UAC)

Tasks run as SYSTEM have the highest privileges and don't prompt for elevation:

```powershell
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-NonInteractive -WindowStyle Hidden -File C:\Scripts\maintenance.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At "02:00"
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -RunLevel Highest

Register-ScheduledTask -TaskName "NightlyMaintenance" `
  -Action $action -Trigger $trigger -Principal $principal -Force
```

---

## Conditions

Conditions prevent the task from running unless requirements are met:

```powershell
$settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable $true `            # Run if missed (e.g., PC was off)
  -RunOnlyIfNetworkAvailable $true `     # Require network
  -RunOnlyIfIdle $true `                 # Only when PC is idle
  -IdleDuration "00:10:00" `             # Idle for 10 minutes
  -StopIfGoingOffIdle $true `            # Stop if user becomes active
  -WakeToRun $false `                    # Don't wake PC
  -ExecutionTimeLimit "02:00:00" `       # Kill if runs > 2 hours
  -MultipleInstances IgnoreNew           # Don't start if already running
```

---

## Retry on Failure

```powershell
$settings = New-ScheduledTaskSettingsSet `
  -RestartCount 3 `                      # Retry 3 times on failure
  -RestartInterval "00:05:00" `          # Wait 5 minutes between retries
  -StartWhenAvailable $true
```

---

## Pass Arguments to Scripts

```powershell
# Script that accepts parameters
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument '-NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -Command "& C:\Scripts\backup.ps1 -Source C:\Data -Dest D:\Backup -Verbose"'
```

---

## Read Event Data in Triggered Tasks

When using event triggers, you can pass event data to the action:

```xml
<Arguments>-File C:\Scripts\handler.ps1 -EventID $(EventID) -Computer $(Computer)</Arguments>
```

Access in PowerShell script via `$args` or named parameters.

---

## Manage Tasks via PowerShell

```powershell
# List all tasks with last result
Get-ScheduledTask | Get-ScheduledTaskInfo |
  Select-Object TaskName, LastRunTime, LastTaskResult, NextRunTime |
  Sort-Object LastRunTime -Descending | Select-Object -First 20

# Run task immediately
Start-ScheduledTask -TaskName "NightlyMaintenance"

# Check result codes
# 0 = Success
# 0x41301 = Task is currently running
# 0x80070002 = File not found
# 0xC000013A = Task terminated by user

# Export task to XML (for backup or moving to another PC)
Export-ScheduledTask -TaskName "NightlyMaintenance" | Out-File "C:\TaskBackup.xml"

# Import
Register-ScheduledTask -Xml (Get-Content "C:\TaskBackup.xml" | Out-String) `
  -TaskName "NightlyMaintenance" -Force

# Delete task
Unregister-ScheduledTask -TaskName "NightlyMaintenance" -Confirm:$false
```

---

## View Task History

Task history is disabled by default:

```powershell
# Enable history logging
$taskService = New-Object -ComObject "Schedule.Service"
$taskService.Connect()
$taskService.GetFolder("\").RegisterTaskDefinition("",
  $taskService.NewTask(0), 4, $null, $null, 0)
```

Simpler: in Task Scheduler GUI → right-click Task Scheduler (Local) → Enable All Tasks History

View in GUI: select a task → **History** tab.

---


---

## ⚡ Шукаєш потрібну команду?

**[→ PowerShell і CMD довідник](/tools/powershell-commands)** — 40+ команд з пошуком за задачею. Введи "мережа", "диск" або "безпека" і одразу отримай готову команду.


## Summary

Use `AtStartup` for boot tasks, `AtLogOn` with delay for user-context tasks, and XML for event-based triggers. Run system maintenance as `SYSTEM` to avoid credential issues. Add `RestartCount` for tasks that occasionally fail. Export tasks to XML before major changes — importing is much faster than recreating.
