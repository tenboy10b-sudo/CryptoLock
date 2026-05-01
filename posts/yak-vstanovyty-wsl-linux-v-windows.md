---
title: "Як встановити Linux в Windows через WSL 2: покрокова інструкція"
date: "2026-05-27"
publishDate: "2026-05-27"
description: "Встановлення WSL 2 і Ubuntu в Windows 10 і 11 — повноцінний Linux без віртуальної машини. Основні команди, доступ до файлів Windows і типові задачі."
tags: ["windows", "інструменти", "cmd", "налаштування", "адміністрування"]
readTime: 7
---

WSL (Windows Subsystem for Linux) дозволяє запускати повноцінний Linux безпосередньо в Windows — без віртуальної машини і подвійного завантаження. Ідеально для розробників, адміністраторів і всіх хто хоче bash в Windows.

---

## Що таке WSL 2

WSL 2 — це реальне Linux-ядро що працює всередині легкої VM. На відміну від WSL 1 — підтримує весь системний виклик Linux, набагато швидший при роботі з файловою системою.

---

## Встановлення — один рядок

Відкрий **PowerShell від адміністратора** і виконай:

```powershell
wsl --install
```

Ця команда автоматично:
- Увімкне потрібні компоненти Windows
- Встановить WSL 2
- Встановить Ubuntu (остання LTS-версія)

Перезавантаж комп'ютер після завершення.

---

## Перший запуск Ubuntu

Після перезавантаження Ubuntu запуститься автоматично (або знайди її в меню Пуск).

1. Зачекай кілька хвилин поки розпакується
2. Введи ім'я користувача (маленькими літерами, без пробілів)
3. Введи пароль (не відображається при введенні — це нормально)

Готово — ти в bash Ubuntu.

---

## Встановити іншу версію Linux

```powershell
# Список доступних дистрибутивів
wsl --list --online

# Встановити конкретний
wsl --install -d Debian
wsl --install -d kali-linux
wsl --install -d Ubuntu-22.04

# Список встановлених
wsl --list --verbose
```

---

## Основні команди для початку

```bash
# Оновити пакети (робити після першого входу)
sudo apt update && sudo apt upgrade -y

# Встановити програму
sudo apt install git curl wget htop -y

# Переглянути версію Linux
uname -r
cat /etc/os-release

# Поточна директорія
pwd

# Список файлів
ls -la

# Перейти в домашню папку
cd ~
```

---

## Доступ до файлів Windows з Linux

Диски Windows доступні через `/mnt/`:

```bash
# Перейти на диск C
cd /mnt/c

# Перейти в папку Завантаження
cd /mnt/c/Users/ІМ'Я/Downloads

# Скопіювати файл з Windows в Linux
cp /mnt/c/Users/ІМ'Я/file.txt ~/file.txt
```

---

## Доступ до файлів Linux з Windows

В Провіднику Windows введи в адресному рядку:
```
\\wsl$
```

Або відразу для Ubuntu:
```
\\wsl$\Ubuntu
```

Побачиш файлову систему Linux як звичайну мережеву папку.

---

## Запустити Windows-програму з Linux

```bash
# Відкрити папку в Провіднику
explorer.exe .

# Відкрити файл у VS Code
code .

# Відкрити URL в браузері Windows
cmd.exe /c start https://google.com
```

---

## Налаштувати WSL для швидшої роботи

Створи файл `.wslconfig` в папці `C:\Users\ІМ'Я\`:

```ini
[wsl2]
# Максимум 4 ГБ RAM для WSL
memory=4GB

# Кількість процесорів
processors=4

# Вимкнути swap якщо не потрібен
swap=0
```

Перезапустити WSL:
```powershell
wsl --shutdown
wsl
```

---

## Корисні команди управління WSL

```powershell
# Зупинити WSL
wsl --shutdown

# Перезапустити конкретний дистрибутив
wsl --terminate Ubuntu

# Переглянути статус
wsl --status

# Оновити WSL ядро
wsl --update

# Встановити Ubuntu за замовчуванням
wsl --set-default Ubuntu

# Перетворити WSL 1 на WSL 2
wsl --set-version Ubuntu 2

# Видалити дистрибутив
wsl --unregister Ubuntu
```

---

## Типові задачі в WSL

**Python скрипти:**
```bash
sudo apt install python3 python3-pip -y
python3 script.py
```

**Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y
node --version
```

**SSH-підключення до серверів:**
```bash
ssh user@192.168.1.100
```

**Git:**
```bash
sudo apt install git -y
git clone https://github.com/user/repo.git
```

---

## Підсумок

WSL 2 — найпростіший спосіб отримати Linux у Windows без подвійного завантаження. `wsl --install` встановлює все автоматично за 5 хвилин. Файли Windows доступні через `/mnt/c/`, файли Linux через `\\wsl$\` у Провіднику.
