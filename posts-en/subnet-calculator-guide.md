---
title: "Subnet Calculator: How to Calculate Subnet Mask, CIDR and IP Range"
date: "2026-06-18"
publishDate: "2026-09-22"
updated: "2026-06-18"
description: "How to calculate subnets, subnet masks and IP ranges. CIDR notation explained, subnet mask to CIDR conversion table, PowerShell subnet calculator and our free online tool."
tags: ["windows", "network", "ip", "subnet", "administration"]
readTime: 7
translatesUk: "subnet-kalkulator-maska-pidmerezhi"
---

Subnetting divides a large network into smaller segments for organization and security. Essential knowledge for anyone configuring networks, servers or routers.

---

## Key Concepts

### Subnet Mask
Defines which part of the IP address is the network and which is the host:
```
255.255.255.0  →  network: first 3 octets, hosts: last octet
255.255.0.0    →  network: first 2 octets, hosts: last 2
```

### CIDR Notation
Compact notation using a slash:
```
192.168.1.0/24   =  255.255.255.0
192.168.0.0/16   =  255.255.0.0
10.0.0.0/8       =  255.0.0.0
```

---

## CIDR Reference Table

| CIDR | Mask | Hosts | Use case |
|------|------|-------|----------|
| /8 | 255.0.0.0 | 16,777,214 | Large networks |
| /16 | 255.255.0.0 | 65,534 | Medium networks |
| /24 | 255.255.255.0 | 254 | Home/office |
| /25 | 255.255.255.128 | 126 | Half of /24 |
| /30 | 255.255.255.252 | 2 | Point-to-point |

---

## Calculate Subnet

For `192.168.1.0/24`:
```
Network address:  192.168.1.0
First host:       192.168.1.1
Last host:        192.168.1.254
Broadcast:        192.168.1.255
Usable hosts:     254
```

**Formula:** Hosts = 2^(32 - CIDR) - 2

---

## Our Online Subnet Calculator

Use our built-in tool:

👉 **[Subnet Calculator — cryptolockua.com/tools/subnet-calculator](/tools/subnet-calculator)**

Enter IP and mask — get network address, broadcast, host range, CIDR notation.

---

## PowerShell Subnet Tools

```powershell
# View network adapters and subnets
Get-NetIPAddress | Where-Object {$_.AddressFamily -eq 'IPv4'} |
    Select-Object InterfaceAlias, IPAddress, PrefixLength

# Convert CIDR to subnet mask
function Convert-CIDRToMask {
    param([int]$CIDR)
    $mask = ([Math]::Pow(2, $CIDR) - 1) * [Math]::Pow(2, 32 - $CIDR)
    $bytes = [BitConverter]::GetBytes([uint32]$mask)
    [Array]::Reverse($bytes)
    ($bytes | ForEach-Object { $_ }) -join '.'
}
Convert-CIDRToMask 24  # 255.255.255.0

# Set static IP
New-NetIPAddress -InterfaceIndex (Get-NetAdapter | Where Status -eq Up | Select -First 1).InterfaceIndex `
    -IPAddress "192.168.1.50" -PrefixLength 24 -DefaultGateway "192.168.1.1"
```

---

## Private IP Ranges (RFC 1918)

| Range | CIDR | Use |
|-------|------|-----|
| 10.0.0.0 – 10.255.255.255 | /8 | Large corporate |
| 172.16.0.0 – 172.31.255.255 | /12 | Medium networks |
| 192.168.0.0 – 192.168.255.255 | /16 | Home routers |

---

## Summary

| Need | Solution |
|------|---------|
| Quick calculation | [/tools/subnet-calculator](/tools/subnet-calculator) |
| Home network | 192.168.1.0/24 (254 hosts) |
| Corporate | 10.0.0.0/8 or /16 |
| Static IP | PowerShell New-NetIPAddress |
