---
title: "CMD команди для мережі Windows: діагностика і налаштування"
date: "2026-05-17"
publishDate: "2026-05-17"
description: "Найкорисніші команди CMD і PowerShell для мережевої діагностики Windows: ping, tracert, ipconfig, netstat, nslookup, netsh — з прикладами."
tags: ["cmd", "мережа", "інструменти", "адміністрування", "dns"]
readTime: 7
---

Коли інтернет не працює або є проблеми з мережею — командний рядок дає точні відповіді швидше ніж будь-який GUI. Ось повний набір команд для діагностики.

---

## ipconfig — інформація про мережеві адаптери

```cmd
:: Базова інформація
ipconfig

:: Повна інформація з MAC-адресами і DNS
ipconfig /all

:: Очистити кеш DNS
ipconfig /flushdns

:: Оновити IP-адресу від DHCP
ipconfig /release
ipconfig /renew
```

**Що шукати в ipconfig /all:**
- `IPv4 Address` — твоя IP-адреса в мережі
- `Default Gateway` — IP роутера (зазвичай 192.168.0.1 або 192.168.1.1)
- `DNS Servers` — адреси DNS-серверів
- `Physical Address` — MAC-адреса адаптера

---

## ping — перевірка зв'язку

```cmd
:: Перевірити чи є інтернет
ping google.com

:: Пінгувати IP напряму (без DNS)
ping 8.8.8.8

:: Безперервний пінг (зупинити Ctrl+C)
ping -t google.com

:: Вказати кількість пакетів
ping -n 10 google.com

:: Пінгувати з великими пакетами (перевірка MTU)
ping -l 1400 google.com
```

**Читаємо результат:**
- `time=20ms` — затримка, нормально до 50ms для України
- `Request timed out` — вузол недоступний або блокує ping
- `100% loss` — немає зв'язку з цією адресою

**Діагностика кроками:**
```cmd
ping 127.0.0.1      :: локальний стек — якщо не відповідає, проблема в Windows
ping 192.168.1.1    :: роутер — якщо не відповідає, проблема в кабелі або Wi-Fi
ping 8.8.8.8        :: інтернет по IP — якщо не відповідає, проблема в роутера/провайдера
ping google.com     :: DNS — якщо не відповідає але 8.8.8.8 пінгується, проблема в DNS
```

---

## tracert — маршрут до вузла

```cmd
tracert google.com

:: Без резолвінгу імен (швидше)
tracert -d google.com
```

Показує кожен "стрибок" між тобою і сервером. Де затримка різко зростає або з'являється `* * *` — там проблема.

---

## nslookup — перевірка DNS

```cmd
:: Перевірити DNS-запис домену
nslookup google.com

:: Перевірити через конкретний DNS-сервер
nslookup google.com 8.8.8.8
nslookup google.com 1.1.1.1

:: Інтерактивний режим
nslookup
> set type=MX
> gmail.com
```

Детальніше про зміну DNS: [Як налаштувати DNS в Windows](/yak-zminyty-dns-windows)

---

## netstat — активні підключення

```cmd
:: Всі активні підключення
netstat -an

:: З іменами програм (від адміністратора)
netstat -anb

:: Тільки слухаючі порти
netstat -an | findstr "LISTENING"

:: Оновлювати кожні 2 секунди
netstat -an 2

:: Статистика по протоколах
netstat -s
```

**Корисно для:** знайти яка програма займає порт, виявити підозрілі підключення.

---

## netsh — налаштування мережі

```cmd
:: Показати всі Wi-Fi профілі
netsh wlan show profiles

:: Показати пароль збереженої мережі
netsh wlan show profile name="Назва мережі" key=clear

:: Скинути TCP/IP стек
netsh int ip reset

:: Скинути Winsock
netsh winsock reset

:: Показати стан брандмауера
netsh advfirewall show allprofiles

:: Вимкнути брандмауер (тільки для діагностики!)
netsh advfirewall set allprofiles state off
:: Увімкнути назад
netsh advfirewall set allprofiles state on
```

---

## arp — таблиця MAC-адрес

```cmd
:: Показати ARP-таблицю (IP → MAC у локальній мережі)
arp -a

:: Видалити ARP-кеш
arp -d *
```

Корисно коли два пристрої мають однакову IP — видно по MAC-адресам.

---

## route — таблиця маршрутизації

```cmd
:: Показати таблицю маршрутів
route print

:: Додати статичний маршрут
route add 10.0.0.0 mask 255.0.0.0 192.168.1.1

:: Видалити маршрут
route delete 10.0.0.0
```

---

## PowerShell варіанти

```powershell
:: Тест з'єднання (аналог ping, але потужніший)
Test-NetConnection google.com
Test-NetConnection google.com -Port 443

:: Перевірити чи відкритий порт
Test-NetConnection 192.168.1.1 -Port 80

:: Показати активні підключення
Get-NetTCPConnection | Where-Object State -eq 'Established'

:: Показати DNS налаштування
Get-DnsClientServerAddress

:: Скинути DNS кеш
Clear-DnsClientCache
```

---

## Підсумок

Для швидкої діагностики: `ipconfig /all` → `ping 8.8.8.8` → `ping google.com`. Якщо перший пінгується а другий ні — проблема в DNS. Скинь кеш `ipconfig /flushdns` або зміни DNS-сервер.
