---
title: "How to Fix Audio Crackling, Popping, or Stuttering in Windows"
date: "2026-03-23"
publishDate: "2026-03-23"
description: "Audio crackling, popping, or cutting out in Windows? Fix it by adjusting audio format, disabling enhancements, updating drivers, and checking USB/power settings."
tags: ["windows", "audio", "troubleshooting", "drivers"]
readTime: 5
---

Audio crackling and popping in Windows is almost always caused by one of four things: wrong audio format, driver issues, USB power management, or CPU power-saving throttling. Here's how to fix each.

---

## Fix 1: Change Audio Format and Sample Rate

The most common cause — Windows and the audio device are set to different sample rates.

Right-click speaker icon → **Sound settings** → **More sound settings** → **Playback** tab → right-click your device → **Properties** → **Advanced** tab

Try these settings:
- **24 bit, 44100 Hz (Studio Quality)**
- **24 bit, 48000 Hz**
- **16 bit, 44100 Hz (CD Quality)**

Click **Test** after each change. The crackling stops when you find the right format.

---

## Fix 2: Disable Audio Enhancements

Enhancements processing can cause stuttering, especially with low-end onboard audio.

Same **Properties** window → **Enhancements** tab → check **Disable all enhancements** → **Apply**

Or on Windows 11: **Advanced** tab → **Audio enhancements** → **Off**

---

## Fix 3: Update or Reinstall Audio Driver

Outdated audio drivers cause crackling after Windows updates.

**Update:**
Device Manager → **Sound, video and game controllers** → right-click audio device → **Update driver** → **Search automatically**

**Reinstall:**
Right-click → **Uninstall device** → check **Delete the driver software** → **Uninstall** → restart

**Manufacturer driver** (best option):
Download from motherboard or laptop manufacturer's website — not Windows Update. These are specifically tuned for your hardware.

---

## Fix 4: Disable USB Selective Suspend (for USB Audio)

If your audio device is USB (DAC, headset, interface): Windows may cut power to it to save energy.

`Win + R` → `powercfg.cpl` → **Change plan settings** → **Change advanced power settings** → **USB settings** → **USB selective suspend setting** → set to **Disabled**

Or for the specific device:
Device Manager → **Universal Serial Bus controllers** → right-click USB Root Hub → **Properties** → **Power Management** → uncheck **Allow the computer to turn off this device to save power**

---

## Fix 5: Increase Audio Buffer Size

If crackling happens only during heavy CPU load — the audio buffer is too small.

For ASIO devices: open your DAC/interface control panel → increase buffer size to 512 or 1024 samples.

For Windows audio:
```powershell
# Check current audio engine settings
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\MMDevices\Audio\Render" -ErrorAction SilentlyContinue
```

For general use, 512-sample buffer at 48kHz adds only ~10ms latency but eliminates most crackling.

---

## Fix 6: Disable CPU Power Throttling

When CPU drops to low-power states, audio engine gets starved of processing time.

```powershell
# Set CPU minimum to 100% (prevents power throttling)
powercfg /setacvalueindex SCHEME_CURRENT SUB_PROCESSOR PROCTHROTTLEMIN 100
powercfg /setactive SCHEME_CURRENT
```

Or in Power Options: Advanced settings → **Processor power management** → **Minimum processor state** → set to **100%** when plugged in.

Note: this increases power consumption. Switch back to 5% when audio issues are resolved.

---

## Fix 7: Exclusive Mode Settings

Some apps request exclusive control of the audio device, causing conflicts.

**Playback** → **Properties** → **Advanced** tab → check both:
- **Allow applications to take exclusive control of this device**
- **Give exclusive mode applications priority**

If crackling happens in one specific app — uncheck these and see if it helps.

---

## Fix 8: Check for IRQ Conflicts

```powershell
# Check for shared IRQs (can cause audio issues)
Get-WmiObject Win32_IRQResource | Where-Object {$_.Availability -eq 3} |
  Select-Object IRQNumber, Name
```

If your audio device shares an IRQ with another device — try moving it to a different PCIe slot or USB port.

---

## Fix 9: DPC Latency Check

High DPC (Deferred Procedure Call) latency causes audio dropouts.

Download **LatencyMon** (free from [resplendence.com](https://www.resplendence.com/latencymon)) → run for 2-3 minutes → check which driver has highest DPC latency.

Common culprits: network drivers, USB drivers, antivirus. Update or disable the problematic driver.

---


---

## 🔍 Not sure what a Windows error code means?

If Windows shows a code like `0x80070005`, `0x80070002` or `0xC000021A` — use this free tool:

**[→ Windows Error Decoder](/tools/windows-error-decoder)** — enter the code and instantly find out what it means and how to fix it.


## Summary

Start with **audio format** (Fix 1) and **disable enhancements** (Fix 2) — these fix 80% of cases. For USB audio: disable USB selective suspend. For crackling under load: increase buffer size or disable CPU power throttling. For persistent issues: run LatencyMon to find the driver causing high DPC latency.
