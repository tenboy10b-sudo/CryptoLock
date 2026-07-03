---
title: "Microsoft PowerToys: 10 Tools That Improve Windows Daily"
date: "2026-04-19"
publishDate: "2026-04-19"
description: "PowerToys is a free Microsoft utility pack that adds powerful features to Windows. The 10 most useful tools: FancyZones, PowerRename, File Locksmith, Always on Top, and more."
tags: ["windows", "productivity", "tools", "settings"]
readTime: 6
translatesUk: "windows-powertoys-povnyy-posibnyk"
---

Microsoft PowerToys is a free open-source utility pack that adds features Windows should have built in. Here are the 10 most useful tools and how to use each.

---

## Install PowerToys

```powershell
winget install Microsoft.PowerToys
```

Or download from [github.com/microsoft/PowerToys](https://github.com/microsoft/PowerToys/releases).

Runs in the system tray. Open settings: right-click tray icon → **Settings**

---

## 1. FancyZones — Custom Window Layouts

Snap windows to custom zones instead of just halves.

**Setup:**
PowerToys Settings → FancyZones → **Launch layout editor**

Create a layout: drag zone dividers to define areas. Then hold **Shift** while dragging any window to snap it to a zone.

**Useful layouts:**
- 3-column with different widths for primary monitor
- Main + sidebar for reference materials
- Custom grid for 4K monitor

---

## 2. PowerRename — Batch Rename Files

Rename hundreds of files with regex, find/replace, or counter:

Right-click files in File Explorer → **PowerRename**

Example: rename `IMG_001.jpg` through `IMG_500.jpg` to `Vacation-001.jpg` through `Vacation-500.jpg` with preview before applying.

---

## 3. File Locksmith — See Who's Using a File

Find which process is holding a file open (so you can delete or rename it):

Right-click any file or folder → **Unlock with File Locksmith**

Shows the process name and PID. Option to end the process directly from the dialog.

---

## 4. Always on Top — Pin Window Above Others

Keep any window always visible above others:

Default shortcut: `Win + Ctrl + T` while the window is focused.

The window gets a highlighted border. Press again to unpin.

Useful for: documentation while coding, calculator while in a form, chat window while working.

---

## 5. Color Picker — Pick Any Color on Screen

`Win + Shift + C` → crosshair cursor → click any pixel → copies the color value.

Copies to clipboard in HEX, RGB, HSL, or other formats. Click the color in the picker to cycle through format options.

---

## 6. Text Extractor — OCR from Anywhere

Extract text from any part of the screen — screenshots, images in browsers, non-selectable text in PDFs:

`Win + Shift + T` → select region → text is copied to clipboard

Far faster than manual transcription. Works on any visible content.

---

## 7. Keyboard Manager — Remap Keys and Shortcuts

Remap any key or create custom shortcuts, per-application or globally:

PowerToys Settings → Keyboard Manager → **Remap a key**

Common remaps:
- Caps Lock → Ctrl (or disable entirely)
- Right Alt → Right Ctrl
- Custom shortcuts to launch apps

---

## 8. Mouse Without Borders — Control Multiple PCs

Use one keyboard and mouse across up to 4 PCs seamlessly. Move cursor past the edge of one screen to control the next PC.

**Setup:** install PowerToys on both PCs → Mouse Without Borders → pair with a security code.

---

## 9. Hosts File Editor — Manage /etc/hosts GUI

Edit the Windows hosts file without opening Notepad as administrator:

PowerToys Settings → Hosts File Editor → **Launch Hosts File Editor**

Add entries to block domains or point domains to custom IPs. Much safer than manually editing the file.

---

## 10. Run — Spotlight-Like App Launcher

`Alt + Space` → type to search and launch apps, files, web searches, calculator, unit conversion

More powerful than Windows Search for quick actions:
- `=2+2` for inline calculator
- `>cmd /c command` to run commands
- `//github.com` to open URLs

---

## Other Useful PowerToys

**Peek** — quick file preview (`Ctrl + Space`) without opening the file
**Paste as Plain Text** — `Win + Ctrl + Alt + V` strips formatting when pasting
**Mouse Highlighter** — highlights cursor position for presentations
**Screen Ruler** — measure pixel distances on screen

---

## PowerToys Settings Sync

PowerToys settings export/import via Settings → General → **Backup & Restore**. Useful for keeping the same configuration across multiple PCs.

---

## Summary

FancyZones for multi-monitor layouts, Text Extractor for OCR, File Locksmith for locked files, Color Picker for design work, PowerRename for bulk operations. All free, all from Microsoft, all in one install. `winget install Microsoft.PowerToys` — takes 2 minutes and pays for itself daily.
