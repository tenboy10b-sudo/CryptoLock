---
title: "HandBrake on Windows: Convert Video to MP4, MKV and Compress Without Quality Loss"
date: "2026-06-15"
publishDate: "2027-06-01"
updated: "2026-06-15"
description: "How to install HandBrake and convert video on Windows. Best settings for MP4 and MKV, compress large files, batch conversion, subtitles and audio tracks."
tags: ["windows", "handbrake", "video", "conversion", "tools"]
readTime: 7
translatesUk: "handbrake-windows-konvertatsiya-video"
---

HandBrake is the best free video converter for Windows. Open source, supports all popular formats, full control over quality and file size.

---

## Install

```powershell
winget install HandBrake.HandBrake
```
Or from [handbrake.fr](https://handbrake.fr/downloads.php)

---

## Basic Conversion

1. **"Open Source"** → select video file
2. Choose preset from right panel (e.g. **"Fast 1080p30"**)
3. Set output path in **"Save As"**
4. Click **"Start Encode"**

---

## Best Presets

| Preset | Use when |
|--------|---------|
| **Fast 1080p30** | Quick conversion, good quality |
| **HQ 1080p30 Surround** | High quality, larger file |
| **Discord Small** | For Discord (<8 MB) |
| **Fast 720p30** | For mobile devices |

---

## Quality and Size Settings

**RF/CRF value** (Video → Quality):

| RF | Result |
|----|--------|
| 18–20 | Near lossless, large file |
| 20–23 | High quality (recommended) |
| 23–26 | Noticeable compression |

### Video Codec

| Codec | Use |
|-------|-----|
| **H.264** | Best compatibility |
| **H.265** | Half the file size at same quality |
| **AV1** | Smallest size, very slow |

---

## Compress for Specific Uses

### Reduce file size by half
- Codec: **H.265 (x265)**, RF: **22–24**, Preset: **Fast**

### YouTube upload
- Codec: **H.264**, RF: **18**, Audio: **AAC 192 kbps**

### Discord (<8 MB)
- Preset: **"Discord Small"** or Average Bitrate: **800 kbps**

---

## Batch Conversion

1. **"Open Source"** → select folder
2. Choose preset
3. **"Add All"** → **"Start Queue"**

---

## HandBrake CLI

```powershell
# Basic conversion
HandBrakeCLI.exe -i input.mp4 -o output.mp4 --preset "Fast 1080p30"

# With quality setting
HandBrakeCLI.exe -i input.mp4 -o output.mp4 -e x265 -q 22
```

---

## Summary

| Goal | Settings |
|------|---------|
| Reduce size | H.265, RF 24 |
| Maximum quality | H.264, RF 18 |
| YouTube | H.264, RF 18, AAC 192 |
| Discord | "Discord Small" preset |
| Batch convert | Open Source → folder → Add All |
