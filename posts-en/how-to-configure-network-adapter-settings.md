---
title: "How to Configure Network Adapter Settings for Performance and Stability"
date: "2026-11-07"
publishDate: "2026-11-07"
description: "Tune Windows network adapter settings for better throughput and lower latency: speed/duplex, interrupt moderation, RSS, buffers, and power management settings."
tags: ["windows", "network", "optimization", "hardware"]
readTime: 5
---

The default Windows network adapter settings are conservative. Tweaking them can improve throughput on fast networks and reduce latency for real-time applications.

---

## Find Your Adapter Name

```powershell
Get-NetAdapter | Select-Object Name, InterfaceDescription, Status, LinkSpeed
```

Use the Name (e.g., "Ethernet" or "Wi-Fi") in subsequent commands.

---

## Speed and Duplex (Ethernet)

Auto-negotiation usually works, but sometimes manually setting it improves stability:

**Device Manager** → **Network Adapters** → right-click Ethernet adapter → **Properties** → **Advanced** tab → **Speed & Duplex**

- Set to **1.0 Gbps Full Duplex** if you have a gigabit network
- Leave as **Auto Negotiation** for most situations — change only if you have speed or duplex mismatch errors

```powershell
# Check current setting
Get-NetAdapterAdvancedProperty -Name "Ethernet" | Where-Object {$_.DisplayName -like "*Speed*"}
```

---

## Disable Power Saving on Network Adapter

Power management cuts the adapter during idle — causes dropped connections and wake delays:

**Device Manager** → right-click adapter → **Properties** → **Power Management** tab → uncheck **Allow the computer to turn off this device to save power**

```powershell
# Disable power saving via PowerShell
$adapter = Get-NetAdapter -Name "Ethernet"
Disable-NetAdapterPowerManagement -Name $adapter.Name
```

---

## Receive Side Scaling (RSS)

RSS distributes incoming network traffic across multiple CPU cores — improves throughput on multi-core systems:

```powershell
# Check RSS status
Get-NetAdapterRss -Name "Ethernet"

# Enable RSS
Enable-NetAdapterRss -Name "Ethernet"

# Set number of RSS queues (match to physical CPU cores)
Set-NetAdapterRss -Name "Ethernet" -NumberOfReceiveQueues 4
```

---

## Interrupt Moderation

Interrupt moderation batches network interrupts to reduce CPU overhead. Disabling it reduces latency at the cost of slightly higher CPU:

```powershell
# Check
Get-NetAdapterAdvancedProperty -Name "Ethernet" | Where-Object {$_.DisplayName -like "*Interrupt*"}

# Disable for lowest latency (gaming, VoIP)
Set-NetAdapterAdvancedProperty -Name "Ethernet" -DisplayName "Interrupt Moderation" -DisplayValue "Disabled"
```

---

## Receive and Transmit Buffers

Larger buffers handle traffic bursts without dropping packets:

```powershell
# Check current buffer sizes
Get-NetAdapterAdvancedProperty -Name "Ethernet" |
  Where-Object {$_.DisplayName -like "*Buffer*"} |
  Select-Object DisplayName, DisplayValue

# Set to maximum (values depend on adapter)
Set-NetAdapterAdvancedProperty -Name "Ethernet" -DisplayName "Receive Buffers" -DisplayValue "2048"
Set-NetAdapterAdvancedProperty -Name "Ethernet" -DisplayName "Transmit Buffers" -DisplayValue "2048"
```

---

## Jumbo Frames

If your entire network (PC, switch, router) supports Jumbo Frames, increasing MTU from 1500 to 9000 bytes improves throughput on large transfers:

```powershell
# Enable Jumbo Frames (check your router and switch support first)
Set-NetAdapterAdvancedProperty -Name "Ethernet" -DisplayName "Jumbo Packet" -DisplayValue "9014 Bytes"

# Test with ping (should not fragment)
ping -f -l 8972 192.168.1.1

# Revert to standard MTU
Set-NetAdapterAdvancedProperty -Name "Ethernet" -DisplayName "Jumbo Packet" -DisplayValue "Disabled"
```

---

## TCP Settings

```powershell
# Check current TCP settings
netsh int tcp show global

# Enable Chimney offload (offloads TCP to NIC)
netsh int tcp set global chimney=enabled

# Enable ECN (reduces congestion)
netsh int tcp set global ecncapability=enabled

# Reset to defaults if something breaks
netsh int tcp set global autotuninglevel=normal
netsh int tcp set global chimney=default
```

---

## Wi-Fi Specific Settings

```powershell
# Check Wi-Fi adapter settings
Get-NetAdapterAdvancedProperty -Name "Wi-Fi" | Select-Object DisplayName, DisplayValue

# Common Wi-Fi tweaks:
# Roaming Aggressiveness: Low or Medium (prevents constant AP switching)
Set-NetAdapterAdvancedProperty -Name "Wi-Fi" -DisplayName "Roaming Aggressiveness" -DisplayValue "1"  # Low

# Preferred Band: 5GHz
Set-NetAdapterAdvancedProperty -Name "Wi-Fi" -DisplayName "Preferred Band" -DisplayValue "2"  # 5GHz

# 802.11n/ac mode: prefer 5GHz 802.11ac
```

---

## Benchmark Your Settings

```powershell
# Measure throughput before and after changes
# Simple bandwidth test using file copy
$source = "\\RemotePC\Share\testfile.iso"  # 1GB+ file on network share
$start = Get-Date
Copy-Item $source "C:\Temp\test.iso"
$elapsed = (Get-Date) - $start
$size = (Get-Item "C:\Temp\test.iso").Length / 1MB
"Transfer: $([math]::Round($size/$elapsed.TotalSeconds, 0)) MB/s"
Remove-Item "C:\Temp\test.iso"
```

---


---

## 🌐 Розрахувати параметри підмережі?

**[→ IP/Subnet калькулятор](/tools/subnet-calculator)** — введи IP і CIDR, отримай маску, broadcast, діапазон хостів і бінарне представлення.


## Summary

For most users: disable power management on the adapter (prevents connection drops), enable RSS (better multi-core performance). For gaming: disable Interrupt Moderation (lower latency). For file transfers: increase Receive/Transmit Buffers. Avoid Jumbo Frames unless your entire network supports it — mixed MTU causes connectivity problems.
