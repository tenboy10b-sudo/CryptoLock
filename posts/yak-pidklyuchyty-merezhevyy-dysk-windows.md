---
title: "Як підключити мережевий диск в Windows: всі способи"
date: "2025-11-04"
publishDate: "2025-11-04"
description: "Підключення мережевого диска в Windows 10 і 11 через Провідник, CMD і PowerShell. Автоматичне підключення при вході, доступ до NAS і корпоративних папок, керування через GPO."
tags: ["мережа", "windows", "налаштування", "адміністрування", "powershell"]
readTime: 6
translatesEn: "how-to-map-network-drives-windows"
---

Мережевий диск — це спільна папка на іншому ПК, сервері або NAS яка відображається як окремий диск (E:, Z: тощо) у Провіднику. Зручно для роботи з корпоративними файлами або домашнім сховищем.

---

## Спосіб 1: Через Провідник (найпростіший)

`Win + E` → **Цей комп'ютер** → вгорі вкладка **Комп'ютер** → **Підключити мережевий диск**

Або: клікни правою кнопкою на **Цей комп'ютер** → **Підключити мережевий диск**

У вікні:
1. **Диск** — вибери букву (Z:, Y:, або будь-яку вільну)
2. **Папка** — введи шлях:
   - `\\192.168.1.100\SharedFolder` — за IP-адресою
   - `\\server-name\SharedFolder` — за іменем сервера
   - `\\NAS-device\backup` — для NAS пристроїв
3. Постав галочку **Відновлювати підключення при вході** якщо потрібно постійно
4. **Використовувати інші облікові дані** — якщо потрібен інший логін/пароль
5. Натисни **Готово**

---

## Спосіб 2: Через CMD

```cmd
rem Підключити диск Z: до спільної папки
net use Z: \\192.168.1.100\SharedFolder

rem З логіном і паролем
net use Z: \\server\share /user:domain\username password

rem Постійне підключення (відновлюється при перезавантаженні)
net use Z: \\server\share /persistent:yes

rem Переглянути підключені мережеві диски
net use

rem Від'єднати диск
net use Z: /delete

rem Від'єднати всі мережеві диски
net use * /delete /yes
```

---

## Спосіб 3: Через PowerShell

```powershell
# Підключити диск
New-PSDrive -Name "Z" -PSProvider FileSystem `
  -Root "\\192.168.1.100\SharedFolder" -Persist

# З обліковими даними
$cred = Get-Credential
New-PSDrive -Name "Z" -PSProvider FileSystem `
  -Root "\\server\share" -Credential $cred -Persist

# Або net use з конкретними credentials
net use Z: \\Server\Share /user:Domain\Username Password /persistent:yes

# Зберегти credentials окремо (щоб не вводити щоразу)
cmdkey /add:Server /user:Domain\Username /pass:Password

# Переглянути підключені диски
Get-PSDrive -PSProvider FileSystem

# Або через WMI — разом з вільним місцем
Get-WmiObject Win32_MappedLogicalDisk |
  Select-Object Name, ProviderName, @{n='Вільно ГБ';e={[math]::Round($_.FreeSpace/1GB,1)}}

# Від'єднати
Remove-PSDrive -Name "Z"
# або
net use Z: /delete
```

---

## Автоматичне підключення при вході (скрипт)

Якщо диск відключається після перезавантаження:

Створи файл `connect-drives.bat`:

```bat
@echo off
net use Z: \\server\share /persistent:yes
net use Y: \\nas\backup /persistent:yes
```

Додай в автозапуск:

```cmd
rem Скопіювати в папку автозапуску
copy connect-drives.bat "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\"
```

Або через заплановане завдання при вході (надійніше за просту папку автозапуску, бо не залежить від затримки завантаження Провідника):

```powershell
$action = New-ScheduledTaskAction -Execute "net.exe" `
  -Argument "use Z: \\Server\Share /persistent:yes"
$trigger = New-ScheduledTaskTrigger -AtLogOn
Register-ScheduledTask -TaskName "MapNetworkDrive" `
  -Action $action -Trigger $trigger
```

---

## Через групову політику (для домену)

Для автоматичного підключення дисків всім користувачам домену:

`gpmc.msc` → потрібний GPO → **User Configuration** → **Preferences** → **Windows Settings** → **Drive Maps** → правою кнопкою → **New** → **Mapped Drive**:

- **Action:** Create
- **Location:** `\\server\share`
- **Drive Letter:** Z
- **Reconnect:** так
- **Label:** назва диска

---

## Типові проблеми

### "Мережевий шлях не знайдено"

```cmd
rem Перевірити чи доступний сервер
ping 192.168.1.100

rem Перевірити чи відкриті потрібні порти
Test-NetConnection 192.168.1.100 -Port 445
```

Порт 445 (SMB) має бути відкритий. Також перевір:
- Брандмауер на сервері — [Налаштування брандмауера](/brandmauer-windows-cherez-gpo)
- Спільний доступ до папки увімкнено на сервері
- Кеш DNS — якщо сервер нещодавно змінив IP: `Clear-DnsClientCache`

### "Немає дозволу на доступ"

Перевір права доступу до папки на сервері: правою кнопкою на папку → **Властивості** → **Спільний доступ** → **Дозволи**.

Також: **Безпека** → переконайся що користувач або група має права на читання/запис.

### Диск відключається після сну

Дві різні причини — і два різні фікси, залежно де налаштовано автовідключення:

```cmd
rem На сервері: вимкнути відключення мережевих дисків при простої
net config server /autodisconnect:-1
```

```powershell
# На клієнті: вимкнути автовідключення мережевих дисків (KeepConn у секундах)
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\lanmanworkstation\parameters" `
  -Name "KeepConn" -Value 3600 -Type DWord
```

### Помилка "Не вдається отримати доступ, облікові дані не узгоджуються"

Видали збережені облікові дані:

`Панель керування` → **Диспетчер облікових даних** → **Облікові дані Windows** → видали записи для проблемного сервера → підключи знову.

---

## Підсумок

Для разового підключення — Провідник (спосіб 1). Для скриптів і автоматизації — `net use`, `cmdkey` для збереження credentials, або PowerShell (`New-PSDrive`). Для надійного відновлення при вході — заплановане завдання замість папки автозапуску. Для корпоративного розгортання на всі ПК — GPO Drive Maps. Порт 445 має бути відкритий, права доступу налаштовані на сервері, `KeepConn`/`autodisconnect` — якщо диск зникає під час сну чи простою.

---

## 🌐 Розрахувати параметри підмережі?

**[→ IP/Subnet калькулятор](/tools/subnet-calculator)** — введи IP і CIDR, отримай маску, broadcast, діапазон хостів і бінарне представлення.

