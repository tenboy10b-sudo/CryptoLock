---
title: "How to Set Up a VPN in Windows 10 and 11: Built-in and Manual"
date: "2027-01-10"
publishDate: "2027-01-10"
description: "Set up a VPN connection in Windows 10 and 11 using built-in settings or PowerShell. Configure IKEv2, L2TP and PPTP protocols, split tunneling and auto-connect."
tags: ["windows", "vpn", "network", "security", "powershell"]
readTime: 5
---

Windows has a built-in VPN client that supports IKEv2, L2TP/IPSec, SSTP and PPTP. Here's how to configure it — no third-party software required.

---

## Add a VPN Connection via Settings

`Win + I` → **Network & Internet** → **VPN** → **Add a VPN**

Fill in:
- **VPN provider:** Windows (built-in)
- **Connection name:** Work VPN
- **Server name or address:** vpn.company.com
- **VPN type:** IKEv2 (recommended) or L2TP/IPSec
- **Sign-in info:** Username and password
- **Save**

---

## Add VPN via PowerShell

```powershell
# IKEv2 (most secure, recommended)
Add-VpnConnection -Name "Work VPN" `
  -ServerAddress "vpn.company.com" `
  -TunnelType IKEv2 `
  -AuthenticationMethod MachineCertificate `
  -EncryptionLevel Required `
  -RememberCredential $true

# L2TP with pre-shared key
Add-VpnConnection -Name "Home VPN" `
  -ServerAddress "vpn.example.com" `
  -TunnelType L2TP `
  -L2tpPsk "YourPreSharedKey" `
  -AuthenticationMethod MSChapv2 `
  -RememberCredential $true

# List all VPN connections
Get-VpnConnection
```

---

## Connect and Disconnect

```powershell
# Connect
rasdial "Work VPN" username password

# Or with saved credentials
rasdial "Work VPN"

# Disconnect
rasdial "Work VPN" /disconnect

# Check connection status
Get-VpnConnection -Name "Work VPN" | Select-Object Name, ConnectionStatus
```

---

## Configure Split Tunneling

Split tunneling sends only specific traffic through VPN, not everything:

```powershell
# Enable split tunneling (only routed destinations go through VPN)
Set-VpnConnection -Name "Work VPN" -SplitTunneling $true

# Add specific routes through VPN
Add-VpnConnectionRoute -ConnectionName "Work VPN" -DestinationPrefix "10.0.0.0/8"
Add-VpnConnectionRoute -ConnectionName "Work VPN" -DestinationPrefix "192.168.10.0/24"

# View current routes
Get-VpnConnectionTrigger -ConnectionName "Work VPN"
```

---

## Auto-connect VPN on Login

```powershell
# Create startup script
$script = @"
Start-Sleep -Seconds 10
rasdial 'Work VPN' username password
"@
$script | Out-File "C:\Scripts\vpn-connect.ps1"

# Register as startup task
$action  = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-NonInteractive -File C:\Scripts\vpn-connect.ps1"
$trigger = New-ScheduledTaskTrigger -AtLogOn
Register-ScheduledTask -TaskName "AutoVPN" `
  -Action $action -Trigger $trigger -RunLevel Highest
```

---

## Troubleshoot VPN Connection

```powershell
# Check VPN adapter status
Get-NetAdapter | Where-Object {$_.InterfaceDescription -like "*VPN*" -or $_.InterfaceDescription -like "*WAN*"}

# Check VPN logs
Get-WinEvent -FilterHashtable @{LogName='Application'; ProviderName='RasClient'} -MaxEvents 10 |
  Select-Object TimeCreated, Message

# Test connectivity after connecting
Test-NetConnection -ComputerName "10.0.0.1" -Port 443
```

---

## Remove a VPN Connection

```powershell
Remove-VpnConnection -Name "Work VPN" -Force
```

---

## Summary

Add via Settings → Network → VPN or `Add-VpnConnection` in PowerShell. IKEv2 is the most secure protocol — use it when possible. Enable split tunneling to route only company traffic through VPN. Use `rasdial` to connect/disconnect from scripts.

## Frequently Asked Questions

### What's the difference between IKEv2, L2TP and PPTP?

IKEv2 is fastest and most secure — use it for corporate VPNs. L2TP/IPSec is widely compatible but slightly slower. PPTP is obsolete and insecure — avoid it. SSTP works through firewalls that block other protocols.

### Why does my internet stop working after connecting to VPN?

This happens when split tunneling is disabled — all traffic routes through VPN. Either enable split tunneling, or check with your admin if the VPN server has internet access configured.

### Can I use Windows built-in VPN with commercial providers (NordVPN, ExpressVPN)?

Most commercial VPN providers have their own apps which are easier to configure. The built-in client works with IKEv2-compatible services but requires manual server configuration.
