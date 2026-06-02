---
title: "Як увімкнути DNS over HTTPS (DoH) в Windows 11 і 10"
date: "2026-05-24"
publishDate: "2026-05-24"
description: "Увімкнення DNS over HTTPS в Windows 11 нативно і в Windows 10 через браузер. Шифрування DNS запитів і покращення приватності через Cloudflare або Google."
tags: ["windows", "dns", "приватність", "безпека", "мережа"]
readTime: 3
translatesEn: "how-to-configure-dns-over-https-windows"
---

DNS over HTTPS шифрує DNS запити — без нього провайдер бачить кожен сайт який ти відкриваєш навіть через HTTPS.

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
| Quad9 | 9.9.9.9 | https://dns.quad9.net/dns-query |

---

## Перевірити що DoH працює

Відкрий `https://1.1.1.1/help` — покаже чи активний DoH.

---

## Часті питання

### DoH сповільнює браузер?

Ні — DNS кешується і DoH додає лише 1-5 мс на некешований запит. Перевага приватності набагато більша.

### DoH ховає весь трафік від провайдера?

Ховає DNS запити але не SNI в TLS. Провайдер все одно бачить до яких IP ти підключаєшся. Для повної приватності потрібен VPN.

---

## Резюме

Windows 11: налаштування мережі або `Add-DnsClientDohServerAddress`. Windows 10: в браузері. Cloudflare (1.1.1.1) — найшвидший і найбільш орієнтований на приватність. Перевірка на 1.1.1.1/help.
