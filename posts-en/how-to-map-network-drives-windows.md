---
title: "How to Map Network Drives in Windows 10 and 11 via PowerShell"
date: "2026-05-17"
publishDate: "2026-05-17"
description: "Map network drives in Windows 10 and 11 via GUI, PowerShell and Group Policy. Persist mapped drives, fix reconnect issues and manage credentials for network shares."
tags: ["windows", "network", "drives", "administration", "powershell"]
readTime: 5
translatesUk: "yak-pidklyuchyty-merezhevyy-dysk-windows"
---

Mapped network drives let you access shared folders as if they were local drives. Here's how to set them up reliably. (Setting up the share on the hosting PC instead? See [how to create and manage network shares](/en/how-to-configure-windows-network-shares).)

---

## Map Drive via File Explorer

`Win + E` → **This PC** → **Map network drive** (in toolbar or Computer tab)

- Choose drive letter (Z:, Y:, etc.)
- Enter path: `\\server\share` or `\\192.168.1.100\share`
- Check **Reconnect at sign-in**
- Check **Connect using different credentials** if needed

---

## Map Drive via PowerShell

```powershell
# Map drive with current credentials
New-PSDrive -Name "Z" -PSProvider FileSystem -Root "\\Server\Share" -Persist

# Map with specific credentials
$cred = Get-Credential
New-PSDrive -Name "Z" -PSProvider FileSystem `
  -Root "\\Server\Share" -Credential $cred -Persist

# Via net use (more compatible for persistent drives)
net use Z: \\Server\Share /persistent:yes

# With credentials
net use Z: \\Server\Share /user:Domain\Username Password /persistent:yes
```

---

## Remove Mapped Drive

```powershell
# Remove via PowerShell
Remove-PSDrive -Name "Z"

# Via net use
net use Z: /delete

# Remove all mapped drives
net use * /delete /yes
```

---

## List All Mapped Drives

```powershell
# Current session drives
Get-PSDrive -PSProvider FileSystem | Where-Object {$_.Root -like "\\*"}

# All network mappings
net use

# Via WMI (more detail)
Get-WmiObject Win32_MappedLogicalDisk |
  Select-Object Name, ProviderName, @{n='Free GB';e={[math]::Round($_.FreeSpace/1GB,1)}}
```

---

## Fix Drives Not Reconnecting After Restart

Common issue — drives mapped by PowerShell don't persist properly:

```powershell
# Method 1: Use net use with /persistent:yes
net use Z: \\Server\Share /persistent:yes

# Method 2: Add to startup via scheduled task
$action = New-ScheduledTaskAction -Execute "net.exe" `
  -Argument "use Z: \\Server\Share /persistent:yes"
$trigger = New-ScheduledTaskTrigger -AtLogOn
Register-ScheduledTask -TaskName "MapNetworkDrive" `
  -Action $action -Trigger $trigger

# Method 3: Store credentials in Credential Manager
cmdkey /add:Server /user:Domain\Username /pass:Password
net use Z: \\Server\Share /persistent:yes
```

---

## Group Policy for Domain PCs

For multiple PCs in a domain — map drives via GPO:

`gpedit.msc` → `User Configuration` → `Preferences` → `Windows Settings` → `Drive Maps` → right-click → **New** → **Mapped Drive**

Set: Action = Create, Drive letter, Path, and reconnect option.

---

## Fix "Network path not found" Error

```powershell
# Test connectivity to server
Test-NetConnection -ComputerName "Server" -Port 445

# Check SMB1 is disabled (it should be for security)
Get-WindowsOptionalFeature -Online -FeatureName SMB1Protocol

# Test with full path
Test-Path "\\Server\Share"

# Flush DNS and ARP cache
Clear-DnsClientCache
arp -d *
```

---

## Summary

Use `net use` for persistent drives. Store credentials with `cmdkey`. Fix reconnect issues via scheduled task at logon. Test with `Test-NetConnection` on port 445. For domain environments, use GPO Drive Maps preferences.

## Frequently Asked Questions

### Mapped drives disappear after restart — how to make them permanent?

Two issues: credentials not stored, and PowerShell `New-PSDrive` doesn't persist like `net use`. Use `net use Z: \\Server\Share /persistent:yes` and store credentials with `cmdkey`.

### I can see the server in Explorer but can't map a drive — why?

Check port 445 is open: `Test-NetConnection Server -Port 445`. Also verify SMB signing settings match on both sides, and that you have Read permission on the share.

### Can I map a drive to an FTP or WebDAV server?

Yes — Windows supports WebDAV mapping: `net use Z: https://server/path /user:name pass`. FTP drives require third-party tools like NetDrive or Mountain Duck.
