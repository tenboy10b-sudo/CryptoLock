---
title: "PuTTY на Windows: SSH підключення до серверів і налаштування терміналу"
date: "2026-06-15"
publishDate: "2027-06-01"
updated: "2026-06-15"
description: "Як встановити PuTTY і підключитись до Linux сервера по SSH з Windows. Налаштування ключів, збереження сесій, тунелювання портів і альтернативи PuTTY."
tags: ["windows", "putty", "ssh", "термінал", "адміністрування", "інструменти"]
readTime: 7
translatesEn: "putty-windows-ssh-guide"
---

PuTTY — класичний SSH клієнт для Windows. Підключись до Linux сервера, VPS або будь-якого пристрою з SSH прямо з Windows без додаткових налаштувань.

---

## Встановлення

```powershell
winget install PuTTY.PuTTY
```
Або з [putty.org](https://www.putty.org) → **Download PuTTY**.

**PuTTY включає:**
- `putty.exe` — SSH/Telnet клієнт
- `puttygen.exe` — генератор SSH ключів
- `pscp.exe` — SCP передача файлів (командний рядок)
- `plink.exe` — PuTTY з командного рядка

---

## Перше підключення

1. Запусти `putty.exe`
2. **Host Name:** IP або домен сервера
3. **Port:** 22 (SSH за замовчуванням)
4. **Connection type:** SSH
5. **"Open"**

При першому підключенні — підтвердити fingerprint → **"Accept"**

6. Введи **логін** і **пароль** у вікні терміналу

---

## Збереження сесій

Щоб не вводити IP кожного разу:

1. Заповни **Host Name**
2. В полі **"Saved Sessions"** введи назву (наприклад "My VPS")
3. Натисни **"Save"**
4. Наступного разу — двічі клікни на збереженій сесії

---

## SSH ключі замість пароля

### Крок 1 — Згенерувати ключ (PuTTYgen)

1. Відкрий `puttygen.exe`
2. **"Generate"** → рухай мишею для генерації
3. Збережи **"Save private key"** як `.ppk` файл
4. Скопіюй публічний ключ з поля вгорі

### Крок 2 — Додати ключ на сервер

```bash
# На сервері (Linux):
mkdir -p ~/.ssh
echo "ПУБЛІЧНИЙ_КЛЮЧ_СЮДИ" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### Крок 3 — Підключити ключ в PuTTY

```
PuTTY → Connection → SSH → Auth → Private key file: вибери .ppk
```

Збережи сесію — тепер підключення без пароля.

---

## Корисні налаштування PuTTY

### Шрифт і розмір вікна
```
Window → Appearance → Font → Consolas 12pt
Window → Rows/Columns → 120 x 40
```

### Кольорова схема (темна)
```
Window → Colours → Default Foreground: 204, 204, 204
Window → Colours → Default Background: 15, 15, 15
```

### Keepalive (не розривати з'єднання)
```
Connection → Seconds between keepalives: 60
```

### Зберегти виводи в лог файл
```
Session → Logging → Log all session output
Log file name: C:\logs\putty_%Y%M%D.log
```

---

## Тунелювання портів (Port Forwarding)

Перенаправлення локального порту через SSH — корисно для доступу до закритих сервісів:

```
Connection → SSH → Tunnels

L8080 127.0.0.1:80
```

Після підключення відкрий `http://localhost:8080` — трафік іде через SSH до сервера.

**Приклади:**
```
L3306 127.0.0.1:3306  # MySQL через SSH
L5432 127.0.0.1:5432  # PostgreSQL через SSH
L8888 127.0.0.1:8888  # Jupyter Notebook
```

---

## PuTTY з командного рядка (Plink)

```powershell
# Підключитись і виконати команду
plink user@server.com "df -h"

# З ключем
plink -i "C:\keys\mykey.ppk" user@server.com "uptime"

# Скрипт автоматичного backup через SSH
plink -i key.ppk user@server.com "tar -czf /backup/db.tar.gz /var/lib/mysql"
```

---

## Альтернативи PuTTY у 2026

| Клієнт | Переваги | Недоліки |
|--------|---------|---------|
| **Windows Terminal + OpenSSH** | Вбудований в Windows, вкладки | Немає GUI налаштувань |
| **MobaXterm** | Вкладки, SFTP, X11 | Платна Pro версія |
| **Termius** | Красивий UI, мобільний додаток | Freemium |
| **PuTTY** | Класика, надійний, безкоштовний | Старий інтерфейс |

**Вбудований OpenSSH в Windows 10/11:**
```powershell
# Перевірити чи встановлений
Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH.Client*'

# Встановити якщо немає
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0

# Підключитись без PuTTY
ssh user@server.com
```

---

## Часті питання

### "Connection refused" при підключенні
- Перевір IP і порт
- Переконайся що SSH сервіс запущений: `sudo systemctl status ssh`
- Перевір firewall на сервері

### "Host key has changed"
Сервер змінився або IP переназначений:
```
Registry → HKCU\Software\SimonTatham\PuTTY\SshHostKeys → видали запис для цього хоста
```

### Кирилиця відображається некоректно
```
Window → Translation → Remote character set: UTF-8
```

---

## Резюме

| Задача | Рішення |
|--------|---------|
| Базове підключення | PuTTY → IP:22 → Open |
| Зберегти сесію | Saved Sessions → Save |
| SSH ключ | PuTTYgen → генерувати → додати на сервер |
| Тунелювання | Connection → SSH → Tunnels |
| Без GUI | `ssh user@server` (вбудований OpenSSH) |
