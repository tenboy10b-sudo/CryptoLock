---
title: "Notepad++ on Windows: Installation, Setup and Useful Features"
date: "2026-11-24"
publishDate: "2026-11-24"
updated: "2026-09-16"
description: "How to install Notepad++ and configure it for code and text editing. Themes, plugins, syntax highlighting, macros, file comparison and regex find and replace."
tags: ["windows", "notepad++", "editor", "tools", "programming"]
readTime: 6
translatesUk: "notepad-plus-plus-windows-vstanovlennya"
---

Notepad++ is a lightweight free code and text editor for Windows. Replaces the built-in Notepad and works great for editing configs, scripts, logs and code.

---

## Install

```powershell
winget install Notepad++.Notepad++
```
Or from [notepad-plus-plus.org](https://notepad-plus-plus.org/downloads/)

---

## Setup After Install

### Dark theme
```
Settings → Style Configurator → Select theme: Dracula / Monokai
```

### Font
```
Settings → Style Configurator → Global Styles → Default Style → Font: JetBrains Mono / Consolas
```

### UTF-8 default encoding
```
Settings → Preferences → New Document → Encoding → UTF-8
```

---

## Find and Replace

`Ctrl+H` — open Find & Replace dialog

**Useful regex patterns:**
```
# Remove blank lines
^\s*\n → (replace with nothing)

# Remove trailing spaces
\s+$ → (replace with nothing)

# Find IP addresses
\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}
```

### Search in multiple files
```
Search → Find in Files (Ctrl+Shift+F)
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+D` | Duplicate line |
| `Ctrl+L` | Delete line |
| `Ctrl+Shift+↑/↓` | Move line up/down |
| `Alt+Shift+arrows` | Column (vertical) selection |
| `Ctrl+Q` | Comment/uncomment line |
| `Ctrl+G` | Go to line |

---

## Plugins

```
Plugins → Plugins Admin → search → Install
```

**Top plugins:**
- **Compare** — side-by-side file comparison (`Alt+D`)
- **NppFTP** — edit files directly on FTP/SFTP server
- **JSON Viewer** — format and browse JSON
- **XML Tools** — format XML

---

## Macros

1. `Macro → Start Recording`
2. Perform actions
3. `Macro → Stop Recording`
4. `Macro → Playback` or **Run Multiple Times**

---

## Set as Git Editor

```powershell
git config --global core.editor "'C:/Program Files/Notepad++/notepad++.exe' -multiInst -notabbar -nosession -noPlugin"
```

---

## Summary

| Task | Solution |
|------|---------|
| Dark theme | Settings → Style Configurator → Dracula |
| Regex replace | Ctrl+H → Regular expression mode |
| Compare files | Plugins → Compare |
| Record macro | Macro → Start/Stop Recording |
| Search in files | Ctrl+Shift+F |
