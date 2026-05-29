---
title: "How to Check Your PC Specs in Windows 10 and 11"
date: "2026-03-14"
publishDate: "2026-03-14"
description: "Find your CPU, RAM, GPU, storage, and motherboard specs in Windows without opening the case. Using System Information, Task Manager, PowerShell, and free tools."
tags: ["windows", "hardware", "diagnostics", "tools"]
readTime: 5
---

Need to know your PC specs before buying RAM, updating drivers, or checking compatibility? Here's how to find every hardware detail without opening the case.

---

## Quick Overview: System Information

`Win + R` → `msinfo32`

Shows everything in one place: CPU, RAM, motherboard, BIOS version, Windows edition, and more. Useful for a quick snapshot.

Or the fastest way:
`Win + I` → **System** → **About** — shows basic specs at a glance.

---

## CPU Details

```powershell
Get-WmiObject Win32_Processor | Select-Object Name, NumberOfCores, NumberOfLogicalProcessors, MaxClockSpeed

# Output example:
# Name                  : Intel(R) Core(TM) i7-10700K CPU @ 3.80GHz
# NumberOfCores         : 8
# NumberOfLogicalProcessors: 16
# MaxClockSpeed         : 3800
```

Or: `Ctrl + Shift + Esc` → **Performance** → **CPU** — shows model, cores, speed, and cache.

---

## RAM Amount and Speed

```powershell
# Total RAM
(Get-WmiObject Win32_ComputerSystem).TotalPhysicalMemory / 1GB

# Per-stick details (manufacturer, speed, capacity)
Get-WmiObject Win32_PhysicalMemory |
  Select-Object Manufacturer, PartNumber,
    @{n='GB';e={$_.Capacity/1GB}},
    @{n='MHz';e={$_.Speed}},
    DeviceLocator
```

**DeviceLocator** shows which slot each stick is in (DIMM_A1, DIMM_B1, etc.).

Task Manager → Performance → Memory: shows current usage, speed, slots used, and form factor.

---

## GPU (Graphics Card)

```powershell
Get-WmiObject Win32_VideoController |
  Select-Object Name, AdapterRAM, DriverVersion, VideoModeDescription
```

Or: `Win + R` → `dxdiag` → **Display** tab — shows GPU name, VRAM, and driver version.

Task Manager → Performance → GPU: shows real-time usage, VRAM, and temperature (Windows 11).

---

## Storage Drives

```powershell
# All drives with size and type
Get-PhysicalDisk | Select-Object FriendlyName, MediaType, Size |
  ForEach-Object {
    [PSCustomObject]@{
      Name = $_.FriendlyName
      Type = $_.MediaType
      'Size GB' = [math]::Round($_.Size/1GB,0)
    }
  }

# Partitions and drive letters
Get-Partition | Select-Object DriveLetter, Size, Type |
  Where-Object {$_.DriveLetter} |
  ForEach-Object {[PSCustomObject]@{
    Letter = $_.DriveLetter
    'Size GB' = [math]::Round($_.Size/1GB,0)
    Type = $_.Type
  }}
```

---

## Motherboard and BIOS

```powershell
# Motherboard
Get-WmiObject Win32_BaseBoard | Select-Object Manufacturer, Product, Version

# BIOS version and date
Get-WmiObject Win32_BIOS | Select-Object Manufacturer, Name, SMBIOSBIOSVersion, ReleaseDate
```

---

## Network Adapters

```powershell
Get-NetAdapter | Select-Object Name, InterfaceDescription, MacAddress, LinkSpeed, Status
```

---

## Battery (Laptops)

```powershell
# Battery capacity and health
Get-WmiObject Win32_Battery |
  Select-Object Name, EstimatedChargeRemaining, BatteryStatus,
    @{n='DesignCapacity(mWh)';e={$_.DesignCapacity}},
    @{n='FullCapacity(mWh)';e={$_.FullChargeCapacity}}
```

For detailed battery history:
```powershell
powercfg /batteryreport
start "$env:USERPROFILE\battery-report.html"
```

---

## All Specs in One Script

```powershell
Write-Host "=== System Specs ===" -ForegroundColor Cyan

$cpu = Get-WmiObject Win32_Processor | Select-Object -First 1
Write-Host "CPU: $($cpu.Name)"
Write-Host "Cores: $($cpu.NumberOfCores) / Threads: $($cpu.NumberOfLogicalProcessors)"

$ram = (Get-WmiObject Win32_ComputerSystem).TotalPhysicalMemory / 1GB
Write-Host "RAM: $([math]::Round($ram,1)) GB"

$gpu = Get-WmiObject Win32_VideoController | Select-Object -First 1
Write-Host "GPU: $($gpu.Name)"

$os = Get-WmiObject Win32_OperatingSystem
Write-Host "OS: $($os.Caption) Build $($os.BuildNumber)"

$board = Get-WmiObject Win32_BaseBoard
Write-Host "Motherboard: $($board.Manufacturer) $($board.Product)"

Get-PhysicalDisk | ForEach-Object {
  Write-Host "Drive: $($_.FriendlyName) — $([math]::Round($_.Size/1GB,0)) GB ($($_.MediaType))"
}
```

---

## Free Tools for More Detail

**CPU-Z** — detailed CPU, motherboard, RAM, and GPU info including XMP profiles and timings. Download from [cpuid.com/softwares/cpu-z.html](https://www.cpuid.com/softwares/cpu-z.html)

**GPU-Z** — detailed GPU info including VRAM type, memory bandwidth, and sensor data. From [techpowerup.com/gpuz](https://www.techpowerup.com/gpuz/)

**HWiNFO64** — comprehensive real-time sensor monitoring. Temperatures, voltages, fan speeds for every component.

---

## Summary

For a quick overview: `msinfo32` or `Win + I → About`. For detailed specs: PowerShell `Get-WmiObject` commands above. For RAM slot info: Task Manager → Performance → Memory. For full hardware detail with sensors: HWiNFO64 is the most complete free tool available.
