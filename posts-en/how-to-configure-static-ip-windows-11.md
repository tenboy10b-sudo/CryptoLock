---
title: "How to Set a Static IP Address in Windows 10 and 11"
date: "2026-05-24"
publishDate: "2026-05-24"
description: "Set a static IP address in Windows 10 and 11 via Settings, Control Panel and PowerShell. Configure IP, subnet mask, gateway and DNS without DHCP."
tags: ["windows", "network", "ip", "dns", "administration"]
readTime: 4
---

A static IP ensures your PC always has the same address — useful for servers, RDP, NAS access and network rules.

---

## Method 1: Settings (Windows 11)

`Win + I` → **Network & Internet** → **Wi-Fi** or **Ethernet** → click the connection → **Edit** (next to IP assignment)

- IP assignment: **Manual**
- IPv4: On
- IP address: `192.168.1.100`
- Subnet prefix length: `24` (= 255.255.255.0)
- Gateway: `192.168.1.1`
- Preferred DNS: `1.1.1.1`
- Alternate DNS: `8.8.8.8`
- Save

---

## Method 2: Network Adapter Settings

`Win + R` → `ncpa.cpl` → right-click adapter → **Properties** → **Internet Protocol Version 4 (TCP/IPv4)** → **Properties**

- Select **Use the following IP address**
- Fill in IP, Subnet mask, Default gateway
- Select **Use the following DNS server addresses**
- Preferred: `1.1.1.1`, Alternate: `8.8.8.8`
- OK

---

## Method 3: PowerShell

```powershell
# Find adapter name
Get-NetAdapter | Select-Object Name, InterfaceDescription, Status

# Set static IP
New-NetIPAddress -InterfaceAlias "Ethernet" `
  -IPAddress "192.168.1.100" `
  -PrefixLength 24 `
  -DefaultGateway "192.168.1.1"

# Set DNS
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" `
  -ServerAddresses ("1.1.1.1", "8.8.8.8")

# Verify
Get-NetIPAddress -InterfaceAlias "Ethernet" -AddressFamily IPv4
Get-DnsClientServerAddress -InterfaceAlias "Ethernet"
```

---

## Switch Back to DHCP

```powershell
# Remove static IP and return to DHCP
Set-NetIPInterface -InterfaceAlias "Ethernet" -Dhcp Enabled
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ResetServerAddresses

# Renew DHCP lease
ipconfig /release
ipconfig /renew
```

---

## Check Current IP Configuration

```powershell
# Full IP info
Get-NetIPConfiguration

# Just IPv4 addresses
Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object {$_.PrefixOrigin -ne "WellKnown"} |
  Select-Object InterfaceAlias, IPAddress, PrefixLength, PrefixOrigin

# Quick check
ipconfig
```

---

## Tips for Choosing a Static IP

- Use addresses outside your router's DHCP range to avoid conflicts
- Common DHCP range: `.100` to `.200` → use `.2` to `.99` for static
- Check your router's admin panel for the DHCP range

---

## Summary

Use Settings for quick GUI setup, `ncpa.cpl` for classic interface, or PowerShell for scripted deployment. Always choose an IP outside the router's DHCP range. Use `ipconfig /release` and `/renew` to reset to DHCP.

## Frequently Asked Questions

### Does a static IP slow down my connection?

No. Static vs DHCP only affects how the IP is assigned — not connection speed or latency.

### What's the subnet prefix length for 255.255.255.0?

It is 24 (also written as /24). This is the most common home and office network mask.

### My static IP stopped working after a router reset — why?

Router resets often change the gateway IP (back to 192.168.0.1 or 192.168.1.1). Update the gateway in your static IP settings to match the new router IP.
