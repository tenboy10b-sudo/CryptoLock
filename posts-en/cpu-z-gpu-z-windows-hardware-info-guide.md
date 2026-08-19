---
title: "CPU-Z and GPU-Z on Windows: Detailed Hardware Information Guide"
date: "2026-10-13"
publishDate: "2026-10-13"
updated: "2026-09-04"
description: "How to use CPU-Z and GPU-Z to view detailed CPU, GPU and RAM information on Windows. Check RAM timings, verify GPU specs, enable XMP profile and understand readings."
tags: ["windows", "cpu-z", "gpu-z", "hardware", "diagnostics", "tools"]
readTime: 6
translatesUk: "cpu-z-gpu-z-windows-informatsiia-pro-zalizo"
---

CPU-Z and GPU-Z are the most popular free utilities for detailed PC hardware information. Processor, graphics card, RAM — all in one place.

---

## CPU-Z

```powershell
winget install CPUID.CPU-Z
```
Or from [cpuid.com](https://www.cpuid.com/softwares/cpu-z.html) — portable version available.

### Key Tabs

**CPU:** Name, cores/threads, base and boost clocks, TDP

**Memory:**
- Type (DDR4/DDR5), size, channels
- **DRAM Frequency** — actual frequency (half of rated XMP speed)
- CAS Latency and timings

**SPD:** Per-slot RAM info — manufacturer, model, XMP profiles

**Mainboard:** Motherboard model, BIOS version, chipset

### Check if XMP is enabled

CPU-Z → Memory → DRAM Frequency:
- **800 MHz** = DDR4-1600 (**XMP disabled**)
- **1600 MHz** = DDR4-3200 (XMP enabled)

Enable XMP in BIOS: AI Tweaker → XMP/EXPO Profile → Profile 1

### Stress Test
```
Tools → Bench → Stress CPU
```

---

## GPU-Z

```powershell
winget install TechPowerUp.GPU-Z
```
Or from [techpowerup.com/gpuz](https://www.techpowerup.com/gpuz/)

### Key Readings

**Graphics Card:**
- GPU chip name and architecture
- Technology (nm process)
- BIOS version

**Memory:**
- Type (GDDR6, GDDR6X), size, bus width
- Bandwidth

**Sensors tab:** Real-time temperature, GPU load %, clock speeds, power consumption

### Verify GPU is Genuine
GPU-Z shows exact chip specs. Compare with official NVIDIA/AMD specifications — fake or relabeled cards will differ.

---

## PowerShell Alternative

```powershell
Get-CimInstance Win32_Processor | Select-Object Name, NumberOfCores, MaxClockSpeed
Get-CimInstance Win32_VideoController | Select-Object Name, AdapterRAM, DriverVersion
Get-CimInstance Win32_PhysicalMemory | Select-Object Manufacturer, Capacity, Speed
```

---

## Summary

| Need | Tool | Location |
|------|------|---------|
| CPU info | CPU-Z → CPU tab | cpuid.com |
| RAM timings | CPU-Z → Memory/SPD | cpuid.com |
| GPU specs | GPU-Z → Graphics Card | techpowerup.com |
| GPU sensors | GPU-Z → Sensors | techpowerup.com |
| XMP check | CPU-Z → Memory → DRAM Frequency | — |
