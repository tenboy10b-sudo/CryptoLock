---
title: "How to Enable and Secure Remote Desktop (RDP) in Windows 10 and 11"
date: "2026-06-29"
publishDate: "2026-06-29"
description: "Enable Remote Desktop in Windows 10 and 11, configure NLA authentication, change RDP port, restrict access and troubleshoot common connection issues."
tags: ["windows", "rdp", "remote", "security", "administration", "powershell"]
readTime: 5
---

Remote Desktop lets you control a Windows PC from anywhere. Here's how to enable it securely and avoid common misconfigurations.

---

## Enable Remote Desktop

```powershell
# Enable RDP
Set-ItemProperty "HKLM:\System\CurrentControlSet\Control\Terminal Server" `
  -Name "fDenyTSConnections" -Value 0 -Type DWord

# Enable firewall rule
Enable-NetFirewallRule -DisplayGroup "Remote Desktop"

# Verify
(Get-ItemProperty "HKLM:\System\CurrentControlSet\Control\Terminal Server").fDenyTSConnections
# 0 = enabled
```

Or: `Win + I` → **System** → **Remote Desktop** → On

---

## Require Network Level Authentication (NLA)

NLA forces authentication before the session loads — prevents unauthenticated access to the login screen:

```powershell
Set-ItemProperty "HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" `
  -Name "UserAuthentication" -Value 1 -Type DWord
```

---

## Change Default RDP Port (3389)

Changing from 3389 reduces automated scan attacks significantly:

```powershell
# Change to custom port (e.g. 33891)
$newPort = 33891
Set-ItemProperty "HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" `
  -Name "PortNumber" -Value $newPort -Type DWord

# Update firewall rule
Remove-NetFirewallRule -DisplayName "Remote Desktop*" -EA 0
New-NetFirewallRule -DisplayName "RDP Custom Port" `
  -Direction Inbound -Protocol TCP -LocalPort $newPort -Action Allow

Restart-Service TermService -Force
```

---

## Restrict RDP Access to Specific Users

```powershell
# Add user to Remote Desktop Users group
Add-LocalGroupMember -Group "Remote Desktop Users" -Member "Username"

# View who has RDP access
Get-LocalGroupMember -Group "Remote Desktop Users"

# Remove user
Remove-LocalGroupMember -Group "Remote Desktop Users" -Member "Username"
```

---

## Connect to Remote Desktop

```powershell
# Open RDP client
mstsc /v:192.168.1.50

# With custom port
mstsc /v:192.168.1.50:33891

# Save connection to file
cmdkey /add:192.168.1.50 /user:Username /pass:Password
mstsc /v:192.168.1.50 /f  # /f = fullscreen
```

---

## Enable RDP Remotely via PowerShell

```powershell
# Enable RDP on a remote PC
Invoke-Command -ComputerName "RemotePC" -ScriptBlock {
  Set-ItemProperty "HKLM:\System\CurrentControlSet\Control\Terminal Server" `
    -Name "fDenyTSConnections" -Value 0
  Enable-NetFirewallRule -DisplayGroup "Remote Desktop"
}
```

---

## Disable RDP When Not Needed

```powershell
Set-ItemProperty "HKLM:\System\CurrentControlSet\Control\Terminal Server" `
  -Name "fDenyTSConnections" -Value 1
Disable-NetFirewallRule -DisplayGroup "Remote Desktop"
```

---

## Summary

Enable with registry key + firewall rule. Always enable NLA. Change port from 3389. Restrict to specific users via Remote Desktop Users group. Disable when not actively needed.

## Frequently Asked Questions

### RDP connection shows "Your credentials did not work" — how to fix?

Check: 1) Username format — try `COMPUTERNAME\Username` or just `Username`, 2) Account is not locked: `Get-LocalUser Username | Select-Object IsAccountLocked`, 3) Password hasn't expired, 4) User is in Remote Desktop Users group.

### Can I use RDP to connect from Mac or mobile?

Yes — Microsoft Remote Desktop app is free on iOS, Android and macOS. Same server settings apply — just enter the IP and credentials.

### Is RDP safe to expose to the internet?

Not directly on port 3389 — RDP brute force attacks are constant. Options: use a VPN first then RDP over the VPN, or change port + enable NLA + strong passwords + account lockout policy.
