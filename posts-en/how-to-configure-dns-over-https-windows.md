---
title: "How to Enable DNS over HTTPS (DoH) in Windows 11 and 10"
date: "2026-05-13"
publishDate: "2026-05-13"
description: "Enable DNS over HTTPS (DoH) in Windows 11 natively and Windows 10 via browser or third-party tools. Encrypt DNS queries and improve privacy with Cloudflare or Google."
tags: ["windows", "dns", "privacy", "security", "network"]
readTime: 4
translatesUk: "dns-over-https-windows"
---

DNS over HTTPS encrypts your DNS queries — without it, your ISP and anyone on the network can see every website you look up even if you use HTTPS.

---

## Enable DoH in Windows 11 (Native)

Windows 11 has built-in DNS over HTTPS support:

`Win + I` → **Network & Internet** → **Wi-Fi** or **Ethernet** → click connection → **DNS server assignment** → **Edit** → **Manual**

Set:
- **IPv4 Preferred DNS:** `1.1.1.1`
- **DNS over HTTPS:** On (Automatic template)
- **IPv4 Alternate DNS:** `1.0.0.1`
- **DNS over HTTPS:** On

---

## Enable DoH via PowerShell (Windows 11)

```powershell
# Set Cloudflare DoH
Add-DnsClientDohServerAddress -ServerAddress "1.1.1.1" `
  -DohTemplate "https://cloudflare-dns.com/dns-query" `
  -AllowFallbackToUdp $false -AutoUpgrade $true

Add-DnsClientDohServerAddress -ServerAddress "1.0.0.1" `
  -DohTemplate "https://cloudflare-dns.com/dns-query" `
  -AllowFallbackToUdp $false -AutoUpgrade $true

# Set as active DNS
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses ("1.1.1.1", "1.0.0.1")

# Verify
Get-DnsClientDohServerAddress
```

---

## DoH Server Options

| Provider | DNS IP | DoH Template |
|---------|--------|-------------|
| **Cloudflare** | 1.1.1.1 | https://cloudflare-dns.com/dns-query |
| **Google** | 8.8.8.8 | https://dns.google/dns-query |
| **Quad9** | 9.9.9.9 | https://dns.quad9.net/dns-query |
| **NextDNS** | varies | https://dns.nextdns.io/YOUR_ID |

---

## Enable DoH in Browsers (Windows 10 / Any OS)

**Chrome:**
Settings → Privacy and Security → Security → **Use secure DNS** → With: Custom → enter `https://cloudflare-dns.com/dns-query`

**Firefox:**
Settings → Privacy & Security → DNS over HTTPS → **Max Protection** → select provider

**Edge:**
Settings → Privacy, search and services → Security → **Use secure DNS** → Custom

---

## Verify DoH is Working

```powershell
# Check current DNS server
Get-DnsClientServerAddress -AddressFamily IPv4 | Where-Object {$_.ServerAddresses}

# Test DNS resolution
Resolve-DnsName cloudflare.com -Server 1.1.1.1
```

Visit: `https://1.1.1.1/help` — shows if DoH is active for your connection.

---

## DoH via Registry (Windows 10)

```powershell
# Enable DoH for specific adapter in registry
$adapter = (Get-NetAdapter | Where-Object {$_.Status -eq "Up"}).InterfaceIndex

Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Services\Dnscache\Parameters" `
  -Name "EnableAutoDoh" -Value 2 -Type DWord
```

---

## Summary

Windows 11: enable in Network settings per adapter or via `Add-DnsClientDohServerAddress`. Windows 10: enable in browser settings. Cloudflare (1.1.1.1) is fastest and most privacy-focused. Verify at 1.1.1.1/help.

## Frequently Asked Questions

### Does DoH make browsing slower?

No — DNS lookups are cached and DoH adds only 1-5ms per uncached lookup. The privacy benefit far outweighs any imperceptible latency difference.

### Does DoH hide my browsing from my ISP completely?

It hides DNS lookups but not SNI (Server Name Indication) in TLS. Your ISP can still see which IPs you connect to. For full privacy, use a VPN or Tor in addition to DoH.

### Should I use DoH on a corporate network?

Be careful — corporate networks often rely on internal DNS for resources like printers and file servers. DoH can bypass internal DNS and break access to corporate resources. Check with IT first.
