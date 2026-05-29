---
title: "How to Fix DNS Not Resolving in Windows 10 and 11"
date: "2026-05-27"
publishDate: "2026-05-27"
description: "Fix DNS resolution failures in Windows: sites not loading, DNS_PROBE_FINISHED_NXDOMAIN errors. Flush DNS cache, change DNS servers, reset network stack."
tags: ["windows", "dns", "network", "troubleshooting", "errors"]
readTime: 5
---

DNS failures cause sites to fail loading even when internet is working. Here's a systematic approach to fix them.

---

## Quick Fixes First

```powershell
# 1. Flush DNS cache
Clear-DnsClientCache
ipconfig /flushdns

# 2. Restart DNS Client service
Restart-Service Dnscache -Force

# 3. Release and renew DHCP
ipconfig /release
ipconfig /renew
```

Test after each step. If these don't fix it, continue below.

---

## Change DNS Server

The most effective fix — switch from your ISP's DNS to a reliable public one:

```powershell
# Get your adapter name
Get-NetAdapter | Where-Object {$_.Status -eq "Up"} | Select-Object Name

# Set Cloudflare DNS (fast and privacy-focused)
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses ("1.1.1.1", "1.0.0.1")

# Or Google DNS
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses ("8.8.8.8", "8.8.4.4")

# Verify
Get-DnsClientServerAddress -InterfaceAlias "Wi-Fi"
```

---

## Test DNS Resolution

```powershell
# Test if DNS resolves a domain
Resolve-DnsName google.com

# Test with specific DNS server
Resolve-DnsName google.com -Server 1.1.1.1

# Check what DNS server is currently used
Get-DnsClientServerAddress | Where-Object {$_.AddressFamily -eq 2}  # IPv4

# Trace DNS query path
nslookup google.com
nslookup google.com 8.8.8.8  # test with specific server
```

---

## Reset Network Stack

```cmd
netsh winsock reset
netsh int ip reset
ipconfig /flushdns
ipconfig /registerdns
```

Restart after these commands.

---

## Fix DNS via Registry

```powershell
# Check DNS cache settings
Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Services\Dnscache\Parameters" -EA 0

# Reset DNS client settings
Remove-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Services\Dnscache\Parameters" `
  -Name "DnsPolicyConfig" -EA 0

# Ensure DNS Client service starts automatically
Set-Service Dnscache -StartupType Automatic
Start-Service Dnscache
```

---

## Check Hosts File

A modified hosts file can block specific domains:

```powershell
# View hosts file
Get-Content "C:\Windows\System32\drivers\etc\hosts"

# Any suspicious entries? Edit with:
notepad "C:\Windows\System32\drivers\etc\hosts"
```

Normal hosts file has only `127.0.0.1 localhost` and `::1 localhost` entries.

---

## Check for DNS Hijacking

```powershell
# Check if DNS is being redirected by malware
$expectedDNS = @("1.1.1.1", "8.8.8.8", "8.8.4.4", "1.0.0.1")
$currentDNS = (Get-DnsClientServerAddress -AddressFamily IPv4).ServerAddresses

$unexpected = $currentDNS | Where-Object {$_ -notin $expectedDNS -and $_ -ne ""}
if ($unexpected) {
  Write-Warning "Unexpected DNS servers: $unexpected"
  Write-Warning "This may indicate malware or unauthorized router changes"
}
```

---

## Summary

Try in order: flush DNS → restart Dnscache service → change to Cloudflare/Google DNS → reset network stack → check hosts file. Changing DNS server (1.1.1.1 or 8.8.8.8) fixes the majority of DNS issues permanently.

## Frequently Asked Questions

### Why does DNS fail only on specific sites?

The site's DNS records may be propagating (recently changed), or the site might be blocked by your ISP or government. Try accessing the IP directly or use a VPN to test.

### What does DNS_PROBE_FINISHED_NXDOMAIN mean?

The domain name could not be resolved — either it doesn't exist, DNS is failing, or the site is blocked. Run `nslookup domain.com` to diagnose further.

### Should I always use Google or Cloudflare DNS?

For most users, yes — they're faster and more reliable than ISP DNS. Cloudflare (1.1.1.1) prioritizes privacy. Google (8.8.8.8) prioritizes speed. If you're on a corporate network, use the IT-provided DNS to access internal resources.
