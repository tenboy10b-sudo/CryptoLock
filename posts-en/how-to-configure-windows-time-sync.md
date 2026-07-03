---
title: "How to Fix Windows Time Sync and Configure NTP Server"
date: "2026-06-30"
publishDate: "2026-06-30"
description: "Fix Windows clock sync issues and configure NTP time server. Force time sync, set custom NTP server, troubleshoot W32tm errors and configure domain time hierarchy."
tags: ["windows", "ntp", "time-sync", "administration", "powershell"]
readTime: 4
translatesUk: "synkhronizatsiya-chasu-windows-ntp"
---

Wrong system time breaks SSL certificates, Kerberos authentication and scheduled tasks. Here's how to fix sync and configure NTP properly.

---

## Force Time Sync Now

```powershell
# Stop and restart time service
Stop-Service w32tm -Force
Start-Service w32tm

# Force sync immediately
w32tm /resync /force

# Check sync status
w32tm /query /status
```

---

## Configure NTP Server

```powershell
# Set custom NTP server
w32tm /config /manualpeerlist:"time.cloudflare.com,0x8 pool.ntp.org,0x8" `
  /syncfromflags:manual /reliable:YES /update

# Restart time service
Restart-Service w32tm

# Verify
w32tm /query /configuration
```

---

## Check Time Source

```powershell
# What server is Windows syncing from
w32tm /query /source

# Detailed status
w32tm /query /status

# Diagnostics
w32tm /stripchart /computer:time.cloudflare.com /samples:5
```

---

## Fix Common Time Errors

```powershell
# Error 0x800705B4 — timeout
# Try different NTP server
w32tm /config /manualpeerlist:"time.windows.com,0x8" /update
w32tm /resync /force

# Re-register time service (if service missing)
w32tm /unregister
w32tm /register
Start-Service w32tm

# Check if Windows Time service is running
Get-Service w32tm | Select-Object Status, StartType
Set-Service w32tm -StartupType Automatic
Start-Service w32tm
```

---

## Configure Time on Domain (PDC Emulator)

```powershell
# On domain controller (PDC Emulator role):
w32tm /config /manualpeerlist:"time.cloudflare.com,0x8" `
  /syncfromflags:manual /reliable:YES /update

# On domain member PCs — sync from DC automatically
# Force resync:
w32tm /resync /rediscover
```

---

## Set Timezone

```powershell
# List available timezones
Get-TimeZone -ListAvailable | Where-Object {$_.Id -like "*Kiev*" -or $_.Id -like "*Warsaw*"}

# Set timezone
Set-TimeZone -Id "FLE Standard Time"  # Ukraine/Kyiv

# Verify
Get-TimeZone
```

---

## Summary

Force sync with `w32tm /resync /force`. Configure NTP with `w32tm /config /manualpeerlist`. Use `time.cloudflare.com` or `pool.ntp.org` as reliable servers. Domain PCs sync from DC automatically.

## Frequently Asked Questions

### Windows clock loses time after restart — how to fix?

Usually a dying CMOS battery (the small round battery on the motherboard). Replace it (~$2). After replacement, set time in BIOS and Windows will sync via NTP going forward.

### Time sync fails in a corporate network — why?

Corporate firewalls often block UDP port 123 (NTP). Configure Windows to sync from an internal domain controller or company NTP server instead of internet time servers.

### Kerberos errors after time mismatch — how to resolve?

Kerberos requires clocks within 5 minutes of each other. Fix time sync first, then: `klist purge` to clear Kerberos tickets, then re-authenticate. If domain joined: `w32tm /resync /rediscover`.
