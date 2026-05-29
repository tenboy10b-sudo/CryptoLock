---
title: "Як виправити синій екран смерті (BSOD) в Windows 10 і 11"
date: "2026-05-28"
publishDate: "2026-05-28"
description: "Виправлення BSOD в Windows 10 і 11. Читання кодів зупинки, аналіз дампів пам'яті, пошук проблемного драйвера і постійне вирішення синього екрану."
tags: ["windows", "bsod", "помилки", "драйвери", "відновлення"]
readTime: 5
translatesEn: "how-to-fix-bsod-windows"
---

BSOD означає що Windows зіткнулась з помилкою з якої не змогла відновитись. Більшість спричинені драйверами, RAM або залізом.

---

## Прочитати код зупинки

```powershell
# Знайти код з останнього краша
Get-WinEvent -FilterHashtable @{LogName='System'; Id=1001} -MaxEvents 3 |
  Select-Object TimeCreated, Message | Format-List
```

---

## Поширені коди і виправлення

| Код | Причина | Перший крок |
|-----|---------|------------|
| `SYSTEM_THREAD_EXCEPTION_NOT_HANDLED` | Драйвер | Видалити оновлений драйвер |
| `PAGE_FAULT_IN_NONPAGED_AREA` | RAM або драйвер | Тест RAM, оновити драйвер |
| `CRITICAL_PROCESS_DIED` | Системний процес | DISM + SFC |
| `0x0000018B` SECURE_KERNEL_ERROR | Погане оновлення | Видалити KB5053656 |
| `MEMORY_MANAGEMENT` | Несправна RAM | mdsched.exe |
| `DPC_WATCHDOG_VIOLATION` | Драйвер або SSD | Оновити прошивку SSD |

---

## Аналіз дампу пам'яті

```powershell
# Дампи в папці Minidump
Get-ChildItem "C:\Windows\Minidump" -EA 0 |
  Sort-Object LastWriteTime -Descending | Select-Object -First 5 FullName

# Журнал подій
Get-WinEvent -FilterHashtable @{LogName='System'; Level=1,2} -MaxEvents 10 |
  Where-Object {$_.Id -in @(41, 1001, 6008)} |
  Select-Object TimeCreated, Id, Message | Format-List
```

Для глибокого аналізу — **WinDbg** з Microsoft Store → відкрий `.dmp` файл → `!analyze -v`

---

## Знайти і видалити проблемний драйвер

```powershell
# Останні встановлені драйвери
Get-WindowsDriver -Online | Sort-Object Date -Descending |
  Select-Object -First 15 Driver, Date, ProviderName

# Видалити драйвер
pnputil /delete-driver oem12.inf /uninstall /force
```

Або через Диспетчер пристроїв → ПКМ на пристрої → Властивості → Драйвер → **Відкотити**.

---

## Відновити системні файли

```powershell
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
```

---

## Перевірити RAM

Випадкові BSOD з різними кодами — часто несправна RAM:

```cmd
mdsched.exe
```

---

## Перевірити температури

Перегрів викликає випадкові BSOD під навантаженням:

```powershell
winget install REALiX.HWiNFO
```

---

## Часті питання

### Як дізнатись — драйвер чи залізо?

Драйвер: BSOD після змін ПЗ, один і той же код, зникає після видалення драйвера. Залізо: випадкові BSOD з різними кодами, зберігаються після перевстановлення Windows.

### ПК перезавантажується занадто швидко і не видно BSOD?

Вимкни автоперезавантаження: `sysdm.cpl` → Додатково → Завантаження та відновлення → зніми "Автоматичний перезапуск".

---

## Резюме

Прочитай код → аналіз Minidump через WinDbg → видали/відкоти проблемний драйвер → DISM + SFC → тест RAM → перевір температури.
