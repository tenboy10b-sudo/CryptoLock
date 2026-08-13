---
title: "Принтер не друкує в Windows 10 і 11: покрокове виправлення"
date: "2026-08-18"
publishDate: "2026-08-18"
updated: "2026-08-18"
description: "Що робити якщо принтер не друкує в Windows 10 і 11. Очищення черги друку, перезапуск служби Print Spooler, оновлення драйверів і виправлення помилок підключення."
tags: ["windows", "принтер", "друк", "виправлення", "драйвери"]
readTime: 7
translatesEn: "printer-not-printing-windows-fix"
---

Принтер є в системі але не друкує — найпоширеніша проблема. Зазвичай причина в зависшій черзі друку або службі Print Spooler.

---

## Крок 1 — Очистити чергу друку

Перша дія при будь-яких проблемах з принтером:

```powershell
# Зупинити службу Print Spooler
Stop-Service Spooler -Force

# Очистити всі завдання в черзі
Remove-Item "$env:SystemRoot\System32\spool\PRINTERS\*" -Force -ErrorAction SilentlyContinue

# Запустити службу знову
Start-Service Spooler

Write-Host "✅ Черга друку очищена"
```

---

## Крок 2 — Перезапустити Print Spooler

```powershell
# Перезапустити і перевірити статус
Restart-Service Spooler
Get-Service Spooler | Select-Object Name, Status, StartType

# Якщо служба вимкнена — увімкнути
Set-Service Spooler -StartupType Automatic
Start-Service Spooler
```

---

## Крок 3 — Перевірити підключення принтера

### USB принтер
```powershell
# Перевірити чи бачить Windows USB пристрої
Get-PnpDevice | Where-Object {$_.Class -eq 'Printer'} |
    Select-Object FriendlyName, Status
```

- Відключи і підключи USB кабель
- Спробуй інший USB порт
- Перевір кабель на іншому ПК

### Мережевий принтер
```powershell
# Перевірити підключення до мережевого принтера
$printer = Get-Printer | Select-Object -First 1
Test-NetConnection -ComputerName $printer.PortName -Port 9100
```

---

## Крок 4 — Видалити і встановити принтер заново

```powershell
# Отримати список принтерів
Get-Printer | Select-Object Name, PortName, DriverName

# Видалити принтер
Remove-Printer -Name "НАЗВА_ПРИНТЕРА"

# Видалити драйвер
Remove-PrinterDriver -Name "НАЗВА_ДРАЙВЕРА" -ErrorAction SilentlyContinue
```

Потім встанови принтер заново:
```
Win + I → Bluetooth і пристрої → Принтери та сканери → Додати пристрій
```

---

## Крок 5 — Оновити драйвер принтера

1. Диспетчер пристроїв → Черги друку
2. ПКМ на принтері → Оновити драйвер
3. Або завантаж з сайту виробника (Canon, HP, Epson, Brother)

**HP принтери:**
```powershell
# HP Print and Scan Doctor — автоматичне виправлення
# Завантаж з support.hp.com
```

---

## Типові помилки

### "Принтер не в мережі" (offline)

```powershell
# Встановити принтер онлайн
$printer = Get-WmiObject -Class Win32_Printer -Filter "Name='НАЗВА'"
$printer.SetWorkOffline($false)
```

Або:
```
Параметри → Принтери → принтер → Відкрити чергу →
Принтер → зніми галочку "Використовувати принтер в автономному режимі"
```

### Документ застряг в черзі

```powershell
# Примусово видалити всі завдання
Stop-Service Spooler -Force
Remove-Item "$env:SystemRoot\System32\spool\PRINTERS\*" -Force
Start-Service Spooler
```

### Помилка "Не вдалось надрукувати"

```powershell
# Перевірити журнал помилок принтера
Get-WinEvent -LogName "Microsoft-Windows-PrintService/Admin" -MaxEvents 10 |
    Select-Object TimeCreated, Message | Format-List
```

---

## Засіб усунення неполадок

```powershell
# Вбудований troubleshooter принтера
msdt.exe /id PrinterDiagnostic
```

---

## Резюме

| Проблема | Рішення |
|---------|---------|
| Застряг документ | Stop-Service Spooler → видали файли → Start |
| Принтер offline | Зняти "Використовувати в автономному режимі" |
| Не бачить принтер | Видалити і встановити заново |
| Помилка друку | Оновити або перевстановити драйвер |
| Нічого не допомагає | Завантажити офіційний інструмент виробника |
