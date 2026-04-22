---
title: "Як перевірити продуктивність диска через CMD і PowerShell"
date: "2026-04-09"
description: "Вимірювання швидкості читання і запису диска через winsat, diskspd і PowerShell. Як інтерпретувати результати."
tags: ["диск", "продуктивність", "cmd", "моніторинг"]
readTime: 5
---

Диск гальмує але незрозуміло чому? Ось як виміряти реальну швидкість без сторонніх програм.

## winsat — вбудований тест Windows

```cmd
winsat disk -drive c
```

Запускати від адміністратора. Тест займає ~2 хвилини. Результат покаже:

- **Sequential Read** — послідовне читання (МБ/с)
- **Random Read** — випадкове читання (МБ/с)  
- **Sequential Write** — послідовний запис
- **Average Read Time** — середній час відгуку (мс)

**Орієнтири:**

| Тип диску | Sequential Read | Avg Read Time |
|---|---|---|
| HDD | 80–150 МБ/с | 15–20 мс |
| SATA SSD | 450–550 МБ/с | 0.05–0.1 мс |
| NVMe SSD | 2000–7000 МБ/с | 0.02–0.05 мс |

Якщо SSD показує час відгуку більше 1 мс — можливо проблема.

---

## Повний тест системи

```cmd
winsat formal
```

Запускає комплексний тест (CPU, RAM, диск, графіка). Займає 5–10 хвилин.

---

## PowerShell — моніторинг в реальному часі

**Завантаженість диска зараз:**
```powershell
Get-Counter '\PhysicalDisk(_Total)\% Disk Time' -SampleInterval 2 -MaxSamples 5
```

**Черга запитів (більше 2 = диск перевантажений):**
```powershell
Get-Counter '\PhysicalDisk(_Total)\Current Disk Queue Length'
```

**Швидкість читання/запису:**
```powershell
Get-Counter '\PhysicalDisk(_Total)\Disk Read Bytes/sec'
Get-Counter '\PhysicalDisk(_Total)\Disk Write Bytes/sec'
```

---

## SMART — стан здоров'я диска

```cmd
wmic diskdrive get status
```

`OK` — диск здоровий. `Pred Fail` — диск попереджає про близьку відмову.

Детальніша SMART-інформація через PowerShell:
```powershell
Get-PhysicalDisk | Select FriendlyName, OperationalStatus, HealthStatus, Size
```

---

## Що робити якщо диск повільний

**HDD зі старістю** — дефрагментація:
```cmd
defrag C: /U /V
```

**SSD потребує оптимізації:**
```cmd
defrag C: /O
```
(не дефрагментація — оптимізація TRIM для SSD)

**Диск 100% через SysMain:**
```cmd
sc config SysMain start= disabled
sc stop SysMain
```

> Також дивись: [Як переглянути продуктивність ПК в Windows](/yak-podyvytys-produktyvnist-pk)
