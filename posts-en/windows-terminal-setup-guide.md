---
title: "Windows Terminal: Modern Terminal for PowerShell, CMD and WSL on Windows"
date: "2026-06-18"
publishDate: "2026-08-29"
updated: "2026-06-18"
description: "How to install and configure Windows Terminal on Windows 10 and 11. Tabs, profiles, themes, fonts, keyboard shortcuts and settings.json configuration."
tags: ["windows", "windows-terminal", "terminal", "powershell", "tools", "development"]
readTime: 7
translatesUk: "windows-terminal-povnyy-gaid"
---

Windows Terminal is Microsoft's modern terminal replacing old cmd.exe and PowerShell windows. Tabs, GPU acceleration, Unicode support, full customization — all in one.

---

## Install

```powershell
winget install Microsoft.WindowsTerminal
```
Built into Windows 11 by default.

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+Shift+T` | New tab |
| `Ctrl+Tab` | Next tab |
| `Ctrl+Shift+W` | Close tab |
| `Alt+Shift++` | Split vertically |
| `Alt+Shift+-` | Split horizontally |
| `Alt+arrows` | Switch panes |
| `Ctrl+,` | Open settings |
| `F11` | Fullscreen |

---

## Configure Profiles (settings.json)

```json
{
    "profiles": {
        "defaults": {
            "font": { "face": "JetBrains Mono", "size": 12 },
            "opacity": 95,
            "useAcrylic": true,
            "bellStyle": "none"
        },
        "list": [
            {
                "name": "PowerShell",
                "commandline": "pwsh.exe",
                "startingDirectory": "%USERPROFILE%"
            },
            {
                "name": "Git Bash",
                "commandline": "C:\\Program Files\\Git\\bin\\bash.exe"
            }
        ]
    }
}
```

---

## Themes

Browse and copy themes from [windowsterminalthemes.dev](https://windowsterminalthemes.dev) → paste into `schemes` section in settings.json.

**Nerd Fonts** for icons in prompt: download from [nerdfonts.com](https://www.nerdfonts.com) → set in profile font settings.

---

## Oh My Posh — Beautiful Prompt

```powershell
winget install JanDeDobbeleer.OhMyPosh

# Add to PowerShell profile
notepad $PROFILE
# Add: oh-my-posh init pwsh --config "$env:POSH_THEMES_PATH\atomic.omp.json" | Invoke-Expression
```

---

## Quake Mode

```json
{
    "keybindings": [{
        "command": { "action": "globalSummon", "monitor": "any" },
        "keys": "ctrl+`"
    }]
}
```

Press `` Ctrl+` `` — terminal drops down from the top of screen.

---

## Summary

| Task | Solution |
|------|---------|
| Install | `winget install Microsoft.WindowsTerminal` |
| New tab | Ctrl+Shift+T |
| Split pane | Alt+Shift+= |
| Settings | Ctrl+, or settings.json |
| Themes | windowsterminalthemes.dev |
| Beautiful prompt | Oh My Posh |
