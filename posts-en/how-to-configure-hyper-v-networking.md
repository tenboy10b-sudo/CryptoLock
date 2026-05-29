---
title: "How to Configure Hyper-V Network Settings for Virtual Machines"
date: "2026-04-07"
publishDate: "2026-04-07"
description: "Set up networking for Hyper-V virtual machines: External, Internal, and Private switches explained. Configure NAT, static IPs, and fix common network issues in VMs."
tags: ["windows", "hyper-v", "network", "virtualization"]
readTime: 6
---

Hyper-V networking confuses many people — there are three switch types and several ways to give VMs internet access. Here's a clear breakdown and how to configure each.

---

## The Three Switch Types

**External Switch** — VM gets its own IP on your physical network, visible to other devices. Best for servers or when you need the VM to act like a real machine on your LAN.

**Internal Switch** — VMs can talk to each other and to the Windows host, but not to the internet or other physical machines. Good for isolated test environments.

**Private Switch** — VMs can only talk to each other, not the host or internet. Maximum isolation.

---

## Create a Virtual Switch

`Win + S` → **Hyper-V Manager** → **Action** → **Virtual Switch Manager** → **New virtual network switch** → choose type → **Create Virtual Switch**

**For External:** select your physical network adapter. If you have both Wi-Fi and Ethernet, use Ethernet for better performance.

```powershell
# Create External switch
New-VMSwitch -Name "External Switch" -NetAdapterName "Ethernet" -AllowManagementOS $true

# Create Internal switch
New-VMSwitch -Name "Internal Switch" -SwitchType Internal

# Create Private switch
New-VMSwitch -Name "Private Switch" -SwitchType Private

# List all switches
Get-VMSwitch
```

---

## Assign a Switch to a VM

```powershell
# Add network adapter to VM
Add-VMNetworkAdapter -VMName "Ubuntu" -SwitchName "External Switch"

# Change existing adapter's switch
Connect-VMNetworkAdapter -VMName "Ubuntu" -SwitchName "External Switch"

# View VM network adapters
Get-VMNetworkAdapter -VMName "Ubuntu"
```

---

## Set Up NAT for Internal Switch

Internal switch VMs have no internet by default. Add NAT to give them internet via the host:

```powershell
# Get the Internal switch's IP (host side)
Get-NetAdapter | Where-Object {$_.Name -like "*Internal*"}

# Assign IP to the virtual adapter
New-NetIPAddress -IPAddress 192.168.100.1 -PrefixLength 24 -InterfaceAlias "vEthernet (Internal Switch)"

# Create NAT network
New-NetNat -Name "InternalNAT" -InternalIPInterfaceAddressPrefix 192.168.100.0/24
```

Inside the VM: set static IP `192.168.100.x`, gateway `192.168.100.1`, DNS `1.1.1.1`.

---

## DHCP for VMs on Internal Network

To auto-assign IPs on the internal network, run a DHCP server inside one VM (Linux with dnsmasq works well), or assign static IPs manually.

Windows Server VMs can provide DHCP for the network. Alternatively, use a dedicated router VM.

---

## Fix VM Can't Access Internet

```powershell
# Check VM has a network adapter
Get-VMNetworkAdapter -VMName "Ubuntu" | Select-Object SwitchName, MacAddress, IPAddresses

# Check External switch is connected to right adapter
Get-VMSwitch -Name "External Switch" | Select-Object NetAdapterInterfaceDescription
```

**Common causes:**
- External switch connected to Wi-Fi instead of Ethernet — some Wi-Fi adapters don't support External switch properly
- Firewall blocking VM traffic
- VM using wrong gateway

For Wi-Fi-only systems, use NAT with Internal switch instead of External.

---

## VLAN Tagging

For advanced network isolation:

```powershell
# Set VLAN ID on VM network adapter
Set-VMNetworkAdapterVlan -VMName "Ubuntu" -Access -VlanId 10

# Remove VLAN
Set-VMNetworkAdapterVlan -VMName "Ubuntu" -Untagged
```

---

## Bandwidth Limiting

```powershell
# Limit VM to 100 Mbps
Set-VMNetworkAdapter -VMName "Ubuntu" -MaximumBandwidth 100000000

# Enable bandwidth management
Set-VMNetworkAdapter -VMName "Ubuntu" -MinimumBandwidthWeight 10

# Remove bandwidth limit
Set-VMNetworkAdapter -VMName "Ubuntu" -MaximumBandwidth 0
```

---

## Check VM IP from Host

```powershell
# Get IP addresses of all running VMs
Get-VM | Where-Object {$_.State -eq "Running"} |
  Get-VMNetworkAdapter |
  Select-Object VMName, SwitchName, IPAddresses
```

---

## Summary

For internet access: use **External** switch connected to Ethernet adapter. For isolated testing: use **Internal** switch with NAT configured on the host. For maximum VM isolation: **Private** switch. If External switch fails with Wi-Fi, switch to Internal + NAT which works on all connection types.
