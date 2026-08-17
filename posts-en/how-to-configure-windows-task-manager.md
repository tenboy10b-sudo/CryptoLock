---
title: "Windows Task Manager: Complete Guide to Processes, Performance and Startup"
date: "2026-05-05"
updated: "2026-08-16"
publishDate: "2026-05-05"
description: "Master Windows Task Manager in Windows 10 and 11. Monitor CPU, RAM, disk usage, manage startup programs, set process priority/affinity, end tasks, find resource hogs and analyze performance."
tags: ["windows", "task-manager", "performance", "diagnostics", "optimization"]
readTime: 7
translatesUk: "dispecher-zavdan-windows-povnyy-gaid"
---

Task Manager is the fastest way to see what's running, what's slow, and what's using all your resources.

---

## Open Task Manager

- `Ctrl + Shift + Esc` — direct open
- `Ctrl + Alt + Delete` → Task Manager
- `Win + X` → Task Manager
- Right-click taskbar → Task Manager

---

## Processes Tab

Shows every running process with CPU, Memory, Disk and Network usage.

**Column tips:**
- **CPU** — sort descending to find CPU hogs
- **Memory** — high RAM users
- **Disk** — anything at 100% is a bottleneck
- **Network** — background downloads

```powershell
# Same info via PowerShell (more detail)
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 `
  Name, CPU, @{n='RAM MB';e={[math]::Round($_.WorkingSet/1MB,1)}}, Id
```

**Right-click options:**
- **End task** — force close
- **Open file location** — find the executable
- **Search online** — look up unknown process
- **Go to details** — see full process info

**Process tree:** click the arrow next to a process to see its child processes. Chrome and Edge show each tab as a separate entry.

---

## Performance Tab

Real-time graphs for CPU, Memory, Disk, Network and GPU.

Click **Open Resource Monitor** at the bottom for drill-down detail on what exactly is using each resource.

**What to look for:**
- CPU constantly above 80% at idle → background process or malware
- Memory "In use" close to total → need more RAM or close apps
- Disk 100% constantly → HDD bottleneck or malware
- GPU → useful for gaming and rendering

---

## App History Tab

Cumulative CPU and Network usage per app since the last reset. Useful for finding which apps consumed most resources over time.

---

## Startup Tab

Shows every program that runs at login with its impact on startup time.

```powershell
# Same info with more detail
Get-CimInstance Win32_StartupCommand | Select-Object Name, Location, Command
```

**Startup impact levels:**
- **High** — significantly delays boot → disable if not needed immediately
- **Medium** — moderate impact
- **Low/None** — minimal impact

Right-click → **Disable** to prevent startup. This doesn't uninstall — just prevents auto-start.

---

## Users Tab

Shows all logged-in users and their resource usage — useful on shared PCs. Right-click a user → **Disconnect** or **Sign off** to free up their resources.

---

## Details Tab

Shows all processes with PID, CPU, Memory and User. More technical than Processes tab.

```powershell
# Find specific process PID
(Get-Process chrome).Id

# Kill process by PID
Stop-Process -Id 1234 -Force
```

**Set process priority** (right-click → **Set priority**): increase to **Above normal** for a game or rendering task, decrease for background tasks.

**Set CPU affinity** (which cores a process uses): right-click → **Set affinity** — useful for isolating a process to specific cores.

```powershell
$proc = Get-Process -Name "myapp"
$proc.PriorityClass = "AboveNormal"
```

---

## Services Tab

All Windows services — running and stopped.

```powershell
# Same with PowerShell
Get-Service | Sort-Object Status -Descending | Format-Table Name, Status, StartType
```

---

## New Task (Run as Admin)

File menu → **Run new task** → check **Create this task with administrative privileges**

Useful when Start Menu isn't working.

---

## Useful Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Shift + Esc` | Open Task Manager |
| `Alt + F4` | Close focused window (not Task Manager) |
| `Delete` | End selected task |
| `Ctrl + N` | Open new Task Manager window |

---

## Task Manager vs Resource Monitor vs Process Explorer

| Tool | Best for |
|------|----------|
| Task Manager | Quick overview, killing apps, startup management |
| Resource Monitor | Detailed per-process disk and network activity |
| Process Explorer (Sysinternals) | Deep investigation, DLL inspection, malware analysis |

Download **Process Explorer** from [learn.microsoft.com/sysinternals](https://learn.microsoft.com/en-us/sysinternals/downloads/process-explorer) for the most powerful process inspection tool available for Windows.

---

## Summary

Use Processes tab to find resource hogs. Performance tab for real-time graphs. Startup tab to speed up boot. Details tab for PID-level control. Resource Monitor (linked from Performance) for the deepest drill-down.

## Frequently Asked Questions

### A process is using 100% CPU but I don't recognize it — should I kill it?

First search online: right-click → Search online. Most high-CPU processes are legitimate (antivirus scanning, Windows Update, search indexing). If it's unknown and suspicious, run a malware scan before killing it.

### Task Manager shows different CPU% than the Task Manager icon in system tray — why?

The icon shows overall CPU usage. The Processes tab shows per-process usage which doesn't always add up to 100% due to System Idle Process and measurement methodology.

### I ended a task and now something stopped working — how do I restart it?

File → Run new task → type the executable name. For Windows services: `Services.msc` or `Start-Service ServiceName` in PowerShell.
