---
title: "How to Configure Proxy Settings in Windows 10 and 11"
date: "2026-05-25"
publishDate: "2026-05-25"
description: "Configure proxy settings in Windows 10 and 11 for system-wide, per-app or WinHTTP. Set proxy via Settings, PowerShell and registry. Fix proxy-related connection issues."
tags: ["windows", "proxy", "network", "administration", "powershell"]
readTime: 5
translatesUk: "nalashtuvannya-proksy-windows"
---

Windows proxy settings control how network traffic is routed through a proxy server. Here's how to configure them at every level.

---

## Configure System Proxy via Settings

`Win + I` → **Network & Internet** → **Proxy**

**Manual proxy setup:**
- Toggle **Use a proxy server** On
- Address: `192.168.1.100`
- Port: `8080`
- Exceptions: `localhost;*.internal.company.com`

---

## Configure Proxy via PowerShell

```powershell
# Set system proxy (Internet Explorer / WinINET proxy)
$proxyAddress = "http://proxy.company.com:8080"

Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" `
  -Name "ProxyEnable" -Value 1 -Type DWord
Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" `
  -Name "ProxyServer" -Value $proxyAddress
Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" `
  -Name "ProxyOverride" -Value "localhost;*.local;<local>"

# Verify
Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" |
  Select-Object ProxyEnable, ProxyServer, ProxyOverride
```

---

## Configure WinHTTP Proxy (System Services)

WinHTTP is used by Windows Update, Windows Defender and system services — separate from WinINET (browser/app proxy):

```powershell
# Set WinHTTP proxy
netsh winhttp set proxy "proxy.company.com:8080" bypass-list="localhost;*.local"

# Import proxy from WinINET (IE/system settings)
netsh winhttp import proxy ie

# View current WinHTTP proxy
netsh winhttp show proxy

# Reset WinHTTP (no proxy)
netsh winhttp reset proxy
```

---

## Configure Per-App Proxy

```powershell
# Set proxy for PowerShell web requests
$proxy = New-Object System.Net.WebProxy("http://proxy.company.com:8080", $true)
$proxy.Credentials = [System.Net.CredentialCache]::DefaultCredentials
[System.Net.WebRequest]::DefaultWebProxy = $proxy

# Test
Invoke-WebRequest "https://google.com" -UseBasicParsing
```

---

## Set Proxy with Authentication

```powershell
# Proxy with credentials
$proxyUri = "http://proxy.company.com:8080"
$cred = Get-Credential -Message "Proxy credentials"

$proxy = New-Object System.Net.WebProxy($proxyUri)
$proxy.Credentials = $cred.GetNetworkCredential()
[System.Net.WebRequest]::DefaultWebProxy = $proxy
```

---

## PAC File (Proxy Auto-Configuration)

```powershell
# Set automatic proxy via PAC URL
Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" `
  -Name "AutoConfigURL" -Value "http://proxy.company.com/proxy.pac"
Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" `
  -Name "AutoDetect" -Value 0 -Type DWord
```

---

## Remove / Disable Proxy

```powershell
# Disable proxy
Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" `
  -Name "ProxyEnable" -Value 0 -Type DWord

# Remove proxy address
Remove-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" `
  -Name "ProxyServer" -EA 0

# Full reset
netsh winhttp reset proxy
Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" `
  -Name "ProxyEnable" -Value 0 -Type DWord
```

---

## Troubleshoot Proxy Issues

```powershell
# Check current proxy settings at all levels
Write-Host "=== WinINET (User) ==="
Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings" |
  Select-Object ProxyEnable, ProxyServer, AutoConfigURL

Write-Host "=== WinHTTP (System) ==="
netsh winhttp show proxy

Write-Host "=== Environment ==="
[System.Environment]::GetEnvironmentVariable("HTTP_PROXY", "User")
[System.Environment]::GetEnvironmentVariable("HTTP_PROXY", "Machine")
```

---

## Summary

System proxy via Settings or `ProxyEnable/ProxyServer` in HKCU registry. WinHTTP via `netsh winhttp set proxy` (affects Windows Update and system services). Per-app via `[System.Net.WebRequest]::DefaultWebProxy`. Always check both WinINET and WinHTTP when troubleshooting.

## Frequently Asked Questions

### My proxy setting is enabled but apps bypass it — why?

Many modern apps (Chrome, Slack, VS Code) have their own proxy settings separate from Windows. Configure proxy in each app's settings, or use WinHTTP which they respect.

### Windows Update won't work behind a proxy — how to fix?

```powershell
netsh winhttp import proxy ie
```
This copies your IE/WinINET proxy settings to WinHTTP which Windows Update uses.

### How do I check if traffic is going through the proxy?

Check from inside the network: look at proxy server access logs. Or use Fiddler to intercept traffic and verify the proxy is routing it correctly.
