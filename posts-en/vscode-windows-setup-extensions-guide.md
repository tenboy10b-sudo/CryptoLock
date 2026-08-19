---
title: "VS Code on Windows: Installation, Setup and Top Extensions for Developers"
date: "2027-01-08"
publishDate: "2027-01-08"
updated: "2026-09-29"
description: "How to install Visual Studio Code on Windows 10 and 11. Theme, font, autosave settings. Top extensions for Python, JavaScript, PHP. Essential VS Code keyboard shortcuts."
tags: ["windows", "vscode", "development", "tools", "programming"]
readTime: 8
translatesUk: "vscode-windows-vstanovlennya-rozshyrennya"
---

Visual Studio Code is the world's most popular code editor. Free, open source, supports hundreds of programming languages.

---

## Install

```powershell
winget install Microsoft.VisualStudioCode
```
Or from [code.visualstudio.com](https://code.visualstudio.com) → check **"Add Open with Code to context menu"** options.

---

## Initial Setup

### Theme
`Ctrl+K Ctrl+T` — popular: **One Dark Pro**, **GitHub Dark**, **Dracula**

### Font with ligatures
```json
{
  "editor.fontFamily": "JetBrains Mono, Fira Code, Consolas",
  "editor.fontLigatures": true,
  "editor.fontSize": 14,
  "editor.lineHeight": 1.6
}
```
Download JetBrains Mono free from [jetbrains.com/lp/mono](https://www.jetbrains.com/lp/mono/)

### Key settings (settings.json)
```json
{
  "files.autoSave": "afterDelay",
  "editor.formatOnSave": true,
  "editor.wordWrap": "on",
  "editor.tabSize": 2,
  "editor.minimap.enabled": false,
  "terminal.integrated.defaultProfile.windows": "PowerShell"
}
```

---

## Top Extensions

### Essential (all languages)
- **GitLens** — `eamodio.gitlens` — who changed every line
- **Prettier** — `esbenp.prettier-vscode` — code formatting
- **Error Lens** — `usernamehw.errorlens` — inline error display
- **Todo Tree** — `gruntfuggly.todo-tree` — find all TODOs

### Python
```
ms-python.python  ms-python.pylance  ms-python.black-formatter
```

### JavaScript
```
dbaeumer.vscode-eslint  esbenp.prettier-vscode  formulahendry.auto-rename-tag
```

### Docker
```
ms-azuretools.vscode-docker
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+P` | Quick open file |
| `Ctrl+Shift+P` | Command palette |
| `Ctrl+`` ` | Open terminal |
| `Ctrl+/` | Comment line |
| `Alt+↑/↓` | Move line |
| `Ctrl+D` | Select next occurrence |
| `F12` | Go to definition |
| `F2` | Rename symbol |

---

## Open from Terminal

```powershell
code .           # open current folder
code index.js   # open specific file
code C:\Project # open folder
```

---

## Settings Sync

Sync settings, extensions and keybindings across devices:
```
Ctrl+Shift+P → Settings Sync: Turn On → sign in with GitHub
```

---

## Summary

| Task | Action |
|------|--------|
| Install | `winget install vscode` |
| Theme | Ctrl+K Ctrl+T |
| Settings | Ctrl+, |
| Extensions | Ctrl+Shift+X |
| Open folder | `code .` in terminal |
| Sync | Settings Sync via GitHub |
