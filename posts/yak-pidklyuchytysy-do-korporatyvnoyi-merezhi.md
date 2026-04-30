---
title: "Корпоративна мережа з дому: VPN, Split Tunneling і безпека"
date: "2026-08-27"
publishDate: "2026-08-27"
description: "Як безпечно підключитись до корпоративної мережі з дому через VPN, налаштувати split tunneling, уникнути витоку трафіку і захистити корпоративні дані."
tags: ["мережа", "безпека", "vpn", "windows", "налаштування"]
readTime: 6
---

Підключення до корпоративної мережі з дому — баланс між зручністю і безпекою. Неправильне налаштування VPN може поставити корпоративні ресурси під загрозу.

---

## Як працює корпоративний VPN

VPN створює зашифрований тунель між твоїм ПК і корпоративною мережею. Весь трафік (або тільки корпоративний — залежить від налаштувань) проходить через цей тунель.

Два режими:
- **Full Tunnel** — весь трафік через VPN. Безпечніше, повільніше
- **Split Tunneling** — корпоративний через VPN, інший напряму. Швидше, але більший ризик

---

## Підключення до корпоративного VPN

### Вбудований VPN клієнт Windows

`Параметри` → `Мережа і Інтернет` → `VPN` → **Додати VPN**:

- **Постачальник VPN:** Windows (вбудований)
- **Тип VPN:** IKEv2, L2TP/IPsec або SSTP (уточни у IT-відділу)
- **Адреса сервера:** vpn.company.com
- **Тип входу:** Ім'я користувача і пароль / Сертифікат

### Cisco AnyConnect, GlobalProtect, Fortinet

Корпоративні VPN клієнти встановлюються IT-відділом. Запусти, введи сервер і credentials — все.

### Перевірити підключення

```cmd
rem Перевірити що трафік іде через VPN
ipconfig /all
rem IP адреса має бути з корпоративної підмережі

rem Перевірити доступ до внутрішнього ресурсу
ping fileserver.company.local
```

---

## Split Tunneling — налаштування

Split tunneling через вбудований VPN Windows:

```powershell
# Увімкнути split tunneling (тільки корпоративний трафік через VPN)
Set-VpnConnection -Name "Corporate VPN" -SplitTunneling $true

# Додати маршрут для корпоративної підмережі
Add-VpnConnectionRoute -ConnectionName "Corporate VPN" `
  -DestinationPrefix "192.168.1.0/24"
Add-VpnConnectionRoute -ConnectionName "Corporate VPN" `
  -DestinationPrefix "10.0.0.0/8"

# Перевірити маршрути
Get-VpnConnectionRoute -ConnectionName "Corporate VPN"
```

---

## Безпека при роботі через VPN

### Не вимикай VPN коли передаєш корпоративні дані

Здається очевидним, але часто порушується. Навіть одна секунда без VPN при передачі файлів — потенційний витік.

### Блокуй трафік без VPN (Kill Switch)

```powershell
# Правило брандмауера — блокувати весь трафік якщо VPN відключився
New-NetFirewallRule `
  -Name "Block-NoVPN" `
  -DisplayName "Block traffic without VPN" `
  -Direction Outbound `
  -Action Block `
  -InterfaceType Any `
  -Enabled False  # Вмикати вручну або через скрипт при підключенні VPN
```

### Перевірити витік DNS

Зайди на **dnsleaktest.com** після підключення до VPN. DNS сервери мають відповідати корпоративним, а не ISP.

---

## Типові проблеми

### VPN підключується але внутрішні ресурси недоступні

```cmd
rem Перевірити маршрутизацію
route print

rem Перевірити DNS резолвінг
nslookup fileserver.company.local
nslookup fileserver.company.local 192.168.1.10
```

Можливо DNS не передається через VPN. Додай корпоративний DNS вручну при підключеному VPN.

### VPN постійно відключається

```powershell
# Перевірити лог підключення
Get-EventLog -LogName Application -Source "RasClient" -Newest 20 |
  Select-Object TimeGenerated, EntryType, Message
```

Причини: нестабільне інтернет-підключення, застарілий клієнт, конфлікт з антивірусом.

### Повільна швидкість через VPN

- Спробуй інший VPN сервер (якщо є вибір)
- Увімкни split tunneling
- Перевір навантаження на корпоративний VPN концентратор (повідом IT)

---

## Безпека домашньої мережі при корпоративній роботі

Корпоративні дані на твоєму ПК → твоя домашня мережа стає частиною ланцюжка безпеки.

Мінімум:
- Сильний пароль на Wi-Fi роутері
- WPA3 або WPA2-AES шифрування
- Вимкнений WPS

Детальніше: [Захист домашнього Wi-Fi](/yak-zakhystyty-wi-fi-vdoma)

---

## Підсумок

Використовуй корпоративний VPN клієнт (Cisco, GlobalProtect) якщо виданий IT-відділом. Split tunneling прискорює роботу але знижує контроль над трафіком. Перевіряй DNS leaks після підключення. Захисти домашній роутер — він тепер частина корпоративної безпеки.
