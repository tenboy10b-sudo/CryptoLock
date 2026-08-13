---
title: "How to Manage Local User Accounts in Windows 10 and 11"
date: "2026-05-10"
updated: "2026-08-13"
publishDate: "2026-05-10"
description: "Create, modify and delete local and Microsoft user accounts in Windows 10 and 11. Set passwords, manage groups, switch account types, view login history and control access via PowerShell."
tags: ["windows", "accounts", "security", "administration", "powershell"]
readTime: 7
translatesUk: "keruvannya-lokalnymy-korystuvachamy-windows"
---

Managing local accounts is essential for shared PCs, security hardening and lab environments. Here's everything you need.

---

## List All Local Users

```powershell
# All local accounts with status
Get-LocalUser | Select-Object Name, Enabled, PasswordRequired, PasswordLastSet, LastLogon |
  Format-Table -AutoSize

# Check who's currently logged in
query user
```

---

## Create a New Local Account

```powershell
# Create standard user
$password = ConvertTo-SecureString "SecureP@ssw0rd!" -AsPlainText -Force
New-LocalUser -Name "NewUser" -Password $password `
  -FullName "John Doe" -Description "Standard user account"

# Create user without password (not recommended)
New-LocalUser -Name "GuestUser" -NoPassword

# Create admin account
New-LocalUser -Name "AdminUser" -Password $password
Add-LocalGroupMember -Group "Administrators" -Member "AdminUser"
```

---

## Modify Existing Account

```powershell
# Change password
$newPass = ConvertTo-SecureString "NewP@ssw0rd!" -AsPlainText -Force
Set-LocalUser -Name "Username" -Password $newPass

# Rename account
Rename-LocalUser -Name "OldName" -NewName "NewName"

# Set account description
Set-LocalUser -Name "Username" -Description "IT Department"

# Set password never expires
Set-LocalUser -Name "Username" -PasswordNeverExpires $true

# Disable account
Disable-LocalUser -Name "Username"

# Enable account
Enable-LocalUser -Name "Username"
```

---

## Delete User Account

```powershell
# Remove user (keeps profile folder)
Remove-LocalUser -Name "Username"

# Remove user AND profile
Remove-LocalUser -Name "Username"
$profile = Get-WmiObject Win32_UserProfile | Where-Object {$_.LocalPath -like "*Username*"}
$profile.Delete()
```

---

## Create a Microsoft Account User

`Win + I` → **Accounts** → **Family & other users** → **Add other user** → enter their Microsoft account email → **Finish**. The user signs in with their Microsoft account credentials.

---

## Switch Between Local and Microsoft Account

**Convert Microsoft account to local:** `Win + I` → **Accounts** → **Your info** → **Sign in with a local account instead** → follow the prompts.

**Convert local to Microsoft account:** `Win + I` → **Accounts** → **Your info** → **Sign in with a Microsoft account instead**

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

## Manage Group Membership

```powershell
# View all local groups
Get-LocalGroup | Select-Object Name, Description

# View members of a group
Get-LocalGroupMember -Group "Administrators"
Get-LocalGroupMember -Group "Remote Desktop Users"

# Add user to group
Add-LocalGroupMember -Group "Remote Desktop Users" -Member "Username"

# Remove user from group
Remove-LocalGroupMember -Group "Administrators" -Member "Username"
```

---

## Account Security Settings

```powershell
# Check password policy
net accounts

# Set minimum password length
net accounts /minpwlen:12

# Set account lockout after failed attempts
net accounts /lockoutthreshold:5
net accounts /lockoutduration:30      # minutes
net accounts /lockoutwindow:30        # observation window

# Force password change at next login
net user Username /logonpasswordchg:yes
```

---

## Enable or Disable Built-in Accounts

```powershell
# Disable built-in Guest (should always be disabled)
Disable-LocalUser -Name "Guest"

# Rename built-in Administrator (security hardening)
Rename-LocalUser -Name "Administrator" -NewName "LocalAdmin2026"

# Check if built-in Administrator is enabled
(Get-LocalUser -Name "Administrator").Enabled
```

---

## Create Standard User via GUI

`Win + I` → **Accounts** → **Family & other users** → **Add other user** → **I don't have this person's sign-in information** → **Add a user without a Microsoft account**

---

## Summary

`New-LocalUser` to create, `Set-LocalUser` to modify, `Remove-LocalUser` to delete. Manage groups with `Add/Remove-LocalGroupMember`. Always disable Guest account. Rename built-in Administrator for hardening. Set lockout policy to protect against brute force.

## Frequently Asked Questions

### What's the difference between Administrator and standard user?

Administrator can install software, change system settings and modify other accounts. Standard user is restricted to their own profile — much safer for daily use. Run as standard user, elevate via UAC only when needed.

### Can I have multiple admin accounts?

Yes, but it's a security risk. Best practice: one dedicated admin account (with a strong password, not used for daily browsing), and a standard account for everyday use.

### How do I log in to a different local account without restarting?

`Win + L` to lock → click different account on login screen. Or use `runas /user:AccountName cmd` to run specific apps as another user without switching sessions.
