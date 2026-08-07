---
title: "Rufus: How to Create a Bootable USB Drive for Windows 10 and 11"
date: "2026-06-08"
publishDate: "2027-06-01"
updated: "2026-06-08"
description: "Step-by-step guide to creating a bootable Windows USB drive with Rufus. GPT vs MBR partition scheme, UEFI vs Legacy BIOS settings, and fixing common errors."
tags: ["windows", "installation", "usb", "rufus", "bios"]
readTime: 7
translatesUk: "rufus-yak-stvoryty-zavantazhyvalnu-fleshku-windows"
---

Rufus is the most popular tool for creating bootable USB drives. It's free, ad-free, and weighs just 1 MB. Here's how to use it correctly so your USB drive boots every time.

---

## What You Need

- USB drive **at least 8 GB** (16 GB recommended) — all data will be erased
- Windows 10 or 11 ISO image (downloaded from the official Microsoft website)
- Rufus — download from [rufus.ie](https://rufus.ie)
- 15–20 minutes

---

## Step 1 — Download the Windows ISO

Download the official ISO from Microsoft for free.

**Windows 11:**
1. Go to [microsoft.com/software-download/windows11](https://www.microsoft.com/software-download/windows11)
2. Select **"Download Windows 11 Disk Image (ISO)"**
3. Choose your language → **"64-bit Download"**

**Windows 10:**
1. Go to [microsoft.com/software-download/windows10](https://www.microsoft.com/software-download/windows10)
2. Click **"Download tool now"** → run it
3. Select **"Create installation media"** → ISO file

> ISO size: Windows 10 — ~5.5 GB, Windows 11 — ~5.2 GB

---

## Step 2 — Download and Launch Rufus

1. Go to [rufus.ie](https://rufus.ie) → download the latest version (e.g. `rufus-4.6.exe`)
2. Right-click → **"Run as administrator"**
3. Insert your USB drive

---

## Step 3 — Configure Rufus

Rufus will automatically detect your USB drive. Here's what to configure:

### Device
Select your USB drive in the first dropdown. **Make sure you select the USB drive**, not your hard drive.

### Boot Selection
Click **"SELECT"** and choose the downloaded Windows ISO file.

### Partition Scheme — the most important setting

| Your computer | Partition scheme | Target system |
|---------------|-----------------|---------------|
| Modern (after 2012) | **GPT** | **UEFI (non CSM)** |
| Old BIOS | **MBR** | **BIOS or UEFI-CSM** |
| Not sure | GPT | UEFI |

**How to check your system:**
```
Win + R → msinfo32 → BIOS Mode
```
- `UEFI` → choose **GPT + UEFI**
- `Legacy` → choose **MBR + BIOS**

### File System
- **NTFS** — for most cases
- **FAT32** — only if UEFI has issues on older motherboards

---

## Step 4 — Write

1. Click **"START"**
2. A warning about erasing the USB drive will appear — click **"OK"**
3. For Windows 11, Rufus will offer additional options:

### Windows 11 Options in Rufus

| Option | What it does | Recommendation |
|--------|-------------|----------------|
| Remove TPM 2.0 requirement | Install on older PCs | ✅ If no TPM |
| Remove Secure Boot requirement | For older BIOS | If needed |
| Remove RAM 8 GB requirement | For PCs with 4 GB | If needed |
| Remove Microsoft account requirement | Local account during setup | ✅ Recommended |

4. Wait for completion — the status bar should show **"READY"**

Write time: 5–15 minutes depending on USB speed.

---

## Step 5 — Boot from USB

After writing, you need to tell your computer to boot from the USB drive.

**Option 1 — Boot Menu (fast):**
Press the Boot Menu key at startup:

| Manufacturer | Key |
|-------------|-----|
| ASUS | F8 or Esc |
| Gigabyte | F12 |
| MSI | F11 |
| HP | F9 or Esc |
| Dell | F12 |
| Lenovo | F12 or Fn+F12 |
| Acer | F12 |

**Option 2 — via BIOS/UEFI:**
1. Enter BIOS (usually Del or F2 at startup)
2. Find the **Boot** or **Boot Priority** section
3. Move USB drive to first position
4. Save and restart: **F10 → Yes**

---

## Step 6 — Install Windows

After booting from USB:
1. Choose language and keyboard → **"Next"**
2. **"Install now"**
3. Enter product key or click **"I don't have a product key"** (can activate later)
4. Choose Windows edition
5. Accept the license → **"Next"**
6. Choose **"Custom: Install Windows only"** for a clean install
7. Select the partition

> ⚠️ **Warning:** Clean install will erase all data on the selected partition. Back up your data first.

---

## Frequently Asked Questions

### USB drive not showing in Rufus
- Try a different USB port (USB 2.0 preferred)
- Make sure the drive is visible in File Explorer
- In Rufus: check **Show advanced drive properties**

### "This PC can't run Windows 11" error
- Use Rufus version 3.19 or later
- When writing, check **"Remove requirement for TPM 2.0 and Secure Boot"**

### Computer doesn't see the USB at boot
- Check that **USB Boot** or **Legacy USB Support** is enabled in BIOS
- Try a different USB port
- Make sure you chose the correct partition scheme (GPT/MBR)

### "The disk has MBR partition style" during installation
The disk is not compatible with UEFI. Two options:
```powershell
# Convert disk to GPT (erases all data!)
# During setup: Shift+F10 → diskpart
list disk
select disk 0
clean
convert gpt
```
Or recreate the USB drive with MBR setting.

---

## Summary

| Step | Action |
|------|--------|
| 1 | Download ISO from microsoft.com |
| 2 | Download Rufus from rufus.ie |
| 3 | Select USB, ISO, GPT/MBR scheme |
| 4 | Click START, wait for READY |
| 5 | Boot from USB via Boot Menu |
| 6 | Go through Windows installation wizard |

Rufus is the most reliable way to create a bootable USB drive. For most modern PCs choose **GPT + UEFI**, for old ones — **MBR + BIOS**.
