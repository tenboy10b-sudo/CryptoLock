---
title: "Ventoy: How to Create a Multiboot USB Drive with Multiple ISO Files"
date: "2026-09-26"
publishDate: "2026-09-26"
updated: "2026-09-26"
description: "How to install Ventoy on a USB drive and boot multiple ISO images — Windows, Linux, recovery tools — from one flash drive. No need to reformat, just copy ISO files."
tags: ["windows", "usb", "installation", "ventoy", "bios"]
readTime: 6
translatesUk: "ventoy-yak-stvoryty-multyzavantazhuvalnu-fleshku"
---

Ventoy solves the main problem with bootable USB drives — no need to reformat every time. Just copy ISO files to the drive and choose what to boot.

---

## Ventoy vs Rufus

| | Rufus | Ventoy |
|-|-------|--------|
| ISOs per drive | 1 at a time | As many as fit |
| Add new image | Reformat USB | Copy file |
| Keep personal files | No | Yes |
| UEFI support | ✅ | ✅ |
| Secure Boot | ✅ | ✅ (with module) |

---

## Step 1 — Download Ventoy

1. Go to [ventoy.net](https://www.ventoy.net/en/download.html)
2. Download `ventoy-X.X.XX-windows.zip`
3. Extract the archive

---

## Step 2 — Install on USB Drive

1. Insert USB drive (8 GB minimum, 32 GB+ recommended)
2. Run `Ventoy2Disk.exe` as administrator
3. Select your USB drive in the **"Device"** list

**Before installing — set partition style:**
`Option → Partition Style`
- Modern UEFI PC → **GPT**
- Old BIOS PC → **MBR**

4. Click **"Install"** → confirm twice → wait for "Install Successfully"

> ⚠️ All data on the USB drive will be erased.

---

## Step 3 — Copy ISO Files

After installation the drive splits into two partitions. Open the **first large partition** (Ventoy) and copy ISO files there:

```
USB Drive (Ventoy)\
├── windows11.iso
├── windows10.iso
├── ubuntu-24.04.iso
└── hirens-boot-cd.iso
```

No extra configuration — Ventoy auto-detects all ISO files.

---

## Step 4 — Boot from Ventoy

1. Insert USB → boot from it (F11/F12 for Boot Menu)
2. Ventoy menu appears with all your ISOs listed
3. Select the image → Enter → Normal mode

---

## Update Ventoy

No need to reformat or re-copy ISOs:
1. Download new version from ventoy.net
2. Run `Ventoy2Disk.exe`
3. Click **"Update"** instead of "Install"
4. ISO files stay intact

---

## Summary

| Step | Action |
|------|--------|
| 1 | Download Ventoy from ventoy.net |
| 2 | Run Ventoy2Disk.exe → Install |
| 3 | Copy ISO files to USB drive |
| 4 | Boot from USB → select ISO |
| Update | Ventoy2Disk.exe → Update (ISOs preserved) |
