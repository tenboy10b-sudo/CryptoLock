---
title: "Як призначити статичний IP комп'ютеру в локальній мережі"
date: "2026-02-06"
publishDate: "2026-02-06"
description: "Два способи задати постійну IP-адресу ПК: через налаштування Windows або резервування на роутері. Коли потрібна статична IP і як налаштувати правильно."
tags: ["windows", "мережа", "налаштування", "адміністрування"]
readTime: 4
---

Статична IP-адреса потрібна коли підключаєшся до ПК по RDP, налаштовуєш спільний доступ до файлів або пробрасуєш порти. Ось два правильних способи це зробити.

---

## Спосіб 1: Резервування на роутері (рекомендовано)

Роутер призначає IP по MAC-адресі пристрою — ПК продовжує отримувати IP автоматично, але завжди той самий.

**Знайти MAC-адресу:**
```powershell
Get-NetAdapter | Where-Object {$_.Status -eq "Up"} |
  Select-Object Name, MacAddress
```

**Налаштування на роутері:**
1. Зайди в адмін-панель роутера (зазвичай 192.168.1.1)
2. Знайди **DHCP** → **Address Reservation** або **Static Lease**
3. Введи MAC-адресу і бажану IP (наприклад 192.168.1.100)
4. Збережи → перезавантаж роутер або від'єднай/підключи ПК

Перевага: легко змінити, не треба налаштовувати кожен пристрій окремо.

---

## Спосіб 2: Статична IP в Windows

Налаштовується безпосередньо на адаптері ПК.

**Через Параметри:**
`Win + I` → **Мережа і Інтернет** → вибери адаптер → **Призначення IP-адреси** → **Редагувати** → **Вручну** → увімкни IPv4:

- **IP-адреса**: 192.168.1.100 (вільна адреса в твоїй мережі)
- **Маска підмережі**: 255.255.255.0
- **Шлюз**: 192.168.1.1 (адреса роутера)
- **DNS**: 1.1.1.1 (або IP роутера)

**Через PowerShell:**
```powershell
# Знайти ім'я адаптера
Get-NetAdapter | Select-Object Name, Status

# Задати статичну IP
New-NetIPAddress -InterfaceAlias "Ethernet" `
  -IPAddress "192.168.1.100" `
  -PrefixLength 24 `
  -DefaultGateway "192.168.1.1"

# Задати DNS
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" `
  -ServerAddresses ("1.1.1.1", "8.8.8.8")
```

**Через CMD:**
```cmd
netsh interface ip set address "Ethernet" static 192.168.1.100 255.255.255.0 192.168.1.1
netsh interface ip set dns "Ethernet" static 1.1.1.1
```

---

## Повернути автоматичне отримання IP

```powershell
# Видалити статичну IP і повернути DHCP
Remove-NetIPAddress -InterfaceAlias "Ethernet" -Confirm:$false
Remove-NetRoute -InterfaceAlias "Ethernet" -Confirm:$false
Set-NetIPInterface -InterfaceAlias "Ethernet" -Dhcp Enabled
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ResetServerAddresses
```

---

## Як вибрати IP щоб не було конфліктів

- Дізнайся діапазон DHCP на роутері (зазвичай 192.168.1.100-200)
- Вибери IP **поза цим діапазоном** (наприклад 192.168.1.50)
- Або перед призначенням перевір що адреса вільна:

```powershell
Test-NetConnection -ComputerName 192.168.1.50 -InformationLevel Quiet
# False = адреса вільна
```

---

## Резюме

Для домашньої мережі: резервування на роутері по MAC-адресі — найзручніший спосіб. Для офісу або коли немає доступу до роутера: статична IP в Windows через `New-NetIPAddress`. Вибирай IP поза DHCP діапазоном щоб уникнути конфліктів.
