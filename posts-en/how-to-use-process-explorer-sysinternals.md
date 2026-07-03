---
title: "How to Use Process Explorer (Sysinternals) for Deep Windows Diagnostics"
date: "2026-06-11"
publishDate: "2026-06-11"
description: "Use Sysinternals Process Explorer to analyze running processes, find malware, view DLLs, check handles and replace Task Manager with a more powerful alternative."
tags: ["windows", "process-explorer", "sysinternals", "diagnostics", "security"]
readTime: 5
translatesUk: "process-explorer-sysinternals"
---

Process Explorer is the advanced replacement for Task Manager — it shows what each process is actually doing, what files it has open, and flags suspicious processes automatically.

---

## Install Process Explorer

```powershell
# Via winget
winget install Microsoft.Sysinternals.ProcessExplorer

# Or download from microsoft.com/sysinternals
```

---

## Replace Task Manager

Open Process Explorer → **Options** → **Replace Task Manager**

Now `Ctrl + Alt + Delete` → Task Manager opens Process Explorer instead.

---

## Key Features vs Task Manager

| Feature | Task Manager | Process Explorer |
|---------|-------------|-----------------|
| Process tree (parent/child) | ❌ | ✅ |
| DLLs loaded per process | ❌ | ✅ |
| Handles (open files, registry keys) | ❌ | ✅ |
| VirusTotal integration | ❌ | ✅ |
| Tooltip with description | ❌ | ✅ |
| Threads per process | ❌ | ✅ |

---

## Find What Process Has a File Open

```
Ctrl + F → type filename → shows which process has it open
```

Useful when you get "file in use" errors — find and close the app holding it.

---

## Check Process with VirusTotal

Right-click any process → **Check VirusTotal** → opens web browser with results

Or: **Options** → **VirusTotal.com** → **Check VirusTotal.com** — automatically submits all process hashes.

**Red entries** = flagged by VirusTotal → investigate immediately.

---

## Identify Suspicious Processes

```powershell
# Processes without a description are suspicious
# Color coding in Process Explorer:
# Purple = packed/compressed executable (common in malware)
# Red = being terminated
# Pink = services
# Blue = run by your user
# Dark grey = suspended
```

Look for:
- Two processes with the same name (e.g. two `svchost.exe` with different paths)
- `svchost.exe` NOT in `C:\Windows\System32\`
- `explorer.exe` with child processes (unusual)
- Unsigned executables with no company name

---

## View DLLs Loaded by a Process

`View` menu → **Lower Pane View** → **DLLs**

Click any process → bottom panel shows all loaded DLLs. Look for unsigned or unknown DLLs — malware often injects into legitimate processes.

---

## View Open Handles

`View` → **Lower Pane View** → **Handles**

Shows every file, registry key, network connection the process has open. Useful for:
- Finding what's accessing a file
- Debugging "access denied" errors
- Malware analysis (what files is it touching?)

---

## CPU and Memory Analysis

Right-click any process → **Properties** → **Performance** tab

Shows detailed CPU, memory and I/O history for the selected process — like a per-process Task Manager Performance tab.

---

## Kill a Process and Children

Right-click process → **Kill Process Tree** — kills the process and all processes it spawned.

Useful for malware that re-launches itself through child processes.

---

## Summary

Install and set as Task Manager replacement. Use VirusTotal check on suspicious processes. Look for unsigned, purple-highlighted or duplicate-named processes. Find file locks with `Ctrl+F`. View DLLs for injection detection.

## Frequently Asked Questions

### Process Explorer shows a process as purple — is it malware?

Purple means the executable is packed or compressed (UPX or similar packer). This is used by malware to evade detection but also by some legitimate software. Check VirusTotal and verify the file path.

### svchost.exe is using a lot of CPU — how do I find which service?

In Process Explorer: hover over the svchost.exe process → tooltip shows which services are running inside it. Or click on it → Properties → Services tab.

### Can I use Process Explorer remotely (on another PC)?

Not directly. For remote analysis use PsExec (also from Sysinternals) to run Process Explorer on a remote machine and stream results.
