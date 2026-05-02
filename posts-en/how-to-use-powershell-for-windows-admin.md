---
title: "PowerShell Commands Every Windows Admin Should Know"
date: "2026-05-10"
publishDate: "2026-05-10"
description: "Essential PowerShell commands for Windows administration: managing users, services, processes, network, and files. Practical one-liners and scripts with real-world examples."
tags: ["windows", "powershell", "administration", "tools"]
readTime: 8
---

PowerShell is the right tool for repetitive Windows tasks — faster than clicking through menus, scriptable, and available on every modern Windows install. Here are the commands you'll actually use.

---

## User Management

```powershell
# List all local users
Get-LocalUser

# Create a new user
New-LocalUser -Name "john" -Password (ConvertTo-SecureString "P@ssw0rd" -AsPlainText -Force) -FullName "John Smith"

# Add user to Administrators group
Add-LocalGroupMember -Group "Administrators" -Member "john"

# Disable a user account
Disable-LocalUser -Name "john"

# Remove a user
Remove-LocalUser -Name "john"

# Force password change at next login
net user john /logonpasswordchg:yes
```

---

## Process Management

```powershell
# List all running processes (sorted by CPU)
Get-Process | Sort-Object CPU -Descending | Select-Object -First 20 Name, CPU, WorkingSet

# Find what's using a specific port
Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess

# Kill a process by name
Stop-Process -Name "notepad" -Force

# Kill by PID
Stop-Process -Id 1234 -Force

# Start a process as another user
Start-Process powershell -Credential (Get-Credential) -NoNewWindow
```

---

## Service Management

```powershell
# List all services and their status
Get-Service | Sort-Object Status | Select-Object Name, DisplayName, Status

# Find services that failed to start
Get-Service | Where-Object {$_.Status -eq "StoppedWithError"}

# Start / Stop / Restart
Start-Service -Name "wuauserv"
Stop-Service -Name "wuauserv"
Restart-Service -Name "Spooler"

# Change startup type
Set-Service -Name "DiagTrack" -StartupType Disabled

# Get services listening on network
Get-NetTCPConnection -State Listen | Select-Object LocalAddress, LocalPort, OwningProcess
```

---

## File and Disk Operations

```powershell
# Find large files (over 100MB)
Get-ChildItem C:\ -Recurse -ErrorAction SilentlyContinue |
  Where-Object {$_.Length -gt 100MB} |
  Sort-Object Length -Descending |
  Select-Object FullName, @{n='Size(MB)';e={[math]::Round($_.Length/1MB,1)}}

# Get folder sizes
Get-ChildItem C:\Users -Directory |
  ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
    [PSCustomObject]@{Folder=$_.Name; 'Size(MB)'=[math]::Round($size/1MB,1)}
  } | Sort-Object 'Size(MB)' -Descending

# Copy files with progress
Copy-Item "C:\Source\*" "D:\Backup\" -Recurse -Verbose

# Delete files older than 30 days
Get-ChildItem "C:\Logs\" -File |
  Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-30)} |
  Remove-Item -Force
```

---

## Network

```powershell
# Test connectivity
Test-NetConnection google.com -Port 443

# Get all network adapters
Get-NetAdapter | Select-Object Name, Status, MacAddress, LinkSpeed

# Get IP configuration
Get-NetIPAddress | Where-Object {$_.AddressFamily -eq "IPv4"} | Select-Object InterfaceAlias, IPAddress

# Check open ports
Get-NetTCPConnection -State Listen | Select-Object LocalPort, OwningProcess

# Flush DNS cache
Clear-DnsClientCache

# Check DNS resolution
Resolve-DnsName google.com
```

---

## System Information

```powershell
# System overview
Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, TotalPhysicalMemory, CsProcessors

# Check uptime
(Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime

# List installed software
Get-Package | Select-Object Name, Version | Sort-Object Name

# Check Windows license status
slmgr /dli

# Get hardware info
Get-WmiObject Win32_Processor | Select-Object Name, NumberOfCores, MaxClockSpeed
Get-WmiObject Win32_PhysicalMemory | Select-Object Manufacturer, Capacity, Speed
```

---

## Event Log

```powershell
# Last 10 errors from System log
Get-EventLog -LogName System -EntryType Error -Newest 10 | Select-Object TimeGenerated, Source, Message

# Find failed login attempts
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625} -MaxEvents 20 |
  Select-Object TimeCreated, @{n='Account';e={$_.Properties[5].Value}}

# Check for critical events in last 24 hours
Get-WinEvent -FilterHashtable @{LogName='System'; Level=1; StartTime=(Get-Date).AddHours(-24)}
```

---

## Execution Policy

By default, PowerShell blocks script execution. To run scripts:

```powershell
# Check current policy
Get-ExecutionPolicy

# Allow scripts for current user
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run a single script bypassing policy (without changing permanent settings)
powershell -ExecutionPolicy Bypass -File "C:\Scripts\myscript.ps1"
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Get system info | `Get-ComputerInfo` |
| List processes by CPU | `Get-Process \| Sort CPU -Desc` |
| Find large files | `Get-ChildItem -Recurse \| Where {$_.Length -gt 100MB}` |
| Test port connectivity | `Test-NetConnection host -Port 443` |
| Check service status | `Get-Service servicename` |
| View recent errors | `Get-EventLog System -EntryType Error -Newest 10` |

---

## Summary

PowerShell replaces most manual Windows tasks. Start with `Get-Process`, `Get-Service`, and `Get-NetAdapter` to orient yourself, then use the patterns above. Every command supports `| Where-Object`, `| Select-Object`, and `| Sort-Object` for filtering.
