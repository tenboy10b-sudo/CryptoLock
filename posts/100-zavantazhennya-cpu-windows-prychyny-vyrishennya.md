---
title: "100% завантаження CPU в Windows 10 і 11: причини і як виправити"
date: "2026-06-18"
publishDate: "2026-08-19"
updated: "2026-06-18"
description: "Чому CPU завантажений на 100% в Windows 10 і 11 і як це виправити. Знайти який процес їсть процесор, вимкнути телеметрію і SysMain, виправити WMI і антивірус."
tags: ["windows", "cpu", "продуктивність", "оптимізація", "діагностика"]
readTime: 9
translatesEn: "windows-high-cpu-usage-fix"
---

100% завантаження CPU гальмує весь ПК — вкладки в браузері підвисають, відео лагає, програми не відповідають. Ось як знайти винуватця і вирішити проблему.

---

## Крок 1 — Знайти який процес їсть CPU

```
Ctrl+Shift+Esc → Процеси → відсортуй по CPU
```

```powershell
# Топ-10 процесів за споживанням CPU
Get-Process | Sort-Object CPU -Descending |
    Select-Object Name, Id, CPU,
        @{N='CPU%';E={[math]::Round($_.CPU / (Get-Date).Subtract((Get-Process -Id $_.Id).StartTime).TotalSeconds * 100, 1)}} |
    Select-Object -First 10 | Format-Table

# Простіший варіант — миттєве завантаження
Get-Counter '\Process(*)\% Processor Time' |
    Select-Object -ExpandProperty CounterSamples |
    Where-Object {$_.CookedValue -gt 5} |
    Sort-Object CookedValue -Descending |
    Select-Object InstanceName, @{N='CPU%';E={[math]::Round($_.CookedValue,1)}} |
    Select-Object -First 10
```

---

## Типові винуватці і рішення

### 1. antimalware service executable (MsMpEng.exe) — Windows Defender

Defender сканує файли в реальному часі і може їсти CPU:

```powershell
# Додати виключення для папок де немає підозрілих файлів
Add-MpPreference -ExclusionPath "C:\Users\$env:USERNAME\AppData\Local\Temp"
Add-MpPreference -ExclusionPath "C:\Program Files"

# Перевірити поточні виключення
Get-MpPreference | Select-Object ExclusionPath
```

**Або змінити час сканування:**
```
Windows Security → Захист від вірусів → Параметри сканування →
Заплановане сканування → змінити на нічний час
```

### 2. WMI Provider Host (WmiPrvSE.exe)

WMI збирає дані про систему. Якщо їсть CPU — є проблемний запит:

```powershell
# Знайти що запускає WMI
Get-WmiObject -Namespace root\subscription -Class __EventFilter |
    Select-Object Name, Query

# Перезапустити WMI службу
Stop-Service winmgmt -Force
Start-Service winmgmt
```

### 3. System Interrupts

Якщо "System Interrupts" > 20% — проблема в драйверах:

```powershell
# Перевірити драйвери з помилками
Get-WmiObject Win32_PnPEntity |
    Where-Object {$_.ConfigManagerErrorCode -ne 0} |
    Select-Object Name, ConfigManagerErrorCode
```

Оновіть або перевстановіть проблемний драйвер (зазвичай мережева карта або звук).

### 4. SysMain (Superfetch)

На HDD дисках SysMain може постійно завантажувати CPU:

```powershell
Stop-Service SysMain -Force
Set-Service SysMain -StartupType Disabled
```

> На SSD залишай SysMain увімкненим — він не шкодить.

### 5. Windows Search (SearchIndexer.exe)

Індексування файлів після оновлення Windows:

```powershell
# Перезапустити службу пошуку
Restart-Service WSearch

# Або вимкнути якщо не потрібен пошук
Stop-Service WSearch -Force
Set-Service WSearch -StartupType Disabled
```

### 6. Телеметрія і оновлення (TiWorker.exe, TrustedInstaller)

TiWorker — Windows Update встановлює оновлення. Зачекай 30-60 хвилин — завершить само.

Якщо триває годинами:
```powershell
Stop-Service wuauserv -Force
Stop-Service TrustedInstaller -Force
# Очистити кеш оновлень
Remove-Item C:\Windows\SoftwareDistribution\* -Recurse -Force
Start-Service wuauserv
```

### 7. Runtime Broker (RuntimeBroker.exe)

Керує дозволами UWP додатків. Якщо їсть CPU — проблема в додатку зі Store:

```
Win + I → Додатки → Автозапуск → вимкни Store додатки
```

### 8. Chrome / браузер

Відкрий Task Manager в Chrome: `Shift+Esc` — побачиш яка вкладка або розширення їсть CPU.

---

## Системна діагностика

```powershell
# Перевірити системні файли
sfc /scannow

# DISM відновлення
DISM /Online /Cleanup-Image /RestoreHealth

# Журнал подій — критичні помилки
Get-WinEvent -LogName System -EntryType Error -MaxEvents 20 |
    Select-Object TimeCreated, Message |
    Format-List
```

---

## Температура CPU

Якщо CPU перегрівається — throttling знижує продуктивність і тримає завантаження 100%:

```powershell
# Через WMI (не всі материнські плати підтримують)
Get-WmiObject MSAcpi_ThermalZoneTemperature -Namespace root/wmi |
    Select-Object @{N='Temp°C';E={($_.CurrentTemperature - 2732) / 10}}
```

Або встанови HWiNFO для точнішого моніторингу:
```powershell
winget install REALiX.HWiNFO
```
Якщо CPU > 90°C під навантаженням, міняй термопасту.

---

## Загальний чекліст

```powershell
# Скрипт діагностики CPU
Write-Host "=== Топ процеси ===" -ForegroundColor Cyan
Get-Counter '\Process(*)\% Processor Time' |
    Select-Object -ExpandProperty CounterSamples |
    Where-Object {$_.CookedValue -gt 10} |
    Sort-Object CookedValue -Descending |
    Select-Object InstanceName, @{N='CPU%';E={[math]::Round($_.CookedValue,1)}} |
    Select-Object -First 5

Write-Host "`n=== Проблемні драйвери ===" -ForegroundColor Cyan
Get-WmiObject Win32_PnPEntity |
    Where-Object {$_.ConfigManagerErrorCode -ne 0} |
    Select-Object Name

Write-Host "`n=== Стан системних файлів ===" -ForegroundColor Cyan
sfc /verifyonly 2>&1 | Select-Object -Last 3
```

---

## Часті питання

### 100% CPU — це завжди проблема?

Ні — під час оновлень, антивірусного сканування або великих операцій з файлами це нормально і тимчасово. Проблема — якщо тривало кілька годин без очевидної причини.

### System Interrupts з високим CPU — що це?

Обробка апаратних переривань. Висока завантаженість = проблема з драйвером або залізом: застарілі драйвери, несправне залізо або конфлікт USB-пристроїв.

---

## Резюме

| Процес | Причина | Рішення |
|--------|---------|---------|
| MsMpEng.exe | Defender сканування | Виключення папок |
| WmiPrvSE.exe | WMI проблема | Перезапустити winmgmt |
| System Interrupts | Поганий драйвер | Оновити/перевстановити |
| SysMain | Prefetch на HDD | Stop-Service SysMain |
| SearchIndexer | Індексування | Restart-Service WSearch |
| TiWorker | Windows Update | Зачекати або очистити кеш |
