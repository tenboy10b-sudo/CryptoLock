---
title: "Everything Search on Windows: Find Any File Instantly"
date: "2026-06-18"
publishDate: "2026-09-08"
updated: "2026-06-18"
description: "How to install Everything by voidtools for instant file search on Windows 10 and 11. Search by name, size, date, regex, HTTP server and integration with other tools."
tags: ["windows", "everything", "search", "files", "tools"]
readTime: 6
translatesUk: "everything-myittievyy-poshuk-failiv-windows"
---

Everything by voidtools finds any file instantly — literally 0.1 seconds to locate any file on your drive. Windows Search is a turtle in comparison.

---

## Why Everything Is So Fast

Windows Search indexes file contents — slow. Everything only indexes **file names and paths** from the NTFS MFT (Master File Table). MFT is read directly without scanning each file — initial indexing takes 2–5 seconds.

**Limitation:** only works with NTFS drives. FAT32 and exFAT not supported.

---

## Install

```powershell
winget install voidtools.Everything
```
Or from [voidtools.com](https://www.voidtools.com/downloads/) — portable version available.

Grant administrator access on first launch (needed to read MFT).

---

## Basic Search

Open Everything (`Win + Alt + F`) and start typing.

```
photo           → all files with "photo"
*.pdf           → all PDFs on all drives
budget 2026     → files containing both words
"project plan"  → exact phrase
```

---

## Search Syntax

### Operators
| Operator | Example | Result |
|---------|---------|--------|
| space | `work report` | both words |
| `\|` | `*.jpg \| *.png` | jpg or png |
| `!` | `*.txt !temp` | .txt without temp |
| `"..."` | `"annual report"` | exact phrase |

### Filters
```
size:>100mb          → files over 100 MB
dm:today             → modified today
dm:thisweek          → modified this week
ext:mp4,mkv,avi      → video files
path:C:\Users        → only in Users folder
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Win + Alt + F` | Open Everything |
| `Enter` | Open file |
| `Ctrl + Enter` | Open containing folder |
| `Ctrl + C` | Copy path |

---

## HTTP Server — Search from Another Device

```
Tools → Options → HTTP Server → Enable HTTP server → Port: 8080
```

Open `http://PC_IP:8080` from any browser on your network.

---

## Everything CLI

```powershell
es.exe *.log
es.exe -size +104857600 -sort size-descending
es.exe *.pdf > pdf_list.txt
```

---

## Everything vs Windows Search

| | Everything | Windows Search |
|-|-----------|---------------|
| Search speed | ⚡ Instant | Slow |
| Content search | ❌ | ✅ |
| Regex | ✅ | ❌ |
| FAT32/exFAT | ❌ | ✅ |

---

## Summary

| Task | Command/Action |
|------|---------------|
| Find file | Open → type name |
| Large files | `size:>500mb` |
| By file type | `ext:pdf,docx` |
| Modified today | `dm:today` |
| Search from phone | Tools → HTTP Server |
