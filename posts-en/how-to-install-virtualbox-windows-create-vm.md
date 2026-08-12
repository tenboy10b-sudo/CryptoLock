---
title: "VirtualBox on Windows: Installation, Setup and Creating a Virtual Machine"
date: "2026-06-10"
publishDate: "2026-09-27"
updated: "2026-06-10"
description: "How to install VirtualBox on Windows 10 and 11, create a virtual machine with Windows or Linux, configure networking and shared folders. Fix common VirtualBox errors."
tags: ["windows", "virtualbox", "virtualization", "linux", "tools"]
readTime: 8
translatesUk: "virtualbox-vstanovlennya-nalashtuvannya-virtualna-mashyna"
---

VirtualBox lets you run Windows, Linux or any other OS inside your Windows — in a separate window. Free, no limits, from Oracle.

---

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 4 GB | 8 GB+ |
| Disk | 20 GB free | 50 GB+ |
| CPU | VT-x/AMD-V support | Any modern |

**Check if virtualization is enabled:**
```powershell
(Get-WmiObject Win32_Processor).VirtualizationFirmwareEnabled
```
Or: Task Manager → Performance → CPU → Virtualization: Enabled

If disabled — enable Intel VT-x or AMD-V in BIOS.

---

## Step 1 — Install VirtualBox

1. Download from [virtualbox.org/wiki/Downloads](https://www.virtualbox.org/wiki/Downloads) → **"Windows hosts"**
2. Run installer as administrator, keep defaults
3. Also download and install **Extension Pack** (USB 2.0/3.0, RDP, disk encryption)

---

## Step 2 — Create a Virtual Machine

1. Click **"New"** (Ctrl+N)
2. Set parameters:
   - Name: Windows 11 Test or Ubuntu 24.04
   - Type: Microsoft Windows or Linux
   - Version: Windows 11 (64-bit) or Ubuntu (64-bit)
3. RAM: Windows 11 → **4096 MB** min, Ubuntu → **2048 MB**
4. Disk: Create new VDI → **Dynamic** → Windows 11: 64 GB, Ubuntu: 20 GB

---

## Step 3 — Install OS in VM

1. VM → **Settings** → **Storage** → empty drive → choose ISO file
2. **OK** → **Start**
3. Proceed through normal OS installation

---

## Step 4 — Install Guest Additions

Improves VM: fullscreen mode, shared clipboard, drag & drop, better video.

```
Devices → Insert Guest Additions CD image...
```

On Linux guest:
```bash
sudo apt install build-essential dkms linux-headers-$(uname -r)
sudo sh /media/cdrom/VBoxLinuxAdditions.run
sudo reboot
```

---

## Network Modes

| Mode | VM has internet | Host sees VM | Use when |
|------|----------------|--------------|----------|
| NAT | ✅ | ❌ | Simple internet access |
| Bridged | ✅ | ✅ | VM as separate PC on network |
| Host-only | ❌ | ✅ | Isolated VM-host network |

---

## Troubleshooting

### "VT-x is disabled in the BIOS"
Enable Intel VT-x or AMD-V in BIOS → Advanced → CPU Configuration.

### Conflict with Hyper-V (WSL 2 / Windows Sandbox)
```powershell
bcdedit /set hypervisorlaunchtype off
# Restart PC
```
Or use VirtualBox 7.0+ which supports running alongside Hyper-V.

### VM is very slow
- Increase RAM and CPU cores in Settings
- Install Guest Additions
- Enable 3D acceleration: Settings → Display → Enable 3D Acceleration
- Store VM files on SSD

---

## Summary

| Step | Action |
|------|--------|
| 1 | Download VirtualBox + Extension Pack |
| 2 | Install, enable VT-x in BIOS |
| 3 | Create VM: name, type, RAM, disk |
| 4 | Attach ISO, install OS |
| 5 | Install Guest Additions |
| 6 | Configure network and shared folders |
