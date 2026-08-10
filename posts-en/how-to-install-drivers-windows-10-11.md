---
title: "How to Install Drivers on Windows 10 and 11: Complete Guide for All Devices"
date: "2026-06-08"
publishDate: "2026-08-22"
updated: "2026-06-08"
description: "How to install drivers on Windows 10 and 11 after a clean install. Automatic update, manual installation, finding drivers by device ID, fixing driver conflicts and BSOD."
tags: ["windows", "drivers", "installation", "hardware", "settings"]
readTime: 7
translatesUk: "vstanovlennya-drayveriv-windows-10-11"
---

After a clean Windows install, some devices may not work: no sound, Wi-Fi won't connect, graphics card shows low resolution. The reason — missing drivers.

---

## Method 1 — Windows Update (easiest)

```
Win + I → Windows Update → Check for updates
Windows Update → Advanced options → Optional updates → Driver updates
```

**Installs automatically:** chipset, network, basic audio and video drivers.
**Does NOT install:** NVIDIA/AMD gaming drivers, printers, specialized hardware.

---

## Method 2 — Device Manager

```
Win + X → Device Manager
```

Devices with issues show a yellow `⚠️` warning sign.

### Find driver by Device ID

1. Right-click device → **"Properties"** → **"Details"** tab
2. Select **"Hardware IDs"** from dropdown
3. Copy first line (e.g. `PCI\VEN_10DE&DEV_2204`)
4. Search on [devicehunt.com](https://devicehunt.com)
5. Find manufacturer → download from official site

---

## Method 3 — Official Manufacturer Sites

**NVIDIA:** [nvidia.com/drivers](https://www.nvidia.com/drivers)
**AMD:** [amd.com/support](https://www.amd.com/support)
**Intel:** [intel.com/support](https://www.intel.com/support)

```powershell
# Find graphics card model
Get-WmiObject Win32_VideoController | Select-Object Name, DriverVersion

# Find motherboard
Get-WmiObject Win32_BaseBoard | Select-Object Manufacturer, Product

# Find laptop model
Get-WmiObject Win32_ComputerSystem | Select-Object Manufacturer, Model
```

**Laptop manufacturers:**

| Manufacturer | Support site |
|-------------|-------------|
| ASUS | asus.com/support |
| Lenovo | support.lenovo.com |
| HP | support.hp.com |
| Dell | dell.com/support |
| Acer | acer.com/support |

---

## Driver Installation Order

Install in this order to avoid conflicts:

1. **Chipset** — foundation, others may fail without it
2. **Graphics card** — NVIDIA/AMD/Intel
3. **Network** — LAN and Wi-Fi
4. **Audio** — Realtek or Conexant
5. **Other** — printers, webcams, specialized hardware

---

## Troubleshooting

### Device not working after driver install

```powershell
# Restart device
Disable-PnpDevice -InstanceId "PCI\VEN_..." -Confirm:$false
Enable-PnpDevice  -InstanceId "PCI\VEN_..." -Confirm:$false
```

### BSOD after driver install

Boot into Safe Mode (F8 at startup) and remove the recently installed driver:

```powershell
# View recently installed drivers
Get-WinEvent -LogName System |
  Where-Object {$_.Id -eq 7045} |
  Select-Object TimeCreated, Message |
  Sort-Object TimeCreated -Descending |
  Select-Object -First 10
```

### Roll back a driver

`Device Manager → Properties → Driver → Roll Back Driver`

If Roll Back is greyed out (no previous version saved), use **System Restore** to a point before the driver was installed.

---

## Clean Uninstall for GPU Drivers

For a clean GPU driver switch (or when a normal reinstall doesn't fix issues):

1. Download **DDU (Display Driver Uninstaller)** from [guru3d.com](https://www.guru3d.com/files-details/display-driver-uninstaller-download.html)
2. Boot into Safe Mode
3. Run DDU → **Clean and restart**
4. Install the fresh driver after reboot

---

## Installing Unsigned Drivers

Windows only installs signed drivers by default. To temporarily allow unsigned ones:

```cmd
bcdedit /set testsigning on
```

Restart — you'll see a watermark. Re-disable once done:
```cmd
bcdedit /set testsigning off
```

---

## Avoid Sketchy "Driver Updater" Tools

Many third-party "driver updater" apps are adware or install outdated versions. Stick to manufacturer websites, or if you want an automated option, **Snappy Driver Installer Origin** (free, offline) is a reputable choice.

---

## Summary

| Device type | Where to get driver |
|------------|-------------------|
| NVIDIA GPU | nvidia.com/drivers |
| AMD GPU | amd.com/support |
| Laptop | Manufacturer site by model |
| Unknown device | Device ID → devicehunt.com |
| Most devices | Windows Update → Optional updates |
