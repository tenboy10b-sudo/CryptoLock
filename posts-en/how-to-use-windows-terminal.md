---
title: "How to Use Windows Terminal: Tabs, Profiles and Customization"
date: "2026-05-09"
publishDate: "2026-05-09"
description: "Master Windows Terminal in Windows 10 and 11. Configure profiles for PowerShell, CMD and WSL, set up tabs, customize appearance, key bindings and JSON settings."
tags: ["windows", "terminal", "powershell", "wsl", "productivity"]
readTime: 5
translatesUk: "yak-korystuvatys-windows-terminal"
---

Windows Terminal is the modern replacement for the old CMD and PowerShell windows — it supports tabs, multiple shells, GPU rendering and full customization.

---

## Install Windows Terminal

```powershell
winget install Microsoft.WindowsTerminal
```

Or download from the Microsoft Store (pre-installed on Windows 11).

---

## Open Shells

- `Win + X` → **Terminal** (opens default shell)
- Click `+` in tab bar → select shell
- `Ctrl + Shift + 1` — new PowerShell tab
- `Ctrl + Shift + 2` — new CMD tab
- `Ctrl + Shift + 5` — new WSL tab (if installed)

---

## Essential Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Shift + T` | New tab (default profile) |
| `Ctrl + Shift + W` | Close tab |
| `Alt + Shift + D` | Split pane horizontally |
| `Alt + Shift + +` | Split pane vertically |
| `Ctrl + Tab` | Next tab |
| `Ctrl + Shift + F` | Find in terminal |
| `Ctrl + ,` | Open settings |
| `F11` | Full screen |

---

## Configure Default Profile

`Ctrl + ,` → **Startup** → **Default profile** → select PowerShell, CMD or WSL

```json
// settings.json — set default profile
{
  "defaultProfile": "{574e775e-4f2a-5b96-ac1e-a2962a402336}"
}
```

---

## Customize Appearance

```json
// settings.json → profiles → defaults
{
  "profiles": {
    "defaults": {
      "colorScheme": "One Half Dark",
      "font": {
        "face": "Cascadia Code",
        "size": 12
      },
      "opacity": 90,
      "useAcrylic": true,
      "padding": "8, 8, 8, 8",
      "cursorShape": "bar"
    }
  }
}
```

---

## Add Custom Profile

```json
// Add to profiles → list in settings.json
{
  "name": "Admin PowerShell",
  "commandline": "powershell.exe -NoExit -Command \"Start-Process powershell -Verb RunAs\"",
  "icon": "ms-appx:///ProfileIcons/{61c54bbd-c2c6-5271-96e7-009a87ff44bf}.png",
  "colorScheme": "Campbell Powershell"
}
```

---

## Set Starting Directory

```json
{
  "profiles": {
    "list": [
      {
        "name": "PowerShell",
        "startingDirectory": "C:\\Projects"
      }
    ]
  }
}
```

---

## Custom Key Bindings

```json
{
  "actions": [
    { "command": "newTab", "keys": "ctrl+t" },
    { "command": "closeTab", "keys": "ctrl+w" },
    { "command": { "action": "splitPane", "split": "vertical" }, "keys": "ctrl+shift+e" },
    { "command": "toggleFullscreen", "keys": "f11" }
  ]
}
```

---

## Install Cascadia Code Font (Recommended)

```powershell
winget install Microsoft.CascadiaCode
```

Cascadia Code supports programming ligatures (`->`, `=>`, `!=`) and Nerd Font icons for a better terminal experience.

---

## Open Terminal Here (Context Menu)

Right-click any folder → **Open in Terminal** (Windows 11 built-in)

For Windows 10:
```powershell
# Add "Open Terminal here" to context menu
$regPath = "HKCU:\SOFTWARE\Classes\Directory\Background\shell\wt"
New-Item -Path $regPath -Force
Set-ItemProperty $regPath -Name "(Default)" -Value "Open in Terminal"
New-Item -Path "$regPath\command" -Force
Set-ItemProperty "$regPath\command" -Name "(Default)" -Value "wt.exe -d ."
```

---

## Summary

Install via winget or Store. Essential: tabs (`Ctrl+Shift+T`), split panes (`Alt+Shift+D`), settings via JSON (`Ctrl+,`). Install Cascadia Code for the best experience. Set starting directory per profile for faster workflow.

## Frequently Asked Questions

### Windows Terminal vs PowerShell ISE — which should I use?

Windows Terminal for everyday command-line work. PowerShell ISE for writing and debugging scripts (it has a proper script editor). ISE doesn't support PowerShell 7 — use VS Code with PowerShell extension instead.

### Can I run Linux commands in Windows Terminal?

Yes — install WSL (`wsl --install`) then open a WSL tab in Terminal. Full Linux environment alongside Windows shells in the same window.

### My terminal doesn't show UTF-8 characters correctly — fix?

```powershell
# Set UTF-8 in PowerShell profile
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
# Or in settings.json add "experimental.rendering.forceFullRepaint": true
```
