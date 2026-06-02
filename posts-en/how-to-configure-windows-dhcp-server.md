---
title: "How to Configure Windows as a DHCP Server"
date: "2026-06-12"
publishDate: "2026-06-12"
description: "Set up Windows Server DHCP role to assign IP addresses automatically. Create scopes, reservations, configure options and manage leases via PowerShell."
tags: ["windows", "dhcp", "network", "server", "administration", "powershell"]
readTime: 6
---

Windows Server includes a full DHCP server role. Here's how to install it, create scopes and manage it entirely from PowerShell.

---

## Install DHCP Server Role (Windows Server)

```powershell
# Install DHCP role with management tools
Install-WindowsFeature DHCP -IncludeManagementTools

# Post-install: authorize the server in Active Directory
Add-DhcpServerInDC -DnsName "DHCPServer.domain.com" -IPAddress 192.168.1.10

# Verify
Get-DhcpServerInDC
```

---

## Create a DHCP Scope

```powershell
# Add scope (address pool)
Add-DhcpServerv4Scope -Name "Office LAN" `
  -StartRange "192.168.1.100" `
  -EndRange "192.168.1.200" `
  -SubnetMask "255.255.255.0" `
  -State Active `
  -LeaseDuration "8.00:00:00"  # 8 days

# Configure scope options
Set-DhcpServerv4OptionValue -ScopeId "192.168.1.0" `
  -Router "192.168.1.1" `        # default gateway
  -DnsServer "192.168.1.2","8.8.8.8" `
  -DomainName "company.local"

# Verify
Get-DhcpServerv4Scope
```

---

## Exclusion Ranges (Reserve IPs for Static Devices)

```powershell
# Exclude a range from DHCP assignment
Add-DhcpServerv4ExclusionRange -ScopeId "192.168.1.0" `
  -StartRange "192.168.1.100" `
  -EndRange "192.168.1.110"

# View exclusions
Get-DhcpServerv4ExclusionRange -ScopeId "192.168.1.0"
```

---

## IP Reservations (Always Same IP for Specific Device)

```powershell
# Reserve IP for a specific MAC address
Add-DhcpServerv4Reservation -ScopeId "192.168.1.0" `
  -IPAddress "192.168.1.50" `
  -ClientId "AA-BB-CC-DD-EE-FF" `
  -Name "Printer-1" `
  -Description "Office LaserJet"

# View all reservations
Get-DhcpServerv4Reservation -ScopeId "192.168.1.0"

# Remove reservation
Remove-DhcpServerv4Reservation -ScopeId "192.168.1.0" -IPAddress "192.168.1.50"
```

---

## View Active Leases

```powershell
# All current leases
Get-DhcpServerv4Lease -ScopeId "192.168.1.0" |
  Select-Object IPAddress, ClientId, HostName, LeaseExpiryTime, AddressState

# Find device by hostname
Get-DhcpServerv4Lease -ScopeId "192.168.1.0" | Where-Object {$_.HostName -like "*printer*"}

# Find by IP
Get-DhcpServerv4Lease -ScopeId "192.168.1.0" -IPAddress "192.168.1.105"
```

---

## Manage Scopes

```powershell
# Disable a scope (stops assigning from it)
Set-DhcpServerv4Scope -ScopeId "192.168.1.0" -State InActive

# Enable scope
Set-DhcpServerv4Scope -ScopeId "192.168.1.0" -State Active

# Delete scope and all leases
Remove-DhcpServerv4Scope -ScopeId "192.168.1.0" -Force

# View all scopes with statistics
Get-DhcpServerv4ScopeStatistics | Select-Object ScopeId, Free, InUse, Reserved
```

---

## DHCP Failover (High Availability)

```powershell
# Configure DHCP failover between two servers
Add-DhcpServerv4Failover -Name "DHCPFailover" `
  -PartnerServer "DHCPServer2" `
  -ScopeId "192.168.1.0" `
  -Mode HotStandby `
  -ReservePercent 5 `
  -MaxClientLeadTime "00:01:00" `
  -SharedSecret "P@ssw0rd123"
```

---

## Backup and Restore DHCP Database

```powershell
# Backup DHCP configuration
Backup-DhcpServer -Path "C:\DHCP-Backup"

# Restore on same or new server
Restore-DhcpServer -Path "C:\DHCP-Backup"
```

---

## Summary

Install role with `Install-WindowsFeature DHCP`. Create scope with `Add-DhcpServerv4Scope` and configure gateway/DNS with `Set-DhcpServerv4OptionValue`. Use reservations for printers and servers. View leases with `Get-DhcpServerv4Lease`. Backup with `Backup-DhcpServer`.

## Frequently Asked Questions

### Do I need Windows Server for DHCP or will Windows 10/11 work?

Windows 10/11 doesn't include the full DHCP Server role. For small home labs, use a router's built-in DHCP. For production, use Windows Server, pfSense, or a dedicated DHCP appliance.

### How do I find which device has a specific IP on the network?

```powershell
Get-DhcpServerv4Lease -ScopeId "192.168.1.0" | Where-Object {$_.IPAddress -eq "192.168.1.105"}
```
Shows hostname and MAC address for that IP.

### DHCP scope is full and devices can't connect — how to expand it?

```powershell
# Extend the scope range
Set-DhcpServerv4Scope -ScopeId "192.168.1.0" -EndRange "192.168.1.250"
```
