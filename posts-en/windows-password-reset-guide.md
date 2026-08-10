---
title: "Reset Windows 10 and 11 Password Without a Disk and Without Logging In"
date: "2026-06-20"
publishDate: "2026-08-15"
updated: "2026-06-20"
description: "How to reset a forgotten Windows 10 and 11 password when you can't log in. Reset via Microsoft account, command line at boot, WinRE and local account methods."
tags: ["windows", "password", "security", "accounts", "fix"]
readTime: 8
translatesUk: "skydannya-parolya-windows-bez-dyska"
---

Forgot your Windows password and can't log in? Here are several methods depending on your account type.

---

## First — Identify Your Account Type

On the login screen: email address = Microsoft account, just a name = local account.

---

## Method 1 — Microsoft Account (Easiest)

1. From another device: **https://account.live.com/password/reset**
2. Enter your Microsoft email
3. Verify via email or SMS
4. Set new password → log into Windows

---

## Method 2 — Security Questions (Local Account)

On login screen: click **"Forgot password?"** → answer security questions → set new password.

---

## Method 3 — WinRE + Command Line

For local accounts without security questions:

### Enter WinRE

- Hold **Shift** + click Restart on login screen
- Or interrupt boot 3 times (force power off during Windows logo)

### Open Command Prompt

```
Troubleshoot → Advanced options → Command Prompt
```

### Replace Utilman with CMD

```cmd
copy C:\Windows\System32\utilman.exe C:\Windows\System32\utilman.exe.bak
copy C:\Windows\System32\cmd.exe C:\Windows\System32\utilman.exe /Y
```

### Reset Password

1. Restart normally to login screen
2. Click the accessibility icon (bottom right corner)
3. Command Prompt opens with SYSTEM privileges

```cmd
net user                          # list users
net user USERNAME NewPassword     # set new password
net user USERNAME ""              # remove password
```

### Restore Utilman (Important!)

After logging in:
```powershell
Copy-Item "C:\Windows\System32\utilman.exe.bak" "C:\Windows\System32\utilman.exe" -Force
```

---

## Method 4 — Another Admin Account

If there's another admin account on the PC:
```powershell
Get-LocalUser | Select-Object Name, Enabled, PasswordRequired
net user USERNAME NewPassword
```

---

## Method 5 — Enable Hidden Administrator Account

```cmd
# Boot from USB, open CMD (Shift+F10)
net user administrator /active:yes

# Restart, log in as "Administrator" (no password)
# Then reset other account passwords from there
```

---

## Forgot PIN (Keep Password)

```
Login screen → "Sign-in options" → select "Password" instead of PIN
```

Or reset PIN:
```
Win + I → Accounts → Sign-in options → PIN → I forgot my PIN
```

---

## Prevent Future Lockouts

- Set up a password hint: Control Panel → User Accounts → Manage your account → Create a password hint
- Add security questions (local account): Settings → Accounts → Sign-in options → Password → Add security questions
- Create a password reset disk (USB): Control Panel → User Accounts → Create a password reset disk

---

## Summary

| Situation | Solution |
|-----------|---------|
| Microsoft account | account.live.com/password/reset |
| Local + security questions | Login screen → "Forgot password?" |
| Local, no questions | WinRE → CMD → net user |
| Another admin exists | Log in → net user |
| Forgot PIN | Sign-in options → I forgot my PIN |

## Frequently Asked Questions

### Will resetting my password delete my files?

No. Password reset never deletes files or applications. Only encrypted files (BitLocker, EFS) may become inaccessible without a recovery key.

### My account is linked to Microsoft but I have no internet — what do I do?

You need internet to reset a Microsoft account password. Try ethernet or a mobile hotspot. If truly impossible, the USB method only works for local accounts.

### Can I reset a password without a USB drive?

Only if you have another admin account on the PC, or can access account.live.com from another device.
