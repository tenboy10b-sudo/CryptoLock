---
title: "How to Create and Manage Scheduled Tasks in Windows with PowerShell"
date: "2026-05-16"
publishDate: "2026-05-16"
description: "Create, modify and troubleshoot Windows scheduled tasks via PowerShell and Task Scheduler GUI. Run scripts at startup, on schedule, at login and on events."
tags: ["windows", "task-scheduler", "powershell", "automation", "administration"]
readTime: 5
---

Scheduled Tasks automate anything in Windows — scripts, backups, maintenance. PowerShell gives you full control without the GUI.

---

## Basic Concepts

A scheduled task has three parts:
- **Trigger** — when to run (time, event, login, startup)
- **Action** — what to run (executable, script, arguments)
- **Principal** — which account to run as (user, SYSTEM, highest privileges)

---

## Create a Basic Scheduled Task

```powershell
# Run a script daily at 9 AM
$action  = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-NonInteractive -ExecutionPolicy Bypass -File C:\Scripts\daily.ps1"

$trigger = New-ScheduledTaskTrigger -Daily -At "09:00AM"

$principal = New-ScheduledTaskPrincipal `
  -UserId "SYSTEM" -RunLevel Highest

Register-ScheduledTask -TaskName "DailyScript" `
  -Action $action -Trigger $trigger -Principal $principal `
  -Description "Daily maintenance script"
```

---

## Trigger Types

```powershell
# Run at system startup
$trigger = New-ScheduledTaskTrigger -AtStartup

# Run at user login
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME

# Run once
$trigger = New-ScheduledTaskTrigger -Once -At "2026-06-01 10:00:00"

# Run weekly (Monday, Wednesday)
$trigger = New-ScheduledTaskTrigger -Weekly `
  -DaysOfWeek Monday,Wednesday -At "08:00AM"

# Run on event (e.g. when Event ID 4625 occurs — failed login)
$cimTrigger = New-ScheduledTaskTrigger -OnEvent `
  -Subscription '<QueryList><Query><Select Path="Security">*[System[EventID=4625]]</Select></Query></QueryList>'
```

---

## List and Find Tasks

```powershell
# All tasks
Get-ScheduledTask | Select-Object TaskName, State, TaskPath

# Only enabled tasks
Get-ScheduledTask | Where-Object {$_.State -ne "Disabled"}

# Tasks in root (user-created)
Get-ScheduledTask | Where-Object {$_.TaskPath -eq "\"}

# Last run result and time
Get-ScheduledTask | ForEach-Object {
  $info = $_ | Get-ScheduledTaskInfo
  [PSCustomObject]@{
    Name       = $_.TaskName
    LastRun    = $info.LastRunTime
    LastResult = $info.LastTaskResult
    NextRun    = $info.NextRunTime
  }
} | Sort-Object LastRun -Descending | Select-Object -First 10
```

---

## Run, Disable, Delete

```powershell
# Run immediately
Start-ScheduledTask -TaskName "DailyScript"

# Disable (keeps task, stops it running)
Disable-ScheduledTask -TaskName "DailyScript"

# Enable
Enable-ScheduledTask -TaskName "DailyScript"

# Delete permanently
Unregister-ScheduledTask -TaskName "DailyScript" -Confirm:$false
```

---

## Modify Existing Task

```powershell
# Change trigger time
$task = Get-ScheduledTask -TaskName "DailyScript"
$task.Triggers[0].StartBoundary = "2026-06-01T08:00:00"
$task | Set-ScheduledTask

# Change action script
Set-ScheduledTask -TaskName "DailyScript" `
  -Action (New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-File C:\Scripts\new-script.ps1")
```

---

## Run Task as Different User

```powershell
# Run as specific user with password
$principal = New-ScheduledTaskPrincipal `
  -UserId "DOMAIN\ServiceAccount" `
  -LogonType Password `
  -RunLevel Highest

Register-ScheduledTask -TaskName "ServiceTask" `
  -Action $action -Trigger $trigger -Principal $principal `
  -Password "ServicePassword123!"
```

---

## View Task History

```powershell
# Enable task history (disabled by default)
wevtutil sl Microsoft-Windows-TaskScheduler/Operational /e:true

# View task history
Get-WinEvent -LogName "Microsoft-Windows-TaskScheduler/Operational" -MaxEvents 20 |
  Where-Object {$_.Id -in @(100, 102, 103, 200, 201)} |
  Select-Object TimeCreated, Id, Message | Format-List
```

---

## Summary

Use `New-ScheduledTaskAction/Trigger/Principal` then `Register-ScheduledTask`. List with `Get-ScheduledTask`. Check results with `Get-ScheduledTaskInfo`. Enable task history with `wevtutil`. SYSTEM account for tasks that must run without user login.

## Frequently Asked Questions

### My scheduled task runs fine when I trigger it manually but not on schedule — why?

Most common causes: user account doesn't have "Log on as batch job" right, or the task is set to run only when user is logged in. Check the Principal settings — use SYSTEM or "Run whether user is logged on or not".

### How do I see the exit code of a scheduled task?

`Get-ScheduledTaskInfo -TaskName "TaskName" | Select-Object LastTaskResult`. Code 0 = success. Non-zero = error. Check the task's action arguments for typos if it fails.

### Can scheduled tasks run PowerShell scripts silently (no window)?

Yes: use `-WindowStyle Hidden` in the action: `-Argument "-WindowStyle Hidden -File C:\script.ps1"`.
