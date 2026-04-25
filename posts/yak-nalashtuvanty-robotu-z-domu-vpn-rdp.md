---
title: "Робота з дому через VPN і RDP: налаштування і безпека"
date: "2026-06-25"
publishDate: "2026-06-25"
description: "Безпечне підключення до робочого ПК і корпоративної мережі з дому через VPN і RDP: налаштування, вибір інструментів і захист від несанкціонованого доступу."
tags: ["мережа", "безпека", "windows", "налаштування", "відновлення"]
readTime: 7
---

Після пандемії дистанційна робота стала нормою. Але підключення до офісу "як попало" — серйозна дира в безпеці. Ось як налаштувати правильно.

---

## Варіант 1: Корпоративний VPN + RDP

Найпоширеніша схема в корпораціях:
1. Підключаєшся до корпоративного VPN
2. VPN дає доступ до внутрішньої мережі
3. Через RDP підключаєшся до робочого ПК або сервера

### Налаштування RDP на робочому ПК

На робочому ПК в офісі (або попроси IT):

```powershell
# Увімкнути RDP
Set-ItemProperty "HKLM:\System\CurrentControlSet\Control\Terminal Server" -Name "fDenyTSConnections" -Value 0

# Відкрити порт у брандмауері
Enable-NetFirewallRule -DisplayGroup "Remote Desktop"

# Перевірити що RDP слухає
Test-NetConnection localhost -Port 3389
```

Або: `Параметри` → `Система` → `Віддалений робочий стіл` → увімкни.

### Підключення через RDP

`Win + R` → `mstsc` → введи IP робочого ПК і ім'я користувача.

Детальніше: [Налаштування Remote Desktop](/nalashtuvannya-remote-desktop-rdp)

---

## Варіант 2: WireGuard — швидкий і сучасний VPN

Якщо ти адміністратор і налаштовуєш VPN для команди — WireGuard значно краще ніж OpenVPN:
- В 3–5 разів швидший
- Простіша конфігурація
- Менша затримка

### Сервер (Windows Server або Linux)

**На Windows Server:**

```powershell
# Завантажити WireGuard
winget install WireGuard.WireGuard

# Згенерувати ключі
wg genkey | Tee-Object -Variable privateKey | wg pubkey | Set-Variable publicKey

# Конфіг сервера (C:\WireGuard\wg0.conf)
$config = @"
[Interface]
PrivateKey = $privateKey
Address = 10.0.0.1/24
ListenPort = 51820

[Peer]
PublicKey = CLIENT_PUBLIC_KEY
AllowedIPs = 10.0.0.2/32
"@
$config | Out-File "C:\WireGuard\wg0.conf"
```

### Клієнт (Windows)

1. Встанови WireGuard: wireguard.com
2. **Add Tunnel** → вставни конфіг від адміністратора:

```ini
[Interface]
PrivateKey = CLIENT_PRIVATE_KEY
Address = 10.0.0.2/24
DNS = 8.8.8.8

[Peer]
PublicKey = SERVER_PUBLIC_KEY
Endpoint = server-ip:51820
AllowedIPs = 192.168.1.0/24  # тільки офісна мережа
PersistentKeepalive = 25
```

3. **Activate** — підключено

---

## Варіант 3: Microsoft Entra ID + Azure VPN (для корпорацій)

Для організацій що використовують Microsoft 365 — Azure AD Application Proxy або Azure VPN Gateway дозволяють безпечний доступ до внутрішніх ресурсів без окремого VPN-сервера.

Налаштовується в **Azure Portal** → Virtual Network Gateway.

---

## Безпека при дистанційній роботі

### NLA для RDP (обов'язково)

Network Level Authentication — вимагає автентифікацію до встановлення сесії:

```powershell
# Перевірити чи увімкнено NLA
(Get-WmiObject -Class Win32_TSGeneralSetting -Namespace Root\CIMv2\TerminalServices).UserAuthenticationRequired

# Увімкнути NLA
Set-WmiInstance -Path (Get-WmiObject -Class Win32_TSGeneralSetting -Namespace Root\CIMv2\TerminalServices -Filter "TerminalName='RDP-tcp'" -ErrorAction Stop).__PATH -Argument @{UserAuthenticationRequired=1}
```

### Зміни порт RDP з 3389

Боти постійно сканують порт 3389. Зміна порту — базовий захист:

```powershell
$newPort = 52389
Set-ItemProperty "HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" -Name "PortNumber" -Value $newPort -Type DWord

# Оновити правило брандмауера
Remove-NetFirewallRule -DisplayName "Remote Desktop" -ErrorAction SilentlyContinue
New-NetFirewallRule -DisplayName "RDP Custom Port" -Direction Inbound -Protocol TCP -LocalPort $newPort -Action Allow
```

### Обмежити доступ по IP

```powershell
# Дозволити RDP тільки з VPN-підмережі
$rule = Get-NetFirewallRule -DisplayName "RDP Custom Port"
Set-NetFirewallRule -InputObject $rule -RemoteAddress "10.0.0.0/24"
```

### Двофакторна автентифікація для RDP

Для корпоративного середовища з Azure AD — Microsoft Authenticator може бути другим фактором для RDP через Azure AD Join.

Для Windows Server без Azure — **Duo Security** або **Microsoft Remote Desktop Gateway** з MFA.

---

## Перевірка активних RDP сесій

```powershell
# Переглянути активні сесії
query session

# Або через PowerShell
Get-RDUserSession -ConnectionBroker "server-name" -ErrorAction SilentlyContinue

# Переглянути хто підключений через netstat
netstat -an | findstr :3389
```

---

## Часті проблеми

### "Не вдається підключитись до вашого комп'ютера"

```cmd
rem Перевірити чи RDP слухає
netstat -an | findstr :3389

rem Перевірити брандмауер
netsh advfirewall firewall show rule name="Remote Desktop"
```

### Повільний RDP через VPN

- Знизь якість відображення: у `mstsc` → **Відображення** → понизь глибину кольорів до 16 біт
- Вимкни фонові малюнки: **Взаємодія** → зніми всі прапорці крім "Шрифти ClearType"

---

## Підсумок

Мінімальний захист для дистанційної роботи: VPN + RDP з NLA увімкненим + зміна порту з 3389. Ніколи не відкривай RDP напряму в інтернет без VPN або без зміни порту і обмеження по IP — боти знаходять відкритий 3389 за години.
