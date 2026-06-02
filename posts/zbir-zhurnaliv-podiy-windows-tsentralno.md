---
title: "Централізований збір журналів подій Windows з кількох ПК"
date: "2026-06-25"
publishDate: "2026-06-25"
description: "Налаштування Windows Event Forwarding для збору журналів з кількох ПК на центральний колектор. Підписки, WinRM і фільтрація подій через PowerShell."
tags: ["windows", "event-log", "моніторинг", "адміністрування", "безпека"]
readTime: 5
translatesEn: "how-to-configure-windows-event-forwarding"
---

Windows Event Forwarding дозволяє збирати журнали з десятків ПК в одне місце — незамінно для моніторингу безпеки.

---

## Архітектура

```
Джерела (агенти) → Колектор (зберігає всі логи) → Аналіз
```

---

## Крок 1: Налаштувати Колектор

```powershell
# На Колекторі — від адміністратора
winrm quickconfig -quiet
wecutil qc -quiet

Get-Service wecsvc | Select-Object Status
```

---

## Крок 2: Налаштувати Джерела

```powershell
# На кожному Джерелі
winrm quickconfig -quiet

# Додати мережеву службу до читачів журналів
Add-LocalGroupMember -Group "Event Log Readers" -Member "NT AUTHORITY\NETWORK SERVICE"
```

---

## Крок 3: Створити підписку

```powershell
# Перевірити підписки
wecutil es

# Перевірити статус підписки
wecutil gr Security-Events

# Видалити підписку
wecutil ds Security-Events
```

---

## Переглянути передані події

```powershell
Get-WinEvent -LogName "ForwardedEvents" -MaxEvents 20 |
  Select-Object TimeCreated, Id, MachineName, Message | Format-List

# Фільтр за конкретним ПК
Get-WinEvent -LogName "ForwardedEvents" |
  Where-Object {$_.MachineName -eq "PC01"} |
  Select-Object -First 20
```

---

## Часті питання

### Скільки Джерел може обробити один Колектор?

500-2000 ПК залежно від обсягу подій і заліза. Для великих середовищ — кілька колекторів або SIEM.

### Події приходять із затримкою або не приходять?

Перевір WinRM підключення з Колектора до Джерела. Перевір членство в Event Log Readers. `wecutil gr НазваПідписки` для деталей помилок.

---

## Резюме

Колектор: `winrm quickconfig` + `wecutil qc`. Джерела: `winrm quickconfig` + Network Service в Event Log Readers. Підписка з XML фільтром. Перегляд в ForwardedEvents. GPO для розгортання на домен.
