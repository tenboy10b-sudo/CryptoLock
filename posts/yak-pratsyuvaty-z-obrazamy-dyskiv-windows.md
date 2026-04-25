---
title: "Образи дисків в Windows: монтування ISO, створення і запис"
date: "2026-07-23"
publishDate: "2026-07-23"
description: "Робота з образами дисків в Windows 10 і 11: монтування ISO без програм, створення образу диска через PowerShell і DISM, запис на флешку через Rufus."
tags: ["windows", "диск", "інструменти", "відновлення", "cmd"]
readTime: 5
---

Windows вміє монтувати ISO образи без сторонніх програм і створювати образи дисків. Ось як це зробити.

---

## Монтування ISO в Windows

### Через Провідник (найпростіше)

Двічі клікни на .iso файл → Windows автоматично монтує його як віртуальний DVD-привід.

Або: правою кнопкою на .iso → **Підключити**

Віртуальний диск з'явиться в Провіднику як DVD-диск з буквою (наприклад D:).

**Відключити:** правою кнопкою на віртуальний диск → **Витягти**.

### Через PowerShell

```powershell
# Підключити ISO
Mount-DiskImage -ImagePath "C:\Downloads\windows11.iso"

# Переглянути підключені образи
Get-DiskImage | Where-Object { $_.Attached -eq $true }

# Знайти букву диска
(Get-DiskImage "C:\Downloads\windows11.iso" | Get-Volume).DriveLetter

# Відключити
Dismount-DiskImage -ImagePath "C:\Downloads\windows11.iso"
```

---

## Створити ISO образ диска

### Через DISM (вбудований)

```cmd
rem Створити образ системного розділу
dism /capture-image /imagefile:C:\backup\system.wim /capturedir:C:\ /name:"Windows Backup"

rem Конвертувати WIM у ISO (потрібен oscdimg з Windows ADK)
oscdimg -n -m C:\SourceFolder C:\output.iso
```

### Через PowerShell — образ тільки даних

```powershell
# Встановити модуль якщо немає
# New-IsoFile — вимагає сторонній модуль або IMAPI2

# Альтернатива — через robocopy скопіювати і потім архівувати
```

---

## Записати ISO на USB флешку

### Через Rufus (рекомендовано для Windows)

1. Завантаж **Rufus** з rufus.ie (безкоштовний, без встановлення)
2. Вибери USB флешку в **Пристрій**
3. Вибери ISO через кнопку **Вибрати**
4. Схема розділів: **GPT** для сучасних ПК з UEFI, **MBR** для старих
5. **Старт** → зачекай 5–15 хвилин

### Через PowerShell і Windows Media Creation Tool

Для Windows 11 ISO — офіційний спосіб:

```powershell
# Завантажити Windows 11 через Media Creation Tool
# Завантаж з microsoft.com/software-download/windows11
# Запусти → вибери "USB flash drive"
```

---

## Монтувати VHD/VHDX образи

```powershell
# Підключити VHD
Mount-VHD -Path "C:\VMs\disk.vhdx"

# Переглянути підключені VHD
Get-VHD | Where-Object { $_.Attached -eq $true }

# Відключити
Dismount-VHD -Path "C:\VMs\disk.vhdx"

# Створити новий VHD (фіксований розмір 50 ГБ)
New-VHD -Path "C:\VMs\new-disk.vhdx" -SizeBytes 50GB -Fixed

# Динамічний VHD
New-VHD -Path "C:\VMs\dynamic.vhdx" -SizeBytes 100GB -Dynamic
```

---

## Перевірити цілісність ISO

```powershell
# Хеш SHA256 файлу
Get-FileHash "C:\Downloads\ubuntu.iso" -Algorithm SHA256

# Порівняти з офіційним хешем з сайту
# Якщо збігається — файл не пошкоджений і не підмінений
```

---

## Типові проблеми

### ISO не монтується — "Неправильний образ диска"

Файл пошкоджений при завантаженні. Перевір хеш і завантаж заново.

### Флешка не завантажується після Rufus

Перевір в BIOS що Boot Mode відповідає схемі розділів: GPT → UEFI, MBR → Legacy/CSM.

### Виртуальний диск не з'являється в Провіднику

```powershell
# Перезапустити Shell Hardware Detection
Restart-Service ShellHWDetection
```

---

## Підсумок

Монтування ISO — двічі клікни або `Mount-DiskImage`. Запис на флешку — Rufus. Перевірка цілісності — `Get-FileHash` і порівняй SHA256 з сайту виробника. VHD образи монтуються так само через `Mount-VHD` і використовуються в Hyper-V.
