---
title: "How to Set a Static IP Address in Windows 10 and 11"
date: "2026-12-14"
publishDate: "2026-12-14"
description: "Configure a static IP address, subnet mask, gateway and DNS in Windows via Settings, PowerShell, and CMD. Includes subnet calculation and how to revert to DHCP."
tags: ["windows", "network", "settings", "administration"]
readTime: 5
---

A static IP is needed for servers, network printers, VPN access, and whenever you need a reliable fixed address. Here's how to configure it cleanly.

---

## Subnet Basics

Before setting a static IP, understand the subnet your network uses.

| CIDR | Subnet Mask | Usable Hosts | Typical Use |
|------|-------------|-------------|------------|
| /24 | 255.255.255.0 | 254 | Office / home network |
| /16 | 255.255.0.0 | 65,534 | Large organization |
| /30 | 255.255.255.252 | 2 | WAN point-to-point |

`192.168.1.0/24` means network `192.168.1.0`, hosts `.1` through `.254`, broadcast `.255`.

---

## Via Settings (Windows 11)

`Win + I` → **Network & Internet** → **Ethernet** → click your adapter → **Edit** under IP assignment → select **Manual** → enable IPv4:

- **IP address:** 192.168.1.100
- **Subnet mask:** 255.255.255.0 (prefix length: 24)
- **Gateway:** 192.168.1.1
- **DNS:** 1.1.1.1 and 8.8.8.8

---

## Via PowerShell

```powershell
# View current IP configuration
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.PrefixOrigin -ne 'WellKnown'}

# Set static IP
New-NetIPAddress -InterfaceAlias "Ethernet" `
  -IPAddress "192.168.1.100" `
  -PrefixLength 24 `
  -DefaultGateway "192.168.1.1"

# Set DNS servers
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" `
  -ServerAddresses ("1.1.1.1", "8.8.8.8")

# Verify
ipconfig /all
```

---

## Via CMD

```cmd
rem Set static IP
netsh interface ip set address "Ethernet" static 192.168.1.100 255.255.255.0 192.168.1.1

rem Set DNS
netsh interface ip set dns "Ethernet" static 1.1.1.1
netsh interface ip add dns "Ethernet" 8.8.8.8 index=2

rem Verify
ipconfig /all
```

---

## Revert to DHCP

```powershell
# PowerShell
Set-NetIPInterface -InterfaceAlias "Ethernet" -Dhcp Enabled
Remove-NetIPAddress -InterfaceAlias "Ethernet" -Confirm:$false -ErrorAction SilentlyContinue
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ResetServerAddresses
```

```cmd
rem CMD
netsh interface ip set address "Ethernet" dhcp
netsh interface ip set dns "Ethernet" dhcp
```

---

## Test After Configuration

```powershell
# Test gateway reachability
Test-NetConnection -ComputerName 192.168.1.1

# Test internet
Test-NetConnection -ComputerName 1.1.1.1 -Port 80

# Test DNS
Resolve-DnsName google.com

# Full network info
ipconfig /all
```

---

## Calculate Subnet Parameters

Not sure about your subnet range, broadcast address, or valid host range?

**[→ IP/Subnet Calculator](/tools/subnet-calculator)** — enter any IP with CIDR prefix or subnet mask, get network address, broadcast, first/last host, and binary representation instantly.

---

## Summary

For static IP: Settings → Network → Ethernet → Manual, or `New-NetIPAddress` in PowerShell. Standard office subnet: `/24` (255.255.255.0). After setting static IP, test with `Test-NetConnection`. To revert: `Set-NetIPInterface -Dhcp Enabled`. Calculate subnet details with the [Subnet Calculator](/tools/subnet-calculator).
