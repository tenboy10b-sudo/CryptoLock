---
title: "How to Use PowerShell Script Modules and Profiles"
date: "2026-04-29"
publishDate: "2026-04-29"
description: "Organize PowerShell beyond single scripts: create modules for reusable functions, set up profiles for persistent aliases and configuration, and manage script dependencies."
tags: ["windows", "powershell", "automation", "administration"]
readTime: 6
---

Once you have more than a handful of PowerShell scripts, it's time to organize them properly — modules for reusable functions and profiles for your environment setup.

---

## PowerShell Profiles

A profile is a script that runs automatically every time you open PowerShell. Use it for aliases, functions, and environment setup.

```powershell
# Find your profile location
$PROFILE

# Edit it
notepad $PROFILE  # Or: code $PROFILE

# Create if it doesn't exist
if (!(Test-Path $PROFILE)) {
  New-Item -ItemType File -Path $PROFILE -Force
}
```

**Profile types:**
```powershell
# Current user, current host (most common)
$PROFILE.CurrentUserCurrentHost

# Current user, all hosts (applies to VS Code, ISE, etc.)
$PROFILE.CurrentUserAllHosts

# All users, current host (requires admin)
$PROFILE.AllUsersCurrentHost
```

---

## Useful Profile Contents

```powershell
# Example $PROFILE content

# Aliases
Set-Alias -Name g -Value git
Set-Alias -Name py -Value python
Set-Alias -Name touch -Value New-Item

# Functions
function proj { Set-Location "C:\Projects" }
function admin { Start-Process pwsh -Verb RunAs }
function uptime { (Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime }

# Prompt customization
function prompt {
  $location = (Get-Location).Path.Replace($env:USERPROFILE, "~")
  $branch = git branch --show-current 2>$null
  $gitInfo = if ($branch) { " [$branch]" } else { "" }
  Write-Host "PS $location$gitInfo" -ForegroundColor Cyan -NoNewline
  return "> "
}

# Auto-complete enhancement
Set-PSReadLineOption -PredictionSource History
Set-PSReadLineOption -HistorySearchCursorMovesToEnd
Set-PSReadLineKeyHandler -Key UpArrow -Function HistorySearchBackward
Set-PSReadLineKeyHandler -Key DownArrow -Function HistorySearchForward

Write-Host "Profile loaded" -ForegroundColor DarkGray
```

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
