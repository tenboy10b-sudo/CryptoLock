---
title: "DNS over HTTPS в Windows 11: налаштування приватного і захищеного DNS"
date: "2026-08-20"
publishDate: "2026-08-20"
description: "Як увімкнути DNS over HTTPS (DoH) в Windows 11 для захисту DNS-запитів від перехоплення: налаштування в системі, Edge, Chrome і Firefox."
tags: ["мережа", "безпека", "windows", "приватність", "налаштування", "dns"]
readTime: 5
---

Звичайний DNS передає запити у відкритому вигляді — провайдер, роутер і будь-хто в мережі може бачити які сайти ти відвідуєш. DNS over HTTPS шифрує ці запити.

---

## Що таке DNS over HTTPS

**Звичайний DNS:** запит `google.com → 142.250.0.14` передається відкрито через UDP порт 53. Видно всім.

**DNS over HTTPS (DoH):** той самий запит передається через HTTPS — зашифровано, виглядає як звичайний веб-трафік.

---

## Увімкнути DoH в Windows 11 (системний рівень)

`Параметри` → `Мережа і Інтернет` → **Wi-Fi** (або Ethernet) → **Властивості обладнання** → **Призначення DNS-сервера** → **Змінити**:

- Вибери **Вручну**
- IPv4 → увімкни
- **Основний DNS:** `1.1.1.1`
- **DNS over HTTPS:** вибери **Увімкнено (автоматичний шаблон)**
- **Додатковий DNS:** `1.0.0.1`

Або через PowerShell:

```powershell
# Встановити Cloudflare DoH
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses "1.1.1.1", "1.0.0.1"

# Увімкнути DoH через реєстр (Windows 11)
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Services\Dnscache\Parameters" `
  -Name "EnableAutoDoh" -Value 2 -Type DWord

# Перевірити статус DoH
Get-DnsClientServerAddress -InterfaceAlias "Wi-Fi"
```

---

## Надійні DoH провайдери

| Провайдер | IP | DoH URL |
|-----------|-----|---------|
| Cloudflare | 1.1.1.1 | https://cloudflare-dns.com/dns-query |
| Google | 8.8.8.8 | https://dns.google/dns-query |
| Quad9 (блокує malware) | 9.9.9.9 | https://dns.quad9.net/dns-query |
| NextDNS (налаштовуваний) | Індивідуальний | https://dns.nextdns.io/xxxxxx |

**Cloudflare 1.1.1.1** — найшвидший за тестами і з хорошою приватністю (не продає логи рекламодавцям).

**Quad9** — блокує відомі шкідливі і фішинг домени автоматично.

---

## DoH в браузерах (незалежно від системи)

### Chrome і Edge

`chrome://settings/security` (або `edge://settings/privacy`) → **Безпека** → **Використовувати захищений DNS** → вибери провайдера або введи власний URL.

### Firefox

`about:preferences` → **Загальні** → прокрути вниз → **Параметри мережевого підключення** → **Налаштування** → увімкни **DNS over HTTPS** → вибери провайдера.

---

## Перевірити чи DoH працює

Зайди на **1.1.1.1/help** (Cloudflare) або **dnsleaktest.com** — перевір що DNS сервер відображається як очікуваний (Cloudflare, Google тощо), а не твій провайдер.

---

## Корпоративне середовище

У корпоративній мережі DoH може конфліктувати з корпоративним DNS і фільтрацією.

```powershell
# Вимкнути DoH через GPO або реєстр для корпоративних ПК
Set-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Edge" `
  -Name "DnsOverHttpsMode" -Value "off" -Type String

# Вимкнути в Chrome
Set-ItemProperty "HKLM:\SOFTWARE\Policies\Google\Chrome" `
  -Name "DnsOverHttpsMode" -Value "off" -Type String
```

---

## Підсумок

`Параметри` → `Мережа` → властивості адаптера → DNS → змінити на `1.1.1.1` з DoH увімкненим. Це захищає від перехоплення DNS провайдером і в публічних мережах. Quad9 додатково блокує шкідливі домени. Перевір результат на dnsleaktest.com.
