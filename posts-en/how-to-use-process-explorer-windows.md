---
title: "How to Use Process Explorer: The Better Task Manager"
date: "2026-03-29"
publishDate: "2026-03-29"
description: "Process Explorer from Microsoft Sysinternals shows far more than Task Manager: process trees, DLL details, VirusTotal scanning, and handle information. Complete guide for Windows."
tags: ["windows", "tools", "diagnostics", "security"]
readTime: 6
---

Process Explorer is a free tool from Microsoft Sysinternals that replaces Task Manager for serious diagnostics. It shows process trees, loaded DLLs, handles, and integrates with VirusTotal.

---

## Download and Run

Download from [learn.microsoft.com/sysinternals/downloads/process-explorer](https://learn.microsoft.com/en-us/sysinternals/downloads/process-explorer) — no installation needed, just run `procexp.exe`.

Run as Administrator for full detail (some processes require elevated access to inspect).

**Replace Task Manager permanently:**
Options menu → **Replace Task Manager** — now `Ctrl + Alt + Del` opens Process Explorer.

---

## Understanding the Display

**Color coding:**
- **Blue** — selected process
- **Pink** — service (running in svchost.exe)
- **Cyan** — own process (launched by you)
- **Dark gray** — suspended process
- **Purple** — packed executable (may indicate malware)
- **Red** — process about to exit

**Process tree:**
Shows parent-child relationships. Malware often hides by spawning from system processes — the tree makes this visible.

---

## Find What a Process Is

Right-click any process → **Search Online** — opens a browser search for the process name.

Hover over a process → tooltip shows company name and description.

For unknown processes:
1. Right-click → **Properties** → **Image** tab → check path and company
2. Right-click → **Check VirusTotal.com** — scans the executable hash against 70+ antivirus engines

---

## Enable VirusTotal Integration

Options → **VirusTotal.com** → **Check VirusTotal.com**

A **VirusTotal** column appears showing detection ratio (e.g., `0/72` = clean, `5/72` = possibly malicious).

First use requires accepting VirusTotal's terms. Process hashes are submitted, not the files themselves.

---

## View Loaded DLLs

View → **Lower Pane** → **DLLs**

Click any process → lower pane shows every DLL it has loaded. Useful for:
- Finding injected malware DLLs
- Checking which processes use a specific library
- Diagnosing crashes caused by DLL conflicts

---

## Search for Handles and DLLs

`Ctrl + F` → type a filename or DLL name → Find

Shows every process that has that file open or loaded. Use this to:
- Find what's locking a file you can't delete
- Find which process loaded a specific DLL
- Identify which app is accessing a particular folder

---

## Suspend and Kill Processes

Right-click process → **Suspend** — freezes the process without killing it. Useful for investigating misbehaving software.

Right-click → **Kill Process** — immediate termination
Right-click → **Kill Process Tree** — kills the process and all children

---

## Process Properties

Double-click any process → **Properties** window:

**Image tab:**
- Full path to executable
- Start time and CPU time
- Parent process
- Company name and description

**Performance tab:**
- CPU and memory history graphs
- Page faults, I/O statistics

**Threads tab:**
- All running threads with stack traces
- Identify threads stuck in infinite loops

**TCP/IP tab:**
- All network connections from this process
- Local and remote addresses and ports

---

## Find Process Causing High CPU

Double-click the high-CPU process → **Threads** tab → click **CPU** column to sort → the top thread shows the call stack → expand to see which function is consuming CPU.

---

## Compare to Baseline

Options → **Difference Highlight Duration** → set to 3 seconds

New processes are highlighted green, exiting processes red. Watch for suspicious process launches — malware often spawns and terminates quickly.

---

## Process Explorer vs Task Manager

| Feature | Task Manager | Process Explorer |
|---------|-------------|-----------------|
| Process tree | ❌ | ✅ |
| DLL list | ❌ | ✅ |
| Handle search | ❌ | ✅ |
| VirusTotal scan | ❌ | ✅ |
| Thread details | Basic | Full stack |
| Suspend process | ❌ | ✅ |
| Color coding | Basic | Detailed |

---

## Summary

Download and run as Administrator. Enable VirusTotal integration. Use `Ctrl + F` to find which process locks a file. Right-click unknown processes and choose **Search Online** or **Check VirusTotal.com**. Replace Task Manager via Options menu for daily use.
