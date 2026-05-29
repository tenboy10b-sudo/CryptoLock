---
title: "How to Change Network Profile in Windows (Public vs Private)"
date: "2026-04-03"
publishDate: "2026-04-03"
description: "Windows assigns Public or Private profile to each network connection — this controls firewall rules and network discovery. How to change profiles and when to use each."
tags: ["windows", "network", "security", "settings"]
readTime: 4
---

When you connect to a network, Windows assigns it a profile — Public or Private. This determines which firewall rules apply and whether your PC is discoverable on the network.

---

## Public vs Private Profile

**Private:**
- Used for trusted networks (home, office)
- Network discovery ON — other devices can find your PC
- File and printer sharing enabled by default
- Less restrictive firewall rules

**Public:**
- Used for untrusted networks (coffee shop, airport, hotel)
- Network discovery OFF — your PC is hidden
- More restrictive firewall rules
- Sharing features disabled

---

## Check Current Network Profile

```powershell
Get-NetConnectionProfile | Select-Object Name, NetworkCategory, IPv4Connectivity
```

`NetworkCategory` shows: `Public`, `Private`, or `DomainAuthenticated`

---

## Change Network Profile

**Via Settings (Windows 11):**
`Win + I` → **Network & Internet** → click your connection (Wi-Fi or Ethernet) → scroll to **Network profile type** → select **Public** or **Private**

**Via Settings (Windows 10):**
Click network icon in taskbar → click your network → **Properties** → toggle **Public** / **Private**

**Via PowerShell:**
```powershell
# Get interface index
Get-NetConnectionProfile

# Set to Private
Set-NetConnectionProfile -InterfaceIndex 12 -NetworkCategory Private

# Set to Public
Set-NetConnectionProfile -InterfaceIndex 12 -NetworkCategory Public
```

---

## When to Change Profile

**Set to Private when:**
- Home Wi-Fi or trusted office network
- You want to share files or printers on the network
- You're connecting via VPN to a trusted network

**Set to Public when:**
- Any network you don't fully trust
- Mobile hotspot or USB tethering
- Guest network at a hotel or cafe

---

## Network Discovery Settings

Control what's visible independently of the profile:

`Control Panel` → **Network and Sharing Center** → **Advanced sharing settings**

Per profile settings:
- **Turn on/off network discovery**
- **Turn on/off file and printer sharing**
- **Turn on/off public folder sharing**

```powershell
# Enable network discovery for Private profile
netsh advfirewall firewall set rule group="Network Discovery" new enable=Yes profile=private

# Disable for Public
netsh advfirewall firewall set rule group="Network Discovery" new enable=No profile=public
```

---

## Domain Profile

`DomainAuthenticated` is assigned automatically when a PC joins an Active Directory domain. Settings are controlled by Group Policy — you can't manually change it.

---

## Fix: Network Always Showing as Public

If your home network keeps reverting to Public:

```powershell
# Set via network category ID
$profile = Get-NetConnectionProfile -Name "Your Network Name"
Set-NetConnectionProfile -InputObject $profile -NetworkCategory Private
```

If it still reverts: check if NLA (Network Location Awareness) service is running:

```powershell
Get-Service NlaSvc | Select-Object Status, StartType
Start-Service NlaSvc
```

---

## Summary

Private = trusted network with discovery on. Public = untrusted with discovery off. Change via Settings or `Set-NetConnectionProfile`. Always set public Wi-Fi (cafe, hotel) to Public profile — it limits what others on the network can see and access on your PC.
