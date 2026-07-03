---
title: "How to Create and Manage Windows Network Shares via PowerShell"
date: "2026-05-19"
publishDate: "2026-05-19"
description: "Create, configure and manage Windows network shares via PowerShell and GUI. Set permissions, manage access, configure SMB settings and audit share access."
tags: ["windows", "network", "shares", "smb", "administration", "powershell"]
readTime: 5
translatesUk: "spilni-papky-merezha-windows"
---

Network shares let you access folders from other PCs on the network. Here's how to manage them properly with PowerShell.

---

## List Existing Shares

```powershell
# All shares including system shares (C$, ADMIN$)
Get-SmbShare | Select-Object Name, Path, Description, CurrentUsers

# Only user-created shares (not system)
Get-SmbShare | Where-Object {-not $_.Special} |
  Select-Object Name, Path, Description

# Connections to shares
Get-SmbSession | Select-Object ClientComputerName, ClientUserName, NumOpens
```

---

## Create a Network Share

```powershell
# Create share with full access for everyone (adjust permissions after)
New-SmbShare -Name "SharedFiles" -Path "C:\Shared" `
  -Description "Department shared files" `
  -FullAccess "Everyone"

# Create share with specific permissions
New-SmbShare -Name "ProjectDocs" -Path "C:\Projects\Docs" `
  -ReadAccess "Domain\Developers" `
  -ChangeAccess "Domain\ProjectManagers" `
  -FullAccess "Administrators"

# Create hidden share (name ending in $)
New-SmbShare -Name "HiddenShare$" -Path "C:\Hidden" `
  -FullAccess "Administrators"
```

---

## Manage Share Permissions

```powershell
# View current share permissions
Get-SmbShareAccess -Name "SharedFiles"

# Grant read access
Grant-SmbShareAccess -Name "SharedFiles" -AccountName "Domain\User" `
  -AccessRight Read -Force

# Grant full access
Grant-SmbShareAccess -Name "SharedFiles" -AccountName "Domain\Admin" `
  -AccessRight Full -Force

# Revoke access
Revoke-SmbShareAccess -Name "SharedFiles" -AccountName "Domain\User" -Force

# Block specific user
Block-SmbShareAccess -Name "SharedFiles" -AccountName "Domain\BlockedUser" -Force
```

---

## Modify Share Settings

```powershell
# Rename share
Remove-SmbShare -Name "OldName" -Force
New-SmbShare -Name "NewName" -Path "C:\Folder"

# Limit concurrent connections
Set-SmbShare -Name "SharedFiles" -ConcurrentUserLimit 10

# Update description
Set-SmbShare -Name "SharedFiles" -Description "Updated description"
```

---

## Remove a Share

```powershell
# Remove single share
Remove-SmbShare -Name "SharedFiles" -Force

# Remove all non-system shares
Get-SmbShare | Where-Object {-not $_.Special} |
  Remove-SmbShare -Force
```

---

## SMB Security Settings

```powershell
# Check SMB1 status (should be disabled — security risk)
Get-WindowsOptionalFeature -Online -FeatureName SMB1Protocol

# Disable SMB1
Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol -NoRestart

# Enable SMB signing (prevents man-in-the-middle)
Set-SmbServerConfiguration -RequireSecuritySignature $true -Force

# Check SMB encryption
Get-SmbServerConfiguration | Select-Object EncryptData, RejectUnencryptedAccess
```

---

## Monitor Share Access

```powershell
# Who is connected to shares right now
Get-SmbSession | Select-Object ClientComputerName, ClientUserName, SessionId

# Open files on shares
Get-SmbOpenFile | Select-Object ClientComputerName, ClientUserName, Path

# Disconnect a session
Close-SmbSession -SessionId 12345 -Force

# Close specific open file
Close-SmbOpenFile -FileId 67890 -Force
```

---

## Summary

`New-SmbShare` to create. `Get/Grant/Revoke-SmbShareAccess` for permissions. Disable SMB1 for security. Monitor with `Get-SmbSession`. Share permissions + NTFS permissions work together — the more restrictive one applies.

## Frequently Asked Questions

### What's the difference between share permissions and NTFS permissions?

Share permissions apply only to network access. NTFS permissions apply to both local and network access. Best practice: set share to Full Control for Authenticated Users, then restrict via NTFS permissions.

### How do I access a share from another PC?

In File Explorer: type `\\ServerName\ShareName` in the address bar. Or map as a drive letter. The other PC must be on the same network and have the SMB port (445) open.

### Hidden shares (ending in $) — are they really hidden?

From casual browsing yes — they don't appear in `\\Server` network browser. But anyone who knows the exact path `\\Server\Share$` can still connect if they have credentials.
