---
title: "Оптимізація SSD в Windows 10 і 11: TRIM, дефрагментація і здоров'я"
date: "2026-05-21"
publishDate: "2026-05-21"
description: "Оптимізація продуктивності SSD в Windows. Увімкнути TRIM, вимкнути дефрагментацію і SysMain, перевірити стан і отримати максимальну швидкість від твердотільного диску."
tags: ["windows", "ssd", "продуктивність", "оптимізація", "диск"]
readTime: 4
translatesEn: "how-to-optimize-ssd-windows"
---

SSD показує найкращі результати коли Windows правильно налаштована. Кілька стандартних налаштувань для HDD можуть шкодити SSD.

---

## Перевірити тип диску

```powershell
Get-PhysicalDisk | Select-Object FriendlyName, MediaType, HealthStatus
```

---

## Перевірити TRIM

```powershell
# 0 = TRIM увімкнений (норма для SSD)
fsutil behavior query DisableDeleteNotify

# Увімкнути якщо вимкнений
fsutil behavior set DisableDeleteNotify 0
```

---

## Перевірити дефрагментацію

`Win + S` → **Оптимізація дисків** → SSD має показувати **Повторне усічення (Retrim)** а не **Дефрагментувати**.

---

## Вимкнути SysMain на SSD

```powershell
Stop-Service SysMain -Force
Set-Service SysMain -StartupType Disabled
```

---

## Перевірити знос і температуру

```powershell
Get-StorageReliabilityCounter -PhysicalDisk (Get-PhysicalDisk | Where-Object {$_.MediaType -eq "SSD"}) |
  Select-Object Temperature, Wear, PowerOnHours

# Або встановити CrystalDiskInfo
winget install CrystalDewWorld.CrystalDiskInfo
```

---

## Тримати 10-15% вільного місця

```powershell
Get-PSDrive C | Select-Object @{n='Вільно %';e={[math]::Round($_.Free/($_.Free+$_.Used)*100,0)}}
```

SSD значно сповільнюється при заповненні більше 85%.

---

## Часті питання

### Чи варто вимикати файл підкачки на SSD щоб зменшити записи?

Ні. Вимкнення файлу підкачки може спричинити збої. Навантаження запису мінімальне — сучасні SSD витримують десятиліття навіть з активним файлом підкачки.

### Скільки живе SSD?

Більшість споживчих SSD розраховані на 100-300 ТБ записаних даних. При 50 ГБ на день — 5-16 років. Перевіряй `Wear` через `Get-StorageReliabilityCounter`.

---

## Резюме

TRIM увімкнений через `fsutil`. SysMain вимкнений. Дефраг як Retrim (не Дефрагментувати). Запис кешований в Диспетчері пристроїв. Мінімум 10-15% вільного місця. Моніторинг через `Get-StorageReliabilityCounter`.
