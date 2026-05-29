---
title: "Як виправити проблеми з DNS в Windows 10 і 11"
date: "2026-05-24"
publishDate: "2026-05-24"
description: "Виправлення помилок DNS в Windows: сайти не відкриваються, DNS_PROBE_FINISHED_NXDOMAIN. Очистити кеш DNS, змінити сервери, скинути мережевий стек."
tags: ["windows", "dns", "мережа", "помилки", "налаштування"]
readTime: 4
translatesEn: "how-to-fix-dns-not-resolving-windows"
---

DNS проблеми — сайти не відкриваються навіть коли інтернет є. Ось системний підхід до виправлення.

---

## Швидкі виправлення

```powershell
# 1. Очистити кеш DNS
Clear-DnsClientCache
ipconfig /flushdns

# 2. Перезапустити DNS Client
Restart-Service Dnscache -Force

# 3. Оновити DHCP
ipconfig /release
ipconfig /renew
```

---

## Змінити DNS сервер (найефективніше)

```powershell
# Отримати ім'я адаптера
Get-NetAdapter | Where-Object {$_.Status -eq "Up"} | Select-Object Name

# Cloudflare DNS
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses ("1.1.1.1", "1.0.0.1")

# Google DNS
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses ("8.8.8.8", "8.8.4.4")
```

---

## Тест DNS

```powershell
# Перевірити роздільну здатність
Resolve-DnsName google.com

# Тест з конкретним сервером
Resolve-DnsName google.com -Server 1.1.1.1

# Який DNS зараз
nslookup google.com
```

---

## Скинути мережевий стек

```cmd
netsh winsock reset
netsh int ip reset
ipconfig /flushdns
ipconfig /registerdns
```

Перезавантажити після цих команд.

---

## Перевірити hosts файл

```powershell
Get-Content "C:\Windows\System32\drivers\etc\hosts"
```

Нормальний hosts файл: тільки `127.0.0.1 localhost` і `::1 localhost`. Підозрілі записи — видали.

---

## Часті питання

### DNS_PROBE_FINISHED_NXDOMAIN — що це означає?

Доменне ім'я не вдалось розпізнати. DNS не працює, домен не існує або заблокований. Запусти `nslookup google.com` для діагностики.

### Чи варто завжди використовувати Google або Cloudflare DNS?

Для більшості користувачів — так. Швидші і надійніші ніж DNS провайдера. Cloudflare (1.1.1.1) — приватність. Google (8.8.8.8) — швидкість.

---

## Резюме

Порядок: очисти DNS → перезапусти Dnscache → зміни на 1.1.1.1 або 8.8.8.8 → скинь мережевий стек → перевір hosts файл. Зміна DNS серверу вирішує більшість проблем назавжди.
