---
title: "Windows Firewall Advanced Security: Inbound and Outbound Rules"
date: "2026-03-31"
publishDate: "2026-03-31"
description: "Master Windows Firewall with Advanced Security (wf.msc): create inbound and outbound rules by port, program, IP, and protocol. Export rules and use PowerShell for automation."
tags: ["windows", "security", "firewall", "network"]
readTime: 6
---

The basic Windows Firewall in Control Panel handles simple allow/block decisions. Windows Firewall with Advanced Security (`wf.msc`) gives you precise control over every connection by program, port, protocol, IP, and profile.

---

## Open Advanced Firewall

`Win + R` → `wf.msc`

Or: `Win + S` → **Windows Defender Firewall with Advanced Security**

Three sections:
- **Inbound Rules** — traffic coming into your PC
- **Outbound Rules** — traffic leaving your PC
- **Connection Security Rules** — IPsec rules (advanced)

---

## Understanding Profiles

Rules apply to one or more profiles:
- **Domain** — PC joined to a corporate domain
- **Private** — home/office network (trusted)
- **Public** — untrusted network (coffee shop, airport)

A rule can apply to all three or be restricted to specific ones.

---

## Create an Inbound Rule

Right-click **Inbound Rules** → **New Rule** → choose rule type:

**Port:**
- Specify TCP or UDP
- Enter port number(s): `80`, `443`, `8080-8090`, `3389`
- Allow or Block the connection
- Select profiles (Domain, Private, Public)
- Name the rule

**Program:**
- Browse to the executable
- Allow or Block all connections from that program

**Predefined:**
- Choose from built-in Windows services (RDP, FTP, etc.)

**Custom:**
- Combine program + port + IP + protocol in one rule

---

## Create an Outbound Rule

Same process, but via **Outbound Rules**.

Useful outbound rules:
```powershell
# Block a program from accessing the internet
New-NetFirewallRule -DisplayName "Block Chrome Outbound" `
  -Direction Outbound `
  -Program "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  -Action Block -Profile Any

# Allow only specific ports outbound
New-NetFirewallRule -DisplayName "Allow HTTPS Only" `
  -Direction Outbound -Protocol TCP `
  -RemotePort 443 -Action Allow
```

---

## Filter by IP Address

```powershell
# Block incoming from specific IP
New-NetFirewallRule -DisplayName "Block IP" `
  -Direction Inbound `
  -RemoteAddress "203.0.113.1" `
  -Action Block

# Allow SSH only from trusted IP range
New-NetFirewallRule -DisplayName "SSH from Office" `
  -Direction Inbound -Protocol TCP -LocalPort 22 `
  -RemoteAddress "192.168.1.0/24" `
  -Action Allow

# Block entire country range (example)
New-NetFirewallRule -DisplayName "Block Range" `
  -Direction Inbound `
  -RemoteAddress "185.0.0.0/8" `
  -Action Block
```

---

## Manage Rules via PowerShell

```powershell
# List all enabled inbound rules
Get-NetFirewallRule -Direction Inbound -Enabled True |
  Select-Object DisplayName, Action, Profile | Format-Table

# Find rules for specific port
Get-NetFirewallRule | Get-NetFirewallPortFilter |
  Where-Object {$_.LocalPort -eq 3389} |
  ForEach-Object {Get-NetFirewallRule -AssociatedNetFirewallPortFilter $_} |
  Select-Object DisplayName, Enabled, Action

# Disable a rule
Disable-NetFirewallRule -DisplayName "Remote Desktop - User Mode (TCP-In)"

# Enable a rule
Enable-NetFirewallRule -DisplayName "Remote Desktop - User Mode (TCP-In)"

# Delete a rule
Remove-NetFirewallRule -DisplayName "My Custom Rule"
```

---

## Export and Import Rules

Backup all firewall rules:
```powershell
# Export to XML
netsh advfirewall export "C:\firewall-backup.wfw"

# Import
netsh advfirewall import "C:\firewall-backup.wfw"
```

---

## Audit Firewall Activity

Enable logging to see blocked connections:

`wf.msc` → click **Windows Defender Firewall with Advanced Security** (root) → **Properties** → **Private Profile** tab → **Logging** → **Customize**:
- Log dropped packets: **Yes**
- Log file: `%systemroot%\system32\LogFiles\Firewall\pfirewall.log`

```powershell
# View recent blocked connections
Get-Content "$env:SystemRoot\System32\LogFiles\Firewall\pfirewall.log" |
  Select-Object -Last 30
```

---

## Reset Firewall to Defaults

```powershell
netsh advfirewall reset
```

This removes all custom rules and restores factory defaults. All custom Allow/Block rules are deleted.

---


---

## 🛡️ Перевір безпеку свого ПК

Хочеш знати чи немає витоків даних, зайвих служб або підозрілих програм на твоєму ПК?

**[→ AuditShield](/tools/auditshield)** — аудит Windows по 22 напрямках за 10 хвилин. HTML-звіт з оцінкою ризику. Є безкоштовне демо.


## Summary

Open `wf.msc` for granular control. Create inbound rules to allow specific ports or programs, outbound rules to restrict what apps can connect to. Use PowerShell `New-NetFirewallRule` for scripted deployments. Enable logging to audit blocked connections. Export rules before making major changes so you can restore them.
