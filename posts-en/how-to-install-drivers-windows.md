---
title: "How to Install and Update Drivers in Windows 10 and 11"
date: "2026-06-18"
publishDate: "2026-06-18"
description: "Install, update, and roll back drivers in Windows the right way. Where to find the correct drivers, how to use Device Manager, and when to avoid Windows Update drivers."
tags: ["windows", "drivers", "hardware", "tools"]
readTime: 6
---

Wrong or outdated drivers cause crashes, poor performance, and broken devices. Here's how to manage drivers correctly.

---

## Where to Get Drivers

**Always prefer the manufacturer's website** over Windows Update for critical drivers:

- **GPU**: nvidia.com, amd.com, intel.com/graphics
- **Chipset/Motherboard**: motherboard manufacturer (ASUS, MSI, Gigabyte, ASRock)
- **Laptop**: laptop manufacturer (Dell, HP, Lenovo, ASUS support pages)
- **Network/Audio**: usually included with motherboard drivers

Windows Update drivers are generic — they work but lack features and optimizations.

---

## Check Current Driver Versions

```powershell
# All installed drivers with versions
Get-WmiObject Win32_PnPSignedDriver |
  Select-Object DeviceName, DriverVersion, DriverDate |
  Where-Object {$_.DeviceName -ne $null} |
  Sort-Object DeviceName
```

Or: **Device Manager** (`Win + X` → Device Manager) → right-click any device → **Properties** → **Driver** tab

---

## Install a Driver

**From .exe installer** (GPU, audio, chipset):
Download the installer from manufacturer → run as Administrator → follow prompts → restart if required.

**From .inf file** (manual install):
`Win + X` → **Device Manager** → right-click the device → **Update driver** → **Browse my computer** → navigate to the extracted driver folder → **OK**

**From Device Manager (automatic)**:
Right-click device → **Update driver** → **Search automatically** — Windows searches Windows Update.

---

## Roll Back a Driver

If a new driver breaks something:

**Device Manager** → expand the category → right-click the device → **Properties** → **Driver** tab → **Roll Back Driver**

If Roll Back is greyed out (no previous version saved):

```powershell
# Find old driver packages
Get-WindowsDriver -Online | Where-Object {$_.ProviderName -like "*NVIDIA*"} |
  Select-Object Driver, Version, Date
```

Or use **System Restore** to a point before the driver was installed.

---

## Uninstall a Driver Completely

Sometimes you need a clean install — especially for GPU drivers:

1. Download **DDU (Display Driver Uninstaller)** from [guru3d.com](https://www.guru3d.com/files-details/display-driver-uninstaller-download.html) for GPU drivers
2. Boot into Safe Mode
3. Run DDU → **Clean and restart**
4. Install fresh driver after reboot

For other drivers: **Device Manager** → right-click → **Uninstall device** → check **Delete the driver software** → **Uninstall** → restart

---

## Find Missing Drivers

After a fresh Windows install, some devices may show as unknown:

```powershell
# Show devices with missing or problem drivers
Get-WmiObject Win32_PnPEntity |
  Where-Object {$_.ConfigManagerErrorCode -ne 0} |
  Select-Object Name, ConfigManagerErrorCode
```

**Device Manager** → **View** → **Show hidden devices** — reveals devices without proper drivers.

To identify an unknown device: right-click → **Properties** → **Details** tab → **Hardware IDs** → copy the ID → search on [devid.info](https://devid.info) to find which device it is.

---

## Driver Signing and Security

Windows by default only installs signed drivers. If you need to install an unsigned driver:

```cmd
bcdedit /set testsigning on
```

Restart. You'll see a watermark. Re-disable after installing:
```cmd
bcdedit /set testsigning off
```

---

## Keep Drivers Updated Automatically

**Built-in option:**
`Win + I` → **Windows Update** → **Advanced options** → **Optional updates** — check for driver updates here periodically.

**Third-party tools:**
- **Snappy Driver Installer Origin** — free, offline driver pack
- **Driver Easy** — scans and updates automatically (freemium)

Avoid sketchy "driver updater" tools — many are adware. Stick to manufacturer websites and the tools above.

---

## GPU Driver — Special Considerations

GPU drivers update frequently and have the most impact on performance.

**NVIDIA**: download GeForce Experience for automatic updates, or download directly from nvidia.com/drivers

**AMD**: download AMD Software: Adrenalin Edition from amd.com/support

**Intel Arc**: download from intel.com/arc-graphics

Always do a clean install when upgrading GPU drivers (DDU first for major version changes).

---

## Summary

For critical drivers (GPU, network, audio): always download from manufacturer. For unknown devices: check Hardware ID on devid.info. For broken driver after update: roll back via Device Manager or use DDU for GPU. For GPU drivers specifically, do a clean install with DDU when upgrading major versions.
