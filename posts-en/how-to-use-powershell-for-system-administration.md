---
title: "Essential PowerShell Commands for Windows System Administration"
date: "2026-09-24"
publishDate: "2026-09-24"
description: "PowerShell commands every Windows admin should know: user management, services, processes, network, file operations, and system information — with practical examples."
tags: ["windows", "powershell", "administration", "tools"]
readTime: 7
---

PowerShell is the primary tool for Windows administration. These commands cover the most common real-world tasks.

---

## System Information

```powershell
# Quick system overview
Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, OsBuildNumber, CsProcessors, CsTotalPhysicalMemory

# CPU details
Get-WmiObject Win32_Processor | Select-Object Name, NumberOfCores, NumberOfLogicalProcessors, MaxClockSpeed

# Memory
Get-WmiObject Win32_PhysicalMemory | Select-Object Manufacturer, @{n='GB';e={$_.Capacity/1GB}}, Speed, DeviceLocator

# Disk space
Get-PSDrive -PSProvider FileSystem | Select-Object Name, @{n='Free GB';e={[math]::Round($_.Free/1GB,1)}}, @{n='Used GB';e={[math]::Round($_.Used/1GB,1)}}

# Uptime
(Get-Date) - (gcim Win32_OperatingSystem).LastBootUpTime
```

---

## User Management

```powershell
# List local users
Get-LocalUser | Select-Object Name, Enabled, LastLogon, PasswordRequired

# Create user
$pass = ConvertTo-SecureString "Password123!" -AsPlainText -Force
New-LocalUser -Name "jsmith" -Password $pass -FullName "John Smith"
Add-LocalGroupMember -Group "Users" -Member "jsmith"

# Disable user
Disable-LocalUser -Name "jsmith"

# Reset password
Set-LocalUser -Name "jsmith" -Password (ConvertTo-SecureString "NewPass!" -AsPlainText -Force)

# Who's currently logged in
query user

# Check group membership
Get-LocalGroupMember -Group "Administrators"
```

---

## Process Management

```powershell
# Top CPU consumers
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 Name, CPU, Id, @{n='RAM(MB)';e={[math]::Round($_.WorkingSet/1MB,0)}}

# Find process by name
Get-Process -Name "chrome" | Select-Object Id, Name, CPU, WorkingSet

# Kill process
Stop-Process -Name "notepad" -Force

# Kill by PID
Stop-Process -Id 1234 -Force

# Watch processes (refresh every 2 seconds)
while ($true) {
  Get-Process | Sort-Object CPU -Descending | Select-Object -First 5 Name, CPU
  Start-Sleep 2
  Clear-Host
}
```

---

## Service Management

```powershell
# List all services with status
Get-Service | Sort-Object Status -Descending | Format-Table Name, Status, StartType

# Find stopped services that should run
Get-Service | Where-Object {$_.StartType -eq 'Automatic' -and $_.Status -eq 'Stopped'}

# Start/Stop/Restart
Start-Service -Name "wuauserv"
Stop-Service -Name "wuauserv" -Force
Restart-Service -Name "wuauserv"

# Set startup type
Set-Service -Name "wuauserv" -StartupType Disabled

# Find service by keyword
Get-Service | Where-Object {$_.DisplayName -like "*update*"}
```

---

## Network Commands

```powershell
# Test connectivity
Test-NetConnection -ComputerName google.com -Port 443
Test-NetConnection -ComputerName 192.168.1.1 -InformationLevel Detailed

# DNS lookup
Resolve-DnsName google.com
Resolve-DnsName -Name google.com -Server 1.1.1.1

# Network adapters
Get-NetAdapter | Select-Object Name, Status, MacAddress, LinkSpeed

# IP configuration
Get-NetIPAddress | Where-Object {$_.AddressFamily -eq 'IPv4'} | Select-Object InterfaceAlias, IPAddress

# Active TCP connections
Get-NetTCPConnection -State Established | Select-Object LocalPort, RemoteAddress,
  @{n='Process';e={(Get-Process -Id $_.OwningProcess -EA 0).Name}}

# Flush DNS
Clear-DnsClientCache
```

---

## File and Folder Operations

```powershell
# Find large files
Get-ChildItem C:\ -Recurse -ErrorAction SilentlyContinue |
  Where-Object {$_.Length -gt 500MB} |
  Select-Object FullName, @{n='GB';e={[math]::Round($_.Length/1GB,2)}} |
  Sort-Object GB -Descending

# Find recently modified files
Get-ChildItem $env:USERPROFILE -Recurse -ErrorAction SilentlyContinue |
  Where-Object {$_.LastWriteTime -gt (Get-Date).AddDays(-1)} |
  Select-Object FullName, LastWriteTime

# Copy with progress
Copy-Item "C:\Source" "D:\Dest" -Recurse -Verbose

# Delete files older than 30 days
Get-ChildItem "C:\Logs\*.log" |
  Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-30)} |
  Remove-Item -Force

# Get folder size
(Get-ChildItem "C:\Windows" -Recurse -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum / 1GB
```

---

## Event Log Queries

```powershell
# Last 10 system errors
Get-EventLog -LogName System -EntryType Error -Newest 10 | Select-Object TimeGenerated, Source, Message

# Failed logins today
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625; StartTime=(Get-Date).Date} |
  Select-Object TimeCreated, @{n='User';e={$_.Properties[5].Value}}

# Application crashes
Get-WinEvent -FilterHashtable @{LogName='Application'; Id=1000} -MaxEvents 5 |
  Select-Object TimeCreated, @{n='App';e={$_.Properties[0].Value}}
```

---

## Scheduled Tasks

```powershell
# List all tasks
Get-ScheduledTask | Select-Object TaskName, State, TaskPath

# Run a task immediately
Start-ScheduledTask -TaskName "TaskName"

# Create daily task
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File C:\script.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At "02:00"
Register-ScheduledTask -TaskName "MyTask" -Action $action -Trigger $trigger -RunLevel Highest -Force
```

---

## Remote Management

```powershell
# Enable PSRemoting (run once on target)
Enable-PSRemoting -Force

# Run command on remote PC
Invoke-Command -ComputerName "PC-NAME" -ScriptBlock {Get-Process | Sort-Object CPU -Descending | Select-Object -First 5}

# Interactive remote session
Enter-PSSession -ComputerName "PC-NAME"
```

---

## Summary

Save frequently used commands as `.ps1` scripts in `C:\Scripts\`. Use `Get-Help cmdlet-name -Examples` for any command you're unfamiliar with. Run PowerShell as Administrator for most system administration tasks. For remote work, enable PSRemoting once and use `Invoke-Command` instead of RDP for simple queries.
