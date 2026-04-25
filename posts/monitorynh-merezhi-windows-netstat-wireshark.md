---
title: "Моніторинг мережі в Windows: netstat, Resource Monitor і Wireshark"
date: "2026-06-09"
publishDate: "2026-06-09"
description: "Як переглянути мережеві підключення Windows, знайти підозрілі процеси що передають дані, використовувати netstat, Resource Monitor і Wireshark для аналізу трафіку."
tags: ["мережа", "безпека", "windows", "cmd", "powershell", "моніторинг"]
readTime: 7
---

Комп'ютер відправляє дані кудись у фоні? Програма з'єднується з невідомими серверами? Ось як це перевірити.

---

## Resource Monitor — швидкий огляд

`Win + R` → `resmon` → вкладка **Мережа**

Тут видно в реальному часі:
- **Processes with Network Activity** — які процеси зараз використовують мережу і скільки
- **Network Activity** — поточні підключення з адресами і портами
- **TCP Connections** — всі активні TCP з'єднання
- **Listening Ports** — порти на яких система очікує підключення

Клікни на процес вгорі — внизу відфільтруються тільки його підключення.

---

## netstat — з командного рядка

```cmd
rem Всі активні підключення з ім'ям процесу і PID
netstat -anob

rem Лише встановлені TCP підключення
netstat -an | findstr ESTABLISHED

rem Підключення що очікують (відкриті порти)
netstat -an | findstr LISTENING

rem Оновлювати кожні 2 секунди
netstat -an 2
```

Розшифровка стовпців:
- **Local Address** — IP:порт на твоєму ПК
- **Foreign Address** — IP:порт віддаленого сервера
- **State** — ESTABLISHED (підключено), LISTENING (чекає), TIME_WAIT (закривається)
- **PID** — ID процесу

Знайди процес за PID:
```cmd
tasklist | findstr 1234
```

---

## PowerShell — детальніший аналіз

```powershell
# Всі TCP підключення з ім'ям процесу
Get-NetTCPConnection -State Established |
  Select-Object LocalAddress, LocalPort, RemoteAddress, RemotePort,
    @{N="Process"; E={(Get-Process -Id $_.OwningProcess -EA SilentlyContinue).Name}},
    OwningProcess |
  Sort-Object Process |
  Format-Table -AutoSize

# Тільки зовнішні підключення (не localhost)
Get-NetTCPConnection -State Established |
  Where-Object { $_.RemoteAddress -notmatch '^(127\.|::1|0\.)' } |
  Select-Object RemoteAddress, RemotePort,
    @{N="Process"; E={(Get-Process -Id $_.OwningProcess -EA SilentlyContinue).Name}} |
  Format-Table -AutoSize

# Порти що слухають
Get-NetTCPConnection -State Listen |
  Select-Object LocalPort,
    @{N="Process"; E={(Get-Process -Id $_.OwningProcess -EA SilentlyContinue).Name}} |
  Sort-Object LocalPort |
  Format-Table -AutoSize

# Статистика по мережевих адаптерах
Get-NetAdapterStatistics | Select-Object Name, ReceivedBytes, SentBytes
```

---

## Знайти підозрілий процес

Якщо бачиш підключення до незнайомого IP:

```powershell
# Знайти процес і його файл
$pid = 1234  # замінити на реальний PID
Get-Process -Id $pid | Select-Object Name, Path, StartTime

# Переглянути всі підключення цього процесу
Get-NetTCPConnection | Where-Object { $_.OwningProcess -eq $pid }
```

Перевір IP-адресу:
- **ipinfo.io/8.8.8.8** — хто власник IP
- **virustotal.com** — перевір підозрілий файл процесу

---

## Wireshark — глибокий аналіз трафіку

Wireshark — безкоштовний аналізатор мережевих пакетів. Показує весь трафік на рівні пакетів.

**Встановлення:** wireshark.org → Download

### Базове використання

1. Запусти Wireshark
2. Вибери мережевий адаптер (Wi-Fi або Ethernet)
3. Натисни **Start capturing packets** (синій плавник)
4. Спостерігай трафік у реальному часі
5. Натисни **Stop** (червоний квадрат)

### Корисні фільтри Wireshark

```
# Трафік конкретного IP
ip.addr == 192.168.1.1

# Тільки HTTP трафік
http

# Тільки DNS запити
dns

# Трафік конкретного порту
tcp.port == 443

# Тільки вихідний трафік з мого ПК
ip.src == 192.168.1.100

# Шукати рядок у пакетах
frame contains "password"

# Великі пакети (підозра на витік даних)
frame.len > 1000 && ip.dst != 192.168.1.0/24
```

### Аналіз підозрілого трафіку

Якщо підозрюєш що програма відправляє дані:
1. Закрий всі програми крім підозрілої
2. Запусти Wireshark і почни запис
3. Зачекай 5 хвилин
4. Зупини і відфільтруй по IP підозрілої програми

---

## Моніторинг споживання трафіку

```powershell
# Скільки даних передав кожен процес (потребує запущеного Performance Monitor)
Get-Counter '\Process(*)\IO Data Bytes/sec' |
  Select-Object -ExpandProperty CounterSamples |
  Where-Object { $_.CookedValue -gt 0 } |
  Sort-Object CookedValue -Descending |
  Select-Object -First 10 Path, CookedValue
```

Або через **Task Manager** → вкладка **Процеси** → клікни правою кнопкою на заголовки → додай **Мережа**.

---

## Підсумок

Для швидкої перевірки — Resource Monitor або `netstat -anob`. Для PowerShell-скриптів — `Get-NetTCPConnection`. Для глибокого аналізу пакетів — Wireshark з фільтрами. Підозрілий процес — перевір через `Get-Process` і virustotal.com.
