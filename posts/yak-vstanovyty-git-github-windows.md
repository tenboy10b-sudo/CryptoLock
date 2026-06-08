---
title: "Git і GitHub на Windows: встановлення, налаштування і основні команди"
date: "2026-06-08"
publishDate: "2026-08-14"
updated: "2026-06-08"
description: "Як встановити Git на Windows 10 і 11, налаштувати ім'я і email, підключити GitHub через SSH або HTTPS. Основні команди Git для початківців і не тільки."
tags: ["windows", "git", "github", "інструменти", "розробка"]
readTime: 8
translatesEn: "how-to-install-git-github-windows"
---

Git — система контролю версій яка використовується всіма розробниками. GitHub — найпопулярніший хостинг для Git репозиторіїв. Ось як налаштувати все з нуля на Windows.

---

## Встановлення Git

### Спосіб 1 — Офіційний інсталятор (рекомендую)

1. Завантаж з [git-scm.com/download/win](https://git-scm.com/download/win)
2. Запусти інсталятор
3. На кроці **"Choosing the default editor"** — вибери VS Code або Notepad++
4. На кроці **"Adjusting PATH environment"** — залиш **"Git from the command line and also from 3rd-party software"**
5. Решту налаштувань — залишай за замовчуванням

### Спосіб 2 — через winget

```powershell
# Встановити Git через Windows Package Manager
winget install Git.Git

# Або через Chocolatey
choco install git
```

### Перевірити встановлення

```cmd
git --version
# git version 2.45.2.windows.1
```

---

## Базове налаштування Git

Після встановлення обов'язково налаштуй ім'я і email — вони будуть в кожному коміті:

```bash
# Ім'я і email (замін на свої дані)
git config --global user.name "Твоє Ім'я"
git config --global user.email "твій@email.com"

# Редактор за замовчуванням (VS Code)
git config --global core.editor "code --wait"

# Гілка за замовчуванням (main замість master)
git config --global init.defaultBranch main

# Перевірити всі налаштування
git config --list
```

---

## Підключення до GitHub

### Варіант 1 — HTTPS (простіше для початківців)

```bash
# Клонування репозиторію
git clone https://github.com/username/repo.git

# При першому push Windows запитає логін і пароль
# Використовуй Personal Access Token замість пароля
```

**Створення Personal Access Token:**
GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token → вибери `repo` → Generate

### Варіант 2 — SSH (зручніше для постійної роботи)

```bash
# Генерація SSH ключа
ssh-keygen -t ed25519 -C "твій@email.com"
# Натисни Enter для всіх запитань (або вкажи пароль)

# Скопіювати публічний ключ
cat ~/.ssh/id_ed25519.pub
# Або через PowerShell:
Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub" | Set-Clipboard
```

**Додати ключ на GitHub:**
GitHub → Settings → SSH and GPG keys → New SSH key → вставити ключ

**Перевірити підключення:**
```bash
ssh -T git@github.com
# Hi username! You've successfully authenticated
```

---

## Основні команди Git

### Ініціалізація і базова робота

```bash
# Ініціалізувати новий репозиторій
git init

# Переглянути статус файлів
git status

# Додати файли до індексу (staging)
git add файл.txt          # конкретний файл
git add .                 # всі змінені файли

# Зробити коміт
git commit -m "Опис змін"

# Переглянути історію комітів
git log --oneline
```

### Робота з GitHub

```bash
# Додати віддалений репозиторій
git remote add origin https://github.com/username/repo.git

# Відправити зміни на GitHub
git push origin main

# Завантажити зміни з GitHub
git pull origin main

# Клонувати репозиторій
git clone https://github.com/username/repo.git
```

### Гілки (branches)

```bash
# Переглянути гілки
git branch

# Створити нову гілку
git branch нова-гілка

# Перейти на гілку
git checkout нова-гілка

# Створити і одразу перейти
git checkout -b нова-гілка

# Злити гілку в main
git checkout main
git merge нова-гілка

# Видалити гілку
git branch -d нова-гілка
```

---

## Git в VS Code

Visual Studio Code має вбудовану підтримку Git — не потрібно пам'ятати команди:

1. Відкрий папку проекту в VS Code
2. Лівий sidebar → іконка Source Control (Ctrl+Shift+G)
3. Зміни відображаються автоматично
4. Натисни **+** біля файлу → `git add`
5. Введи повідомлення → Ctrl+Enter → `git commit`
6. **"..."** → Push → `git push`

---

## GitHub Desktop (графічний клієнт)

Для тих хто не любить термінал:

1. Завантаж з [desktop.github.com](https://desktop.github.com)
2. Увійди в акаунт GitHub
3. File → Clone repository → вибери репозиторій
4. Всі операції через графічний інтерфейс

---

## .gitignore — що не заливати на GitHub

Файл `.gitignore` вказує які файли Git має ігнорувати:

```bash
# Приклад .gitignore для Windows проекту
# Системні файли Windows
Thumbs.db
Desktop.ini
*.lnk

# Папки з залежностями
node_modules/
.env
*.log

# VS Code
.vscode/
*.vsix
```

**Генератор .gitignore:** [gitignore.io](https://gitignore.io) — вводиш технологію, отримуєш готовий файл.

---

## Часті питання

### Git просить пароль при кожному push
Налаштуй credential manager:
```bash
git config --global credential.helper manager-core
```

### Як відмінити останній коміт
```bash
# Зберегти зміни але скасувати коміт
git reset --soft HEAD~1

# Повністю видалити останній коміт і зміни
git reset --hard HEAD~1
```

### Помилка "LF will be replaced by CRLF"
```bash
git config --global core.autocrlf true
```

### Як оновити Git
```bash
# Через winget
winget upgrade Git.Git

# Або завантаж новий інсталятор з git-scm.com
```

---

## Резюме

| Завдання | Команда |
|---------|---------|
| Налаштувати ім'я | `git config --global user.name "Ім'я"` |
| Підключити GitHub (SSH) | `ssh-keygen` + додати ключ на GitHub |
| Почати проект | `git init` → `git add .` → `git commit` |
| Завантажити на GitHub | `git push origin main` |
| Отримати зміни | `git pull origin main` |
| Нова гілка | `git checkout -b назва-гілки` |
