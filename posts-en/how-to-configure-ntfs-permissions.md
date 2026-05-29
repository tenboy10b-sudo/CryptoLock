---
title: "How to Set NTFS File and Folder Permissions in Windows"
date: "2027-01-08"
publishDate: "2027-01-08"
description: "Set NTFS permissions on files and folders in Windows using GUI and PowerShell. Grant or deny access, configure inheritance, take ownership and fix access denied errors."
tags: ["windows", "ntfs", "security", "administration", "powershell"]
readTime: 6
---

NTFS permissions control who can read, write, or execute files and folders. Here's how to manage them effectively via GUI and PowerShell.

---

## View Current Permissions

**Via GUI:**
Right-click file/folder → **Properties** → **Security** tab → select a user → see permissions

**PowerShell:**
```powershell
# View permissions on a folder
Get-Acl "C:\Folder" | Format-List

# More readable output
(Get-Acl "C:\Folder").Access |
  Select-Object IdentityReference, FileSystemRights, AccessControlType
```

---

## Grant Permissions via GUI

1. Right-click folder → **Properties** → **Security**
2. **Edit** → **Add** → enter username → **Check Names** → OK
3. Select the user → check the permissions you want
4. **Apply** → OK

---

## Grant Permissions via PowerShell

```powershell
# Grant Read access to a user
$acl  = Get-Acl "C:\SharedFolder"
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
  "Domain\Username", "Read", "ContainerInherit,ObjectInherit", "None", "Allow"
)
$acl.SetAccessRule($rule)
Set-Acl "C:\SharedFolder" $acl

# Grant FullControl
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
  "Domain\Username", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow"
)
$acl.SetAccessRule($rule)
Set-Acl "C:\SharedFolder" $acl
```

---

## Common Permission Levels

| Permission | What it allows |
|-----------|---------------|
| Read | View files and folder contents |
| Write | Create files, modify existing ones |
| Read & Execute | Read + run executable files |
| Modify | Read + Write + Delete |
| Full Control | Everything including changing permissions |

---

## Take Ownership of a File

When you get "Access Denied" even as Administrator:

```cmd
REM Take ownership
takeown /f "C:\LockedFile.txt" /r /d y

REM Then grant yourself full control
icacls "C:\LockedFile.txt" /grant Administrators:F /t
```

```powershell
# PowerShell method
$acl = Get-Acl "C:\LockedFolder"
$owner = New-Object System.Security.Principal.NTAccount("Administrators")
$acl.SetOwner($owner)
Set-Acl "C:\LockedFolder" $acl
```

---

## Fix Broken Permissions (Reset to Default)

```cmd
REM Reset permissions on a folder to inherited defaults
icacls "C:\Folder" /reset /t /c /l

REM Reset all permissions on a drive (careful!)
icacls C:\ /reset /t /c /l
```

---

## Block Inheritance

By default, child folders inherit permissions from parents. To break inheritance:

**GUI:** Properties → Security → Advanced → Disable inheritance → Copy or Remove

```powershell
$acl = Get-Acl "C:\SpecialFolder"
$acl.SetAccessRuleProtection($true, $false)  # block inheritance, remove inherited rules
Set-Acl "C:\SpecialFolder" $acl
```

---

## Audit File Access

```powershell
# Enable object access auditing
auditpol /set /subcategory:"File System" /success:enable /failure:enable

# Add audit rule to a folder
$acl       = Get-Acl "C:\SensitiveFolder"
$auditRule = New-Object System.Security.AccessControl.FileSystemAuditRule(
  "Everyone", "Write,Delete", "ContainerInherit,ObjectInherit", "None", "Success,Failure"
)
$acl.AddAuditRule($auditRule)
Set-Acl "C:\SensitiveFolder" $acl
```

Events appear in Security Log as Event ID 4663.

---

## Summary

View with `Get-Acl`. Modify with `Set-Acl` + `FileSystemAccessRule`. For Access Denied issues: use `takeown` then `icacls /grant`. Reset broken permissions with `icacls /reset /t`. Break inheritance when you need a folder to have different permissions from its parent.

## Frequently Asked Questions

### What's the difference between NTFS permissions and Share permissions?

NTFS permissions apply to local and network access. Share permissions only apply when accessing via network. When both are set, the more restrictive one wins. Best practice: set Share to Full Control for Everyone, control access only via NTFS.

### Why do I get Access Denied when logged in as Administrator?

Built-in Administrator is blocked from some protected system folders even with admin rights. Use `takeown` to take ownership first, then grant permissions.

### Do NTFS permissions apply inside ZIP files?

No. NTFS permissions are stored in the NTFS filesystem metadata. ZIP files don't preserve them — if you ZIP and extract a folder, permissions reset to defaults.
