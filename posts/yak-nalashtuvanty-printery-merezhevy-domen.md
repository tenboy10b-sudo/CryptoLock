---
title: "Мережевий принтер у домені Windows: встановлення і управління через GPO"
date: "2026-06-17"
publishDate: "2026-06-17"
description: "Підключення мережевого принтера в домені Active Directory, автоматичне розгортання принтерів через GPO і Print Server, управління чергою друку через PowerShell."
tags: ["адміністрування", "мережа", "windows", "групова-політика", "gpo"]
readTime: 7
---

Ручне підключення принтерів на 50+ комп'ютерах — типовий головний біль адміністратора. GPO і Print Server автоматизують це до нуля ручної роботи.

---

## Варіант 1: Пряме підключення мережевого принтера

Для одиничних підключень без домену або сервера друку.

```cmd
rem Підключити мережевий принтер
rundll32 printui.dll,PrintUIEntry /in /n \\printserver\HP-LaserJet

rem Або через PowerShell
Add-Printer -ConnectionName "\\printserver\HP-LaserJet"

rem Встановити принтер за замовчуванням
(Get-WmiObject Win32_Printer -Filter "Name='\\\\printserver\\HP-LaserJet'").SetDefaultPrinter()
```

---

## Варіант 2: Print Server — централізоване управління

Print Server — роль Windows Server яка централізує управління всіма принтерами в організації.

### Встановлення ролі Print Server

```powershell
Install-WindowsFeature -Name Print-Server -IncludeManagementTools
```

### Додати принтер на Print Server

```powershell
# Додати драйвер
Add-PrinterDriver -Name "HP Universal Printing PCL 6"

# Додати порт (IP принтера)
Add-PrinterPort -Name "IP_192.168.1.50" -PrinterHostAddress "192.168.1.50"

# Додати принтер
Add-Printer `
  -Name "HP-LaserJet-Floor2" `
  -DriverName "HP Universal Printing PCL 6" `
  -PortName "IP_192.168.1.50" `
  -Shared `
  -ShareName "HP-LaserJet-2"
```

### Управління чергою через PowerShell

```powershell
# Список всіх принтерів на сервері
Get-Printer -ComputerName printserver | Select-Object Name, DriverName, PortName, Shared

# Список завдань у черзі
Get-PrintJob -PrinterName "HP-LaserJet-Floor2" -ComputerName printserver

# Видалити зависле завдання
Remove-PrintJob -PrinterName "HP-LaserJet-Floor2" -ID 15 -ComputerName printserver

# Очистити всю чергу
Get-PrintJob -PrinterName "HP-LaserJet-Floor2" | Remove-PrintJob

# Перезапустити службу Spooler (якщо черга зависла)
Invoke-Command -ComputerName printserver -ScriptBlock {
    Stop-Service -Name Spooler -Force
    Start-Service -Name Spooler
}
```

---

## Варіант 3: GPO — автоматичне розгортання принтерів

Найкращий варіант для організацій — принтери підключаються автоматично при вході користувача.

### Через GPMC

1. `gpmc.msc` → вибери GPO для потрібного OU
2. **User Configuration** → **Preferences** → **Control Panel Settings** → **Printers**
3. Правою кнопкою → **New** → **Shared Printer**
4. **Action:** Create (або Replace щоб перестворювати)
5. **Share path:** `\\printserver\HP-LaserJet-2`
6. Постав галочку **Set this printer as the default printer** якщо потрібно
7. Вкладка **Common** → **Item-level targeting** — для призначення конкретним користувачам або OU

### Через PowerShell і GPO

```powershell
# Показати поточні підключені принтери
Get-Printer | Select-Object Name, Type, PortName

# Підключити принтер скриптом при вході (logon script через GPO)
Add-Printer -ConnectionName "\\printserver\HP-LaserJet-2" -ErrorAction SilentlyContinue

# Встановити за замовчуванням
$printer = Get-Printer -Name "\\printserver\HP-LaserJet-2"
(Get-WmiObject -Class Win32_Printer -Filter "Name='$($printer.Name.Replace('\','\\'))'").SetDefaultPrinter()
```

---

## Item-Level Targeting — принтер тільки для певних відділів

GPO Preferences дозволяє призначати принтери вибірково:

1. Відкрий правило принтера → вкладка **Common**
2. Постав галочку **Item-level targeting** → **Targeting**
3. **New Item** → вибери тип умови:
   - **Security Group** — тільки для членів групи (наприклад "Бухгалтерія")
   - **Organizational Unit** — тільки для OU
   - **Computer Name** — для конкретних ПК
   - **IP Address Range** — для певного поверху або відділу

---

## Типові проблеми

### Принтер є але не друкує — черга зависла

```powershell
# На клієнті або сервері
net stop spooler
Remove-Item "C:\Windows\System32\spool\PRINTERS\*" -Force -ErrorAction SilentlyContinue
net start spooler
```

### Помилка "Driver not installed"

Переконайся що на Print Server встановлений правильний драйвер. Для 64-бітних клієнтів потрібен 64-бітний драйвер:

```powershell
# Переглянути встановлені драйвери
Get-PrinterDriver -ComputerName printserver

# Встановити додатковий драйвер (для x86 клієнтів)
Add-PrinterDriver -Name "HP Universal Printing PCL 6" -InfPath "C:\Drivers\HP\hpcu215u.inf"
```

### GPO-принтер не підключається

```cmd
rem На клієнті перевір застосування GPO
gpresult /r /scope user | findstr /i "printer"

rem Примусово застосувати GPO
gpupdate /force
```

### Принтер показує "Offline"

```powershell
# Перевірити доступність Print Server
Test-Connection printserver

# Перевірити доступність IP принтера
Test-NetConnection -ComputerName 192.168.1.50 -Port 9100
```

---

## Підсумок

Для організацій з доменом: встанови Print Server, додай принтери через `Add-Printer`, розгортай через GPO Preferences з Item-Level Targeting по групах безпеки. Черга зависла — `net stop spooler`, очисти папку PRINTERS, `net start spooler`. Це закриває 90% проблем з мережевими принтерами.
