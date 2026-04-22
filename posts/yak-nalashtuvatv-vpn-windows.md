---
title: "Як налаштувати VPN на Windows 10 і 11 без сторонніх програм"
date: "2026-04-16"
description: "Підключення до VPN через вбудовані засоби Windows: L2TP/IPsec, PPTP і IKEv2 через Settings і PowerShell."
tags: ["vpn", "мережа", "приватність", "windows"]
readTime: 5
---

Windows має вбудовану підтримку VPN-протоколів. Можна підключитись до корпоративного або особистого VPN без встановлення додаткових програм.

## Підтримувані протоколи

| Протокол | Безпека | Швидкість |
|---|---|---|
| **IKEv2** | Висока | Висока — рекомендовано |
| **L2TP/IPsec** | Середня | Середня |
| **SSTP** | Висока | Середня |
| **PPTP** | Низька | Висока — не рекомендується |

---

## Налаштування через Settings

**Windows 11:**
`Win + I` → **Network & Internet** → **VPN** → **Add VPN**.

**Windows 10:**
`Win + I` → **Network & Internet** → **VPN** → **Add a VPN connection**.

Заповни поля:
- **VPN provider:** Windows (built-in)
- **Connection name:** довільна назва
- **Server name or address:** IP або hostname VPN-сервера
- **VPN type:** вибери протокол
- **Sign-in info:** Username and password або Certificate

---

## Налаштування L2TP/IPsec з Pre-shared key

Якщо VPN використовує L2TP з загальним ключем — в Settings цього не налаштувати. Потрібен реєстр:

```cmd
reg add "HKLM\SYSTEM\CurrentControlSet\Services\PolicyAgent" /v AssumeUDPEncapsulationContextOnSendRule /t REG_DWORD /d 2 /f
```

Після цього перезавантаж і підключайся до L2TP.

---

## Через PowerShell

```powershell
Add-VpnConnection -Name "Corp VPN" `
  -ServerAddress "vpn.company.com" `
  -TunnelType "IKEv2" `
  -AuthenticationMethod "EAP" `
  -EncryptionLevel "Required" `
  -RememberCredential $true
```

Для L2TP з PSK:
```powershell
Add-VpnConnection -Name "L2TP VPN" `
  -ServerAddress "vpn.example.com" `
  -TunnelType "L2tp" `
  -L2tpPsk "YourSharedKey" `
  -AuthenticationMethod "Chap" `
  -RememberCredential $true
```

---

## Split tunneling — тільки корпоративний трафік через VPN

За замовчуванням весь трафік іде через VPN. Щоб тільки корпоративний:

```powershell
Set-VpnConnection -Name "Corp VPN" -SplitTunneling $true
```

---

## Підключення з командного рядка

```cmd
rasdial "Corp VPN" username password
```

Відключення:
```cmd
rasdial "Corp VPN" /disconnect
```

---

## Автопідключення при запуску

Через Планувальник завдань або через PowerShell:
```powershell
$trigger = New-ScheduledTaskTrigger -AtLogon
$action = New-ScheduledTaskAction -Execute "rasdial" -Argument '"Corp VPN" user pass'
Register-ScheduledTask -TaskName "Auto VPN" -Trigger $trigger -Action $action -RunLevel Highest
```

---

## Перевірка підключення

```cmd
ipconfig
```

Якщо є адаптер PPP або IKEv2 з IP — VPN підключений.

```cmd
tracert 8.8.8.8
```

Якщо перший хоп — VPN-сервер, трафік іде через VPN.
