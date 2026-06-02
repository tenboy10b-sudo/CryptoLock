---
title: "Як створити і налаштувати профіль PowerShell для власного середовища"
date: "2026-07-29"
publishDate: "2026-07-29"
description: "Створення і налаштування профілю PowerShell для автоматичного завантаження аліасів, функцій і модулів. Кастомний prompt і зручне середовище кожної сесії."
tags: ["windows", "powershell", "скрипти", "автоматизація", "продуктивність"]
readTime: 4
translatesEn: "how-to-configure-windows-powershell-profiles"
---

Профіль PowerShell — скрипт що запускається автоматично при старті. Налаштуй один раз і отримуй власне середовище кожен сеанс.

---

## Розташування профілю

```powershell
# Поточний шлях
$PROFILE.CurrentUserCurrentHost

# Перевірити чи існує
Test-Path $PROFILE
```

---

## Створити профіль

```powershell
if (-not (Test-Path $PROFILE)) {
  New-Item $PROFILE -ItemType File -Force
}

notepad $PROFILE  # відкрити для редагування
```

---

## Корисний вміст профілю

```powershell
# === АЛІАСИ ===
Set-Alias ll Get-ChildItem
Set-Alias grep Select-String
Set-Alias which Get-Command

# === ФУНКЦІЇ ===
function Get-PublicIP {
  (Invoke-RestMethod "https://api.ipify.org?format=json").ip
}

function uptime {
  (Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
}

# === ЗМІННІ СЕРЕДОВИЩА ===
$env:Path += ";C:\Tools;C:\Scripts"

# === PSReadLine (краща автодоповнення і історія) ===
Set-PSReadLineOption -PredictionSource History
Set-PSReadLineKeyHandler -Key UpArrow -Function HistorySearchBackward
Set-PSReadLineKeyHandler -Key DownArrow -Function HistorySearchForward

# === МОДУЛІ ===
Import-Module Terminal-Icons -EA 0  # іконки типів файлів
Import-Module Posh-Git -EA 0        # git статус в prompt
```

---

## Встановити корисні модулі

```powershell
Install-Module PSReadLine -Force -AllowPrerelease
Install-Module Terminal-Icons -Force
Install-Module Posh-Git -Force
```

---

## Перезавантажити профіль без рестарту

```powershell
. $PROFILE
```

---

## Часті питання

### Профіль не завантажується — ExecutionPolicy блокує?

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Як синхронізувати профіль між ПК?

Зберігай в OneDrive і створи симлінк:
```powershell
New-Item -ItemType SymbolicLink -Path $PROFILE `
  -Target "C:\OneDrive\PowerShell\Microsoft.PowerShell_profile.ps1"
```

---

## Резюме

`New-Item $PROFILE -Force` для створення. Аліаси, функції і модулі. PSReadLine для кращої історії. `UpArrow` для пошуку в історії. Перезавантаження через `. $PROFILE`. All-users профіль для загальних налаштувань команди.
