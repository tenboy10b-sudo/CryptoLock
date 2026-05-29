---
title: "How to Set Up a Local DNS with Pi-hole or Windows DNS Server"
date: "2026-04-24"
publishDate: "2026-04-24"
description: "Block ads and malware network-wide with a local DNS server. Set up Pi-hole on Windows via WSL or use Windows Server DNS role for corporate environments."
tags: ["windows", "network", "dns", "administration"]
readTime: 6
---

A local DNS server lets you control name resolution for your entire network — blocking ads, malware domains, and custom internal domain names. Here are two practical setups.

---

## Option 1: Pi-hole on Windows via WSL

Pi-hole is the most popular network-wide ad blocker. Running it in WSL makes it available on Windows without a separate machine.

**Prerequisites:**
- WSL 2 with Ubuntu installed
- Static IP on your Windows PC (needed so router can point DNS at it)

**Install Pi-hole:**
```bash
# In WSL Ubuntu
curl -sSL https://install.pi-hole.net | bash
```

Follow the interactive installer. Note the admin password it sets.

**Configure WSL networking:**

In `C:\Users\YourName\.wslconfig`:
```ini
[wsl2]
networkingMode=mirrored
```

This makes WSL use the same IP as Windows, so Pi-hole is accessible at your PC's IP.

**Point your router to use Pi-hole as DNS:**
Router admin panel → DHCP settings → DNS server → enter your PC's local IP (e.g., `192.168.1.100`)

All devices on your network now use Pi-hole for DNS.

**Pi-hole web interface:**
`http://YOUR-PC-IP/admin` → Dashboard shows blocked domains, queries, top clients.

---

## Keep Pi-hole Running

```powershell
# Start WSL and Pi-hole on Windows startup
$action = New-ScheduledTaskAction -Execute "wsl.exe" `
  -Argument "-d Ubuntu -u root service pihole-FTL start"
$trigger = New-ScheduledTaskTrigger -AtStartup
New-ScheduledTaskPrincipal -UserId "SYSTEM" -RunLevel Highest |
  Register-ScheduledTask -TaskName "PiHole WSL" -Action $action -Trigger $trigger -Force
```

---

## Option 2: Windows DNS Server (Enterprise)

For Windows Server or corporate environments, the DNS Server role provides full-featured DNS.

**Install DNS role:**
```powershell
# On Windows Server
Install-WindowsFeature -Name DNS -IncludeManagementTools

# Or on Windows 10/11 with RSAT installed
Get-WindowsCapability -Name "Rsat.DNS.Tools*" -Online | Add-WindowsCapability -Online
```

**Open DNS Manager:**
`Win + S` → **DNS** or `dnsmgmt.msc`

---

## Create a Custom DNS Zone

Useful for internal domain names (e.g., `myapp.local` pointing to an internal server):

```powershell
# Create forward lookup zone
Add-DnsServerPrimaryZone -Name "company.local" -ZoneFile "company.local.dns" -DynamicUpdate None

# Add A record
Add-DnsServerResourceRecordA -ZoneName "company.local" -Name "server1" -IPv4Address "192.168.1.50"

# Add CNAME (alias)
Add-DnsServerResourceRecordCName -ZoneName "company.local" -Name "web" -HostNameAlias "server1.company.local"

# Verify
Resolve-DnsName "server1.company.local" -Server 127.0.0.1
```

---

## Configure Conditional Forwarding

Forward specific domains to different DNS servers:

```powershell
# Forward company.com queries to internal DNS
Add-DnsServerConditionalForwarderZone -Name "company.com" `
  -MasterServers "10.0.0.10" -PassThru

# Forward everything else to Cloudflare
Set-DnsServerForwarder -IPAddress "1.1.1.1", "1.0.0.1"
```

---

## Test DNS with nslookup

```powershell
# Query specific DNS server
nslookup google.com 1.1.1.1

# Test internal name
nslookup server1.company.local 192.168.1.100

# Check reverse lookup (IP → hostname)
nslookup 192.168.1.50

# Verbose mode
nslookup -debug google.com
```

---

## Flush DNS Cache on All Clients

After DNS changes, clients need to flush their cache:

```powershell
# Local machine
Clear-DnsClientCache

# Remote PC (requires PowerShell Remoting)
Invoke-Command -ComputerName "ClientPC" -ScriptBlock {Clear-DnsClientCache}

# Flush all PCs in a list
$computers = @("PC1","PC2","PC3")
Invoke-Command -ComputerName $computers -ScriptBlock {Clear-DnsClientCache}
```

---

## Block Domains via Windows HOSTS File

For a single PC (no DNS server needed), block domains in the HOSTS file:

```powershell
# Add to C:\Windows\System32\drivers\etc\hosts as Administrator
$domainsToBlock = @(
  "ads.example.com",
  "tracker.analytics.com",
  "malware-domain.com"
)

$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$domainsToBlock | ForEach-Object {
  "0.0.0.0 $_" | Add-Content $hostsPath
}

# Clear DNS cache after
Clear-DnsClientCache
```

---

## Summary

For home network ad blocking: Pi-hole in WSL with mirrored networking — point router to your PC's IP. For corporate internal DNS: Windows DNS Server role with custom zones. For single-machine blocking: HOSTS file. Test all DNS changes with `nslookup` and flush client caches after changes.
