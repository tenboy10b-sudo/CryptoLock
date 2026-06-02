---
title: "Керування локальними обліковими записами Windows 10 і 11"
date: "2026-05-19"
publishDate: "2026-05-19"
description: "Створення, зміна і видалення локальних облікових записів Windows. Паролі, групи, типи облікових записів і контроль доступу через PowerShell."
tags: ["windows", "облікові-записи", "безпека", "адміністрування", "powershell"]
readTime: 4
translatesEn: "how-to-manage-local-users-windows"
---

Керування локальними обліковими записами важливе для спільних ПК, захисту і лабораторних середовищ.

---

## Список всіх користувачів

```powershell
Get-LocalUser | Select-Object Name, Enabled, PasswordRequired, LastLogon |
  Format-Table -AutoSize

# Хто зараз увійшов
query user
```

---

## Створити новий акаунт

```powershell
$pass = ConvertTo-SecureString "SecureP@ss!" -AsPlainText -Force
New-LocalUser -Name "NewUser" -Password $pass -FullName "John Doe"

# Адмін акаунт
New-LocalUser -Name "AdminUser" -Password $pass
Add-LocalGroupMember -Group "Administrators" -Member "AdminUser"
```

---

## Змінити акаунт

```powershell
# Змінити пароль
$newPass = ConvertTo-SecureString "NewP@ss!" -AsPlainText -Force
Set-LocalUser -Name "Username" -Password $newPass

# Вимкнути
Disable-LocalUser -Name "Username"

# Перейменувати
Rename-LocalUser -Name "OldName" -NewName "NewName"
```

---

## Видалити акаунт

```powershell
Remove-LocalUser -Name "Username"

# Також видалити профіль
$profile = Get-WmiObject Win32_UserProfile | Where-Object {$_.LocalPath -like "*Username*"}
$profile.Delete()
```

---

## Групи і членство

```powershell
Get-LocalGroupMember -Group "Administrators"
Add-LocalGroupMember -Group "Remote Desktop Users" -Member "Username"
Remove-LocalGroupMember -Group "Administrators" -Member "Username"
```

---

## Захист вбудованих акаунтів

```powershell
# Вимкнути Guest
Disable-LocalUser -Name "Guest"

# Перейменувати вбудований Administrator
Rename-LocalUser -Name "Administrator" -NewName "LocalAdmin2026"
```

---

## Часті питання

### Різниця між адміністратором і стандартним користувачем?

Адміністратор може встановлювати ПЗ і змінювати системні налаштування. Стандартний користувач обмежений власним профілем — набагато безпечніше для щоденного використання.

### Як увійти в інший акаунт без перезавантаження?

`Win + L` → клік на інший акаунт на екрані входу. Або `runas /user:НазваАкаунту cmd` для запуску застосунку від імені іншого користувача.

---

## Резюме

`New-LocalUser` для створення, `Set-LocalUser` для зміни, `Remove-LocalUser` для видалення. `Add/Remove-LocalGroupMember` для груп. Завжди вимикай Guest. Один адмін акаунт з надійним паролем, стандартний для роботи.
