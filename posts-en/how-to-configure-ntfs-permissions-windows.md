---
title: "How to Configure NTFS Permissions in Windows"
date: "2026-03-18"
publishDate: "2026-03-18"
description: "Set and manage NTFS file and folder permissions in Windows using the GUI, icacls command, and PowerShell. Control who can read, write, or execute files on your system."
tags: ["windows", "security", "administration", "tools"]
readTime: 6
---

NTFS permissions control who can access files and folders on Windows drives. They work alongside share permissions for network access and are the foundation of Windows file security.

---

## Understanding NTFS Permissions

Basic permission levels:

| Permission | What it allows |
|-----------|---------------|
| **Full Control** | Read, write, delete, change permissions |
| **Modify** | Read, write, delete (but not change permissions) |
| **Read & Execute** | Open files and run programs |
| **Read** | View file contents and properties |
| **Write** | Create files, write data |
| **List Folder Contents** | View folder contents only |

Permissions are **cumulative** — a user gets the sum of permissions from all groups they belong to. **Deny** always overrides **Allow**.

---

## View Permissions via GUI

Right-click file or folder → **Properties** → **Security** tab

Shows users/groups and their permissions. Click a user to see exactly which permissions are granted.

**Advanced permissions:**
Click **Advanced** → shows inherited permissions, owner, and granular access control entries (ACEs).

---

## Modify Permissions via GUI

Right-click → **Properties** → **Security** → **Edit**

- **Add** — add a new user or group
- Select user → check/uncheck permissions
- **Remove** — remove a user's permissions

**Important:** click **Advanced** → disable **Inheritance** if you want to set custom permissions independent of parent folder.

---

## Manage Permissions with icacls

`icacls` is the command-line tool for NTFS permissions:

```cmd
# View current permissions
icacls "C:\SecureFolder"

# Grant user Read permission
icacls "C:\SecureFolder" /grant "Username:(R)"

# Grant Full Control
icacls "C:\SecureFolder" /grant "Username:(F)"

# Grant Modify to a group
icacls "C:\SecureFolder" /grant "Domain\GroupName:(M)"

# Remove user permissions
icacls "C:\SecureFolder" /remove "Username"

# Deny Write access
icacls "C:\SecureFolder" /deny "Username:(W)"

# Apply to all subfolders and files
icacls "C:\SecureFolder" /grant "Username:(OI)(CI)(R)"
# OI = Object Inherit (files), CI = Container Inherit (subfolders)

# Reset to inherited permissions
icacls "C:\SecureFolder" /reset /T
```

---

## Manage Permissions with PowerShell

```powershell
# Get current ACL
Get-Acl "C:\SecureFolder" | Format-List

# Grant Read to a user
$acl = Get-Acl "C:\SecureFolder"
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
  "Username", "Read", "ContainerInherit,ObjectInherit", "None", "Allow"
)
$acl.SetAccessRule($rule)
Set-Acl "C:\SecureFolder" $acl

# Remove all permissions for a user
$acl = Get-Acl "C:\SecureFolder"
$acl.Access | Where-Object {$_.IdentityReference -like "*Username*"} |
  ForEach-Object {$acl.RemoveAccessRule($_)}
Set-Acl "C:\SecureFolder" $acl

# Copy ACL from one folder to another
$acl = Get-Acl "C:\SourceFolder"
Set-Acl "C:\DestinationFolder" $acl
```

---

## Change Owner

```powershell
# Take ownership of a folder (run as Administrator)
takeown /F "C:\SecureFolder" /R /D Y

# Then grant full control
icacls "C:\SecureFolder" /grant Administrators:F /T
```

---

## Inheritance

By default, files inherit permissions from their parent folder. To break inheritance:

```powershell
$acl = Get-Acl "C:\SecureFolder"

# Disable inheritance, copy existing permissions
$acl.SetAccessRuleProtection($true, $true)

# Disable inheritance, remove inherited permissions
$acl.SetAccessRuleProtection($true, $false)

Set-Acl "C:\SecureFolder" $acl
```

---

## Audit File Access

Log who accesses a file (requires audit policy to be enabled):

```powershell
# Enable object access auditing
auditpol /set /subcategory:"File System" /success:enable /failure:enable

# Set audit on a folder
$acl = Get-Acl "C:\SecureFolder"
$audit = New-Object System.Security.AccessControl.FileSystemAuditRule(
  "Everyone", "Read", "ContainerInherit,ObjectInherit", "None", "Success"
)
$acl.SetAuditRule($audit)
Set-Acl "C:\SecureFolder" $acl
```

Access events appear in Security log as Event ID 4663.

---

## Summary

View permissions: right-click → Properties → Security. Modify via GUI for simple changes, `icacls` for scripting, PowerShell for complex automation. Always prefer **Modify** over **Full Control** for regular users — they don't need to change permissions. Use **Deny** sparingly — it overrides Allow from any group membership.
