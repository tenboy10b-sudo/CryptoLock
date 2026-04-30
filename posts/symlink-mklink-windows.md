---
title: "Символічні посилання в Windows: mklink і як їх використовувати"
date: "2026-09-25"
publishDate: "2026-09-25"
description: "Як створювати символічні посилання і junction points в Windows через mklink і PowerShell: перенаправлення папок, економія місця і вирішення проблем з шляхами."
tags: ["windows", "cmd", "адміністрування", "інструменти", "диск"]
readTime: 5
---

Символічні посилання — це "псевдонім" для файлу або папки. Програма бачить посилання як звичайний файл але реальні дані зберігаються в іншому місці.

---

## Типи посилань у Windows

| Тип | Команда | Для чого |
|-----|---------|---------|
| Symbolic Link (файл) | `mklink link target` | Посилання на файл |
| Symbolic Link (папка) | `mklink /D link target` | Посилання на папку |
| Junction | `mklink /J link target` | Посилання на папку (локально) |
| Hard Link | `mklink /H link target` | Жорстке посилання на файл |

**Junction** vs **Symbolic Link папки:**
- Junction — тільки на локальні шляхи, не потребує прав адміна для створення
- Symbolic Link — може вказувати на мережеві шляхи, потребує SeCreateSymbolicLinkPrivilege

---

## Команда mklink

Відкрий **CMD від адміністратора**:

```cmd
rem Посилання на файл
mklink C:\link.txt C:\original\file.txt

rem Посилання на папку (символічне)
mklink /D C:\MyDocs C:\Users\User\Documents

rem Junction point
mklink /J C:\OldPath C:\NewPath

rem Hard link (тільки для файлів, не папок)
mklink /H C:\hardlink.txt C:\original.txt
```

---

## PowerShell

```powershell
# Створити symbolic link (файл)
New-Item -ItemType SymbolicLink -Path "C:\link.txt" -Target "C:\original\file.txt"

# Символічна папка
New-Item -ItemType SymbolicLink -Path "C:\MyDocs" -Target "C:\Users\User\Documents"

# Junction
New-Item -ItemType Junction -Path "C:\OldPath" -Target "C:\NewPath"

# Переглянути посилання в папці
Get-ChildItem C:\ | Where-Object { $_.LinkType } | Select-Object Name, LinkType, Target
```

---

## Практичні сценарії

### Перенести папку програми на інший диск

```cmd
rem Перенести Steam бібліотеку з C: на D:
rem 1. Закрити Steam
rem 2. Перемістити папку
robocopy "C:\Program Files (x86)\Steam" "D:\Steam" /MIR /MOVE

rem 3. Створити junction point
mklink /J "C:\Program Files (x86)\Steam" "D:\Steam"
rem Програма думає що папка на C: але дані на D:
```

### Перенаправити папку AppData

```cmd
rem Перенести кеш браузера на SSD кеш або RAM диск
mklink /D "%APPDATA%\Mozilla\Firefox\Profiles\cache" "D:\BrowserCache\Firefox"
```

### Спільний конфіг для кількох версій програми

```cmd
rem Обидві версії використовують один конфіг-файл
mklink "C:\App_v1\config.ini" "C:\SharedConfig\config.ini"
mklink "C:\App_v2\config.ini" "C:\SharedConfig\config.ini"
```

---

## Перевірити чи є посилання

```cmd
rem Показати атрибути файлу — символічне посилання буде SYMLINK або JUNCTION
dir /AL C:\

rem Або через PowerShell
(Get-Item "C:\link.txt").LinkType
```

---

## Видалити посилання

```cmd
rem Видалити символічне посилання (файл)
del C:\link.txt

rem Видалити junction або символічну папку
rmdir C:\MyDocs
```

> Не використовуй `rmdir /S` для junction points і symlinks — це може видалити дані в реальній папці!

---

## Підсумок

`mklink /J OldPath NewPath` — Junction point для переміщення папок (найбезпечніше). `mklink /D` — символічна папка. `mklink /H` — hard link для файлів. Використовуй для переносу великих папок програм на інший диск без зміни шляхів.
