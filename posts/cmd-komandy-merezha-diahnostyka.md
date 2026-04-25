---
title: "CMD команди для діагностики мережі: ping, tracert, nslookup і netstat"
date: "2026-06-28"
publishDate: "2026-06-28"
description: "Основні команди CMD для перевірки мережі в Windows: ping, tracert, nslookup, netstat, pathping. Як знайти причину проблем з інтернетом і DNS."
tags: ["cmd", "мережа", "діагностика", "windows", "інструменти"]
readTime: 6
---

Інтернет не працює, сайт не відкривається або пінг великий — ці команди допоможуть знайти де саме проблема за 2–3 хвилини.

---

## ping — перевірити доступність

Найперша команда при будь-яких мережевих проблемах.

```cmd
rem Перевірити доступність Google
ping google.com

rem Перевірити роутер (замість 192.168.1.1 — IP твого роутера)
ping 192.168.1.1

rem Перевірити DNS сервер
ping 8.8.8.8

rem Безперервний пінг (Ctrl+C щоб зупинити)
ping google.com -t

rem Пінг з більшим пакетом (перевірка стабільності)
ping google.com -l 1400 -t

rem Задати кількість пакетів
ping google.com -n 20
```

**Що означають результати:**
- `Reply from` — пакет дійшов і повернувся ✓
- `Request timed out` — пакет не повернувся (пристрій недоступний або блокує ICMP)
- `Destination host unreachable` — немає маршруту до адреси
- `TTL expired` — пакет загубився по дорозі

**Алгоритм діагностики:**
1. `ping 192.168.1.1` — якщо не відповідає, проблема між ПК і роутером
2. `ping 8.8.8.8` — якщо не відповідає, проблема в провайдера або роутера
3. `ping google.com` — якщо не відповідає але `ping 8.8.8.8` працює, проблема в DNS

---

## tracert — знайти де обривається зв'язок

Показує всі вузли через які проходить пакет і час до кожного.

```cmd
rem Трасування до Google
tracert google.com

rem Трасування без зворотного DNS (швидше)
tracert -d google.com

rem Максимум 15 вузлів замість 30
tracert -h 15 google.com
```

**Читання результатів:**
```
1    1 ms    1 ms    1 ms  192.168.1.1        ← роутер
2    5 ms    5 ms    6 ms  10.0.0.1           ← провайдер
3   15 ms   14 ms   15 ms  172.16.0.1
4    *        *        *   Request timed out  ← тут обрив або блокування
5   25 ms   26 ms   25 ms  google.com
```

Зірочки `* * *` не завжди означають проблему — деякі вузли блокують ICMP але пропускають TCP.

---

## nslookup — діагностика DNS

```cmd
rem Перевірити DNS для домену
nslookup google.com

rem Перевірити через конкретний DNS сервер
nslookup google.com 8.8.8.8
nslookup google.com 1.1.1.1

rem Зворотній пошук — IP до імені
nslookup 8.8.8.8

rem Перевірити MX запис (пошта)
nslookup -type=MX gmail.com

rem Перевірити TXT запис (SPF, DKIM)
nslookup -type=TXT google.com
```

**Типові проблеми:**
- `Non-existent domain` — домен не існує або проблема DNS
- Різні відповіді від різних DNS — може бути кеш або перехоплення DNS провайдером

---

## netstat — активні підключення

```cmd
rem Всі активні TCP підключення
netstat -an

rem З іменем процесу і PID
netstat -anob

rem Тільки встановлені підключення
netstat -an | findstr ESTABLISHED

rem Відкриті порти (сервер слухає)
netstat -an | findstr LISTENING

rem Статистика по протоколах
netstat -s

rem Оновлювати кожні 2 секунди
netstat -an 2
```

---

## pathping — комбінація ping і tracert

Краще за tracert для виявлення втрати пакетів на конкретному вузлі.

```cmd
rem Аналіз маршруту (займає ~5 хвилин)
pathping google.com

rem Швидший варіант
pathping -n -q 10 google.com
```

Показує % втрати пакетів на кожному вузлі — одразу видно де є проблема.

---

## arp — таблиця ARP (хто в мережі)

```cmd
rem Список пристроїв у локальній мережі
arp -a

rem Очистити ARP кеш
arp -d *
```

---

## route — таблиця маршрутизації

```cmd
rem Показати таблицю маршрутів
route print

rem Додати маршрут
route add 192.168.2.0 mask 255.255.255.0 192.168.1.1

rem Видалити маршрут
route delete 192.168.2.0
```

---

## Швидка діагностика — чек-лист

```cmd
rem 1. Перевірити роутер
ping 192.168.1.1

rem 2. Перевірити інтернет (без DNS)
ping 8.8.8.8

rem 3. Перевірити DNS
ping google.com
nslookup google.com

rem 4. Знайти де обривається
tracert google.com

rem 5. Перевірити підозрілі підключення
netstat -anob
```

---

## Підсумок

`ping 192.168.1.1` → `ping 8.8.8.8` → `ping google.com` — три команди що за 30 секунд локалізують проблему. `tracert` покаже на якому вузлі обрив. `nslookup` перевірить DNS. `netstat -anob` покаже підозрілі підключення.
