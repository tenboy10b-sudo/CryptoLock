---
title: "Як налаштувати Windows Storage Spaces для надійності як RAID"
date: "2026-08-03"
publishDate: "2026-08-03"
description: "Налаштування Storage Spaces для зеркального і парного пулу дисків. Створення через PowerShell і Параметри для резервування без апаратного RAID."
tags: ["windows", "storage-spaces", "raid", "диск", "адміністрування", "powershell"]
readTime: 4
translatesEn: "how-to-configure-windows-storage-spaces"
---

Storage Spaces дозволяє об'єднати кілька дисків у надійний пул — як RAID але вбудований в Windows.

---

## Типи Storage Spaces

| Тип | Дисків | Відмовостійкість | Запис |
|-----|--------|-----------------|-------|
| **Simple** | 1+ | Немає | Швидко |
| **Mirror (2x)** | 2 | 1 диск | Добре |
| **Mirror (3x)** | 5 | 2 диски | Повільніше |
| **Parity** | 3 | 1 диск | Повільно |

---

## Створити пул через PowerShell

```powershell
# Доступні диски для пулу
Get-PhysicalDisk | Where-Object {$_.CanPool -eq $true} |
  Select-Object FriendlyName, Size, CanPool

# Створити пул
$disks = Get-PhysicalDisk | Where-Object {$_.CanPool -eq $true}
$subsystem = Get-StorageSubSystem | Where-Object {$_.FriendlyName -like "*Windows*"}

New-StoragePool -FriendlyName "DataPool" `
  -StorageSubSystemFriendlyName $subsystem.FriendlyName `
  -PhysicalDisks $disks

# Створити зеркальний віртуальний диск
New-VirtualDisk -StoragePoolFriendlyName "DataPool" `
  -FriendlyName "DataMirror" -ResiliencySettingName "Mirror" `
  -Size 500GB -ProvisioningType Thin
```

---

## Стан пулу і дисків

```powershell
Get-StoragePool | Select-Object FriendlyName, HealthStatus,
  @{n='ГБ';e={[math]::Round($_.Size/1GB)}}

Get-VirtualDisk | Select-Object FriendlyName, HealthStatus, ResiliencySettingName

Get-StoragePool -FriendlyName "DataPool" | Get-PhysicalDisk |
  Select-Object FriendlyName, HealthStatus, Usage
```

---

## Замінити несправний диск

```powershell
Remove-PhysicalDisk -StoragePoolFriendlyName "DataPool" `
  -PhysicalDisks (Get-PhysicalDisk -FriendlyName "FailedDisk")

Add-PhysicalDisk -StoragePoolFriendlyName "DataPool" `
  -PhysicalDisks (Get-PhysicalDisk -FriendlyName "NewDisk")
# Пул автоматично відновлює зеркало
```

---

## Часті питання

### Storage Spaces надійніший за апаратний RAID?

Для дому і малого офісу — так. Для підприємства — апаратні RAID контролери мають виділений кеш і стабільнішу продуктивність під навантаженням.

### Якщо Windows відмовить — чи доступний пул з іншого ПК?

Так. Перемісти всі диски на інший Windows ПК. Метадані Storage Spaces зберігаються на дисках.

---

## Резюме

`New-StoragePool` для пулу. `New-VirtualDisk -ResiliencySettingName Mirror` для зеркала. Thin provisioning для гнучкості. Mirror вимагає мінімум 2 диски. `Get-VirtualDisk` для перевірки.
