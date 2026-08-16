---
title: "Як налаштувати Windows Storage Spaces для надійності як RAID"
date: "2026-08-03"
updated: "2026-08-13"
publishDate: "2026-08-03"
description: "Налаштування Storage Spaces для зеркального і парного пулу дисків через GUI і PowerShell. Заміна несправного диска, обмеження і коли варто використовувати замість апаратного RAID."
tags: ["windows", "storage-spaces", "raid", "диск", "адміністрування", "powershell"]
readTime: 6
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

## Налаштування через GUI

`Панель керування` → **Сховища** → **Створити нове сховище і пул сховищ**:

1. Вибери диски для пулу (не менше 2 для захисту)
2. Дай ім'я пулу
3. Створи Space — вибери тип (Mirror або Parity)
4. Вкажи розмір (можна більше фізичного — thin provisioning)
5. Відформатуй і призначи букву

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

# Або відновити пул одразу після заміни
Get-StoragePool -FriendlyName "DataPool" | Repair-StoragePool
```

---

## Розширити простір

```powershell
Resize-VirtualDisk -FriendlyName "DataMirror" -Size 1TB
```

---

## Обмеження Storage Spaces

- Не замінює повноцінний апаратний RAID для критичних систем
- Не підтримує завантаження Windows з Simple або Mirror Space (тільки системний том)
- При видаленні пулу — всі дані видаляються
- Parity тип — значно повільніший запис ніж Mirror

---

## Чи варто використовувати

**Так, якщо:** домашній медіасервер або сховище документів, потрібен захист від відмови диска без покупки RAID контролера, є 2+ зайвих диски.

**Ні, якщо:** критична база даних або виробниче середовище (апаратний RAID), потрібна максимальна продуктивність (NVMe RAID або окремі диски).

---

## Часті питання

### Storage Spaces надійніший за апаратний RAID?

Для дому і малого офісу — так. Для підприємства — апаратні RAID контролери мають виділений кеш і стабільнішу продуктивність під навантаженням.

### Якщо Windows відмовить — чи доступний пул з іншого ПК?

Так. Перемісти всі диски на інший Windows ПК. Метадані Storage Spaces зберігаються на дисках.

---

## Резюме

`New-StoragePool` для пулу. `New-VirtualDisk -ResiliencySettingName Mirror` для зеркала. Thin provisioning для гнучкості. Mirror вимагає мінімум 2 диски. `Get-VirtualDisk` для перевірки.
