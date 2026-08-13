---
title: "Process Explorer and System Informer: Advanced Task Manager for Windows"
date: "2026-08-16"
publishDate: "2026-08-16"
updated: "2026-08-16"
description: "How to use Process Explorer from Sysinternals and System Informer to analyze Windows processes. Find which process locks a file, check suspicious processes and replace Task Manager."
tags: ["windows", "process-explorer", "sysinternals", "diagnostics", "security", "tools"]
readTime: 7
translatesUk: "process-explorer-system-informer-windows"
---

Process Explorer from Microsoft Sysinternals is an advanced Task Manager. Shows process tree, loaded DLLs, open files and handles. System Informer is its open-source equivalent with even more features.

---

## Process Explorer vs Task Manager

| | Task Manager | Process Explorer |
|-|-------------|-----------------|
| Process tree | ❌ | ✅ |
| DLLs and handles | ❌ | ✅ |
| Find file in processes | ❌ | ✅ |
| VirusTotal check | ❌ | ✅ |

---

## Download

```powershell
winget install Microsoft.Sysinternals.ProcessExplorer
# Or System Informer (open source):
winget install winsiderss.systeminformer
```

---

## Process Tree

Shows parent-child process relationships:
```
explorer.exe
  └── chrome.exe
        ├── chrome.exe (renderer)
        └── chrome.exe (gpu)
```

**Color coding:**
| Color | Meaning |
|-------|---------|
| 🟣 Purple | Packed process (suspicious) |
| 🔵 Blue | System process |
| 🟢 Green | New process (just started) |
| 🔴 Red | Process terminating |

---

## Find Which Process Is Locking a File

When Windows says "file is in use by another program":

```
Find → Find Handle or DLL (Ctrl+F)
→ Type filename
→ Process Explorer finds the process holding it
```

Right-click process → **Close Handle** to forcibly release the file.

---

## VirusTotal Check

```
Options → VirusTotal.com → Check VirusTotal.com
```

VirusTotal column shows how many AV engines flag each process. `0/72` = clean. `5/72` = suspicious.

---

## Replace Task Manager

```
Options → Replace Task Manager
```

Now `Ctrl+Shift+Esc` opens Process Explorer instead.

---

## Suspicious Process Signs

🔴 **Alerts:**
- No digital signature (Not Verified)
- Running from `%TEMP%` or `%APPDATA%`
- Name mimics system process with typo (svchost32.exe)

✅ **Normal:**
- Microsoft or known vendor, Verified signature
- Running from `C:\Windows\System32` or `C:\Program Files`

---

## Suspend Instead of Kill

Right-click a process → **Suspend** — freezes it without terminating, useful for investigating misbehaving software without losing its state.

Right-click → **Kill Process Tree** — kills the process and everything it spawned (useful for malware that relaunches itself via children).

---

## Find the Thread Causing High CPU

Double-click a high-CPU process → **Threads** tab → sort by the CPU column → the top thread shows the call stack → expand it to see which function is consuming CPU.

---

## Network Connections (TCP/IP Tab)

Process properties → **TCP/IP** tab — every network connection from this process, local and remote addresses and ports.

---

## Compare Against a Baseline

Options → **Difference Highlight Duration** → set to 3 seconds.

New processes are highlighted green, exiting processes red — useful for spotting malware that launches and terminates quickly.

---

## Remote Analysis

Process Explorer doesn't support remote inspection directly. For a remote PC, use PsExec (also from Sysinternals) to run Process Explorer on the remote machine and stream results.

---

## Summary

| Task | Location in Process Explorer |
|------|----------------------------|
| Find process locking file | Find → Find Handle (Ctrl+F) |
| Check suspicious process | VirusTotal column |
| Replace Task Manager | Options → Replace Task Manager |
| Process tree | Main window |
| DLL and file details | Double-click process |
