---
title: "Налаштування живлення Windows: продуктивність vs час роботи батареї"
date: "2027-02-07"
publishDate: "2027-02-07"
description: "Налаштування планів живлення Windows для максимальної продуктивності або економії батареї. Таймери сну, Ultimate Performance і розширені параметри через PowerShell."
tags: ["windows", "живлення", "продуктивність", "батарея", "оптимізація"]
readTime: 4
translatesEn: "how-to-configure-windows-power-settings"
---

Параметри живлення визначають баланс між продуктивністю і часом роботи. Ось як налаштувати точно під свої потреби.

---

## Перегляд і перемикання планів

```powershell
# Список планів
powercfg /list

# Переключитись на High Performance
powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c

# Збалансований (за замовчуванням)
powercfg /setactive 381b4222-f694-41f0-9685-ff5bb260df2e
```

---

## Ultimate Performance (для стаціонарних ПК)

```powershell
# Додати Ultimate Performance
powercfg /duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61

# Активувати (замінити GUID на отриманий вище)
powercfg /setactive GUID_ТУТА
```

---

## Таймери сну і монітора

```powershell
# Таймер сну (хвилини, 0 = ніколи) — від мережі
powercfg /change standby-timeout-ac 30

# Вимкнення монітора — від мережі
powercfg /change monitor-timeout-ac 15

# Вимкнути гібернацію (економить місце на SSD)
powercfg /hibernate off
```

---

## Швидкий запуск

```powershell
# Увімкнути Fast Startup (швидке завантаження)
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power" `
  -Name "HiberbootEnabled" -Value 1 -Type DWord
```

---

## Звіт про батарею

```powershell
powercfg /batteryreport /output "C:\battery-report.html"
Start-Process "C:\battery-report.html"
```

---

## Часті питання

### Який план для ігор?

Ultimate Performance або High Performance. Збалансований план зменшує частоту CPU в стані спокою — це додає мікро-затримки що критично для конкурентних ігор.

### Чи збільшує Ultimate Performance рахунки за електрику?

Незначно — запобігає зниженню частоти CPU в стані спокою. Різниця мінімальна на стаціонарному ПК. На ноутбуці значно знижує час роботи від батареї.

---

## Резюме

`powercfg /setactive` для перемикання. Ultimate Performance на стаціонарних. `powercfg /change` для таймерів сну. `powercfg /batteryreport` для звіту батареї. Fast Startup для швидшого завантаження.
