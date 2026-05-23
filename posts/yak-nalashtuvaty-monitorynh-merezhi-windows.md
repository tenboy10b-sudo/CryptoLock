---
title: "Моніторинг мережі в Windows: як відстежити трафік і знайти зайві підключення"
date: "2026-06-19"
publishDate: "2026-06-19"
description: "Як перевірити мережеву активність в Windows через Resource Monitor, netstat і PowerShell. Знайти програми що споживають трафік і підозрілі підключення."
tags: ["windows", "мережа", "моніторинг", "безпека"]
readTime: 5
---

Якщо інтернет раптово стає повільним або підозрюєш що програма відправляє дані без дозволу — ось як перевірити що відбувається в мережі.

---

## Resource Monitor (найпростіше)

`Win + R` → `resmon` → вкладка **Мережа**

Показує в реальному часі:
- Які процеси мають мережеву активність
- Скільки байт відправляють/отримують
- До яких адрес підключені

Знайди процес з підозріло великим трафіком → клікни правою → **Завершити процес** або перевір що це за програма.

---

## netstat — активні підключення

```cmd
rem Всі активні підключення з ім'ям процесу
netstat -b

rem Показати з PID і без DNS lookups (швидше)
netstat -ano

rem Оновлювати кожні 2 секунди
netstat -ano 2
```

Колонки:
- **Local Address** — IP і порт на твоєму ПК
- **Foreign Address** — куди підключено
- **State** — ESTABLISHED (активне), LISTENING (чекає підключення), TIME_WAIT

---

## PowerShell — детальний аналіз

```powershell
# Всі активні підключення з ім'ям процесу
Get-NetTCPConnection -State Established |
  Select-Object LocalPort, RemoteAddress, RemotePort,
    @{n='Process';e={(Get-Process -Id $_.OwningProcess -EA SilentlyContinue).Name}} |
  Sort-Object Process

# Які процеси слухають порти
Get-NetTCPConnection -State Listen |
  Select-Object LocalPort,
    @{n='Process';e={(Get-Process -Id $_.OwningProcess -EA SilentlyContinue).Name}} |
  Sort-Object LocalPort

# Перевірити конкретний порт
Get-NetTCPConnection -LocalPort 80 -EA SilentlyContinue
```

---

## Перевірити обсяг трафіку по адаптеру

```powershell
# Поточна швидкість по кожному адаптеру
Get-NetAdapterStatistics | Select-Object Name, ReceivedBytes, SentBytes

# Скільки отримано/відправлено з моменту завантаження
$adapters = Get-NetAdapter | Where-Object {$_.Status -eq "Up"}
foreach ($a in $adapters) {
  $stats = Get-NetAdapterStatistics -Name $a.Name
  [PSCustomObject]@{
    Adapter = $a.Name
    'Received MB' = [math]::Round($stats.ReceivedBytes/1MB, 1)
    'Sent MB' = [math]::Round($stats.SentBytes/1MB, 1)
  }
}
```

---

## Знайти яка програма з'їдає трафік

```powershell
# Топ процесів по мережевій активності (потребує PerfMon лічильників)
Get-Counter '\Process(*)\IO Other Bytes/sec' |
  Select-Object -ExpandProperty CounterSamples |
  Where-Object {$_.CookedValue -gt 1000} |
  Sort-Object CookedValue -Descending |
  Select-Object -First 10 InstanceName, CookedValue
```

Або простіший спосіб: **Task Manager** → вкладка **App history** → колонка **Network** — показує накопичений трафік по програмах.

---

## Заблокувати небажані підключення

```powershell
# Заблокувати вихідні для конкретної програми
New-NetFirewallRule -DisplayName "Block App" `
  -Direction Outbound `
  -Program "C:\Path\To\App.exe" `
  -Action Block

# Заблокувати підключення до конкретного IP
New-NetFirewallRule -DisplayName "Block IP" `
  -Direction Outbound `
  -RemoteAddress "1.2.3.4" `
  -Action Block
```

---

## Wireshark для глибокого аналізу

Якщо потрібно побачити конкретні пакети — завантаж [Wireshark](https://www.wireshark.org) (безкоштовний).

Вибери мережевий адаптер → натисни **Start** → фільтруй трафік:
- `http` — тільки HTTP запити
- `ip.addr == 1.2.3.4` — трафік до конкретного IP
- `tcp.port == 443` — HTTPS трафік

---


---

## 🛡️ Перевір безпеку свого ПК

Хочеш знати чи немає витоків даних, зайвих служб або підозрілих програм на твоєму ПК?

**[→ AuditShield](/tools/auditshield)** — аудит Windows по 22 напрямках за 10 хвилин. HTML-звіт з оцінкою ризику. Є безкоштовне демо.



---

## 🌐 Розрахувати параметри підмережі?

**[→ IP/Subnet калькулятор](/tools/subnet-calculator)** — введи IP і CIDR, отримай маску, broadcast, діапазон хостів і бінарне представлення.


## Резюме

Для швидкої перевірки: Resource Monitor → вкладка Мережа. Для списку підключень: `netstat -ano`. Для детального аналізу з іменами процесів: PowerShell `Get-NetTCPConnection`. Підозрілий процес з постійним трафіком → перевір в Google і заблокуй через Firewall.
