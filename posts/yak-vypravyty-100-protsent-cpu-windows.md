---
title: "Як виправити 100% завантаження CPU в Windows 10 і 11"
date: "2027-02-03"
publishDate: "2027-02-03"
description: "Виправлення 100% завантаження процесора в Windows. Знайди який процес споживає CPU, зупини WmiPrvSE, TiWorker, SearchIndexer і усунь причину постійного гальмування."
tags: ["windows", "cpu", "продуктивність", "помилки", "powershell"]
readTime: 5
translatesEn: "how-to-fix-high-cpu-usage-windows-11"
---

100% CPU робить Windows гальмівною і нереагуючою. Ось як знайти причину і виправити назавжди.

---

## Знайти винуватця

```powershell
# Топ-10 процесів за CPU
Get-Process | Sort-Object CPU -Descending |
  Select-Object -First 10 Name, CPU, Id, @{n='RAM МБ';e={[math]::Round($_.WorkingSet/1MB,1)}}
```

Або: `Ctrl + Shift + Esc` → стовпець **CPU** → сортуй за спаданням.

---

## Поширені причини і виправлення

### WmiPrvSE.exe (WMI Provider Host)

```powershell
# Перезапустити WMI
Restart-Service Winmgmt -Force
```

### Windows Update (TiWorker.exe)

```powershell
# Тимчасово зупинити
Stop-Service wuauserv -Force
# Відновити пізніше:
Set-Service wuauserv -StartupType Automatic
Start-Service wuauserv
```

### SearchIndexer.exe

```powershell
# Перебудувати індекс
Stop-Service WSearch -Force
Remove-Item "C:\ProgramData\Microsoft\Search\Data\Applications\Windows\*" -Recurse -Force -EA 0
Start-Service WSearch
```

### Антивірус (MsMpEng.exe)

```powershell
# Перенести сканування на нічний час
Set-MpPreference -ScanScheduleTime 02:00
```

---

## Загальні виправлення

```powershell
# Відновити системні файли
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow

# Перевірити стан диску
Get-PhysicalDisk | Select-Object FriendlyName, HealthStatus

# Сканування на малваре
Start-MpScan -ScanType QuickScan

# Вимкнути SysMain на SSD
Stop-Service SysMain -Force
Set-Service SysMain -StartupType Disabled
```

---

## Перевірити температуру

Троттлінг через перегрів викликає постійне високе завантаження:

```powershell
winget install REALiX.HWiNFO
```

Норма: до 80°C під навантаженням. Вище 90°C = троттлінг.

---

## Часті питання

### 100% CPU — завжди проблема?

Ні — під час оновлень, сканувань або великих операцій з файлами це нормально і тимчасово. Проблема — якщо тривало кілька годин без очевидної причини.

### System Interrupts з високим CPU — що це?

Представляє обробку апаратних переривань. Висока завантаженість System Interrupts = проблема з драйвером або залізом, застарілі драйвери, несправне залізо або конфлікт USB пристроїв.

---

## Резюме

Знайди через Диспетчер завдань або `Get-Process`. Причини: WMI, Windows Update, SearchIndexer, антивірус. DISM + SFC для пошкоджень. Перевір температури. Вимкни SysMain на SSD.
