---
title: "Дитячий режим на ПК: обмеження і захист через локальний акаунт"
date: "2026-09-18"
publishDate: "2026-09-18"
description: "Як налаштувати Windows для дитини без Microsoft Family: обмеження програм через AppLocker, часові обмеження входу, заборона сайтів через hosts і захист налаштувань."
tags: ["windows", "безпека", "налаштування", "облікові-записи", "захист"]
readTime: 6
---

Якщо не хочеш використовувати Microsoft Family Safety — є альтернатива через локальний акаунт і вбудовані інструменти Windows.

---

## Крок 1: Створити стандартний акаунт для дитини

Стандартний акаунт не може встановлювати програми і змінювати системні налаштування.

```powershell
# Створити акаунт
New-LocalUser -Name "Дитина" `
  -Password (ConvertTo-SecureString "password" -AsPlainText -Force) `
  -PasswordNeverExpires $true

# Додати в Users (НЕ Administrators)
Add-LocalGroupMember -Group "Users" -Member "Дитина"
```

Або через: `Параметри` → `Облікові записи` → `Сім'я та інші користувачі` → **Додати обліковий запис**.

---

## Крок 2: Часові обмеження входу

```cmd
rem Дозволити вхід тільки в будні 14:00-21:00 і вихідні 10:00-21:00
net user Дитина /times:M-F,14:00-21:00;Sa-Su,10:00-21:00

rem Переглянути поточні обмеження
net user Дитина | findstr "hours"

rem Зняти обмеження
net user Дитина /times:all
```

---

## Крок 3: Заборонити конкретні програми

```powershell
# Через Software Restriction Policy або AppLocker
# Простіший варіант — заборонити запуск через реєстр

# Заблокувати конкретну програму
$path = "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer"
New-Item $path -Force | Out-Null
Set-ItemProperty $path -Name "DisallowRun" -Value 1 -Type DWord

$appsPath = "$path\DisallowRun"
New-Item $appsPath -Force | Out-Null
Set-ItemProperty $appsPath -Name "1" -Value "steam.exe"
Set-ItemProperty $appsPath -Name "2" -Value "discord.exe"
```

---

## Крок 4: Заблокувати сайти через hosts

```powershell
# Додати заблоковані сайти в hosts файл (адмінський акаунт)
$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$blocked = @(
    "tiktok.com", "www.tiktok.com",
    "instagram.com", "www.instagram.com"
)
foreach ($site in $blocked) {
    Add-Content $hostsPath "127.0.0.1 $site"
}
ipconfig /flushdns
```

---

## Крок 5: Захистити налаштування від зміни дитиною

```powershell
# Заборонити доступ до Панелі керування і Параметрів
$policyPath = "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer"
New-Item $policyPath -Force | Out-Null
Set-ItemProperty $policyPath -Name "NoControlPanel" -Value 1 -Type DWord
Set-ItemProperty $policyPath -Name "NoSetFolderOptions" -Value 1 -Type DWord

# Заборонити CMD і PowerShell
# Через GPO: User Configuration → Administrative Templates → System
# → Prevent access to the command prompt → Enabled
```

---

## Крок 6: DNS фільтрація для всієї мережі

Найпростіший захист — налаштувати захисний DNS на роутері:

- **Cloudflare for Families:** `1.1.1.3` і `1.0.0.3` (блокує дорослий контент)
- **OpenDNS FamilyShield:** `208.67.222.123` і `208.67.220.123`

Встанови на роутері — захист діє для всіх пристроїв в мережі, включно з телефоном.

---

## Перемикатись між акаунтами

`Win + L` — заблокує поточний акаунт. При вході вибери потрібний акаунт.

Або: `Пуск` → клікни на аватар → вибери інший акаунт.

---

## Підсумок

Стандартний акаунт без прав адміна → часові обмеження через `net user /times` → заблоковані сайти через hosts → DNS фільтрація на роутері. Без Microsoft акаунту і синхронізації в хмарі.
