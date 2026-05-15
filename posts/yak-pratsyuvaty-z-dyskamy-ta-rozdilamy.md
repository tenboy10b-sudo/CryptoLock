---
title: "Дефрагментація і оптимізація дисків в Windows"
date: "2026-09-25"
publishDate: "2026-09-25"
description: "Коли і як запускати оптимізацію диску в Windows. Різниця між дефрагментацією HDD і TRIM для SSD. Автоматична оптимізація і ручний запуск."
tags: ["windows", "диск", "оптимізація", "інструменти"]
readTime: 4
---

Windows автоматично оптимізує диски — дефрагментує HDD і виконує TRIM для SSD. Але іноді потрібно зробити це вручну або перевірити налаштування.

---

## Дефрагментація vs TRIM: різниця

**HDD (жорсткий диск):** файли фрагментуються — частини одного файлу розкидані по диску. Дефрагментація збирає їх разом → швидше читання.

**SSD:** дефрагментація непотрібна і шкідлива — зайві записи скорочують ресурс. Замість неї потрібен TRIM — очищення блоків що більше не використовуються.

Windows визначає тип диска автоматично і застосовує правильну операцію.

---

## Перевірити налаштування оптимізації

`Win + S` → **Дефрагментація і оптимізація дисків** або `Win + R` → `dfrgui`

Показує:
- Тип диску (HDD, SSD, USB)
- Дату останньої оптимізації
- Поточний стан фрагментації (для HDD)

**Розклад:** за замовчуванням щотижня — залишай так.

---

## Запустити оптимізацію вручну

В `dfrgui` → вибери диск → **Оптимізувати**

Або через PowerShell:
```powershell
# Оптимізувати конкретний диск
Optimize-Volume -DriveLetter C -Verbose

# Дефрагментація HDD
Optimize-Volume -DriveLetter D -Defrag -Verbose

# TRIM для SSD
Optimize-Volume -DriveLetter C -ReTrim -Verbose

# Перевірити стан без оптимізації
Optimize-Volume -DriveLetter C -Analyze -Verbose
```

---

## Перевірити TRIM увімкнений

```powershell
# 0 = TRIM увімкнений (добре), 1 = вимкнений
fsutil behavior query DisableDeleteNotify

# Увімкнути TRIM якщо вимкнено
fsutil behavior set DisableDeleteNotify 0
```

---

## Автоматичне розкладання

`dfrgui` → **Змінити параметри** → налаштуй частоту (щодня / щотижня / щомісяця) і вибери які диски включити.

```powershell
# Перевірити розклад оптимізації
Get-ScheduledTask -TaskPath "\Microsoft\Windows\Defrag\" |
  Select-Object TaskName, State

# Вимкнути автооптимізацію для конкретного диску
Set-StorageSetting -IOLatencyHint None
```

---

## Перевірити здоров'я диску

```powershell
# Стан всіх дисків
Get-PhysicalDisk | Select-Object FriendlyName, MediaType, HealthStatus, OperationalStatus

# Розмір і зайнятий простір
Get-Volume | Where-Object {$_.DriveLetter} |
  Select-Object DriveLetter, FileSystemLabel,
    @{n='Size GB';e={[math]::Round($_.Size/1GB,1)}},
    @{n='Free GB';e={[math]::Round($_.SizeRemaining/1GB,1)}},
    HealthStatus
```

---

## Перевірка диску на помилки

```powershell
# Перевірка без виправлення
chkdsk C: /scan

# Перевірка і виправлення (потребує перезавантаження для системного диску)
chkdsk C: /f /r

# Через PowerShell
Repair-Volume -DriveLetter C -Scan
Repair-Volume -DriveLetter C -OfflineScanAndFix
```

---

## Резюме

SSD: перевір що TRIM увімкнений (`fsutil behavior query DisableDeleteNotify = 0`). HDD: автодефрагментація раз на тиждень — залиш розклад за замовчуванням. Здоров'я диску: `Get-PhysicalDisk | Select-Object HealthStatus`. При помилках: `chkdsk /f /r` і перезавантаж.
