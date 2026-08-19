---
title: "OBS Studio on Windows: Installation, Setup for Recording and Streaming"
date: "2026-11-27"
publishDate: "2026-11-27"
updated: "2026-09-17"
description: "How to install and configure OBS Studio on Windows for screen recording or streaming to Twitch and YouTube. Scenes, sources, output settings, fix low FPS issues."
tags: ["windows", "obs", "screen-recording", "streaming", "tools"]
readTime: 8
translatesUk: "obs-studio-windows-nalashtuvannya"
---

OBS Studio is the industry standard for screen recording and streaming. Free, open source, used by millions of content creators.

---

## Install

```powershell
winget install OBSProject.OBSStudio
```
Or from [obsproject.com](https://obsproject.com). Run auto-configuration wizard on first launch.

---

## Core Concepts

**Scene** — a set of sources for one view (Gaming, Webcam, BRB screen).

**Source** — what appears in the scene:
- Display Capture — full screen
- Window Capture — specific window
- Video Capture Device — webcam
- Audio Input Capture — microphone

---

## Add Sources

### Display Capture
Sources → **"+"** → **"Display Capture"** → select monitor

### Webcam
Sources → **"+"** → **"Video Capture Device"** → select camera

### Microphone
Added automatically in Audio Mixer. If not: **"+"** → **"Audio Input Capture"**

---

## Output Settings

```
File → Settings → Output
```

### For Recording

| Setting | Recommendation |
|---------|---------------|
| Recording path | D:\Recordings (not system drive) |
| Format | MKV (safer) or MP4 |
| Encoder | NVENC (NVIDIA) / AMF (AMD) / x264 (CPU) |
| Bitrate | 15000–25000 kbps for 1080p |
| CRF/CQP | 18–23 (lower = better quality) |

### For Twitch Streaming

```
Settings → Stream → Service: Twitch
Stream key: copy from dashboard.twitch.tv
```

| Setting | Twitch 1080p60 |
|---------|---------------|
| Video bitrate | 6000 kbps |
| Encoder | NVENC or x264 |

### For YouTube

| Setting | YouTube 1080p |
|---------|--------------|
| Video bitrate | 8000–12000 kbps |
| Audio bitrate | 160 kbps |

---

## Video Settings

```
File → Settings → Video
```

| Setting | Value |
|---------|-------|
| Base resolution | 1920x1080 |
| Output resolution | 1920x1080 (recording) / 1280x720 (streaming) |
| FPS | 60 for games, 30 for webinars |

---

## Microphone Filters

Right-click mic in Audio Mixer → **"Filters"** → **"+"**:

- **RNNoise** — AI noise suppression (recommended)
- **Compressor** — Threshold: -18dB, Ratio: 4:1

---

## Hotkeys

```
File → Settings → Hotkeys
```
Recommended: F9 = Start/Stop Recording, F10 = Start/Stop Stream, F1 = Mute Mic

---

## Troubleshooting

### Low FPS during recording
Switch encoder from x264 to NVENC in Output settings.

### Black screen when capturing game
File → Settings → General → disable "Hardware acceleration"

### Audio out of sync
Right-click audio source → Properties → set "Sync Offset" in milliseconds.

---

## Summary

| Task | Setting |
|------|---------|
| Record screen | Source → Display Capture |
| Add webcam | Source → Video Capture Device |
| Recording quality | Output → CRF 18–23, NVENC |
| Stream to Twitch | Stream → Twitch → stream key |
| Noise reduction | Mic filters → RNNoise |
