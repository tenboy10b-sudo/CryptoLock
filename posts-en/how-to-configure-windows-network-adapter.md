---
title: "How to Configure Network Adapter Settings in Windows 10 and 11"
date: "2026-06-16"
publishDate: "2026-06-16"
description: "Configure network adapter settings in Windows. Set IPv4, IPv6, DNS, MTU, duplex and speed. Disable unused adapters and troubleshoot adapter issues via PowerShell."
tags: ["windows", "network", "adapter", "ip", "administration", "powershell"]
readTime: 5
---

Network adapter settings control how your PC communicates on the network. Here's how to configure everything — from IP addresses to advanced NIC settings.

---

## View Network Adapters

```powershell
# All adapters with status
Get-NetAdapter | Select-Object Name, InterfaceDescription, Status, MacAddress, LinkSpeed

# Only connected adapters
Get-NetAdapter | Where-Object {$_.Status -eq "Up"}

# Detailed adapter info
Get-NetAdapterAdvancedProperty -Name "Ethernet" | Select-Object DisplayName, DisplayValue
```

---

## Enable and Disable Adapters

```powershell
# Disable adapter (e.g., Wi-Fi when using Ethernet)
Disable-NetAdapter -Name "Wi-Fi" -Confirm:$false

# Enable adapter
Enable-NetAdapter -Name "Wi-Fi" -Confirm:$false

# Restart adapter (fixes many connectivity issues)
Restart-NetAdapter -Name "Ethernet"
```

---

## Configure IP Address

```powershell
# Get adapter name
$adapterName = (Get-NetAdapter | Where-Object {$_.Status -eq "Up"}).Name

# Set static IP
New-NetIPAddress -InterfaceAlias $adapterName `
  -IPAddress "192.168.1.50" `
  -PrefixLength 24 `
  -DefaultGateway "192.168.1.1"

# Set DNS
Set-DnsClientServerAddress -InterfaceAlias $adapterName `
  -ServerAddresses ("1.1.1.1", "8.8.8.8")

# Switch to DHCP
Set-NetIPInterface -InterfaceAlias $adapterName -Dhcp Enabled
Set-DnsClientServerAddress -InterfaceAlias $adapterName -ResetServerAddresses

# Verify
Get-NetIPConfiguration -InterfaceAlias $adapterName
```

---

## Configure Advanced Adapter Properties

```powershell
# View all advanced properties
Get-NetAdapterAdvancedProperty -Name "Ethernet"

# Set duplex and speed (Full Duplex, 1Gbps)
Set-NetAdapterAdvancedProperty -Name "Ethernet" `
  -DisplayName "Speed & Duplex" -DisplayValue "1 Gbps Full Duplex"

# Disable Energy Efficient Ethernet (prevents random disconnects)
Set-NetAdapterAdvancedProperty -Name "Ethernet" `
  -DisplayName "Energy Efficient Ethernet" -DisplayValue "Disabled"

# Disable Wake on LAN (if not needed)
Set-NetAdapterAdvancedProperty -Name "Ethernet" `
  -DisplayName "Wake on Magic Packet" -DisplayValue "Disabled"
```

---

## Configure MTU

```powershell
# Check current MTU
Get-NetIPInterface -InterfaceAlias "Ethernet" | Select-Object InterfaceAlias, NlMtu

# Set MTU (1500 = standard, 9000 = jumbo frames for LAN)
Set-NetIPInterface -InterfaceAlias "Ethernet" -NlMtuBytes 1500

# Test MTU (find maximum without fragmentation)
ping 8.8.8.8 -f -l 1472  # standard
ping 8.8.8.8 -f -l 8972  # jumbo
```

---

## Disable IPv6

```powershell
# Disable IPv6 on specific adapter
Disable-NetAdapterBinding -Name "Ethernet" -ComponentID "ms_tcpip6"

# Disable IPv6 system-wide via registry
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip6\Parameters" `
  -Name "DisabledComponents" -Value 0xFF -Type DWord

# Re-enable IPv6
Enable-NetAdapterBinding -Name "Ethernet" -ComponentID "ms_tcpip6"
```

---

## Network Adapter Teaming (Load Balancing)

```powershell
# Create NIC team from two adapters
New-NetLbfoTeam -Name "NICTeam" `
  -TeamMembers "Ethernet", "Ethernet 2" `
  -TeamingMode SwitchIndependent `
  -LoadBalancingAlgorithm Dynamic

# View teams
Get-NetLbfoTeam
```

---

## Troubleshoot Adapter Issues

```powershell
# Check for adapter errors
Get-NetAdapterStatistics | Select-Object Name, ReceivedErrors, SentErrors, ReceivedDiscards

# View adapter event log
Get-WinEvent -FilterHashtable @{LogName='System'; ProviderName='e1iexpress'} -MaxEvents 10 -EA 0

# Reset TCP/IP stack
netsh int ip reset
netsh winsock reset
ipconfig /release
ipconfig /renew
```

---

## Summary

View with `Get-NetAdapter`. Configure IP with `New-NetIPAddress`. Set DNS with `Set-DnsClientServerAddress`. Advanced settings via `Set-NetAdapterAdvancedProperty`. Disable unused adapters to reduce attack surface. Reset with `netsh int ip reset`.

## Frequently Asked Questions

### My adapter shows "Unidentified Network" — how to fix?

Usually missing default gateway or DNS mismatch. Check: `Get-NetIPConfiguration`. Set correct gateway and DNS. Also check if DHCP server is reachable.

### Should I disable IPv6?

Only if your network doesn't use it and you're troubleshooting connectivity issues. Modern Windows and applications use IPv6 internally for loopback. Disabling it rarely helps and can break some features.

### Network adapter disappeared after Windows Update?

Device Manager → View → Show hidden devices. If visible but greyed out: right-click → Enable. If missing entirely: run `pnputil /scan-devices` to trigger device detection.
