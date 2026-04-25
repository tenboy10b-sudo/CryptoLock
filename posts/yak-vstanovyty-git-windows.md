---
title: "Як встановити і налаштувати Git на Windows"
date: "2026-07-29"
publishDate: "2026-07-29"
description: "Встановлення Git на Windows, базова конфігурація, робота з GitHub через SSH і HTTPS, основні команди і налаштування VS Code для роботи з Git."
tags: ["windows", "інструменти", "налаштування", "cmd", "powershell"]
readTime: 6
---

Git — стандарт для версіонування коду. На Windows встановлюється просто, але є кілька налаштувань що зроблять роботу зручнішою.

---

## Встановлення Git

**Спосіб 1 — офіційний сайт:**
Зайди на **git-scm.com/download/win** → завантаж і запусти інсталятор.

Важливі налаштування при встановленні:
- **Default editor:** вибери VS Code або Notepad++ замість Vim
- **PATH environment:** вибери **"Git from the command line and also from 3rd-party software"**
- **Line endings:** **"Checkout Windows-style, commit Unix-style"** (рекомендовано)

**Спосіб 2 — winget:**
```powershell
winget install Git.Git
```

**Перевірити встановлення:**
```cmd
git --version
```

---

## Базова конфігурація

```cmd
rem Вказати ім'я і email (обов'язково перед першим commit)
git config --global user.name "Іван Петренко"
git config --global user.email "ivan@example.com"

rem Встановити редактор за замовчуванням
git config --global core.editor "code --wait"

rem Налаштувати перенос рядків для Windows
git config --global core.autocrlf true

rem Переглянути всі налаштування
git config --list
```

---

## Основні команди Git

```cmd
rem Ініціалізувати репозиторій
git init

rem Клонувати репозиторій
git clone https://github.com/user/repo.git

rem Статус змін
git status

rem Додати файли до commit
git add .          rem всі файли
git add file.txt   rem конкретний файл

rem Зробити commit
git commit -m "Опис змін"

rem Переглянути журнал
git log --oneline

rem Відправити на GitHub
git push origin main

rem Отримати зміни
git pull

rem Список гілок
git branch

rem Створити і переключитись на нову гілку
git checkout -b feature/new-feature

rem Злити гілку
git merge feature/new-feature
```

---

## Підключення до GitHub через SSH

SSH безпечніший за HTTPS — не потрібно вводити пароль кожного разу.

```powershell
# Згенерувати SSH ключ
ssh-keygen -t ed25519 -C "ivan@example.com"
# Натисни Enter для збереження в стандартне місце (~/.ssh/id_ed25519)

# Скопіювати публічний ключ в буфер
Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub" | Set-Clipboard

# Або відобразити для копіювання
cat "$env:USERPROFILE\.ssh\id_ed25519.pub"
```

Потім: **github.com** → Settings → SSH and GPG keys → **New SSH key** → вставни ключ.

Перевір підключення:
```cmd
ssh -T git@github.com
```

Відповідь: `Hi username! You've successfully authenticated` — все налаштовано.

---

## Клонувати через SSH замість HTTPS

```cmd
rem HTTPS (потрібен token)
git clone https://github.com/user/repo.git

rem SSH (після налаштування ключа)
git clone git@github.com:user/repo.git
```

---

## .gitignore — що не додавати в репозиторій

Створи файл `.gitignore` в корені проекту:

```
# Windows системні файли
Thumbs.db
desktop.ini

# Папка node_modules
node_modules/

# Файли середовища
.env
*.env.local

# Build папки
dist/
build/
*.pyc
__pycache__/

# IDE файли
.vscode/settings.json
.idea/
```

---

## Git в VS Code

VS Code має вбудовану інтеграцію з Git — Source Control панель (Ctrl+Shift+G):
- Бачиш змінені файли
- Робиш stage і commit без командного рядка
- Переглядаєш diff прямо в редакторі

Корисні розширення:
- **GitLens** — розширена інформація про кожен рядок коду
- **Git Graph** — візуальна гілкова схема

---

## Типові проблеми

### "git не розпізнається"

Перевстанови Git з опцією **"Git from the command line and also from 3rd-party software"** або перезапусти термінал.

### Push відхилено через конфлікт

```cmd
git pull --rebase origin main
rem Вирішити конфлікти у файлах
git add .
git rebase --continue
git push
```

### Відкотити останній commit

```cmd
rem Зберегти зміни але відмінити commit
git reset --soft HEAD~1

rem Повністю відмінити (зміни втрачаються)
git reset --hard HEAD~1
```

---

## Підсумок

Встановлення через winget: `winget install Git.Git`. Базова конфігурація: `git config --global user.name` і `user.email`. SSH ключ через `ssh-keygen` + додати в GitHub = зручна робота без паролів. VS Code + GitLens — найзручніший графічний інтерфейс для Git на Windows.
