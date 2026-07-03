---
title: "How to Fix Wi-Fi Not Working in Windows 10 and 11"
date: "2027-02-09"
publishDate: "2027-02-09"
description: "Fix Wi-Fi not working in Windows 10 and 11. Diagnose connection issues, reset wireless adapter, update drivers, fix DNS and solve authentication errors."
tags: ["windows", "wifi", "network", "troubleshooting", "drivers"]
readTime: 5
translatesUk: "yak-vypravyty-wifi-windows"
---

Wi-Fi issues in Windows range from adapter not found to connected but no internet. Here's a systematic approach that covers every scenario.

---

## Diagnose First

```powershell
# Check adapter status
Get-NetAdapter | Where-Object {$_.PhysicalMediaType -like "*802.11*" -or $_.Name -like "*Wi*"} |
  Select-Object Name, Status, LinkSpeed

# Check IP configuration
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.PrefixOrigin -ne "WellKnown"}

# Test gateway connectivity
$gw = (Get-NetRoute -DestinationPrefix "0.0.0.0/0").NextHop | Select-Object -First 1
Test-NetConnection -ComputerName $gw

# Test internet
Test-NetConnection -ComputerName "8.8.8.8"
Test-NetConnection -ComputerName "google.com"
```

---

## Fix 1: Toggle Wi-Fi Off and On

```powershell
$adapter = (Get-NetAdapter | Where-Object {$_.Name -like "*Wi*" -or $_.PhysicalMediaType -like "*802.11*"}).Name
Disable-NetAdapter -Name $adapter -Confirm:$false
Start-Sleep 3
Enable-NetAdapter -Name $adapter -Confirm:$false
```

---

## Fix 2: Reset Network Stack

```powershell
netsh winsock reset
netsh int ip reset
netsh int ipv6 reset
ipconfig /flushdns
ipconfig /release
ipconfig /renew
Restart-Computer
```

---

## Fix 3: Forget and Reconnect to Network

```powershell
# List saved Wi-Fi profiles
netsh wlan show profiles

# Remove a specific profile
netsh wlan delete profile name="NetworkName"

# Remove all profiles
netsh wlan delete profile name=*
```

Then reconnect manually by entering the password again.

---

## Fix 4: Update or Reinstall Wi-Fi Driver

```powershell
# Check current driver
Get-WmiObject Win32_PnPSignedDriver |
  Where-Object {$_.DeviceName -like "*Wi*" -or $_.DeviceName -like "*Wireless*"} |
  Select-Object DeviceName, DriverVersion, InfName

# Uninstall and let Windows reinstall
# Device Manager → Network adapters → right-click Wi-Fi → Uninstall device → restart
```

Download fresh drivers from your PC/laptop manufacturer's support page.

---

## Fix 5: Run Troubleshooter

```powershell
msdt.exe /id NetworkDiagnosticsNetworkAdapter
```

---

## Fix 6: Fix "Limited Connectivity" or "No Internet Access"

Connected to Wi-Fi but internet doesn't work:

```powershell
# Change DNS to Cloudflare
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses ("1.1.1.1", "1.0.0.1")

# Check DNS resolution
Resolve-DnsName google.com -Server 1.1.1.1

# Renew DHCP lease
ipconfig /release "Wi-Fi"
ipconfig /renew "Wi-Fi"
```

---

## Fix 7: Fix Authentication Errors

"Can't connect to this network" or password errors:

```powershell
# Delete saved profile and credential
netsh wlan delete profile name="YourNetworkName"

# Also clear from Credential Manager
cmdkey /delete:TERMSRV/YourNetworkName
```

---

## Fix 8: Disable VPN or Proxy Interfering

```powershell
# Disable proxy settings
netsh winhttp reset proxy
Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" -Name "ProxyEnable" -Value 0
```

---

## Fix 9: Check Wi-Fi Adapter Power Management

```powershell
# Prevent adapter from being turned off to save power
$adapter = Get-NetAdapter | Where-Object {$_.Name -like "*Wi*"}
$pnp = Get-WmiObject MSPower_DeviceEnable -Namespace root\wmi |
  Where-Object {$_.InstanceName -like "*$($adapter.DeviceID)*"}
$pnp.Enable = $false
$pnp.Put()
```

Or: Device Manager → Wi-Fi adapter → Properties → **Power Management** → uncheck **Allow the computer to turn off this device to save power**

---

## Summary

Diagnose with `Test-NetConnection`. Reset adapter → reset network stack → forget/reconnect profile → update driver → change DNS. For limited connectivity: manual DNS fix. For auth errors: delete saved profile.

## Frequently Asked Questions

### Wi-Fi shows connected but no internet on one specific site?

That's DNS or firewall specific to that site — not a general Wi-Fi issue. Try `nslookup site.com` to see if DNS resolves it.

### Wi-Fi keeps disconnecting every few minutes?

Check power management (Fix 9). Also check router settings — DHCP lease time and band steering between 2.4/5 GHz can cause reconnections.

### No Wi-Fi networks visible at all?

Check if Wi-Fi is enabled: `Get-NetAdapter`. If adapter shows "Disabled" — enable it. If adapter is missing entirely from Device Manager — driver is not installed or hardware failed.
