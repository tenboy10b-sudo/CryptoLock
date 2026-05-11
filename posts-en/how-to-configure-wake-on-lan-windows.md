---
title: "How to Set Up Wake-on-LAN in Windows 10 and 11"
date: "2026-09-06"
publishDate: "2026-09-06"
description: "Wake-on-LAN lets you power on a Windows PC remotely over the network. How to enable it in BIOS and Windows, send a magic packet, and troubleshoot WoL not working."
tags: ["windows", "network", "administration", "tools"]
readTime: 5
---

Wake-on-LAN (WoL) lets you remotely power on a sleeping or shut-down PC by sending a "magic packet" over the network. Useful for accessing a home PC remotely without leaving it on 24/7.

---

## Requirements

- PC connected via **Ethernet** (WoL over Wi-Fi works on some adapters but is unreliable)
- Network adapter that supports WoL (most desktop and laptop adapters do)
- BIOS with WoL support
- PC must be on the same network or you need to configure port forwarding for internet WoL

---

## Step 1: Enable WoL in BIOS

Restart → enter BIOS (`Del`, `F2`, `F10` depending on manufacturer)

Look for:
- **Wake on LAN** — enable
- **Power on by PCIe** — enable (some boards use this)
- **EuP/ErP** setting — if set to "Enabled", it may disable WoL. Set to **Disabled**.

Save and restart.

---

## Step 2: Enable in Windows Network Adapter Settings

`Win + X` → **Device Manager** → **Network adapters** → right-click your Ethernet adapter → **Properties** → **Advanced** tab

Find and enable:
- **Wake on Magic Packet** → **Enabled**
- **Wake on Pattern Match** → **Enabled**

Also go to **Power Management** tab → check:
- **Allow this device to wake the computer**
- **Only allow a magic packet to wake the computer**

---

## Step 3: Disable Fast Startup

Fast Startup can prevent WoL from working because the PC isn't truly powered off.

`Control Panel` → **Power Options** → **Choose what the power buttons do** → uncheck **Turn on fast startup**

Or:
```powershell
powercfg /hibernate off
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power" `
  -Name "HiberbootEnabled" -Value 0 -Type DWord
```

---

## Step 4: Find Your PC's MAC Address

The magic packet targets a specific MAC address:

```powershell
Get-NetAdapter | Where-Object {$_.Status -eq "Up"} |
  Select-Object Name, MacAddress, InterfaceDescription
```

Write down the MAC address of your Ethernet adapter (format: `AA-BB-CC-DD-EE-FF`).

---

## Step 5: Send a Magic Packet

**From another Windows PC on the same network:**

```powershell
# Install if not present
Install-Module -Name WakeOnLan -Force -Scope CurrentUser

# Send magic packet
Invoke-WakeOnLan -MacAddress "AA-BB-CC-DD-EE-FF"
```

**Via CMD without modules:**
```powershell
# Simple PowerShell magic packet sender
function Send-WakeOnLan {
  param([string]$MacAddress)
  $mac = $MacAddress -replace '[^0-9A-Fa-f]', ''
  $bytes = [byte[]]((0xFF) * 6 + ($mac -split '(..)' | Where-Object {$_} | ForEach-Object {[Convert]::ToByte($_, 16)}) * 16)
  $udp = New-Object System.Net.Sockets.UdpClient
  $udp.Connect([System.Net.IPAddress]::Broadcast, 9)
  $udp.Send($bytes, $bytes.Length) | Out-Null
  $udp.Close()
}

Send-WakeOnLan -MacAddress "AA-BB-CC-DD-EE-FF"
```

**Free tools:**
- **WakeMeOnLan** (nirsoft.net) — GUI, scans network for devices
- **wolcmd** — command-line tool

---

## Step 6: WoL Over the Internet

For waking a PC from outside your network:

1. Assign a **static local IP** to the target PC (via router DHCP reservation)
2. Set up **port forwarding** on your router: UDP port 9 → local PC IP
3. Know your router's public IP (or use DDNS like DuckDNS)
4. Send magic packet to your public IP, port 9

---

## Troubleshoot WoL Not Working

```powershell
# Check if WoL is configured
Get-NetAdapterPowerManagement -Name "Ethernet" |
  Select-Object WakeOnMagicPacket, WakeOnPattern
```

**Common issues:**

- **Fast Startup is on** — disable it (Step 3)
- **Wrong BIOS setting** — check for EuP/ErP being enabled
- **Using Wi-Fi** — WoL is unreliable over Wi-Fi, use Ethernet
- **Router blocks broadcast** — use directed broadcast or subnet-directed broadcast instead
- **PC assigned different IP** — use MAC-based DHCP reservation so IP stays consistent

---

## Summary

Enable WoL in BIOS → enable "Wake on Magic Packet" in adapter Properties → disable Fast Startup → note MAC address → send magic packet using PowerShell or WakeMeOnLan. For internet WoL: set up port forwarding on your router for UDP port 9.
