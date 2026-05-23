---
title: "Підмережі Windows: як налаштувати IP і маску підмережі"
date: "2026-12-13"
publishDate: "2026-12-13"
description: "Як налаштувати статичну IP-адресу і маску підмережі в Windows. Що таке CIDR, як розрахувати підмережу і перевірити мережеве з'єднання."
tags: ["windows", "мережа", "налаштування", "адміністрування"]
translatesEn: "how-to-configure-static-ip-windows"
readTime: 5
---

Налаштування IP-адреси вручну потрібне при роботі в корпоративній мережі, налаштуванні сервера або коли DHCP не доступний. Ось як це зробити правильно.

---

## Що таке маска підмережі

Маска підмережі визначає яка частина IP-адреси — це мережа, а яка — хост.

| CIDR | Маска | Хостів | Типове використання |
|------|-------|--------|-------------------|
| /24 | 255.255.255.0 | 254 | Офісна мережа |
| /16 | 255.255.0.0 | 65534 | Велика організація |
| /30 | 255.255.255.252 | 2 | WAN з'єднання |

**192.168.1.0/24** означає: мережа `192.168.1.0`, хости від `.1` до `.254`, broadcast `.255`.

---

## Налаштувати статичну IP через Параметри

`Win + I` → **Мережа і Інтернет** → **Ethernet** → клікни на адаптер → **Редагувати** → вибери **Вручну** → увімкни IPv4:

- **IP-адреса:** 192.168.1.100
- **Маска підмережі:** 255.255.255.0 (або префікс: 24)
- **Шлюз:** 192.168.1.1
- **DNS:** 1.1.1.1 і 8.8.8.8

---

## Через PowerShell

```powershell
# Показати поточну конфігурацію
Get-NetIPAddress | Where-Object {$_.AddressFamily -eq 'IPv4' -and $_.PrefixOrigin -ne 'WellKnown'}

# Встановити статичну IP
New-NetIPAddress -InterfaceAlias "Ethernet" `
  -IPAddress "192.168.1.100" `
  -PrefixLength 24 `
  -DefaultGateway "192.168.1.1"

# Встановити DNS
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" `
  -ServerAddresses ("1.1.1.1", "8.8.8.8")

# Видалити статичну IP і повернути DHCP
Set-NetIPInterface -InterfaceAlias "Ethernet" -Dhcp Enabled
Remove-NetIPAddress -InterfaceAlias "Ethernet" -Confirm:$false
```

---

## Через CMD

```cmd
rem Встановити статичну IP
netsh interface ip set address "Ethernet" static 192.168.1.100 255.255.255.0 192.168.1.1

rem Встановити DNS
netsh interface ip set dns "Ethernet" static 1.1.1.1
netsh interface ip add dns "Ethernet" 8.8.8.8 index=2

rem Повернути DHCP
netsh interface ip set address "Ethernet" dhcp
```

---

## Перевірити мережеве з'єднання

```powershell
# Перевірити шлюз
Test-NetConnection -ComputerName 192.168.1.1

# Перевірити DNS
Resolve-DnsName google.com

# Трасування маршруту
tracert google.com
```

---

## Розрахувати параметри підмережі

Щоб дізнатись мережеву адресу, broadcast, кількість хостів і діапазон для будь-якого IP і маски:

**[→ IP/Subnet калькулятор](/tools/subnet-calculator)** — введи IP і CIDR, отримай всі параметри і бінарне представлення.

---

## Резюме

Статична IP: `Win + I` → Мережа → Ethernet → Вручну або PowerShell `New-NetIPAddress`. Стандартна маска для офісу: `/24` (255.255.255.0). Для розрахунку параметрів підмережі — [Subnet калькулятор](/tools/subnet-calculator).
