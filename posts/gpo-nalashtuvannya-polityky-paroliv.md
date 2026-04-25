---
title: "Політика паролів в Windows і домені: налаштування через GPO і secpol"
date: "2026-07-26"
publishDate: "2026-07-26"
description: "Налаштування політики паролів Windows: мінімальна довжина, складність, термін дії і Fine-Grained Password Policy в Active Directory через PowerShell."
tags: ["безпека", "паролі", "групова-політика", "gpo", "адміністрування", "windows"]
readTime: 6
---

Слабка політика паролів — найпоширеніша вразливість корпоративних мереж. Правильне налаштування займає 15 хвилин і суттєво підвищує безпеку.

---

## Локальна політика паролів (без домену)

`Win + R` → `secpol.msc` → **Параметри безпеки** → **Політики облікових записів** → **Політика паролів**

| Параметр | Рекомендоване значення |
|----------|----------------------|
| Мінімальна довжина пароля | 12 символів |
| Максимальний термін дії | 90 днів |
| Мінімальний термін дії | 1 день |
| Журнал паролів | 10 паролів |
| Пароль повинен відповідати вимогам складності | Увімкнено |

```powershell
# Налаштування через net accounts
net accounts /minpwlen:12 /maxpwage:90 /minpwage:1 /uniquepw:10
```

---

## Вимоги складності (що вони означають)

При увімкненій **"Пароль повинен відповідати вимогам складності"** пароль має містити символи мінімум з 3 категорій з 4:
- Великі літери (A–Z)
- Малі літери (a–z)
- Цифри (0–9)
- Спецсимволи (!@#$%...)

---

## Політика блокування акаунту

`secpol.msc` → **Політика блокування облікового запису**:

| Параметр | Рекомендоване |
|----------|--------------|
| Поріг блокування | 5 спроб |
| Тривалість блокування | 30 хвилин |
| Скидання лічильника | 30 хвилин |

```powershell
net accounts /lockoutthreshold:5 /lockoutduration:30 /lockoutwindow:30
```

---

## Доменна політика паролів через GPO

В домені AD налаштовується централізовано через Default Domain Policy.

`gpmc.msc` → **Default Domain Policy** → **Edit** → **Computer Configuration** → **Policies** → **Windows Settings** → **Security Settings** → **Account Policies** → **Password Policy**

```powershell
# Перевірити поточну доменну політику паролів
Get-ADDefaultDomainPasswordPolicy

# Змінити через PowerShell
Set-ADDefaultDomainPasswordPolicy `
  -Identity "company.local" `
  -MinPasswordLength 12 `
  -MaxPasswordAge (New-TimeSpan -Days 90) `
  -MinPasswordAge (New-TimeSpan -Days 1) `
  -PasswordHistoryCount 10 `
  -ComplexityEnabled $true `
  -LockoutThreshold 5 `
  -LockoutDuration (New-TimeSpan -Minutes 30) `
  -LockoutObservationWindow (New-TimeSpan -Minutes 30)
```

---

## Fine-Grained Password Policy (різні паролі для різних груп)

Дозволяє встановити різні вимоги для різних груп користувачів. Наприклад: адміністратори — 16 символів, звичайні користувачі — 12.

```powershell
# Створити окрему політику для адміністраторів
New-ADFineGrainedPasswordPolicy `
  -Name "Admin Password Policy" `
  -Precedence 10 `
  -MinPasswordLength 16 `
  -MaxPasswordAge (New-TimeSpan -Days 60) `
  -PasswordHistoryCount 15 `
  -ComplexityEnabled $true `
  -LockoutThreshold 3 `
  -LockoutDuration (New-TimeSpan -Minutes 60) `
  -LockoutObservationWindow (New-TimeSpan -Minutes 30) `
  -ReversibleEncryptionEnabled $false

# Застосувати до групи IT Admins
Add-ADFineGrainedPasswordPolicySubject `
  -Identity "Admin Password Policy" `
  -Subjects "IT Admins"

# Переглянути всі Fine-Grained Policy
Get-ADFineGrainedPasswordPolicy -Filter *

# Яка політика застосована до конкретного користувача
Get-ADUserResultantPasswordPolicy -Identity "john.doe"
```

---

## Перевірка паролів користувачів

```powershell
# Знайти акаунти з паролем що ніколи не закінчується
Get-ADUser -Filter {PasswordNeverExpires -eq $true} -Properties PasswordNeverExpires |
  Select-Object Name, SamAccountName, PasswordNeverExpires

# Знайти акаунти з простроченим паролем
Get-ADUser -Filter {PasswordExpired -eq $true} |
  Select-Object Name, SamAccountName

# Дату закінчення пароля конкретного користувача
Get-ADUser "john.doe" -Properties PasswordLastSet, PasswordExpired, PasswordNeverExpires |
  Select-Object Name, PasswordLastSet, PasswordExpired, PasswordNeverExpires

# Примусово скинути пароль при наступному вході
Set-ADUser "john.doe" -ChangePasswordAtLogon $true
```

---

## Рекомендації NIST 2024

Сучасні рекомендації NIST відрізняються від традиційних:

- **Довжина важливіша за складність** — 15+ символів простої фрази краще ніж 8 символів з !@#
- **Не вимагай регулярну зміну** — часта зміна призводить до слабких паролів (Password1, Password2...)
- **Перевіряй паролі на витік** — блокуй паролі що є в базах витоків
- **Використовуй менеджер паролів** — єдиний спосіб мати унікальні сильні паролі скрізь

---

## Підсумок

Для доменного середовища: `Set-ADDefaultDomainPasswordPolicy` — базові вимоги. Fine-Grained Policy — різні вимоги для адмінів і користувачів. Мінімум 12 символів + складність + блокування після 5 спроб — стандарт що відповідає більшості вимог безпеки.
