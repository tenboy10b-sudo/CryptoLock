---
title: "How to Clean Install Windows 10 and 11: Complete Step-by-Step Guide"
date: "2026-06-08"
publishDate: "2027-06-01"
updated: "2026-06-08"
description: "How to clean install Windows 10 or 11 from a USB drive: backup, disk partitioning, bootable USB creation, and post-install setup. Everything you need to know."
tags: ["windows", "installation", "usb", "settings"]
readTime: 8
translatesUk: "chysta-ustanovka-windows-10-11-pokrokovyy-posibnyk"
---

A clean install is the best way to get a fast and stable system. Unlike an upgrade, it removes all accumulated clutter and installs Windows from scratch.

**When you need a clean install:**
- System became very slow
- Virus or malware infection
- Replacing SSD or hard drive
- Windows won't boot
- Want to start fresh

---

## Preparation — Do This Before You Start

### 1. Back Up Your Data

A clean install **erases everything** on the system partition. Back up:
- Documents, photos, videos — to external drive or cloud
- Browser bookmarks — export or sync via account
- Passwords — password manager or write them down
- License keys of installed software

### 2. Save Your Windows Key

```powershell
wmic path SoftwareLicensingService get OA3xOriginalProductKey
```

### 3. Export Installed Programs List

```powershell
Get-ItemProperty HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\* |
  Select-Object DisplayName, DisplayVersion |
  Sort-Object DisplayName |
  Export-Csv "$env:USERPROFILE\Desktop\programs.csv" -Encoding UTF8
```

---

## Step 1 — Create Bootable USB

1. Download [Rufus](https://rufus.ie) and Windows ISO from [microsoft.com](https://www.microsoft.com/software-download/windows11)
2. Select USB, ISO, partition scheme: **GPT** (UEFI) or **MBR** (Legacy)
3. Click START → wait for READY

```
Win + R → msinfo32 → BIOS Mode: UEFI → GPT | Legacy → MBR
```

---

## Step 2 — Boot from USB

Press Boot Menu key at startup:

| Manufacturer | Key |
|-------------|-----|
| ASUS | F8 or Esc |
| Gigabyte | F12 |
| MSI | F11 |
| Dell | F12 |
| HP | F9 |
| Lenovo | F12 |

---

## Step 3 — Installation Wizard

1. Select language → **"Install now"**
2. Enter product key or click **"I don't have a product key"**
3. Select edition (Home or Pro)
4. Accept license → **"Next"**
5. Choose **"Custom: Install Windows only"** ← clean install

---

## Step 4 — Disk Partitioning

**Full wipe (recommended):** Delete all partitions → select unallocated space → **"Next"**

**Keep data drive:** Delete only system partitions (C: and small system partitions), leave D: intact.

| Partition | Size | Purpose |
|-----------|------|---------|
| Recovery | ~500 MB | WinRE |
| EFI System | 100 MB | UEFI bootloader |
| MSR | 16 MB | Reserved |
| Primary | Rest | Windows (C:) |

---

## Step 5 — Installation Process

Windows copies files and restarts 2–3 times. **Don't turn off the PC.** Takes 15–30 minutes.

> 💡 To create a local account without Microsoft: when asked about network, click **"I don't have internet"** → **"Continue with limited setup"**

---

## Step 6 — Post-Install Setup

```powershell
# Check for missing drivers
Get-PnpDevice | Where-Object {$_.Status -eq 'Error'}
```

1. **Activation** — Settings → System → Activation → Troubleshoot
2. **Drivers** — Windows Update → Optional Updates → Driver Updates
3. **Updates** — Win + I → Windows Update → Check for updates
4. **Restore programs** from your saved list

---

## Summary

| Stage | Action | Time |
|-------|--------|------|
| Preparation | Backup, key, program list | 30 min |
| USB drive | Rufus + Windows ISO | 15 min |
| Installation | Partitioning, copying files | 30 min |
| Setup | OOBE, activation, drivers | 30 min |
