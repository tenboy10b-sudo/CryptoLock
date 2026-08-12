---
title: "How to Enable and Use Hyper-V in Windows 10 and 11"
date: "2026-02-27"
publishDate: "2026-02-27"
description: "Enable Hyper-V on Windows 10/11 Pro to run virtual machines. Step-by-step setup, creating your first VM, network configuration, and common troubleshooting."
tags: ["windows", "hyper-v", "virtualization", "administration"]
readTime: 7
---

Hyper-V is Microsoft's built-in hypervisor — available for free on Windows 10/11 Pro, Enterprise, and Education. It lets you run Linux, older Windows versions, or test environments without separate virtualization software.

---

## Requirements

- Windows 10/11 **Pro, Enterprise, or Education** (not available on Home)
- 64-bit processor with **SLAT** (Second Level Address Translation)
- **Virtualization enabled in BIOS** (Intel VT-x or AMD-V)
- Minimum **4 GB RAM** (8 GB+ recommended)

Check if your CPU supports it:
```powershell
systeminfo | findstr /i "hyper-v requirements"
```

All lines should show **Yes**.

---

## Enable Hyper-V

**Method 1: Windows Features**
`Win + R` → `optionalfeatures` → check **Hyper-V** (all sub-items) → OK → restart

**Method 2: PowerShell (faster)**
```powershell
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
```

Restart when prompted.

**Method 3: DISM**
```cmd
DISM /Online /Enable-Feature /All /FeatureName:Microsoft-Hyper-V
```

---

## Open Hyper-V Manager

`Win + S` → search **Hyper-V Manager**

Or: `Win + R` → `virtmgmt.msc`

---

## Create a Virtual Machine

1. In Hyper-V Manager → **Action** → **New** → **Virtual Machine**
2. **Name**: give it a descriptive name
3. **Generation**: choose **Generation 2** for modern OS (Linux, Windows 10+). Generation 1 for older systems or if Gen 2 doesn't work
4. **Memory**: assign RAM — minimum 2 GB, 4 GB recommended. Enable **Dynamic Memory** to let it adjust automatically
5. **Network**: select **Default Switch** for internet access
6. **Virtual Hard Disk**: create new, 50–100 GB is typical
7. **Installation**: point to your ISO file

Click **Finish**, then **Start** the VM.

---

## Configure Networking

**Default Switch** — created automatically, gives VMs internet via NAT. Simplest option.

**External Switch** — VM gets its own IP on your network (visible to other devices):
- **Action** → **Virtual Switch Manager** → **New Virtual Network Switch** → **External** → select your physical network adapter → **Apply**

**Internal Switch** — VMs can talk to each other and the host, but not the internet.

---

## Enable Enhanced Session (Better Performance)

Enhanced Session allows clipboard sharing, audio, and higher resolution between host and VM.

On the VM: install **Hyper-V Integration Services** (included in modern Windows; for Linux, install `linux-tools` package).

In Hyper-V Manager: **View** → **Enhanced Session**

For Linux VMs, enable XRDP:
```bash
sudo apt install xrdp
sudo systemctl enable xrdp
```

---

## Create a VM via PowerShell

```powershell
# Create a new VM
New-VM -Name "TestVM" -MemoryStartupBytes 2GB -Generation 2 `
  -NewVHDPath "C:\VMs\TestVM.vhdx" -NewVHDSizeBytes 60GB `
  -SwitchName "Default Switch"

# Attach an ISO and boot from it
Add-VMDvdDrive -VMName "TestVM" -Path "C:\ISOs\windows11.iso"
Set-VMFirmware -VMName "TestVM" -FirstBootDevice (Get-VMDvdDrive -VMName "TestVM")

# Start it
Start-VM -Name "TestVM"
```

---

## Useful PowerShell Commands

```powershell
# List all VMs
Get-VM

# Start/Stop VM
Start-VM -Name "Ubuntu"
Stop-VM -Name "Ubuntu" -Force

# Create checkpoint (snapshot)
Checkpoint-VM -Name "Ubuntu" -SnapshotName "Before update"

# List checkpoints
Get-VMSnapshot -VMName "Ubuntu"

# Restore checkpoint
Restore-VMSnapshot -Name "Before update" -VMName "Ubuntu"

# Get VM IP address
Get-VMNetworkAdapter -VMName "Ubuntu" | Select-Object IPAddresses

# Adjust RAM
Set-VMMemory -VMName "Ubuntu" -StartupBytes 4GB

# Adjust CPU count
Set-VMProcessor -VMName "Ubuntu" -Count 4

# Create a virtual switch from PowerShell
New-VMSwitch -Name "External" -NetAdapterName "Ethernet" -AllowManagementOS $true
New-VMSwitch -Name "Internal" -SwitchType Internal

# Delete a VM and its disk
Remove-VM -Name "TestVM" -Force
Remove-Item "C:\VMs\TestVM.vhdx"
```

---

## Common Issues

**"Hyper-V cannot be installed: Virtualization is disabled"**
Enter BIOS → enable **Intel VT-x** or **AMD-V** (sometimes labeled "SVM Mode")

**VM boots to black screen**
- For Gen 2 VMs with Linux: disable Secure Boot in VM settings → **Security** → uncheck **Enable Secure Boot**
- Or change template to **Microsoft UEFI Certificate Authority**

**Poor performance**
- Enable Dynamic Memory
- Install Integration Services inside the VM
- Use Generation 2 for better I/O performance

**No network in VM**
- Check Default Switch exists in Virtual Switch Manager
- Restart the VM network adapter: inside VM run `ipconfig /renew`

---

## Hyper-V vs VMware vs VirtualBox

| | Hyper-V | VMware Workstation | VirtualBox |
|---|---|---|---|
| Cost | Free (Pro+) | Paid | Free |
| Performance | Excellent | Excellent | Good |
| Linux support | Good | Excellent | Good |
| USB passthrough | Limited | Full | Full |
| Snapshots | Yes | Yes | Yes |

Use Hyper-V if you're already on Windows Pro and don't need USB passthrough. Use VirtualBox if you need cross-platform or USB device access.

---

## Frequently Asked Questions

### Can I run Hyper-V on Windows 11/10 Home?

No. Hyper-V is only available on Pro, Enterprise, and Education editions. Home users can use VirtualBox or VMware Workstation Player as free alternatives.

### Does Hyper-V slow down the host PC?

Minimally when VMs are not running. When VMs are active, they use real CPU and RAM. Allocating more than 70% of host RAM to VMs will cause performance issues.

### Can Hyper-V and VirtualBox/VMware run simultaneously?

Not well. Hyper-V takes control of the CPU virtualization layer, which prevents VirtualBox and older VMware versions from running. VMware Workstation 15.5.5+ has experimental Hyper-V compatibility mode.

---

## Summary

Enable via `optionalfeatures` or PowerShell → create VM → assign Default Switch for networking → use checkpoints before major changes. Generation 2 VMs perform better for modern operating systems. For Linux, disable Secure Boot in VM settings if it won't boot.
