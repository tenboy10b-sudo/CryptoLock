---
title: "VLC Media Player on Windows: Installation, Setup and Hidden Features"
date: "2027-01-05"
publishDate: "2027-01-05"
updated: "2026-09-28"
description: "How to install and configure VLC on Windows 10 and 11. Keyboard shortcuts, subtitle sync, video conversion, streaming from URL, playback speed and hidden VLC features."
tags: ["windows", "vlc", "video", "media", "tools"]
readTime: 6
translatesUk: "vlc-media-player-windows-nalashtuvannya"
---

VLC is the world's most popular media player. Opens any video format without extra codecs, completely free and ad-free. But most people only use 10% of its features.

---

## Install

```powershell
winget install VideoLAN.VLC
```
Or download from [videolan.org/vlc](https://www.videolan.org/vlc/download-windows.html) → 64-bit

---

## Supported Formats

VLC opens practically everything without extra codecs: MP4, MKV, AVI, MOV, WMV, FLV, MP3, FLAC, DVD, Blu-ray, HLS streams.

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/pause |
| `F` | Fullscreen |
| `←` / `→` | Seek -10/+10 sec |
| `[` / `]` | Decrease/increase speed |
| `=` | Normal speed |
| `J` / `K` | Subtitle delay -/+ 50ms |
| `Ctrl+N` | Open network stream |
| `Ctrl+Alt+S` | Take screenshot |

---

## Playback Speed

`[` and `]` for step changes, or: Playback → Speed → 1.25x / 1.5x / 2x

---

## Subtitles

### Auto-download subtitles
```
View → VLsub
```
Searches OpenSubtitles.org by filename.

### Fix subtitle encoding (Cyrillic)
```
Tools → Preferences → Subtitles/OSD → Default encoding → UTF-8
```

### Sync subtitles
- `J` — delay subtitles (if ahead of video)
- `K` — speed up subtitles (if behind)

---

## Convert Video

```
Media → Convert/Save (Ctrl+R)
```
1. Add file → **"Convert/Save"**
2. Select profile (MP4, MP3, WebM)
3. Set output file → **"Start"**

---

## Open Video from URL

```
Ctrl+N → paste video URL
```
Supports YouTube, Twitch, Dailymotion, direct HTTP video links.

---

## Hidden Features

### Record video
View → Advanced Controls → record button appears

### Effects and filters
```
Tools → Effects and Filters (Ctrl+E)
```
Equalizer, color correction, spatial audio, video stabilization.

### Stream to other devices
```
Media → Stream (Ctrl+S)
```

---

## Summary

| Need | Solution |
|------|---------|
| Open any format | Drag file into VLC |
| Change speed | `[` and `]` keys |
| Auto subtitles | View → VLsub |
| Convert video | Media → Convert/Save |
| Stream from URL | Ctrl+N → paste link |
