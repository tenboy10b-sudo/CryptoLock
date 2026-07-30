---
title: "How to Troubleshoot Network Issues in Windows: Complete Guide"
date: "2026-04-12"
publishDate: "2026-04-12"
description: "Systematic approach to diagnosing Windows network problems: no internet, limited connectivity, slow speeds, and DNS failures. Commands to pinpoint and fix the issue."
tags: ["windows", "network", "troubleshooting", "tools"]
readTime: 6
---

Network problems are frustrating because the cause isn't always obvious. This guide walks through a systematic diagnosis — from basic connectivity to DNS, routing, and driver issues.

---

## The Diagnostic Stack

Network issues occur at different layers. Diagnose from bottom to top:

1. **Physical** — cable, Wi-Fi signal, adapter
2. **Link** — IP address assignment (DHCP)
3. **Network** — routing, gateway
4. **DNS** — name resolution
5. **Application** — browser, firewall settings

---

## Step 1: Basic Status Check

```powershell
# Network adapter status
Get-NetAdapter | Select-Object Name, Status, LinkSpeed, MediaType

# IP configuration
ipconfig /all

# Default gateway
(Get-NetRoute -DestinationPrefix '0.0.0.0/0').NextHop
```

If adapter shows **Disconnected** — physical issue (cable, Wi-Fi). If no IP — DHCP problem.

---

## Step 2: Can You Reach the Gateway?

```powershell
# Ping your router
$gateway = (Get-NetRoute -DestinationPrefix '0.0.0.0/0').NextHop
Test-NetConnection -ComputerName $gateway -InformationLevel Detailed
```

If gateway ping fails: local network issue (router down, cable, wrong subnet).
If gateway ping succeeds but no internet: ISP issue or DNS.

---

## Step 3: Can You Reach the Internet by IP?

```powershell
# Ping Cloudflare's DNS by IP (bypasses DNS)
Test-NetConnection -ComputerName 1.1.1.1 -Port 80
```

If this works but websites don't load: **DNS issue**.
If this fails: routing or ISP issue.

---

## Step 4: DNS Test

```powershell
# Test DNS resolution
Resolve-DnsName google.com
Resolve-DnsName google.com -Server 1.1.1.1  # Test with Cloudflare
Resolve-DnsName google.com -Server 8.8.8.8  # Test with Google

# Clear DNS cache
Clear-DnsClientCache

# Check current DNS servers
Get-DnsClientServerAddress -AddressFamily IPv4
```

If resolving via `1.1.1.1` works but not with your ISP's DNS: change DNS servers.

```powershell
# Switch to Cloudflare DNS
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses ("1.1.1.1","1.0.0.1")
```

---

## Step 5: Reset Network Stack

For persistent issues after ruling out hardware:

```cmd
netsh winsock reset
netsh int ip reset
ipconfig /release
ipconfig /flushdns
ipconfig /renew
```

Restart after running.

---

## Fix: No IP Address (169.254.x.x)

A `169.254.x.x` address means DHCP failed — Windows assigned itself an APIPA address.

```powershell
# Force release and renew
ipconfig /release
ipconfig /renew

# If still failing, restart DHCP client service
Restart-Service Dhcp
```

Check router is powered on and DHCP is enabled.

---

## Fix: Limited Connectivity

```powershell
# Reset TCP/IP stack
netsh int tcp set global autotuninglevel=normal
netsh int ip reset resetlog.txt

# Reset Winsock
netsh winsock reset catalog

# Fix IPv6 if causing issues
netsh interface ipv6 reset
```

---

## Fix: Adapter Not Showing

```powershell
# Show hidden/disabled adapters
Get-NetAdapter -IncludeHidden | Select-Object Name, Status, Hidden

# Enable a disabled adapter
Enable-NetAdapter -Name "Wi-Fi"

# Check Device Manager for errors
Get-PnpDevice -Class Net | Where-Object {$_.Status -ne 'OK'}
```

---

## Fix: Slow or Dropping Wi-Fi

```powershell
# Check signal strength and network details
netsh wlan show networks mode=bssid
netsh wlan show interfaces

# Driver version
Get-NetAdapter "Wi-Fi" | Select-Object DriverVersion, DriverDate
```

For persistent drops: disable Wi-Fi adapter power saving:
Device Manager → Network Adapters → Wi-Fi adapter → Properties → Power Management → uncheck **Allow the computer to turn off this device to save power**

---

## Run Built-in Troubleshooter

`Win + I` → **System** → **Troubleshoot** → **Other troubleshooters** → **Internet Connections** → Run

---

## Network Diagnostics Report

```powershell
# Generate full network diagnostic report
netsh trace start capture=yes
# Reproduce the issue, then:
netsh trace stop
# Creates .etl file for analysis
```

Or simple text report:
```cmd
netsh diag report > C:\network-report.txt
notepad C:\network-report.txt
```

---


---

## 🔍 Not sure what a Windows error code means?

If Windows shows a code like `0x80070005`, `0x80070002` or `0xC000021A` — use this free tool:

**[→ Windows Error Decoder](/tools/windows-error-decoder)** — enter the code and instantly find out what it means and how to fix it.


## Summary

Follow the stack: adapter status → gateway ping → internet by IP → DNS test. Most home issues are DNS (fix by changing to 1.1.1.1) or DHCP (fix by ipconfig /renew). Reset Winsock + TCP/IP stack for persistent software issues. For hardware issues: update driver or check power management settings.
