---
title: "WiFi Not Connecting in Windows 10 and 11: Step-by-Step Fix"
date: "2026-06-18"
publishDate: "2027-06-01"
updated: "2026-06-18"
description: "What to do when WiFi won't connect or keeps disconnecting in Windows 10 and 11. Reset network settings, update WiFi drivers, fix limited connectivity and no internet errors."
tags: ["windows", "wifi", "network", "internet", "fix"]
readTime: 8
translatesUk: "wifi-ne-pidklyuchaietsia-windows-vyrishennya"
---

WiFi not connecting is one of the most common Windows problems. Here's a systematic fix from simple to advanced.

---

## Step 1 — Restart the Adapter

```powershell
$wifi = Get-NetAdapter | Where-Object {$_.PhysicalMediaType -like '*802.11*'}
Disable-NetAdapter -Name $wifi.Name -Confirm:$false
Start-Sleep 3
Enable-NetAdapter -Name $wifi.Name
```

---

## Step 2 — Reset Network Settings

```powershell
netsh winsock reset
netsh int ip reset
ipconfig /flushdns
ipconfig /release
ipconfig /renew
```

**Restart PC after running these commands.**

---

## Step 3 — Forget and Reconnect

```powershell
# List saved networks
netsh wlan show profiles

# Delete specific network
netsh wlan delete profile name="NetworkName"
```

Then reconnect manually and enter the password.

---

## Step 4 — Update WiFi Driver

```
Device Manager → Network Adapters → WiFi adapter → right-click → Update driver
```

Or download from your laptop/motherboard manufacturer's website.

---

## Step 5 — Check Power Management

```
Device Manager → WiFi adapter → Properties → Power Management →
uncheck "Allow the computer to turn off this device to save power"
```

---

## Step 6 — Restart WLAN AutoConfig Service

```powershell
Restart-Service WlanSvc
Set-Service WlanSvc -StartupType Automatic
```

---

## Common Errors

### "Can't connect to this network"
```powershell
netsh wlan delete profile name="NetworkName"
```
Reconnect and enter password again.

### "Limited" or "No Internet Access"
```powershell
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses ("8.8.8.8","8.8.4.4")
```

### WiFi disappears after sleep
Disable power management for WiFi adapter (Step 5).

### Can't see 5GHz network
```powershell
netsh wlan show drivers | Select-String "Radio types"
# Should show: 802.11a/n/ac or 802.11ax
```

---

## Full Network Reset

```
Win + I → Network → Status → Network Reset
```

---

## Summary

| Problem | Fix |
|---------|-----|
| Won't connect | Forget network → reconnect |
| No internet | DNS to 8.8.8.8, ipconfig /renew |
| Drops after sleep | Disable power management |
| Can't see network | Update WiFi driver |
| Nothing works | Full network reset |
