---
title: "Як перевірити що Windows відправляє в інтернет"
date: "2026-04-27"
publishDate: "2026-04-27"
description: "Інструменти для перевірки мережевого трафіку Windows: які сервери з'єднує система, скільки даних відправляє і як заблокувати небажані підключення."
tags: ["windows", "приватність", "мережа", "безпека"]
readTime: 4
---

Цікаво що Windows відправляє в фоні? Ось як це перевірити і контролювати.

---

## Перегляд активних підключень

```powershell
# Всі активні TCP підключення з іменами процесів
Get-NetTCPConnection -State Established |
  Select-Object LocalPort, RemoteAddress, RemotePort,
    @{n='Process';e={(Get-Process -Id $_.OwningProcess -EA 0).Name}} |
  Sort-Object Process | Format-Table

# Тільки зовнішні (не локальні) підключення
Get-NetTCPConnection -State Established |
  Where-Object {$_.RemoteAddress -notmatch '^(127\.|10\.|192\.168\.|172\.1[6-9]\.|172\.2[0-9]\.|172\.3[0-1]\.)' -and $_.RemoteAddress -ne '::1'} |
  Select-Object @{n='Process';e={(Get-Process -Id $_.OwningProcess -EA 0).Name}}, RemoteAddress, RemotePort |
  Sort-Object Process
```

---

## Що підключається при запуску Windows

Завантаж **TCPView** від Sysinternals (безкоштовний):
`learn.microsoft.com/sysinternals` → TCPView

Запусти одразу після завантаження — побачиш список всіх підключень з іменами процесів.

**Типові системні підключення** (нормально):
- `svchost.exe` → Microsoft сервери (оновлення, активація, телеметрія)
- `MsMpEng.exe` → Windows Defender → антивірусні сервери Microsoft
- `SearchApp.exe` → Bing search
- `RuntimeBroker.exe` → Microsoft Store

---

## Кількість відправлених даних

```powershell
# Статистика по адаптерах
Get-NetAdapterStatistics | Select-Object Name,
  @{n='Sent MB';e={[math]::Round($_.SentBytes/1MB,1)}},
  @{n='Received MB';e={[math]::Round($_.ReceivedBytes/1MB,1)}}

# Скидання лічильника (після перезавантаження)
```

---

## Wireshark для глибокого аналізу

Wireshark показує кожен пакет з вмістом (незашифрованим):

1. Завантаж з wireshark.org
2. Вибери мережевий адаптер → Start
3. Введи фільтр: `ip.addr == 13.107.42.14` (IP сервера що цікавить)

Для перегляду тільки нешифрованого трафіку: фільтр `http` або `dns`.

---

## Заблокувати підозрілий процес через брандмауер

```powershell
# Заблокувати вихідний трафік конкретної програми
New-NetFirewallRule -DisplayName "Block Suspicious App" `
  -Direction Outbound `
  -Program "C:\Path\To\App.exe" `
  -Action Block

# Заблокувати підключення до конкретного IP
New-NetFirewallRule -DisplayName "Block Remote IP" `
  -Direction Outbound `
  -RemoteAddress "1.2.3.4" `
  -Action Block

# Переглянути правила що блокують
Get-NetFirewallRule | Where-Object {$_.Action -eq 'Block' -and $_.Enabled -eq 'True'} |
  Select-Object DisplayName, Direction
```

---

## Зменшити телеметрію Windows

```powershell
# Зупинити службу телеметрії
Stop-Service DiagTrack -Force
Set-Service DiagTrack -StartupType Disabled

# Мінімальний рівень телеметрії
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" `
  -Name "AllowTelemetry" -Value 1 -Type DWord

# Вимкнути Delivery Optimization (обмін частинами оновлень)
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DeliveryOptimization" `
  -Name "DODownloadMode" -Value 0 -Type DWord
```

---


---

## 🛡️ Перевір безпеку свого ПК

Хочеш знати чи немає витоків даних, зайвих служб або підозрілих програм на твоєму ПК?

**[→ AuditShield](/tools/auditshield)** — аудит Windows по 22 напрямках за 10 хвилин. HTML-звіт з оцінкою ризику. Є безкоштовне демо.


## Резюме

Для швидкого перегляду: PowerShell `Get-NetTCPConnection` або TCPView. Для детального аналізу: Wireshark. Для блокування: `New-NetFirewallRule -Direction Outbound -Program ... -Action Block`. Для зменшення телеметрії: вимкни DiagTrack і встанови мінімальний рівень через реєстр.
