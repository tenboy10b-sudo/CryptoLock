---
title: "Маршрутизація IP в Windows: netsh, route і налаштування шлюзів"
date: "2026-09-20"
publishDate: "2026-09-20"
description: "Управління таблицею маршрутизації Windows: команди route і netsh для додавання статичних маршрутів, налаштування множинних шлюзів і розв'язання конфліктів."
tags: ["мережа", "windows", "cmd", "адміністрування", "powershell"]
readTime: 6
---

Коли ПК підключений до кількох мереж або потрібно перенаправити трафік через конкретний шлюз — маршрутизація вирішує це без VPN.

---

## Переглянути таблицю маршрутизації

```cmd
route print

rem Або тільки IPv4
route print -4
```

Основні колонки:
- **Network Destination** — підмережа або хост призначення
- **Netmask** — маска
- **Gateway** — через який шлюз надсилати
- **Interface** — через який мережевий адаптер
- **Metric** — пріоритет маршруту (нижче = пріоритетніше)

---

## Додати статичний маршрут

```cmd
rem Постійний маршрут (зберігається після перезавантаження)
route add 192.168.2.0 mask 255.255.255.0 192.168.1.1 -p

rem Тимчасовий маршрут (до перезавантаження)
route add 192.168.2.0 mask 255.255.255.0 192.168.1.1

rem Маршрут для конкретного хоста
route add 10.10.10.5 mask 255.255.255.255 192.168.1.1 -p

rem З вказанням інтерфейсу (якщо кілька адаптерів)
route add 192.168.3.0 mask 255.255.255.0 192.168.1.1 if 15
```

---

## Видалити маршрут

```cmd
rem Видалити конкретний маршрут
route delete 192.168.2.0

rem Видалити всі маршрути для підмережі
route delete 192.168.2.0 mask 255.255.255.0
```

---

## Змінити маршрут

```cmd
rem Змінити метрику або шлюз
route change 192.168.2.0 mask 255.255.255.0 192.168.1.254
```

---

## PowerShell — сучасний підхід

```powershell
# Переглянути маршрути
Get-NetRoute | Select-Object DestinationPrefix, NextHop, InterfaceAlias, RouteMetric |
  Sort-Object RouteMetric | Format-Table -AutoSize

# Додати маршрут
New-NetRoute `
  -DestinationPrefix "192.168.2.0/24" `
  -NextHop "192.168.1.1" `
  -InterfaceAlias "Ethernet" `
  -RouteMetric 10

# Видалити
Remove-NetRoute -DestinationPrefix "192.168.2.0/24" -Confirm:$false
```

---

## Практичні сценарії

### ПК підключений до двох мереж

```cmd
rem Основний інтернет через адаптер 1 (192.168.1.x)
rem Корпоративна мережа через адаптер 2 (10.0.0.x)

rem Корпоративні ресурси — через другий адаптер
route add 10.0.0.0 mask 255.0.0.0 10.0.0.1 -p

rem Весь інший трафік — через основний шлюз (вже в таблиці)
```

### Трафік до конкретного сервера через VPN

```cmd
rem Після підключення VPN направити трафік до сервера через VPN
route add 203.0.113.10 mask 255.255.255.255 10.8.0.1 -p
```

### Заблокувати IP діапазон (null route)

```cmd
rem Направити трафік в нікуди (null route)
route add 185.220.0.0 mask 255.255.0.0 127.0.0.1 -p
```

---

## Метрика і конфлікти шлюзів

Якщо є кілька адаптерів з різними шлюзами — Windows може неправильно вибирати маршрут.

```powershell
# Переглянути метрики всіх адаптерів
Get-NetIPInterface | Select-Object InterfaceAlias, InterfaceMetric |
  Sort-Object InterfaceMetric

# Встановити метрику вручну (нижча = пріоритетніша)
Set-NetIPInterface -InterfaceAlias "Ethernet" -InterfaceMetric 10
Set-NetIPInterface -InterfaceAlias "Wi-Fi" -InterfaceMetric 50
```

---

## Підсумок

`route print` — переглянути. `route add мережа mask маска шлюз -p` — додати постійний маршрут. `Get-NetRoute` і `New-NetRoute` — PowerShell аналог. При конфліктах двох мереж — регулюй метрику адаптерів через `Set-NetIPInterface -InterfaceMetric`.
