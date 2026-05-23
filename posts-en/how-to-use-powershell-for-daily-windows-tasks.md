---
title: "PowerShell One-Liners for Common Windows Admin Tasks"
date: "2026-12-08"
publishDate: "2026-12-08"
description: "Practical PowerShell one-liners for daily Windows administration: network troubleshooting, disk usage, security checks, process management, and service control."
tags: ["windows", "powershell", "administration", "tools"]
readTime: 5
---

These PowerShell commands solve real daily problems. No setup, no modules — just copy and run in an elevated PowerShell window.

---

## Network Troubleshooting

```powershell
# Test connectivity and latency
Test-NetConnection -ComputerName 8.8.8.8 -InformationLevel Detailed

# Find what process owns each network connection
Get-NetTCPConnection -State Established |
  Select-Object LocalPort, RemoteAddress,
    @{n='Process';e={(Get-Process -Id $_.OwningProcess -EA 0).Name}} |
  Sort-Object Process | Format-Table

# Reset network stack (fixes most connectivity issues)
netsh winsock reset; netsh int ip reset; ipconfig /flushdns
```

---

## Disk Space

```powershell
# Quick disk overview
Get-PSDrive -PSProvider FileSystem |
  Select-Object Name,
    @{n='Free GB';e={[math]::Round($_.Free/1GB,1)}},
    @{n='Used GB';e={[math]::Round($_.Used/1GB,1)}}

# Find files larger than 500MB
Get-ChildItem C:\ -Recurse -EA 0 |
  Where-Object {$_.Length -gt 500MB} |
  Sort-Object Length -Descending |
  Select-Object -First 10 FullName, @{n='GB';e={[math]::Round($_.Length/1GB,2)}}

# Folder size
"{0:N1} GB" -f ((Get-ChildItem "C:\Windows" -Recurse -EA 0 | Measure-Object Length -Sum).Sum / 1GB)
```

---

## Security Quick Check

```powershell
# One-liner security status
$d = Get-MpComputerStatus
$fw = (Get-NetFirewallProfile | Where-Object {!$_.Enabled}).Count
"Defender: $(if($d.RealTimeProtectionEnabled){'ON'}else{'OFF'}) | Signatures: $($d.AntivirusSignatureAge)d old | Firewall: $(if($fw -eq 0){'OK'}else{"$fw profile(s) OFF"})"

# Processes running from suspicious locations
Get-Process | Where-Object {
  $_.Path -like "*\Temp\*" -or $_.Path -like "*\AppData\Local\Temp\*"
} | Select-Object Name, Id, Path

# Check startup entries
Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" |
  Select-Object * -ExcludeProperty PS*
```

---

## Process and Service Control

```powershell
# Top CPU consumers
Get-Process | Sort-Object CPU -Descending |
  Select-Object -First 10 Name, @{n='CPU%';e={[math]::Round($_.CPU,1)}}, @{n='RAM MB';e={[math]::Round($_.WorkingSet/1MB,0)}}

# Find what's using a specific port
$port = 3000
$conn = Get-NetTCPConnection -LocalPort $port -EA 0
if ($conn) { Get-Process -Id $conn.OwningProcess | Select-Object Name, Id, Path }

# Restart a service
Restart-Service wuauserv -Force; Get-Service wuauserv
```

---

## Windows Update

```powershell
# Last 5 installed updates
Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 5 HotFixID, Description, InstalledOn

# Restart Windows Update service and clear cache
Stop-Service wuauserv -Force
Remove-Item "C:\Windows\SoftwareDistribution\*" -Recurse -Force -EA 0
Start-Service wuauserv
```

---

## File Operations

```powershell
# Find recently modified files
Get-ChildItem $env:USERPROFILE -Recurse -EA 0 |
  Where-Object {$_.LastWriteTime -gt (Get-Date).AddHours(-24)} |
  Select-Object FullName, LastWriteTime | Sort-Object LastWriteTime -Descending

# Bulk rename files
Get-ChildItem "C:\Photos\*.JPG" |
  Rename-Item -NewName {$_.Name -replace '\.JPG$','.jpg'}

# Get file hash (verify download)
Get-FileHash "C:\Downloads\installer.exe" -Algorithm SHA256
```

---

## ⚡ Need More Commands?

**[→ PowerShell & CMD Command Reference](/tools/powershell-commands)** — search 40+ commands by task. Type "network", "disk", "security" and get the right command instantly.

---

## Summary

Run PowerShell as Administrator: `Win + X` → Windows Terminal (Admin). All commands tested on Windows 10 and 11 with PowerShell 5.1+. For a searchable reference of 40+ commands — use the [command reference tool](/tools/powershell-commands).
