---
title: "CrystalDiskInfo: перевірка стану HDD і SSD на Windows"
date: "2026-09-05"
publishDate: "2026-09-05"
updated: "2026-09-05"
description: "Як використовувати CrystalDiskInfo для перевірки стану жорсткого диску і SSD через SMART. Розуміння показників здоров'я, температури і попередження про відмову диску."
tags: ["windows", "crystaldiskinfo", "диск", "діагностика", "інструменти", "ssd"]
readTime: 6
translatesEn: "crystaldiskinfo-windows-disk-health-guide"
---

CrystalDiskInfo читає SMART дані дисків і попереджає про можливу відмову до того як диск вийде з ладу. Безкоштовно, без реклами, 5 хвилин — і знаєш стан всіх дисків.

---

## Встановлення

```powershell
winget install CrystalDewWorld.CrystalDiskInfo
```
Або з [crystalmark.info](https://crystalmark.info/en/software/crystaldiskinfo/).

---

## Розуміння оцінок здоров'я

| Оцінка | Колір | Значення |
|--------|-------|---------|
| **Good** | 🔵 Синій | Диск в нормі |
| **Caution** | 🟡 Жовтий | Є попереджувальні ознаки, стеж за диском |
| **Bad** | 🔴 Червоний | Диск ненадійний, зроби резервну копію терміново |
| **Unknown** | ⚫ Сірий | Не вдалось отримати SMART дані |

---

## Ключові SMART атрибути

### Критичні для HDD

| ID | Назва | Що означає |
|----|-------|-----------|
| **05** | Reallocated Sectors Count | Кількість переназначених секторів. >0 = проблема |
| **C5** | Current Pending Sector Count | Сектори що чекають перевірки. >0 = тривога |
| **C6** | Uncorrectable Sector Count | Невиправні помилки. >0 = диск вмирає |
| **C7** | UltraDMA CRC Error Count | Помилки інтерфейсу (кабель або порт) |

### Критичні для SSD

| ID | Назва | Що означає |
|----|-------|-----------|
| **05** | Reallocated Sectors Count | Погані блоки |
| **E1/E9** | Total LBAs Written | Загальний обсяг запису (знос) |
| **BB/C3** | Uncorrectable Error Count | Невиправні помилки |
| **E8** | Available Reserved Space | Залишковий резерв (якщо 0 — SSD повністю зношений) |

---

## Температура диску

| Тип диску | Нормальна температура | Небезпечна |
|----------|----------------------|-----------|
| HDD | 25–45°C | >55°C |
| SSD SATA | 25–50°C | >65°C |
| NVMe M.2 | 35–70°C | >85°C |

---

## Налаштування сповіщень

CrystalDiskInfo може попереджати про проблеми:

```
Function → Resident → Startup (запуск з Windows)
Function → Alert → Temperature (поріг температури)
```

При перевищенні порогу — сповіщення в треї.

---

## Автоматична перевірка через PowerShell

```powershell
# Перевірити стан дисків через SMART без додаткових програм
Get-PhysicalDisk | Select-Object FriendlyName, HealthStatus, OperationalStatus

# Детальна SMART інформація (потребує WMI)
$disks = Get-WmiObject -Namespace root\wmi -Class MSStorageDriver_FailurePredictStatus
foreach ($disk in $disks) {
    $name = ($disk.InstanceName -split '\\')[0]
    Write-Host "$name - PredictFailure: $($disk.PredictFailure)"
}

# SMART через StorageCmdlets
Get-Disk | Get-StorageReliabilityCounter |
    Select-Object DeviceId, Temperature, Wear, ReadErrorsTotal, WriteErrorsTotal
```

---

## Що робити якщо статус "Caution" або "Bad"

### Caution (жовтий)
1. Зроби резервну копію важливих даних **зараз**
2. Стеж за диском — перевіряй раз на тиждень
3. Плануй заміну диску

### Bad (червоний)
1. **Терміново** скопіюй всі дані на інший диск
2. Не вимикай ПК поки не скопіюєш
3. Заміни диск

**Резервна копія через robocopy:**
```powershell
# Скопіювати всі файли з C:\Users на зовнішній диск
robocopy C:\Users D:\Backup\Users /E /COPYALL /R:3 /W:5 /LOG:backup.log
```

---

## CrystalDiskMark — тест швидкості

Від того ж розробника — тест читання/запису диску:

```powershell
winget install CrystalDewWorld.CrystalDiskMark
```

Корисно після встановлення нового SSD — перевір що він працює на повній швидкості.

---

## Резюме

| Оцінка | Дія |
|--------|-----|
| Good (синій) | Все нормально, перевіряй раз на місяць |
| Caution (жовтий) | Зроби резервну копію, стеж за динамікою |
| Bad (червоний) | Терміново копіюй дані, міняй диск |
| Атрибут 05 > 0 | Диск має погані сектори — тривога |
| Температура HDD > 55°C | Перевір охолодження |
