---
title: "Як перевірити чи відкритий порт в Windows: netstat, Test-NetConnection і telnet"
date: "2026-01-10"
publishDate: "2026-01-10"
description: "Перевірка відкритих портів на локальному ПК і віддалених серверах в Windows: netstat, Test-NetConnection, telnet і онлайн сканери. Як відкрити порт у брандмауері."
tags: ["мережа", "cmd", "powershell", "windows", "адміністрування", "діагностика"]
readTime: 5
---

Програма не може підключитись, сервіс не відповідає — часто причина у закритому порті. Ось як швидко перевірити і виправити.

---

## Перевірити порти на локальному ПК

```cmd
rem Всі відкриті TCP порти
netstat -an | findstr LISTENING

rem Знайти конкретний порт
netstat -an | findstr :3389

rem З ім'ям процесу що тримає порт
netstat -anob | findstr :80
```

```powershell
# Всі порти що слухають з ім'ям процесу
Get-NetTCPConnection -State Listen |
  Select-Object LocalPort,
    @{N="Process"; E={(Get-Process -Id $_.OwningProcess -EA SilentlyContinue).Name}} |
  Sort-Object LocalPort |
  Format-Table -AutoSize

# Перевірити конкретний порт
Get-NetTCPConnection -LocalPort 443 -ErrorAction SilentlyContinue
```

---

## Перевірити порт на віддаленому сервері

```powershell
# Test-NetConnection — найкраща заміна telnet
Test-NetConnection -ComputerName "192.168.1.10" -Port 3389

# Коротка версія
tnc google.com -Port 443

# Результат:
# TcpTestSucceeded : True  — порт відкритий
# TcpTestSucceeded : False — порт закритий або недоступний
```

```cmd
rem Telnet (якщо встановлений)
telnet 192.168.1.10 3389
rem Якщо чорний екран — порт відкритий
rem Якщо "Не вдається підключитись" — закритий
```

---

## Увімкнути Telnet (якщо потрібен)

```powershell
# Встановити клієнт Telnet
Enable-WindowsOptionalFeature -Online -FeatureName TelnetClient
```

---

## Сканування діапазону портів

```powershell
# Перевірити кілька портів на одному хості
$ports = @(22, 80, 443, 3389, 8080)
$host = "192.168.1.10"

foreach ($port in $ports) {
    $result = Test-NetConnection $host -Port $port -WarningAction SilentlyContinue
    $status = if ($result.TcpTestSucceeded) { "ВІДКРИТИЙ" } else { "ЗАКРИТИЙ" }
    Write-Output "Port $port : $status"
}
```

---

## Відкрити порт у брандмауері

```powershell
# Відкрити TCP порт 8080 для вхідних підключень
New-NetFirewallRule `
  -DisplayName "Open Port 8080" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 8080 `
  -Action Allow

# Перевірити що правило створено
Get-NetFirewallRule -DisplayName "Open Port 8080"
```

Детальніше: [Брандмауер Windows — налаштування правил](/windows-firewall-nalashtuvannya-pravyl)

---

## Закрити порт (заблокувати вхідний трафік)

```powershell
# Заблокувати вхідний трафік на конкретний порт
New-NetFirewallRule -DisplayName "Block port 3389" `
  -Direction Inbound -Protocol TCP -LocalPort 3389 -Action Block
```

Або вимкни саму службу, що відкриває порт:

```powershell
# RDP (порт 3389)
Set-ItemProperty -Path "HKLM:\System\CurrentControlSet\Control\Terminal Server" `
  -Name "fDenyTSConnections" -Value 1

# WinRM (порти 5985/5986)
Disable-PSRemoting -Force
Stop-Service WinRM
Set-Service WinRM -StartupType Disabled
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

Ці порти нормальні для Windows. Усе, що не впізнаєш серед відкритих — перевір окремо.

---

## Мінімізувати атакову поверхню (домашній ПК)

```powershell
# Порти, що зазвичай не потрібні домашньому ПК
$portsToBlock = @(135, 139, 445, 5985)

foreach ($port in $portsToBlock) {
  New-NetFirewallRule -DisplayName "Block port $port inbound" `
    -Direction Inbound -Protocol TCP -LocalPort $port `
    -Action Block -ErrorAction SilentlyContinue
  Write-Host "Blocked port $port"
}
```

**Обережно:** порт 445 потрібен для спільного доступу до файлів — блокуй тільки якщо не використовуєш мережевий обмін файлами.

---

## Онлайн перевірка портів (ззовні)

Щоб перевірити чи порт доступний з інтернету:
- **canyouseeme.org** — вводиш порт і перевіряє чи бачить його ззовні
- **portchecker.co** — аналог

> Для цього ПК або сервер повинен мати публічний IP і порт проброшений на роутері.

---

## Знайти яка програма використовує порт

```powershell
# Знайти процес за портом
$port = 8080
$conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($conn) {
    Get-Process -Id $conn.OwningProcess | Select-Object Id, Name, Path
} else {
    Write-Output "Порт $port не зайнятий"
}
```

---

## Підсумок

`Test-NetConnection -Port` — найшвидший спосіб перевірити порт на будь-якому хості. `netstat -anob` — побачити що займає порт на локальному ПК. `New-NetFirewallRule` — відкрити порт у брандмауері. Для перевірки ззовні — canyouseeme.org.

---

## 🛡️ Перевір безпеку свого ПК

Хочеш знати чи немає витоків даних, зайвих служб або підозрілих програм на твоєму ПК?

**[→ AuditShield](/tools/auditshield)** — аудит Windows по 22 напрямках за 10 хвилин. HTML-звіт з оцінкою ризику. Є безкоштовне демо.

