---
title: "Windows Server 2022 and 2019: Editions, Initial Setup, Active Directory and Key Roles"
date: "2026-08-21"
publishDate: "2026-08-21"
updated: "2026-08-21"
description: "What is Windows Server, how it differs from Windows 10/11, Standard vs Datacenter editions. Initial setup after installation, Active Directory, DNS, DHCP, Hyper-V configuration."
tags: ["windows", "windows-server", "administration", "active-directory", "network"]
readTime: 9
translatesUk: "windows-server-2022-2019-nalashtuvannya"
---

Windows Server is Microsoft's server OS for enterprise environments. While Windows 10/11 is for desktops, Windows Server manages networks, stores data and runs corporate applications.

---

## Windows Server vs Windows 10/11

| | Windows 10/11 | Windows Server |
|-|--------------|----------------|
| Purpose | Desktop | Server, network |
| Active Directory | ❌ | ✅ |
| Hyper-V | Limited | Full |
| RDP connections | 1 | Unlimited (with CALs) |
| Max RAM | 2 TB | 48 TB |

---

## Windows Server 2022 Editions

- **Standard** — up to 2 Hyper-V VMs, all server roles, ~$1000
- **Datacenter** — unlimited VMs, Storage Spaces Direct, ~$6000
- **Essentials** — up to 25 users/50 devices, ~$500

---

## Initial Setup After Installation

```powershell
# Rename computer
Rename-Computer -NewName "SRV-DC01" -Restart

# Set static IP
$adapter = Get-NetAdapter | Where-Object {$_.Status -eq "Up"} | Select-Object -First 1
New-NetIPAddress -InterfaceIndex $adapter.InterfaceIndex `
    -IPAddress "192.168.1.10" -PrefixLength 24 -DefaultGateway "192.168.1.1"
Set-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex `
    -ServerAddresses "192.168.1.10","8.8.8.8"

# Sync time
w32tm /config /manualpeerlist:"time.windows.com" /syncfromflags:manual /reliable:YES /update

# Install updates
Install-Module PSWindowsUpdate -Force
Install-WindowsUpdate -AcceptAll -AutoReboot
```

---

## Active Directory Domain Services

```powershell
# Install AD DS role
Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools

# Configure first domain controller
Install-ADDSForest `
    -DomainName "company.local" `
    -DomainNetbiosName "COMPANY" `
    -InstallDns:$true `
    -SafeModeAdministratorPassword (Read-Host -AsSecureString "DSRM Password") `
    -Force:$true

# Add user
New-ADUser -Name "John Smith" -SamAccountName "j.smith" `
    -AccountPassword (Read-Host -AsSecureString "Password") -Enabled $true

# Add to group
Add-ADGroupMember -Identity "Domain Admins" -Members "j.smith"

# List all users
Get-ADUser -Filter * | Select-Object Name, SamAccountName, Enabled
```

---

## DNS Server

```powershell
# List DNS zones
Get-DnsServerZone

# Add A record
Add-DnsServerResourceRecordA -ZoneName "company.local" `
    -Name "webserver" -IPv4Address "192.168.1.20"

# View all records
Get-DnsServerResourceRecord -ZoneName "company.local"
```

---

## DHCP Server

```powershell
# Install DHCP
Install-WindowsFeature -Name DHCP -IncludeManagementTools
Add-DhcpServerInDC

# Create scope
Add-DhcpServerv4Scope -Name "Main Network" `
    -StartRange "192.168.1.100" -EndRange "192.168.1.200" `
    -SubnetMask "255.255.255.0" -State Active

# Set gateway and DNS for clients
Set-DhcpServerv4OptionValue -ScopeId "192.168.1.0" `
    -Router "192.168.1.1" -DnsServer "192.168.1.10"
```

---

## Hyper-V

```powershell
# Install Hyper-V
Install-WindowsFeature -Name Hyper-V -IncludeManagementTools -Restart

# Create VM
New-VM -Name "Ubuntu-Server" -MemoryStartupBytes 2GB `
    -Generation 2 -NewVHDPath "D:\VMs\Ubuntu.vhdx" -NewVHDSizeBytes 60GB

Start-VM -Name "Ubuntu-Server"
```

---

## Summary

| Task | Command |
|------|---------|
| Install role | `Install-WindowsFeature -Name [role]` |
| Setup AD | `Install-ADDSForest -DomainName domain.local` |
| Add user | `New-ADUser` |
| Configure DNS | `Add-DnsServerResourceRecordA` |
| Configure DHCP | `Add-DhcpServerv4Scope` |
| Hyper-V | `Install-WindowsFeature -Name Hyper-V` |
