---
title: "Інтернет повільний в Windows: як збільшити швидкість з'єднання"
date: "2026-06-05"
publishDate: "2026-06-05"
description: "Чому інтернет повільний в Windows і як прискорити: перевірка швидкості, DNS, налаштування адаптера, вимкнення фонових завантажень і оновлення драйверів."
tags: ["мережа", "windows", "оптимізація", "налаштування"]
readTime: 5
---

Повільний інтернет може бути проблемою роутера, провайдера або самого Windows. Ось як визначити де проблема і що з цим робити.

---

## Крок 1: Виміряй реальну швидкість

Перейди на [fast.com](https://fast.com) або [speedtest.net](https://speedtest.net) і порівняй з тарифом провайдера.

Якщо швидкість близька до тарифу — проблема не в Windows, а в роутері або провайдері.

Якщо значно нижча — читай далі.

---

## Крок 2: Змінити DNS на швидший

DNS провайдера часто повільний. Cloudflare (`1.1.1.1`) значно швидший для більшості користувачів.

```powershell
# Змінити DNS для Wi-Fi
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses ("1.1.1.1","1.0.0.1")

# Очистити кеш DNS
Clear-DnsClientCache
```

Або: `Win + R` → `ncpa.cpl` → правий клік на адаптері → **Властивості** → **IPv4** → вручну вкажи DNS `1.1.1.1` і `8.8.8.8`.

---

## Крок 3: Вимкнути ліміт Windows Update

Windows резервує 20% пропускної здатності для оновлень у фоні.

`Win + I` → **Windows Update** → **Розширені параметри** → **Оптимізація доставки** → **Розширені параметри** → встанови ліміт завантаження **10%** або менше.

Або через реєстр:
```powershell
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\NetworkList\DefaultMediaCost" `
  -Name "Default" -Value 2 -Type DWord
```

---

## Крок 4: Перевірити фоновий трафік

```powershell
# Які процеси використовують мережу
Get-NetTCPConnection -State Established |
  Select-Object LocalPort, RemoteAddress, OwningProcess |
  ForEach-Object {
    $proc = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
    [PSCustomObject]@{
      Process = $proc.Name
      Remote = $_.RemoteAddress
    }
  } | Sort-Object Process | Get-Unique -AsString
```

Або просто відкрий **Resource Monitor**: `Win + R` → `resmon` → вкладка **Network** — покаже які програми зараз завантажують або відвантажують дані.

---

## Крок 5: Оновити драйвер мережевого адаптера

Старий драйвер може знижувати швидкість.

`Win + X` → **Диспетчер пристроїв** → **Мережеві адаптери** → правий клік на Wi-Fi або Ethernet адаптері → **Оновити драйвер** → **Автоматичний пошук**.

Або завантаж драйвер вручну з сайту виробника ноутбука/материнської плати.

---

## Крок 6: Налаштування адаптера

```powershell
# Знайти назву адаптера
Get-NetAdapter | Select-Object Name, Status
```

`Win + X` → **Диспетчер пристроїв** → **Мережеві адаптери** → правий клік → **Властивості** → вкладка **Додатково**:

- **Speed & Duplex** — встанови **1 Gbps Full Duplex** для Ethernet замість Auto
- **Receive Buffers / Transmit Buffers** — збільш до максимуму
- **Interrupt Moderation** — вимкни якщо потрібна низька затримка

---

## Крок 7: Вимкнути автонастройку TCP

Іноді допомагає при повільних завантаженнях:

```cmd
netsh int tcp set global autotuninglevel=disabled
```

Якщо не допомогло або стало гірше — повернути:
```cmd
netsh int tcp set global autotuninglevel=normal
```

---

## Резюме

Перевір швидкість → заміни DNS на `1.1.1.1` → вимкни ліміт Windows Update → перевір фоновий трафік в Resource Monitor. Ці чотири кроки вирішують більшість проблем зі швидкістю інтернету в Windows.
