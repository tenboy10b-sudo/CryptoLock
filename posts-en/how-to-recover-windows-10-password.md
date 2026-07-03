---
title: "How to Reset a Forgotten Windows 10 or 11 Password"
date: "2026-05-16"
publishDate: "2026-05-16"
description: "Forgot your Windows 10 or 11 password? Reset it via Microsoft account online, Recovery Mode, or CMD from boot. Works for local and Microsoft accounts."
tags: ["windows", "accounts", "security", "recovery"]
readTime: 5
translatesUk: "skynuti-parol-windows"
---

Forgot your Windows password? The fix depends on whether you use a Microsoft account or a local account.

---

## Method 1: Microsoft Account — Reset Online (Easiest)

If you log in with a Microsoft account (email address):

1. On the login screen click **I forgot my PIN** or try a wrong password → **Forgot password?**
2. Go to: `account.live.com/password/reset`
3. Enter your email → verify via SMS or backup email
4. Set new password → sign in

This works even if you can't get into Windows.

---

## Method 2: Local Account — Security Questions

If you set up security questions when creating the account:

1. On the login screen enter a wrong password
2. Click **Reset password** (appears after failed attempt)
3. Answer security questions
4. Set new password

---

## Method 3: Reset from Another Administrator Account

If another admin account exists on the PC:

```powershell
# List all local users
Get-LocalUser | Select-Object Name, Enabled, PasswordRequired

# Reset password for specific user
$newPass = ConvertTo-SecureString "NewPassword123!" -AsPlainText -Force
Set-LocalUser -Name "Username" -Password $newPass

# Or via CMD (run as admin)
net user Username NewPassword123!
```

---

## Method 4: Recovery Mode + CMD (Local Account)

For local accounts when no other method works:

1. Boot from Windows 11 USB installer
2. On language selection screen: `Shift + F10` → CMD opens
3. Replace Ease of Access button with CMD:

```cmd
move C:\Windows\System32\utilman.exe C:\Windows\System32\utilman.exe.bak
copy C:\Windows\System32\cmd.exe C:\Windows\System32\utilman.exe
```

4. Restart normally, on login screen click Ease of Access button → CMD opens
5. Reset password:

```cmd
net user YourUsername NewPassword123!
```

6. After login, restore the original file:

```cmd
move C:\Windows\System32\utilman.exe.bak C:\Windows\System32\utilman.exe
```

---

## Method 5: Enable Hidden Administrator Account

```cmd
# Boot from USB, open CMD (Shift+F10)
net user administrator /active:yes

# Restart, log in as "Administrator" (no password)
# Then reset other account passwords from there
```

---

## Prevent Future Lockouts

```powershell
# Set up a password hint
# Control Panel → User Accounts → Manage your account → Create a password hint

# Add security questions (local account)
Settings → Accounts → Sign-in options → Password → Add security questions

# Create a password reset disk (USB)
# Control Panel → User Accounts → Create a password reset disk
```

---

## Summary

Microsoft account: reset at account.live.com. Local account with security questions: click Reset password on login screen. If you have admin access: `net user username password`. Without access: boot from USB and use the utilman.exe method.

## Frequently Asked Questions

### Will resetting my password delete my files?

No. Password reset never deletes files or applications. Only encrypted files (BitLocker, EFS) may become inaccessible — which is why you should have a recovery key.

### My account is linked to Microsoft but I have no internet — what do I do?

You need internet to reset a Microsoft account password. If offline, try connecting via ethernet or mobile hotspot. If truly impossible, you need the USB method which only works for local accounts.

### Can I reset a password without a USB drive?

Only if you have another admin account on the PC or can access account.live.com from another device.
