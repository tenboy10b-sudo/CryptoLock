---
title: "Налаштування Windows 10 і 11: повний гід по параметрах системи"
date: "2026-06-08"
publishDate: "2026-08-06"
updated: "2026-06-08"
description: "Найважливіші налаштування Windows 10 і 11: продуктивність, безпека, мережа, конфіденційність, автозапуск. Де знайти приховані параметри і як налаштувати через реєстр."
tags: ["windows", "налаштування", "оптимізація", "продуктивність"]
readTime: 9
translatesEn: "windows-10-11-settings-complete-guide"
---

Windows має сотні налаштувань розкиданих по різних місцях — Параметри, Панель керування, реєстр, групова політика. Ось найважливіші з них в одному місці.

---

## Продуктивність

### Режим продуктивності

```
Win + I → Система → Живлення → Режим живлення → Найкраща продуктивність
```

Або через PowerShell:
```powershell
# Встановити план "Висока продуктивність"
powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c

# Переглянути всі доступні плани
powercfg /list
```

### Вимкнути візуальні ефекти

```
Win + R → sysdm.cpl → Додатково → Параметри (Швидкодія) → 
Забезпечити найкращу швидкодію
```

Або точніше через PowerShell:
```powershell
# Вимкнути анімацію
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\VisualEffects" `
  -Name "VisualFXSetting" -Value 2
```

### Управління автозапуском

```
Ctrl + Shift + Esc → Автозапуск
```

Або через PowerShell:
```powershell
# Переглянути програми автозапуску
Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location

# Вимкнути через реєстр
Remove-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "НазваПрограми"
```

### Очистити диск від сміття

```powershell
# Запустити очищення диску
cleanmgr /sagerun:1

# Або через Storage Sense
Start-Process ms-settings:storagesense
```

---

## Конфіденційність

### Вимкнути збір даних і телеметрію

```
Win + I → Конфіденційність та безпека → Діагностика та відгуки → 
Діагностичні дані → Обов'язкові
```

Через реєстр (радикальніше):
```powershell
# Вимкнути телеметрію
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" `
  -Name "AllowTelemetry" -Value 0

# Вимкнути рекламний ідентифікатор
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\AdvertisingInfo" `
  -Name "Enabled" -Value 0
```

### Дозволи додатків

```
Win + I → Конфіденційність та безпека
```

Перевір і вимкни доступ до камери, мікрофона, геолокації для програм яким це не потрібно.

---

## Мережа

### DNS сервери (швидший і безпечніший інтернет)

```powershell
# Встановити Cloudflare DNS (1.1.1.1)
$adapter = Get-NetAdapter | Where-Object {$_.Status -eq "Up"} | Select-Object -First 1
Set-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex `
  -ServerAddresses ("1.1.1.1","1.0.0.1")

# Або Google DNS
Set-DnsClientServerAddress -InterfaceIndex $adapter.InterfaceIndex `
  -ServerAddresses ("8.8.8.8","8.8.4.4")
```

### Мережевий профіль (Домашній/Громадський)

```powershell
# Перевірити поточний профіль
Get-NetConnectionProfile

# Змінити на Приватний
Set-NetConnectionProfile -InterfaceAlias "Wi-Fi" -NetworkCategory Private
```

---

## Безпека

### Брандмауер Windows

```powershell
# Статус брандмауера
Get-NetFirewallProfile | Select-Object Name, Enabled

# Увімкнути для всіх профілів
Set-NetFirewallProfile -All -Enabled True

# Переглянути правила
Get-NetFirewallRule | Where-Object {$_.Enabled -eq "True"} | 
  Select-Object DisplayName, Direction, Action | Sort-Object Direction
```

### UAC (Контроль облікових записів)

```powershell
# Перевірити рівень UAC
Get-ItemProperty HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System |
  Select-Object ConsentPromptBehaviorAdmin, EnableLUA
```

```
Win + R → UserAccountControlSettings
```

Рекомендований рівень — третій з чотирьох (за замовчуванням).

### BitLocker

```powershell
# Статус шифрування
Get-BitLockerVolume | Select-Object MountPoint, ProtectionStatus, EncryptionPercentage

# Увімкнути BitLocker
Enable-BitLocker -MountPoint "C:" -EncryptionMethod Aes256 `
  -UsedSpaceOnly -RecoveryPasswordProtector
```

---

## Дисплей і інтерфейс

### Масштабування і роздільна здатність

```
Win + I → Система → Дисплей
```

```powershell
# Переглянути поточні налаштування дисплея
Get-WmiObject -Namespace root\wmi -Class WmiMonitorBasicDisplayParams |
  Select-Object Active, MaxHorizontalImageSize, MaxVerticalImageSize
```

### Нічний режим (Night Light)

```
Win + I → Система → Дисплей → Нічний режим
```

```powershell
# Увімкнути через реєстр
$path = "HKCU:\Software\Microsoft\Windows\CurrentVersion\CloudStore\Store\DefaultAccount\Current\default`$windows.data.bluelightreduction.bluelightreductionstate\windows.data.bluelightreduction.bluelightreductionstate"
# (налаштовується через GUI — простіше)
```

### Панель завдань

```
ПКМ на панелі завдань → Параметри панелі завдань
```

Windows 11 — повернути кнопку "Пуск" вліво:
```
Win + I → Персоналізація → Панель завдань → Поведінка панелі завдань → 
Вирівнювання → Ліворуч
```

---

## Корисні приховані налаштування

### God Mode (всі налаштування в одній папці)

Створи папку з точно такою назвою:
```
GodMode.{ED7BA470-8E54-465E-825C-99712043E01C}
```

Відкрий її — побачиш 200+ налаштувань в одному місці.

### Прихований адміністратор

```powershell
# Увімкнути вбудований акаунт Administrator
net user administrator /active:yes
net user administrator NewPassword123
```

### Швидкий запуск (Fast Startup) — вимкнути якщо є проблеми

```
Win + R → powercfg.cpl → "Дії кнопок живлення" → 
Вимкнути швидкий запуск
```

```powershell
# Через реєстр
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power" `
  -Name "HiberbootEnabled" -Value 0
```

---

## Часті питання

### Де знаходяться "старі" налаштування з Windows 7?

```
Win + R → control
```

Або: Пошук → "Панель керування"

### Як скинути всі налаштування до заводських?

```
Win + I → Система → Відновлення → Скинути цей ПК → Зберегти мої файли
```

### Як налаштувати Windows одною командою (автоматизація)?

```powershell
# Скрипт для базового налаштування нового ПК
# Вимкнути телеметрію
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -Name "AllowTelemetry" -Value 0
# Увімкнути брандмауер
Set-NetFirewallProfile -All -Enabled True
# Налаштувати DNS
$a = (Get-NetAdapter | Where-Object Status -eq "Up" | Select-Object -First 1).InterfaceIndex
Set-DnsClientServerAddress -InterfaceIndex $a -ServerAddresses ("1.1.1.1","1.0.0.1")
Write-Host "Базове налаштування завершено" -ForegroundColor Green
```

---

## Резюме — найважливіші налаштування

| Параметр | Де знайти | Рекомендація |
|---------|----------|-------------|
| Режим живлення | Win+I → Система → Живлення | Висока продуктивність |
| Автозапуск | Ctrl+Shift+Esc → Автозапуск | Вимкнути зайве |
| Телеметрія | Win+I → Конфіденційність | Обов'язкові дані |
| DNS | PowerShell | 1.1.1.1 або 8.8.8.8 |
| Брандмауер | PowerShell / Параметри | Увімкнений |
| UAC | UserAccountControlSettings | Рівень 3 (за замовчуванням) |
