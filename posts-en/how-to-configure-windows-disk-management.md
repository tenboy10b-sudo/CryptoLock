---
title: "How to Manage Disks and Partitions in Windows via PowerShell and DiskPart"
date: "2026-07-03"
publishDate: "2026-07-03"
description: "Manage disks and partitions in Windows using Disk Management, PowerShell and DiskPart. Create, resize, format and assign drive letters to partitions."
tags: ["windows", "disk", "partitions", "diskpart", "powershell", "administration"]
readTime: 5
---

Windows has three tools for disk management — GUI Disk Management, PowerShell and DiskPart. Here's when to use each and how.

---

## View Disks and Partitions

```powershell
# All physical disks
Get-Disk | Select-Object Number, FriendlyName, Size, PartitionStyle, HealthStatus

# All partitions on all disks
Get-Partition | Select-Object DiskNumber, PartitionNumber, DriveLetter, Size, Type

# Volumes (partitions with file systems)
Get-Volume | Select-Object DriveLetter, FileSystemLabel, FileSystem, Size, SizeRemaining, HealthStatus

# Specific disk detail
Get-Disk -Number 1 | Get-Partition
```

---

## Initialize a New Disk

```powershell
# Initialize new disk (choose GPT for modern systems)
Initialize-Disk -Number 1 -PartitionStyle GPT

# For legacy systems that need MBR
Initialize-Disk -Number 1 -PartitionStyle MBR
```

---

## Create and Format Partition

```powershell
# Create partition using all available space
$disk = 1
New-Partition -DiskNumber $disk -UseMaximumSize -AssignDriveLetter |
  Format-Volume -FileSystem NTFS -NewFileSystemLabel "Data" -Confirm:$false

# Create specific size partition
New-Partition -DiskNumber $disk -Size 100GB |
  Format-Volume -FileSystem NTFS -NewFileSystemLabel "Backup" -Confirm:$false

# Assign drive letter to existing partition
Set-Partition -DiskNumber 1 -PartitionNumber 2 -NewDriveLetter "D"
```

---

## Resize Partition

```powershell
# Check maximum supported size
(Get-PartitionSupportedSize -DiskNumber 1 -PartitionNumber 2).SizeMax / 1GB

# Extend partition to maximum
$maxSize = (Get-PartitionSupportedSize -DiskNumber 1 -PartitionNumber 2).SizeMax
Resize-Partition -DiskNumber 1 -PartitionNumber 2 -Size $maxSize

# Shrink partition (free up space)
Resize-Partition -DiskNumber 1 -PartitionNumber 2 -Size 50GB
```

---

## DiskPart (Command Line)

```cmd
REM Open DiskPart
diskpart

REM List disks
list disk

REM Select disk
select disk 1

REM List partitions
list partition

REM Select partition
select partition 2

REM Extend partition (uses all available adjacent space)
extend

REM Shrink by 10GB
shrink desired=10240

REM Format
format fs=ntfs label="Data" quick

REM Assign drive letter
assign letter=D

REM Exit
exit
```

---

## Convert MBR to GPT

```powershell
# Non-destructive conversion (Windows 10 1703+)
# Disk must have no partitions, OR use MBR2GPT tool

# Check if conversion is possible
MBR2GPT /validate /disk:1

# Convert (run from Windows PE or with /allowFullOS for running system)
MBR2GPT /convert /disk:1 /allowFullOS
```

---

## Clean a Disk (Erase All Data)

```powershell
# WARNING: destroys all data
Clear-Disk -Number 1 -RemoveData -Confirm:$false

# Then reinitialize
Initialize-Disk -Number 1 -PartitionStyle GPT
```

---

## Summary

`Get-Disk` and `Get-Partition` for inventory. `Initialize-Disk` for new drives. `New-Partition | Format-Volume` to create and format. `Resize-Partition` to extend/shrink. Use DiskPart for operations not available in PowerShell.

## Frequently Asked Questions

### Disk Management shows unallocated space but I can't extend the partition — why?

The unallocated space must be directly adjacent and to the right of the partition. If there's another partition between them, you'd need to delete it first (backup data!) or use third-party tools like MiniTool Partition Wizard.

### What's the difference between GPT and MBR?

GPT supports disks over 2TB and unlimited partitions (MBR max is 4 primary). GPT is required for UEFI boot. Use GPT for all modern systems. MBR only if you need compatibility with very old hardware.

### I accidentally deleted the wrong partition — can I recover it?

Possibly — don't write anything to the disk. Use TestDisk (free, open source) immediately: `winget install CGSecurity.TestDisk`. It can reconstruct deleted partition tables.
