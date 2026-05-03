---
title: "How to Use Windows Event Viewer to Diagnose Problems"
date: "2026-05-25"
publishDate: "2026-05-25"
description: "Event Viewer records everything that happens on your Windows PC. Learn how to find errors, diagnose crashes, track login attempts, and filter events to solve real problems."
tags: ["windows", "diagnostics", "tools", "troubleshooting"]
readTime: 6
---

Event Viewer logs every significant action on your PC — crashes, failed logins, driver errors, service failures. Most people ignore it. Those who know how to use it can diagnose problems in minutes.

---

## Open Event Viewer

`Win + R` → `eventvwr.msc`

Or: right-click **Start** → **Event Viewer**

---

## Understanding the Structure

**Windows Logs** — the main logs:
- **Application** — app crashes, errors, warnings from installed software
- **Security** — login attempts (success and failure), privilege use, account changes
- **System** — Windows component errors, driver failures, service crashes

**Applications and Services Logs** — detailed logs from specific Windows components (Defender, Windows Update, Diagnostics, etc.)

---

## Finding the Cause of a Crash

After a system crash or unexpected restart, go to:

**Windows Logs** → **System** → look for **Critical** and **Error** events around the time of the crash.

Click any event to see:
- **Source** — which component logged it
- **Event ID** — specific error code
- **Description** — what happened

Search the Event ID on [google.com](https://google.com) or [learn.microsoft.com](https://learn.microsoft.com) for solutions.

---

## Filter Events (Critical)

Don't scroll through thousands of entries — filter:

Right-click **System** → **Filter Current Log**:
- **Event level**: check **Critical** and **Error**
- **Event sources**: select specific component
- **Event IDs**: enter specific IDs

```powershell
# PowerShell equivalent — last 20 system errors
Get-EventLog -LogName System -EntryType Error -Newest 20 |
  Select-Object TimeGenerated, Source, EventID, Message
```

---

## Track Login Attempts

**Security log** records all login activity. Requires auditing to be enabled:

```powershell
# Enable login auditing
auditpol /set /subcategory:"Logon" /success:enable /failure:enable
```

Then check:

```powershell
# Successful logins (Event ID 4624)
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4624} -MaxEvents 10 |
  Select-Object TimeCreated, @{n='User';e={$_.Properties[5].Value}}, @{n='Type';e={$_.Properties[8].Value}}

# Failed logins (Event ID 4625)
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625} -MaxEvents 10 |
  Select-Object TimeCreated, @{n='User';e={$_.Properties[5].Value}}
```

Multiple failed logins from unexpected users = someone is trying to get in.

---

## Find Application Crashes

**Windows Logs** → **Application** → filter for **Error** → look for source **Application Error** or the app name itself.

Event ID 1000 = application crash. The description shows which `.exe` and `.dll` were involved.

```powershell
Get-WinEvent -FilterHashtable @{LogName='Application'; Id=1000} -MaxEvents 5 |
  Select-Object TimeCreated, @{n='App';e={$_.Properties[0].Value}}, @{n='Version';e={$_.Properties[1].Value}}
```

---

## Check Boot Performance

**Applications and Services Logs** → **Microsoft** → **Windows** → **Diagnostics-Performance** → **Operational**

- **Event ID 100** — total boot time in milliseconds
- **Event ID 101** — specific component that delayed boot
- **Event ID 200** — app shutdown performance

```powershell
Get-WinEvent -FilterHashtable @{
  LogName='Microsoft-Windows-Diagnostics-Performance/Operational'
  Id=100
} -MaxEvents 3 | Select-Object TimeCreated, Message
```

---

## Check Windows Update History

**Applications and Services Logs** → **Microsoft** → **Windows** → **WindowsUpdateClient** → **Operational**

Shows every update that was installed or failed, with error codes.

```powershell
Get-WinEvent -LogName "Microsoft-Windows-WindowsUpdateClient/Operational" -MaxEvents 20 |
  Where-Object {$_.Id -in @(19, 20, 43)} |
  Select-Object TimeCreated, Id, Message
```

Event ID 19 = update downloaded, 20 = installed, 43 = installation started.

---

## Create a Custom View

For recurring investigations, save filter settings as a custom view:

Right-click **Custom Views** → **Create Custom View** → set your filters → give it a name.

The view persists between sessions and shows up in the left panel.

---

## Export Events

```powershell
# Export filtered events to CSV
Get-EventLog -LogName System -EntryType Error -Newest 100 |
  Export-Csv "C:\Logs\system-errors.csv" -NoTypeInformation
```

Or in GUI: right-click any log → **Save All Events As** → `.evtx` format can be reopened in Event Viewer later.

---

## Common Event IDs Reference

| ID | Log | Meaning |
|----|-----|---------|
| 41 | System | Unexpected shutdown/crash |
| 1001 | Application | Windows Error Reporting (post-crash) |
| 4624 | Security | Successful login |
| 4625 | Security | Failed login |
| 4720 | Security | User account created |
| 4726 | Security | User account deleted |
| 6006 | System | Clean shutdown |
| 6008 | System | Unexpected shutdown |
| 7034 | System | Service crashed |
| 7045 | System | New service installed |

---

## Summary

For crash diagnosis: **System** log → filter **Critical + Error** → check times around the incident. For security: **Security** log → Event IDs 4624/4625. For boot issues: **Diagnostics-Performance** → Event ID 100. Learn to filter — raw event logs are too noisy to read unfiltered.
