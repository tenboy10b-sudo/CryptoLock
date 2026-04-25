---
title: "Скидання мережевих налаштувань Windows: netsh, ipconfig і Winsock"
date: "2026-06-23"
publishDate: "2026-06-23"
description: "Як скинути мережеві налаштування Windows коли не підключається інтернет: ipconfig /release /renew, netsh winsock reset, скидання TCP/IP і DNS кешу."
tags: ["мережа", "windows", "діагностика", "cmd", "wifi"]
readTime: 5
---

Інтернет зник, сайти не відкриваються або мережа показує "Без доступу до інтернету" — часто проблема у пошкоджених мережевих налаштуваннях Windows. Скидання займає 2 хвилини.

---

## Повне скидання мережі одним скриптом

Відкрий **CMD від адміністратора** і виконай по черзі:

```cmd
ipconfig /release
ipconfig /flushdns
ipconfig /renew
netsh winsock reset
netsh int ip reset
netsh int tcp reset
netsh int ipv4 reset
netsh int ipv6 reset
```

Перезавантаж ПК після виконання.

---

## Що робить кожна команда

### ipconfig — управління IP адресою

```cmd
rem Показати всі мережеві адаптери і їх налаштування
ipconfig /all

rem Звільнити IP адресу (для DHCP)
ipconfig /release

rem Отримати нову IP адресу від роутера
ipconfig /renew

rem Очистити DNS кеш (вирішує проблеми з конкретними сайтами)
ipconfig /flushdns

rem Показати вміст DNS кешу
ipconfig /displaydns

rem Очистити NetBIOS кеш
nbtstat -R
```

### netsh winsock reset — скидання Winsock

Winsock — бібліотека Windows для мережевих підключень. Пошкоджується вірусами або після некоректного видалення VPN/антивірусів.

```cmd
netsh winsock reset
rem Потрібне перезавантаження
```

### netsh int ip reset — скидання TCP/IP стека

```cmd
netsh int ip reset
netsh int tcp reset
netsh int ipv4 reset
netsh int ipv6 reset
```

### Скидання брандмауера якщо блокує мережу

```cmd
netsh advfirewall reset
```

---

## Діагностика через PowerShell

```powershell
# Повна інформація про мережеві адаптери
Get-NetAdapter | Select-Object Name, Status, LinkSpeed, MacAddress

# IP адреси і шлюзи
Get-NetIPConfiguration | Select-Object InterfaceAlias, IPv4Address, IPv4DefaultGateway, DNSServer

# Перевірити підключення до роутера і інтернету
Test-NetConnection -ComputerName 192.168.1.1    # роутер
Test-NetConnection -ComputerName 8.8.8.8         # DNS Google
Test-NetConnection -ComputerName google.com      # DNS + HTTP

# Скидання всіх адаптерів через PowerShell
Get-NetAdapter | Restart-NetAdapter

# Вимкнути і увімкнути адаптер
Disable-NetAdapter -Name "Wi-Fi" -Confirm:$false
Start-Sleep 3
Enable-NetAdapter -Name "Wi-Fi" -Confirm:$false
```

---

## Скидання мережі через Параметри (Windows 10/11)

`Параметри` → `Мережа і Інтернет` → прокрути вниз → **Скидання мережі**

Це видаляє і перевстановлює всі мережеві адаптери і скидає всі мережеві компоненти до заводських. Після цього потрібно заново підключитись до Wi-Fi і ввести паролі VPN.

---

## Типові проблеми і рішення

### "Без доступу до інтернету" при підключеному Wi-Fi

```cmd
rem Спробувати отримати нову IP від роутера
ipconfig /release && ipconfig /renew

rem Якщо IP 169.254.x.x — проблема в DHCP
rem Встанови IP вручну або перезавантаж роутер
```

### DNS не резолвить але пінг на IP працює

```cmd
rem Флашнути DNS кеш
ipconfig /flushdns

rem Змінити DNS на Google
netsh interface ip set dns "Wi-Fi" static 8.8.8.8
netsh interface ip add dns "Wi-Fi" 8.8.8.4 index=2
```

### Після видалення VPN інтернет не працює

```cmd
rem Скинути Winsock і TCP/IP
netsh winsock reset
netsh int ip reset
rem Перезавантаж
```

### Мережа є але конкретний сайт не відкривається

```cmd
rem Перевірити чи сайт взагалі живий
ping google.com

rem Трасування маршруту
tracert google.com

rem Перевірити DNS резолвинг
nslookup google.com
nslookup google.com 8.8.8.8
```

---

## Перевірити швидкість мережевого адаптера

```powershell
# Поточна швидкість підключення
Get-NetAdapter | Select-Object Name, LinkSpeed, Status

# Статистика трафіку
Get-NetAdapterStatistics | Select-Object Name, ReceivedBytes, SentBytes
```

---

## Підсумок

При будь-яких проблемах з інтернетом — спочатку `ipconfig /release && ipconfig /renew && ipconfig /flushdns`. Якщо не допомогло — `netsh winsock reset && netsh int ip reset` і перезавантаження. Якщо після видалення VPN все зламалось — Winsock reset вирішує в 90% випадків.
