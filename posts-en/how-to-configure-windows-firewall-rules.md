---
title: "How to Configure Windows Firewall: Rules, Profiles, and Advanced Security"
date: "2026-05-06"
updated: "2026-08-13"
publishDate: "2026-05-06"
description: "Configure Windows Firewall via GUI and PowerShell: check status, allow/block apps and ports, create inbound/outbound rules, understand profiles, export config, monitor connections and troubleshoot blocked traffic."
tags: ["windows", "firewall", "network", "security", "powershell"]
readTime: 8
translatesUk: "windows-firewall-nalashtuvannya-pravyl"
---

Windows Defender Firewall with Advanced Security gives you granular control over every network connection. Here's how to use it effectively.

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

## Understanding Firewall Profiles

Rules apply to one or more profiles:
- **Domain** — PC joined to a corporate domain
- **Private** — home/office network (trusted)
- **Public** — untrusted network (coffee shop, airport)

A rule can apply to all three or be restricted to specific ones — that's what the `-Profile` parameter controls in the examples below.

---

## Open Advanced Firewall

```powershell
# Open advanced firewall GUI
wf.msc

# Or via PowerShell
Show-NetFirewallRule | Out-GridView
```

---

## Create a Rule via the GUI Wizard

Prefer clicking over scripting? `wf.msc` → right-click **Inbound Rules** (or **Outbound Rules**) → **New Rule**:

- **Port** — specify TCP/UDP and port number(s), then Allow or Block
- **Program** — browse to the executable, Allow or Block all its connections
- **Predefined** — pick from built-in Windows services (RDP, FTP, etc.)
- **Custom** — combine program + port + IP + protocol in one rule

**GUI shortcut for allowing an app:** `Win + R` → `firewall.cpl` → **Allow an app or feature through Windows Defender Firewall** → **Change settings** → **Allow another app**.

---

## Create Inbound Rule

```powershell
# Allow specific app inbound
New-NetFirewallRule -DisplayName "Allow MyApp" `
  -Direction Inbound `
  -Program "C:\Apps\myapp.exe" `
  -Action Allow `
  -Profile Domain,Private

# Block all inbound on specific port
New-NetFirewallRule -DisplayName "Block Port 23" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 23 `
  -Action Block

# Allow port range
New-NetFirewallRule -DisplayName "Allow Ports 8000-8100" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 8000-8100 `
  -Action Allow `
  -RemoteAddress LocalSubnet
```

---

## Create Outbound Rule

```powershell
# Block app from internet access
New-NetFirewallRule -DisplayName "Block App Outbound" `
  -Direction Outbound `
  -Program "C:\Apps\telemetry.exe" `
  -Action Block

# Allow outbound only to specific IPs
New-NetFirewallRule -DisplayName "Office Traffic Only" `
  -Direction Outbound `
  -RemoteAddress "10.0.0.0/8","192.168.0.0/16" `
  -Action Allow
```

---

## View and Filter Rules

```powershell
# All enabled inbound rules
Get-NetFirewallRule -Direction Inbound -Enabled True |
  Select-Object DisplayName, Action, Profile |
  Sort-Object DisplayName

# Rules for specific port
Get-NetFirewallRule | ForEach-Object {
  $rule = $_
  $portFilter = $_ | Get-NetFirewallPortFilter
  if ($portFilter.LocalPort -contains "3389") {
    $rule | Select-Object DisplayName, Enabled, Action
  }
}

# Rules for specific program
Get-NetFirewallRule | Get-NetFirewallApplicationFilter |
  Where-Object {$_.Program -like "*chrome*"}
```

---

## Enable Firewall Logging

```powershell
# Log dropped packets for all profiles
Set-NetFirewallProfile -Profile Domain,Public,Private `
  -LogBlocked True `
  -LogFileName "C:\Windows\System32\LogFiles\Firewall\pfirewall.log" `
  -LogMaxSizeKilobytes 4096

# View recent drops
Get-Content "C:\Windows\System32\LogFiles\Firewall\pfirewall.log" -Tail 30 |
  Where-Object {$_ -like "*DROP*"}
```

---

## Block Country IP Ranges

```powershell
# Example: block a known malicious subnet
New-NetFirewallRule -DisplayName "Block Malicious Range" `
  -Direction Inbound `
  -RemoteAddress "185.220.101.0/24","185.220.102.0/24" `
  -Action Block `
  -Profile Any

# Block multiple ranges from a file
$badIPs = Get-Content "C:\blocklist.txt"
New-NetFirewallRule -DisplayName "Block Threat IPs" `
  -Direction Inbound `
  -RemoteAddress $badIPs `
  -Action Block
```

---

## Export and Import Firewall Config

```powershell
# Export all rules
netsh advfirewall export "C:\Backup\firewall.wfw"

# Import on another machine
netsh advfirewall import "C:\Backup\firewall.wfw"

# Reset to Windows defaults
netsh advfirewall reset
```

---

## Monitor Active Connections

```powershell
# Active connections with process names
Get-NetTCPConnection -State Established | ForEach-Object {
  $proc = Get-Process -Id $_.OwningProcess -EA 0
  [PSCustomObject]@{
    Local  = "$($_.LocalAddress):$($_.LocalPort)"
    Remote = "$($_.RemoteAddress):$($_.RemotePort)"
    Process = $proc.Name
    PID = $_.OwningProcess
  }
} | Sort-Object Process | Format-Table -AutoSize
```

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

Use `New-NetFirewallRule` for scripted rule creation. Enable logging to diagnose blocked traffic. Export config with `netsh advfirewall export` before bulk changes. Monitor connections with `Get-NetTCPConnection` to identify what to block.

## Frequently Asked Questions

### How do I find which firewall rule is blocking an app?

Enable firewall logging (above), reproduce the block, then check the log for DROP entries matching your app's port. The log shows source/destination IP and port for each dropped packet.

### Do firewall rules survive a Windows reset?

No — Reset removes all custom firewall rules. Always export with `netsh advfirewall export` before any reset. Rules also survive Windows updates.

### What's the difference between Domain, Private and Public profiles?

Domain = corporate network detected by Windows. Private = home/trusted network. Public = café, hotel, unknown network. Rules apply to specific profiles — a rule for Private won't fire on Public networks.
