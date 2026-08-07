---
title: "Управління дисками і розділами Windows через PowerShell і DiskPart"
date: "2026-08-17"
publishDate: "2027-06-01"
description: "Управління дисками і розділами Windows через Disk Management, PowerShell і DiskPart. Створення, зміна розміру, форматування і призначення букв дисків."
tags: ["windows", "диск", "розділи", "diskpart", "powershell", "адміністрування"]
readTime: 4
translatesEn: "how-to-configure-windows-disk-management"
---

Windows має три інструменти для управління дисками — GUI Disk Management, PowerShell і DiskPart.

---

## Переглянути диски і розділи

```powershell
Get-Disk | Select-Object Number, FriendlyName, Size, PartitionStyle, HealthStatus
Get-Partition | Select-Object DiskNumber, DriveLetter, Size, Type
Get-Volume | Select-Object DriveLetter, FileSystemLabel, Size, SizeRemaining
```

---

## Ініціалізувати новий диск

```powershell
Initialize-Disk -Number 1 -PartitionStyle GPT
```

---

## Створити і відформатувати розділ

```powershell
New-Partition -DiskNumber 1 -UseMaximumSize -AssignDriveLetter |
  Format-Volume -FileSystem NTFS -NewFileSystemLabel "Data" -Confirm:$false

# Конкретного розміру
New-Partition -DiskNumber 1 -Size 100GB |
  Format-Volume -FileSystem NTFS -NewFileSystemLabel "Backup" -Confirm:$false
```

---

## Змінити розмір розділу

```powershell
# Розширити до максимуму
$maxSize = (Get-PartitionSupportedSize -DiskNumber 1 -PartitionNumber 2).SizeMax
Resize-Partition -DiskNumber 1 -PartitionNumber 2 -Size $maxSize

# Зменшити
Resize-Partition -DiskNumber 1 -PartitionNumber 2 -Size 50GB
```

---

## DiskPart

```cmd
diskpart
list disk
select disk 1
list partition
select partition 2
extend          # розширити
shrink desired=10240  # зменшити на 10 ГБ
assign letter=D
exit
```

---

## Часті питання

### Disk Management показує нерозподілене місце але не дає розширити розділ?

Нерозподілений простір має бути безпосередньо справа від розділу. Якщо між ними інший розділ — потрібно його видалити або використати MiniTool Partition Wizard.

### GPT vs MBR — яка різниця?

GPT підтримує диски більше 2 ТБ і необмежену кількість розділів. GPT обов'язковий для UEFI завантаження. Використовуй GPT для всіх сучасних систем.

---

## Резюме

`Get-Disk` і `Get-Partition` для огляду. `Initialize-Disk` для нових. `New-Partition | Format-Volume` для створення. `Resize-Partition` для зміни розміру. DiskPart для операцій недоступних в PowerShell.
