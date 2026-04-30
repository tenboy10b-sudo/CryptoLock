---
title: "Windows Storage Spaces: RAID-подібне сховище без контролера"
date: "2026-09-01"
publishDate: "2026-09-01"
description: "Як налаштувати Storage Spaces в Windows 10 і 11: дзеркало, парність і просте сховище. Захист від втрати диска без апаратного RAID контролера."
tags: ["windows", "диск", "адміністрування", "відновлення", "налаштування"]
readTime: 6
---

Storage Spaces — вбудована функція Windows для об'єднання кількох фізичних дисків в один логічний том з захистом від відмови диска. Аналог RAID без спеціального обладнання.

---

## Типи Storage Spaces

| Тип | Мінімум дисків | Захист | Ефективність |
|-----|---------------|--------|-------------|
| **Simple** | 1 | Немає (як JBOD) | 100% |
| **Mirror (2-way)** | 2 | 1 диск | 50% |
| **Mirror (3-way)** | 5 | 2 диски | ~33% |
| **Parity** | 3 | 1 диск | ~67% |

**Mirror** — дані записуються на 2+ диски одночасно. Якщо один виходить з ладу — все збережено.

**Parity** — як RAID 5, менше дисків для захисту але повільніший запис.

---

## Налаштування через GUI

`Панель керування` → **Сховища** → **Створити нове сховище і пул сховищ**:

1. Вибери диски для пулу (не менше 2 для захисту)
2. Дай ім'я пулу
3. Створи Space — вибери тип (Mirror або Parity)
4. Вкажи розмір (можна більше фізичного — thin provisioning)
5. Відформатуй і призначи букву

---

## Налаштування через PowerShell

```powershell
# Переглянути доступні фізичні диски (без букви — кандидати для пулу)
Get-PhysicalDisk | Select-Object FriendlyName, MediaType, Size, CanPool

# Створити пул з двох дисків
$disks = Get-PhysicalDisk | Where-Object { $_.CanPool -eq $true }
$pool = New-StoragePool `
  -FriendlyName "DataPool" `
  -StorageSubSystemFriendlyName (Get-StorageSubSystem).FriendlyName `
  -PhysicalDisks $disks

# Створити Mirror Space
New-VirtualDisk `
  -StoragePoolFriendlyName "DataPool" `
  -FriendlyName "MirrorSpace" `
  -Size 500GB `
  -ResiliencySettingName Mirror `
  -NumberOfDataCopies 2

# Ініціалізувати і відформатувати
$vdisk = Get-VirtualDisk -FriendlyName "MirrorSpace"
$disk = $vdisk | Get-Disk
$disk | Initialize-Disk -PartitionStyle GPT
$disk | New-Partition -AssignDriveLetter -UseMaximumSize |
  Format-Volume -FileSystem NTFS -NewFileSystemLabel "Mirror Storage"
```

---

## Управління Storage Spaces

```powershell
# Переглянути стан пулів
Get-StoragePool | Select-Object FriendlyName, HealthStatus, OperationalStatus, Size

# Переглянути стан Space (тому)
Get-VirtualDisk | Select-Object FriendlyName, HealthStatus, OperationalStatus, Size

# Переглянути стан фізичних дисків
Get-PhysicalDisk | Select-Object FriendlyName, HealthStatus, OperationalStatus, Usage

# Додати диск до існуючого пулу
$newDisk = Get-PhysicalDisk | Where-Object { $_.CanPool -eq $true } | Select-Object -First 1
Add-PhysicalDisk -StoragePoolFriendlyName "DataPool" -PhysicalDisks $newDisk

# Розширити простір
Resize-VirtualDisk -FriendlyName "MirrorSpace" -Size 1TB
```

---

## Що робити якщо диск вийшов з ладу

```powershell
# Перевірити стан
Get-StoragePool | Select-Object FriendlyName, HealthStatus
Get-VirtualDisk | Select-Object FriendlyName, HealthStatus

# Знайти проблемний диск
Get-PhysicalDisk | Where-Object { $_.HealthStatus -ne "Healthy" }

# Після заміни диска — відновити (repair)
Get-StoragePool -FriendlyName "DataPool" | Repair-StoragePool

# Або через GUI: Панель керування → Сховища → пул → Repair pool
```

---

## Обмеження Storage Spaces

- Не замінює повноцінний апаратний RAID для критичних систем
- Не підтримує завантаження Windows з Simple або Mirror Space (тільки системний том)
- При видаленні пулу — всі дані видаляються
- Parity тип — значно повільніший запис ніж Mirror

---

## Чи варто використовувати

**Так, якщо:**
- Домашній медіасервер або сховище документів
- Потрібен захист від відмови диска без покупки RAID контролера
- Є 2+ зайвих диски

**Ні, якщо:**
- Критична база даних або виробниче середовище → апаратний RAID
- Потрібна максимальна продуктивність → NVMe RAID або окремі диски

---

## Підсумок

Storage Spaces — простий спосіб отримати захист даних без RAID контролера. `New-StoragePool` + `New-VirtualDisk -ResiliencySettingName Mirror` — Mirror Space за 5 хвилин. При відмові диска — замінити фізично і запустити `Repair-StoragePool`. Перевіряй стан дисків регулярно через `Get-PhysicalDisk`.
