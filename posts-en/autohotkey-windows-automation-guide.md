---
title: "AutoHotkey on Windows: Automation, Hotkeys and Macros Guide"
date: "2026-06-15"
publishDate: "2026-08-31"
updated: "2026-06-15"
description: "How to install AutoHotkey and write your first scripts for Windows automation. Custom hotkeys, text macros, window management, mouse control and auto-startup."
tags: ["windows", "autohotkey", "automation", "tools", "scripting"]
readTime: 8
translatesUk: "autohotkey-windows-avtomatyzatsiya"
---

AutoHotkey (AHK) is a free scripting language for Windows automation. Assign hotkeys, automate repetitive tasks and create macros — no programming experience required.

---

## Install

```powershell
winget install AutoHotkey.AutoHotkey
```
Or from [autohotkey.com](https://www.autohotkey.com) → Download → **AutoHotkey v2**

**Create first script:** Right-click desktop → New → AutoHotkey Script → open in Notepad → write code → save → double-click to run.

---

## Basic Syntax (AHK v2)

```autohotkey
; Hotkey: Win+N opens Notepad
#n:: Run "notepad.exe"

; Ctrl+Shift+T shows message
^+t:: MsgBox "Hello!"

; F1 opens website
F1:: Run "https://cryptolockua.com"
```

**Modifiers:** `#` Win, `^` Ctrl, `!` Alt, `+` Shift

---

## Text Macros (Hotstrings)

Auto-replace typed text:

```autohotkey
; Type "@@" → replaces with email
::@@::my@email.com

; Type "addr" → expands to full address
::addr::123 Main St, New York, NY 10001

; Auto-correct typos
::teh::the
::recieve::receive
```

---

## Window Management

```autohotkey
; Ctrl+Alt+M — minimize current window
^!m:: WinMinimize "A"

; Ctrl+Alt+F — always on top toggle
^!f::
{
    hwnd := WinGetID("A")
    WinSetAlwaysOnTop -1, hwnd
}

; Win+Q — close current window
#q:: WinClose "A"
```

---

## Mouse and Keyboard Automation

```autohotkey
; Click at specific position
Click 100, 200

; Move mouse
MouseMove 500, 300, 10

; Type text
SendText "This is automated text!"

; Press keys
Send "{Enter}"
Send "^c"  ; Ctrl+C

; Delay between actions
Sleep 1000
```

---

## Practical Examples

### Auto-fill login form

```autohotkey
F2::
{
    Send "myusername{Tab}mypassword{Enter}"
}
```

### Open multiple apps at once

```autohotkey
#Requires AutoHotkey v2.0
Run "C:\Program Files\Telegram Desktop\Telegram.exe"
Sleep 500
Run "C:\Program Files\Microsoft VS Code\Code.exe"
```

---

## Auto-start with Windows

1. `Win + R` → `shell:startup`
2. Copy `.ahk` file to that folder

---

## Compile to .exe

Right-click `.ahk` file → **Compile Script** — runs without AutoHotkey installed.

---

## Summary

| Task | Code |
|------|------|
| Hotkey | `^+t:: MsgBox "text"` |
| Text macro | `::short::full text` |
| Open program | `#n:: Run "notepad.exe"` |
| Auto-start | Copy to `shell:startup` |
| Compile | Right-click → Compile Script |
