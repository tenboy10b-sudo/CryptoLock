---
title: "How to Configure Windows Firewall: Rules, Ports, and Blocking Apps"
date: "2026-05-11"
publishDate: "2026-05-11"
description: "Configure Windows Firewall to block or allow specific apps, open ports, and create inbound and outbound rules. Covers both GUI and PowerShell methods."
tags: ["windows", "security", "firewall", "network"]
readTime: 6
---

Windows Firewall blocks unauthorized network traffic by default. Most users never touch it — but when you need to open a port, block an app, or troubleshoot a connection issue, knowing how it works saves time.

---

## Check Firewall Status

```powershell
Get-NetFirewallProfile | Select-Object Name, Enabled
```

All three profiles (Domain, Private, Public) should show `Enabled: True`. If any is disabled:

```powershell
Set-NetFirewallProfile -All -Enabled True
```

---

## Allow an App Through Firewall

**GUI:**
`Win + R` → `firewall.cpl` → **Allow an app or feature through Windows Defender Firewall** → **Change settings** → **Allow another app** → Browse to the executable.

**PowerShell:**
```powershell
New-NetFirewallRule -DisplayName "My App" `
  -Direction Inbound `
  -Program "C:\Program Files\MyApp\myapp.exe" `
  -Action Allow `
  -Profile Private,Public
```

---

## Open a Specific Port

Common need: game servers, web servers, remote tools.

```powershell
# Open TCP port 8080 inbound
New-NetFirewallRule -DisplayName "HTTP 8080" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 8080 `
  -Action Allow

# Open UDP port 27015 (game server example)
New-NetFirewallRule -DisplayName "Game Server UDP" `
  -Direction Inbound `
  -Protocol UDP `
  -LocalPort 27015 `
  -Action Allow
```

---

## Block an App from Accessing the Internet

Useful for blocking telemetry, preventing a program from phoning home, or restricting a specific app.

```powershell
# Block outbound for a specific executable
New-NetFirewallRule -DisplayName "Block MyApp Outbound" `
  -Direction Outbound `
  -Program "C:\Program Files\MyApp\myapp.exe" `
  -Action Block
```

---

## Block a Specific IP Address

```powershell
# Block inbound from specific IP
New-NetFirewallRule -DisplayName "Block IP" `
  -Direction Inbound `
  -RemoteAddress "192.168.1.100" `
  -Action Block

# Block a range
New-NetFirewallRule -DisplayName "Block IP Range" `
  -Direction Inbound `
  -RemoteAddress "10.0.0.0/8" `
  -Action Block
```

---

## List and Manage Existing Rules

```powershell
# List all enabled inbound rules
Get-NetFirewallRule -Direction Inbound -Enabled True | Select-Object DisplayName, Action, Profile

# Find rule by name
Get-NetFirewallRule -DisplayName "*Remote Desktop*"

# Disable a rule without deleting
Disable-NetFirewallRule -DisplayName "My App"

# Delete a rule
Remove-NetFirewallRule -DisplayName "My App"
```

---

## Advanced Firewall (wf.msc)

For more control: `Win + R` → `wf.msc`

This opens **Windows Defender Firewall with Advanced Security** — shows all rules, allows filtering by profile, protocol, port, and program simultaneously. Useful for diagnosing why something is blocked.

Right-click **Inbound Rules** → **New Rule** for a wizard that covers all scenarios.

---

## Reset to Defaults

If firewall rules become a mess:

```powershell
netsh advfirewall reset
```

This removes all custom rules and restores factory defaults. All custom Allow/Block rules will be deleted.

---

## Common Scenarios

| Need | Direction | What to specify |
|------|-----------|-----------------|
| Run a local web server | Inbound | TCP port 80/443 |
| Allow RDP | Inbound | TCP port 3389 |
| Block app from internet | Outbound | Program path |
| Block a suspicious IP | Inbound | Remote IP address |
| Allow VPN traffic | Inbound/Outbound | Protocol + port |

---

## Summary

For most cases: use `New-NetFirewallRule` in PowerShell — faster than the GUI. For complex rules combining program + port + IP, use `wf.msc`. Always specify the correct direction — inbound for connections coming in, outbound for connections going out.
