---
title: "RAID на Windows Server: апаратний і програмний RAID через diskpart"
date: "2026-09-21"
publishDate: "2026-09-21"
description: "Налаштування RAID масивів на Windows Server: програмний RAID 1 і RAID 5 через Disk Management і diskpart, моніторинг стану і відновлення при відмові диска."
tags: ["адміністрування", "windows", "диск", "відновлення", "powershell"]
readTime: 7
---

RAID захищає дані від відмови фізичних дисків. Windows Server підтримує програмний RAID без спеціального контролера.

---

## Типи RAID в Windows Server

| Тип | Мінімум дисків | Захист | Ефективність |
|-----|---------------|--------|-------------|
| RAID 0 (Striped) | 2 | Немає | 100% |
| RAID 1 (Mirror) | 2 | 1 диск | 50% |
| RAID 5 (Parity) | 3 | 1 диск | 67% |
| RAID 10 | 4 | 1 диск з пари | 50% |

> Програмний RAID Windows підтримує тільки для **Dynamic Disks** або через **Storage Spaces**.

---

## RAID 1 через Disk Management (GUI)

1. `Win + R` → `diskmgmt.msc`
2. Правою кнопкою на диск → **Convert to Dynamic Disk**
3. Правою на нерозподілений простір → **New Mirrored Volume**
4. Додай обидва диски → вкажи розмір → вибери букву → формат NTFS

---

## RAID 1 через diskpart

```cmd
diskpart

rem Переглянути диски
list disk

rem Конвертувати в dynamic
select disk 1
convert dynamic

select disk 2
convert dynamic

rem Створити mirrored volume
select disk 1
create volume mirror disk=1,2

rem Відформатувати
select volume [номер нового тому]
format fs=ntfs label="Mirror" quick
assign letter=M

exit
```

---

## RAID 5 через diskpart

```cmd
diskpart

rem Конвертувати 3 диски в dynamic
select disk 1
convert dynamic

select disk 2
convert dynamic

select disk 3
convert dynamic

rem Створити RAID-5
create volume raid disk=1,2,3

select volume [номер]
format fs=ntfs label="RAID5" quick
assign letter=R

exit
```

---

## Storage Spaces — сучасна альтернатива

Для нових розгортань рекомендується Storage Spaces замість класичного Dynamic Disk RAID.

```powershell
# RAID 1 аналог через Storage Spaces
$disks = Get-PhysicalDisk | Where-Object { $_.CanPool -eq $true }
$pool = New-StoragePool -FriendlyName "DataPool" `
  -StorageSubSystemFriendlyName (Get-StorageSubSystem).FriendlyName `
  -PhysicalDisks $disks

New-VirtualDisk -StoragePoolFriendlyName "DataPool" `
  -FriendlyName "Mirror" `
  -Size 500GB `
  -ResiliencySettingName Mirror
```

Детальніше: [Windows Storage Spaces](/windows-storage-spaces-nalashtuvannya)

---

## Моніторинг стану RAID

```powershell
# Стан Dynamic Disk томів
Get-Volume | Where-Object { $_.DriveType -eq "Fixed" } |
  Select-Object DriveLetter, FileSystemLabel, HealthStatus, OperationalStatus

# Через diskpart
diskpart
list volume
exit

# Storage Spaces стан
Get-VirtualDisk | Select-Object FriendlyName, HealthStatus, OperationalStatus
Get-PhysicalDisk | Select-Object FriendlyName, HealthStatus, Usage
```

---

## Відновлення при відмові диска (RAID 1)

```powershell
# Знайти проблемний диск
Get-PhysicalDisk | Where-Object { $_.HealthStatus -ne "Healthy" }
```

1. Фізично замінити несправний диск
2. `diskmgmt.msc` → правою на Mirror Volume → **Add Mirror** → вибери новий диск
3. Почне ресинхронізацію — може зайняти кілька годин

---

## Важливі обмеження

- Програмний RAID не підходить для системного диска (диску з Windows)
- При відмові контролера або материнської плати — перенос динамічних дисків може бути складним
- RAID ≠ резервне копіювання: захищає від відмови заліза але не від випадкового видалення

---

## Підсумок

Для простого RAID 1 — `diskmgmt.msc` → Convert to Dynamic → New Mirrored Volume. Для RAID 5 — diskpart. Для нових систем краще Storage Spaces — гнучкіше і простіше в управлінні. Перевіряй стан регулярно через `Get-PhysicalDisk`.
