---
title: "No Sound in Windows 10 and 11: How to Fix It"
date: "2026-03-02"
publishDate: "2026-03-02"
description: "Windows audio not working? Step-by-step fixes for no sound, audio device missing, or sound cutting out — from checking mute buttons to reinstalling audio drivers."
tags: ["windows", "troubleshooting", "audio", "drivers"]
readTime: 5
---

No sound in Windows is almost always caused by one of four things: wrong output device selected, muted audio, driver issue, or a stopped audio service. Here's how to diagnose and fix each.

---

## Step 1: Check the Obvious

- **Volume not muted**: click the speaker icon in the taskbar — make sure volume is up and not muted
- **Headphones/speakers plugged in**: try a different port
- **Physical volume controls**: some speakers and headsets have hardware volume wheels

Right-click the speaker icon → **Open Volume Mixer** — check that the specific app isn't muted.

---

## Step 2: Check Output Device

Right-click speaker icon → **Sound settings** → **Output** — make sure the correct device is selected (speakers, headphones, monitor speakers, etc.)

Sometimes Windows switches to a wrong output device after an update or when plugging in a new device.

```powershell
# List all audio output devices
Get-WmiObject Win32_SoundDevice | Select-Object Name, Status
```

---

## Step 3: Run Audio Troubleshooter

`Win + I` → **System** → **Troubleshoot** → **Other troubleshooters** → **Playing Audio** → **Run**

This fixes the most common issues automatically — wrong default device, stopped services, driver problems.

---

## Step 4: Restart Windows Audio Service

```powershell
Restart-Service -Name "AudioSrv" -Force
Restart-Service -Name "AudioEndpointBuilder" -Force
```

Or: `Win + R` → `services.msc` → find **Windows Audio** → right-click → **Restart**

If the service is **Disabled**, change Startup type to **Automatic** first.

---

## Step 5: Update or Reinstall Audio Driver

**Update:**
`Win + X` → **Device Manager** → **Sound, video and game controllers** → right-click your audio device → **Update driver** → **Search automatically**

**Reinstall (more effective):**
Right-click → **Uninstall device** → check **Delete the driver software for this device** → **Uninstall** → restart

Windows reinstalls the basic driver automatically. If sound works after this, the driver was corrupted.

**Install manufacturer driver:**
For better quality and features, download the audio driver directly from your motherboard or laptop manufacturer's website — not Windows Update.

---

## Step 6: Check Default Format

Sometimes Windows picks an audio format the device doesn't support.

Right-click speaker icon → **Sound settings** → scroll to **More sound settings** → **Playback** tab → right-click your device → **Properties** → **Advanced** tab → change **Default Format** to **16 bit, 44100 Hz (CD Quality)** → **Test**

---

## Step 7: Disable Audio Enhancements

Audio enhancements can cause no-sound issues on some hardware.

Right-click speaker → **Sound settings** → **More sound settings** → **Playback** → right-click device → **Properties** → **Enhancements** tab → check **Disable all enhancements**

Or on Windows 11: **Advanced** tab → **Audio enhancements** → set to **Off**

---

## Step 8: Check HDMI/DisplayPort Audio

If using a monitor with speakers via HDMI:

Right-click speaker → **Sound settings** → **More sound settings** → **Playback** tab → look for your monitor listed as an audio device → set as **Default Device**

If it's not listed: right-click in the empty space → **Show Disabled Devices** and **Show Disconnected Devices**

---

## No Sound After Windows Update

Updates sometimes reset audio settings or install incompatible drivers.

```powershell
# Check recently installed drivers
Get-WinEvent -LogName System | Where-Object {$_.Id -eq 7045} |
  Select-Object -First 5 TimeCreated, Message
```

Roll back the audio driver: **Device Manager** → audio device → **Properties** → **Driver** → **Roll Back Driver**

---


---

## 🔍 Not sure what a Windows error code means?

If Windows shows a code like `0x80070005`, `0x80070002` or `0xC000021A` — use this free tool:

**[→ Windows Error Decoder](/tools/windows-error-decoder)** — enter the code and instantly find out what it means and how to fix it.


## Summary

Check output device selection first — Windows often switches to wrong device after updates. Then restart Audio service. If still no sound: reinstall the driver. Download from manufacturer for best results. Disable audio enhancements if driver reinstall doesn't help.
