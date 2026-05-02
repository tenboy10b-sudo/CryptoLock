---
title: "How to Change DNS Server in Windows 10 and 11"
date: "2026-05-06"
publishDate: "2026-05-06"
description: "Change your DNS to Cloudflare, Google, or custom servers in Windows using Settings, Control Panel, and PowerShell. Includes DNS benchmark tips and privacy-focused options."
tags: ["windows", "network", "dns", "privacy"]
readTime: 5
---

Your ISP's default DNS is often slow and logs your queries. Switching to a faster, more private DNS takes two minutes and can noticeably speed up browsing.

---

## Method 1: Settings (Windows 11)

`Win + I` → **Network & Internet** → click your connection (Wi-Fi or Ethernet) → **Hardware properties** → **DNS server assignment** → **Edit** → change to **Manual**

Enable **IPv4**, enter:
- **Preferred DNS**: `1.1.1.1`
- **Alternate DNS**: `1.0.0.1`

Click **Save**.

---

## Method 2: Control Panel (Windows 10 and 11)

`Win + R` → `ncpa.cpl` → right-click your connection → **Properties** → select **Internet Protocol Version 4 (TCP/IPv4)** → **Properties**

Select **Use the following DNS server addresses** and enter your preferred DNS.

---

## Method 3: PowerShell

```powershell
# Get interface name
Get-NetAdapter | Select-Object Name, Status

# Set DNS (replace "Wi-Fi" with your interface name)
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses ("1.1.1.1", "1.0.0.1")

# Verify
Get-DnsClientServerAddress -InterfaceAlias "Wi-Fi"
```

---

## Popular DNS Options

| Provider | Primary | Secondary | Notes |
|----------|---------|-----------|-------|
| Cloudflare | `1.1.1.1` | `1.0.0.1` | Fastest, privacy-focused |
| Google | `8.8.8.8` | `8.8.4.4` | Reliable, slightly slower |
| Quad9 | `9.9.9.9` | `149.112.112.112` | Blocks malicious domains |
| OpenDNS | `208.67.222.222` | `208.67.220.220` | Parental controls available |
| Cloudflare (no malware) | `1.1.1.2` | `1.0.0.2` | Blocks malware domains |

---

## Enable DNS over HTTPS (DoH)

Standard DNS is unencrypted — your ISP can see every domain you visit. DNS over HTTPS encrypts these queries.

**Windows 11:**
`Settings` → **Network & Internet** → your connection → **Hardware properties** → **DNS server assignment** → **Edit** → set DNS, then change **DNS over HTTPS** dropdown to **On (automatic template)**

**Via PowerShell:**
```powershell
# Enable DoH for Cloudflare
Set-DnsClientDohServerAddress -ServerAddress 1.1.1.1 -DohTemplate "https://cloudflare-dns.com/dns-query" -AllowFallbackToUdp $false -AutoUpgrade $true
```

---

## Flush DNS Cache After Changing

```cmd
ipconfig /flushdns
```

This clears cached DNS entries so all new requests use your new server immediately.

---

## Benchmark Your DNS

Different DNS servers perform differently depending on your location. Use **DNS Benchmark** (free, from grc.com) or **namebench** to test which server is fastest from your network.

Generally: Cloudflare (`1.1.1.1`) is fastest for most of Europe and North America. Google (`8.8.8.8`) is more consistent globally.

---

## Revert to Automatic DNS

```powershell
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ResetServerAddresses
```

Or in Settings/Control Panel: set back to **Obtain DNS server address automatically**.

---

## Summary

Switch to `1.1.1.1` (Cloudflare) for the best combination of speed and privacy. Enable DNS over HTTPS if you're on Windows 11. Flush DNS cache after changing. Run a benchmark if you want to find the fastest server for your specific location.
