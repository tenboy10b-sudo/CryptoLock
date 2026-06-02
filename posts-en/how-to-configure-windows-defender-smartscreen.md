---
title: "How to Configure Windows Defender SmartScreen in Windows 10 and 11"
date: "2026-05-30"
publishDate: "2026-05-30"
description: "Configure Windows Defender SmartScreen to protect against phishing and malware. Manage SmartScreen for Edge, apps, and Explorer via Settings, GPO and PowerShell."
tags: ["windows", "smartscreen", "security", "windows-defender", "powershell"]
readTime: 4
---

SmartScreen checks files and websites against Microsoft's threat database. It blocks known malware and warns about suspicious downloads before they run.

---

## SmartScreen Levels

- **Warn** — shows a warning but lets you proceed
- **Block** — prevents the action entirely
- **Off** — disabled (not recommended)

---

## Configure via Settings

`Win + I` → **Privacy & Security** → **Windows Security** → **App & browser control**

Three separate SmartScreen settings:
- **Check apps and files** — for executable files
- **SmartScreen for Microsoft Edge** — web browsing protection
- **SmartScreen for Microsoft Store apps** — UWP app protection

---

## Configure via PowerShell / Registry

```powershell
# Check current SmartScreen settings
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer" `
  -Name SmartScreenEnabled -EA 0

# Set to Warn (recommended)
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer" `
  -Name "SmartScreenEnabled" -Value "Warn" -Type String

# Set to Block (most secure)
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer" `
  -Name "SmartScreenEnabled" -Value "RequireAdmin" -Type String

# Disable SmartScreen for files (not recommended)
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer" `
  -Name "SmartScreenEnabled" -Value "Off" -Type String
```

---

## Configure via Group Policy

`gpedit.msc` → `Computer Configuration` → `Administrative Templates` → `Windows Components` → `File Explorer`

- **Configure Windows Defender SmartScreen** → Enabled → select level

For Edge SmartScreen:
`Computer Configuration` → `Administrative Templates` → `Microsoft Edge` → **Configure Windows Defender SmartScreen** → Enabled

---

## Bypass SmartScreen Warning (Trusted File)

When you trust a specific file and SmartScreen blocks it:

1. Right-click the file → **Properties**
2. At the bottom: check **Unblock** → Apply → OK

```powershell
# Unblock a specific file
Unblock-File -Path "C:\Downloads\TrustedApp.exe"

# Unblock all files in a folder
Get-ChildItem "C:\Downloads" | Unblock-File
```

---

## Check Zone Identifier (Why SmartScreen Blocks)

SmartScreen uses the Zone.Identifier ADS (Alternate Data Stream) to track downloaded files:

```powershell
# Check if a file has a zone identifier
Get-Item "C:\Downloads\app.exe" -Stream Zone.Identifier -EA 0

# View zone info
Get-Content "C:\Downloads\app.exe" -Stream Zone.Identifier

# Zone 3 = Internet zone (triggers SmartScreen)
# Zone 0 = Local computer
# Zone 1 = Local intranet
# Zone 2 = Trusted Sites
```

---

## Configure Enhanced Phishing Protection

Windows 11 22H2+ has enhanced phishing protection that warns when you type a password into unsafe apps or websites:

```powershell
# Check enhanced phishing protection
(Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" -EA 0).EnableSmartScreen

# Configure via Settings → Privacy & Security → Windows Security → App & browser control
# → Phishing protection
```

---

## Summary

Configure in Windows Security → App & browser control. Use GPO for managed environments. Unblock trusted files with `Unblock-File`. SmartScreen uses Zone.Identifier — Zone 3 (Internet) triggers warnings. Keep SmartScreen at Warn or Block for best protection.

## Frequently Asked Questions

### SmartScreen keeps blocking a file I know is safe — how to permanently allow it?

Right-click → Properties → Unblock. Or use `Unblock-File` in PowerShell. This removes the Zone.Identifier stream that triggers SmartScreen.

### Does SmartScreen send my files to Microsoft?

Only a cryptographic hash (not the file content) is checked against Microsoft's cloud database. If the hash is unknown (new file), a small amount of metadata may be sent to check reputation.

### Should I disable SmartScreen for better performance?

No — SmartScreen has negligible performance impact. The cloud check takes milliseconds. Disabling it removes an important layer of protection against drive-by downloads.
