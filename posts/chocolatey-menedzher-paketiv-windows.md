---
title: "Chocolatey: менеджер пакетів для Windows — встановлення програм однією командою"
date: "2026-06-14"
publishDate: "2026-09-03"
updated: "2026-06-14"
description: "Як встановити Chocolatey на Windows 10 і 11 і керувати програмами через командний рядок. Встановлення, оновлення і видалення програм, автоматизація налаштування нового ПК."
tags: ["windows", "chocolatey", "автоматизація", "інструменти", "powershell"]
readTime: 7
translatesEn: "chocolatey-windows-package-manager-guide"
---

Chocolatey — менеджер пакетів для Windows як apt в Linux або brew на macOS. Замість того щоб шукати сайт, завантажувати інсталятор і клікати Next-Next-Finish — одна команда встановлює будь-яку програму.

---

## Встановлення Chocolatey

Відкрий PowerShell від адміністратора і виконай:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

Перевір встановлення:
```powershell
choco --version
# Chocolatey v2.x.x
```

---

## Основні команди

```powershell
# Встановити програму
choco install vlc

# Встановити кілька програм одразу
choco install vlc 7zip googlechrome vscode -y

# Оновити програму
choco upgrade vlc

# Оновити всі програми
choco upgrade all -y

# Видалити програму
choco uninstall vlc

# Пошук програми
choco search firefox

# Список встановлених через Chocolatey
choco list --local-only

# Інформація про пакет
choco info vlc
```

Прапорець `-y` — автоматично підтверджувати всі запити.

---

## Топ програм в Chocolatey

```powershell
# Браузери
choco install googlechrome firefox brave

# Медіа
choco install vlc spotify

# Архіватори
choco install 7zip winrar

# Розробка
choco install vscode git nodejs python

# Утиліти
choco install 7zip notepadplusplus everything bulk-crap-uninstaller

# Комунікації
choco install telegram.install discord zoom

# Безпека
choco install malwarebytes

# Системні
choco install powertoys sysinternals windhawk
```

---

## Автоматизація налаштування нового ПК

Головна суперсила Chocolatey — один скрипт встановлює всі потрібні програми:

```powershell
# setup-new-pc.ps1 — запускай від адміністратора
# Спочатку встановлюємо Chocolatey
Set-ExecutionPolicy Bypass -Scope Process -Force
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Базові утиліти
choco install -y `
    7zip `
    googlechrome `
    firefox `
    vlc `
    notepadplusplus `
    everything `
    git `
    vscode `
    telegram.install `
    powertoys `
    windirstat `
    malwarebytes

Write-Host "✅ Всі програми встановлено!" -ForegroundColor Green
```

Збережи як `setup-new-pc.ps1` і запускай на кожному новому ПК.

---

## Chocolatey GUI

Якщо хочеш графічний інтерфейс:

```powershell
choco install chocolateygui
```

Відкривається через меню Пуск → Chocolatey GUI. Показує всі доступні і встановлені пакети, дозволяє оновлювати через клік.

---

## Пакети і версії

```powershell
# Встановити конкретну версію
choco install nodejs --version 18.17.0

# Закріпити версію (не оновлювати)
choco pin add -n nodejs

# Подивитись закріплені
choco pin list

# Зняти закріплення
choco pin remove -n nodejs
```

---

## Chocolatey vs winget vs Scoop

| | Chocolatey | winget | Scoop |
|-|-----------|--------|-------|
| Розробник | Chocolatey Inc. | Microsoft | Спільнота |
| Кількість пакетів | ~10000 | ~6000 | ~6000 |
| GUI | ✅ | ❌ | ❌ |
| Корпоративне використання | ✅ (Pro/Business) | Обмежено | ❌ |
| Права адміна | Потрібні | Не завжди | Не потрібні |
| Встановлення | Скрипт | Вбудований в Win 10/11 | Git |

**Winget** — вбудований в Windows 10/11, простіший але менше пакетів.
**Chocolatey** — більше пакетів, краща автоматизація, корпоративні функції.
**Scoop** — без адмін прав, для розробників.

---

## Вирішення проблем

### "choco не знайдено" після встановлення

```powershell
# Оновити PATH в поточній сесії
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine")
```

Або закрий і знову відкрий PowerShell.

### Помилка "Access Denied"

Chocolatey потребує прав адміністратора. Відкрий PowerShell через ПКМ → "Запуск від імені адміністратора".

### Конфлікт з встановленою програмою

```powershell
# Встановити ігноруючи вже встановлену версію
choco install vlc --force
```

---

## Резюме

| Задача | Команда |
|--------|---------|
| Встановити | `choco install назва` |
| Встановити без запитів | `choco install назва -y` |
| Оновити все | `choco upgrade all -y` |
| Видалити | `choco uninstall назва` |
| Пошук | `choco search назва` |
| GUI | `choco install chocolateygui` |
