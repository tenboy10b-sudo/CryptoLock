---
title: "Wi-Fi Not Working in Windows 10 and 11: How to Fix It"
date: "2026-05-08"
publishDate: "2026-05-08"
description: "Wi-Fi disappeared, won't connect, or shows 'No Internet'? Step-by-step fixes for the most common Wi-Fi problems in Windows — from missing adapter to DNS issues."
tags: ["windows", "network", "wifi", "troubleshooting"]
readTime: 7
---

Wi-Fi problems fall into a few categories: the adapter is missing entirely, Windows sees the network but won't connect, or it connects but shows no internet. Here's how to diagnose and fix each.

---

## Step 1: Check the Basics

Before diving into settings:

- Make sure Wi-Fi is enabled: `Win + A` (Action Center) → check Wi-Fi tile is on
- Try **Airplane Mode** off: same Action Center, or `Win + I` → **Network & Internet** → **Airplane mode**
- Restart the router and PC
- Check if other devices connect to the same network — if not, the problem is the router

---

## Step 2: Run Network Troubleshooter

`Win + I` → **System** → **Troubleshoot** → **Other troubleshooters** → **Internet Connections** → **Run**

Also run: **Network Adapter** troubleshooter from the same menu.

---

## Step 3: Wi-Fi Adapter Missing Entirely

If Wi-Fi doesn't appear in network settings:

```powershell
# Check if adapter is detected
Get-NetAdapter | Select-Object Name, Status, MediaType
```

If it's not listed: open **Device Manager** (`Win + X` → Device Manager) → **Network adapters**. Look for:
- A yellow warning icon on the Wi-Fi adapter
- **Unknown device** entries

**Re-enable disabled adapter:**
Right-click the adapter → **Enable device**

**Reinstall the driver:**
Right-click → **Uninstall device** → check **Delete the driver software** → restart. Windows will reinstall automatically.

**If the adapter is completely absent:** the driver may be corrupted. Download the Wi-Fi driver from your laptop/motherboard manufacturer's website and install manually.

---

## Step 4: Can See Network But Can't Connect

**Forget and reconnect:**
`Settings` → **Network & Internet** → **Wi-Fi** → **Manage known networks** → select your network → **Forget** → reconnect.

**Check date and time** — incorrect date/time breaks certificate verification and prevents connections:
```powershell
Set-Date (Get-Date)  # sync with system clock
w32tm /resync        # sync with internet time server
```

**Reset network stack:**
```cmd
netsh winsock reset
netsh int ip reset
ipconfig /release
ipconfig /flushdns
ipconfig /renew
```
Restart after running these.

---

## Step 5: Connected But "No Internet Access"

This usually means IP address or DNS issues.

**Check IP address:**
```cmd
ipconfig /all
```

If your IP starts with `169.254.x.x` — Windows couldn't get an IP from the router (DHCP issue). Try:
```cmd
ipconfig /release
ipconfig /renew
```

**Fix DNS:**
```cmd
netsh dns flush
```

Set manual DNS temporarily to rule out DNS issues:
```powershell
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses ("1.1.1.1","8.8.8.8")
```

---

## Step 6: Slow Wi-Fi or Keeps Disconnecting

**Disable auto power saving on the adapter:**
Device Manager → Wi-Fi adapter → **Properties** → **Power Management** → uncheck **Allow the computer to turn off this device to save power**

**Change wireless channel on router** — if neighbors are on the same channel, there's interference. Log into your router admin page and switch to a less congested channel (use a Wi-Fi analyzer app to see which channels are busy).

**Update Wi-Fi driver:**
Download from manufacturer, not Windows Update — manufacturer drivers often fix connection stability bugs.

---

## Step 7: Reset Network Settings Completely

If nothing works:

```cmd
netsh int ip reset resetlog.txt
netsh winsock reset catalog
netsh advfirewall reset
```

Or: `Settings` → **Network & Internet** → **Advanced network settings** → **Network reset** → **Reset now**

This removes all network adapters and reinstalls them. You'll need to reconnect to Wi-Fi and re-enter passwords.

---

## Summary

Most Wi-Fi problems are fixed by: running the troubleshooter, resetting the network stack (`netsh winsock reset` + `netsh int ip reset`), and reinstalling the driver. For "no internet" with valid connection: check IP address and switch to manual DNS (`1.1.1.1`).
