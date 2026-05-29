---
title: "Налаштування брандмауера Windows: правила, порти і PowerShell"
date: "2027-01-03"
publishDate: "2027-01-03"
description: "Як створювати і керувати правилами брандмауера Windows через GUI і PowerShell. Блокувати або дозволяти програми, порти і IP-адреси."
tags: ["windows", "firewall", "безпека", "мережа", "powershell"]
readTime: 5
translatesEn: "how-to-configure-windows-firewall"
---

Windows Defender Firewall контролює мережевий трафік. Ось як ним керувати ефективно.

---

## Перевірити статус брандмауера

```powershell
Get-NetFirewallProfile | Select-Object Name, Enabled, DefaultInboundAction
```

---

## Дозволити або заблокувати програму

```powershell
# Дозволити програму
New-NetFirewallRule -DisplayName "Allow Chrome" `
  -Direction Inbound -Program "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  -Action Allow -Profile Private,Public

# Заблокувати програму
New-NetFirewallRule -DisplayName "Block App" `
  -Direction Outbound -Program "C:\Apps\app.exe" `
  -Action Block
```

---

## Відкрити або закрити порт

```powershell
# Відкрити TCP порт 8080
New-NetFirewallRule -DisplayName "Allow 8080" `
  -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow

# Заблокувати порт 23 (Telnet)
New-NetFirewallRule -DisplayName "Block Telnet" `
  -Direction Inbound -Protocol TCP -LocalPort 23 -Action Block
```

---

## Обмежити доступ за IP

```powershell
# RDP тільки з конкретного IP
New-NetFirewallRule -DisplayName "RDP з офісу" `
  -Direction Inbound -Protocol TCP -LocalPort 3389 `
  -RemoteAddress "192.168.1.100" -Action Allow

# Заблокувати підозрілий IP
New-NetFirewallRule -DisplayName "Block IP" `
  -Direction Inbound -RemoteAddress "185.220.101.0/24" -Action Block
```

---

## Управління правилами

```powershell
# Список увімкнених правил
Get-NetFirewallRule -Direction Inbound -Enabled True |
  Select-Object DisplayName, Action | Sort-Object DisplayName

# Вимкнути правило
Disable-NetFirewallRule -DisplayName "Allow 8080"

# Видалити правило
Remove-NetFirewallRule -DisplayName "Allow 8080"
```

---

## Резервна копія та відновлення

```powershell
# Експортувати всі правила
netsh advfirewall export "C:\Backup\firewall.wfw"

# Відновити
netsh advfirewall import "C:\Backup\firewall.wfw"

# Скинути до стандартних
netsh advfirewall reset
```

---

## Часті питання

### Чи потрібно вмикати брандмауер Windows?

Так, завжди. Мінімальний вплив на продуктивність, блокує несанкціоновані підключення. Вимикати його для вирішення проблем — майже ніколи не допомагає.

### Як знайти яке правило блокує програму?

Увімкни логування: `Set-NetFirewallProfile -LogBlocked True`. Потім дивись `C:\Windows\System32\LogFiles\Firewall\pfirewall.log` на записи DROPPED.

---

## Резюме

`Get-NetFirewallProfile` — статус. `New-NetFirewallRule` — нове правило. Завжди вказуй Direction, Protocol і Action. Роби резервну копію перед масовими змінами.
