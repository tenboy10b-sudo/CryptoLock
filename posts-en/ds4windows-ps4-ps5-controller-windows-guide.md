---
title: "DS4Windows: How to Use PS4 and PS5 Controller on Windows 10 and 11"
date: "2026-09-07"
publishDate: "2026-09-07"
updated: "2026-09-07"
description: "How to set up DS4Windows for DualShock 4 and DualSense on Windows. Connect via USB and Bluetooth, configure buttons, fix detection issues, Steam conflict resolution."
tags: ["windows", "gamepad", "gaming", "ds4windows", "bluetooth"]
readTime: 6
translatesUk: "ds4windows-ps4-ps5-kontroiler-windows"
---

DS4Windows is a free app that lets you use PS4 and PS5 controllers on Windows as an Xbox controller. Most PC games only support Xbox — DS4Windows bridges that gap.

---

## Requirements

- DualShock 4 (PS4) or DualSense (PS5) controller
- USB cable or Bluetooth adapter
- Windows 10/11 64-bit

---

## Step 1 — Install DS4Windows

1. Download from [GitHub: Ryochan7/DS4Windows](https://github.com/Ryochan7/DS4Windows/releases)
2. Extract to any folder (portable app)
3. Run `DS4Windows.exe`
4. Install **ViGEmBus** driver when prompted → **"Install"**

> **Warning:** download only from official GitHub. Fake sites distribute malware.

---

## Step 2 — Connect Controller

### Via USB
Plug in controller → DS4Windows auto-detects it → green indicator = working.

### Via Bluetooth

**PS4 DualShock 4:** Hold `PS + Share` (~3 sec) → find **"Wireless Controller"** in Bluetooth settings

**PS5 DualSense:** Hold `PS + Create` (~3 sec) → find **"DualSense Wireless Controller"**

---

## Step 3 — Profile Setup

```
DS4Windows → Profiles → Edit (Default)
```

- **"Emulate Xbox 360 Controller"** — for most PC games
- **"Use DS4 directly"** — for games with native PS support

### Touchpad as Mouse
```
Edit Profile → Other → Use touchpad as mouse → enable
```

---

## Steam Configuration

Steam has built-in PS controller support:
```
Steam → Settings → Controller → General Controller Settings → PlayStation Configuration Support
```

**Conflict with DS4Windows:** both active = double input. Solution: disable PS support in Steam OR close DS4Windows when playing Steam games.

---

## Troubleshooting

### Controller not detected
Reinstall ViGEmBus: DS4Windows → Settings → Controller → Install ViGEmBus

### Double input in games
```
Steam → Settings → Controller → Desktop Configuration → disable PS support
```

### Bluetooth keeps disconnecting
- Check battery level (below 10% = unstable)
- Update Bluetooth adapter driver

---

## Summary

| Step | Action |
|------|--------|
| 1 | Download DS4Windows from GitHub |
| 2 | Install ViGEmBus on first launch |
| 3 | Connect via USB or Bluetooth |
| 4 | Select "Emulate Xbox 360" profile |
| 5 | Steam: disable double PS support |
