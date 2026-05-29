---
title: "How to Enable Hyper-V in Windows 11 and Create a Virtual Machine"
date: "2027-01-02"
publishDate: "2027-01-02"
description: "Enable Hyper-V in Windows 11 Pro and Enterprise, create your first virtual machine, configure networking and snapshots. Includes PowerShell commands."
tags: ["windows", "hyper-v", "virtualization", "administration"]
readTime: 6
---

Hyper-V is Windows' built-in hypervisor — free, fast, and requires no third-party software. Available on Windows 11 Pro and Enterprise only.

---

## Requirements

- Windows 11 **Pro** or **Enterprise** (not Home)
- 64-bit processor with Second Level Address Translation (SLAT)
- 4 GB RAM minimum (8+ GB recommended)
- Virtualization enabled in BIOS (Intel VT-x or AMD-V)

```powershell
# Check if Hyper-V is supported
systeminfo | findstr /i "Hyper-V Requirements"
# Or:
(Get-ComputerInfo).HyperVisorPresent
```

---

## Enable Hyper-V

**Method 1 — Windows Features:**

`Win + R` → `optionalfeatures` → check **Hyper-V** (all sub-items) → OK → Restart

**Method 2 — PowerShell (faster):**

```powershell
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
# Restart required
Restart-Computer
```

**Method 3 — DISM:**

```cmd
DISM /Online /Enable-Feature /All /FeatureName:Microsoft-Hyper-V
```

---

## Create a Virtual Machine

1. Open **Hyper-V Manager** (`Win + S` → search "Hyper-V Manager")
2. Right-click your PC name → **New** → **Virtual Machine**
3. Wizard:
   - Name: `TestVM`
   - Generation: **Generation 2** (for modern OS)
   - Memory: 2048 MB minimum, enable Dynamic Memory
   - Network: **Default Switch** (for internet access)
   - Virtual Hard Disk: 60 GB recommended
   - Installation: attach your ISO file
4. **Finish** → right-click VM → **Start**

---

## Create VM via PowerShell

```powershell
# Create a new VM
New-VM -Name "TestVM" -MemoryStartupBytes 2GB -Generation 2 `
  -NewVHDPath "C:\VMs\TestVM.vhdx" -NewVHDSizeBytes 60GB `
  -SwitchName "Default Switch"

# Attach ISO
Add-VMDvdDrive -VMName "TestVM" -Path "C:\ISOs\windows11.iso"

# Set boot order to DVD first
Set-VMFirmware -VMName "TestVM" -FirstBootDevice (Get-VMDvdDrive -VMName "TestVM")

# Start the VM
Start-VM -Name "TestVM"
```

---

## Configure Networking

```powershell
# List available switches
Get-VMSwitch

# Create an External switch (shares host network adapter)
New-VMSwitch -Name "External" -NetAdapterName "Ethernet" -AllowManagementOS $true

# Create an Internal switch (VM-to-host only, no internet)
New-VMSwitch -Name "Internal" -SwitchType Internal

# Connect VM to a switch
Connect-VMNetworkAdapter -VMName "TestVM" -SwitchName "External"
```

---

## Snapshots (Checkpoints)

```powershell
# Create a checkpoint before risky changes
Checkpoint-VM -Name "TestVM" -SnapshotName "Before update"

# List checkpoints
Get-VMCheckpoint -VMName "TestVM"

# Restore a checkpoint
Restore-VMCheckpoint -Name "Before update" -VMName "TestVM" -Confirm:$false

# Delete old checkpoint
Remove-VMCheckpoint -VMName "TestVM" -Name "Before update"
```

---

## Manage VMs via PowerShell

```powershell
# List all VMs with status
Get-VM | Select-Object Name, State, CPUUsage, MemoryAssigned

# Stop a VM gracefully
Stop-VM -Name "TestVM"

# Force stop (equivalent of power button)
Stop-VM -Name "TestVM" -Force

# Delete a VM and its disk
Remove-VM -Name "TestVM" -Force
Remove-Item "C:\VMs\TestVM.vhdx"
```

---

## Summary

Enable via `optionalfeatures` or `Enable-WindowsOptionalFeature`. Use Generation 2 for modern OS. Default Switch gives internet access immediately. Always create a checkpoint before installing software or updates in the VM.

## Frequently Asked Questions

### Can I run Hyper-V on Windows 11 Home?

No. Hyper-V is only available on Pro and Enterprise editions. Home users can use VirtualBox or VMware Workstation Player as free alternatives.

### Does Hyper-V slow down the host PC?

Minimally when VMs are not running. When VMs are active, they use real CPU and RAM. Allocating more than 70% of host RAM to VMs will cause performance issues.

### Can Hyper-V and VirtualBox/VMware run simultaneously?

Not well. Hyper-V takes control of the CPU virtualization layer, which prevents VirtualBox and older VMware versions from running. VMware Workstation 15.5.5+ has experimental Hyper-V compatibility mode.
