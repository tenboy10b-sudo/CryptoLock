---
title: "How to Use Windows Reliability Monitor to Diagnose Crashes"
date: "2026-09-12"
publishDate: "2026-09-12"
description: "Reliability Monitor shows a timeline of system stability, app crashes, Windows failures, and hardware errors. How to use it to find the cause of crashes and BSODs."
tags: ["windows", "diagnostics", "tools", "troubleshooting"]
readTime: 4
---

Reliability Monitor shows exactly when your system became unstable — and correlates crashes with software installations, updates, and hardware events. It's the fastest way to find what broke Windows.

---

## Open Reliability Monitor

`Win + S` → search **Reliability Monitor**

Or: `Win + R` → `perfmon /rel`

Or: `Control Panel` → **Security and Maintenance** → **View reliability history**

---

## Reading the Chart

The chart shows a **stability index** from 1 (very unstable) to 10 (perfect) plotted over time.

**Icons on the timeline:**
- 🔴 **Red X** — critical failure (application crash, Windows error, hardware failure)
- 🟡 **Yellow !** — warning (non-critical failure)
- 🔵 **Blue i** — informational (software installed, updated, or removed)

Click any day to see what happened:

**Application failures** — programs that crashed or stopped responding
**Windows failures** — OS errors and unexpected reboots
**Miscellaneous failures** — disk errors, boot failures
**Warnings** — driver installation issues
**Information** — successful installations

---

## Find What Caused a Crash

1. Find the day when problems started (big stability drop)
2. Look at **Information** entries for that day — what was installed?
3. Cross-reference with **Application failures** or **Windows failures**

If stability dropped after installing software → that software likely caused it.

---

## View Problem Details

Click any red X or yellow ! → **View technical details** → shows:
- Exact time and date
- Faulting application or module name
- Error code
- Event ID for cross-referencing with Event Viewer

---

## PowerShell: Get Reliability Data

```powershell
# Get all critical events from Reliability Monitor data
Get-WinEvent -LogName "Microsoft-Windows-Reliability Analysis Component/Operational" `
  -ErrorAction SilentlyContinue |
  Where-Object {$_.Level -le 2} |
  Select-Object TimeCreated, Message |
  Select-Object -First 20 | Format-List

# Alternative: System log critical events
Get-WinEvent -FilterHashtable @{
  LogName = 'System'
  Level = @(1, 2)  # Critical and Error
  StartTime = (Get-Date).AddDays(-30)
} | Select-Object TimeCreated, ProviderName, Id, Message |
  Sort-Object TimeCreated -Descending |
  Select-Object -First 20
```

---

## Check All Recent Problem Events

```powershell
# Application crashes (Event ID 1000)
Get-WinEvent -FilterHashtable @{LogName='Application'; Id=1000} -MaxEvents 10 |
  Select-Object TimeCreated,
    @{n='App';e={$_.Properties[0].Value}},
    @{n='Fault Module';e={$_.Properties[4].Value}}

# Unexpected shutdowns (Event ID 41)
Get-WinEvent -FilterHashtable @{LogName='System'; Id=41} -MaxEvents 5 |
  Select-Object TimeCreated, Message
```

---

## Save Reliability Report

In Reliability Monitor → **Save a reliability history** → saves to XML for sharing with IT support.

---

## Reliability Monitor vs Event Viewer

| | Reliability Monitor | Event Viewer |
|---|---|---|
| Visual timeline | ✅ | ❌ |
| Easy to read | ✅ | ❌ |
| Full detail | Limited | ✅ |
| Filter/search | Basic | Advanced |
| Best for | Finding *when* problems started | Finding *why* |

Use Reliability Monitor first to identify the timeframe and event, then switch to Event Viewer for detailed investigation.

---

## Summary

Open with `perfmon /rel`. Look for the day when stability dropped. Check what was installed (blue circles) and what failed (red X) on that day. Click any event for technical details. Use this as the starting point before diving into Event Viewer logs.
