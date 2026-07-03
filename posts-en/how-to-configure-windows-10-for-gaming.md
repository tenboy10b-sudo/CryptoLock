---
title: "How to Optimize Windows 10 and 11 for Gaming in 2026"
date: "2026-06-10"
publishDate: "2026-06-10"
description: "Optimize Windows 10 and 11 for gaming. Enable Game Mode, configure GPU settings, reduce input lag, disable background processes and get maximum FPS."
tags: ["windows", "gaming", "performance", "optimization", "gpu"]
readTime: 5
translatesUk: "optymizatsiya-windows-dlya-igor"
---

Windows has dozens of settings that affect gaming performance. Here's what actually matters.

---

## Game Mode

```powershell
# Enable Game Mode
Set-ItemProperty "HKCU:\SOFTWARE\Microsoft\GameBar" -Name "AllowAutoGameMode" -Value 1 -Type DWord
Set-ItemProperty "HKCU:\SOFTWARE\Microsoft\GameBar" -Name "AutoGameModeEnabled" -Value 1 -Type DWord
```

Or: `Win + I` → **Gaming** → **Game Mode** → On

Game Mode reduces background CPU and GPU activity when a game is in focus.

---

## Power Plan for Gaming

```powershell
# Ultimate Performance (eliminates CPU idle states)
powercfg /duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61
powercfg /setactive e9a42b02-d5df-448d-aa00-03f14749eb61

# Verify
powercfg /getactivescheme
```

---

## Disable Xbox Game Bar (if you don't use it)

```powershell
# Disable Game Bar
Set-ItemProperty "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\GameDVR" `
  -Name "AppCaptureEnabled" -Value 0 -Type DWord
Set-ItemProperty "HKCU:\SOFTWARE\Microsoft\GameBar" `
  -Name "UseNexusForGameBarEnabled" -Value 0 -Type DWord

# Disable via Settings
# Win + I → Gaming → Xbox Game Bar → Off
```

---

## GPU Settings (NVIDIA)

For NVIDIA GPUs via NVIDIA Control Panel:

- **Power Management Mode** → Prefer maximum performance
- **Texture filtering Quality** → Performance
- **Vertical sync** → Off (use in-game V-Sync or G-Sync instead)
- **Threaded optimization** → On
- **Low Latency Mode** → Ultra (for competitive games)

```powershell
# Check GPU driver version
(Get-WmiObject Win32_VideoController).DriverVersion

# Force GPU driver update check
# Download from nvidia.com/drivers
```

---

## GPU Settings (AMD)

For AMD GPUs via AMD Adrenalin software:

- **Radeon Anti-Lag** → Enabled (reduces input latency)
- **Radeon Chill** → Disabled (for max FPS)
- **Image Sharpening** → as preferred
- **Enhanced Sync** → as preferred

---

## Reduce Input Lag

```powershell
# Disable fullscreen optimization (can help some games)
$gamePath = "C:\Games\GameName.exe"
Set-ItemProperty "HKCU:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers" `
  -Name $gamePath -Value "DISABLEDXMAXIMIZEDWINDOWEDMODE"

# High resolution timer for lower latency
# bcdedit /set useplatformtick yes  # careful — test before permanent
```

---

## Disable Background Processes

```powershell
# Stop telemetry (reduces background CPU)
Stop-Service DiagTrack -Force -EA 0
Set-Service DiagTrack -StartupType Disabled -EA 0

# Disable SysMain (unnecessary on SSD)
Stop-Service SysMain -Force
Set-Service SysMain -StartupType Disabled

# Check what's using CPU while gaming
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 Name, CPU
```

---

## Hardware Accelerated GPU Scheduling (HAGS)

```powershell
# Enable HAGS (requires Windows 11 + recent GPU)
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\GraphicsDrivers" `
  -Name "HwSchMode" -Value 2 -Type DWord

# Verify (2 = enabled)
(Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\GraphicsDrivers").HwSchMode
```

---

## Storage Optimization for Games

```powershell
# DirectStorage check (Windows 11, NVMe required)
(Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Storage\DirectStorage" -EA 0).GpuDecompressionSupported

# Keep game drive with 15%+ free space for shader compilation
Get-PSDrive D | Select-Object @{n='Free %';e={[math]::Round($_.Free/($_.Free+$_.Used)*100)}}
```

---

## Summary

Enable Game Mode and Ultimate Performance power plan. Update GPU drivers. Disable Game Bar if unused. Enable HAGS on supported hardware. Disable DiagTrack and SysMain. Keep GPU drivers current — they have the biggest FPS impact after hardware.

## Frequently Asked Questions

### Does disabling Xbox Game Bar improve FPS?

Slightly — 1-3% in some games. The bigger gain is disabling background recording if it was on. Not worth it if you use clips/screenshots regularly.

### Should I use Full Screen or Borderless Windowed mode?

Exclusive Full Screen: lowest input lag, game has direct GPU access. Borderless Windowed: easier Alt+Tab, but slightly higher input lag. For competitive play — Full Screen. For streaming or multiple monitors — Borderless.

### My GPU is at 100% but FPS is low — what's wrong?

You're GPU-bound at your current settings — lower resolution or graphics quality to get more FPS. 100% GPU is actually the goal in GPU-limited games. CPU bottleneck is different: CPU at 100% with GPU below 90%.
