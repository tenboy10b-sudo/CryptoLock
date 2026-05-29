---
title: "How to Create Strong Passwords and Manage Them in Windows"
date: "2026-05-05"
publishDate: "2026-05-05"
description: "Strong password principles, why length beats complexity, how to use a password manager, enable 2FA for Windows accounts, and configure password policy via Group Policy."
tags: ["windows", "passwords", "security", "accounts"]
translatesUk: "yak-stvoryt-nadiynyy-parol-windows"
readTime: 5
---

Weak passwords remain the most common cause of account compromise. Here's what actually works and how to set it up in under 10 minutes.

---

## Why "P@ssw0rd" Is a Bad Password

Attackers use dictionaries containing millions of common passwords and their letter-substitution variants. `P@ssw0rd`, `Admin123!`, `Tr0ub4dor&3` — they're all in those lists.

**Real password strength = length × alphabet size.**

A 16-character password with mixed types has ~104 bits of entropy — effectively uncrackable. An 8-character "complex" password has ~52 bits — crackable in days with modern GPU clusters.

---

## Rule 1: Length Beats Complexity

| Password | Entropy | Crack time |
|----------|---------|------------|
| `Dog!` | ~23 bits | instant |
| `correct-horse-battery` | ~77 bits | centuries |
| `xK9#mP2@` (8 chars) | ~52 bits | days |
| `xK9#mP2@vQ7nLr4!` (16) | ~104 bits | billions of years |

Three random words with a separator beat an 8-character "complex" password every time.

---

## Rule 2: Unique Password Per Service

If you reuse passwords and one site gets breached, attackers automatically test that password against email, banking, and social accounts. This is called credential stuffing and it works.

Check if your email appeared in known breaches: **haveibeenpwned.com**

---

## Rule 3: Use a Password Manager

Remembering 50+ unique passwords isn't realistic. A password manager solves this:

**Bitwarden** — free, open source, cloud sync:
```powershell
winget install Bitwarden.Bitwarden
```

**KeePassXC** — free, everything stored locally:
```powershell
winget install KeePassXCTeam.KeePassXC
```

You only need to remember one master password. Everything else is encrypted.

---

## Rule 4: Two-Factor Authentication (2FA)

Even if someone gets your password, they can't log in without the second factor.

**For Microsoft Account:**
`account.microsoft.com` → Security → Two-step verification

**Recommended TOTP app:** Microsoft Authenticator or Authy (not SMS if possible — SIM swapping is a real attack).

---

## Configure Windows Password Policy via GPO

```powershell
# View current password policy
net accounts

# Set minimum password length to 14 via registry (local)
secedit /export /cfg C:\secpol.cfg
# Edit MinimumPasswordLength in the file
secedit /configure /db secedit.sdb /cfg C:\secpol.cfg

# Or via Group Policy (Pro/Enterprise):
# gpedit.msc → Computer Configuration → Windows Settings →
# Security Settings → Account Policies → Password Policy
# Set: Minimum password length = 14, Password complexity = Enabled
```

---

## Check Saved Passwords in Windows

```powershell
# View saved credentials (Windows Credential Manager)
cmdkey /list

# Check for accounts with no password expiry (domain)
Get-ADUser -Filter {PasswordNeverExpires -eq $true} -Properties PasswordNeverExpires |
  Select-Object Name, SamAccountName
```

---

## 🔑 Generate a Strong Password Now

**[→ Password Generator](/tools/password-generator)** — set length and character types, get a cryptographically random password instantly. Generation happens entirely in your browser — nothing is sent to a server.

---

## Summary

Strong password = 16+ characters, unique per service. Store in a password manager (Bitwarden or KeePass). Enable 2FA for critical accounts — email and Microsoft account first. Generate passwords with the [password generator](/tools/password-generator) and let the manager remember them.
