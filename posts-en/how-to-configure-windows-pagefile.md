---
title: "How to Configure the Windows Page File (Virtual Memory) Correctly"
date: "2026-06-09"
publishDate: "2026-06-09"
description: "Configure Windows page file size and location correctly. System-managed vs custom, move page file to another drive, disable safely and troubleshoot virtual memory errors."
tags: ["windows", "pagefile", "performance", "memory", "optimization"]
readTime: 5
---

The page file extends your RAM onto disk — when physical RAM fills up, Windows moves inactive pages there. Configured incorrectly, it degrades performance significantly.

---

## Check Current Page File Settings

```powershell
# View page file configuration
Get-WmiObject Win32_PageFileSetting | Select-Object Name, InitialSize, MaximumSize

# View current usage
Get-WmiObject Win32_PageFileUsage | Select-Object Name, CurrentUsage, AllocatedBaseSize, PeakUsage

# Check if system-managed
(Get-WmiObject Win32_ComputerSystem).AutomaticManagedPagefile
```

---

## System-Managed vs Manual

**System-Managed** (default): Windows adjusts size automatically based on RAM and usage. Recommended for most users.

**Manual**: You control initial and maximum size. Useful when:
- You want the page file on a faster/separate drive
- You need consistent page file size (no resizing overhead)
- System-managed is set too small for your workload

---

## Set to System-Managed

```powershell
$cs = Get-WmiObject Win32_ComputerSystem
$cs.AutomaticManagedPagefile = $true
$cs.Put()
```

Or: `sysdm.cpl` → **Advanced** → **Performance Settings** → **Advanced** → **Change** → check **Automatically manage paging file size for all drives**

---

## Set Custom Page File Size

```powershell
# Disable automatic management first
$cs = Get-WmiObject Win32_ComputerSystem
$cs.AutomaticManagedPagefile = $false
$cs.Put()

# Delete existing page file settings
$existing = Get-WmiObject Win32_PageFileSetting
$existing | ForEach-Object { $_.Delete() }

# Create new page file with fixed size (in MB)
$pageFile = ([WMIClass]"Win32_PageFileSetting").CreateInstance()
$pageFile.Name = "C:\pagefile.sys"
$pageFile.InitialSize = 4096   # 4 GB initial
$pageFile.MaximumSize = 8192   # 8 GB maximum
$pageFile.Put()
```

---

## Move Page File to Another Drive

Moving to a second drive reduces C: SSD wear and can improve performance:

```powershell
# Remove from C:
$cs = Get-WmiObject Win32_ComputerSystem
$cs.AutomaticManagedPagefile = $false
$cs.Put()

# Delete C: page file
Get-WmiObject Win32_PageFileSetting | Where-Object {$_.Name -like "C:*"} |
  ForEach-Object {$_.Delete()}

# Create on D:
$pageFile = ([WMIClass]"Win32_PageFileSetting").CreateInstance()
$pageFile.Name = "D:\pagefile.sys"
$pageFile.InitialSize = 4096
$pageFile.MaximumSize = 8192
$pageFile.Put()
```

---

## Recommended Page File Sizes

| RAM | Minimum page file | Maximum page file |
|-----|------------------|------------------|
| 4 GB | 4 GB | 8 GB |
| 8 GB | 4 GB | 8 GB |
| 16 GB | 4 GB | 8 GB |
| 32 GB+ | 2 GB | 4 GB |

---

## Can I Disable the Page File?

```powershell
# Only safe to disable if:
# 1. You have 32+ GB RAM
# 2. No apps require it (some require page file even with lots of RAM)
# 3. Not using Windows memory dump for debugging

# Disable page file (on all drives)
$cs = Get-WmiObject Win32_ComputerSystem
$cs.AutomaticManagedPagefile = $false
$cs.Put()
Get-WmiObject Win32_PageFileSetting | ForEach-Object { $_.Delete() }
```

---

## Fix "Your system is low on virtual memory" Error

```powershell
# Increase page file size or re-enable automatic management
$cs = Get-WmiObject Win32_ComputerSystem
$cs.AutomaticManagedPagefile = $true
$cs.Put()

# Check what's consuming RAM
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 10 Name,
  @{n='RAM GB';e={[math]::Round($_.WorkingSet/1GB, 2)}}
```

---

## Summary

System-managed is fine for most users. For better control: disable auto, set initial = RAM × 0.5, max = RAM × 1.5. Move to second drive for SSD wear reduction. Never disable unless you have 32+ GB RAM and know your apps don't need it.

## Frequently Asked Questions

### Does putting the page file on SSD wear it out quickly?

Modern SSDs are rated for hundreds of TBW. A typical page file writes 1-10 GB/day depending on RAM pressure. This is negligible — don't move the page file just to save SSD wear.

### My page file is 20 GB — is that too large?

Large page files indicate RAM pressure — your system is relying heavily on virtual memory. Add more physical RAM instead. A large page file compensates but cannot replace actual RAM performance.

### Where does Windows put the crash dump file?

By default in `C:\Windows\MEMORY.DMP`. This requires enough page file or dedicated space. `sysdm.cpl` → Advanced → Startup and Recovery → configure dump type and location.
