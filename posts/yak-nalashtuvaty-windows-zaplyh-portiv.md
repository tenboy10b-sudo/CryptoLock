---
title: "Як перевірити відкриті порти Windows і що їх слухає"
date: "2026-11-28"
publishDate: "2026-11-28"
description: "Як переглянути які порти відкриті на Windows, які процеси їх слухають і як закрити небажані порти через брандмауер."
tags: ["windows", "мережа", "безпека", "діагностика"]
readTime: 4
---

Відкриті порти — потенційні точки входу для атак. Ось як перевірити що слухає на твоєму ПК і як закрити непотрібне.

---

## Переглянути відкриті порти

```powershell
# Всі порти що слухають з іменами процесів
Get-NetTCPConnection -State Listen |
  Select-Object LocalAddress, LocalPort,
    @{n='Process';e={(Get-Process -Id $_.OwningProcess -EA 0).Name}},
    @{n='PID';e={$_.OwningProcess}} |
  Sort-Object LocalPort | Format-Table

# UDP порти
Get-NetUDPEndpoint |
  Select-Object LocalAddress, LocalPort,
    @{n='Process';e={(Get-Process -Id $_.OwningProcess -EA 0).Name}} |
  Sort-Object LocalPort | Format-Table
```

---

## Через CMD (класичний спосіб)

```cmd
rem TCP і UDP всі стани
netstat -ano

rem Тільки порти що слухають, з іменами
netstat -b -ano | findstr LISTENING
```

---

## Стандартні порти Windows

| Порт | Протокол | Для чого |
|------|---------|---------|
| 135 | TCP | RPC Endpoint Mapper |
| 139, 445 | TCP | SMB (спільні папки) |
| 3389 | TCP | RDP (Remote Desktop) |
| 5985 | TCP | WinRM HTTP |
| 5986 | TCP | WinRM HTTPS |
| 7680 | TCP | Delivery Optimization |

Ці порти нормальні для Windows. Все що не впізнаєш — перевір.

---

## Перевірити конкретний порт

```powershell
# Чи слухає щось на порті 3389
Test-NetConnection -ComputerName localhost -Port 3389

# Який процес займає порт
Get-NetTCPConnection -LocalPort 3389 -State Listen |
  Select-Object @{n='Process';e={(Get-Process -Id $_.OwningProcess).Name}}, OwningProcess
```

---

## Перевірити порт ззовні

```powershell
# З іншого ПК в мережі перевірити чи відкритий порт
Test-NetConnection -ComputerName 192.168.1.100 -Port 3389
```

Або використай онлайн-сервіс типу canyouseeme.org для перевірки з інтернету.

---

## Закрити порт через брандмауер

```powershell
# Заблокувати вхідний трафік на порт 3389 (RDP)
New-NetFirewallRule -DisplayName "Block RDP" `
  -Direction Inbound -Protocol TCP -LocalPort 3389 -Action Block

# Або вимкнути конкретну службу що відкриває порт
# RDP:
Set-ItemProperty -Path "HKLM:\System\CurrentControlSet\Control\Terminal Server" `
  -Name "fDenyTSConnections" -Value 1

# WinRM:
Disable-PSRemoting -Force
Stop-Service WinRM
Set-Service WinRM -StartupType Disabled
```

---

## Знайти і зупинити невідомий процес на порту

```powershell
# Знайти процес на підозрілому порту (наприклад 12345)
$conn = Get-NetTCPConnection -LocalPort 12345 -State Listen -ErrorAction SilentlyContinue
if ($conn) {
  $proc = Get-Process -Id $conn.OwningProcess
  Write-Host "Port 12345 used by: $($proc.Name) (PID: $($proc.Id))"
  Write-Host "Path: $($proc.Path)"

  # Зупинити якщо підозрілий
  # Stop-Process -Id $proc.Id -Force
}
```

---

## Мінімізувати атакову поверхню

```powershell
# Порти що часто не потрібні домашньому ПК — заблокувати вхідний трафік
$portsToBlock = @(135, 139, 445, 5985)

foreach ($port in $portsToBlock) {
  New-NetFirewallRule -DisplayName "Block port $port inbound" `
    -Direction Inbound -Protocol TCP -LocalPort $port `
    -Action Block -ErrorAction SilentlyContinue
  Write-Host "Blocked port $port"
}
```

**Обережно:** порт 445 потрібен для спільного доступу до файлів. Блокуй тільки якщо не використовуєш мережевий обмін файлами.

---


---

## 🛡️ Перевір безпеку свого ПК

Хочеш знати чи немає витоків даних, зайвих служб або підозрілих програм на твоєму ПК?

**[→ AuditShield](/tools/auditshield)** — аудит Windows по 22 напрямках за 10 хвилин. HTML-звіт з оцінкою ризику. Є безкоштовне демо.


## Резюме

`Get-NetTCPConnection -State Listen` — список всіх відкритих портів з процесами. Незнайомий порт: знайди процес → перевір в Google → зупини якщо підозрілий. Для закриття порту: `New-NetFirewallRule` або вимкни службу що його відкриває.
