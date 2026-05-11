---
title: "Як додати програму в автозапуск Windows різними способами"
date: "2026-08-22"
publishDate: "2026-08-22"
description: "Чотири способи додати програму в автозапуск Windows: через Task Manager, папку автозавантаження, реєстр і Task Scheduler. Коли використовувати кожен і як видалити."
tags: ["windows", "автоматизація", "налаштування", "інструменти"]
readTime: 4
---

Іноді потрібно щоб програма запускалась автоматично разом з Windows. Ось всі правильні способи це зробити.

---

## Спосіб 1: Папка автозавантаження

Найпростіший — помісти ярлик програми в папку Startup.

`Win + R` → `shell:startup` — відкриє папку поточного користувача

Скопіюй або створи ярлик потрібної програми в цю папку.

Для всіх користувачів: `Win + R` → `shell:common startup`

---

## Спосіб 2: Через реєстр

```powershell
# Додати для поточного користувача
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" `
  -Name "MyApp" -Value "C:\Path\To\App.exe"

# Додати для всіх користувачів (потребує адміністратора)
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" `
  -Name "MyApp" -Value "C:\Path\To\App.exe"

# Видалити
Remove-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" `
  -Name "MyApp"
```

---

## Спосіб 3: Task Scheduler (найгнучкіший)

Дозволяє запускати з правами адміністратора, із затримкою, або тільки при підключенні до мережі.

```powershell
$action = New-ScheduledTaskAction `
  -Execute "C:\Path\To\App.exe" `
  -Argument "--minimized"

$trigger = New-ScheduledTaskTrigger -AtLogOn

$settings = New-ScheduledTaskSettingsSet `
  -ExecutionTimeLimit (New-TimeSpan -Hours 0) `  # Без ліміту часу
  -AllowStartIfOnBatteries $true

Register-ScheduledTask -TaskName "MyAppStartup" `
  -Action $action -Trigger $trigger -Settings $settings `
  -RunLevel Highest `  # З правами адміністратора
  -Force
```

`-RunLevel Highest` — запускає з правами адміністратора без UAC запиту.

---

## Спосіб 4: Через Task Manager

`Ctrl + Shift + Esc` → **Автозавантаження** → правий клік → **Відкрити розташування файлу** (щоб знайти де програма вже є) або **Увімкнути** якщо вона є але вимкнена.

Додати нову програму через Task Manager напряму не можна — тільки керувати існуючими.

---

## Запуск з затримкою (щоб не гальмувати завантаження)

```powershell
# Запустити програму через 2 хвилини після входу
$action = New-ScheduledTaskAction -Execute "C:\Path\To\App.exe"
$trigger = New-ScheduledTaskTrigger -AtLogOn
$trigger.Delay = "PT2M"  # 2 хвилини затримки

Register-ScheduledTask -TaskName "DelayedStartup" `
  -Action $action -Trigger $trigger -Force
```

---

## Переглянути все що автозапускається

```powershell
# З реєстру
Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"

# З Task Scheduler
Get-ScheduledTask | Where-Object {
  $_.Triggers | Where-Object {$_ -is [CimInstance] -and $_.CimClass.CimClassName -like "*Logon*"}
}
```

Або використай **Autoruns** від Sysinternals — показує абсолютно все що запускається.

---

## Резюме

Для звичайних програм: ярлик в `shell:startup`. Для програм що потребують прав адміністратора: Task Scheduler з `RunLevel Highest`. Для скриптів і програм з параметрами: реєстр або Task Scheduler. Перегляд усього автозапуску: Autoruns.
