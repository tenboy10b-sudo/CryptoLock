---
title: "Як встановити статичний IP в Windows 10 і 11"
date: "2026-05-23"
publishDate: "2026-05-23"
description: "Налаштування статичного IP в Windows через Параметри, Панель керування і PowerShell. IP-адреса, маска підмережі, шлюз і DNS без DHCP."
tags: ["windows", "мережа", "ip", "dns", "адміністрування"]
readTime: 3
translatesEn: "how-to-configure-static-ip-windows-11"
---

Статичний IP гарантує що ПК завжди має одну і ту саму адресу — корисно для серверів, RDP і мережевих правил.

---

## Через Параметри (Windows 11)

`Win + I` → **Мережа та Інтернет** → **Ethernet** або **Wi-Fi** → клікни підключення → **Редагувати** біля "Призначення IP"

- Призначення IP: **Вручну**
- IPv4: Увімкнено
- IP-адреса: `192.168.1.100`
- Довжина префіксу: `24`
- Шлюз: `192.168.1.1`
- DNS: `1.1.1.1` і `8.8.8.8`

---

## Через PowerShell

```powershell
# Знайти ім'я адаптера
Get-NetAdapter | Select-Object Name, Status

# Встановити статичний IP
New-NetIPAddress -InterfaceAlias "Ethernet" `
  -IPAddress "192.168.1.100" `
  -PrefixLength 24 `
  -DefaultGateway "192.168.1.1"

# Встановити DNS
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" `
  -ServerAddresses ("1.1.1.1", "8.8.8.8")
```

---

## Повернутись на DHCP

```powershell
Set-NetIPInterface -InterfaceAlias "Ethernet" -Dhcp Enabled
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ResetServerAddresses
ipconfig /release
ipconfig /renew
```

---

## Поради

- Вибирай адресу поза діапазоном DHCP роутера (зазвичай .100-.200)
- Статичні адреси: `.2` до `.99`
- Перевір діапазон DHCP в адмін-панелі роутера

---

## Часті питання

### Статичний IP сповільнює підключення?

Ні. Статичний vs DHCP — тільки спосіб призначення адреси, не впливає на швидкість.

### Яка маска для /24?

255.255.255.0 = /24. Найпоширеніша маска для домашніх і офісних мереж.

---

## Резюме

Параметри → Мережа → редагувати IP для GUI. PowerShell `New-NetIPAddress` для скриптів. Обирай IP поза DHCP діапазоном роутера.
