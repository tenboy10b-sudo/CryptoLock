---
title: "Як відновити доступ до файлів і папок в Windows"
date: "2026-04-16"
publishDate: "2026-04-16"
description: "Що робити якщо Windows каже 'немає доступу до папки', файл заблокований або потрібні права адміністратора. Як взяти право власності і змінити дозволи NTFS."
tags: ["windows", "файли", "безпека", "адміністрування"]
readTime: 4
---

"Немає доступу до папки" або "Вам потрібен дозвіл від..." — типові помилки при роботі з системними файлами або файлами від іншого облікового запису. Ось як виправити.

---

## Взяти право власності на папку

**Через графічний інтерфейс:**
Правий клік на папці → **Властивості** → **Безпека** → **Додатково** → **Власник: Змінити** → введи своє ім'я → **OK** → постав галочку **Замінити власника підконтейнерів і об'єктів** → **OK**.

**Через CMD (швидше):**
```cmd
rem Взяти право власності
takeown /f "C:\SystemFolder" /r /d y

rem Дати повний доступ
icacls "C:\SystemFolder" /grant Administrators:F /t
```

**Через PowerShell:**
```powershell
# Взяти право власності
$path = "C:\LockedFolder"
$acl = Get-Acl $path
$owner = New-Object System.Security.Principal.NTAccount($env:USERNAME)
$acl.SetOwner($owner)
Set-Acl $path $acl

# Дати повний доступ
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
  $env:USERNAME, "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow"
)
$acl.AddAccessRule($rule)
Set-Acl $path $acl
```

---

## Файл заблокований іншою програмою

Якщо не можеш видалити або перейменувати файл бо він "використовується":

```powershell
# Знайти хто тримає файл (через Resource Monitor)
# Win + R → resmon → CPU → Associated Handles → введи ім'я файлу

# Або через PowerShell з Sysinternals (потрібен handle.exe)
# handle.exe "filename.txt"
```

Або в **Task Manager** → вкладка **Деталі** → знайди процес → завершити задачу → повторити видалення.

---

## Видалити незнищуваний файл

Якщо файл не видаляється навіть після закриття програм:

```powershell
# Видалити при наступному перезавантаженні
$source = "C:\Locked\file.exe"
$null = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
  [System.Runtime.InteropServices.Marshal]::StringToHGlobalAnsi($source)
)

# Простіший спосіб через cmd
cmd /c "del /f /q `"C:\Locked\file.exe`""
```

Або: перезавантаж → відразу видали до завантаження Windows Explorer (через Recovery CMD).

---

## Відновити дозволи до стандартних

Якщо випадково зламав права доступу:

```cmd
rem Відновити стандартні дозволи для системної папки
icacls "C:\Windows" /reset /t /c /q

rem Відновити для папки користувача
icacls "C:\Users\%USERNAME%" /reset /t /c /q
```

---

## Типові помилки і рішення

**"Вам потрібен дозвіл від TrustedInstaller":**
Системні файли захищені TrustedInstaller. Рідко потрібно їх міняти. Якщо необхідно:
```cmd
takeown /f "C:\Windows\System32\file.dll"
icacls "C:\Windows\System32\file.dll" /grant Administrators:F
```

**"Операція вимагає підвищення привілеїв":**
Запусти CMD або PowerShell від адміністратора: `Win + X` → **Термінал (адміністратор)**.

**"Файл використовується іншим процесом" при видаленні:**
`Shift + Delete` іноді допомагає. Або завантажся в Safe Mode і видали.

---

## Резюме

Для помилки "Немає доступу": `takeown /f папка /r /d y` потім `icacls папка /grant Administrators:F /t`. Для заблокованих файлів: знайди процес через Resource Monitor і завери його. Для системних файлів захищених TrustedInstaller: спочатку `takeown`, потім `icacls`.
