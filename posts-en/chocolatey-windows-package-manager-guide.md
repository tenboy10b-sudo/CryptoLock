---
title: "Chocolatey: Windows Package Manager — Install Any Program with One Command"
date: "2026-10-09"
publishDate: "2026-10-09"
updated: "2026-09-03"
description: "How to install Chocolatey on Windows 10 and 11 and manage software from the command line. Install, update and remove programs, automate new PC setup with a single script."
tags: ["windows", "chocolatey", "automation", "tools", "powershell"]
readTime: 7
translatesUk: "chocolatey-menedzher-paketiv-windows"
---

Chocolatey is a package manager for Windows — like apt on Linux or brew on macOS. Instead of finding a website, downloading an installer and clicking Next-Next-Finish, one command installs any program.

---

## Install Chocolatey

Open PowerShell as administrator:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

Verify:
```powershell
choco --version
```

---

## Essential Commands

```powershell
choco install vlc              # install
choco install vlc 7zip -y     # install multiple, no prompts
choco upgrade vlc              # update
choco upgrade all -y           # update everything
choco uninstall vlc            # remove
choco search firefox           # search
choco list --local-only        # list installed
```

---

## Popular Packages

```powershell
# Browsers
choco install googlechrome firefox brave

# Media
choco install vlc spotify

# Development
choco install vscode git nodejs python

# Utilities
choco install 7zip notepadplusplus everything powertoys

# Communication
choco install telegram.install discord zoom
```

---

## Automate New PC Setup

```powershell
# setup-new-pc.ps1 (run as administrator)
Set-ExecutionPolicy Bypass -Scope Process -Force
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

choco install -y `
    7zip googlechrome firefox vlc `
    notepadplusplus everything git `
    vscode telegram.install powertoys

Write-Host "✅ All programs installed!" -ForegroundColor Green
```

---

## GUI

```powershell
choco install chocolateygui
```

---

## Chocolatey vs winget vs Scoop

| | Chocolatey | winget | Scoop |
|-|-----------|--------|-------|
| Packages | ~10000 | ~6000 | ~6000 |
| GUI | ✅ | ❌ | ❌ |
| Admin required | Yes | Not always | No |
| Built into Windows | ❌ | ✅ (Win 10/11) | ❌ |

---

## Summary

| Task | Command |
|------|---------|
| Install | `choco install name` |
| Install silently | `choco install name -y` |
| Update all | `choco upgrade all -y` |
| Remove | `choco uninstall name` |
| Search | `choco search name` |
