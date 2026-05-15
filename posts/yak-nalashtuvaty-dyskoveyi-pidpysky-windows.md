---
title: "Як перевірити і виправити помилки файлової системи в Windows"
date: "2026-11-08"
publishDate: "2026-11-08"
description: "Перевірка диску на помилки через chkdsk і PowerShell. Автоматичне виправлення, плановий запуск і що робити якщо chkdsk знаходить проблеми."
tags: ["windows", "диск", "діагностика", "інструменти"]
readTime: 4
---

Помилки файлової системи спричиняють пошкодження файлів, повільну роботу і збої. Ось як їх знайти і виправити.

---

## Швидка перевірка без виправлення

```powershell
# Перевірка тільки для читання (не потребує перезавантаження)
Repair-Volume -DriveLetter C -Scan

# Більш детальна перевірка
chkdsk C: /scan
```

Повідомляє про стан без внесення змін — корисно для первинної діагностики.

---

## Перевірка і виправлення (chkdsk)

Для системного диску C: потрібне перезавантаження:

```cmd
rem Заплановий chkdsk при наступному завантаженні
chkdsk C: /f /r

rem Підтвердь: "Chkdsk cannot run because the volume is in use. Schedule? (Y/N)"
rem Введи Y → перезавантаж
```

Параметри:
- `/f` — виправляти помилки
- `/r` — знаходити і відновлювати погані сектори
- `/x` — примусово відмонтувати (для не-системних дисків)

**Для не-системного диску** (D:, E:) — виправляє одразу без перезавантаження:
```cmd
chkdsk D: /f /r /x
```

---

## Через PowerShell

```powershell
# Повне сканування і виправлення офлайн (планується)
Repair-Volume -DriveLetter C -OfflineScanAndFix

# Для не-системного диску — одразу
Repair-Volume -DriveLetter D -SpotFix

# Перевірити стан томів
Get-Volume | Select-Object DriveLetter, FileSystemLabel, HealthStatus, OperationalStatus
```

---

## Переглянути результати chkdsk

Після перезавантаження і завершення перевірки:

```powershell
# Результати в журналі подій
Get-WinEvent -FilterHashtable @{LogName='Application'; Source='Wininit'; Id=26226} -MaxEvents 3 |
  Select-Object TimeCreated, Message

# Або через Event Viewer
# Windows Logs → Application → Source: Wininit
```

---

## Скасувати заплановий chkdsk

```cmd
rem Скасувати заплановий chkdsk для C:
chkdsk C: /x /f
rem Або
fsutil dirty query C:
```

---

## Перевірити чи є "брудні" томи

```powershell
# "Брудний" том = файлова система потребує перевірки
Get-Volume | Where-Object {$_.OperationalStatus -eq 'Incomplete' -or $_.HealthStatus -ne 'Healthy'}
```

Або:
```cmd
fsutil dirty query C:
rem "Volume - C: is Dirty" = перевірка потрібна
```

---

## SMART статус диску

chkdsk перевіряє файлову систему, але не апаратний стан. Перевір SMART:

```powershell
Get-PhysicalDisk | Select-Object FriendlyName, MediaType, HealthStatus, OperationalStatus

# Детальніше (Windows Server/Pro)
Get-StorageReliabilityCounter -PhysicalDisk (Get-PhysicalDisk | Where-Object {$_.FriendlyName -like "*Samsung*"}) |
  Select-Object Temperature, Wear, ReadErrorsTotal, WriteErrorsTotal
```

Якщо HealthStatus = Warning або Unhealthy — час купити новий диск, дані під загрозою.

---

## Автоматична перевірка при завантаженні

Windows автоматично запускає chkdsk при виявленні нечисто відмонтованих томів (після збою живлення тощо). Це нормально.

Щоб вимкнути автоматичну перевірку конкретного диску:
```cmd
fsutil dirty set C:
chkntfs /X C:
```

---

## Резюме

Для швидкої перевірки: `chkdsk C: /scan` або `Repair-Volume -DriveLetter C -Scan`. Для виправлення: `chkdsk C: /f /r` → Y → перезавантаж. Після перевірки дивись результати в Event Viewer → Application → Wininit. При SMART помилках — терміново зроби резервну копію і замінюй диск.
