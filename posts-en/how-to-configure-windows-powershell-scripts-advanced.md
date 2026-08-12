---
title: "How to Create PowerShell Modules for Reusable Functions"
date: "2026-04-29"
updated: "2026-08-12"
publishDate: "2026-04-29"
description: "Package PowerShell functions into reusable modules: module structure, manifests, auto-importing, version management, and script signing."
tags: ["windows", "powershell", "automation", "administration"]
readTime: 5
---

Once you have more than a handful of PowerShell functions, it's time to organize them properly — modules package reusable functions for use across scripts and sessions. (For persistent aliases and environment setup that loads on every session, see [how to create a PowerShell profile](/en/how-to-configure-windows-powershell-profiles).)

---

## Create a PowerShell Module

Modules package functions for reuse across scripts and sessions.

**Module structure:**
```
C:\Users\YourName\Documents\PowerShell\Modules\
└── MyTools\
    ├── MyTools.psm1      # Module file with functions
    └── MyTools.psd1      # Module manifest (optional)
```

**Create the module file:**
```powershell
# Create module directory
$modulePath = "$env:USERPROFILE\Documents\PowerShell\Modules\MyTools"
New-Item -ItemType Directory -Path $modulePath -Force

# Create module file
@'
function Get-SystemSummary {
  [CmdletBinding()]
  param()
  [PSCustomObject]@{
    Computer = $env:COMPUTERNAME
    User = $env:USERNAME
    OS = (Get-WmiObject Win32_OperatingSystem).Caption
    CPU = [math]::Round((Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples.CookedValue, 0)
    'RAM Free GB' = [math]::Round((Get-Counter '\Memory\Available MBytes').CounterSamples.CookedValue / 1024, 1)
    Uptime = ((Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime).ToString("d\d\ h\h\ m\m")
  }
}

function Write-ColorOutput {
  param([string]$Message, [string]$Color = "White")
  Write-Host $Message -ForegroundColor $Color
}

function Get-LargeFiles {
  param(
    [string]$Path = "C:\",
    [int]$MinSizeMB = 100,
    [int]$Top = 20
  )
  Get-ChildItem $Path -Recurse -ErrorAction SilentlyContinue |
    Where-Object {$_.Length -gt ($MinSizeMB * 1MB)} |
    Sort-Object Length -Descending |
    Select-Object -First $Top FullName, @{n='MB';e={[math]::Round($_.Length/1MB,0)}}
}

Export-ModuleMember -Function Get-SystemSummary, Write-ColorOutput, Get-LargeFiles
'@ | Out-File "$modulePath\MyTools.psm1"
```

**Use the module:**
```powershell
Import-Module MyTools
Get-SystemSummary
Get-LargeFiles -Path "D:\" -MinSizeMB 500
```

---

## Module Manifest

```powershell
# Create a module manifest for better documentation
New-ModuleManifest -Path "$modulePath\MyTools.psd1" `
  -RootModule "MyTools.psm1" `
  -ModuleVersion "1.0.0" `
  -Author "YourName" `
  -Description "Personal Windows admin tools" `
  -FunctionsToExport @("Get-SystemSummary", "Write-ColorOutput", "Get-LargeFiles")
```

---

## Auto-Import Modules in Profile

```powershell
# Add to $PROFILE
Import-Module MyTools -ErrorAction SilentlyContinue
```

---

## Manage Module Versions

```powershell
# List installed modules
Get-Module -ListAvailable | Where-Object {$_.Path -like "*$env:USERPROFILE*"}

# Update a module (if from PowerShell Gallery)
Update-Module PSWindowsUpdate

# Uninstall
Uninstall-Module MyTools -AllVersions
```

---

## Script Signing (Optional but Good Practice)

```powershell
# Create a code signing certificate
$cert = New-SelfSignedCertificate -Subject "CN=PowerShell Script Signing" `
  -Type CodeSigningCert -CertStoreLocation "Cert:\CurrentUser\My"

# Sign a script
Set-AuthenticodeSignature -FilePath "C:\Scripts\myscript.ps1" -Certificate $cert

# Verify signature
Get-AuthenticodeSignature "C:\Scripts\myscript.ps1" | Select-Object Status, StatusMessage
```

---


---

## ⚡ Looking for the right command?

**[→ PowerShell & CMD Reference](/tools/powershell-commands)** — 40+ commands searchable by task. Type "network", "disk" or "security" to get a ready-to-use command instantly.


## Summary

Create `$PROFILE` for aliases and functions that persist across sessions. Organize reusable functions into modules under `Documents\PowerShell\Modules\`. Use `Export-ModuleMember` to control what's public. Auto-import modules in your profile. Version your modules with manifests so you know what you're running.
