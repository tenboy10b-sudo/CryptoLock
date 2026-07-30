---
title: "How to Enable, Disable, and Troubleshoot IPv6 in Windows"
date: "2026-04-21"
publishDate: "2026-04-21"
description: "IPv6 is enabled by default in Windows but can cause network issues on some setups. How to check your IPv6 status, disable it selectively, and fix IPv6-related connectivity problems."
tags: ["windows", "network", "troubleshooting", "settings"]
readTime: 5
---

IPv6 is the future of networking, but it sometimes causes issues on home networks where routers or ISPs don't fully support it. Here's how to manage it.

---

## Check IPv6 Status

```powershell
# View all IP addresses including IPv6
Get-NetIPAddress -AddressFamily IPv6 |
  Where-Object {$_.PrefixOrigin -ne 'WellKnown'} |
  Select-Object InterfaceAlias, IPAddress, PrefixLength, PrefixOrigin

# Check if IPv6 is enabled on each adapter
Get-NetAdapterBinding | Where-Object {$_.ComponentID -eq 'ms_tcpip6'} |
  Select-Object Name, Enabled

# Test IPv6 connectivity
Test-NetConnection -ComputerName ipv6.google.com
```

---

## Disable IPv6 on a Specific Adapter

If one adapter causes issues:

```powershell
# Disable IPv6 on Wi-Fi adapter
Disable-NetAdapterBinding -Name "Wi-Fi" -ComponentID ms_tcpip6

# Re-enable
Enable-NetAdapterBinding -Name "Wi-Fi" -ComponentID ms_tcpip6

# Check status
(Get-NetAdapterBinding -Name "Wi-Fi" -ComponentID ms_tcpip6).Enabled
```

---

## Disable IPv6 System-Wide (Registry)

```powershell
# Disable IPv6 on all adapters and loopback
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip6\Parameters" `
  -Name "DisabledComponents" -Value 0xFF -Type DWord

# Disable only on non-loopback adapters
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip6\Parameters" `
  -Name "DisabledComponents" -Value 0x10 -Type DWord
```

Restart required for registry changes to take effect.

**Re-enable:**
```powershell
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip6\Parameters" `
  -Name "DisabledComponents" -Value 0x00 -Type DWord
```

---

## Fix Common IPv6 Issues

**Slow browsing with IPv6 enabled:**

Some ISPs route IPv6 traffic poorly, causing slow DNS lookups:

```powershell
# Check if DNS prefers IPv6
Resolve-DnsName google.com | Select-Object Name, Type, IPAddress
```

If IPv6 addresses appear first and browsing is slow, disable IPv6 or set DNS preference:

```powershell
# Prefer IPv4 over IPv6
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip6\Parameters" `
  -Name "DisabledComponents" -Value 0x20 -Type DWord
```

---

**IPv6 link-local address but no global address:**

This means your router isn't assigning global IPv6 addresses (no DHCPv6 or Router Advertisement). Normal for IPv4-only home networks.

```powershell
# Check for global IPv6 addresses (2xxx or 3xxx prefix)
Get-NetIPAddress -AddressFamily IPv6 |
  Where-Object {$_.IPAddress -match '^[23]'}
```

If none — your network doesn't have IPv6. Not a problem for most users.

---

**IPv6 causing VPN issues:**

Many VPN clients only tunnel IPv4, leaving IPv6 traffic unencrypted (IPv6 leak):

```powershell
# Check for IPv6 leak when VPN is connected
Test-NetConnection -ComputerName ipv6leak.com -Port 80
```

Fix: disable IPv6 while using VPN, or use a VPN client that handles IPv6.

---

## Configure IPv6 DNS Servers

```powershell
# Set IPv6 DNS (Cloudflare)
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" `
  -ServerAddresses ("1.1.1.1", "1.0.0.1", "2606:4700:4700::1111", "2606:4700:4700::1001")

# Cloudflare IPv6 DNS addresses:
# 2606:4700:4700::1111
# 2606:4700:4700::1001

# Google IPv6 DNS:
# 2001:4860:4860::8888
# 2001:4860:4860::8844
```

---

## Test IPv6 Connectivity

```powershell
# Ping IPv6 address
ping -6 ipv6.google.com

# Traceroute over IPv6
tracert -6 ipv6.google.com

# Check which interface would be used for IPv6
Find-NetRoute -RemoteIPAddress "2001:4860:4860::8888" | Select-Object InterfaceAlias, NextHop
```

---

## IPv6 and Windows Firewall

Windows Firewall rules apply separately to IPv4 and IPv6. If you block traffic for one protocol, check the rule also covers the other:

```powershell
# View firewall rules and which protocols they apply to
Get-NetFirewallRule | Where-Object {$_.Enabled -eq 'True'} |
  Get-NetFirewallAddressFilter |
  Where-Object {$_.LocalAddress -like "*:*"} |  # IPv6 addresses contain colons
  Select-Object -First 10
```

---


---

## 🔍 Not sure what a Windows error code means?

If Windows shows a code like `0x80070005`, `0x80070002` or `0xC000021A` — use this free tool:

**[→ Windows Error Decoder](/tools/windows-error-decoder)** — enter the code and instantly find out what it means and how to fix it.


## Summary

IPv6 is safe to leave enabled if your network supports it. Disable on a specific adapter with `Disable-NetAdapterBinding` if it causes issues for that connection. For slow browsing: set preference to IPv4 first (`DisabledComponents = 0x20`). For VPN users: disable IPv6 to prevent leaks. Check IPv6 connectivity with `Test-NetConnection -ComputerName ipv6.google.com`.
