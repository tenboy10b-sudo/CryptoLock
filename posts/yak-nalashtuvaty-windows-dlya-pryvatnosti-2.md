---
title: "Як вимкнути телеметрію і слідкування в Windows через реєстр"
date: "2026-04-29"
publishDate: "2026-04-29"
description: "Розширені налаштування приватності Windows через реєстр: вимкнути телеметрію, рекламний ID, відстеження активності, Cortana і синхронізацію даних з Microsoft."
tags: ["windows", "приватність", "реєстр", "налаштування"]
readTime: 4
---

Стандартні Параметри приватності Windows не дають повного контролю. Ось розширені налаштування через реєстр для тих хто хоче більше.

---

## Скрипт вимкнення телеметрії

```powershell
# Запускати від адміністратора

# --- Телеметрія ---
# Мінімальний рівень (0 = Security, 1 = Basic)
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" `
  -Name "AllowTelemetry" -Value 0 -Type DWord -Force

# Вимкнути діагностичне відстеження
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\DiagTrack" `
  -Name "Start" -Value 4 -Type DWord  # 4 = Disabled

# Вимкнути CEIP (Customer Experience Improvement)
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\SQMClient\Windows" `
  -Name "CEIPEnable" -Value 0 -Type DWord -Force

# --- Рекламний ID ---
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\AdvertisingInfo" `
  -Name "Enabled" -Value 0 -Type DWord

# --- Cortana ---
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Windows Search" `
  -Name "AllowCortana" -Value 0 -Type DWord -Force

# --- Відстеження активності ---
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System" `
  -Name "PublishUserActivities" -Value 0 -Type DWord -Force
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System" `
  -Name "UploadUserActivities" -Value 0 -Type DWord -Force

# --- Delivery Optimization (ділення оновленнями) ---
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DeliveryOptimization" `
  -Name "DODownloadMode" -Value 0 -Type DWord -Force

# --- Feedback ---
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Siuf\Rules" `
  -Name "NumberOfSIUFInPeriod" -Value 0 -Type DWord

Write-Host "Done. Restart for all changes to take effect." -ForegroundColor Green
```

---

## Вимкнути синхронізацію налаштувань

```powershell
# Вимкнути синхронізацію з Microsoft акаунтом
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\SettingSync" `
  -Name "DisableSettingSync" -Value 2 -Type DWord -Force
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\SettingSync" `
  -Name "DisableSettingSyncUserOverride" -Value 1 -Type DWord -Force
```

---

## Заблокувати телеметрію в hosts файлі

Відкрий `C:\Windows\System32\drivers\etc\hosts` від адміністратора і додай:

```
0.0.0.0 vortex.data.microsoft.com
0.0.0.0 vortex-win.data.microsoft.com
0.0.0.0 telecommand.telemetry.microsoft.com
0.0.0.0 telecommand.telemetry.microsoft.com.nsatc.net
0.0.0.0 settings-win.data.microsoft.com
0.0.0.0 watson.telemetry.microsoft.com
0.0.0.0 watson.ppe.telemetry.microsoft.com
0.0.0.0 sqm.telemetry.microsoft.com
```

```powershell
Clear-DnsClientCache  # Очисти кеш після змін
```

---

## Перевірити поточний стан

```powershell
# Рівень телеметрії
(Get-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -EA 0).AllowTelemetry

# Стан DiagTrack
(Get-Service DiagTrack -EA 0).Status

# Рекламний ID
(Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\AdvertisingInfo" -EA 0).Enabled
```

---

## Що залишається навіть після вимкнення

Microsoft збирає деякі дані навіть на мінімальних налаштуваннях для ліцензування і безпеки. Повністю вимкнути телеметрію можна тільки через Windows LTSC (Long-Term Servicing Channel) — спеціальне видання без зайвих компонентів.

---

## Відновити стандартні налаштування

```powershell
# Видалити всі кастомні GPO політики приватності
Remove-Item "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -Recurse -Force -EA 0
Remove-Item "HKLM:\SOFTWARE\Policies\Microsoft\Windows\SettingSync" -Recurse -Force -EA 0
Remove-Item "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Windows Search" -Recurse -Force -EA 0
gpupdate /force
```

---

## Резюме

Запусти PowerShell скрипт вище від адміністратора → перезавантаж. Додатково заблокуй домени телеметрії в hosts файлі. Налаштування через реєстр дають більше контролю ніж стандартний UI приватності Windows.
