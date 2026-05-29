---
title: "How to Enable and Secure Windows Remote Management (WinRM)"
date: "2026-04-28"
publishDate: "2026-04-28"
description: "WinRM is the foundation for PowerShell Remoting and remote management. How to enable it, configure authentication, restrict access, and troubleshoot connection issues."
tags: ["windows", "administration", "network", "powershell"]
readTime: 5
---

WinRM (Windows Remote Management) is the service that enables PowerShell Remoting, remote management via Server Manager, and CIM/WMI over the network. Here's how to set it up securely.

---

## Enable WinRM

```powershell
# Enable WinRM with default settings (run as Administrator)
Enable-PSRemoting -Force

# Check service status
Get-Service WinRM | Select-Object Status, StartType

# Check current configuration
winrm get winrm/config
```

`Enable-PSRemoting` starts WinRM, creates firewall rules, and sets up default listeners.

---

## Check Listeners

```powershell
# List WinRM listeners
winrm enumerate winrm/config/listener

# Or via PowerShell
Get-WSManInstance -ResourceURI winrm/config/listener -Enumerate
```

By default: HTTP listener on port 5985. HTTPS listener on port 5986 (if configured).

---

## Configure for Workgroup (Non-Domain) PCs

Domain PCs use Kerberos authentication automatically. For workgroup PCs:

```powershell
# On the PC initiating the connection:
# Add target to TrustedHosts
Set-Item WSMan:\localhost\Client\TrustedHosts -Value "192.168.1.100" -Force

# Or trust all (only in fully trusted networks)
Set-Item WSMan:\localhost\Client\TrustedHosts -Value "*" -Force

# View current TrustedHosts
Get-Item WSMan:\localhost\Client\TrustedHosts
```

---

## Restrict WinRM Access by IP

```powershell
# Allow WinRM only from specific IP range
New-NetFirewallRule -DisplayName "WinRM from Management Network" `
  -Direction Inbound -Protocol TCP -LocalPort 5985 `
  -RemoteAddress "192.168.1.0/24" -Action Allow

# Remove the default open rule
Remove-NetFirewallRule -DisplayName "Windows Remote Management (HTTP-In)" -ErrorAction SilentlyContinue
```

---

## Configure HTTPS Listener (Secure)

```powershell
# Create a self-signed certificate
$cert = New-SelfSignedCertificate -DnsName $env:COMPUTERNAME `
  -CertStoreLocation "cert:\LocalMachine\My"

# Create HTTPS listener
New-WSManInstance -ResourceURI winrm/config/Listener `
  -SelectorSet @{Transport="HTTPS"; Address="*"} `
  -ValueSet @{
    Hostname = $env:COMPUTERNAME
    CertificateThumbprint = $cert.Thumbprint
    Enabled = "true"
  }

# Allow HTTPS through firewall
New-NetFirewallRule -DisplayName "WinRM HTTPS" `
  -Direction Inbound -Protocol TCP -LocalPort 5986 -Action Allow
```

Connect using HTTPS:
```powershell
Enter-PSSession -ComputerName "PC-NAME" -UseSSL -SessionOption (New-PSSessionOption -SkipCACheck -SkipCNCheck)
```

---

## Configure Authentication Methods

```powershell
# View current auth settings
winrm get winrm/config/service/auth

# Enable Basic auth (less secure, requires HTTPS)
Set-Item WSMan:\localhost\Service\Auth\Basic -Value $true

# Enable CredSSP (for double-hop scenarios)
Enable-WSManCredSSP -Role Server

# Disable unused auth methods
Set-Item WSMan:\localhost\Service\Auth\Digest -Value $false
Set-Item WSMan:\localhost\Service\Auth\Negotiate -Value $true  # Keep this
```

---

## Set Connection Limits

```powershell
# View current limits
winrm get winrm/config/winrs

# Set maximum connections
Set-Item WSMan:\localhost\Shell\MaxConcurrentUsers -Value 10
Set-Item WSMan:\localhost\Shell\MaxMemoryPerShellMB -Value 1024
Set-Item WSMan:\localhost\Shell\MaxProcessesPerShell -Value 15
```

---

## Test WinRM Connectivity

```powershell
# Test if WinRM is reachable on a remote PC
Test-WSMan -ComputerName "192.168.1.100"

# Test specific port
Test-NetConnection -ComputerName "192.168.1.100" -Port 5985  # HTTP
Test-NetConnection -ComputerName "192.168.1.100" -Port 5986  # HTTPS

# Full connection test
$session = New-PSSession -ComputerName "192.168.1.100" -ErrorAction SilentlyContinue
if ($session) {
  Write-Host "WinRM working" -ForegroundColor Green
  Remove-PSSession $session
} else {
  Write-Host "WinRM not reachable" -ForegroundColor Red
}
```

---

## Disable WinRM

```powershell
# Disable WinRM completely
Disable-PSRemoting -Force
Stop-Service WinRM
Set-Service WinRM -StartupType Disabled

# Remove firewall rules
Remove-NetFirewallRule -DisplayName "Windows Remote Management*"
```

---

## WinRM Security Checklist

- ✅ HTTP listener only accessible from management network (IP-restricted firewall)
- ✅ HTTPS listener for internet-facing management
- ✅ TrustedHosts configured explicitly (not `*`) on workgroup PCs
- ✅ Restrict to Negotiate/Kerberos auth — disable Basic unless using HTTPS
- ✅ Limit to Administrator accounts only

---

## Summary

Enable with `Enable-PSRemoting -Force`. For workgroup PCs: add target to TrustedHosts. Restrict access by IP with firewall rules — don't leave port 5985 open to all. Use HTTPS (port 5986) for remote management over untrusted networks. Disable WinRM with `Disable-PSRemoting` on PCs that don't need remote management.
