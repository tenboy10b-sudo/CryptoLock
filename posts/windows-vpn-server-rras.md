---
title: "Як налаштувати VPN сервер на Windows через RRAS"
date: "2026-06-08"
publishDate: "2026-06-08"
description: "Налаштування VPN сервера на Windows за допомогою RRAS. Протоколи PPTP і SSTP, управління доступом користувачів і підключення клієнтів до свого VPN."
tags: ["windows", "vpn", "мережа", "сервер", "адміністрування"]
readTime: 5
translatesEn: "how-to-configure-windows-vpn-server"
---

Windows Server і навіть Windows 10/11 Pro можуть виступати VPN сервером через вбудований RRAS.

---

## Вимоги

- Windows Server або Windows 10/11 Pro
- Статичний IP або Dynamic DNS для сервера
- Переадресація портів на роутері (1723 для PPTP, 443 для SSTP)

---

## Увімкнути RRAS

На Windows Server:
```powershell
Install-WindowsFeature Routing -IncludeManagementTools
Install-WindowsFeature DirectAccess-VPN -IncludeManagementTools
```

На Windows 10/11:
`Панель керування` → **Засоби адміністрування** → **Маршрутизація та віддалений доступ** → ПКМ на сервері → **Налаштувати** → **Доступ VPN**

---

## Відкрити порти в брандмауері

```powershell
# PPTP
New-NetFirewallRule -DisplayName "PPTP VPN" `
  -Direction Inbound -Protocol TCP -LocalPort 1723 -Action Allow
New-NetFirewallRule -DisplayName "PPTP GRE" `
  -Direction Inbound -Protocol 47 -Action Allow

# SSTP
New-NetFirewallRule -DisplayName "SSTP VPN" `
  -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

---

## Дозволити користувачу підключення

`Управління комп'ютером` → **Локальні користувачі** → ПКМ → **Властивості** → **Вхідні дзвінки** → **Дозволити доступ**

---

## Підключення клієнта

```powershell
Add-VpnConnection -Name "Домашній VPN" `
  -ServerAddress "your.server.ip" `
  -TunnelType Pptp `
  -AuthenticationMethod MSChapv2 `
  -RememberCredential $true

rasdial "Домашній VPN" username password
```

---

## Часті питання

### PPTP безпечний у 2026?

PPTP має відомі криптографічні слабкості. Використовуй SSTP або IKEv2 для виробничих середовищ. PPTP прийнятний тільки для внутрішніх довірених мереж.

### Потрібен Windows Server або Windows 10 підійде?

Windows 10/11 Pro підтримує 1 одночасне підключення. Windows Server не має обмежень. Для домашнього використання — достатньо.

### Чи можна використовувати WireGuard замість?

Так — і це рекомендовано. WireGuard безкоштовний, сучасний і швидший. wireguard.com — набагато простіше налаштувати ніж RRAS.

---

## Резюме

RRAS для сервера, IP пул для клієнтів, дозвіл dial-in для користувачів, відкрити порти в брандмауері. PPTP найпростіший але менш безпечний. SSTP вимагає SSL сертифікат. WireGuard — найкраща альтернатива для дому.
