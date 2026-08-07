---
title: "WSL 2 на Windows 10 і 11: встановлення Linux і налаштування середовища розробника"
date: "2026-06-18"
publishDate: "2027-06-01"
updated: "2026-06-18"
description: "Як встановити WSL 2 і Linux на Windows 10 і 11. Налаштування Ubuntu, доступ до файлів Windows з Linux, інтеграція з VS Code і Docker, оптимізація продуктивності."
tags: ["windows", "wsl", "linux", "розробка", "ubuntu", "інструменти"]
readTime: 9
translatesEn: "wsl2-windows-linux-setup-guide"
---

WSL 2 (Windows Subsystem for Linux) дозволяє запускати справжній Linux прямо в Windows — без дуальної завантаження і без повноцінної віртуальної машини. Для розробників це game-changer.

---

## WSL 1 vs WSL 2

| | WSL 1 | WSL 2 |
|-|-------|-------|
| Ядро Linux | Емуляція | Справжнє ядро |
| Швидкість файлів Linux | Висока | Нижча для Windows файлів |
| Швидкість файлів в Linux | Середня | Дуже висока |
| Docker | Обмежено | ✅ Повна підтримка |
| Сумісність з Linux | Часткова | Повна |

**WSL 2 рекомендований** для більшості завдань, особливо розробки.

---

## Встановлення WSL 2

### Один рядок (Windows 10 2004+ і Windows 11)

```powershell
# Від адміністратора — встановлює WSL 2 + Ubuntu за замовчуванням
wsl --install
```

Перезавантаж → Ubuntu запуститься і попросить створити користувача.

### Вибрати іншу дистрибуцію

```powershell
# Переглянути доступні
wsl --list --online

# Встановити конкретну
wsl --install -d Debian
wsl --install -d kali-linux
wsl --install -d Ubuntu-24.04
```

### Оновити WSL

```powershell
wsl --update
wsl --version
```

---

## Перше налаштування Ubuntu

Після першого запуску:

```bash
# Оновити пакети
sudo apt update && sudo apt upgrade -y

# Встановити базові інструменти розробника
sudo apt install -y \
    git curl wget \
    build-essential \
    python3 python3-pip \
    nodejs npm \
    unzip zip

# Налаштувати git
git config --global user.name "Твоє Ім'я"
git config --global user.email "твій@email.com"
```

---

## Доступ до файлів

### З Linux до файлів Windows

```bash
# Диск C: доступний за шляхом
ls /mnt/c/Users/

# Відкрити папку Windows з Linux
cd /mnt/c/Users/YourName/Documents

# Скопіювати файл
cp /mnt/c/Downloads/file.txt ~/
```

### З Windows до файлів Linux

В Провіднику Windows:
```
\\wsl$\Ubuntu\home\username\
```

Або натисни `Win + R` → `\\wsl$`

### Відкрити поточну папку Linux в Провіднику

```bash
explorer.exe .
```

---

## Інтеграція з VS Code

VS Code має вбудовану підтримку WSL:

1. Встанови розширення **Remote - WSL** в VS Code
2. В терміналі WSL:
```bash
# Відкрити поточну папку в VS Code
code .
```

VS Code відкривається з Linux бекендом — всі розширення, термінал і файли — в Linux.

---

## Docker в WSL 2

**Docker Desktop** інтегрується з WSL 2:

1. Встанови [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Docker Desktop → Settings → Resources → WSL Integration → увімкни для Ubuntu
3. В терміналі WSL:

```bash
# Docker доступний прямо в Linux
docker --version
docker run hello-world

# Docker Compose
docker compose up -d
```

---

## Налаштування продуктивності

### Обмежити використання RAM

WSL 2 може споживати багато пам'яті. Обмеж через конфіг:

```ini
# C:\Users\YourName\.wslconfig
[wsl2]
memory=4GB
processors=4
swap=2GB
```

```powershell
# Застосувати зміни
wsl --shutdown
# Перезапусти WSL
wsl
```

### Прискорити файлові операції

Зберігай проекти в Linux файловій системі (не в /mnt/c/):

```bash
# ✅ Швидко — в Linux
~/projects/myapp

# ❌ Повільно — в Windows через /mnt
/mnt/c/Users/user/projects/myapp
```

---

## Корисні команди WSL

```powershell
# Список встановлених дистрибуцій
wsl --list --verbose

# Зупинити WSL
wsl --shutdown

# Перезапустити конкретну дистрибуцію
wsl --terminate Ubuntu

# Встановити дистрибуцію за замовчуванням
wsl --set-default Ubuntu-24.04

# Зайти в конкретну дистрибуцію
wsl -d Debian

# Виконати команду Linux з PowerShell
wsl ls -la /home
```

---

## Налаштування zsh і Oh My Zsh

```bash
# Встановити zsh
sudo apt install -y zsh

# Встановити Oh My Zsh
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# Встановити плагіни
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

---

## Часті питання

### WSL дуже повільний
Переконайся що проект в Linux файловій системі (`~/`) а не в `/mnt/c/`.

### Як виходити з Linux в Windows
```bash
exit
```

### Можна запускати Linux GUI додатки?
Так — WSLg (вбудований в Windows 11) підтримує X11 додатки:
```bash
sudo apt install -y gedit
gedit &
```

---

## Резюме

| Крок | Команда |
|------|---------|
| Встановити WSL + Ubuntu | `wsl --install` |
| Оновити пакети | `sudo apt update && upgrade` |
| Відкрити в VS Code | `code .` (з папки в Linux) |
| Обмежити RAM | `.wslconfig` → memory=4GB |
| Зупинити WSL | `wsl --shutdown` |
| Файли Windows | `/mnt/c/Users/...` |
