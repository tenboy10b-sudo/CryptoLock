---
title: "Windows Screenshot Shortcut and Snipping Tool: Complete Guide for Windows 10 and 11"
date: "2026-03-17"
publishDate: "2026-03-17"
updated: "2026-06-18"
description: "All Windows screenshot shortcuts and how to use Snipping Tool on Windows 10 and 11. Screen clipping shortcuts, annotate screenshots, capture windows and scrolling pages."
tags: ["windows", "tools", "productivity", "settings"]
readTime: 5
---

Windows has several built-in screenshot methods — each suited to different situations. Here's every option and when to use it.

---

## Keyboard Shortcuts

| Shortcut | What it captures | Where it goes |
|----------|-----------------|---------------|
| `PrtScn` | Full screen | Clipboard |
| `Win + PrtScn` | Full screen | Saved to `Pictures\Screenshots` |
| `Alt + PrtScn` | Active window only | Clipboard |
| `Win + Shift + S` | You select area | Clipboard + notification |
| `Win + G` | Game bar capture | Videos\Captures folder |

`Win + Shift + S` opens the Snipping Tool selector — the most versatile option.

---

## Snipping Tool (Windows 11)

`Win + Shift + S` or search **Snipping Tool** in Start.

**Capture modes:**
- **Rectangle** — drag to select any area
- **Window** — click a specific window
- **Full screen** — entire screen
- **Freeform** — draw any shape

After capture, a notification appears in the bottom right. Click it to open the editor.

---

## Snipping Tool Editor

After capture, the editor opens automatically (or click the notification):

- **Pen, highlighter, eraser** — annotate directly on the screenshot
- **Crop** — trim the image
- **Ruler and protractor** — draw straight lines at angles
- **Text recognition (OCR)** — `Ctrl + Shift + T` extracts text from the screenshot

Save: `Ctrl + S` — saves as PNG, JPG, or GIF. Copy: `Ctrl + C` — copies to clipboard for pasting anywhere.

---

## Delay Screenshot

For capturing tooltips, menus, or states that disappear when you press a key:

Open **Snipping Tool** app → click the clock icon → set 3 or 10 second delay → click **New** → switch to the window you want to capture → wait for the timer.

---

## Capture Scrolling Content

Windows doesn't have a built-in scrolling screenshot. Options:

**Browser scrolling screenshots:**
- **Edge**: right-click page → **Screenshot** → **Capture full page**
- **Firefox**: right-click → **Take screenshot** → **Save full page**
- **Chrome**: install **GoFullPage** extension

**Third-party tools**: ShareX (free, open source) supports scrolling capture for any window.

---

## ShareX: Most Powerful Free Option

ShareX is the gold standard for power users:
- Scrolling screenshots
- Screen recording
- Auto-upload to Imgur, Google Drive, etc.
- Built-in OCR, image editor, color picker

Download from [getsharex.com](https://getsharex.com) — completely free and open source.

---

## Screenshot Location

`Win + PrtScn` saves automatically to:
```
C:\Users\YourName\Pictures\Screenshots\
```

Change the default folder:
Right-click `Screenshots` folder → **Properties** → **Location** → **Move** → choose new path.

---

## Screenshots via PowerShell

```powershell
Add-Type -AssemblyName System.Windows.Forms
$screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bitmap = New-Object System.Drawing.Bitmap($screen.Width, $screen.Height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($screen.Location, [System.Drawing.Point]::Empty, $screen.Size)
$bitmap.Save("C:\screenshot.png")
$graphics.Dispose()
$bitmap.Dispose()
Write-Host "Saved to C:\screenshot.png"
```

---

## Summary

For quick capture: `Win + Shift + S` → select area → paste anywhere. For annotated screenshots: open Snipping Tool → capture → use the built-in editor. For scrolling pages: use browser's built-in tool or ShareX. For automated or scripted screenshots: use the PowerShell method above.
