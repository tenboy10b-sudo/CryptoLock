---
title: "WinDirStat on Windows: Find What's Taking Up Disk Space"
date: "2026-06-15"
publishDate: "2026-09-14"
updated: "2026-06-15"
description: "How to install WinDirStat and find large files and folders taking up disk space on Windows. Disk usage visualization, delete what's unnecessary and free alternatives."
tags: ["windows", "windirstat", "disk", "optimization", "tools"]
readTime: 5
translatesUk: "windirstat-windows-analiz-dysku"
---

WinDirStat shows what's taking up space on your drive as a visual treemap. In one minute you'll find files taking 10+ GB that you forgot about.

---

## Install

```powershell
winget install WinDirStat.WinDirStat
```
**Faster alternative — WizTree:**
```powershell
winget install AntibodySoftware.WizTree
```

---

## How to Use

1. Run WinDirStat as administrator
2. Select drive or folder
3. Wait for scan (1–5 minutes)
4. Click large rectangles to identify files

**Three panels:**
- Top left — folder tree with sizes
- Top right — file extensions with percentages
- Bottom — treemap (each rectangle = file, area = size)

---

## Common Space Wasters

| Folder | Contents | Safe to delete? |
|--------|---------|----------------|
| `C:\Windows\SoftwareDistribution` | Windows Update cache | ✅ Stop wuauserv first |
| `C:\Windows\Temp` | Temp files | ✅ |
| `%TEMP%` | User temp files | ✅ |
| `Downloads` | Downloaded files | ⚠️ Check first |
| `hiberfil.sys` | Hibernation file | ✅ `powercfg /h off` |
| `pagefile.sys` | Page file | ❌ Don't delete |

---

## PowerShell — Find Large Files Without Software

```powershell
# Top 20 largest files on C:
Get-ChildItem C:\ -Recurse -ErrorAction SilentlyContinue |
    Sort-Object Length -Descending |
    Select-Object FullName, @{N='SizeMB';E={[math]::Round($_.Length/1MB,1)}} |
    Select-Object -First 20
```

---

## Free Up Space

```powershell
Remove-Item "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "C:\Windows\Temp\*" -Recurse -Force -ErrorAction SilentlyContinue

# Disable hibernation (frees hiberfil.sys ~4-16 GB)
powercfg /h off
```

---

## Summary

```
1. Run WinDirStat as administrator
2. Select drive → scan
3. Click large rectangles → find files
4. Right-click → Explorer Here or Delete
5. Check: Windows\Temp, SoftwareDistribution, Downloads
```
