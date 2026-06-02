---
title: "Як підключити мережевий диск в Windows 10 і 11 через PowerShell"
date: "2026-05-31"
publishDate: "2026-05-31"
description: "Підключення мережевих дисків в Windows через Провідник, PowerShell і групові політики. Збереження дисків після перезавантаження і виправлення помилок підключення."
tags: ["windows", "мережа", "диски", "адміністрування", "powershell"]
readTime: 4
translatesEn: "how-to-map-network-drives-windows"
---

Мережеві диски дозволяють звертатись до спільних папок як до локальних дисків.

---

## Підключити через Провідник

`Win + E` → **Цей ПК** → **Підключити мережевий диск**

- Буква диску (Z:, Y:...)
- Шлях: `\\server\share` або `\\192.168.1.100\share`
- Відмітити **Відновлювати при вході**

---

## Підключити через PowerShell

```powershell
# Поточні credentials
net use Z: \\Server\Share /persistent:yes

# З конкретними credentials
net use Z: \\Server\Share /user:Domain\Username Password /persistent:yes

# Зберегти credentials
cmdkey /add:Server /user:Domain\Username /pass:Password
```

---

## Список і видалення

```powershell
# Список підключених дисків
net use

# Через WMI
Get-WmiObject Win32_MappedLogicalDisk |
  Select-Object Name, ProviderName, @{n='Вільно ГБ';e={[math]::Round($_.FreeSpace/1GB,1)}}

# Видалити
net use Z: /delete

# Видалити всі
net use * /delete /yes
```

---

## Диски не відновлюються після перезавантаження

```powershell
# Через заплановане завдання при вході
$action = New-ScheduledTaskAction -Execute "net.exe" `
  -Argument "use Z: \\Server\Share /persistent:yes"
$trigger = New-ScheduledTaskTrigger -AtLogOn
Register-ScheduledTask -TaskName "MapNetworkDrive" `
  -Action $action -Trigger $trigger
```

---

## Виправити "Мережевий шлях не знайдено"

```powershell
# Перевірити підключення до сервера (порт SMB)
Test-NetConnection -ComputerName "Server" -Port 445

# Очистити кеш
Clear-DnsClientCache
```

---

## Часті питання

### Мережеві диски зникають після перезавантаження?

Два питання: credentials не збережені і `New-PSDrive` не зберігається. Використовуй `net use Z: \\Server\Share /persistent:yes` і зберігай credentials через `cmdkey`.

### Бачу сервер у Провіднику але не можу підключити диск?

Перевір порт 445: `Test-NetConnection Server -Port 445`. Також перевір права доступу на шарі і налаштування SMB.

---

## Резюме

`net use` для постійних дисків. `cmdkey` для збереження credentials. Заплановане завдання при вході для надійного відновлення. `Test-NetConnection -Port 445` для діагностики.
