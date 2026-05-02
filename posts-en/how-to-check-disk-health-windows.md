---
title: "How to Check Disk Health in Windows: HDD and SSD"
date: "2026-04-21"
publishDate: "2026-04-21"
description: "Check if your hard drive or SSD is failing before it's too late. How to read SMART data, run chkdsk, and interpret results for both HDD and SSD in Windows 10 and 11."
tags: ["windows", "disk", "diagnostics", "tools"]
readTime: 6
---

Drives fail without warning. A quick health check takes two minutes and can save you from data loss. Here's how to do it properly.

---

## Quick Check: SMART Status

SMART (Self-Monitoring, Analysis and Reporting Technology) is built into every modern drive. Windows can read it:

```cmd
wmic diskdrive get status, model, size
```

`OK` means no SMART failures detected. Anything else — `Pred Fail`, `Bad`, `Unknown` — means the drive is reporting problems.

For more detail, use PowerShell:

```powershell
Get-PhysicalDisk | Select-Object FriendlyName, MediaType, OperationalStatus, HealthStatus, Size
```

---

## Detailed SMART Data with CrystalDiskInfo

The built-in tools only show pass/fail. **CrystalDiskInfo** (free, no install required) shows individual SMART attributes:

Download from [crystalmark.info](https://crystalmark.info/en/software/crystaldiskinfo/) → run → look at the color indicators:

- 🔵 **Good** — healthy
- 🟡 **Caution** — some attributes degraded, monitor closely
- 🔴 **Bad** — replace soon

Key attributes to watch:
- **Reallocated Sectors Count** — bad sectors the drive has remapped. Any value above 0 is concerning on an HDD.
- **Pending Sectors** — sectors waiting to be reallocated. Should be 0.
- **Uncorrectable Errors** — should be 0.
- **SSD: Wear Leveling Count / Media Wearout Indicator** — shows remaining SSD lifespan.

---

## Run chkdsk

`chkdsk` scans the filesystem for errors and marks bad sectors:

```cmd
chkdsk C: /f /r /x
```

`/f` — fix filesystem errors  
`/r` — find bad sectors and recover data  
`/x` — dismount volume first (required for system drive)

On the system drive (C:), it can't run while Windows is active. It will schedule for next reboot:

```
Would you like to schedule this volume to be checked the next time the system restarts? (Y/N)
```

Press `Y`, then restart. Takes 20–60 minutes.

---

## Check chkdsk Results

After it runs, find the results:

```powershell
Get-EventLog -LogName Application -Source "Microsoft-Windows-Chkdsk" -Newest 1 |
  Select-Object -ExpandProperty Message
```

Or: `eventvwr.msc` → **Windows Logs** → **Application** → find source **Chkdsk** or **Wininit**.

---

## Check Disk Performance

A sudden drop in speed can indicate a failing drive before SMART flags it:

```powershell
# Built-in Windows speed test
winsat disk -drive c
```

Typical results:
- HDD sequential read: 100–200 MB/s
- SSD sequential read: 300–500 MB/s (SATA), 1000–7000 MB/s (NVMe)

Significantly lower numbers than expected = drive is struggling.

---

## SSD-Specific: Check Total Bytes Written

SSDs have a finite write lifespan. Check how much has been written:

In CrystalDiskInfo, look at **Total Host Writes** or **Total Bytes Written**. Compare to the manufacturer's TBW (Terabytes Written) rating for your model.

For example: a 500GB Samsung 870 EVO is rated for 300 TBW. If yours shows 280 TBW written, it's near end of life.

---

## HDD-Specific: Listen for Sounds

Mechanical drives give audio warnings before failure:

- **Clicking** — read/write head failing. Back up immediately.
- **Grinding** — physical damage. Stop using it.
- **Repeated seeking** (constant activity light) — bad sectors, drive struggling.

SSDs fail silently — rely on SMART data, not sounds.

---

## What to Do If the Drive Is Failing

1. **Back up everything now** — don't wait
2. For HDD: run `chkdsk /f /r` to mark bad sectors so they're avoided
3. For SSD: check if it's still under warranty (most SSDs have 3–5 year warranties)
4. Replace the drive before it fails completely — data recovery from a dead drive costs hundreds of dollars

---

## Summary

Quick check: `wmic diskdrive get status` — if not `OK`, act immediately.  
Detailed check: CrystalDiskInfo for SMART attributes.  
Filesystem check: `chkdsk C: /f /r` scheduled on next boot.  
Performance check: `winsat disk -drive c`

Check drive health every 6 months. Don't skip it for SSDs — they fail without warning too.
