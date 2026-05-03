---
title: "WSL: як встановити Linux в Windows і почати роботу"
date: "2026-05-18"
publishDate: "2026-05-18"
description: "Windows Subsystem for Linux дозволяє запускати Linux прямо в Windows без віртуальної машини. Як встановити WSL 2, вибрати дистрибутив і налаштувати термінал."
tags: ["windows", "linux", "інструменти", "адміністрування"]
readTime: 5
---

WSL (Windows Subsystem for Linux) дозволяє запускати повноцінний Linux термінал прямо в Windows — без подвійного завантаження і без накладних витрат віртуальної машини.

---

## Встановлення WSL 2

Відкрий PowerShell від адміністратора:

```powershell
wsl --install
```

Ця одна команда:
- Вмикає необхідні компоненти Windows
- Встановлює WSL 2
- Завантажує і встановлює Ubuntu за замовчуванням

Перезавантаж ПК. При першому запуску Ubuntu попросить створити ім'я користувача і пароль Linux.

---

## Вибір дистрибутива

```powershell
# Переглянути доступні дистрибутиви
wsl --list --online

# Встановити конкретний
wsl --install -d Debian
wsl --install -d kali-linux
wsl --install -d Ubuntu-22.04
```

Популярні варіанти: **Ubuntu** (найбільша спільнота), **Debian** (стабільніший), **Kali** (для безпеки і пентестингу).

---

## Основні команди WSL

```powershell
# Список встановлених дистрибутивів
wsl --list --verbose

# Запустити конкретний дистрибутив
wsl -d Ubuntu

# Зупинити всі дистрибутиви
wsl --shutdown

# Оновити WSL
wsl --update

# Встановити дистрибутив за замовчуванням
wsl --set-default Ubuntu
```

---

## Доступ до файлів

**З Linux до файлів Windows:**
```bash
cd /mnt/c/Users/YourName/Documents
```

**З Windows до файлів Linux:**
В Провіднику файлів відкрий адресний рядок і введи:
```
\\wsl$\Ubuntu\home\yourusername
```

Або просто введи `explorer.exe .` в терміналі Linux — відкриє поточну папку в Провіднику.

---

## Встановлення Windows Terminal

Windows Terminal — найкращий спосіб працювати з WSL. Встанови з Microsoft Store або:

```powershell
winget install Microsoft.WindowsTerminal
```

В Terminal автоматично з'являться вкладки для PowerShell, CMD і кожного WSL дистрибутива.

---

## Запуск Linux програм з Windows

```powershell
# Запустити команду Linux з PowerShell
wsl ls -la /home

# Запустити скрипт
wsl bash ~/scripts/deploy.sh

# Відкрити файл Windows в Linux редакторі
wsl nano /mnt/c/Users/YourName/file.txt
```

---

## Типові проблеми

**"WSL 2 requires an update to its kernel component":**
```powershell
wsl --update
```

**Повільна робота з файлами Windows (через /mnt/c):**
Зберігай файли що потребують швидкого доступу в файловій системі Linux (`~/`) а не в `/mnt/c/`. Швидкість роботи з нативною ФС Linux значно вища.

**Порт вже зайнятий:**
WSL 2 використовує NAT — порти прокидаються автоматично, але іноді конфліктують з Windows службами. Перевір: `netstat -ano | findstr :3000`.

---

## Резюме

`wsl --install` → перезавантаж → готово. WSL 2 підходить для веб-розробки, роботи з Docker, запуску bash скриптів і будь-яких інструментів що є тільки для Linux. Файли зберігай в Linux ФС (`~/`) для максимальної продуктивності.
