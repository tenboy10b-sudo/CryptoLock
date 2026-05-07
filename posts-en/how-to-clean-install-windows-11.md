---
title: "How to Clean Install Windows 11: Step-by-Step Guide"
date: "2026-06-26"
publishDate: "2026-06-26"
description: "Complete guide to clean installing Windows 11 from USB: create bootable media, configure BIOS, partition the drive, and set up Windows fresh without any bloatware."
tags: ["windows", "installation", "bios", "tools"]
readTime: 8
---

A clean install gives you Windows 11 with no old drivers, no accumulated junk, no manufacturer bloatware. It's the most reliable way to fix a broken system or start fresh on new hardware.

---

## What You Need

- USB drive (8 GB minimum, 16 GB recommended)
- Windows 11 ISO or Media Creation Tool
- 30–60 minutes
- Product key (optional — Windows activates automatically if previously activated on this hardware)

---

## Step 1: Back Up Your Data

A clean install **erases everything** on the target drive. Back up:
- Documents, Photos, Videos, Desktop
- Browser bookmarks (export from browser settings)
- Game saves (usually in `%APPDATA%` or cloud)
- Software license keys
- Wi-Fi passwords: `netsh wlan export profile folder=C:\WiFiBackup key=clear`

---

## Step 2: Create Bootable USB

**Option A: Media Creation Tool (easiest)**

Download from [microsoft.com/software-download/windows11](https://www.microsoft.com/software-download/windows11) → **Download Now** under "Create Windows 11 Installation Media" → run → follow prompts → select USB drive → wait 20–30 minutes.

**Option B: Rufus (more control)**

Download [Rufus](https://rufus.ie) → select your USB → click **Download** next to "Boot selection" to download ISO → select **GPT** partition scheme → click **Start**

Use Rufus if you want to bypass TPM/Secure Boot requirements (select **Extended Windows 11 Installation**).

---

## Step 3: Configure BIOS

Restart → enter BIOS (press `Del`, `F2`, `F10`, or `F12` at startup — depends on manufacturer)

**Required settings:**
- **Boot Mode**: UEFI (not Legacy/CSM)
- **Secure Boot**: Enabled (required for Windows 11)
- **TPM**: Enabled (fTPM for AMD, PTT for Intel)
- **Boot Order**: USB first

Save and exit.

---

## Step 4: Boot from USB

Insert USB → restart → PC boots from USB → Windows Setup loads.

If it boots to Windows instead: restart → press `F8`, `F11`, or `F12` during POST to open Boot Menu → select USB.

---

## Step 5: Windows Setup

1. **Language, time, keyboard** → Next
2. **Install now**
3. **Product key**: enter if you have one, or **I don't have a product key** (activates automatically if hardware was previously activated)
4. **Select edition**: Windows 11 Home or Pro (match your previous license)
5. **Accept license terms**
6. **Installation type**: select **Custom: Install Windows only (advanced)**

---

## Step 6: Partition the Drive

You'll see a list of partitions on your drive.

**For a clean install on the main drive:**
- Delete all existing partitions (select each → **Delete**) — this erases everything
- Select **Unallocated Space** → **Next** — Windows creates required partitions automatically

**For a new drive or second drive:**
- Just select the unallocated space → **Next**

Windows creates: EFI System Partition (100 MB), Microsoft Reserved (16 MB), Windows partition, Recovery partition.

---

## Step 7: Installation

Windows copies files and restarts several times. Don't interrupt. Takes 10–25 minutes depending on drive speed.

---

## Step 8: Initial Setup (OOBE)

- **Region and keyboard**: select yours
- **Network**: you can **Skip** and connect later
- **Microsoft account**: to use a local account instead, disconnect from internet before this screen, or select **Sign-in options** → **Offline account** → **Skip for now**
- **Privacy settings**: disable what you don't want (telemetry, location, diagnostic data)

---

## Step 9: Post-Install Checklist

```powershell
# Check Windows is activated
slmgr /xpr

# Check for updates immediately
Start-Process "ms-settings:windowsupdate"
```

**In order:**
1. **Windows Update** — install all updates before anything else
2. **Drivers** — GPU (nvidia.com / amd.com), chipset (motherboard manufacturer), audio
3. **Restore Wi-Fi**: `netsh wlan add profile filename="C:\WiFiBackup\ProfileName.xml"`
4. **Install apps** — browser, software, games

---

## Activate Windows

If Windows doesn't activate automatically:

```cmd
slmgr /ipk YOUR-PRODUCT-KEY
slmgr /ato
```

Check activation status:
```powershell
(Get-WmiObject SoftwareLicensingProduct -Filter "Name like 'Windows%'" |
  Where-Object {$_.PartialProductKey}).LicenseStatus
```

`1` = Licensed (activated).

---

## Common Issues

**"This PC can't run Windows 11"**: enable TPM and Secure Boot in BIOS, or use Rufus extended install to bypass.

**PC boots to old Windows**: check boot order in BIOS, ensure USB is first.

**Setup doesn't show drives**: SATA/NVMe drivers missing. Load drivers from a second USB using **Load driver** in the partition screen.

**Stuck at "Just a moment"**: wait up to 10 minutes. If longer, it may be a driver issue — restart and reinstall.

---

## Summary

Back up → create USB with Media Creation Tool → enable UEFI + TPM + Secure Boot in BIOS → boot from USB → Custom install → delete all partitions → install → update immediately → install drivers. The whole process takes about an hour.
