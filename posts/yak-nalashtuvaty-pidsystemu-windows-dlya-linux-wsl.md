---
title: "WSL в Windows: запуск Linux команд без виходу з системи"
date: "2026-03-30"
publishDate: "2026-03-30"
description: "Практичне використання WSL в Windows: корисні команди, доступ до файлів Windows з Linux і навпаки, інтеграція з VS Code і типові проблеми."
tags: ["windows", "linux", "інструменти", "адміністрування"]
readTime: 4
---

WSL (Windows Subsystem for Linux) дозволяє запускати Linux команди прямо в Windows — без віртуальної машини і перезавантаження.

---

## Встановлення за одну команду

```powershell
wsl --install
```

Встановить Ubuntu за замовчуванням. Перезавантаж і при першому запуску задай ім'я користувача і пароль Linux.

---

## Корисні WSL команди

```powershell
# Список встановлених дистрибутивів
wsl --list --verbose

# Запустити конкретний дистрибутив
wsl -d Ubuntu-22.04

# Встановити дистрибутив за замовчуванням
wsl --set-default Ubuntu

# Зупинити всі дистрибутиви
wsl --shutdown

# Оновити ядро WSL
wsl --update
```

---

## Доступ до файлів

**З Linux до файлів Windows:**
```bash
cd /mnt/c/Users/Ім'я/Documents
ls /mnt/d/Projects
```

**З Windows до файлів Linux:**
Відкрий Провідник → в адресному рядку введи: `\\wsl$\Ubuntu`

Або з терміналу Linux:
```bash
explorer.exe .  # відкриє поточну папку в Провіднику
```

---

## Запустити Linux команду з PowerShell

```powershell
# Виконати команду в WSL без входу в Linux
wsl ls -la /home
wsl grep -r "error" /var/log/
wsl python3 script.py

# Конвертувати шлях Windows → Linux
wsl wslpath "C:\Users\Name\Documents"
```

---

## VS Code + WSL

Встанови розширення **WSL** у VS Code. Потім з терміналу Linux:

```bash
code .  # відкриє поточну папку в VS Code з WSL бекендом
```

Всі розширення, термінал і дебаггер працюють всередині Linux.

---

## Корисні Linux команди для Windows адмінів

```bash
# Пошук тексту в файлах (швидший ніж findstr)
grep -r "error" /mnt/c/Logs/

# Перейменувати файли за шаблоном
for f in /mnt/d/Photos/*.JPG; do mv "$f" "${f%.JPG}.jpg"; done

# Обробка CSV
awk -F',' '{print $1, $3}' /mnt/c/data.csv

# SSH підключення
ssh user@192.168.1.100

# Wget/curl завантаження
wget https://example.com/file.tar.gz
```

---

## Налаштування .wslconfig

Файл `C:\Users\Ім'я\.wslconfig` обмежує ресурси WSL:

```ini
[wsl2]
memory=4GB
processors=2
swap=2GB
```

Після зміни: `wsl --shutdown` → запусти WSL знову.

---

## Типові проблеми

**WSL не запускається після оновлення:**
```powershell
wsl --update
wsl --shutdown
```

**Повільна робота з файлами Windows (`/mnt/c/`):**
Зберігай проекти в Linux filesystem (`~/projects/`) — набагато швидше.

**Мережа не працює в WSL:**
```bash
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
```

---


---

## ⚡ Шукаєш потрібну команду?

**[→ PowerShell і CMD довідник](/tools/powershell-commands)** — 40+ команд з пошуком за задачею. Введи "мережа", "диск" або "безпека" і одразу отримай готову команду.



---

## 🌐 Розрахувати параметри підмережі?

**[→ IP/Subnet калькулятор](/tools/subnet-calculator)** — введи IP і CIDR, отримай маску, broadcast, діапазон хостів і бінарне представлення.


## Резюме

`wsl --install` → перезавантаж → готово. Доступ до Windows файлів через `/mnt/c/`. Зберігай проекти в `~/` для кращої швидкості. `code .` відкриє папку в VS Code з Linux бекендом.
