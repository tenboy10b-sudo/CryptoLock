---
title: "Як увімкнути DNS over HTTPS (DoH) в Windows 11 і 10"
date: "2026-05-24"
publishDate: "2026-05-24"
description: "Увімкнення DNS over HTTPS в Windows 11 нативно, в Windows 10 через браузер або WARP. Шифрування DNS запитів, порівняння з VPN і покращення приватності через Cloudflare, Google чи Quad9."
tags: ["windows", "dns", "приватність", "безпека", "мережа"]
readTime: 6
translatesEn: "how-to-configure-dns-over-https-windows"
---

DNS over HTTPS шифрує DNS запити — без нього провайдер бачить кожен сайт який ти відкриваєш навіть через HTTPS.

---

## Що таке DNS over HTTPS

**Звичайний DNS:** запит `google.com → 142.250.0.14` передається відкрито через UDP порт 53 — видно провайдеру, роутеру і будь-кому в мережі.

**DNS over HTTPS (DoH):** той самий запит передається через HTTPS — зашифровано, виглядає як звичайний веб-трафік.

---

## Увімкнути DoH в Windows 11 (нативно)

`Win + I` → **Мережа та Інтернет** → **Wi-Fi/Ethernet** → **DNS сервери** → **Редагувати** → **Вручну**

Встанови:
- IPv4 основний DNS: `1.1.1.1`
- DNS over HTTPS: **Увімкнено**
- IPv4 альтернативний: `1.0.0.1`

---

## Через PowerShell (Windows 11)

```powershell
Add-DnsClientDohServerAddress -ServerAddress "1.1.1.1" `
  -DohTemplate "https://cloudflare-dns.com/dns-query" `
  -AllowFallbackToUdp $false -AutoUpgrade $true

Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses ("1.1.1.1", "1.0.0.1")

# Перевірити
Get-DnsClientDohServerAddress
```

Або одразу увімкнути DoH-режим через реєстр:
```powershell
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Services\Dnscache\Parameters" `
  -Name "EnableAutoDoh" -Value 2 -Type DWord
```

---

## У браузерах (Windows 10 і будь-яка ОС)

**Chrome:** Параметри → Конфіденційність → Безпека → **Використовувати захищений DNS** → Власний → `https://cloudflare-dns.com/dns-query`

**Firefox:** Параметри → Конфіденційність → DNS over HTTPS → **Максимальний захист**

---

## Варіанти DoH серверів

| Провайдер | IP | DoH шаблон |
|-----------|-----|-----------|
| Cloudflare | 1.1.1.1 | https://cloudflare-dns.com/dns-query |
| Google | 8.8.8.8 | https://dns.google/dns-query |
| Quad9 (блокує malware) | 9.9.9.9 | https://dns.quad9.net/dns-query |
| NextDNS (налаштовуваний) | Індивідуальний | https://dns.nextdns.io/xxxxxx |

---

## DoH в Windows 10

Windows 10 не підтримує DoH нативно на системному рівні. Варіанти:

- **Cloudflare WARP** — безкоштовний клієнт з DoH ([one.one.one.one](https://one.one.one.one))
- **NextDNS** — сервіс з DoH підтримкою і власною фільтрацією
- **Pi-hole + cloudflared** — для домашньої мережі, шифрує DNS для всіх пристроїв одразу

---

## DoH vs VPN

DoH шифрує тільки DNS запити — сам трафік лишається відкритим. VPN шифрує весь трафік, включно з DNS.

Для повної приватності потрібен VPN — DoH хороше доповнення, але не заміна.

---

## Корпоративне середовище

У корпоративній мережі DoH може конфліктувати з корпоративним DNS і фільтрацією трафіку:

```powershell
# Вимкнути DoH через реєстр для Edge
Set-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Edge" `
  -Name "DnsOverHttpsMode" -Value "off" -Type String

# Вимкнути в Chrome
Set-ItemProperty "HKLM:\SOFTWARE\Policies\Google\Chrome" `
  -Name "DnsOverHttpsMode" -Value "off" -Type String
```

---

## Перевірити що DoH працює

Відкрий `https://1.1.1.1/help` або **dnsleaktest.com** — покаже чи активний DoH і який сервер справді використовується.

---

## Часті питання

### DoH сповільнює браузер?

Ні — DNS кешується і DoH додає лише 1-5 мс на некешований запит. Перевага приватності набагато більша.

### DoH ховає весь трафік від провайдера?

Ховає DNS запити але не SNI в TLS. Провайдер все одно бачить до яких IP ти підключаєшся. Для повної приватності потрібен VPN.

---

## Резюме

Windows 11: налаштування мережі або `Add-DnsClientDohServerAddress`. Windows 10: в браузері. Cloudflare (1.1.1.1) — найшвидший і найбільш орієнтований на приватність. Перевірка на 1.1.1.1/help.
