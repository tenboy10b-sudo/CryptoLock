---
title: "Підключення принтера в Windows: USB, Wi-Fi, мережа і домен — повний гайд"
date: "2025-11-24"
updated: "2026-07-22"
publishDate: "2025-11-24"
description: "Як підключити принтер в Windows: USB, Wi-Fi, по IP-адресі в мережі, спільний принтер з іншого ПК. Для організацій — Print Server і розгортання через GPO. Усі типові проблеми."
tags: ["адміністрування", "мережа", "windows", "групова-політика", "gpo", "принтер", "налаштування"]
translatesEn: "how-to-set-up-network-printer-windows"
readTime: 10
---

Принтер не друкує або Windows його не бачить — одна з найпоширеніших проблем. Цей гайд охоплює всі способи підключення — від простого USB до розгортання сотень принтерів у домені через GPO.

---

## Спосіб 1: USB (найпростіший)

1. Підключи USB-кабель, увімкни принтер
2. Windows зазвичай сама встановлює драйвер через Windows Update — зачекай 1-2 хвилини
3. Перевір: `Пуск` → `Параметри` → `Пристрої` → `Принтери та сканери` → якщо з'явився, натисни → **Керувати** → **Друк тестової сторінки**

**Якщо драйвер не встановився сам:** знайди модель принтера (на корпусі), зайди на сайт виробника (hp.com, canon.com, epson.com, brother.com) → Підтримка → Драйвери → введи модель → завантаж.

---

## Спосіб 2: Wi-Fi

### Через WPS (найшвидше)

На принтері знайди кнопку **WPS** (значок хвиль) → натисни WPS на роутері → утримуй WPS на принтері 2-3 секунди → підключення відбудеться автоматично.

### Через меню принтера

На панелі принтера: **Мережа** або **Wi-Fi Setup** → вибери свою мережу → введи пароль. Принтер отримає IP-адресу.

### Додати в Windows після підключення до Wi-Fi

`Параметри` → `Пристрої` → `Принтери та сканери` → **Додати принтер або сканер** — Windows знайде його автоматично. Якщо ні — **"Потрібного принтера немає в списку"** → **"Додати принтер за IP-адресою"**.

---

## Спосіб 3: По IP-адресі в мережі (офісний стандарт)

Коли один принтер обслуговує кілька ПК — підключення йде через мережу по IP, не USB.

### Крок 1: Дізнатись IP-адресу принтера

Роздрукуй тестову/конфігураційну сторінку (кнопка на принтері, утримати 5-10 сек) — IP буде в інформації про мережу. Або перевір список пристроїв на роутері.

### Крок 2: Перевірити доступність

```cmd
ping 192.168.1.50
```

Якщо не відповідає — принтер не в тій самій мережі або вимкнений.

### Крок 3: Додати через TCP/IP порт

**Через GUI:** `Параметри` → `Принтери та сканери` → **Додати пристрій** → **"Потрібного принтера немає в списку"** → **"Додати принтер по TCP/IP адресі"** → введи IP.

**Через PowerShell:**
```powershell
Add-PrinterPort -Name "IP_192.168.1.50" -PrinterHostAddress "192.168.1.50"
Add-PrinterDriver -Name "HP Universal Printing PCL 6"
Add-Printer -Name "Office Printer" -DriverName "HP Universal Printing PCL 6" -PortName "IP_192.168.1.50"
(Get-WmiObject -Class Win32_Printer -Filter "Name='Office Printer'").SetDefaultPrinter()
```

**Якщо драйвер не знайшовся автоматично:** завантаж з сайту виробника, при виборі типу підключення — **Мережа**. Універсальні драйвери: **HP Universal Print Driver**, **Kyocera Universal Printer Driver** — підходять для більшості моделей відповідного бренду.

### Перевірка підключення

```powershell
Get-Printer | Select-Object Name, PortName, DriverName, PrinterStatus

# Порт 9100 — стандарт для мережевого друку
Test-NetConnection -ComputerName 192.168.1.50 -Port 9100

# Тестова сторінка
(Get-WmiObject -Class Win32_Printer -Filter "Name='Office Printer'").PrintTestPage()
```

**Якщо Windows не бачить принтер при автопошуку** — він може не підтримувати WSD (Web Services for Devices), підключай вручну через TCP/IP як вище.

---

## Спосіб 4: Підключитись до принтера, спільного з іншого ПК

Якщо принтер підключений до чужого комп'ютера в мережі (не сервера):

`Параметри` → `Принтери та сканери` → **Додати принтер** → **"Потрібного принтера немає в списку"** → **"Вибрати спільний принтер за іменем"** → введи:

```
\\ім'я-комп'ютера\ім'я-принтера
```
або
```
\\192.168.1.100\HP_LaserJet
```

Через PowerShell:
```powershell
Set-Printer -Name "EPSON" -Shared $true -ShareName "EpsonOffice"
Add-Printer -ConnectionName "\\НазваПК\EpsonOffice"
```

---

## Для організацій з доменом Active Directory

Ручне підключення принтерів на десятках комп'ютерів — типовий головний біль адміністратора. Print Server і GPO автоматизують це до нуля ручної роботи.

### Print Server — централізоване управління

```powershell
# Встановити роль
Install-WindowsFeature -Name Print-Server -IncludeManagementTools

# Додати драйвер, порт і принтер на сервері
Add-PrinterDriver -Name "HP Universal Printing PCL 6"
Add-PrinterPort -Name "IP_192.168.1.50" -PrinterHostAddress "192.168.1.50"
Add-Printer -Name "HP-LaserJet-Floor2" -DriverName "HP Universal Printing PCL 6" `
  -PortName "IP_192.168.1.50" -Shared -ShareName "HP-LaserJet-2"
```

### Управління чергою через PowerShell (централізовано)

```powershell
Get-Printer -ComputerName printserver | Select-Object Name, DriverName, PortName, Shared
Get-PrintJob -PrinterName "HP-LaserJet-Floor2" -ComputerName printserver
Remove-PrintJob -PrinterName "HP-LaserJet-Floor2" -ID 15 -ComputerName printserver

# Перезапустити Spooler віддалено, якщо черга зависла
Invoke-Command -ComputerName printserver -ScriptBlock {
    Stop-Service -Name Spooler -Force
    Start-Service -Name Spooler
}
```

### GPO — автоматичне розгортання при вході користувача

`gpmc.msc` → GPO для потрібного OU → **User Configuration** → **Preferences** → **Control Panel Settings** → **Printers** → правою кнопкою → **New** → **Shared Printer**:
- **Action:** Create (або Replace для перестворення)
- **Share path:** `\\printserver\HP-LaserJet-2`
- Вкладка **Common** → **Item-level targeting** — для призначення конкретним групам/OU

**Item-Level Targeting** дозволяє видавати принтер вибірково: **Security Group** (наприклад тільки "Бухгалтерія"), **Organizational Unit**, **Computer Name**, або **IP Address Range** (за поверхом/відділом).

```powershell
# Підключення принтера скриптом при вході (альтернатива GPO Preferences)
Add-Printer -ConnectionName "\\printserver\HP-LaserJet-2" -ErrorAction SilentlyContinue
```

---

## Типові проблеми

### Принтер є в списку, але не друкує (черга зависла)

```cmd
net stop spooler
del /Q /F /S "%systemroot%\System32\spool\PRINTERS\*.*"
net start spooler
```

Або через PowerShell: `Stop-Service Spooler -Force` → очистити папку → `Start-Service Spooler`.

### Принтер показує "Офлайн"

`Параметри` → `Принтери та сканери` → вибери принтер → **Керувати** → зніми **"Використовувати принтер в автономному режимі"**. Часто причина — DHCP переприсвоїв принтеру нову IP-адресу; постав принтеру статичний IP, щоб це не повторювалось.

```powershell
Set-Printer -Name "Офісний принтер" -WorkOffline $false
Restart-Service Spooler -Force
```

### Помилка "Принтер недоступний" / порт не відповідає

```cmd
telnet 192.168.1.50 9100
```

З'єднання встановлюється — порт відкритий, проблема деінде. Не встановлюється — перевір брандмауер принтера або мережеві налаштування.

### "Driver not installed" (для Print Server)

Для 64-бітних клієнтів потрібен саме 64-бітний драйвер на сервері:

```powershell
Get-PrinterDriver -ComputerName printserver
Add-PrinterDriver -Name "HP Universal Printing PCL 6" -InfPath "C:\Drivers\HP\hpcu215u.inf"
```

### GPO-принтер не підключається

```cmd
gpresult /r /scope user | findstr /i "printer"
gpupdate /force
```

### Поганий друк, смуги або сміття замість тексту

Запусти очищення головки через меню принтера (Обслуговування → Очищення головки), перевір рівень чорнила/тонера. Сміття замість тексту зазвичай означає невірний драйвер — встанови рідний з сайту виробника або спробуй інший PCL/PostScript варіант.

### Принтер зник після оновлення Windows

Оновлення іноді ламає драйвер. Видали принтер зі списку і додай заново, або перевстанови драйвер з сайту виробника.

---

Детальніше про виправлення "принтер не друкує" (застряглий друк, офлайн, драйвери) — окремий гайд: [Принтер не друкує в Windows](/prynter-ne-druukuie-windows-vyrishennya)

---

## Підсумок

**Вдома/невеликий офіс:** USB — найнадійніше, Wi-Fi через WPS — найзручніше, по IP — коли принтер один на кілька ПК. **Для домену:** Print Server + `Add-Printer` + розгортання через GPO Preferences з Item-Level Targeting по групах безпеки. **Зависла черга** (найчастіша проблема в обох випадках) — `net stop spooler` → очистити папку PRINTERS → `net start spooler`.

---

## 🌐 Розрахувати параметри підмережі?

**[→ IP/Subnet калькулятор](/tools/subnet-calculator)** — введи IP і CIDR, отримай маску, broadcast, діапазон хостів і бінарне представлення.
