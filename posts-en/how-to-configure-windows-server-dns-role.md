---
title: "How to Configure Windows DNS Server: Zones, Records and PowerShell"
date: "2026-06-13"
publishDate: "2026-06-13"
description: "Set up Windows Server DNS role. Create forward and reverse lookup zones, add A, CNAME, MX records, configure forwarders and manage DNS via PowerShell."
tags: ["windows", "dns", "server", "network", "administration", "powershell"]
readTime: 6
translatesUk: "nalashtuvannya-dns-servera-windows"
---

Windows Server DNS is the backbone of Active Directory and internal name resolution. Here's how to install it and manage every aspect via PowerShell.

---

## Install DNS Server Role

```powershell
# Install DNS role with management tools
Install-WindowsFeature DNS -IncludeManagementTools

# Start the DNS service
Start-Service DNS
Set-Service DNS -StartupType Automatic

# Verify
Get-WindowsFeature DNS
```

---

## Create a Forward Lookup Zone

```powershell
# Primary zone (authoritative for internal domain)
Add-DnsServerPrimaryZone -Name "company.local" `
  -ReplicationScope "Domain" `
  -DynamicUpdate Secure

# Secondary zone (read-only copy from primary)
Add-DnsServerSecondaryZone -Name "company.local" `
  -ZoneFile "company.local.dns" `
  -MasterServers "192.168.1.10"

# List all zones
Get-DnsServerZone | Select-Object ZoneName, ZoneType, IsDsIntegrated
```

---

## Create a Reverse Lookup Zone

```powershell
# Reverse zone for 192.168.1.0/24
Add-DnsServerPrimaryZone -NetworkId "192.168.1.0/24" `
  -ReplicationScope "Domain"

# List reverse zones
Get-DnsServerZone | Where-Object {$_.IsReverseLookupZone}
```

---

## Add DNS Records

```powershell
# A record (hostname to IP)
Add-DnsServerResourceRecordA -ZoneName "company.local" `
  -Name "webserver" -IPv4Address "192.168.1.20"

# CNAME record (alias)
Add-DnsServerResourceRecordCName -ZoneName "company.local" `
  -Name "www" -HostNameAlias "webserver.company.local"

# MX record (mail)
Add-DnsServerResourceRecordMX -ZoneName "company.local" `
  -Name "@" -MailExchange "mail.company.local" -Preference 10

# TXT record (SPF, verification etc)
Add-DnsServerResourceRecordTxt -ZoneName "company.local" `
  -Name "@" -DescriptiveText "v=spf1 ip4:192.168.1.0/24 ~all"

# PTR record (reverse lookup)
Add-DnsServerResourceRecordPtr -ZoneName "1.168.192.in-addr.arpa" `
  -Name "20" -PtrDomainName "webserver.company.local"
```

---

## View and Manage Records

```powershell
# All records in a zone
Get-DnsServerResourceRecord -ZoneName "company.local" |
  Select-Object HostName, RecordType, @{n='Data';e={$_.RecordData.IPv4Address}}

# Specific record type
Get-DnsServerResourceRecord -ZoneName "company.local" -RRType "A" |
  Select-Object HostName, @{n='IP';e={$_.RecordData.IPv4Address}}

# Find a specific host
Get-DnsServerResourceRecord -ZoneName "company.local" -Name "webserver"

# Delete a record
Remove-DnsServerResourceRecord -ZoneName "company.local" `
  -Name "webserver" -RRType "A" -RecordData "192.168.1.20" -Force
```

---

## Configure Forwarders

```powershell
# Add DNS forwarders (for external resolution)
Add-DnsServerForwarder -IPAddress "1.1.1.1" -PassThru
Add-DnsServerForwarder -IPAddress "8.8.8.8" -PassThru

# View forwarders
Get-DnsServerForwarder

# Remove a forwarder
Remove-DnsServerForwarder -IPAddress "8.8.8.8"

# Use root hints instead of forwarders
Set-DnsServerForwarder -UseRootHint $true
```

---

## DNS Conditional Forwarders

Forward specific domains to specific DNS servers:

```powershell
# Forward azure.com queries to Azure DNS
Add-DnsServerConditionalForwarderZone -Name "azure.com" `
  -MasterServers "168.63.129.16" `
  -PassThru

Get-DnsServerZone | Where-Object {$_.ZoneType -eq "Forwarder"}
```

---

## Test DNS Resolution

```powershell
# Test from server
Resolve-DnsName "webserver.company.local" -Server "192.168.1.10"

# Test reverse lookup
Resolve-DnsName "192.168.1.20" -Server "192.168.1.10"

# Check DNS server statistics
Get-DnsServerStatistics
```

---

## Summary

Install with `Install-WindowsFeature DNS`. Create zones with `Add-DnsServerPrimaryZone`. Add records with `Add-DnsServerResourceRecord*`. Configure forwarders for internet resolution. Use conditional forwarders for hybrid cloud scenarios.

## Frequently Asked Questions

### What's the difference between DNS forwarders and root hints?

Forwarders send unknown queries to specific upstream DNS servers (like 1.1.1.1). Root hints resolve queries by walking the DNS hierarchy from root servers down. Forwarders are faster for corporate environments.

### DNS zone transfers — should I enable them?

Only to specific secondary DNS servers. Unrestricted zone transfers expose all your internal hostnames. Configure: `Set-DnsServerPrimaryZone -ZoneName "company.local" -SecureSecondaries TransferToSecureServers`.

### How do I migrate DNS zones from one server to another?

Export zone files: `Export-DnsServerZone -ZoneName "company.local" -Filename "company.local.dns"`. Copy to new server and import: `Add-DnsServerPrimaryZone -Name "company.local" -ZoneFile "company.local.dns"`.
