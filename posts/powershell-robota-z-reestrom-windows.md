---
title: "PowerShell: робота з реєстром Windows — читання, запис, видалення"
date: "2026-06-03"
publishDate: "2026-06-03"
description: "Як читати, змінювати і видаляти ключі реєстру Windows через PowerShell: Get-ItemProperty, Set-ItemProperty, New-Item. Практичні приклади для адміністраторів."
tags: ["powershell", "реєстр", "адміністрування", "windows", "інструменти"]
readTime: 7
---

PowerShell дозволяє повністю автоматизувати роботу з реєстром Windows — читати налаштування, змінювати параметри системи, налаштовувати програми і застосовувати конфігурації на сотнях ПК одразу.

---

## Основи: шляхи реєстру в PowerShell

PowerShell має вбудований провайдер для реєстру. Кореневі розділи скорочуються:

| Повний шлях | Скорочення в PowerShell |
|-------------|------------------------|
| HKEY_LOCAL_MACHINE | HKLM: |
| HKEY_CURRENT_USER | HKCU: |
| HKEY_CLASSES_ROOT | HKCR: |
| HKEY_USERS | HKU: |
| HKEY_CURRENT_CONFIG | HKCC: |

```powershell
# Переглянути вміст розділу (як ls для папок)
Get-ChildItem HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion

# Перейти в розділ (як cd)
Set-Location HKLM:\SOFTWARE\Microsoft
Get-ChildItem
```

---

## Читання значень реєстру

```powershell
# Отримати всі значення розділу
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion"

# Отримати конкретне значення
(Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion").ProductName
(Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion").CurrentBuild

# Зберегти у змінну
$regPath = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion"
$build = (Get-ItemProperty $regPath).CurrentBuild
Write-Output "Windows Build: $build"

# Перевірити чи існує ключ
Test-Path "HKLM:\SOFTWARE\MyApp"

# Отримати конкретне значення безпечно (без помилки якщо немає)
$val = Get-ItemProperty "HKLM:\SOFTWARE\MyApp" -Name "Setting" -ErrorAction SilentlyContinue
if ($val) { Write-Output $val.Setting } else { Write-Output "Не знайдено" }
```

---

## Запис і зміна значень

```powershell
# Змінити існуюче значення
Set-ItemProperty "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced" `
  -Name "HideFileExt" -Value 0  # 0 = показувати розширення файлів

# Вимкнути автозапуск USB носіїв
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer" `
  -Name "NoDriveTypeAutoRun" -Value 255

# Встановити власний параметр (рядок)
Set-ItemProperty "HKLM:\SOFTWARE\MyApp" -Name "Version" -Value "2.0" -Type String

# Встановити DWORD (число)
Set-ItemProperty "HKLM:\SOFTWARE\MyApp" -Name "Debug" -Value 1 -Type DWord

# Встановити розгорнутий рядок (REG_EXPAND_SZ)
Set-ItemProperty "HKLM:\SOFTWARE\MyApp" -Name "Path" -Value "%ProgramFiles%\MyApp" -Type ExpandString
```

---

## Створення нових ключів і значень

```powershell
# Створити новий розділ
New-Item "HKLM:\SOFTWARE\MyCompany\MyApp" -Force

# Створити розділ і одразу додати значення
New-Item "HKLM:\SOFTWARE\MyCompany\MyApp" -Force |
  New-ItemProperty -Name "InstallPath" -Value "C:\MyApp" -PropertyType String

# Додати значення до існуючого розділу
New-ItemProperty "HKLM:\SOFTWARE\MyCompany\MyApp" `
  -Name "MaxConnections" -Value 10 -PropertyType DWord -Force
```

---

## Видалення ключів і значень

```powershell
# Видалити одне значення
Remove-ItemProperty "HKLM:\SOFTWARE\MyApp" -Name "OldSetting"

# Видалити весь розділ (без дочірніх)
Remove-Item "HKLM:\SOFTWARE\MyApp"

# Видалити розділ з усіма дочірніми (рекурсивно)
Remove-Item "HKLM:\SOFTWARE\MyCompany" -Recurse -Force
```

---

## Практичні приклади

### Показати розширення файлів для всіх користувачів

```powershell
$path = "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced"
Set-ItemProperty $path -Name "HideFileExt" -Value 0
```

### Вимкнути телеметрію через реєстр

```powershell
$telPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection"
New-Item $telPath -Force | Out-Null
Set-ItemProperty $telPath -Name "AllowTelemetry" -Value 0 -Type DWord
```

### Додати програму в автозапуск

```powershell
$runPath = "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"
Set-ItemProperty $runPath -Name "MyApp" -Value "C:\MyApp\myapp.exe" -Type String
```

### Видалити програму з автозапуску

```powershell
Remove-ItemProperty "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -Name "MyApp"
```

### Знайти всі програми в автозапуску

```powershell
$paths = @(
    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run",
    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce",
    "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run",
    "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce"
)
$paths | ForEach-Object {
    $key = $_
    Get-ItemProperty $key -ErrorAction SilentlyContinue |
        Get-Member -MemberType NoteProperty |
        Where-Object { $_.Name -notmatch "PS" } |
        ForEach-Object {
            [PSCustomObject]@{
                Hive  = $key
                Name  = $_.Name
                Value = (Get-ItemProperty $key).$($_.Name)
            }
        }
} | Format-Table -AutoSize
```

---

## Резервна копія і відновлення розділу

```powershell
# Експорт розділу реєстру (як reg export)
$null = Start-Process reg -ArgumentList "export `"HKLM\SOFTWARE\MyApp`" C:\backup-myapp.reg /y" -Wait

# Імпорт (відновлення)
$null = Start-Process reg -ArgumentList "import C:\backup-myapp.reg" -Wait
```

---

## Підсумок

`Get-ItemProperty` читає, `Set-ItemProperty` змінює, `New-Item` + `New-ItemProperty` створює, `Remove-Item` / `Remove-ItemProperty` видаляє. Ці чотири команди покривають 95% задач з реєстром. Завжди роби резервну копію розділу перед змінами.
