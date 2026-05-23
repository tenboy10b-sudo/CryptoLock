---
title: "How to Change DNS Server in Windows 10 and 11 (All Methods)"
date: "2024-04-15"
publishDate: "2024-04-15"
updated: "2026-05-23"
description: "Change DNS server in Windows 10 and 11 via Settings, PowerShell, CMD, and network adapter. Use Cloudflare 1.1.1.1 or Google 8.8.8.8 for faster, more private browsing."
tags: ["windows", "network", "settings", "privacy"]
readTime: 5
---

Changing your DNS server can improve browsing speed, bypass some restrictions, and increase privacy. Here are all methods for Windows 10 and 11.

---

## Best DNS Servers to Use

| Provider | Primary | Secondary | Features |
|----------|---------|-----------|---------|
| **Cloudflare** | `1.1.1.1` | `1.0.0.1` | Fastest, privacy-focused |
| **Google** | `8.8.8.8` | `8.8.4.4` | Reliable, fast |
| **Quad9** | `9.9.9.9` | `149.112.112.112` | Blocks malware domains |
| **OpenDNS** | `208.67.222.222` | `208.67.220.220` | Family filtering available |

---

## Method 1: Via Settings (Windows 11)

`Win + I` → **Network & Internet** → **Wi-Fi** or **Ethernet** → click your connection → **Edit** next to DNS server assignment → **Manual** → enable IPv4:

- Preferred DNS: `1.1.1.1`
- Alternate DNS: `1.0.0.1`

Click **Save**.

---

## Method 2: Via Network Adapter Properties (Windows 10 and 11)

`Win + R` → `ncpa.cpl` → right-click your adapter → **Properties** → **Internet Protocol Version 4 (TCP/IPv4)** → **Properties**

Select **Use the following DNS server addresses:**
- Preferred: `1.1.1.1`
- Alternate: `1.0.0.1`

Click OK.

---

## Method 3: PowerShell (Fastest)

```powershell
# Find your adapter name
Get-NetAdapter | Where-Object {$_.Status -eq "Up"} | Select-Object Name, InterfaceDescription

# Set DNS — replace "Wi-Fi" with your adapter name
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses ("1.1.1.1","1.0.0.1")

# For Ethernet
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses ("1.1.1.1","1.0.0.1")

# Verify
Get-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -AddressFamily IPv4

# Flush DNS cache after changing
Clear-DnsClientCache
ipconfig /flushdns
```

---

## Method 4: CMD

```cmd
rem View adapter names
netsh interface show interface

rem Set DNS — replace "Wi-Fi" with your adapter name
netsh interface ip set dns "Wi-Fi" static 1.1.1.1
netsh interface ip add dns "Wi-Fi" 1.0.0.1 index=2

rem Verify
netsh interface ip show dns "Wi-Fi"

rem Flush DNS
ipconfig /flushdns
```

---

## Set DNS for All Adapters at Once

```powershell
# Change DNS on all active adapters simultaneously
Get-NetAdapter | Where-Object {$_.Status -eq "Up"} | ForEach-Object {
  Set-DnsClientServerAddress -InterfaceAlias $_.Name -ServerAddresses ("1.1.1.1","1.0.0.1")
  Write-Host "Set DNS on: $($_.Name)"
}
Clear-DnsClientCache
```

---

## Revert to Automatic DNS (DHCP)

```powershell
# Reset to automatic (ISP-assigned) DNS
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ResetServerAddresses
```

```cmd
netsh interface ip set dns "Wi-Fi" dhcp
```

---

## Test Your New DNS

```powershell
# Test DNS resolution speed
Measure-Command { Resolve-DnsName google.com } | Select-Object TotalMilliseconds

# Check which DNS server is being used
Get-DnsClientServerAddress -AddressFamily IPv4

# Verify Cloudflare DNS is responding
nslookup google.com 1.1.1.1
```

---

## DNS over HTTPS (DoH) — Windows 11 Only

Windows 11 supports encrypted DNS natively:

`Win + I` → **Network & Internet** → adapter → **Edit DNS** → set server to `1.1.1.1` → **DNS over HTTPS** → **On (automatic template)**

This encrypts DNS queries so your ISP can't see which domains you're looking up.

---

## Summary

Fastest method: PowerShell `Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses ("1.1.1.1","1.0.0.1")`. Always flush DNS after changing: `Clear-DnsClientCache`. Best DNS for speed: Cloudflare `1.1.1.1`. Best for blocking malware: Quad9 `9.9.9.9`. Windows 11 supports DNS over HTTPS for encrypted lookups.
