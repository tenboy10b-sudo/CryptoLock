---
title: "MSI Afterburner on Windows: GPU Monitoring, Overclocking and Fan Control"
date: "2026-06-18"
publishDate: "2026-09-19"
updated: "2026-06-18"
description: "How to install MSI Afterburner and set up GPU monitoring on Windows. In-game temperature overlay, GPU overclocking, custom fan curve and video recording setup."
tags: ["windows", "msi-afterburner", "gpu", "gaming", "monitoring", "tools"]
readTime: 7
translatesUk: "msi-afterburner-windows-monitorynh-gpu"
---

MSI Afterburner is the standard tool for GPU monitoring and tuning. Shows temperature, load and clock speeds in-game, lets you overclock your graphics card and customize fan profiles.

---

## Install

Download from [msi.com/Landing/afterburner](https://www.msi.com/Landing/afterburner/graphics-cards) — install with **RivaTuner Statistics Server (RTSS)** for in-game overlay.

---

## In-Game OSD Overlay

Show metrics over any game:

1. MSI Afterburner → **Settings** → **Monitoring** tab
2. For each sensor (GPU Temp, FPS, VRAM...) check **"Show in On-Screen Display"**
3. Launch game — metrics appear in corner

**Recommended sensors to add:**
- Framerate (FPS)
- GPU Temperature
- GPU Usage %
- VRAM Usage

---

## GPU Overclocking

> ⚠️ Overclocking can damage your GPU. Go gradually, monitor temperatures. Don't exceed 85°C.

1. Raise **Power Limit** to maximum (+20%)
2. Increase **Core Clock** by +50 MHz
3. Increase **Memory Clock** by +100 MHz
4. Click **Apply** (checkmark)
5. Test stability — run a game or FurMark
6. If stable, increase further

**Save profile:** Click **Save** → select slot 1–5

---

## Custom Fan Curve

Settings → **Fan** → enable **"User defined software automatic fan control"**

Click graph to add points:
```
50°C → 30%
65°C → 50%
75°C → 70%
85°C → 100%
```

---

## Video Recording

```
Settings → Video Capture:
Format: MP4, Quality: High
Hotkey: F9 (start/stop)
```

---

## MSI Afterburner vs HWiNFO

| | Afterburner | HWiNFO |
|-|-------------|--------|
| In-game OSD | ✅ | ✅ (via RTSS) |
| Overclocking | ✅ | ❌ |
| Fan profile | ✅ | ❌ |
| Video recording | ✅ | ❌ |

---

## Summary

| Task | Location |
|------|---------|
| In-game OSD | Settings → Monitoring → Show in OSD |
| Overclock core | Core Clock slider + Apply |
| Fan profile | Settings → Fan → Custom curve |
| Record video | Settings → Video Capture → F9 |
| Save profile | Save → slot 1–5 |
