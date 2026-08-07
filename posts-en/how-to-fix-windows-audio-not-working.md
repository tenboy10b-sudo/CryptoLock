---
title: "How to Fix No Sound in Windows 10 and 11: Audio Troubleshooting Guide"
date: "2027-02-04"
publishDate: "2027-06-01"
description: "Fix no sound in Windows 10 and 11. Troubleshoot audio issues: no output device, sound stopped working after update, driver problems, service not running."
tags: ["windows", "audio", "sound", "troubleshooting", "drivers"]
readTime: 5
translatesUk: "nemaie-zvuku-windows-vyrishennya"
---

No sound in Windows is usually caused by a wrong output device, disabled audio service, or driver issue. Here's how to fix it systematically.

---

## Check the Basics First

1. Volume not muted: click speaker icon in taskbar → unmute
2. Correct output device selected: right-click speaker → **Open Sound settings** → check Output device
3. App-specific volume: right-click speaker → **Open Volume Mixer** — some apps may be muted individually

---

## Run Audio Troubleshooter

`Win + I` → **System** → **Troubleshoot** → **Other troubleshooters** → **Playing Audio** → **Run**

```powershell
msdt.exe /id AudioPlaybackDiagnostic
```

---

## Check Audio Services

```powershell
# Audio services must be running
Get-Service AudioSrv, AudioEndpointBuilder, MMCSS |
  Select-Object Name, Status, StartType

# Start them if stopped
Start-Service AudioSrv
Start-Service AudioEndpointBuilder

# Set to automatic
Set-Service AudioSrv -StartupType Automatic
Set-Service AudioEndpointBuilder -StartupType Automatic
```

---

## Check Output Devices

```powershell
# List all audio devices
Get-WmiObject Win32_SoundDevice | Select-Object Name, Status, Manufacturer

# Check via Device Manager for disabled/error devices
# Win + X → Device Manager → Sound, video and game controllers
```

Right-click speaker in taskbar → **Sounds** → **Playback** tab:
- Check if your device is there
- Right-click → **Set as default device**
- Right-click → **Enable** if it shows as disabled

---

## Update or Reinstall Audio Driver

```powershell
# Check current audio driver
Get-WmiObject Win32_SoundDevice | Select-Object Name, DriverVersion

# Uninstall audio driver (Windows will reinstall)
Get-WmiObject Win32_PnPSignedDriver | Where-Object {$_.DeviceName -like "*Realtek*" -or $_.DeviceName -like "*Intel*Audio*"} |
  Select-Object DeviceName, InfName, DriverVersion
```

Then: Device Manager → Sound → right-click → **Uninstall device** → check **Delete the driver software** → OK → Restart

Download fresh drivers from:
- Realtek audio: realtek.com
- ASUS/HP/Dell/Lenovo: manufacturer support page

---

## Fix Audio After Windows Update

```powershell
# Check if audio update caused the issue
Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 5

# Roll back audio driver in Device Manager
# Device Manager → Sound → Properties → Driver → Roll Back Driver

# Or uninstall the update
wusa /uninstall /kb:KB_NUMBER /quiet /norestart
```

---

## Rebuild Audio Graph

```powershell
# Restart Windows Audio service completely
Stop-Service AudioSrv, AudioEndpointBuilder -Force
Start-Sleep 3
Start-Service AudioEndpointBuilder
Start-Service AudioSrv
```

---

## Fix HDMI / Monitor Audio Not Working

```powershell
# Check if HDMI audio device is present
Get-WmiObject Win32_SoundDevice | Where-Object {$_.Name -like "*HDMI*" -or $_.Name -like "*Display*"}
```

Right-click speaker → Sounds → Playback → right-click HDMI device → **Enable** → **Set as Default** → OK

---

## Repair System Files

```powershell
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
```

Restart after completion.

---

## Summary

Check output device and volume first. Run the Audio troubleshooter. Ensure AudioSrv and AudioEndpointBuilder services are running. Update or reinstall audio drivers. For post-update issues: roll back driver or uninstall the update.

## Frequently Asked Questions

### Sound worked yesterday but stopped today — no update installed?

Check if the audio service is still running: `Get-Service AudioSrv`. Also check if a recently installed app changed audio settings. Right-click speaker → Sounds → check Playback tab for unexpected default device changes.

### I see the audio device but still no sound?

Check the app-specific volume in Volume Mixer. Some apps have their own volume controls. Also check if the correct output is selected in the app itself (e.g. browser or media player settings).

### No sound after connecting Bluetooth headphones?

Windows may not have switched to the Bluetooth device. Click the speaker icon → select the Bluetooth device name. If it doesn't appear, disconnect and reconnect the headphones.
