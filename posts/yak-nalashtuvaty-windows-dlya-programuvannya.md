---
title: "Як налаштувати Windows для розробки: середовище з нуля"
date: "2026-04-18"
publishDate: "2026-04-18"
description: "Базове налаштування Windows для програмування: термінал, Git, VS Code, WSL і менеджери пакетів. Все через winget за 20 хвилин."
tags: ["windows", "розробка", "інструменти", "wsl"]
readTime: 5
---

Налаштувати Windows для розробки з нуля — займає менше години якщо знати що встановлювати і в якому порядку.

---

## Крок 1: Встановити базові інструменти через winget

```powershell
# Відкрий PowerShell або Windows Terminal

# Термінал
winget install Microsoft.WindowsTerminal

# Git
winget install Git.Git

# VS Code
winget install Microsoft.VisualStudioCode

# Node.js (LTS)
winget install OpenJS.NodeJS.LTS

# Python
winget install Python.Python.3.12

# 7-Zip
winget install 7zip.7zip

# Bitwarden (паролі)
winget install Bitwarden.Bitwarden
```

---

## Крок 2: WSL 2 для Linux команд

```powershell
wsl --install
```

Перезавантаж → Ubuntu налаштує автоматично при першому запуску.

Оновити пакети в Ubuntu:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential curl wget
```

---

## Крок 3: Налаштувати Git

```bash
# В WSL або Git Bash
git config --global user.name "Твоє Ім'я"
git config --global user.email "email@example.com"
git config --global core.editor "code --wait"
git config --global init.defaultBranch main

# SSH ключ для GitHub
ssh-keygen -t ed25519 -C "email@example.com"
cat ~/.ssh/id_ed25519.pub  # скопіюй і додай на github.com/settings/keys
```

---

## Крок 4: VS Code розширення

Встанови через термінал:
```powershell
# WSL інтеграція
code --install-extension ms-vscode-remote.remote-wsl

# Git
code --install-extension eamodio.gitlens

# Python
code --install-extension ms-python.python

# Prettier (форматування)
code --install-extension esbenp.prettier-vscode

# Підсвітка для різних мов
code --install-extension bradlc.vscode-tailwindcss
code --install-extension dbaeumer.vscode-eslint
```

---

## Крок 5: PowerShell 7 і профіль

```powershell
# Встановити PowerShell 7
winget install Microsoft.PowerShell

# Відкрити профіль для редагування
code $PROFILE

# Додати корисні аліаси
Set-Alias -Name g -Value git
Set-Alias -Name py -Value python
function proj { Set-Location "C:\Projects" }
```

---

## Крок 6: Windows Terminal налаштування

Встанови Cascadia Code (шрифт з лігатурами):
```powershell
winget install Microsoft.CascadiaCode
```

В Windows Terminal Settings (Ctrl+,) → Default → Font face: `Cascadia Code`

---

## Крок 7: Структура проектів

Створи зрозумілу структуру:
```
C:\Projects\
├── personal\
│   ├── my-site\
│   └── scripts\
├── work\
└── learning\
```

```powershell
New-Item -ItemType Directory -Path "C:\Projects\personal", "C:\Projects\work", "C:\Projects\learning"
```

---

## Крок 8: Docker (опціонально)

```powershell
winget install Docker.DockerDesktop
```

Після встановлення і запуску Docker Desktop: в WSL автоматично з'являться команди `docker` і `docker-compose`.

---

## Корисні налаштування для розробки

```powershell
# Показати розширення файлів
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" `
  -Name "HideFileExt" -Value 0

# Показати приховані файли
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" `
  -Name "Hidden" -Value 1

# Увімкнути Long Path Support (для npm і Python)
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
  -Name "LongPathsEnabled" -Value 1
```

---

## Резюме

За 20 хвилин: `winget` для основних програм → `wsl --install` для Linux → налаштуй Git → встанови VS Code розширення. Long Path Support обов'язково — npm і Python часто мають довгі шляхи.
