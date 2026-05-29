---
title: "How to Set PowerShell Execution Policy in Windows"
date: "2026-04-30"
publishDate: "2026-04-30"
description: "PowerShell execution policy controls which scripts can run. How to check, change, and bypass execution policy for different scopes — user, machine, and process."
tags: ["windows", "powershell", "security", "administration"]
readTime: 4
---

PowerShell execution policy determines whether scripts can run and which ones require a digital signature. It's not a security boundary — a determined user can bypass it — but it prevents accidental script execution.

---

## Check Current Policy

```powershell
# Current effective policy
Get-ExecutionPolicy

# Policy per scope
Get-ExecutionPolicy -List
```

Scopes from highest to lowest priority:
- **MachinePolicy** — set by Group Policy for computer
- **UserPolicy** — set by Group Policy for user
- **Process** — current session only
- **CurrentUser** — current user, persistent
- **LocalMachine** — all users on this PC

---

## Policy Levels Explained

| Policy | What it allows |
|--------|---------------|
| **Restricted** | No scripts (default on client Windows) |
| **AllSigned** | Only scripts signed by trusted publisher |
| **RemoteSigned** | Local scripts run freely; downloaded scripts need signature |
| **Unrestricted** | All scripts run, downloaded scripts show warning |
| **Bypass** | Everything runs, no warnings |

**RemoteSigned** is the recommended setting for development work.

---

## Change Execution Policy

```powershell
# For current user (no admin required)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# For all users on machine (requires admin)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine

# Confirm without prompt
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

---

## Bypass for a Single Session

```powershell
# Set bypass for current PowerShell session only
Set-ExecutionPolicy Bypass -Scope Process -Force

# Or launch PowerShell with bypass directly
powershell.exe -ExecutionPolicy Bypass -File "C:\Scripts\script.ps1"
```

---

## Run One Script Regardless of Policy

```powershell
# Read and execute content (bypasses policy check)
Get-Content "C:\Scripts\script.ps1" | Invoke-Expression

# Or pipe through
powershell.exe -Command "& {$(Get-Content 'C:\script.ps1' -Raw)}"
```

---

## Unblock a Downloaded Script

Windows marks downloaded files with a Zone Identifier. PowerShell refuses to run them under RemoteSigned:

```powershell
# Unblock a specific file
Unblock-File -Path "C:\Downloads\script.ps1"

# Unblock all ps1 files in a folder
Get-ChildItem "C:\Downloads\*.ps1" | Unblock-File

# Check if file is blocked
Get-Item "C:\script.ps1" -Stream Zone.Identifier -ErrorAction SilentlyContinue
```

---

## Group Policy Override

If execution policy is set via GPO it can't be changed with `Set-ExecutionPolicy`. Check:

```powershell
Get-ExecutionPolicy -List | Where-Object {$_.Scope -like "*Policy*"}
```

If `MachinePolicy` or `UserPolicy` is set — contact your IT administrator.

---


---

## ⚡ Шукаєш потрібну команду?

**[→ PowerShell і CMD довідник](/tools/powershell-commands)** — 40+ команд з пошуком за задачею. Введи "мережа", "диск" або "безпека" і одразу отримай готову команду.


## Summary

Check with `Get-ExecutionPolicy -List`. For development: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`. For a single script: use `-ExecutionPolicy Bypass` when launching PowerShell. For downloaded scripts: `Unblock-File` removes the block. If GPO overrides your setting — it can only be changed by an administrator.
