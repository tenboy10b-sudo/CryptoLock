---
title: "Брандмауер Windows: налаштування правил для програм і портів"
date: "2026-06-16"
publishDate: "2026-06-16"
description: "Як налаштувати брандмауер Windows: дозволити або заблокувати програму, відкрити або закрити порт, створити правила через GUI і PowerShell."
tags: ["безпека", "windows", "мережа", "адміністрування", "powershell"]
readTime: 6
---

Брандмауер Windows — вбудований фільтр мережевого трафіку. Правильно налаштований він блокує небажані підключення не ламаючи потрібні програми.

---

## Відкрити налаштування брандмауера

**Простий інтерфейс:**
`Пуск` → `Безпека Windows` → `Брандмауер і захист мережі`

**Розширений інтерфейс (для правил):**
`Win + R` → `wf.msc`

---

## Дозволити або заблокувати програму

### Через простий інтерфейс

`Безпека Windows` → `Брандмауер і захист мережі` → **Дозволити роботу програми через брандмауер** → **Змінити параметри** → знайди програму або натисни **Дозволити іншу програму**

### Через розширений інтерфейс (wf.msc)

1. Відкрий `wf.msc`
2. **Правила для вхідних підключень** → **Нове правило**
3. Тип: **Програма**
4. Вкажи шлях до .exe
5. Дія: **Дозволити підключення** або **Заблокувати**
6. Профілі: вибери Domain, Private, Public
7. Назва і опис

---

## Відкрити або закрити порт

### Через wf.msc

1. **Правила для вхідних підключень** → **Нове правило**
2. Тип: **Порт**
3. Протокол: TCP або UDP
4. Конкретні порти: наприклад `3389` (RDP) або `80,443` (HTTP/HTTPS)
5. Дія: **Дозволити** або **Заблокувати**

### Через PowerShell

```powershell
# Відкрити TCP порт 8080
New-NetFirewallRule `
  -DisplayName "Allow TCP 8080" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 8080 `
  -Action Allow

# Відкрити UDP порт для WireGuard
New-NetFirewallRule `
  -DisplayName "WireGuard VPN" `
  -Direction Inbound `
  -Protocol UDP `
  -LocalPort 51820 `
  -Action Allow

# Заблокувати вихідне підключення до конкретного IP
New-NetFirewallRule `
  -DisplayName "Block Outbound IP" `
  -Direction Outbound `
  -RemoteAddress "185.220.101.0/24" `
  -Action Block

# Видалити правило
Remove-NetFirewallRule -DisplayName "Allow TCP 8080"
```

---

## Заблокувати програму від доступу до мережі

```powershell
# Заблокувати вихідний трафік для конкретної програми
New-NetFirewallRule `
  -DisplayName "Block Chrome Outbound" `
  -Direction Outbound `
  -Program "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  -Action Block

# Заблокувати і вхідний і вихідний
foreach ($dir in @("Inbound", "Outbound")) {
    New-NetFirewallRule `
        -DisplayName "Block App $dir" `
        -Direction $dir `
        -Program "C:\path\to\app.exe" `
        -Action Block
}
```

---

## Корисні команди для діагностики

```powershell
# Переглянути всі активні правила
Get-NetFirewallRule | Where-Object { $_.Enabled -eq "True" } |
  Select-Object DisplayName, Direction, Action, Profile |
  Format-Table -AutoSize

# Знайти правило за іменем
Get-NetFirewallRule -DisplayName "*RDP*"

# Переглянути правила для конкретного порту
Get-NetFirewallRule |
  Get-NetFirewallPortFilter |
  Where-Object { $_.LocalPort -eq "3389" }

# Вимкнути правило
Disable-NetFirewallRule -DisplayName "Allow TCP 8080"

# Увімкнути правило
Enable-NetFirewallRule -DisplayName "Allow TCP 8080"

# Перевірити чи порт слухає
Test-NetConnection -ComputerName localhost -Port 3389
```

---

## Профілі брандмауера

Windows має три профілі — правила можна застосовувати до одного або всіх:

| Профіль | Коли активний |
|---------|--------------|
| **Domain** | ПК підключений до домену Active Directory |
| **Private** | Домашня або офісна мережа (довірена) |
| **Public** | Публічна мережа (кафе, аеропорт) |

Для максимального захисту в публічних мережах — заблокуй вхідні підключення в профілі Public:

```powershell
Set-NetFirewallProfile -Profile Public -DefaultInboundAction Block
```

---

## Типові сценарії

### Відкрити RDP (віддалений робочий стіл)

```powershell
New-NetFirewallRule `
  -DisplayName "Remote Desktop" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 3389 `
  -Action Allow `
  -Profile Domain,Private
```

Детальніше: [Налаштування Remote Desktop](/nalashtuvannya-remote-desktop-rdp)

### Дозволити ping (ICMP)

```powershell
New-NetFirewallRule `
  -DisplayName "Allow ICMPv4" `
  -Direction Inbound `
  -Protocol ICMPv4 `
  -IcmpType 8 `
  -Action Allow
```

### Заблокувати весь вхідний трафік крім дозволених правил

```powershell
Set-NetFirewallProfile -Profile Private -DefaultInboundAction Block
```

---

## Скидання брандмауера до стандартних налаштувань

Якщо правила заплутались і щось перестало працювати:

```cmd
netsh advfirewall reset
```

Або через GUI: `wf.msc` → клікни правою на **Брандмауер Windows у режимі підвищеної безпеки** → **Відновити політику за замовчуванням**

---

## Підсумок

`wf.msc` — для одиничних правил через GUI. PowerShell `New-NetFirewallRule` — для скриптів і масового розгортання. Завжди вказуй профіль (Domain/Private/Public) щоб правило спрацьовувало тільки в потрібних мережах.
