---
title: "How to Configure Windows Storage Spaces for RAID-like Redundancy"
date: "2026-06-25"
publishDate: "2026-06-25"
description: "Set up Windows Storage Spaces to create mirror, parity or simple pools from multiple drives. Configure via PowerShell and Settings for redundancy without hardware RAID."
tags: ["windows", "storage-spaces", "raid", "disk", "administration", "powershell"]
readTime: 5
---

Storage Spaces lets you combine multiple drives into a redundant pool — similar to RAID, but built into Windows with no extra hardware.

---

## Storage Space Types

| Type | Drives Needed | Redundancy | Write Speed |
|------|--------------|-----------|-------------|
| **Simple** | 1+ | None | Fast |
| **Mirror (2-way)** | 2 | 1 drive failure | Good |
| **Mirror (3-way)** | 5 | 2 drive failures | Slower |
| **Parity** | 3 | 1 drive failure | Slow |

---

## Create Storage Pool via Settings

`Win + I` → **System** → **Storage** → **Storage Spaces** → **Create a new pool and storage space**

1. Select drives to include
2. Give pool a name
3. Choose resiliency type
4. Set size (can exceed physical size for thin provisioning)
5. Create

---

## Create Storage Pool via PowerShell

```powershell
# View available physical disks
Get-PhysicalDisk | Where-Object {$_.CanPool -eq $true} |
  Select-Object FriendlyName, Size, BusType, CanPool

# Create storage pool from available disks
$disks = Get-PhysicalDisk | Where-Object {$_.CanPool -eq $true}
$subsystem = Get-StorageSubSystem | Where-Object {$_.FriendlyName -like "*Windows*"}

New-StoragePool -FriendlyName "DataPool" `
  -StorageSubSystemFriendlyName $subsystem.FriendlyName `
  -PhysicalDisks $disks

# Create virtual disk (the actual volume)
# Mirror for redundancy
New-VirtualDisk -StoragePoolFriendlyName "DataPool" `
  -FriendlyName "DataMirror" `
  -ResiliencySettingName "Mirror" `
  -Size 500GB `
  -ProvisioningType Thin

# Initialize and format
$vdisk = Get-VirtualDisk -FriendlyName "DataMirror" | Get-Disk
Initialize-Disk -Number $vdisk.Number -PartitionStyle GPT
New-Partition -DiskNumber $vdisk.Number -DriveLetter D -UseMaximumSize
Format-Volume -DriveLetter D -FileSystem NTFS -NewFileSystemLabel "DataPool" -Confirm:$false
```

---

## Add Drives to Existing Pool

```powershell
# Add new physical disk to pool
$newDisk = Get-PhysicalDisk -FriendlyName "NewDisk"
Add-PhysicalDisk -StoragePoolFriendlyName "DataPool" -PhysicalDisks $newDisk
```

---

## Check Pool Health and Status

```powershell
# Pool status
Get-StoragePool | Select-Object FriendlyName, HealthStatus, OperationalStatus,
  @{n='Size GB';e={[math]::Round($_.Size/1GB)}},
  @{n='Allocated GB';e={[math]::Round($_.AllocatedSize/1GB)}}

# Virtual disk health
Get-VirtualDisk | Select-Object FriendlyName, HealthStatus, OperationalStatus,
  ResiliencySettingName, @{n='Size GB';e={[math]::Round($_.Size/1GB)}}

# Physical disk health in pool
Get-StoragePool -FriendlyName "DataPool" | Get-PhysicalDisk |
  Select-Object FriendlyName, HealthStatus, OperationalStatus, Usage
```

---

## Replace Failed Drive

```powershell
# Find failed disk
Get-PhysicalDisk | Where-Object {$_.HealthStatus -ne "Healthy"}

# Remove failed disk from pool
Remove-PhysicalDisk -StoragePoolFriendlyName "DataPool" `
  -PhysicalDisks (Get-PhysicalDisk -FriendlyName "FailedDisk")

# Add replacement disk
$replacement = Get-PhysicalDisk -FriendlyName "NewReplacementDisk"
Add-PhysicalDisk -StoragePoolFriendlyName "DataPool" -PhysicalDisks $replacement

# Pool will automatically rebuild mirror
```

---

## Repair Storage Space

```powershell
# Repair a degraded virtual disk
Get-VirtualDisk -FriendlyName "DataMirror" | Repair-VirtualDisk

# Check repair progress
Get-VirtualDisk -FriendlyName "DataMirror" |
  Select-Object FriendlyName, HealthStatus, OperationalStatus,
    @{n='Repair %';e={$_.RepairCompletionStatus}}
```

---

## Summary

Create pool with `New-StoragePool`. Add virtual disk with `New-VirtualDisk -ResiliencySettingName Mirror`. Use Thin provisioning for flexibility. Mirror requires 2 drives minimum. Check health with `Get-VirtualDisk`. Replace failed drives with Remove + Add + automatic rebuild.

## Frequently Asked Questions

### Is Storage Spaces as reliable as hardware RAID?

For home/small office use — yes. For enterprise — hardware RAID controllers have dedicated cache and more consistent performance under load. Storage Spaces mirror is perfectly adequate for file servers and personal data protection.

### Can I add drives of different sizes to a pool?

Yes. Storage Spaces pools mixed drives. However, smallest common size rules for mirror — adding a 4TB drive to a pool with 2TB drives doesn't double your capacity proportionally.

### If Windows fails, can I access the pool from another PC?

Yes — move all drives to another Windows PC. Storage Spaces metadata is on the drives. Import the pool: `Get-StoragePool | Where-Object {$_.IsPrimordial -eq $false} | Set-StoragePool -IsReadOnly $false`.
