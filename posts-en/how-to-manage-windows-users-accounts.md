---
title: "How to Manage User Accounts in Windows 10 and 11"
date: "2026-05-23"
publishDate: "2026-05-23"
description: "Create, modify, and delete local and Microsoft user accounts in Windows. Set passwords, change account types, and manage permissions via Settings, CMD, and PowerShell."
tags: ["windows", "accounts", "security", "administration"]
readTime: 6
---

Windows user account management covers more than just adding users. Here's how to do it properly — from basic setup to command-line control.

---

## Create a Local Account

**Settings:**
`Win + I` → **Accounts** → **Family & other users** → **Add other user** → **I don't have this person's sign-in information** → **Add a user without a Microsoft account** → enter username and password.

**PowerShell:**
```powershell
$password = ConvertTo-SecureString "SecurePass123!" -AsPlainText -Force
New-LocalUser -Name "john" -Password $password -FullName "John Smith" -Description "Standard user"
```

---

## Create a Microsoft Account User

`Win + I` → **Accounts** → **Family & other users** → **Add other user** → enter their Microsoft account email → **Finish**

The user signs in with their Microsoft account credentials.

---

## Change Account Type (Standard ↔ Administrator)

**Settings:**
`Win + I` → **Accounts** → **Family & other users** → click the account → **Change account type** → select **Administrator** or **Standard User**

**PowerShell:**
```powershell
# Promote to Administrator
Add-LocalGroupMember -Group "Administrators" -Member "john"

# Demote to Standard User
Remove-LocalGroupMember -Group "Administrators" -Member "john"
```

---

## Set or Change Password

```powershell
# Set password for another user (run as admin)
$password = ConvertTo-SecureString "NewPass456!" -AsPlainText -Force
Set-LocalUser -Name "john" -Password $password

# Force password change at next login
net user john /logonpasswordchg:yes

# Set password to never expire
Set-LocalUser -Name "john" -PasswordNeverExpires $true
```

---

## List All User Accounts

```powershell
# All local users
Get-LocalUser | Select-Object Name, Enabled, LastLogon, PasswordRequired

# Members of Administrators group
Get-LocalGroupMember -Group "Administrators"

# Currently logged in users
query user
```

---

## Disable and Enable Accounts

```powershell
# Disable (keeps the account, blocks login)
Disable-LocalUser -Name "john"

# Enable
Enable-LocalUser -Name "john"

# Via net user
net user john /active:no
net user john /active:yes
```

Disabling is safer than deleting — preserves the account's files and settings.

---

## Delete an Account

**Settings:**
`Win + I` → **Accounts** → **Family & other users** → click account → **Remove** → choose whether to keep or delete files.

**PowerShell:**
```powershell
Remove-LocalUser -Name "john"
```

Note: You can't delete an account that's currently logged in.

---

## Switch Between Local and Microsoft Account

**Convert Microsoft account to local:**
`Win + I` → **Accounts** → **Your info** → **Sign in with a local account instead** → follow the prompts.

**Convert local to Microsoft account:**
`Win + I` → **Accounts** → **Your info** → **Sign in with a Microsoft account instead**

---

## Enable the Built-in Administrator Account

Windows has a hidden built-in Administrator account disabled by default. Useful for recovery situations.

```powershell
# Enable
net user Administrator /active:yes

# Set a password
net user Administrator "AdminPass789!"

# Disable when done
net user Administrator /active:no
```

---

## Rename a User Account

```powershell
Rename-LocalUser -Name "OldName" -NewName "NewName"
```

Or: `Win + R` → `lusrmgr.msc` → **Users** → right-click → **Rename**

Note: This renames the account but not the profile folder (`C:\Users\OldName`). The folder name stays the same.

---

## View Login History

```powershell
# Successful logins
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4624} -MaxEvents 20 |
  Select-Object TimeCreated, @{n='User';e={$_.Properties[5].Value}}, @{n='LogonType';e={$_.Properties[8].Value}}

# Failed login attempts
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625} -MaxEvents 20 |
  Select-Object TimeCreated, @{n='User';e={$_.Properties[5].Value}}
```

Logon type 2 = interactive (local), type 3 = network, type 10 = remote.

---

## Summary

For daily use: create a standard account and use it instead of your admin account. Use PowerShell for bulk operations or scripted setup. Check login history if you suspect unauthorized access.
