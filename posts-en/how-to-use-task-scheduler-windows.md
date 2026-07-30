---
title: "How to Use Task Scheduler in Windows 10 and 11: Full Guide"
date: "2026-05-10"
publishDate: "2026-05-10"
description: "Create, edit and manage scheduled tasks in Windows Task Scheduler. Run scripts, programs and backups automatically on schedule, login, or system event."
tags: ["windows", "automation", "administration", "powershell"]
readTime: 7
translatesUk: "keruvannya-zaplanovanym-zavdannyam-windows"
---

Task Scheduler lets you run any program, script, or command automatically — on a schedule, at login, on system startup, or triggered by an event. Here's how to use it effectively.

---

## Open Task Scheduler

`Win + R` → `taskschd.msc`

Or: `Win + S` → search **Task Scheduler**

---

## Basic Concepts

A scheduled task has three parts:
- **Trigger** — when to run (time, event, login, startup)
- **Action** — what to run (executable, script, arguments)
- **Principal** — which account to run as (user, SYSTEM, highest privileges)

---

## Task Scheduler Structure

- **Task Scheduler Library** — all existing tasks, organized in folders
- **Microsoft\Windows** — built-in Windows tasks (don't delete these)
- Your custom tasks go in the root or a custom folder

---

## Create a Basic Scheduled Task

**Via GUI:**

1. Right-click **Task Scheduler Library** → **Create Basic Task**
2. Name: `My Backup Task`
3. Trigger: **Daily**, **Weekly**, **At startup**, or **When I log on**
4. Action: **Start a program**
5. Program: `C:\Scripts\backup.ps1` or any `.exe`
6. Finish

**Via PowerShell:**

```powershell
# Run a script every day at 9:00 AM
$action  = New-ScheduledTaskAction -Execute "powershell.exe" `
           -Argument "-NonInteractive -File C:\Scripts\backup.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At "9:00AM"
$settings = New-ScheduledTaskSettingsSet -RunOnlyIfNetworkAvailable

Register-ScheduledTask -TaskName "DailyBackup" `
  -Action $action -Trigger $trigger -Settings $settings `
  -Description "Daily backup at 9AM" -RunLevel Highest
```

---

## Common Trigger Types

```powershell
# At system startup
$trigger = New-ScheduledTaskTrigger -AtStartup

# At user login
$trigger = New-ScheduledTaskTrigger -AtLogOn

# Every hour
$trigger = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Hours 1) -Once -At "00:00"

# On specific day of week
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At "08:00AM"

# At idle (when PC not in use)
$settings = New-ScheduledTaskSettingsSet -RunOnlyIfIdle -IdleDuration (New-TimeSpan -Minutes 10)
```

---

## Run PowerShell Scripts via Task Scheduler

```powershell
# Always use -NonInteractive and -ExecutionPolicy Bypass for scheduled scripts
$action = New-ScheduledTaskAction `
  -Execute "powershell.exe" `
  -Argument "-NonInteractive -ExecutionPolicy Bypass -WindowStyle Hidden -File C:\Scripts\task.ps1"

# Run as SYSTEM (no user needs to be logged in)
Register-ScheduledTask -TaskName "SystemTask" `
  -Action $action -Trigger (New-ScheduledTaskTrigger -AtStartup) `
  -Principal (New-ScheduledTaskPrincipal -UserId "SYSTEM" -RunLevel Highest)
```

---

## Manage Existing Tasks

```powershell
# List all custom tasks (not Microsoft built-ins)
Get-ScheduledTask | Where-Object {$_.TaskPath -eq "\"} |
  Select-Object TaskName, State, @{n='LastRun';e={$_.LastRunTime}}

# Run a task immediately
Start-ScheduledTask -TaskName "DailyBackup"

# Disable a task
Disable-ScheduledTask -TaskName "DailyBackup"

# Delete a task
Unregister-ScheduledTask -TaskName "DailyBackup" -Confirm:$false

# Check last run result (0 = success)
(Get-ScheduledTaskInfo -TaskName "DailyBackup").LastTaskResult
```

---

## Useful Scheduled Task Examples

**Auto-cleanup temp files weekly:**
```powershell
$action  = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument '-Command "Remove-Item $env:TEMP\* -Recurse -Force -EA 0"'
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At "02:00AM"
Register-ScheduledTask -TaskName "WeeklyCleanup" -Action $action -Trigger $trigger -RunLevel Highest
```

**Run script on USB drive connection (Event trigger):**
```powershell
$trigger = New-ScheduledTaskTrigger -AtStartup  # use Event trigger via GUI for USB events
# In GUI: Trigger → New → On an event → System → 20001 (USB device connected)
```

**Wake PC to run task:**

In task properties → **Conditions** → check **Wake the computer to run this task**

---

## Modify an Existing Task

```powershell
# Change trigger time
$task = Get-ScheduledTask -TaskName "DailyBackup"
$task.Triggers[0].StartBoundary = "2026-06-01T08:00:00"
$task | Set-ScheduledTask

# Change the action's script
Set-ScheduledTask -TaskName "DailyBackup" `
  -Action (New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-File C:\Scripts\new-script.ps1")
```

---

## Run a Task as a Different User

```powershell
$principal = New-ScheduledTaskPrincipal `
  -UserId "DOMAIN\ServiceAccount" `
  -LogonType Password `
  -RunLevel Highest

Register-ScheduledTask -TaskName "ServiceTask" `
  -Action $action -Trigger $trigger -Principal $principal `
  -Password "ServicePassword123!"
```

---

## Common Issues

- Task runs but the script fails silently → add logging inside your script to capture errors
- **"The task image is corrupt"** → delete and recreate the task
- Script works when run manually but not when scheduled → check the execution policy and use full paths in the script arguments

```powershell
# Test with full path and explicit execution policy, same as Task Scheduler would run it
powershell.exe -ExecutionPolicy Bypass -NonInteractive -File "C:\Scripts\myscript.ps1"
```

---

## Troubleshoot Scheduled Tasks

```powershell
# View task history (enable in Task Scheduler: Action → Enable All Tasks History)
Get-WinEvent -LogName "Microsoft-Windows-TaskScheduler/Operational" -MaxEvents 20 |
  Where-Object {$_.Message -like "*DailyBackup*"} |
  Select-Object TimeCreated, Message

# Common error codes
# 0x0      = Success
# 0x1      = Incorrect function (script error)
# 0x41301  = Task is currently running
# 0x41306  = Task is disabled
# 0x8004131F = No instances of the task are running
```

---

## Frequently Asked Questions

### My scheduled task runs fine when I trigger it manually but not on schedule — why?

Most common causes: the user account doesn't have the "Log on as batch job" right, or the task is set to run only when a user is logged in. Check the Principal settings — use SYSTEM or "Run whether user is logged on or not".

### Can scheduled tasks run PowerShell scripts silently, with no window?

Yes: add `-WindowStyle Hidden` to the action, e.g. `-Argument "-WindowStyle Hidden -File C:\script.ps1"`.

---

## Summary

`taskschd.msc` opens Task Scheduler. Use `Register-ScheduledTask` in PowerShell for scripted task creation. Always use `-NonInteractive -ExecutionPolicy Bypass` for PowerShell scripts. Run as SYSTEM for tasks that need to run without a logged-in user. Check Last Run Result — 0 means success.

For event-based triggers, retry logic, hidden-task auditing and other advanced scenarios, see [Windows Task Scheduler: Advanced Triggers, Conditions and Hidden Tasks](/en/how-to-configure-windows-task-scheduler-advanced).
