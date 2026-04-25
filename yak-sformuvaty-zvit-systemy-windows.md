---
title: "Як переглянути повну інформацію про комп'ютер в Windows"
date: "2026-05-28"
publishDate: "2026-05-28"
description: "Повна інформація про ПК в Windows: процесор, RAM, відеокарта, диск, материнська плата і ключ продукту. Через вбудовані засоби, CMD і PowerShell."
tags: ["windows", "діагностика", "обладнання", "cmd", "powershell"]
readTime: 5
---

Потрібно дізнатись характеристики ПК, знайти серійний номер або ключ Windows? Все це є у вбудованих інструментах без сторонніх програм.

---

## Спосіб 1: msinfo32 — найповніший звіт

`Win + R` → `msinfo32`

Тут є абсолютно все: процесор, RAM, материнська плата, BIOS, версія Windows, встановлені драйвери і програми, мережеві адаптери.

**Зберегти звіт у файл:**

`Файл` → `Зберегти` → збереже як .nfo файл.

---

## Спосіб 2: Параметри Windows — швидко

`Пуск` → `Параметри` → `Система` → `Про систему`

Тут: назва ПК, процесор, RAM, тип системи (32/64 біт), версія і збірка Windows.

---

## Спосіб 3: Диспетчер завдань — процесор і RAM

`Ctrl + Shift + Esc` → вкладка **Продуктивність**

- **CPU** — модель, кількість ядер, базова частота, поточне навантаження
- **Memory** — обсяг, кількість слотів, швидкість (МГц), тип (DDR4/DDR5)
- **GPU** — модель відеокарти, відеопам'ять

---

## Спосіб 4: dxdiag — для відеокарти

`Win + R` → `dxdiag`

Детальна інформація про відеокарту, звукову карту, DirectX версію і монітор.

---

## Детальна інформація через CMD

```cmd
rem Повна інформація про систему
systeminfo

rem Модель процесора
wmic cpu get Name, NumberOfCores, NumberOfLogicalProcessors, MaxClockSpeed

rem Обсяг і кількість планок RAM
wmic memorychip get Capacity, Speed, Manufacturer, PartNumber

rem Модель материнської плати
wmic baseboard get Manufacturer, Product, SerialNumber

rem Відеокарта
wmic path win32_VideoController get Name, AdapterRAM, DriverVersion

rem Диски
wmic diskdrive get Model, Size, InterfaceType, SerialNumber

rem Серійний номер ПК
wmic bios get SerialNumber

rem Ключ продукту Windows
wmic path softwarelicensingservice get OA3xOriginalProductKey
```

---

## Детальна інформація через PowerShell

```powershell
# Загальна інформація одним рядком
Get-ComputerInfo | Select-Object CsName, CsProcessors, CsTotalPhysicalMemory, OsName, OsVersion

# Процесор детально
Get-WmiObject Win32_Processor | Select-Object Name, NumberOfCores, NumberOfLogicalProcessors, MaxClockSpeed, CurrentClockSpeed

# RAM — кожна планка окремо
Get-WmiObject Win32_PhysicalMemory | Select-Object @{N="GB";E={[math]::Round($_.Capacity/1GB)}}, Speed, Manufacturer, PartNumber, BankLabel

# Диски
Get-PhysicalDisk | Select-Object FriendlyName, MediaType, Size, OperationalStatus

# Мережеві адаптери з IP
Get-NetIPConfiguration | Select-Object InterfaceAlias, IPv4Address, DNSServer

# Серійний номер материнської плати
(Get-WmiObject Win32_BaseBoard).SerialNumber

# Ключ продукту Windows (якщо вшитий у BIOS)
(Get-WmiObject -query 'select * from SoftwareLicensingService').OA3xOriginalProductKey
```

---

## Знайти ключ продукту Windows

```powershell
# Ключ вшитий у BIOS (OEM-ліцензія)
(Get-WmiObject -query 'select * from SoftwareLicensingService').OA3xOriginalProductKey

# Якщо вище не спрацювало — через реєстр
$path = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\SoftwareProtectionPlatform'
(Get-ItemProperty -Path $path).BackupProductKeyDefault
```

---

## Перевірити чи активована Windows

```cmd
slmgr /xpr
```

З'явиться вікно з інформацією про статус активації і дату закінчення.

---

## Експортувати всю інформацію в файл

```powershell
# Зберегти повний системний звіт
Get-ComputerInfo | Out-File "C:\system-info.txt" -Encoding UTF8

# Або у CSV
systeminfo /fo CSV > C:\sysinfo.csv
```

---

## Підсумок

Для швидкої перевірки характеристик — `msinfo32` або Диспетчер завдань. Для серійного номера і ключа продукту — `wmic bios get SerialNumber` і `wmic path softwarelicensingservice get OA3xOriginalProductKey`. PowerShell дає найповнішу інформацію з можливістю зберегти у файл.
