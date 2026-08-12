---
title: "How to Run PowerShell as Administrator in Windows 10 and 11"
date: "2027-02-08"
publishDate: "2026-08-27"
description: "Run PowerShell as Administrator in Windows 10 and 11. All methods: keyboard shortcuts, right-click, Task Manager, scheduled tasks and auto-elevate scripts."
tags: ["windows", "powershell", "administration", "security", "automation"]
readTime: 4
translatesUk: "yak-zapustyty-powershell-administratora"
---

Many PowerShell commands require Administrator rights. Here are all the ways to open an elevated PowerShell session.

---

## Method 1: Keyboard Shortcut (Fastest)

`Win + X` → **Terminal (Admin)** or **Windows PowerShell (Admin)**

Or: `Win + S` → type `powershell` → press `Ctrl + Shift + Enter`

---

## Method 2: Right-Click on Start

Right-click the **Start button** → **Terminal (Admin)** or **PowerShell (Admin)**

---

## Method 3: From Run Dialog

`Win + R` → type `powershell` → press `Ctrl + Shift + Enter`

---

## Method 4: From Task Manager

`Ctrl + Shift + Esc` → **File** → **Run new task** → type `powershell` → check **Create this task with administrative privileges** → OK

---

## Method 5: From Existing PowerShell

```powershell
# Check if current session is Admin
([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]"Administrator")

# Open new elevated PowerShell from current session
Start-Process powershell -Verb RunAs
```

---

## Method 6: Create Desktop Shortcut

Right-click Desktop → **New** → **Shortcut**
Target: `powershell.exe`
Right-click shortcut → **Properties** → **Advanced** → check **Run as administrator** → OK

---

## Auto-Elevate a PowerShell Script

Add this at the top of any `.ps1` script to automatically request elevation:

```powershell
# Auto-elevate script
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]"Administrator")) {
  Start-Process PowerShell -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
  Exit
}

# Your script code here — runs with admin rights
Write-Host "Running as Administrator"
```

---

## Run Specific Commands as Admin

```powershell
# Run a single command elevated
Start-Process powershell -Verb RunAs -ArgumentList "-Command `"sfc /scannow`""

# Run a script file elevated
Start-Process powershell -Verb RunAs -ArgumentList "-ExecutionPolicy Bypass -File C:\Scripts\fix.ps1"
```

---

## Set Execution Policy

```powershell
# Allow local scripts to run (most common setting)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Allow all scripts (less secure)
Set-ExecutionPolicy Unrestricted

# Check current policy
Get-ExecutionPolicy -List
```

---

## Summary

Fastest: `Win + X` → Terminal (Admin). From search: type `powershell` + `Ctrl+Shift+Enter`. Check if elevated: `([Security.Principal.WindowsPrincipal]...).IsInRole("Administrator")`. Auto-elevate scripts with the self-elevation snippet.

## Frequently Asked Questions

### Why do some commands fail even in admin PowerShell?

Some commands require the PowerShell window to be started directly as Admin (not just `Start-Process ... -Verb RunAs`). Also check execution policy with `Get-ExecutionPolicy`.

### Can I always run PowerShell as Admin by default?

Yes — right-click the PowerShell shortcut → Properties → Advanced → Run as administrator. Note: this prompts UAC every time you open it.

### How do I run PowerShell as Admin without UAC prompt?

Create a scheduled task with highest privileges and no triggers, then run it on demand: `Start-ScheduledTask -TaskName "AdminPS"`. This bypasses UAC but requires initial setup as Administrator.
