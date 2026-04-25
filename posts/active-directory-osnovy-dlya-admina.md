---
title: "Active Directory: основи для системного адміністратора"
date: "2026-05-22"
publishDate: "2026-05-22"
description: "Що таке Active Directory, як влаштований домен Windows, основні об'єкти AD і команди для управління користувачами і комп'ютерами через PowerShell і GUI."
tags: ["адміністрування", "безпека", "windows", "powershell", "облікові-записи"]
readTime: 9
---

Active Directory (AD) — служба каталогів Microsoft для централізованого управління користувачами, комп'ютерами і ресурсами в корпоративній мережі. Без AD — кожен ПК управляється окремо, з AD — все з одного місця.

---

## Базова структура AD

**Домен** — основна одиниця. Наприклад, `company.local`. Всі об'єкти (користувачі, комп'ютери, групи) належать домену.

**Контролер домену (DC)** — сервер Windows Server з роллю AD DS. Зберігає базу даних домену, автентифікує користувачів.

**OU (Organizational Unit)** — папки для організації об'єктів. Наприклад: `OU=Бухгалтерія`, `OU=IT`. До OU прив'язуються групові політики.

**Об'єкти AD:**
- **User** — обліковий запис користувача
- **Computer** — обліковий запис комп'ютера
- **Group** — група для спрощення управління правами
- **GPO** — групова політика

---

## Інструменти управління AD

### ADUC (Active Directory Users and Computers)

Графічний інструмент для управління об'єктами.

`Win + R` → `dsa.msc`

Тут можна: створювати, редагувати і видаляти користувачів, комп'ютери і групи, скидати паролі, переміщувати об'єкти між OU.

### ADSI Edit — низькорівневий редактор

`Win + R` → `adsiedit.msc`

Пряме редагування атрибутів об'єктів. Обережно — зміни незворотні.

### PowerShell — автоматизація

Потрібен модуль `ActiveDirectory`:

```powershell
Import-Module ActiveDirectory
```

На контролері домену встановлений автоматично. На робочих станціях — через RSAT.

---

## Управління користувачами через PowerShell

```powershell
# Список всіх користувачів у домені
Get-ADUser -Filter * | Select-Object Name, SamAccountName, Enabled

# Знайти конкретного користувача
Get-ADUser -Identity "ivanov.ivan"

# Знайти за частиною імені
Get-ADUser -Filter {Name -like "*Іванов*"} | Select-Object Name, Department

# Створити нового користувача
New-ADUser `
  -Name "Петро Коваль" `
  -SamAccountName "koval.petro" `
  -UserPrincipalName "koval.petro@company.local" `
  -Path "OU=IT,DC=company,DC=local" `
  -AccountPassword (ConvertTo-SecureString "P@ssw0rd!" -AsPlainText -Force) `
  -Enabled $true `
  -PasswordNeverExpires $false `
  -ChangePasswordAtLogon $true

# Заблокувати обліковий запис
Disable-ADAccount -Identity "koval.petro"

# Розблокувати
Enable-ADAccount -Identity "koval.petro"

# Скинути пароль
Set-ADAccountPassword -Identity "koval.petro" `
  -NewPassword (ConvertTo-SecureString "NewP@ss123!" -AsPlainText -Force) `
  -Reset

# Видалити користувача
Remove-ADUser -Identity "koval.petro"

# Перемістити в іншу OU
Move-ADObject `
  -Identity "CN=Петро Коваль,OU=IT,DC=company,DC=local" `
  -TargetPath "OU=Бухгалтерія,DC=company,DC=local"
```

---

## Управління групами

```powershell
# Список всіх груп
Get-ADGroup -Filter * | Select-Object Name, GroupCategory, GroupScope

# Члени групи
Get-ADGroupMember -Identity "IT-Адміни" | Select-Object Name, SamAccountName

# Додати користувача до групи
Add-ADGroupMember -Identity "IT-Адміни" -Members "koval.petro"

# Видалити з групи
Remove-ADGroupMember -Identity "IT-Адміни" -Members "koval.petro" -Confirm:$false

# Створити групу
New-ADGroup `
  -Name "VPN-Users" `
  -SamAccountName "VPN-Users" `
  -GroupCategory Security `
  -GroupScope Global `
  -Path "OU=Groups,DC=company,DC=local"
```

---

## Управління комп'ютерами

```powershell
# Список всіх комп'ютерів у домені
Get-ADComputer -Filter * | Select-Object Name, OperatingSystem, LastLogonDate

# Знайти комп'ютери що не входили в домен більше 90 днів (кандидати на видалення)
$date = (Get-Date).AddDays(-90)
Get-ADComputer -Filter {LastLogonDate -lt $date} | Select-Object Name, LastLogonDate

# Перезавантажити комп'ютер в домені
Invoke-Command -ComputerName "PC-001" -ScriptBlock { Restart-Computer -Force }

# Вивести комп'ютер з домену через PowerShell
Remove-Computer -ComputerName "PC-001" -UnjoinDomainCredential (Get-Credential) -Force
```

---

## Корисні команди діагностики

```powershell
# Перевірити чи комп'ютер в домені
(Get-WmiObject Win32_ComputerSystem).PartOfDomain

# Переглянути до яких груп належить користувач
(Get-ADUser "koval.petro" -Properties MemberOf).MemberOf

# Перевірити реплікацію між DC
repadmin /replsummary

# Перевірити здоров'я AD
dcdiag /test:all

# Знайти FSMO-ролі
netdom query fsmo

# Примусово синхронізувати GPO
gpupdate /force
```

---

## Типові задачі адміністратора

**Масове скидання паролів** (наприклад, після інциденту безпеки):

```powershell
Get-ADUser -Filter {Department -eq "Бухгалтерія"} |
  Set-ADAccountPassword -NewPassword (ConvertTo-SecureString "Temp123!" -AsPlainText -Force) -Reset
```

**Знайти заблоковані облікові записи:**

```powershell
Search-ADAccount -LockedOut | Select-Object Name, SamAccountName, LockedOut
```

**Розблокувати всі заблоковані:**

```powershell
Search-ADAccount -LockedOut | Unlock-ADAccount
```

---

## Підсумок

AD — основа корпоративної інфраструктури Windows. PowerShell + модуль ActiveDirectory дозволяє автоматизувати рутинні задачі: масове створення/видалення акаунтів, перевірку стану облікових записів, управління групами. Графічний ADUC зручний для одиничних операцій і перегляду структури.
