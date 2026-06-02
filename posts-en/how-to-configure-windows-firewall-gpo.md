---
title: "How to Configure Windows Firewall via Group Policy"
date: "2026-05-01"
publishDate: "2026-05-01"
description: "Deploy and manage Windows Firewall settings across multiple PCs using Group Policy. Create inbound/outbound rules, configure profiles, and enforce settings domain-wide."
tags: ["windows", "firewall", "gpo", "administration"]
readTime: 5
---

Group Policy lets you configure Windows Firewall identically across all PCs in a domain — or locally via gpedit.msc on a single machine. No manual configuration on each PC.

---

## Open Firewall GPO Settings

**Domain:** Group Policy Management Console → create or edit a GPO → **Computer Configuration** → **Windows Settings** → **Security Settings** → **Windows Defender Firewall with Advanced Security**

**Local:** `gpedit.msc` → same path

---

## Configure Firewall Profiles via GPO

Right-click **Windows Defender Firewall with Advanced Security** → **Properties**

Three profile tabs — Domain, Private, Public:

- **Firewall state**: On (recommended)
- **Inbound connections**: Block (default)
- **Outbound connections**: Allow (default)
- **Display a notification**: No (reduces user interruptions)

```powershell
# Verify firewall profile settings via PowerShell
Get-NetFirewallProfile | Select-Object Name, Enabled, DefaultInboundAction, DefaultOutboundAction
```

---

## Create an Inbound Rule via GPO

**Inbound Rules** → right-click → **New Rule**

**Port rule example (allow RDP from management subnet only):**
1. Rule Type: **Custom**
2. Program: All programs
3. Protocol: TCP, Local port: 3389
4. Scope: Remote IP → add `192.168.1.0/24`
5. Action: **Allow**
6. Profile: Domain
7. Name: "Allow RDP from Management"

---

## Create Rules via PowerShell and Deploy

```powershell
# Create rule locally (can also be scripted via GPO startup script)
New-NetFirewallRule -DisplayName "Allow HTTPS Outbound" `
  -Direction Outbound -Protocol TCP -RemotePort 443 -Action Allow `
  -Profile Domain,Private

# Block an application via GPO startup script
New-NetFirewallRule -DisplayName "Block Torrent App" `
  -Direction Outbound `
  -Program "C:\Program Files\uTorrent\uTorrent.exe" `
  -Action Block -Profile Any

# Export rules for import via GPO
netsh advfirewall export "C:\NETLOGON\firewall-policy.wfw"
```

---

## Import Firewall Policy via GPO Startup Script

1. Place `firewall-policy.wfw` in SYSVOL or NETLOGON share
2. GPO → **Computer Configuration** → **Windows Settings** → **Scripts (Startup)**
3. Add script:
```cmd
netsh advfirewall import "\\domain\NETLOGON\firewall-policy.wfw"
```

---

## Block All Inbound Except Specified (Lockdown Mode)

```powershell
# Set all profiles to block inbound
Set-NetFirewallProfile -Profile Domain,Private,Public `
  -DefaultInboundAction Block -Enabled True

# Then add only needed allow rules
New-NetFirewallRule -DisplayName "Allow DNS" `
  -Direction Inbound -Protocol UDP -LocalPort 53 -Action Allow

New-NetFirewallRule -DisplayName "Allow ICMP" `
  -Direction Inbound -Protocol ICMPv4 -Action Allow
```

---

## Audit Firewall Events via GPO

Enable firewall logging through GPO:

`Computer Configuration` → `Windows Settings` → `Security Settings` → `Advanced Audit Policy Configuration` → `System Audit Policies` → `Object Access` → **Audit Filtering Platform Packet Drop** → Success and Failure

```powershell
# View blocked connection events
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=5152} -MaxEvents 20 |
  Select-Object TimeCreated, Message
```

---

## Verify GPO Firewall Rules Applied

```powershell
# Check which rules came from GPO
Get-NetFirewallRule | Where-Object {$_.PolicyStoreSourceType -eq 'GroupPolicy'} |
  Select-Object DisplayName, Direction, Action, Enabled

# Force GPO refresh
gpupdate /force
```

---


---


## Summary

Use GPO **Windows Defender Firewall with Advanced Security** node to deploy rules domain-wide. Set profiles to block inbound by default and add explicit allow rules for needed services. Use startup scripts to import complex rule sets via `netsh advfirewall import`. Verify applied rules with `Get-NetFirewallRule | Where-Object {$_.PolicyStoreSourceType -eq 'GroupPolicy'}`.
