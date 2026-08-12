---
title: "GIMP on Windows: Installation, Basics and How It Compares to Photoshop"
date: "2026-06-10"
publishDate: "2026-09-09"
updated: "2026-06-10"
description: "How to install GIMP on Windows 10 and 11 and start editing photos. Key tools, layers, color correction. How GIMP differs from Photoshop and where to get plugins."
tags: ["windows", "gimp", "photo", "graphics", "tools"]
readTime: 7
translatesUk: "gimp-windows-vstanovlennya-osnovy"
---

GIMP is a free, open-source image editor — a real alternative to Photoshop for those who don't want to pay $600/year.

---

## GIMP vs Photoshop

| | GIMP | Photoshop |
|-|------|----------|
| Price | Free | $600/year |
| Open source | ✅ | ❌ |
| Layers | ✅ | ✅ |
| RAW files | ✅ (plugin) | ✅ |
| Plugins | ✅ | ✅ |

---

## Install

```powershell
winget install GIMP.GIMP
```
Or download from [gimp.org/downloads](https://www.gimp.org/downloads/)

**Single-window mode (like Photoshop):**
```
Windows → Single-Window Mode
```

---

## Key Tools

| Tool | Key | Purpose |
|------|-----|---------|
| Move | M | Move layers |
| Crop | Shift+C | Crop image |
| Rect Select | R | Rectangle selection |
| Fuzzy Select | U | Select by color |
| Paintbrush | P | Paint |
| Clone | C | Retouching |
| Text | T | Add text |

---

## Basic Operations

```
File → Open (Ctrl+O)          — open file
File → Export As (Ctrl+Shift+E) — save as JPG/PNG
File → Save (Ctrl+S)          — save as .xcf (GIMP format)
```

### Resize image
```
Image → Scale Image → enter new dimensions → Scale
```

### Adjust brightness
```
Colors → Brightness-Contrast
Colors → Curves  (more precise)
```

---

## Remove Background

1. Add alpha channel: `Layer → Transparency → Add Alpha Channel`
2. Select Fuzzy Select (U) → click background
3. Press Delete

---

## Useful Plugins

**G'MIC** — 500+ photo effects: [gmic.eu](https://gmic.eu/download.html)

Copy to: `C:\Users\[user]\AppData\Roaming\GIMP\2.10\plug-ins`

---

## Summary

| Task | Location in GIMP |
|------|-----------------|
| Open file | File → Open |
| Save JPG/PNG | File → Export As |
| Resize | Image → Scale Image |
| Brightness | Colors → Brightness-Contrast |
| Remove background | Layer → Add Alpha → Fuzzy Select → Delete |
