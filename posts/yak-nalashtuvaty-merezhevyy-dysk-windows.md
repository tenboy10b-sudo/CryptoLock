---
title: "Мережевий диск в Windows: підключення і налаштування"
date: "2026-08-30"
publishDate: "2026-08-30"
description: "Як підключити мережеву папку як диск в Windows — через Провідник, CMD і PowerShell. Автоматичне підключення при вході і вирішення типових проблем."
tags: ["windows", "мережа", "налаштування", "адміністрування"]
readTime: 4
---

Мережевий диск дозволяє відкривати папку на іншому ПК або NAS як звичайний локальний диск з буквою (Z:, Y: тощо).

---

## Підключити через Провідник

Відкрий Провідник → **Цей ПК** → на верхній панелі або в меню → **Підключити мережевий диск**:

1. Вибери букву диска (наприклад Z:)
2. Введи шлях до папки: `\\192.168.1.100\SharedFolder` або `\\ПК-ІМ'Я\Папка`
3. Постав галочку **Відновлювати при вході** — підключатиметься автоматично
4. Якщо потрібні інші дані для входу — **Підключитись з іншими обліковими даними**
5. **Готово**

---

## Через CMD

```cmd
rem Підключити диск
net use Z: \\192.168.1.100\SharedFolder /persistent:yes

rem З іменем і паролем
net use Z: \\192.168.1.100\SharedFolder /user:username password /persistent:yes

rem Відключити
net use Z: /delete

rem Переглянути підключені диски
net use
```

---

## Через PowerShell

```powershell
# Підключити диск
New-PSDrive -Name "Z" -PSProvider FileSystem `
  -Root "\\192.168.1.100\SharedFolder" -Persist

# З обліковими даними
$cred = Get-Credential
New-PSDrive -Name "Z" -PSProvider FileSystem `
  -Root "\\192.168.1.100\SharedFolder" `
  -Credential $cred -Persist

# Відключити
Remove-PSDrive -Name "Z"

# Переглянути
Get-PSDrive -PSProvider FileSystem
```

---

## Автоматичне підключення при вході

Якщо диск відключається після перезавантаження незважаючи на `/persistent:yes`:

```powershell
# Додати скрипт підключення в автозавантаження
$script = 'net use Z: \\192.168.1.100\SharedFolder /persistent:yes'
$scriptPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\map-drive.cmd"
$script | Out-File $scriptPath -Encoding ASCII
```

Або через Task Scheduler з тригером **При вході**.

---

## Типові проблеми

**"Мережевий шлях не знайдено":**
```powershell
# Перевірити підключення до хоста
Test-NetConnection -ComputerName 192.168.1.100 -Port 445
```
Порт 445 — SMB. Якщо закритий — брандмауер блокує.

**"Доступ заборонено":**
- Перевір ім'я і пароль
- На сервері перевір дозволи SMB і NTFS

**Диск зникає після сну:**
```powershell
# Вимкнути автовідключення мережевих дисків
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\lanmanworkstation\parameters" `
  -Name "KeepConn" -Value 3600 -Type DWord
```

---


---

## 🌐 Розрахувати параметри підмережі?

**[→ IP/Subnet калькулятор](/tools/subnet-calculator)** — введи IP і CIDR, отримай маску, broadcast, діапазон хостів і бінарне представлення.


## Резюме

Провідник → Цей ПК → Підключити мережевий диск → введи `\\IP\Папка` → увімкни **Відновлювати при вході**. Для скриптів: `net use Z: \\IP\Папка /persistent:yes`. Якщо диск зникає — перевір брандмауер на сервері і KeepConn в реєстрі.
