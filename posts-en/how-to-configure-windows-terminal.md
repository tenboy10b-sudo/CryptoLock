---
title: "How to Set Up and Customize Windows Terminal"
date: "2026-04-06"
publishDate: "2026-04-06"
description: "Windows Terminal is the modern replacement for CMD and PowerShell windows. How to install it, configure profiles, set up keyboard shortcuts, and customize appearance."
tags: ["windows", "tools", "powershell", "administration"]
readTime: 5
---

Windows Terminal replaces the old CMD and PowerShell windows with tabs, split panes, GPU-accelerated text rendering, and full customization. It's installed by default on Windows 11 and available free on Windows 10.

---

## Install Windows Terminal

**Windows 11:** already installed. Search **Terminal** in Start.

**Windows 10:**
```powershell
winget install Microsoft.WindowsTerminal
```

Or from Microsoft Store: search **Windows Terminal**.

**Set as default terminal:**
`Win + I` → **Privacy & Security** → **For developers** → **Terminal** → **Windows Terminal**

Now CMD and PowerShell open inside Windows Terminal instead of separate windows.

---

## Basic Usage

- **New tab**: `Ctrl + Shift + T` or click `+`
- **New tab with specific shell**: click the dropdown arrow next to `+`
- **Split pane horizontally**: `Alt + Shift + -`
- **Split pane vertically**: `Alt + Shift + +`
- **Switch panes**: `Alt + Arrow keys`
- **Close pane/tab**: `Ctrl + Shift + W`
- **Full screen**: `F11`
- **Search in terminal**: `Ctrl + Shift + F`

---

## Open Terminal Here

Right-click any folder in File Explorer → **Open in Terminal**

This opens the terminal directly in that folder — no `cd` needed.

---

## Configure Profiles (settings.json)

`Ctrl + ,` opens Settings. Click the JSON icon (top right) to edit directly:

```json
{
  "defaultProfile": "{profile-guid}",
  "profiles": {
    "defaults": {
      "font": {
        "face": "Cascadia Code",
        "size": 12
      },
      "opacity": 90,
      "useAcrylic": true
    },
    "list": [
      {
        "name": "PowerShell",
        "commandline": "pwsh.exe",
        "startingDirectory": "%USERPROFILE%",
        "icon": "ms-appx:///ProfileIcons/pwsh.png"
      },
      {
        "name": "Ubuntu",
        "source": "Windows.Terminal.Wsl",
        "startingDirectory": "//wsl.localhost/Ubuntu/home/username"
      },
      {
        "name": "SSH to Server",
        "commandline": "ssh user@192.168.1.100",
        "icon": "🖥️"
      }
    ]
  }
}
```

---

## Install Cascadia Code Font

Microsoft's monospace font with ligatures — designed for terminals:

```powershell
winget install Microsoft.CascadiaCode
```

Or download from [github.com/microsoft/cascadia-code](https://github.com/microsoft/cascadia-code/releases).

---

## Useful Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Shift + T` | New tab (default profile) |
| `Ctrl + Shift + 1-9` | New tab with profile N |
| `Ctrl + Tab` | Next tab |
| `Ctrl + Shift + Tab` | Previous tab |
| `Ctrl + Shift + W` | Close tab |
| `Alt + Shift + D` | Duplicate pane |
| `Ctrl + Shift + F` | Find in terminal |
| `Ctrl + +/-` | Zoom in/out |
| `Ctrl + 0` | Reset zoom |

---

## Set PowerShell 7 as Default

Windows comes with PowerShell 5. PowerShell 7 is faster and more capable:

```powershell
winget install Microsoft.PowerShell
```

After installing, set it as default in Terminal Settings → **Startup** → **Default profile** → select **PowerShell** (the newer one, not Windows PowerShell).

---

## Add Oh My Posh (Better Prompt)

Oh My Posh adds Git status, exit codes, and command timing to your prompt:

```powershell
winget install JanDeDobbeleer.OhMyPosh
oh-my-posh font install meslo

# Add to PowerShell profile
Add-Content $PROFILE "`noh-my-posh init pwsh --config `"$(oh-my-posh env shell)`" | Invoke-Expression"
```

---

## Quake Mode (Drop-Down Terminal)

Press a hotkey to drop a terminal from the top of the screen:

Settings → **Actions** → add:
```json
{ "command": "quakeMode", "keys": "win+`" }
```

Press `` Win + ` `` to show/hide the terminal from any app.

---


---

## ⚡ Looking for the right command?

**[→ PowerShell & CMD Reference](/tools/powershell-commands)** — 40+ commands searchable by task. Type "network", "disk" or "security" to get a ready-to-use command instantly.


## Summary

Install with `winget install Microsoft.WindowsTerminal`. Set as default terminal in Developer settings. Add a custom SSH profile for quick server access. Install PowerShell 7 and set as default profile. Use `Alt + Shift + -/+` for split panes when working with multiple sessions.
