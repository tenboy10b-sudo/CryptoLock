---
title: "No Sound in Windows 10 and 11: Step-by-Step Fix"
date: "2026-06-18"
publishDate: "2027-06-01"
updated: "2026-06-18"
description: "What to do when sound stops working in Windows 10 and 11. Check playback devices, restart audio services, update sound drivers and fix HDMI audio issues."
tags: ["windows", "sound", "audio", "fix", "drivers"]
readTime: 7
translatesUk: "nemaie-zvuku-windows-vyrishennya"
---

Sound stopped working after a Windows update or just disappeared? Here's a step-by-step fix.

---

## Step 1 — Check Basic Things

- Is volume muted or at 0?
- Is the correct playback device selected?

```
Right-click speaker icon → Open Sound Settings →
check the correct output device is selected
```

---

## Step 2 — Check Playback Devices

```
Right-click speaker → Sounds → Playback tab
```

- Right-click in empty area → "Show Disabled Devices"
- Set correct device as **Default Device**

---

## Step 3 — Restart Audio Services

```powershell
Restart-Service AudioSrv -Force
Restart-Service AudioEndpointBuilder -Force

# If disabled:
Set-Service AudioSrv -StartupType Automatic
Start-Service AudioSrv
```

---

## Step 4 — Update Sound Driver

```
Device Manager → Sound, video and game controllers →
right-click → Update driver
```

For Realtek (most common): download from [realtek.com](https://www.realtek.com)

---

## Step 5 — Reinstall Driver

1. Device Manager → sound device → right-click → Uninstall device
2. Check "Delete the driver software"
3. Action → Scan for hardware changes

---

## Common Situations

### No sound after Windows update
```
Device Manager → sound device → Properties → Driver → Roll Back Driver
```

### No HDMI sound
```
Sound Settings → Playback → find "HDMI Output" or monitor name →
set as Default Device
```

### Sound in some apps but not others
```
Right-click speaker → Open Volume Mixer →
check app isn't muted
```

---

## Troubleshooter

```powershell
msdt.exe /id AudioPlaybackDiagnostic
```

---

## Summary

| Problem | Fix |
|---------|-----|
| Volume 0 | Raise in tray or mixer |
| Wrong device | Set correct default in Sound Settings |
| Service not running | Restart-Service AudioSrv |
| After update | Roll back or reinstall driver |
| No HDMI sound | Select HDMI device in playback |
