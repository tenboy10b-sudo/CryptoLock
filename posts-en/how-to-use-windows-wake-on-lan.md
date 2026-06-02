---
title: "How to Configure Wake-on-LAN in Windows 10 and 11"
date: "2026-06-17"
publishDate: "2026-06-17"
description: "Configure Wake-on-LAN (WoL) in Windows to remotely power on PCs over the network. Enable in BIOS and Windows, send magic packets and troubleshoot WoL issues."
tags: ["windows", "wake-on-lan", "network", "remote", "administration"]
readTime: 5
---

Wake-on-LAN lets you power on a PC remotely by sending a "magic packet" over the network. Essential for remote administration without physical access.

---

## Step 1: Enable WoL in BIOS/UEFI

1. Restart → enter BIOS (`Del`, `F2`, or `F12`)
2. Find: **Power Management** → **Wake on LAN** or **PCI-E/PCI Power Up**
3. Set to **Enabled**
4. Save and exit

---

## Step 2: Enable WoL in Windows

```powershell
# Find adapter name
Get-NetAdapter | Select-Object Name, InterfaceDescription

# Enable Wake on Magic Packet
Set-NetAdapterAdvancedProperty -Name "Ethernet" `
  -DisplayName "Wake on Magic Packet" -DisplayValue "Enabled"

# Enable Wake on Pattern Match (for some adapters)
Set-NetAdapterAdvancedProperty -Name "Ethernet" `
  -DisplayName "Wake on Pattern Match" -DisplayValue "Enabled"

# Verify
Get-NetAdapterAdvancedProperty -Name "Ethernet" |
  Where-Object {$_.DisplayName -like "*Wake*"}
```

---

## Step 3: Configure Power Management

```powershell
# Prevent Windows from turning off adapter to save power
# Device Manager → Network Adapters → Ethernet → Properties → Power Management
# Uncheck "Allow the computer to turn off this device to save power"
# Check "Allow this device to wake the computer"

# Via PowerShell
$adapter = Get-WmiObject -Class MSPower_DeviceEnable -Namespace "root\wmi" |
  Where-Object {$_.InstanceName -like "*Ethernet*"}
$adapter.Enable = $true
$adapter.Put()
```

---

## Get the MAC Address

```powershell
# Get MAC address of the target PC (run on the target)
(Get-NetAdapter | Where-Object {$_.Status -eq "Up"}).MacAddress

# Get MAC from ARP cache (run from another PC after pinging the target)
arp -a | findstr "192.168.1.50"
```

---

## Send Magic Packet

```powershell
# PowerShell function to send Wake-on-LAN magic packet
function Send-WakeOnLan {
  param(
    [Parameter(Mandatory)]
    [string]$MacAddress,
    [string]$BroadcastAddress = "255.255.255.255",
    [int]$Port = 9
  )

  # Clean MAC address
  $mac = $MacAddress -replace "[:\-\.]",""
  
  # Build magic packet: 6x FF + 16x MAC
  $packet = [byte[]](,0xFF * 6) + ($mac -split "(.{2})" | Where-Object {$_} |
    ForEach-Object {[Convert]::ToByte($_, 16)}) * 16

  # Send UDP packet
  $udp = New-Object Net.Sockets.UdpClient
  $udp.Connect($BroadcastAddress, $Port)
  $udp.EnableBroadcast = $true
  $udp.Send($packet, $packet.Length) | Out-Null
  $udp.Close()
  Write-Host "Magic packet sent to $MacAddress"
}

# Usage
Send-WakeOnLan -MacAddress "AA-BB-CC-DD-EE-FF"
Send-WakeOnLan -MacAddress "AA:BB:CC:DD:EE:FF" -BroadcastAddress "192.168.1.255"
```

---

## Configure Fast Startup Compatibility

Windows Fast Startup can interfere with WoL:

```powershell
# Check Fast Startup status
(Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power").HiberbootEnabled

# Disable Fast Startup if WoL doesn't work after shutdown
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power" `
  -Name "HiberbootEnabled" -Value 0 -Type DWord

# Note: WoL works from Sleep/Hibernate but may not work from full Shutdown with Fast Startup
```

---

## Troubleshoot WoL Issues

```powershell
# Test network connectivity to the PC when it's on
Test-NetConnection -ComputerName "192.168.1.50" -Port 3389

# Check if WoL setting is persistent
Get-NetAdapterAdvancedProperty -Name "Ethernet" | Where-Object {$_.DisplayName -like "*Wake*"}

# Check if adapter has WoL capability
Get-WmiObject -Namespace "root\cimv2" -Class Win32_NetworkAdapter |
  Where-Object {$_.Name -like "*Ethernet*"} |
  Select-Object Name, WakeUpType
```

---

## Summary

Enable in BIOS first (mandatory). Then enable Magic Packet in Windows adapter settings. Disable Fast Startup for reliable shutdown WoL. Get MAC with `Get-NetAdapter`. Send packet with the PowerShell function. WoL works on LAN; for internet WoL you need port forwarding (UDP 9).

## Frequently Asked Questions

### WoL works from Sleep but not from Shutdown — why?

Fast Startup is the most common cause. Disable it: `Set-ItemProperty "HiberbootEnabled" -Value 0`. Also check BIOS Deep Sleep settings — S5 WoL must be enabled.

### Can I wake a PC over the internet?

Yes, but requires port forwarding: forward UDP port 9 on your router to the broadcast address (192.168.1.255) or the PC's IP. Then send the magic packet to your public IP.

### My PC wakes up randomly at night — how to stop it?

```powershell
# Check what's waking the PC
powercfg /lastwake
powercfg /waketimers

# Disable wake timers
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\Power" -Name "WakeTimerActive" -Value 0
```
