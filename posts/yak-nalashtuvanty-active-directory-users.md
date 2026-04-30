---
title: "Active Directory: управління користувачами і групами через PowerShell"
date: "2026-09-14"
publishDate: "2026-09-14"
description: "Управління обліковими записами в Active Directory через PowerShell: створення, зміна, блокування і пошук користувачів. Масові операції і звіти."
tags: ["адміністрування", "windows", "powershell", "облікові-записи", "мережа"]
readTime: 7
---

PowerShell з модулем Active Directory дозволяє виконувати за секунди те що через GUI займає хвилини — особливо при масових операціях.

---

## Встановлення модуля AD

```powershell
# На Windows Server — встановити RSAT AD Tools
Install-WindowsFeature -Name RSAT-AD-PowerShell

# На Windows 10/11 (клієнтська машина)
Add-WindowsCapability -Online -Name Rsat.ActiveDirectory.DS-LDS.Tools~~~~0.0.1.0

# Перевірити
Get-Command -Module ActiveDirectory | Measure-Object
```

---

## Пошук користувачів

```powershell
# Один користувач
Get-ADUser -Identity "john.doe" -Properties *

# Пошук за фільтром
Get-ADUser -Filter { DisplayName -like "*Іван*" } |
  Select-Object Name, SamAccountName, EmailAddress

# Всі активні користувачі
Get-ADUser -Filter { Enabled -eq $true } |
  Select-Object Name, SamAccountName, LastLogonDate |
  Sort-Object LastLogonDate -Descending

# Користувачі в конкретному OU
Get-ADUser -Filter * -SearchBase "OU=Sales,DC=company,DC=local" |
  Select-Object Name, SamAccountName
```

---

## Створення користувача

```powershell
# Один користувач
New-ADUser `
  -Name "Іван Петренко" `
  -GivenName "Іван" `
  -Surname "Петренко" `
  -SamAccountName "ivan.petrenko" `
  -UserPrincipalName "ivan.petrenko@company.local" `
  -Path "OU=IT,DC=company,DC=local" `
  -AccountPassword (ConvertTo-SecureString "P@ssw0rd!" -AsPlainText -Force) `
  -Enabled $true `
  -ChangePasswordAtLogon $true `
  -EmailAddress "ivan.petrenko@company.com" `
  -Department "IT" `
  -Title "Системний адміністратор"

# Масове створення з CSV
# Файл users.csv: Name,Sam,Password,OU,Department
Import-Csv "C:\users.csv" | ForEach-Object {
    New-ADUser `
      -Name $_.Name `
      -SamAccountName $_.Sam `
      -AccountPassword (ConvertTo-SecureString $_.Password -AsPlainText -Force) `
      -Path $_.OU `
      -Department $_.Department `
      -Enabled $true `
      -ChangePasswordAtLogon $true
    Write-Output "✓ $($_.Name)"
}
```

---

## Зміна і блокування

```powershell
# Змінити властивості
Set-ADUser "ivan.petrenko" `
  -Title "Старший системний адміністратор" `
  -Department "IT" `
  -Manager "manager.surname"

# Скинути пароль
Set-ADAccountPassword "ivan.petrenko" `
  -NewPassword (ConvertTo-SecureString "NewP@ss!" -AsPlainText -Force) `
  -Reset

# Примусово змінити пароль при наступному вході
Set-ADUser "ivan.petrenko" -ChangePasswordAtLogon $true

# Заблокувати акаунт
Disable-ADAccount "ivan.petrenko"

# Розблокувати
Enable-ADAccount "ivan.petrenko"

# Розблокувати після невдалих спроб входу
Unlock-ADAccount "ivan.petrenko"
```

---

## Управління групами

```powershell
# Список груп
Get-ADGroup -Filter * | Select-Object Name, GroupScope, GroupCategory

# Члени групи
Get-ADGroupMember -Identity "IT Admins" |
  Select-Object Name, SamAccountName, ObjectClass

# Додати в групу
Add-ADGroupMember -Identity "IT Admins" -Members "ivan.petrenko"

# Видалити з групи
Remove-ADGroupMember -Identity "IT Admins" -Members "ivan.petrenko" -Confirm:$false

# Групи користувача
(Get-ADUser "ivan.petrenko" -Properties MemberOf).MemberOf |
  Get-ADGroup | Select-Object Name

# Створити групу
New-ADGroup `
  -Name "Dev Team" `
  -GroupScope Global `
  -GroupCategory Security `
  -Path "OU=Groups,DC=company,DC=local"
```

---

## Корисні звіти

```powershell
# Неактивні акаунти (90+ днів без входу)
$cutoff = (Get-Date).AddDays(-90)
Get-ADUser -Filter { LastLogonDate -lt $cutoff -and Enabled -eq $true } `
  -Properties LastLogonDate |
  Select-Object Name, SamAccountName, LastLogonDate |
  Sort-Object LastLogonDate |
  Export-Csv "C:\Reports\inactive-users.csv" -Encoding UTF8 -NoTypeInformation

# Прострочені паролі
Get-ADUser -Filter { PasswordExpired -eq $true } |
  Select-Object Name, SamAccountName |
  Export-Csv "C:\Reports\expired-passwords.csv" -Encoding UTF8

# Акаунти без пароля що не закінчується
Get-ADUser -Filter { PasswordNeverExpires -eq $true -and Enabled -eq $true } |
  Select-Object Name, SamAccountName |
  Format-Table -AutoSize
```

---

## Підсумок

`Get-ADUser -Filter` — пошук. `New-ADUser` — створення. `Set-ADUser` — зміна. `Disable-ADAccount` і `Unlock-ADAccount` — блокування і розблокування. `Add-ADGroupMember` — управління групами. `Import-Csv` + `New-ADUser` — масове створення з Excel файлу.
