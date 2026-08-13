---
title: "ShareX on Windows: The Most Powerful Free Screenshot and Screen Recorder"
date: "2026-09-21"
publishDate: "2026-09-21"
updated: "2026-09-21"
description: "How to install and use ShareX on Windows. Screenshots with annotations, screen recording, OCR, cloud upload, automation workflows. Compare with Lightshot and OBS."
tags: ["windows", "sharex", "screenshot", "screen-recording", "tools"]
readTime: 7
translatesUk: "sharex-windows-skrynshoty-zapys-ekranu"
---

ShareX is the most feature-rich free screenshot and screen recording tool for Windows. Open source, no ads, supports 80+ cloud services for uploads.

---

## Install

```powershell
winget install ShareX.ShareX
```
Or from [getsharex.com](https://getsharex.com) — portable version available.

---

## Screenshot Types

| Type | Default key | Description |
|------|------------|-------------|
| Fullscreen | `Print Screen` | Entire screen |
| Active window | `Alt+Print Screen` | Current window |
| Region | `Ctrl+Print Screen` | Select with mouse |
| Scrolling | — | Long scrollable page |

---

## Image Editor

After screenshot, built-in editor opens:
- Rectangle, Arrow, Text, Blur, Highlight, Pixelate
- **Step numbers** — numbered steps for tutorials

---

## Screen Recording

```
Capture → Screen recording
```
FFmpeg installs automatically on first use.
- Format: MP4 or GIF
- FPS: 30 or 60

### Record GIF
```
Capture → Screen recording (GIF)
```

---

## OCR — Text Recognition

```
Capture → Capture text (OCR)
```
Select area with text → ShareX recognizes and copies to clipboard.

---

## Auto Upload

```
Destinations → Image uploader
```
Popular: **Imgur** (no account), **Google Drive**, **Dropbox**, FTP.

After upload, link copies to clipboard automatically.

---

## ShareX vs Alternatives

| | ShareX | Lightshot | Snipping Tool | OBS |
|-|--------|----------|--------------|-----|
| Free | ✅ | ✅ | ✅ | ✅ |
| Video recording | ✅ | ❌ | ✅ (Win 11) | ✅ |
| OCR | ✅ | ❌ | ❌ | ❌ |
| Cloud upload | ✅ (80+) | ✅ | ❌ | ❌ |
| Complexity | High | Low | Low | High |

---

## Summary

| Need | ShareX solution |
|------|----------------|
| Quick screenshot | Ctrl+Print Screen → region |
| Record video | Capture → Screen recording |
| Record GIF | Capture → Screen recording (GIF) |
| OCR text | Capture → Capture text |
| Auto upload | Destinations → configure service |
