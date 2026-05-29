---
title: "How to Fix High CPU from Windows Search Indexing"
date: "2026-04-05"
publishDate: "2026-04-05"
description: "Windows Search indexer consuming too much CPU or disk? Pause indexing, exclude folders, rebuild the index, and configure it to run only when idle."
tags: ["windows", "optimization", "performance", "tools"]
readTime: 5
---

Windows Search indexing runs in the background and can spike CPU and disk usage — especially after a fresh install, major update, or when many files change at once. Here's how to control it.

---

## Check If Indexing Is the Culprit

`Ctrl + Shift + Esc` → **Details** tab → look for `SearchIndexer.exe`

High CPU from SearchIndexer is normal for 30–60 minutes after a fresh install or large file operation. If it runs high for hours — something is wrong.

```powershell
# Check indexing service status
Get-Service WSearch | Select-Object Status, StartType

# View indexing status via UI
Start-Process "ms-settings:cortana-windowssearch"
```

---

## Pause Indexing Temporarily

`Win + I` → **Privacy & Security** → **Searching Windows** → **Pause Indexing** (Windows 11)

Or via service:
```powershell
# Stop indexing — resumes on next reboot
Stop-Service WSearch -Force
```

---

## Exclude Large Folders

Indexing everything causes most of the CPU overhead. Exclude folders you never search.

`Win + I` → **Privacy & Security** → **Searching Windows** → **Advanced indexing options** → **Modify** → uncheck:
- Downloads (large, rarely searched by content)
- node_modules, .git folders
- Virtual machine files
- Video/photo archives

Or exclude by file type: **Advanced** → **File Types** → uncheck `.vmdk`, `.iso`, `.vhd`, `.mp4`.

---

## Rebuild Corrupt Index

If indexing runs constantly without finishing — the index is corrupt:

**Advanced indexing options** → **Advanced** → **Rebuild**

Or via PowerShell:
```powershell
Stop-Service WSearch -Force
Remove-Item "$env:ProgramData\Microsoft\Search\Data\Applications\Windows\*" -Recurse -Force -ErrorAction SilentlyContinue
Start-Service WSearch
```

Rebuild takes 15–60 minutes depending on file count. CPU usage is normal during this time.

---

## Switch to Classic Mode

**Classic** indexes only libraries and desktop — fast and light.
**Enhanced** indexes the entire C: drive — thorough but heavier.

`Win + I` → **Privacy & Security** → **Searching Windows** → select **Classic** to reduce indexing scope.

---

## Limit Indexing via Group Policy

```powershell
# Prevent indexing on battery power
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Windows Search"
New-Item -Path $path -Force | Out-Null
Set-ItemProperty -Path $path -Name "PreventIndexingLowDiskSpaceMB" -Value 1024 -Type DWord
```

`gpedit.msc` → **Computer Configuration** → **Administrative Templates** → **Windows Components** → **Search** → **Prevent indexing when running on battery power** → Enabled

---

## Disable Indexing Completely

If you prefer real-time search (slower per query but no background CPU):

```powershell
Stop-Service WSearch -Force
Set-Service WSearch -StartupType Disabled
```

Windows Search still works without the index — it just scans files in real time when you search. For fast file-name search without indexing, install **Everything** from voidtools.com.

Re-enable anytime:
```powershell
Set-Service WSearch -StartupType Automatic
Start-Service WSearch
```

---


---

## 🔍 Не знаєш що означає код помилки Windows?

Якщо Windows показує код на кшталт `0x80070005`, `0x80070002` або `0xC000021A` — скористайся безкоштовним інструментом:

**[→ Декодер помилок Windows](/tools/windows-error-decoder)** — введи код і одразу дізнайся що він означає та як виправити.


## Summary

Wait 30–60 minutes after a fresh install — indexing high CPU is normal then. For persistent high CPU: switch to Classic mode, exclude large folders, or rebuild the corrupt index. To eliminate background indexing entirely: disable WSearch and use Everything for file search.
