---
title: "DNS over HTTPS в Windows 11: як увімкнути шифрування DNS запитів"
date: "2026-02-15"
publishDate: "2026-02-15"
description: "DNS over HTTPS шифрує запити до DNS сервера — провайдер не бачить які сайти ти відвідуєш. Як увімкнути DoH в Windows 11 через Параметри і PowerShell."
tags: ["windows", "мережа", "приватність", "dns"]
readTime: 4
---

Стандартний DNS трафік не зашифрований — провайдер і будь-хто в мережі бачить які домени ти запитуєш. DNS over HTTPS (DoH) шифрує ці запити.

---

## Увімкнути DoH в Windows 11

`Win + I` → **Мережа і Інтернет** → клікни на своє підключення (Wi-Fi або Ethernet) → **Властивості** → **Призначення DNS-сервера** → **Редагувати** → вибери **Вручну** → увімкни IPv4:

- **Бажаний DNS**: `1.1.1.1`
- **DNS over HTTPS**: **Увімкнено (автоматичний шаблон)**
- **Альтернативний DNS**: `1.0.0.1`
- **DNS over HTTPS**: **Увімкнено (автоматичний шаблон)**

Натисни **Зберегти**.

---

## Підтримувані DoH сервери

Windows 11 знає шаблони DoH для популярних серверів:

| Провайдер | DNS адреса |
|-----------|-----------|
| Cloudflare | 1.1.1.1, 1.0.0.1 |
| Google | 8.8.8.8, 8.8.4.4 |
| Quad9 | 9.9.9.9 |

Для інших серверів потрібно вручну вказати URL шаблону.

---

## Через PowerShell

```powershell
# Додати DoH для Cloudflare
Add-DnsClientDohServerAddress -ServerAddress 1.1.1.1 `
  -DohTemplate "https://cloudflare-dns.com/dns-query" `
  -AllowFallbackToUdp $false `
  -AutoUpgrade $true

Add-DnsClientDohServerAddress -ServerAddress 1.0.0.1 `
  -DohTemplate "https://cloudflare-dns.com/dns-query" `
  -AllowFallbackToUdp $false `
  -AutoUpgrade $true

# Задати DoH сервери для адаптера
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" `
  -ServerAddresses ("1.1.1.1", "1.0.0.1")

# Перевірити конфігурацію DoH
Get-DnsClientDohServerAddress
```

---

## Перевірити що DoH працює

Перейди на [1.1.1.1/help](https://1.1.1.1/help) або [cloudflare.com/ssl/encrypted-sni](https://www.cloudflare.com/ssl/encrypted-sni/) — перевірить чи зашифровані DNS запити.

Або:
```powershell
# Перевірити поточне джерело DNS
Get-DnsClientServerAddress -InterfaceAlias "Wi-Fi"

# Тест DNS запиту
Resolve-DnsName google.com -Server 1.1.1.1
```

---

## DoH в Windows 10

Windows 10 не підтримує DoH нативно. Варіанти:

- **Cloudflare WARP** — безкоштовний клієнт з DoH ([one.one.one.one](https://one.one.one.one))
- **NextDNS** — сервіс з DoH підтримкою і фільтрацією
- **Pi-hole** + cloudflared — для домашньої мережі

---

## DoH vs VPN

DoH шифрує тільки DNS запити — сам трафік залишається відкритим. VPN шифрує весь трафік включно з DNS.

Якщо потрібна повна приватність — використовуй VPN. DoH — хороше доповнення але не заміна VPN.

---

## Резюме

`Win + I` → Мережа → підключення → DNS → Вручну → введи `1.1.1.1` і вибери **DoH увімкнено**. Перевір на 1.1.1.1/help. В Windows 10 — встанови Cloudflare WARP.
