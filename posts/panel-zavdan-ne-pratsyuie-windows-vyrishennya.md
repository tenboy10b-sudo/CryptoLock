---
title: "Панель завдань не працює в Windows 10 і 11: виправлення зависання і зникнення"
date: "2026-06-20"
publishDate: "2026-08-25"
updated: "2026-06-20"
description: "Що робити якщо панель завдань зависла, не відповідає або зникла в Windows 10 і 11. Перезапустити Explorer, виправити через PowerShell і що робити якщо нічого не допомагає."
tags: ["windows", "панель-завдань", "explorer", "виправлення", "налаштування"]
readTime: 6
translatesEn: "taskbar-not-working-windows-fix"
---

Панель завдань зависла, не реагує на кліки або зникла? Ось швидкі рішення від перезапуску Explorer до глибокого виправлення.

---

## Крок 1 — Перезапустити Explorer

Найшвидше рішення для 80% випадків:

```powershell
# Перезапустити Explorer
Stop-Process -Name explorer -Force
Start-Process explorer
```

Або через Диспетчер завдань:
```
Ctrl+Shift+Esc → знайди "Windows Explorer" →
ПКМ → "Перезапустити"
```

---

## Крок 2 — Перезапустити службу панелі завдань

```powershell
# Перезапустити службу
Get-Process -Name "ShellExperienceHost" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "SearchIndexer" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "SearchHost" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Process "explorer.exe"
```

---

## Крок 3 — Виправити через PowerShell

```powershell
# Від адміністратора — перереєструвати системні додатки
Get-AppXPackage -AllUsers |
    Where-Object {$_.InstallLocation -like "*SystemApps*"} |
    ForEach-Object {
        Add-AppxPackage -DisableDevelopmentMode -Register "$($_.InstallLocation)\AppXManifest.xml"
    }
```

---

## Крок 4 — Перевірити системні файли

```powershell
# Перевірка і відновлення
sfc /scannow
DISM /Online /Cleanup-Image /RestoreHealth
```

---

## Крок 5 — Видалити проблемні оновлення

Якщо проблема з'явилась після оновлення Windows:

```powershell
# Переглянути останні оновлення
Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 5

# Видалити проблемне оновлення (замінити KB_NUMBER)
wusa /uninstall /kb:KB_NUMBER /quiet /norestart
```

---

## Крок 6 — Скинути налаштування панелі завдань

```powershell
# Видалити налаштування (відновляться до стандартних)
Remove-Item "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\StuckRects3" -Force -ErrorAction SilentlyContinue
Remove-Item "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\TaskBand" -Force -ErrorAction SilentlyContinue

# Перезапустити Explorer
Stop-Process -Name explorer -Force
Start-Process explorer
```

---

## Типові проблеми

### Панель завдань зникла

```powershell
# Перевірити налаштування автоприховування
$reg = Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\StuckRects3"
# Якщо Settings[8] = 3 — автоприховування увімкнено

# Вимкнути автоприховування через реєстр
$value = (Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\StuckRects3").Settings
$value[8] = 2
Set-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\StuckRects3" -Name Settings -Value $value
Stop-Process -Name explorer -Force; Start-Process explorer
```

Або через Параметри:
```
Win + I → Персоналізація → Панель завдань →
"Автоматично приховувати панель завдань" → вимкни
```

### Кнопка Пуск не реагує

```powershell
# Перереєструвати меню Пуск
Get-AppXPackage -Name Microsoft.Windows.ShellExperienceHost |
    ForEach-Object {Add-AppxPackage -DisableDevelopmentMode -Register "$($_.InstallLocation)\AppXManifest.xml"}

Get-AppXPackage -Name Microsoft.Windows.StartMenuExperienceHost |
    ForEach-Object {Add-AppxPackage -DisableDevelopmentMode -Register "$($_.InstallLocation)\AppXManifest.xml"}
```

### Пошук на панелі завдань не працює

```powershell
# Перезапустити службу пошуку
Restart-Service WSearch -Force
Get-Process -Name "SearchHost" -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## Якщо нічого не допомогло

**Створити новий профіль користувача:**

```powershell
# Створити нового адміністратора
net user TempAdmin Password123! /add
net localgroup Administrators TempAdmin /add
```

Увійди під новим акаунтом — якщо панель завдань працює, проблема в профілі старого користувача. Перенеси файли і використовуй новий профіль.

---

## Резюме

| Проблема | Рішення |
|---------|---------|
| Зависла | Stop-Process explorer → Start explorer |
| Зникла | Вимкнути автоприховування |
| Пуск не реагує | Перереєструвати ShellExperienceHost |
| Після оновлення | Видалити проблемне оновлення |
| Нічого не допомагає | Новий профіль користувача |
