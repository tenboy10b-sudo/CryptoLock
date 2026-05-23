---
title: "Windows Update Taking Forever to Download or Install: How to Fix"
date: "2026-08-29"
publishDate: "2026-08-29"
description: "Windows Update downloading at 0 KB/s or stuck at the same percentage for hours? Speed up slow updates by resetting components, switching delivery sources, and clearing the update cache."
tags: ["windows", "windows-update", "troubleshooting", "optimization"]
readTime: 5
---

Windows Update can genuinely take a long time — but there's a difference between slow and broken. Here's how to tell them apart and fix the broken case.

---

## Is It Actually Stuck?

Before doing anything, check if it's working:

- **Open Task Manager** → Performance → Network — if network activity is present, it's downloading
- **Check disk activity** — if the drive light is blinking, it's installing
- **Wait 30-60 minutes** for large feature updates — some take this long at a fixed percentage

If there's zero network and disk activity for over an hour: it's stuck.

---

## Fix 1: Run Windows Update Troubleshooter

`Win + I` → **System** → **Troubleshoot** → **Other troubleshooters** → **Windows Update** → **Run**

This fixes the most common causes automatically: stopped services, corrupted cache, wrong permissions.

---

## Fix 2: Restart Windows Update Service

```powershell
Restart-Service wuauserv -Force
Restart-Service bits -Force
Restart-Service cryptSvc -Force
```

Then check for updates again.

---

## Fix 3: Clear the Update Cache

```powershell
Stop-Service wuauserv -Force
Stop-Service bits -Force

# Delete downloaded update files
Remove-Item "C:\Windows\SoftwareDistribution\Download\*" -Recurse -Force -ErrorAction SilentlyContinue

Start-Service wuauserv
Start-Service bits
```

Windows re-downloads only what's needed. Often fixes downloads stuck at 0%.

---

## Fix 4: Switch Delivery Optimization Source

If downloads are slow, Windows may be downloading from peers instead of Microsoft servers.

```powershell
# Force downloads from Microsoft only (no peer sharing)
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DeliveryOptimization" `
  -Name "DODownloadMode" -Value 0 -Type DWord
```

Or: `Win + I` → **Windows Update** → **Advanced options** → **Delivery Optimization** → turn off **Allow downloads from other PCs**.

---

## Fix 5: Check and Fix DNS

Slow DNS resolution causes slow update metadata downloads.

```powershell
# Test Microsoft update server
Test-NetConnection -ComputerName windowsupdate.microsoft.com -Port 443

# Switch to faster DNS
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses ("1.1.1.1", "8.8.8.8")
Clear-DnsClientCache
```

---

## Fix 6: Full Reset of Update Components

```cmd
net stop wuauserv
net stop cryptSvc
net stop bits
net stop msiserver

ren C:\Windows\SoftwareDistribution SoftwareDistribution.old
ren C:\Windows\System32\catroot2 catroot2.old

net start wuauserv
net start cryptSvc
net start bits
net start msiserver
```

---

## Fix 7: DISM and SFC

Corrupted system files cause update failures and slow installs:

```cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
```

---

## Fix 8: Download Update Manually

If a specific update keeps failing or downloading slowly:

1. Note the KB number from **Update history**
2. Go to [catalog.update.microsoft.com](https://www.catalog.update.microsoft.com)
3. Download directly from Microsoft — bypasses Delivery Optimization

---

## Fix 9: Check Disk Space

Updates need free space to download and extract. Windows needs at least 10-15 GB free.

```powershell
Get-PSDrive C | Select-Object Used, Free,
  @{n='Free GB';e={[math]::Round($_.Free/1GB,1)}}
```

If low: `Win + R` → `cleanmgr` → **Clean up system files** → check Windows Update Cleanup.

---

## Check Update Download Progress in Detail

```powershell
# BITS transfer queue — shows active update downloads
Get-BitsTransfer | Select-Object DisplayName, BytesTransferred, BytesTotal,
  @{n='% Done';e={[math]::Round($_.BytesTransferred/$_.BytesTotal*100,1)}}
```

If BITS shows transfers with progress — updates are downloading, just slowly.

---


---

## 🔍 Не знаєш що означає код помилки Windows?

Якщо Windows показує код на кшталт `0x80070005`, `0x80070002` або `0xC000021A` — скористайся безкоштовним інструментом:

**[→ Декодер помилок Windows](/tools/windows-error-decoder)** — введи код і одразу дізнайся що він означає та як виправити.


## Summary

Check Task Manager for network activity before assuming it's stuck. Quick fixes: restart Update service → clear SoftwareDistribution cache → disable peer delivery. If updates consistently fail: run DISM + SFC and download manually from Microsoft Update Catalog. Always ensure 15+ GB free on drive C before major updates.
