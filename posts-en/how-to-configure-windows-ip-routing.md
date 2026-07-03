---
title: "How to Enable IP Routing and Configure Windows as a Router"
date: "2026-06-06"
publishDate: "2026-06-06"
description: "Enable IP routing in Windows to forward packets between network interfaces. Configure Windows as a software router, add static routes and troubleshoot routing issues."
tags: ["windows", "network", "routing", "ip", "administration", "powershell"]
readTime: 5
translatesUk: "ip-marshrutyzatsiya-windows"
---

Windows can forward packets between network interfaces — useful for lab environments, VMs, IoT networks and when a hardware router isn't available.

---

## Enable IP Routing

By default, Windows doesn't forward packets between interfaces:

```powershell
# Enable IP routing (requires Administrator + reboot)
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" `
  -Name "IPEnableRouter" -Value 1 -Type DWord

# Apply without reboot (temporary until next restart)
$routing = [System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties()
Write-Host "Routing enabled: restart required to apply permanently"

# Restart to apply
Restart-Computer
```

---

## View Routing Table

```powershell
# Full routing table
route print

# PowerShell version
Get-NetRoute | Select-Object DestinationPrefix, NextHop, RouteMetric, InterfaceAlias |
  Where-Object {$_.NextHop -ne "::"} | Sort-Object DestinationPrefix

# IPv4 routes only
Get-NetRoute -AddressFamily IPv4 | Where-Object {$_.NextHop -ne "0.0.0.0"} |
  Select-Object DestinationPrefix, NextHop, RouteMetric, InterfaceAlias
```

---

## Add Static Routes

```powershell
# Add persistent static route
New-NetRoute -DestinationPrefix "192.168.10.0/24" `
  -NextHop "192.168.1.1" `
  -InterfaceAlias "Ethernet" `
  -RouteMetric 10

# Add via route command (also persistent with -p)
route add 192.168.10.0 mask 255.255.255.0 192.168.1.1 metric 10 -p

# Add default gateway
route add 0.0.0.0 mask 0.0.0.0 192.168.1.1 metric 5 -p
```

---

## Remove Routes

```powershell
# Remove specific route
Remove-NetRoute -DestinationPrefix "192.168.10.0/24" -Confirm:$false

# Via route command
route delete 192.168.10.0
```

---

## Configure Windows as NAT Router

For sharing an internet connection:

```powershell
# Share internet on Ethernet adapter with VMs/other PCs on second adapter
# Method: Internet Connection Sharing (ICS)

# Enable ICS via netsh
netsh routing ip nat install
netsh routing ip nat add interface "Ethernet" full  # internet-facing
netsh routing ip nat add interface "Ethernet 2" private  # LAN-facing

# Check ICS status
netsh routing ip nat show interface
```

---

## Configure Policy-Based Routing

```powershell
# Add route for specific source subnet
New-NetRoute -DestinationPrefix "0.0.0.0/0" `
  -NextHop "10.0.0.1" `
  -InterfaceAlias "VPN" `
  -RouteMetric 5 `
  -PolicyStore "ActiveStore"

# Route specific destination through specific interface
New-NetRoute -DestinationPrefix "10.0.0.0/8" `
  -NextHop "10.10.10.1" `
  -InterfaceAlias "Ethernet 2"
```

---

## Troubleshoot Routing

```powershell
# Trace route to destination
tracert 192.168.10.5
Test-NetConnection -ComputerName "192.168.10.5" -TraceRoute

# Check if routing is enabled
(Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters").IPEnableRouter

# Test connectivity through specific interface
Test-NetConnection -ComputerName "192.168.10.1" -InformationLevel Detailed

# Check ARP table
arp -a

# View interface statistics
Get-NetAdapterStatistics | Select-Object Name, ReceivedUnicastPackets, SentUnicastPackets
```

---

## Summary

Enable routing with `IPEnableRouter = 1` + reboot. View table with `Get-NetRoute`. Add routes with `New-NetRoute` or `route add -p`. Use ICS for simple internet sharing. Troubleshoot with `tracert` and `Test-NetConnection`.

## Frequently Asked Questions

### Can Windows replace a hardware router for a small office?

For basic routing — yes. For 50+ users, NAT, DHCP, VPN and firewall simultaneously — a dedicated hardware router or pfSense is much more reliable and performant.

### Static routes I added disappeared after reboot — why?

Routes added without `-p` flag (route command) or without `-PolicyStore PersistentStore` are session-only. Use `route add ... -p` or PowerShell `New-NetRoute` which persists by default.

### How do I route VPN traffic for only specific destinations?

Add specific routes through the VPN interface: `New-NetRoute -DestinationPrefix "10.0.0.0/8" -NextHop "VPN_gateway" -InterfaceAlias "VPN"`. This sends 10.x.x.x traffic through VPN while all other traffic uses the default internet route.
