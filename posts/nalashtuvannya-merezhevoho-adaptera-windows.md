---
title: "Налаштування мережевого адаптера Windows 10 і 11 через PowerShell"
date: "2026-07-19"
publishDate: "2026-07-19"
description: "Налаштування мережевих адаптерів Windows. IPv4, IPv6, DNS, MTU, дуплекс і швидкість. Вимкнення невикористовуваних адаптерів і діагностика через PowerShell."
tags: ["windows", "мережа", "адаптер", "ip", "адміністрування", "powershell"]
readTime: 4
translatesEn: "how-to-configure-windows-network-adapter"
---

Налаштування мережевих адаптерів контролюють як ПК комунікує в мережі.

---

## Переглянути адаптери

```powershell
Get-NetAdapter | Select-Object Name, Status, MacAddress, LinkSpeed

# Тільки підключені
Get-NetAdapter | Where-Object {$_.Status -eq "Up"}
```

---

## Увімкнути і вимкнути

```powershell
Disable-NetAdapter -Name "Wi-Fi" -Confirm:$false
Enable-NetAdapter -Name "Wi-Fi" -Confirm:$false
Restart-NetAdapter -Name "Ethernet"
```

---

## Налаштувати IP

```powershell
# Статичний IP
New-NetIPAddress -InterfaceAlias "Ethernet" `
  -IPAddress "192.168.1.50" -PrefixLength 24 `
  -DefaultGateway "192.168.1.1"

# DNS
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" `
  -ServerAddresses ("1.1.1.1", "8.8.8.8")

# Повернутись на DHCP
Set-NetIPInterface -InterfaceAlias "Ethernet" -Dhcp Enabled
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ResetServerAddresses
```

---

## Розширені параметри

```powershell
# Вимкнути Energy Efficient Ethernet (виправляє випадкові відключення)
Set-NetAdapterAdvancedProperty -Name "Ethernet" `
  -DisplayName "Energy Efficient Ethernet" -DisplayValue "Disabled"

# Вимкнути Wake on LAN
Set-NetAdapterAdvancedProperty -Name "Ethernet" `
  -DisplayName "Wake on Magic Packet" -DisplayValue "Disabled"
```

---

## MTU

```powershell
# Перевірити
Get-NetIPInterface -InterfaceAlias "Ethernet" | Select-Object NlMtu

# Встановити
Set-NetIPInterface -InterfaceAlias "Ethernet" -NlMtuBytes 1500
```

---

## Часті питання

### Адаптер показує "Невизначена мережа" — як виправити?

Зазвичай відсутній шлюз або невідповідність DNS. Перевір: `Get-NetIPConfiguration`. Встанови правильний шлюз і DNS.

### Адаптер зник після оновлення Windows?

Диспетчер пристроїв → Вигляд → Показати приховані пристрої. Якщо є але неактивний — увімкни. Якщо відсутній: `pnputil /scan-devices`.

---

## Резюме

`Get-NetAdapter` для перегляду. `New-NetIPAddress` для IP. `Set-DnsClientServerAddress` для DNS. `Set-NetAdapterAdvancedProperty` для розширених. `netsh int ip reset` для скидання.
