---
title: "How to Configure a Windows File Server with Quotas and Access Control"
date: "2026-06-20"
publishDate: "2026-06-20"
description: "Set up a Windows file server with NTFS permissions, share access control, disk quotas, DFS namespaces and file screening via PowerShell and FSRM."
tags: ["windows", "file-server", "ntfs", "shares", "administration", "powershell"]
readTime: 6
---

A properly configured file server controls who can access what, limits storage usage and audits file activity. Here's how to set it up.

---

## Install File Server Role

```powershell
# Install File Server role with management tools
Install-WindowsFeature FS-FileServer, FS-Resource-Manager `
  -IncludeManagementTools

# Start FSRM service
Start-Service SrmSvc
```

---

## Configure Shares with Proper Permissions

Best practice: Share = Full Control for Authenticated Users, restrict via NTFS.

```powershell
# Create shared folder
$sharePath = "D:\Shares\Finance"
New-Item $sharePath -ItemType Directory -Force

# Create share with full control for Authenticated Users
New-SmbShare -Name "Finance" -Path $sharePath `
  -FullAccess "Authenticated Users"

# Set NTFS permissions (restrict actual access here)
$acl = Get-Acl $sharePath

# Remove inheritance
$acl.SetAccessRuleProtection($true, $false)

# Add explicit permissions
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
  "DOMAIN\Finance-Users", "Modify", "ContainerInherit,ObjectInherit", "None", "Allow"
)
$acl.AddAccessRule($rule)

$rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
  "DOMAIN\Finance-Managers", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow"
)
$acl.AddAccessRule($rule)

$rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
  "Administrators", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow"
)
$acl.AddAccessRule($rule)

Set-Acl $sharePath $acl
```

---

## Configure Disk Quotas (FSRM)

```powershell
# Create quota template (soft limit - warning only)
New-FsrmQuotaTemplate -Name "10GB Warning" `
  -Size 10GB `
  -SoftLimit $true

# Create quota on a path
New-FsrmQuota -Path "D:\Shares\Finance" `
  -Template "10GB Warning"

# Hard quota (enforce limit)
New-FsrmQuotaTemplate -Name "10GB Limit" -Size 10GB

New-FsrmQuota -Path "D:\Shares\HR" -Template "10GB Limit"

# View quota usage
Get-FsrmQuota | Select-Object Path,
  @{n='Used GB';e={[math]::Round($_.Usage/1GB,2)}},
  @{n='Limit GB';e={[math]::Round($_.Size/1GB,2)}},
  @{n='Used %';e={[math]::Round($_.Usage/$_.Size*100)}}
```

---

## File Screening (Block File Types)

```powershell
# Create file screen to block executables and media
New-FsrmFileScreenTemplate -Name "Block EXE and Media" `
  -IncludeGroup @("Executable Files", "Audio and Video Files")

New-FsrmFileScreen -Path "D:\Shares\Finance" `
  -Template "Block EXE and Media"

# List blocked file groups
Get-FsrmFileGroup | Select-Object Name, Members
```

---

## Storage Reports

```powershell
# Generate storage report
New-FsrmStorageReport -Name "Large Files Report" `
  -Namespace @("D:\Shares") `
  -ReportType LargeFiles `
  -ScheduleRunDuration 30 `
  -ReportSaveDirectory "C:\Reports"

Start-FsrmStorageReport -Name "Large Files Report"

# View report results
Get-ChildItem "C:\Reports" | Sort-Object LastWriteTime -Descending | Select-Object -First 5
```

---

## DFS Namespaces (Unified Share Access)

```powershell
# Install DFS role
Install-WindowsFeature FS-DFS-Namespace, FS-DFS-Replication `
  -IncludeManagementTools

# Create DFS namespace
New-DfsnRoot -Path "\\domain.com\Shares" `
  -Type DomainV2 `
  -TargetPath "\\FileServer1\Shares"

# Add link (maps virtual path to real share)
New-DfsnFolder -Path "\\domain.com\Shares\Finance" `
  -TargetPath "\\FileServer1\Finance"

# Users access: \\domain.com\Shares\Finance
# Transparently redirected to: \\FileServer1\Finance
```

---

## Monitor File Access

```powershell
# Enable object access auditing first (see Audit Policy article)
auditpol /set /subcategory:"File System" /success:enable /failure:enable

# Add audit rule to share folder
$acl = Get-Acl $sharePath
$auditRule = New-Object System.Security.AccessControl.FileSystemAuditRule(
  "Everyone", "Delete,DeleteSubdirectoriesAndFiles",
  "ContainerInherit,ObjectInherit", "None", "Success,Failure"
)
$acl.AddAuditRule($auditRule)
Set-Acl $sharePath $acl

# View file access events
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4663} -MaxEvents 20 |
  Select-Object TimeCreated,
    @{n='User';e={$_.Properties[1].Value}},
    @{n='File';e={$_.Properties[6].Value}},
    @{n='Access';e={$_.Properties[8].Value}}
```

---

## Summary

Install FS-FileServer + FS-Resource-Manager. Share = Full Control for Authenticated Users, restrict via NTFS. Use FSRM quotas to limit storage. File screening to block unauthorized file types. DFS namespaces for location-transparent access. Audit file deletions via Security log.

## Frequently Asked Questions

### Should I use share permissions or NTFS permissions for access control?

Both, but rely on NTFS. Set share to Full Control for Authenticated Users and control everything via NTFS. This way access applies whether connecting via network or locally.

### Users can't see their own quota in File Explorer — why?

File Explorer shows free space on the volume, not the FSRM quota. Users need to check quota via the web (if File Server Resource Manager web portal is enabled) or you need to notify them via FSRM email thresholds.

### DFS replication vs simple share — when to use DFS?

DFS when: multiple file servers, disaster recovery, location-based routing, consolidating shares from many servers under one namespace. Simple share when: single server, small environment, no redundancy needed.
