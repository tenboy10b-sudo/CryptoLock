---
title: "Як налаштувати параметри живлення Windows для продуктивності і батареї"
date: "2026-08-13"
publishDate: "2027-06-01"
description: "Налаштування планів живлення Windows для максимальної продуктивності або економії батареї. Сон, гібернація, швидкий запуск і звіт батареї через PowerShell."
tags: ["windows", "живлення", "продуктивність", "ноутбук", "оптимізація", "powershell"]
readTime: 4
translatesEn: "how-to-configure-windows-power-settings"
---

Параметри живлення впливають і на продуктивність і на час роботи від батареї.

---

## Переглянути і змінити план живлення

```powershell
powercfg /list
powercfg /getactivescheme

# Висока продуктивність
powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c

# Збалансований
powercfg /setactive 381b4222-f694-41f0-9685-ff5bb260df2e

# Максимальна продуктивність (прихований)
powercfg /duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61
```

---

## Налаштування сну і гібернації

```powershell
# Вимкнути монітор через 10 хв (від мережі)
powercfg /change monitor-timeout-ac 10

# Сон через 30 хв
powercfg /change standby-timeout-ac 30

# Вимкнути гібернацію (звільняє ~4 ГБ диску)
powercfg /hibernate off
```

---

## Звіт батареї

```powershell
powercfg /batteryreport /output "C:\battery-report.html"
Start-Process "C:\battery-report.html"

# Звіт енергоефективності
powercfg /energy /output "C:\energy-report.html"
```

---

## Швидкий запуск

```powershell
# Вимкнути якщо є проблеми з BitLocker або подвійним завантаженням
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power" `
  -Name "HiberbootEnabled" -Value 0 -Type DWord
```

---

## Часті питання

### Чому Windows прокидається зі сну сама?

```powershell
powercfg /lastwake    # що останній раз збудило
powercfg /waketimers  # активні таймери пробудження
```

### Тримати ноутбук постійно в мережі — добре чи погано?

Сучасні ноутбуки мають захист від перезарядки. Але тривале утримання на 100% знижує ємність. Багато виробників (Dell, Lenovo) мають утиліти для обмеження заряду до 80%.

---

## Резюме

`powercfg /list` і `/setactive` для планів. Таймери через `/change`. Звіт батареї через `/batteryreport`. `/hibernate off` на десктопі для звільнення місця.
