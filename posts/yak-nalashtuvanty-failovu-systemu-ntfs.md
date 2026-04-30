---
title: "NTFS: права доступу, атрибути і інструменти управління в Windows"
date: "2026-08-30"
publishDate: "2026-08-30"
description: "Файлова система NTFS в Windows: права доступу, атрибути файлів, шифрування EFS, квоти диска, тіньові копії і управління через icacls і PowerShell."
tags: ["windows", "адміністрування", "безпека", "диск", "powershell", "cmd"]
readTime: 7
---

NTFS — файлова система Windows з вбудованою підтримкою прав доступу, шифрування і квот. Розуміння її можливостей важливе для кожного адміністратора.

---

## Атрибути файлів

```cmd
rem Переглянути атрибути
attrib C:\файл.txt

rem Встановити атрибут "тільки читання"
attrib +r C:\файл.txt

rem Прибрати атрибут "тільки читання"
attrib -r C:\файл.txt

rem Приховати файл
attrib +h C:\файл.txt

rem Системний файл
attrib +s C:\файл.txt

rem Архівний атрибут (для резервного копіювання)
attrib +a C:\папка\* /s /d
```

Атрибути: `R` = ReadOnly, `H` = Hidden, `S` = System, `A` = Archive.

---

## Права доступу NTFS через icacls

```cmd
rem Переглянути права
icacls C:\Folder

rem Надати повний контроль
icacls C:\Folder /grant "UserName:(OI)(CI)F"

rem Тільки читання
icacls C:\Folder /grant "Domain Users:(OI)(CI)R"

rem Читання і виконання
icacls C:\Folder /grant "UserName:(OI)(CI)RX"

rem Видалити права користувача
icacls C:\Folder /remove "UserName"

rem Заборонити (Deny)
icacls C:\Folder /deny "UserName:(OI)(CI)W"

rem Скинути права до успадкованих
icacls C:\Folder /reset /T /C

rem Взяти права власника
icacls C:\Folder /setowner "Administrators" /T /C

rem Зберегти права у файл
icacls C:\Folder /save permissions.txt /T
```

Прапорці успадкування: `(OI)` — об'єкти всередині, `(CI)` — контейнери всередині.

---

## Права через PowerShell

```powershell
# Переглянути ACL
Get-Acl "C:\Folder" | Format-List

# Додати право читання для користувача
$acl = Get-Acl "C:\Folder"
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
    "DOMAIN\UserName", "Read", "ContainerInherit,ObjectInherit", "None", "Allow"
)
$acl.AddAccessRule($rule)
Set-Acl "C:\Folder" $acl

# Скопіювати права з однієї папки на іншу
$sourceAcl = Get-Acl "C:\SourceFolder"
Set-Acl "C:\DestFolder" $sourceAcl
```

---

## Шифрування EFS

EFS (Encrypting File System) — шифрування на рівні файлів, прив'язане до облікового запису.

```cmd
rem Зашифрувати файл або папку
cipher /e C:\Private\document.docx
cipher /e /s:C:\Private

rem Розшифрувати
cipher /d C:\Private\document.docx

rem Переглянути зашифровані файли
cipher /u /n

rem Зробити резервну копію сертифіката EFS
certmgr.msc
rem Certificates (Current User) → Personal → Certificates
rem Знайди EFS сертифікат → Export
```

> Обов'язково зроби резервну копію EFS сертифіката. Без нього при зміні облікового запису або перевстановленні Windows дані будуть втрачені.

---

## Квоти диска

Обмежити скільки місця може зайняти кожен користувач.

```powershell
# Увімкнути квоти на диску C
$disk = Get-WmiObject Win32_LogicalDisk -Filter "DeviceID='C:'"

# Через fsutil
fsutil quota enable C:
fsutil quota modify C: 10737418240 12884901888 # 10 ГБ попередження, 12 ГБ ліміт
```

Або через GUI: Провідник → правою на диск C → Властивості → вкладка Квота.

---

## Тіньові копії (Volume Shadow Copy)

```powershell
# Список тіньових копій
Get-WmiObject Win32_ShadowCopy | Select-Object ID, InstallDate, VolumeName

# Або через vssadmin
vssadmin list shadows

# Створити тіньову копію
$class = [WMICLASS]"root\cimv2:Win32_ShadowCopy"
$class.Create("C:\", "ClientAccessible")

# Видалити тіньові копії
vssadmin delete shadows /all /quiet

# Переглянути простір під VSS
vssadmin list shadowstorage
```

Детальніше про відновлення з тіньових копій: [Як відновити видалені файли](/yak-vidnovyty-vydaleni-fayly-windows)

---

## Перевірка NTFS на помилки

```cmd
rem Перевірка і виправлення
chkdsk C: /f /r

rem Тільки перегляд без виправлення
chkdsk C:

rem Перевірка через PowerShell
Repair-Volume -DriveLetter C -Scan
Repair-Volume -DriveLetter C -OfflineScanAndFix
```

Детальніше: [Перевірка диска chkdsk](/perevirka-dysku-na-pomylky-chkdsk)

---

## Alternate Data Streams (ADS)

NTFS підтримує приховані потоки даних — файл може мати приховані дані "всередині".

```powershell
# Знайти файли з ADS (може використовуватись шкідливим ПЗ)
Get-ChildItem -Recurse | Get-Item -Stream * |
  Where-Object { $_.Stream -ne ':$DATA' } |
  Select-Object FileName, Stream, Length

# Переглянути вміст ADS
Get-Content "file.txt:hidden_stream"

# Видалити ADS
Remove-Item "file.txt" -Stream "hidden_stream"
```

---

## Підсумок

`icacls` — стандартний інструмент для прав в CMD. PowerShell `Get-Acl` / `Set-Acl` — для скриптів. EFS — шифрування файлів прив'язане до акаунту (завжди роби резервну копію сертифіката). `vssadmin` — управління тіньовими копіями. `chkdsk /f /r` — виправлення помилок файлової системи.
