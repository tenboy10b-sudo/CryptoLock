---
title: "Управління правами користувачів в Windows: локальні групи і дозволи"
date: "2026-07-16"
publishDate: "2026-07-16"
description: "Налаштування прав доступу в Windows: локальні групи, додавання і видалення користувачів, дозволи на папки і файли, принцип мінімальних привілеїв."
tags: ["windows", "безпека", "адміністрування", "облікові-записи", "cmd"]
readTime: 6
---

Правильне розмежування прав — основа безпеки Windows. Користувач без прав адміністратора не може встановити шкідливе ПЗ навіть якщо клікне на вірус.

---

## Вбудовані локальні групи Windows

| Група | Права |
|-------|-------|
| Administrators | Повний контроль над системою |
| Users | Стандартні права, не можуть встановлювати ПЗ |
| Power Users | Застарілий, майже як Users у Win 10/11 |
| Remote Desktop Users | Право підключатись через RDP |
| Backup Operators | Можуть робити backup без прав адміна |
| Event Log Readers | Читати журнали подій |
| Network Configuration Operators | Змінювати мережеві налаштування |

---

## Управління локальними групами

```cmd
rem Переглянути всі локальні групи
net localgroup

rem Члени конкретної групи
net localgroup Administrators

rem Додати користувача в групу
net localgroup Administrators UserName /add

rem Видалити з групи
net localgroup Administrators UserName /delete

rem Додати в групу Remote Desktop Users
net localgroup "Remote Desktop Users" UserName /add
```

```powershell
# Те саме через PowerShell
Get-LocalGroup
Get-LocalGroupMember -Group "Administrators"
Add-LocalGroupMember -Group "Administrators" -Member "UserName"
Remove-LocalGroupMember -Group "Administrators" -Member "UserName"
```

---

## Створити нового локального користувача

```powershell
# Створити користувача
New-LocalUser -Name "Employee" `
  -Password (ConvertTo-SecureString "P@ssw0rd!" -AsPlainText -Force) `
  -FullName "Іван Петренко" `
  -Description "Бухгалтерія" `
  -PasswordNeverExpires $false `
  -UserMayNotChangePassword $false

# Додати в стандартну групу Users
Add-LocalGroupMember -Group "Users" -Member "Employee"

# Переглянути інформацію про користувача
Get-LocalUser -Name "Employee"
```

---

## Принцип мінімальних привілеїв

Правило: кожен користувач має рівно ті права що потрібні для роботи — і не більше.

Практично:
- Звичайний користувач → група **Users**
- ІТ-спеціаліст → **Users** для роботи, окремий **Administrators** акаунт для адмінських задач
- Сервісний акаунт → окремий акаунт з мінімально необхідними правами, не адміністратор

---

## Дозволи на папки і файли (NTFS)

```powershell
# Переглянути права на папку
Get-Acl "C:\SharedFolder" | Format-List

# Надати користувачу права на читання
$acl = Get-Acl "C:\SharedFolder"
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
    "UserName", "Read", "ContainerInherit,ObjectInherit", "None", "Allow"
)
$acl.SetAccessRule($rule)
Set-Acl "C:\SharedFolder" $acl

# Надати права на читання і запис
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
    "UserName", "Modify", "ContainerInherit,ObjectInherit", "None", "Allow"
)

# Надати повний контроль
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
    "UserName", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow"
)
```

### Рівні прав NTFS

| Право | Що дозволяє |
|-------|------------|
| Read | Читати файли і папки |
| Write | Записувати нові файли |
| Modify | Читати + записувати + видаляти |
| ReadAndExecute | Читати + запускати програми |
| FullControl | Все включно зі зміною прав |

---

## icacls — управління правами з командного рядка

```cmd
rem Переглянути права на папку
icacls C:\SharedFolder

rem Надати UserName права на зміну
icacls C:\SharedFolder /grant UserName:(OI)(CI)M

rem Видалити права UserName
icacls C:\SharedFolder /remove UserName

rem Встановити права і успадкування
icacls C:\SharedFolder /grant Everyone:(OI)(CI)R

rem Скинути права до успадкованих від батьківської папки
icacls C:\SharedFolder /reset /T

rem Взяти права власника
icacls C:\SharedFolder /setowner Administrators /T /C
```

Прапорці успадкування:
- `(OI)` — Object Inherit — застосовується до файлів
- `(CI)` — Container Inherit — до підпапок
- `(OI)(CI)` — до всього всередині

---

## Роздільне адміністрування через UAC

UAC (User Account Control) дозволяє виконувати адмінські задачі тимчасово без постійного перебування в групі Administrators.

```powershell
# Запустити програму від адміністратора через PowerShell
Start-Process "notepad.exe" -Verb RunAs

# Перевірити чи поточний користувач є адміністратором
([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
```

---

## Аудит доступу до папок

```powershell
# Увімкнути аудит доступу до об'єктів через GPO або
# локальну політику безпеки (secpol.msc)

# Встановити аудит на конкретну папку
$acl = Get-Acl "C:\SensitiveFolder"
$audit = New-Object System.Security.AccessControl.FileSystemAuditRule(
    "Everyone", "Delete,Write", "ContainerInherit,ObjectInherit", "None", "Success,Failure"
)
$acl.SetAuditRule($audit)
Set-Acl "C:\SensitiveFolder" $acl
```

Після цього всі спроби видалення або запису в папку записуватимуться в Security журнал.

---

## Підсумок

`net localgroup Administrators UserName /add` — дати права адміна. `New-LocalUser` — створити акаунт. `icacls` — управління правами NTFS з консолі. Принцип мінімальних привілеїв: всі звичайні користувачі — у групі Users, не Administrators.
