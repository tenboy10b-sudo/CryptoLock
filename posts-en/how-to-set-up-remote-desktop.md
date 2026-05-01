---
title: "How to Set Up Remote Desktop (RDP) in Windows 10 and 11"
date: "2026-04-07"
publishDate: "2026-04-07"
description: "Complete guide to enabling and securing Remote Desktop Protocol (RDP) in Windows: enable RDP, configure firewall, connect from another PC, and secure against attacks."
tags: ["windows", "network", "rdp", "administration", "security"]
readTime: 6
---

Remote Desktop lets you control a Windows PC from anywhere. Here's how to enable it safely.

---

## Enable Remote Desktop

**Via Settings:**
`Settings` → `System` → `Remote Desktop` → toggle **Enable Remote Desktop** → **Confirm**.

**Via PowerShell:**
```powershell
Set-ItemProperty "HKLM:\System\CurrentControlSet\Control\Terminal Server" fDenyTSConnections 0
Enable-NetFirewallRule -DisplayGroup "Remote Desktop"
```

---

## Check Who Has RDP Access

Only Administrators can connect by default. To add other users:

`Settings` → `Remote Desktop` → **Remote Desktop users** → **Add** → type username.

Or via PowerShell:
```powershell
Add-LocalGroupMember -Group "Remote Desktop Users" -Member "Username"
```

---

## Connect from Another PC

`Win + R` → `mstsc` → enter the computer name or IP → **Connect** → enter credentials.

**Save connection settings:**
In Remote Desktop Connection → **Show Options** → **Save As** → saves as `.rdp` file.

---

## Find Your PC's IP Address

```powershell
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notmatch "^127" })[0].IPAddress
```

Or: `ipconfig` → look for IPv4 Address.

---

## Secure RDP Against Attacks

RDP is a common attack target. Apply these protections:

**1. Change default port (3389)**
```powershell
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" -Name PortNumber -Value 33890
New-NetFirewallRule -DisplayName "Custom RDP" -Direction Inbound -Protocol TCP -LocalPort 33890 -Action Allow
```

**2. Enable Network Level Authentication (NLA)**
```powershell
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" -Name UserAuthentication -Value 1
```

**3. Limit connection attempts**
Use GPO or Windows Firewall to block IPs after failed attempts.

**4. Use VPN**
Instead of exposing RDP to the internet, connect via VPN first, then RDP to the internal IP.

---

## RDP Over the Internet

**Option A: VPN** (recommended) — connect VPN, then RDP to local IP.

**Option B: Port forwarding** — forward port 3389 (or custom) on router to PC's local IP. Risky without additional security measures.

---

## Performance Settings

For slow connections, reduce bandwidth usage:

In Remote Desktop Connection → **Experience** → select **Modem (56 Kbps)** or manually uncheck visual effects.

---

## Troubleshoot Connection Issues

```powershell
# Test if RDP port is open
Test-NetConnection -ComputerName 192.168.1.100 -Port 3389

# Check RDP service status
Get-Service TermService

# Check firewall rule
Get-NetFirewallRule -DisplayGroup "Remote Desktop"
```

---

## Summary

Enable RDP via Settings → Remote Desktop. Connect with `mstsc`. For security: enable NLA, use a VPN instead of exposing port 3389 directly to the internet, and consider changing the default port.
