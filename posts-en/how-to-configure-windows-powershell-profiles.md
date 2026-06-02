---
title: "How to Create and Use PowerShell Profiles for Custom Environment"
date: "2026-06-22"
publishDate: "2026-06-22"
description: "Create and configure PowerShell profiles to customize your environment. Add aliases, functions, variables and modules that load automatically on every session."
tags: ["windows", "powershell", "scripting", "automation", "productivity"]
readTime: 4
---

A PowerShell profile is a script that runs automatically when you start PowerShell — like `.bashrc` for Linux. Set it up once and get your custom environment every session.

---

## Profile Locations

```powershell
# View all profile paths
$PROFILE | Select-Object *

# Current user, current host (most commonly used)
$PROFILE.CurrentUserCurrentHost   # C:\Users\Name\Documents\PowerShell\Microsoft.PowerShell_profile.ps1

# All users, current host (requires admin to edit)
$PROFILE.AllUsersCurrentHost

# Check if profile exists
Test-Path $PROFILE
```

---

## Create Your Profile

```powershell
# Create the profile file (and directory if missing)
if (-not (Test-Path $PROFILE)) {
  New-Item $PROFILE -ItemType File -Force
}

# Open in notepad for editing
notepad $PROFILE

# Or in VS Code
code $PROFILE
```

---

## Useful Profile Contents

```powershell
# === ALIASES ===
Set-Alias ll Get-ChildItem
Set-Alias grep Select-String
Set-Alias which Get-Command
Set-Alias touch New-Item

# === FUNCTIONS ===
function Get-PublicIP {
  (Invoke-RestMethod "https://api.ipify.org?format=json").ip
}

function uptime {
  (Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
}

function Go-Projects { Set-Location "C:\Projects" }
Set-Alias proj Go-Projects

function la { Get-ChildItem -Force $args }  # show hidden files

# === ENVIRONMENT ===
$env:Path += ";C:\Tools;C:\Scripts"

# === PROMPT CUSTOMIZATION ===
function prompt {
  $location = Get-Location
  $time = Get-Date -Format "HH:mm"
  "$time [$location]> "
}

# === AUTO-LOAD MODULES ===
Import-Module PSReadLine -EA 0  # better history and autocomplete
Import-Module Posh-Git -EA 0    # git status in prompt

# === PSREADLINE SETTINGS ===
Set-PSReadLineOption -PredictionSource History
Set-PSReadLineOption -HistorySearchCursorMovesToEnd
Set-PSReadLineKeyHandler -Key UpArrow -Function HistorySearchBackward
Set-PSReadLineKeyHandler -Key DownArrow -Function HistorySearchForward
```

---

## Install Useful Modules

```powershell
# PSReadLine — better history, autocomplete, syntax highlighting
Install-Module PSReadLine -Force -AllowPrerelease

# Posh-Git — git branch in prompt
Install-Module Posh-Git -Force

# Terminal-Icons — file type icons in Get-ChildItem output
Install-Module Terminal-Icons -Force

# Add to profile:
Import-Module Terminal-Icons
```

---

## Custom Oh-My-Posh Prompt

```powershell
# Install Oh-My-Posh for a rich prompt
winget install JanDeDobbeleer.OhMyPosh

# Install a Nerd Font (required for icons)
winget install Microsoft.CascadiaCode

# Add to profile:
oh-my-posh init pwsh --config "$env:POSH_THEMES_PATH\jandedobbeleer.omp.json" | Invoke-Expression
```

---

## Profile for All Users

```powershell
# Edit all-users profile (affects all users on machine)
# Requires Administrator
notepad $PROFILE.AllUsersCurrentHost

# Useful in all-users profile:
# - Company-specific functions
# - Standard aliases
# - Required module imports
# - Network paths
```

---

## Reload Profile Without Restarting

```powershell
# Reload current profile
. $PROFILE

# Or restart the session
```

---

## Summary

Create with `New-Item $PROFILE -Force`. Add aliases, functions and module imports. PSReadLine for better history. Use `UpArrow` for history search after enabling it. Reload with `. $PROFILE`. All-users profile for team-wide settings.

## Frequently Asked Questions

### Profile doesn't load — execution policy blocking it?

```powershell
# Check execution policy
Get-ExecutionPolicy -List

# Allow local scripts
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### How do I share my profile across multiple PCs?

Store your profile in OneDrive and symlink it:
```powershell
$profileDir = Split-Path $PROFILE
New-Item -ItemType SymbolicLink -Path $PROFILE `
  -Target "C:\OneDrive\PowerShell\Microsoft.PowerShell_profile.ps1"
```

### Does profile affect ISE and VS Code terminal separately?

Yes — each host has its own profile. `$PROFILE.CurrentUserCurrentHost` is host-specific. Use `$PROFILE.CurrentUserAllHosts` for a profile that applies to all PowerShell hosts.
