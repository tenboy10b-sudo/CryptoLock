---
title: "Process Explorer and System Informer: Advanced Task Manager for Windows"
date: "2026-06-18"
publishDate: "2026-09-24"
updated: "2026-06-18"
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

## Summary

| Task | Location in Process Explorer |
|------|----------------------------|
| Find process locking file | Find → Find Handle (Ctrl+F) |
| Check suspicious process | VirusTotal column |
| Replace Task Manager | Options → Replace Task Manager |
| Process tree | Main window |
| DLL and file details | Double-click process |
