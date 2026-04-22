---
title: "Як налаштувати DNS в Windows вручну"
date: "2026-04-04"
description: "Як змінити DNS-сервер на Google, Cloudflare або кастомний через Settings, CMD і PowerShell. Який DNS обрати для швидкості і приватності."
tags: ["dns", "мережа", "налаштування", "приватність"]
readTime: 5
---

DNS-сервер за замовчуванням від провайдера часто повільний і може логувати запити. Зміна на Google або Cloudflare прискорює завантаження сайтів і підвищує приватність.

## Популярні DNS-сервери

| Провайдер | Primary | Secondary | Особливість |
|---|---|---|---|
| **Google** | 8.8.8.8 | 8.8.4.4 | Швидкий, надійний |
| **Cloudflare** | 1.1.1.1 | 1.0.0.1 | Найшвидший, приватний |
| **Cloudflare + фільтр** | 1.1.1.2 | 1.0.0.2 | Блокує шкідливі сайти |
| **Quad9** | 9.9.9.9 | 149.112.112.112 | Блокує malware |
| **AdGuard** | 94.140.14.14 | 94.140.15.15 | Блокує рекламу |

---

## Спосіб 1: Через Settings (Windows 11)

`Win + I` → **Network & Internet** → вибери своє підключення (Wi-Fi або Ethernet) → **Hardware properties** → **DNS server assignment** → **Edit** → **Manual** → увімкни IPv4 → введи DNS.

---

## Спосіб 2: Через Control Panel

`Win + R` → `ncpa.cpl` → правий клік на адаптері → **Properties** → **Internet Protocol Version 4 (TCP/IPv4)** → **Properties** → **Use the following DNS server addresses**:

```
Preferred DNS:  1.1.1.1
Alternate DNS:  1.0.0.1
```

OK → Close.

---

## Спосіб 3: Через CMD

```cmd
netsh interface ipv4 set dns name="Wi-Fi" static 1.1.1.1
netsh interface ipv4 add dns name="Wi-Fi" 1.0.0.1 index=2
```

Замість `"Wi-Fi"` встав назву свого адаптера. Дізнатись назву:
```cmd
netsh interface show interface
```

---

## Спосіб 4: Через PowerShell

```powershell
# Дізнатись ім'я адаптера
Get-NetAdapter | Select-Object Name, Status

# Встановити DNS
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses ("1.1.1.1","1.0.0.1")
```

---

## Перевірка що DNS змінився

```cmd
ipconfig /all
```

Знайди свій адаптер — рядок **DNS Servers** має показувати нові адреси.

Або перевір через PowerShell:
```powershell
Get-DnsClientServerAddress | Where-Object {$_.AddressFamily -eq 2}
```

---

## Очистити DNS кеш після зміни

```cmd
ipconfig /flushdns
```

Після зміни DNS завжди чисти кеш — інакше старі записи можуть кешуватись ще якийсь час.

---

## DNS over HTTPS (DoH) — шифрований DNS

В Windows 11 є вбудована підтримка DNS over HTTPS:

`Win + I` → **Network & Internet** → вибери підключення → **Hardware properties** → **DNS server assignment** → Edit → Manual → увімкни IPv4 → введи `1.1.1.1` → **DNS over HTTPS** → **On (automatic template)**.

Тепер DNS-запити зашифровані і провайдер не бачить які сайти ти відвідуєш.

> Також дивись: [Очищення DNS кешу Windows](/ochyschennya-dns-keshu-windows)
