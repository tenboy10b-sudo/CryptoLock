---
title: "How to Use Windows Credential Manager to Store and Manage Passwords"
date: "2026-04-23"
publishDate: "2026-04-23"
description: "Windows Credential Manager stores passwords for websites, network shares, and apps. How to view, add, edit, and back up credentials, and fix credential-related errors."
tags: ["windows", "security", "accounts", "tools"]
readTime: 5
translatesUk: "keruvannya-parolyamy-windows-credential"
---

Windows Credential Manager stores saved passwords for network resources, websites (Internet Explorer/Edge), and apps. It's the system behind "remember my password" for Windows authentication.

---

## Open Credential Manager

`Win + S` → **Credential Manager**

Or: `Control Panel` → **User Accounts** → **Credential Manager**

Two categories:
- **Windows Credentials** — network shares, RDP connections, mapped drives
- **Web Credentials** — Internet Explorer and Edge saved passwords

---

## View Saved Credentials

```powershell
# List all Windows credentials
cmdkey /list

# Output shows target, type, user
```

In the GUI: expand any entry to see the target, username, and last modified date.

---

## Add a Credential

**Via GUI:**
Credential Manager → **Add a Windows credential** → enter:
- Network address or hostname: `\\192.168.1.100` or `server.company.com`
- Username: `domain\user` or just `username`
- Password

**Via PowerShell:**
```powershell
# Add network credential
cmdkey /add:"server.company.com" /user:"username" /pass:"password"

# Add RDP credential
cmdkey /add:"TERMSRV/192.168.1.100" /user:"username" /pass:"password"

# Add generic credential
cmdkey /generic:"MyApp" /user:"apiuser" /pass:"apikey123"
```

---

## Update a Credential

```powershell
# Update password for existing credential
cmdkey /add:"server.company.com" /user:"username" /pass:"newpassword"
# Adding with same target overwrites the existing entry
```

Or in GUI: expand credential → **Edit** → change password → **Save**.

---

## Delete Credentials

```powershell
# Delete specific credential
cmdkey /delete:"server.company.com"
cmdkey /delete:"TERMSRV/192.168.1.100"

# Delete all credentials (use with caution)
cmdkey /list | Where-Object {$_ -match "Target:"} |
  ForEach-Object {
    $target = ($_ -split "Target: ")[1].Trim()
    cmdkey /delete:$target
  }
```

---

## Back Up and Restore Credentials

**Export:**
Credential Manager → **Back up Credentials** → save to `.crd` file → enter password to encrypt

**Restore:**
Credential Manager → **Restore Credentials** → select `.crd` file → enter password

```powershell
# Backup via command line isn't directly supported
# Use the GUI backup for portability
```

---

## Access Credentials Programmatically

```powershell
# Read a stored credential in a script
$credential = Get-StoredCredential -Target "server.company.com"
# Requires CredentialManager module:
Install-Module CredentialManager -Scope CurrentUser -Force

# Store credential for use in scripts
New-StoredCredential -Target "MyAPI" -UserName "user" -Password "pass" -Type Generic

# Use stored credential
$cred = Get-StoredCredential -Target "MyAPI" -AsCredentialObject
Invoke-RestMethod -Uri "https://api.example.com" -Credential $cred
```

---

## Fix Credential-Related Errors

**"The credentials supplied are not sufficient to access this resource":**

```powershell
# Remove cached bad credential and re-enter
cmdkey /delete:"\\server\share"
# Then access the share again and enter correct credentials when prompted
```

**Mapped drive keeps prompting for password:**
```powershell
# Store credential for the server
cmdkey /add:"\\192.168.1.100" /user:"username" /pass:"password"

# Disconnect and reconnect drive
net use Z: /delete
net use Z: \\192.168.1.100\share /persistent:yes
```

**RDP keeps asking for password:**
```powershell
cmdkey /add:"TERMSRV/hostname" /user:"username" /pass:"password"
```

---

## Credential Types

| Type | Used for |
|------|---------|
| Windows | Network shares, mapped drives, workgroup auth |
| Certificate-based | Smart cards, certificate authentication |
| Generic | Third-party apps, API keys, custom apps |
| Domain password | Domain-joined PC credentials |

---

## Security Considerations

Windows Credentials are stored in the Credential Locker — encrypted with DPAPI (Data Protection API) using your account's master key. They're tied to your Windows account:

- Credentials don't transfer automatically when changing PC
- They're backed up with your Microsoft account (if signed in)
- Anyone who can sign into your Windows account can access them via Credential Manager

For sensitive passwords, use a dedicated password manager (Bitwarden, KeePass) instead of Windows Credential Manager.

---


---

## 🔑 Need a strong password?

**[→ Password Generator](/tools/password-generator)** — cryptographically secure passwords generated right in your browser. Nothing is sent to a server.


## Summary

Use `cmdkey /list` to see stored credentials. Add with `cmdkey /add`. Delete with `cmdkey /delete`. For persistent mapped drives and RDP: store credentials with the `TERMSRV/` prefix for RDP. Back up via the GUI before reinstalling Windows — credentials don't carry over automatically.
