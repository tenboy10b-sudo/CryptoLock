---
title: "How to Use Winget: Windows Package Manager Complete Guide"
date: "2026-12-15"
publishDate: "2026-12-15"
description: "Winget is Windows' built-in package manager. Install, update, and remove apps from the command line — no browser, no installers. Complete guide with examples."
tags: ["windows", "tools", "powershell", "administration"]
readTime: 6
---

Winget is Microsoft's official package manager for Windows — think `apt` or `brew` but for Windows. Install any app with one command, update everything at once, no clicking through installers.

---

## Check if Winget is Installed

```powershell
winget --version
```

Winget comes pre-installed on Windows 10 (1809+) and Windows 11. If missing:
- Open Microsoft Store → search **App Installer** → Update

---

## Install Apps

```powershell
# Install by name (winget finds the best match)
winget install "Google Chrome"
winget install "Visual Studio Code"
winget install "7-Zip"

# Install by exact ID (more reliable, avoids wrong matches)
winget install Google.Chrome
winget install Microsoft.VisualStudioCode
winget install 7zip.7zip

# Install silently (no prompts, no GUI)
winget install Google.Chrome --silent

# Install specific version
winget install Git.Git --version 2.43.0
```

---

## Search for Packages

```powershell
# Search by name
winget search chrome
winget search "visual studio"
winget search vlc

# Search and show details
winget show Mozilla.Firefox
```

---

## Update Apps

```powershell
# List all apps with available updates
winget upgrade

# Update a specific app
winget upgrade Google.Chrome

# Update everything at once
winget upgrade --all

# Update all, skip prompts
winget upgrade --all --silent
```

---

## Remove Apps

```powershell
winget uninstall Google.Chrome
winget uninstall --id Google.Chrome

# List installed apps managed by winget
winget list
```

---

## Export and Import App List

Perfect for setting up a new PC with all your apps:

```powershell
# Export installed apps to JSON
winget export -o C:\apps.json

# Import and install everything on a new PC
winget import -i C:\apps.json --ignore-unavailable
```

---

## Most Useful Apps via Winget

```powershell
# Development
winget install Microsoft.VisualStudioCode
winget install Git.Git
winget install OpenJS.NodeJS.LTS
winget install Python.Python.3.12
winget install Microsoft.WindowsTerminal
winget install Microsoft.PowerShell

# Security
winget install Bitwarden.Bitwarden
winget install KeePassXCTeam.KeePassXC

# Utilities
winget install 7zip.7zip
winget install VideoLAN.VLC
winget install voidtools.Everything
winget install Microsoft.PowerToys
winget install Rufus.Rufus

# Browsers
winget install Mozilla.Firefox
winget install Google.Chrome
```

---

## Winget vs Chocolatey vs Scoop

| Feature | Winget | Chocolatey | Scoop |
|---------|--------|------------|-------|
| Built into Windows | ✅ | ❌ | ❌ |
| Package count | 5000+ | 10000+ | 2000+ |
| Requires admin | Sometimes | Yes | No |
| Best for | General apps | Enterprise | Dev tools |

---

## Automate App Setup Script

Save and run on any new Windows PC:

```powershell
# setup-pc.ps1
$apps = @(
  "Microsoft.WindowsTerminal",
  "Microsoft.PowerShell",
  "Microsoft.VisualStudioCode",
  "Git.Git",
  "7zip.7zip",
  "VideoLAN.VLC",
  "Mozilla.Firefox",
  "voidtools.Everything",
  "Microsoft.PowerToys",
  "Bitwarden.Bitwarden"
)

foreach ($app in $apps) {
  Write-Host "Installing $app..." -ForegroundColor Cyan
  winget install $app --silent --accept-source-agreements --accept-package-agreements
}

Write-Host "Done!" -ForegroundColor Green
```

---

## Summary

`winget install AppName` to install. `winget upgrade --all` to update everything. `winget export` to backup your app list. Use IDs (`winget show AppName` reveals the ID) for reliable scripts. Winget is already on your PC — no setup needed.
