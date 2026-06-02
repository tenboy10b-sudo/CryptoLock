---
title: "Налаштування IP маршрутизації в Windows: статичні маршрути і роутер"
date: "2026-07-03"
publishDate: "2026-07-03"
description: "Увімкнення IP маршрутизації в Windows для пересилання пакетів між мережевими інтерфейсами. Статичні маршрути, Windows як програмний роутер і діагностика."
tags: ["windows", "мережа", "маршрутизація", "ip", "адміністрування", "powershell"]
readTime: 4
translatesEn: "how-to-configure-windows-ip-routing"
---

Windows може пересилати пакети між мережевими інтерфейсами — корисно для лабораторних середовищ і VM.

---

## Увімкнути IP маршрутизацію

```powershell
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" `
  -Name "IPEnableRouter" -Value 1 -Type DWord

# Перезавантажитись для застосування
Restart-Computer
```

---

## Переглянути таблицю маршрутів

```powershell
route print

# PowerShell
Get-NetRoute -AddressFamily IPv4 | Where-Object {$_.NextHop -ne "0.0.0.0"} |
  Select-Object DestinationPrefix, NextHop, RouteMetric, InterfaceAlias
```

---

## Додати статичні маршрути

```powershell
# Постійний маршрут
New-NetRoute -DestinationPrefix "192.168.10.0/24" `
  -NextHop "192.168.1.1" -InterfaceAlias "Ethernet"

# Через команду route (з -p для постійності)
route add 192.168.10.0 mask 255.255.255.0 192.168.1.1 -p
```

---

## Видалити маршрут

```powershell
Remove-NetRoute -DestinationPrefix "192.168.10.0/24" -Confirm:$false
route delete 192.168.10.0
```

---

## Діагностика маршрутизації

```powershell
tracert 192.168.10.5
Test-NetConnection -ComputerName "192.168.10.5" -TraceRoute

# Чи увімкнена маршрутизація
(Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters").IPEnableRouter
```

---

## Часті питання

### Статичні маршрути зникають після перезавантаження?

Маршрути без `-p` (route команда) або без PersistentStore — тільки для сесії. Використовуй `route add ... -p` або PowerShell `New-NetRoute` (зберігається за замовчуванням).

### Windows може замінити апаратний роутер?

Для базової маршрутизації — так. Для 50+ користувачів з NAT, DHCP і VPN — виділений роутер або pfSense надійніший.

---

## Резюме

`IPEnableRouter = 1` + перезавантаження. `Get-NetRoute` для перегляду. `New-NetRoute` або `route add -p` для постійних маршрутів. `tracert` і `Test-NetConnection` для діагностики.
