---
title: "Як встановити WSL 2 і запустити Linux в Windows"
date: "2026-04-23"
publishDate: "2026-04-23"
description: "Встановлення Windows Subsystem for Linux 2 в Windows 10 і 11: покрокова інструкція, вибір дистрибутива Ubuntu і базове налаштування після установки."
tags: ["windows", "налаштування", "інструменти", "cmd"]
readTime: 5
---

WSL 2 (Windows Subsystem for Linux) дозволяє запускати повноцінне Linux середовище прямо в Windows — без віртуальних машин і подвійного завантаження.

---

## Встановлення одною командою (Windows 11 і 10 2004+)

Відкрий **PowerShell від адміністратора**:

```powershell
wsl --install
```

Ця команда автоматично:
- Увімкне компоненти WSL і Virtual Machine Platform
- Завантажить і встановить Ubuntu (за замовчуванням)
- Перезавантажить ПК

Після перезавантаження — відкриється Ubuntu і попросить створити логін і пароль.

---

## Встановити інший дистрибутив

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

## Перевірити версію WSL

```powershell
wsl --version

# Перевести на WSL 2 якщо використовується WSL 1
wsl --set-default-version 2
wsl --set-version Ubuntu 2
```

---

## Запуск Linux

```cmd
wsl                    # запустити дистрибутив за замовчуванням
wsl -d Ubuntu-22.04    # конкретний дистрибутив
ubuntu                 # якщо встановлений Ubuntu
```

Або через **Windows Terminal** — в меню нова вкладка → Ubuntu.

---

## Базові команди після встановлення Ubuntu

```bash
# Оновити пакети
sudo apt update && sudo apt upgrade -y

# Встановити корисні інструменти
sudo apt install -y curl wget git unzip build-essential

# Переглянути версію
lsb_release -a
```

---

## Доступ до файлів Windows з Linux

```bash
# Диск C доступний як
ls /mnt/c/Users

# Перейти в папку Windows
cd /mnt/c/Users/UserName/Documents
```

---

## Доступ до файлів Linux з Windows

В Провіднику: адресний рядок → `\\wsl$\Ubuntu\home\username`

Або закріпи як мережевий диск.

---

## Вимкнути WSL

```powershell
# Зупинити всі запущені дистрибутиви
wsl --shutdown

# Видалити дистрибутив
wsl --unregister Ubuntu
```

---

## Підсумок

`wsl --install` → перезавантаж → задай логін. Файли Windows доступні через `/mnt/c/`. Для розробки: [Windows для розробника: WSL2, Terminal і VS Code](/yak-nalashtuvanty-windows-developer)
