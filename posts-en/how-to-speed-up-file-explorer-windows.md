---
title: "How to Speed Up File Explorer in Windows 10 and 11"
date: "2026-06-16"
publishDate: "2026-06-16"
description: "File Explorer slow to open or laggy? Fix sluggish Explorer with these tweaks: disable Quick Access, clear history, fix thumbnail cache, and adjust folder view settings."
tags: ["windows", "optimization", "performance", "tools"]
readTime: 5
---

File Explorer should open instantly. If it takes 3–10 seconds or hangs when browsing folders, these fixes will solve it.

---

## Fix 1: Open to This PC Instead of Quick Access

Quick Access scans recent files and network locations every time it opens — that's what causes the delay.

**File Explorer** → **...** (three dots) → **Options** → **General** tab → **Open File Explorer to**: change from **Quick Access** to **This PC**

This alone often cuts open time from 5 seconds to under 1 second.

---

## Fix 2: Clear File Explorer History

Accumulated history slows down Quick Access and search.

**File Explorer Options** → **General** tab → under **Privacy** → click **Clear** (clears recent files and folders history)

Also uncheck:
- **Show recently used files in Quick Access**
- **Show frequently used folders in Quick Access**

---

## Fix 3: Disable Thumbnail Previews for Folders with Many Images

Thumbnails for large image folders cause Explorer to hang while generating previews.

**File Explorer** → **View** → **Options** → **View** tab → check **Always show icons, never thumbnails**

Or for a specific folder: right-click → **Properties** → **Customize** → **Optimize this folder for**: **General items** instead of **Pictures**

---

## Fix 4: Rebuild Thumbnail Cache

Corrupted thumbnail cache causes slowness and blank thumbnails.

```cmd
taskkill /f /im explorer.exe
del /f /s /q %LocalAppData%\Microsoft\Windows\Explorer\thumbcache_*.db
start explorer.exe
```

Or use **Disk Cleanup** → check **Thumbnails** → OK.

---

## Fix 5: Disable Network Folder Discovery

Explorer checks network locations on every open — if they're slow or unreachable, Explorer hangs.

```powershell
# Disable automatic network discovery delay
$path = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Serialize"
New-Item -Path $path -Force | Out-Null
Set-ItemProperty -Path $path -Name "StartupDelayInMSec" -Value 0 -Type DWord
```

Also: **File Explorer** → **Network** in sidebar — if you see unreachable network locations, remove or disconnect them.

---

## Fix 6: Fix Slow Right-Click Context Menu

If right-clicking in Explorer takes 2–5 seconds, a shell extension is the culprit.

Download **ShellExView** (free, from nirsoft.net) → sort by **Company** → disable third-party shell extensions one at a time to find the slow one.

Or disable all third-party context menu entries at once:
```cmd
reg add "HKCU\Software\Classes\*\shellex\ContextMenuHandlers" /f
```

---

## Fix 7: Restart File Explorer

If Explorer suddenly gets slow, restart it:

```powershell
Stop-Process -Name explorer -Force
Start-Process explorer
```

Or: `Ctrl + Shift + Esc` → **Details** tab → find `explorer.exe` → **End task** → **File** → **Run new task** → `explorer.exe`

---

## Fix 8: Check for Folder Customization Issues

If a specific folder is slow to open:

Right-click the folder → **Properties** → **Customize** → **Optimize this folder for** → **General items** → **Apply to all subfolders**

Video and Pictures optimization modes trigger thumbnail generation and metadata scanning which can be slow for large folders.

---

## Fix 9: Disable Folder Size Calculation in Some Tools

Third-party tools like WinDirStat or TreeSize running in the background continuously scan folder sizes, making Explorer sluggish. Close them when not in use.

---

## Summary

The biggest wins: change **Open to This PC**, clear Quick Access history, and rebuild the thumbnail cache. For persistent slowness: use ShellExView to find a misbehaving context menu extension. For network-related hangs: disable network discovery delay via registry.
