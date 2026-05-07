---
title: "Як підключити VPN на Windows 10 і 11 без сторонніх програм"
date: "2026-06-13"
publishDate: "2026-06-13"
description: "Налаштування VPN підключення в Windows через вбудовані засоби: L2TP/IPsec, PPTP і IKEv2. Покрокова інструкція через Параметри і PowerShell."
tags: ["windows", "мережа", "vpn", "налаштування"]
readTime: 5
---

Windows має вбудовану підтримку VPN — без додаткових програм. Якщо у тебе є сервер або корпоративний VPN — підключитись можна напряму через Параметри.

---

## Типи VPN в Windows

- **IKEv2** — найкращий варіант: швидкий, стабільний, автоматично перепідключається
- **L2TP/IPsec** — надійний, широко підтримується
- **PPTP** — застарілий, небезпечний, не рекомендується
- **SSTP** — використовує порт 443, проходить крізь більшість файрволів

---

## Додати VPN через Параметри

`Win + I` → **Мережа і Інтернет** → **VPN** → **Додати VPN**

Заповни поля:
- **Постачальник VPN**: Windows (вбудований)
- **Ім'я підключення**: будь-яка назва
- **Ім'я або адреса сервера**: IP або домен VPN сервера
- **Тип VPN**: IKEv2, L2TP/IPsec або інший
- **Тип даних для входу**: Ім'я користувача і пароль
- **Ім'я користувача і пароль**: від VPN сервера

Натисни **Зберегти** → клікни на підключення → **Підключити**.

---

## Через PowerShell

```powershell
# Додати IKEv2 VPN
Add-VpnConnection -Name "My VPN" `
  -ServerAddress "vpn.example.com" `
  -TunnelType IKEv2 `
  -AuthenticationMethod EAP `
  -EncryptionLevel Required `
  -RememberCredential $true

# Додати L2TP/IPsec з Pre-Shared Key
Add-VpnConnection -Name "Office VPN" `
  -ServerAddress "192.168.1.1" `
  -TunnelType L2tp `
  -L2tpPsk "YourPresharedKey" `
  -AuthenticationMethod MsChapv2 `
  -RememberCredential $true

# Підключитись
rasdial "My VPN" username password

# Відключитись
rasdial "My VPN" /disconnect

# Переглянути всі VPN підключення
Get-VpnConnection
```

---

## Split Tunneling

За замовчуванням весь трафік іде через VPN. Split tunneling відправляє через VPN тільки корпоративний трафік:

```powershell
# Увімкнути split tunneling
Set-VpnConnection -Name "My VPN" -SplitTunneling $true

# Перевірити статус
Get-VpnConnection -Name "My VPN" | Select-Object SplitTunneling
```

---

## Автопідключення при запуску

```powershell
# Підключатись при вході в систему через Task Scheduler
$action = New-ScheduledTaskAction -Execute "rasdial.exe" `
  -Argument '"My VPN" username password'
$trigger = New-ScheduledTaskTrigger -AtLogOn
Register-ScheduledTask -TaskName "VPN AutoConnect" `
  -Action $action -Trigger $trigger -Force
```

---

## Типові проблеми

**"Підключення не вдалось" з L2TP:**
L2TP/IPsec блокується за NAT за замовчуванням. Виправлення через реєстр:
```powershell
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\PolicyAgent" `
  -Name "AssumeUDPEncapsulationContextOnSendRule" -Value 2 -Type DWord
```
Перезавантаж після зміни.

**IKEv2 не підключається:**
Перевір що сертифікат сервера дійсний і дата/час на ПК правильні.

**VPN підключений але інтернету немає:**
Увімкни split tunneling або перевір налаштування DNS на стороні сервера.

---

## Резюме

Для корпоративного VPN: `Win + I` → Мережа → VPN → Додати VPN → вкажи дані від адміністратора. Для скриптування: `Add-VpnConnection` в PowerShell. IKEv2 — найкращий тип якщо сервер підтримує.
