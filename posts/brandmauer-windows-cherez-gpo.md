---
title: "Як налаштувати брандмауер Windows через GPO"
date: "2026-04-04"
description: "Управління Windows Firewall через Group Policy: правила вхідних і вихідних з'єднань, блокування програм і портів для всіх ПК."
tags: ["firewall", "gpo", "групова-політика", "безпека"]
readTime: 6
---

Windows Firewall через GPO дозволяє задати єдині правила для всієї організації — заблокувати порти, дозволити тільки корпоративні програми або обмежити вихідний трафік.

## Де знаходяться налаштування Firewall у GPO

`gpedit.msc` → перейди:
```
Computer Configuration
  → Windows Settings
    → Security Settings
      → Windows Defender Firewall with Advanced Security
```

---

## Базові профілі Firewall

Windows Firewall має три профілі:
- **Domain** — коли ПК у домені AD
- **Private** — домашня або робоча мережа
- **Public** — публічна мережа (кафе, аеропорт)

Клікни правою кнопкою → **Properties** → налаштуй кожен профіль окремо.

---

## Заблокувати вхідні з'єднання за замовчуванням

У Properties кожного профілю:
- **Inbound connections:** Block (default)
- **Outbound connections:** Allow (default)
- **Firewall state:** On

---

## Створити правило — дозволити порт

**Inbound Rules** → правий клік → **New Rule**:

1. **Rule Type:** Port
2. **Protocol:** TCP або UDP
3. **Port:** введи номер (наприклад `443` для HTTPS)
4. **Action:** Allow the connection
5. **Profile:** вибери потрібний
6. **Name:** наприклад "Allow HTTPS 443"

---

## Заблокувати конкретну програму

**Outbound Rules** → **New Rule**:

1. **Rule Type:** Program
2. **Program path:** `C:\Users\*\AppData\Local\Telegram Desktop\Telegram.exe`
3. **Action:** Block the connection
4. **Name:** "Block Telegram"

---

## Заблокувати всі вихідні крім дозволених

Це жорстка конфігурація для максимальної безпеки.

У Properties → **Outbound connections:** Block.

Потім створюй дозвільні правила для кожного потрібного додатка:
- `C:\Windows\System32\svchost.exe` — системні служби
- `C:\Program Files\Google\Chrome\Application\chrome.exe` — браузер

---

## Перевірка через PowerShell

```powershell
# Список активних правил
Get-NetFirewallRule | Where-Object {$_.Enabled -eq "True"} | Select-Object DisplayName, Direction, Action

# Правила для конкретного порту
Get-NetFirewallPortFilter | Where-Object {$_.LocalPort -eq "443"}

# Статус Firewall
Get-NetFirewallProfile | Select-Object Name, Enabled, DefaultInboundAction
```

---

## Швидке тестування блокування

```cmd
telnet google.com 80
```
Якщо `Connection refused` — правило працює. Якщо підключився — порт відкритий.

Якщо telnet не встановлений:
```powershell
Test-NetConnection google.com -Port 80
```
