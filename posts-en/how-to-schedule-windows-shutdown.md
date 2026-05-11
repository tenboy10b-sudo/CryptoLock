---
title: "How to Schedule Windows Shutdown, Restart, or Sleep"
date: "2026-08-21"
publishDate: "2026-08-21"
description: "Schedule Windows to automatically shut down, restart, or sleep at a specific time using shutdown command, Task Scheduler, and PowerShell. Cancel a scheduled shutdown before it runs."
tags: ["windows", "automation", "tools", "powershell"]
readTime: 4
---

Need Windows to shut down at midnight, restart after a scheduled update, or sleep when a download finishes? Here are all the ways to schedule power actions.

---

## Shutdown in X Minutes (CMD)

```cmd
rem Shutdown in 60 minutes (3600 seconds)
shutdown /s /t 3600

rem Restart in 30 minutes
shutdown /r /t 1800

rem Shutdown with a message shown to users
shutdown /s /t 1800 /c "PC will shut down in 30 minutes"
```

`/s` = shutdown, `/r` = restart, `/t` = time in seconds

---

## Cancel a Scheduled Shutdown

```cmd
shutdown /a
```

Works any time before the timer expires. You'll see a notification confirming the cancellation.

---

## Shutdown at a Specific Time

CMD doesn't support "at 11:30 PM" directly — use `at` command or Task Scheduler. The simplest way:

```powershell
# Shutdown at 23:30 today
$target = Get-Date "23:30:00"
$secondsUntil = ($target - (Get-Date)).TotalSeconds
if ($secondsUntil -gt 0) {
  shutdown /s /t ([int]$secondsUntil)
  Write-Host "Shutdown scheduled for $target"
} else {
  Write-Host "Target time has already passed"
}
```

---

## Task Scheduler: Recurring Shutdown

For a shutdown that runs every day at the same time:

`Win + R` → `taskschd.msc` → **Create Basic Task**:
- **Trigger**: Daily → set time (e.g., 23:00)
- **Action**: Start a program
- **Program**: `shutdown.exe`
- **Arguments**: `/s /f /t 0`

`/f` forces running apps to close. `/t 0` shuts down immediately.

```powershell
# Same via PowerShell
$action = New-ScheduledTaskAction -Execute "shutdown.exe" -Argument "/s /f /t 0"
$trigger = New-ScheduledTaskTrigger -Daily -At "23:00"
Register-ScheduledTask -TaskName "NightlyShutdown" -Action $action -Trigger $trigger -Force
```

---

## Schedule Sleep Instead of Shutdown

```powershell
# Sleep in 30 minutes
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-Command Add-Type -Assembly System.Windows.Forms; [System.Windows.Forms.Application]::SetSuspendState('Suspend', `$false, `$false)"
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(30)
Register-ScheduledTask -TaskName "SleepTimer" -Action $action -Trigger $trigger -Force
```

Simpler:
```powershell
# Immediate sleep via PowerShell
Add-Type -Assembly System.Windows.Forms
[System.Windows.Forms.Application]::SetSuspendState("Suspend", $false, $false)
```

---

## Shutdown When a Process Finishes

```powershell
# Shutdown when "handbrake.exe" finishes encoding
while (Get-Process -Name "HandBrake" -ErrorAction SilentlyContinue) {
  Start-Sleep 30
}
shutdown /s /t 60 /c "Encoding done. Shutting down in 60 seconds."
```

---

## Create a Desktop Shortcut for Quick Shutdown Timer

Right-click desktop → **New** → **Shortcut** → enter:
```
shutdown.exe /s /t 3600
```
Name it "Shutdown in 1 hour" → click **Finish**.

Double-click the shortcut whenever you want to set the timer.

---

## Useful Shutdown Flags

| Flag | Meaning |
|------|---------|
| `/s` | Shutdown |
| `/r` | Restart |
| `/h` | Hibernate |
| `/l` | Log off |
| `/a` | Cancel scheduled shutdown |
| `/t X` | Wait X seconds |
| `/f` | Force close apps |
| `/c "msg"` | Show message to users |

---

## Summary

Quick timer: `shutdown /s /t 3600` (seconds). Cancel: `shutdown /a`. Specific time: use PowerShell to calculate seconds until target time. Recurring: Task Scheduler with `shutdown.exe /s /f /t 0`. Wait for process: loop with `Get-Process` check.
