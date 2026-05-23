---
title: "How to Fix High RAM Usage in Windows 10 and 11"
date: "2026-07-02"
publishDate: "2026-07-02"
description: "RAM constantly at 80-90% even when idle? Find what's consuming memory in Windows and free it up: disable memory-hungry services, clear standby memory, and fix memory leaks."
tags: ["windows", "optimization", "performance", "ram"]
readTime: 6
---

High RAM usage slows down everything — apps take longer to open, the system stutters, and Windows starts using the pagefile heavily. Here's how to diagnose and fix it.

---

## Check What's Using RAM

`Ctrl + Shift + Esc` → **Processes** → click **Memory** column to sort

Look at:
- **In use** — RAM actively used
- **Available** — free RAM
- **Committed** — total virtual memory used (can exceed physical RAM)

```powershell
# Top RAM consumers
Get-Process | Sort-Object WorkingSet -Descending |
  Select-Object -First 15 Name,
    @{n='RAM(MB)';e={[math]::Round($_.WorkingSet/1MB,0)}},
    Id
```

---

## Normal vs Abnormal Usage

**Normal high RAM usage:**
- Chrome/Edge with 10+ tabs: 2–4 GB is expected
- After running many apps — Windows keeps data in RAM for fast relaunch
- Immediately after boot — Windows preloads frequently used data (Superfetch)

**Abnormal:**
- 6+ GB used with no apps open
- RAM usage grows over hours without opening anything (memory leak)
- System becomes unresponsive as RAM fills

---

## Fix 1: Disable Startup Programs

Programs that run at startup stay in memory.

`Ctrl + Shift + Esc` → **Startup apps** → disable everything with High impact you don't need.

---

## Fix 2: Adjust Visual Effects

Windows visual effects consume RAM.

`Win + R` → `sysdm.cpl` → **Advanced** → **Performance Settings** → **Adjust for best performance**

Or selectively uncheck: Animate windows, Fade menus, Transparent glass — keep smooth fonts and thumbnail previews.

---

## Fix 3: Disable SysMain (Superfetch)

SysMain preloads frequently used apps into RAM. On systems with limited RAM it can be counterproductive.

```powershell
Stop-Service SysMain
Set-Service SysMain -StartupType Disabled
```

Check if it helps — restart and monitor. On SSDs with 8+ GB RAM, disabling SysMain usually has minimal impact. On HDDs or with 4 GB RAM, it can make a noticeable difference.

---

## Fix 4: Clear Standby Memory

Windows keeps recently used data in "Standby" memory — it looks used but is immediately available for new apps. This is normal behavior.

To clear it manually (if you need RAM right now):

Download **RAMMap** from [Sysinternals](https://learn.microsoft.com/en-us/sysinternals/downloads/rammap) → **Empty** → **Empty Standby List**

This doesn't permanently fix anything — Windows refills standby quickly. But it's useful before a RAM-intensive task.

---

## Fix 5: Find and Fix Memory Leaks

If RAM grows continuously over hours, a process has a memory leak.

**Identify the leaking process:**
```powershell
# Watch RAM usage of all processes, refresh every 30 seconds
while ($true) {
  Get-Process | Sort-Object WorkingSet -Descending |
    Select-Object -First 5 Name, @{n='RAM(MB)';e={[math]::Round($_.WorkingSet/1MB,0)}}
  Start-Sleep 30
  Clear-Host
}
```

The process whose RAM keeps growing has the leak. Restart it, update it, or report the bug to its developer.

Common leakers: older browsers, some antivirus software, certain printer drivers.

---

## Fix 6: Adjust Virtual Memory (Pagefile)

If RAM is genuinely full and you can't add more, increase the pagefile:

`Win + R` → `sysdm.cpl` → **Advanced** → **Performance Settings** → **Advanced** → **Virtual memory** → **Change**

Uncheck **Automatically manage** → set:
- Initial size: 1.5x RAM in MB (e.g., 12288 for 8 GB)
- Maximum size: 3x RAM in MB (e.g., 24576 for 8 GB)

This won't make the PC faster but prevents out-of-memory crashes.

---

## Fix 7: Check for Memory-Hungry Services

```powershell
# Services consuming significant memory
Get-Process svchost | ForEach-Object {
  $pid = $_.Id
  $services = Get-WmiObject Win32_Service |
    Where-Object {$_.ProcessId -eq $pid} |
    Select-Object -ExpandProperty Name
  [PSCustomObject]@{
    PID = $pid
    'RAM(MB)' = [math]::Round($_.WorkingSet/1MB,0)
    Services = ($services -join ', ')
  }
} | Sort-Object 'RAM(MB)' -Descending | Select-Object -First 5
```

Identify services inside high-memory svchost instances — disable ones you don't need.

---

## Fix 8: Scan for Malware

Some malware runs memory-resident processes that consume RAM.

```powershell
Start-MpScan -ScanType FullScan
```

---

## When to Add More RAM

If after all fixes you're still consistently above 85% with normal workload — you need more RAM.

| RAM | Suitable for |
|-----|-------------|
| 4 GB | Light use only, web browsing |
| 8 GB | Standard use, light multitasking |
| 16 GB | Gaming, development, heavy multitasking |
| 32 GB+ | Video editing, VMs, professional workloads |

Check if you can upgrade: `Win + R` → `msinfo32` → look for **Installed Physical Memory** and your motherboard model → search for max supported RAM.

---


---

## 🔍 Не знаєш що означає код помилки Windows?

Якщо Windows показує код на кшталт `0x80070005`, `0x80070002` або `0xC000021A` — скористайся безкоштовним інструментом:

**[→ Декодер помилок Windows](/tools/windows-error-decoder)** — введи код і одразу дізнайся що він означає та як виправити.


## Summary

Check Task Manager Memory tab first. Disable startup programs. For gradual growth: find the leaking process. For immediate relief: clear standby with RAMMap. If consistently above 85% with normal use: add more RAM — software fixes only help so much.
