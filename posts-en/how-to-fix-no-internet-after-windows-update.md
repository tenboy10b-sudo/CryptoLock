---
title: "How to Fix No Internet After Windows Update in Windows 10 and 11"
date: "2027-02-02"
publishDate: "2026-08-24"
description: "Fix internet connection lost after Windows 10 or 11 update. Reset TCP/IP stack, reinstall network adapter, restore driver, fix WINSOCK and DNS issues."
tags: ["windows", "network", "windows-update", "troubleshooting", "errors"]
readTime: 5
translatesUk: "nemaye-internetu-pislya-onovlennya-windows"
---

Windows updates occasionally break network connectivity. Here's how to restore it without reinstalling Windows.

---

## Quick Fixes First

```powershell
# 1. Reset network stack
netsh winsock reset
netsh int ip reset
ipconfig /flushdns
ipconfig /release
ipconfig /renew

# Restart
Restart-Computer
```

If that doesn't work, continue.

---

## Check Network Adapter Status

```powershell
# View all adapters
Get-NetAdapter | Select-Object Name, Status, MacAddress, LinkSpeed

# If adapter shows "Disabled"
Enable-NetAdapter -Name "Ethernet" -Confirm:$false

# If adapter shows "Not Present" or missing
# The driver may have been removed — see below
```

---

## Roll Back Network Driver

The update may have replaced your working driver with an incompatible one:

1. `Win + X` → **Device Manager**
2. **Network adapters** → right-click your adapter
3. **Properties** → **Driver** tab → **Roll Back Driver**

```powershell
# Check current driver version
Get-NetAdapter | ForEach-Object {
  $adapter = $_
  Get-WmiObject Win32_PnPSignedDriver |
    Where-Object {$_.DeviceName -like "*$($adapter.InterfaceDescription)*"} |
    Select-Object DeviceName, DriverVersion, InfName
}
```

---

## Reinstall Network Adapter Driver

```powershell
# Uninstall and reinstall the adapter (Windows will reinstall on next boot)
$adapter = Get-NetAdapter | Where-Object {$_.Status -eq "Up" -or $_.Status -eq "Disconnected"} | Select-Object -First 1
$infName = (Get-WmiObject Win32_PnPSignedDriver | Where-Object {$_.DeviceName -like "*$($adapter.InterfaceDescription)*"}).InfName

# Uninstall driver
pnputil /delete-driver $infName /uninstall /force

# Restart to reinstall automatically
Restart-Computer
```

---

## Uninstall the Problematic Update

```powershell
# Find recently installed updates
Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 5 HotFixID, InstalledOn

# Uninstall specific KB
wusa /uninstall /kb:5055523 /quiet /norestart
# Restart after
```

---

## Fix Corrupted TCP/IP and Winsock

```powershell
# Complete network stack reset
netsh int ip reset C:\ip-reset.log
netsh int ipv6 reset C:\ipv6-reset.log
netsh winsock reset C:\winsock-reset.log
netsh advfirewall reset

# Register DNS
ipconfig /registerdns

# Restart after all commands
Restart-Computer
```

---

## Fix DNS Resolution

```powershell
# Set manual DNS (Cloudflare)
$adapter = (Get-NetAdapter | Where-Object {$_.Status -eq "Up"}).Name
Set-DnsClientServerAddress -InterfaceAlias $adapter -ServerAddresses ("1.1.1.1", "8.8.8.8")

# Test DNS
Resolve-DnsName google.com -Server 1.1.1.1
```

---

## Run Network Troubleshooter

```powershell
msdt.exe /id NetworkDiagnosticsNetworkAdapter
```

---

## Check Windows Firewall Reset

An update sometimes resets firewall to block all connections:

```powershell
# Check firewall status
Get-NetFirewallProfile | Select-Object Name, Enabled, DefaultInboundAction, DefaultOutboundAction

# Reset to defaults if rules are wrong
netsh advfirewall reset
```

---

## Summary

Try in order: reset Winsock/IP stack → roll back network driver → uninstall the update → manual DNS. Most post-update connectivity issues are solved by `netsh winsock reset` + driver rollback + restart.

## Frequently Asked Questions

### Wi-Fi adapter disappeared from Device Manager after update — why?

The update may have removed the driver. Device Manager → View → Show hidden devices — if it appears greyed out, right-click → Enable. If still missing, download the driver from your PC manufacturer's support page.

### Internet works but only on some sites after update?

Likely a DNS issue. Set manual DNS to 1.1.1.1 and 8.8.8.8 and flush the DNS cache: `Clear-DnsClientCache`.

### Can I prevent this from happening again?

Yes — block driver updates through Windows Update: `Set-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate" -Name "ExcludeWUDriversInQualityUpdate" -Value 1 -Type DWord`.
