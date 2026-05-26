---
title: "How to Enable and Secure Remote Desktop (RDP) in Windows 10 and 11"
date: "2026-12-27"
publishDate: "2026-12-27"
description: "Enable Remote Desktop in Windows 10 and 11, connect from another PC, change the RDP port, restrict access with firewall rules and limit who can connect."
tags: ["windows", "rdp", "network", "security", "administration"]
readTime: 6
---

Remote Desktop (RDP) lets you control a Windows PC remotely. Here's how to enable it, connect securely, and lock it down so only authorized users can access it.

---

## Enable Remote Desktop

**Via Settings:**

`Win + I` → **System** → **Remote Desktop** → toggle **Enable Remote Desktop** → **Confirm**

**Via PowerShell:**

```powershell
# Enable RDP
Set-ItemProperty -Path "HKLM:\System\CurrentControlSet\Control\Terminal Server" `
  -Name "fDenyTSConnections" -Value 0

# Enable through firewall
Enable-NetFirewallRule -DisplayGroup "Remote Desktop"

# Verify
(Get-ItemProperty "HKLM:\System\CurrentControlSet\Control\Terminal Server").fDenyTSConnections
# 0 = enabled, 1 = disabled
```

---

## Connect to Remote Desktop

**From Windows:**
`Win + R` → `mstsc` → enter IP or hostname → Connect → enter credentials

**Command line:**
```cmd
mstsc /v:192.168.1.100
mstsc /v:192.168.1.100 /fullscreen
mstsc /v:192.168.1.100:3390  # custom port
```

---

## Find the IP Address to Connect To

```powershell
# On the remote PC — find its IP
Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object {$_.PrefixOrigin -ne "WellKnown"} |
  Select-Object IPAddress, InterfaceAlias
```

---

## Who Can Use Remote Desktop

By default, only Administrators can connect. Add other users:

`Win + I` → **System** → **Remote Desktop** → **Remote Desktop users** → **Add**

```powershell
# Add user via PowerShell
Add-LocalGroupMember -Group "Remote Desktop Users" -Member "username"

# View who has access
Get-LocalGroupMember -Group "Remote Desktop Users"
```

---

## Change RDP Port (Security)

The default port 3389 is constantly scanned by attackers. Changing it reduces noise:

```powershell
# Change to custom port (example: 3390)
Set-ItemProperty -Path "HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" `
  -Name "PortNumber" -Value 3390

# Update firewall rule
Remove-NetFirewallRule -DisplayName "Remote Desktop - User Mode (TCP-In)" -EA 0
New-NetFirewallRule -DisplayName "RDP Custom Port" -Direction Inbound `
  -Protocol TCP -LocalPort 3390 -Action Allow

# Restart RDP service
Restart-Service TermService -Force
```

---

## Restrict RDP Access by IP

```powershell
# Allow RDP only from specific IP range
New-NetFirewallRule -DisplayName "RDP from Office" `
  -Direction Inbound -Protocol TCP -LocalPort 3389 `
  -RemoteAddress "192.168.1.0/24" -Action Allow

# Block RDP from everywhere else
New-NetFirewallRule -DisplayName "Block RDP External" `
  -Direction Inbound -Protocol TCP -LocalPort 3389 `
  -RemoteAddress "0.0.0.0/0" -Action Block
```

---

## Enable Network Level Authentication (NLA)

NLA requires authentication before the RDP session opens — more secure:

```powershell
# Enable NLA
Set-ItemProperty -Path "HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" `
  -Name "UserAuthentication" -Value 1
```

Or: `Win + R` → `sysdm.cpl` → **Remote** tab → check **Allow connections only from computers running Remote Desktop with Network Level Authentication**

---

## Monitor Active RDP Sessions

```powershell
# View active sessions
query session

# View who is logged in remotely
qwinsta

# Disconnect a session (get ID from qwinsta)
logoff 2  # replace 2 with session ID
```

---

## Disable RDP When Not Needed

```powershell
# Disable RDP
Set-ItemProperty -Path "HKLM:\System\CurrentControlSet\Control\Terminal Server" `
  -Name "fDenyTSConnections" -Value 1

# Disable firewall rule
Disable-NetFirewallRule -DisplayGroup "Remote Desktop"
```

---

## Summary

Enable via Settings or `Set-ItemProperty fDenyTSConnections = 0`. Connect with `mstsc /v:IP`. Add non-admin users to the **Remote Desktop Users** group. For security: change port from 3389, restrict by IP, enable NLA. Disable RDP when not actively needed.
