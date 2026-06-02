---
title: "How to Set Up a Windows VPN Server Using PPTP and SSTP"
date: "2026-05-22"
publishDate: "2026-05-22"
description: "Set up a Windows VPN server using RRAS (Routing and Remote Access). Configure PPTP or SSTP, manage user access and connect clients to your own Windows VPN."
tags: ["windows", "vpn", "network", "server", "administration"]
readTime: 6
---

Windows Server and even Windows 10/11 Pro can act as a VPN server using the built-in RRAS role. Here's how to set it up.

---

## Requirements

- Windows Server (any version) OR Windows 10/11 Pro
- A static IP or dynamic DNS for the server
- Port forwarding on your router (1723 for PPTP, 443 for SSTP)
- Administrator access

---

## Enable RRAS (Routing and Remote Access)

```powershell
# On Windows Server: install RRAS role
Install-WindowsFeature Routing -IncludeManagementTools
Install-WindowsFeature DirectAccess-VPN -IncludeManagementTools

# Open RRAS management console
mmc
# Add snap-in: Routing and Remote Access
```

For Windows 10/11:
```powershell
# RRAS is built-in, just needs configuration
# Control Panel → Administrative Tools → Routing and Remote Access
```

---

## Configure PPTP VPN Server

```powershell
# Enable RRAS via PowerShell (Windows Server)
$vpnConfig = @{
  VpnType = "Pptp"
  IPAddress = "10.10.10.1"
  IPAddressRange = @{Start="10.10.10.2"; End="10.10.10.254"}
  AuthenticationMethod = @("MSChapv2")
}

# Or via GUI:
# Right-click server → Configure and Enable Routing and Remote Access
# → Custom Configuration → VPN access
```

**Configure IP pool for VPN clients:**
`RRAS` → right-click server → **Properties** → **IPv4** tab → **Static address pool** → Add range

---

## Configure SSTP VPN (More Secure, Uses HTTPS Port)

```powershell
# Install SSTP certificate
# Requires SSL certificate for the server's domain

# Configure SSTP
netsh ras set sstp-ssl-cert hash=<certificate_thumbprint>

# Set SSTP to use certificate
Set-VpnServerConfiguration -TunnelType Sstp -SstpConfigType Auto
```

---

## Allow VPN Users

```powershell
# Grant VPN access to specific user
$user = "VPNUser"
Set-LocalUser -Name $user -UserMayNotChangePassword $false

# Enable dial-in permission (required for RRAS)
# Local users: Computer Management → Users → right-click → Properties → Dial-in → Allow access

# Via PowerShell with ADSI
$objUser = [ADSI]"WinNT://$env:COMPUTERNAME/$user"
$objUser.UserFlags.value = $objUser.UserFlags.value -bor 0x200000
$objUser.CommitChanges()
```

---

## Open Required Firewall Ports

```powershell
# PPTP
New-NetFirewallRule -DisplayName "PPTP VPN" `
  -Direction Inbound -Protocol TCP -LocalPort 1723 -Action Allow

# PPTP GRE protocol
New-NetFirewallRule -DisplayName "PPTP GRE" `
  -Direction Inbound -Protocol 47 -Action Allow

# SSTP
New-NetFirewallRule -DisplayName "SSTP VPN" `
  -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

---

## Monitor VPN Connections

```powershell
# Active VPN connections
Get-VpnConnection -AllUserConnection

# RRAS connections
Get-RemoteAccessConnectionStatistics

# Active sessions (Server)
Get-RasConnection -AllUsers | Select-Object ConnectionDuration, UserName, ClientIPAddress
```

---

## Client Configuration

On the client PC:
```powershell
# Add PPTP connection
Add-VpnConnection -Name "Home VPN" `
  -ServerAddress "your.server.ip.or.hostname" `
  -TunnelType Pptp `
  -AuthenticationMethod MSChapv2 `
  -RememberCredential $true

# Connect
rasdial "Home VPN" username password
```

---

## Summary

Enable RRAS, configure IP pool, set user dial-in permissions, open firewall ports. PPTP is easiest to set up but less secure. SSTP is better but requires a valid SSL certificate. For personal use, WireGuard or a commercial VPN service is often simpler.

## Frequently Asked Questions

### Is PPTP safe to use in 2026?

PPTP has known cryptographic weaknesses and is considered deprecated. Use SSTP or IKEv2 for production environments. PPTP is acceptable only for internal trusted networks where traffic snooping is not a concern.

### Do I need Windows Server or will Windows 10 work?

Windows 10/11 Pro supports 1 VPN connection at a time (not officially supported for server use). Windows Server has no connection limit. For home use, 1 connection is fine.

### Can I use WireGuard instead?

Yes — and it's recommended. WireGuard for Windows is free, modern and faster. Download from wireguard.com. Much simpler to set up than RRAS.
