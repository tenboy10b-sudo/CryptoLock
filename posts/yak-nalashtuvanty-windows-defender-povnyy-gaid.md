---
title: "Windows Defender: повне налаштування захисту від вірусів"
date: "2026-06-30"
publishDate: "2026-06-30"
description: "Повне налаштування Windows Defender в Windows 10 і 11: захист у реальному часі, виключення, планове сканування, захист від програм-вимагачів і налаштування через PowerShell."
tags: ["безпека", "windows", "захист", "налаштування", "powershell"]
readTime: 7
---

Windows Defender — безкоштовний антивірус що йде з Windows. При правильному налаштуванні він забезпечує надійний захист без витрат на сторонні рішення.

---

## Перевірити статус захисту

`Пуск` → **Безпека Windows** — всі розділи мають бути зеленими.

```powershell
# Поточний статус через PowerShell
Get-MpComputerStatus | Select-Object `
  AntivirusEnabled, RealTimeProtectionEnabled, `
  BehaviorMonitorEnabled, IoavProtectionEnabled, `
  NisEnabled, AntivirusSignatureLastUpdated
```

---

## Оновити бази визначень

```powershell
# Примусово оновити
Update-MpSignature

# Перевірити версію баз
Get-MpComputerStatus | Select-Object AntivirusSignatureVersion, AntivirusSignatureLastUpdated
```

---

## Запустити сканування

### Через GUI

`Безпека Windows` → **Захист від вірусів і загроз** → **Параметри сканування**:
- **Швидке сканування** — перевіряє найбільш вразливі місця (~5–10 хв)
- **Повне сканування** — весь диск (~30–120 хв)
- **Настроюване** — вибери конкретні папки
- **Сканування в Microsoft Defender Offline** — до завантаження Windows (для стійких вірусів)

### Через PowerShell

```powershell
# Швидке сканування
Start-MpScan -ScanType QuickScan

# Повне сканування
Start-MpScan -ScanType FullScan

# Сканування конкретної папки
Start-MpScan -ScanType CustomScan -ScanPath "C:\Downloads"

# Сканування конкретного файлу
Start-MpScan -ScanType CustomScan -ScanPath "C:\temp\suspicious.exe"

# Перевірити результати
Get-MpThreatDetection | Select-Object ThreatName, ActionSuccess, InitialDetectionTime
```

---

## Додати виключення

Якщо Defender блокує потрібну програму або папку.

### Через GUI

`Безпека Windows` → **Захист від вірусів і загроз** → **Параметри захисту** → **Виключення** → **Додати або видалити виключення**

### Через PowerShell

```powershell
# Виключити папку
Add-MpPreference -ExclusionPath "C:\MyApp"

# Виключити процес
Add-MpPreference -ExclusionProcess "myapp.exe"

# Виключити тип файлу
Add-MpPreference -ExclusionExtension ".log"

# Переглянути всі виключення
Get-MpPreference | Select-Object ExclusionPath, ExclusionProcess, ExclusionExtension

# Видалити виключення
Remove-MpPreference -ExclusionPath "C:\MyApp"
```

> Додавай виключення тільки для тих папок де впевнений у вмісті. Широкі виключення знижують захист.

---

## Захист від програм-вимагачів (Ransomware)

Контрольований доступ до папок — блокує несанкціоновану зміну файлів.

```powershell
# Увімкнути контрольований доступ
Set-MpPreference -EnableControlledFolderAccess Enabled

# Переглянути захищені папки (за замовчуванням: Документи, Зображення, Музика, Відео)
Get-MpPreference | Select-Object -ExpandProperty ControlledFolderAccessProtectedFolders

# Додати свою папку до захищених
Add-MpPreference -ControlledFolderAccessProtectedFolders "D:\ImportantFiles"

# Дозволити конкретній програмі змінювати захищені папки
Add-MpPreference -ControlledFolderAccessAllowedApplications "C:\MyApp\myapp.exe"
```

---

## Налаштування через PowerShell

```powershell
# Увімкнути захист у реальному часі
Set-MpPreference -DisableRealtimeMonitoring $false

# Захист від потенційно небажаних програм (PUA)
Set-MpPreference -PUAProtection Enabled

# Хмарний захист (рекомендую залишити увімкненим)
Set-MpPreference -MAPSReporting Advanced

# Автоматичне відправлення зразків підозрілих файлів
Set-MpPreference -SubmitSamplesConsent SendAllSamples

# Увімкнути мережевий захист
Set-MpPreference -EnableNetworkProtection Enabled

# Перевірити всі поточні налаштування
Get-MpPreference
```

---

## Планове сканування

```powershell
# Встановити час щотижневого повного сканування (неділя о 2 ночі)
Set-MpPreference -ScanScheduleDay 0 -ScanScheduleTime 02:00:00

# Щоденне швидке сканування о 12:00
Set-MpPreference -ScanScheduleQuickScanTime 12:00:00

# Переглянути розклад
Get-MpPreference | Select-Object ScanScheduleDay, ScanScheduleTime, ScanScheduleQuickScanTime
```

---

## Defender через GPO для домену

`gpedit.msc` → **Конфігурація комп'ютера** → **Адміністративні шаблони** → **Компоненти Windows** → **Microsoft Defender Antivirus**:

- **Вимкнути Microsoft Defender** → Disabled (не вимикаємо!)
- **Захист у реальному часі** → Enable all
- **MAPS** → Advanced MAPS
- **Quarantine** → Configure removal of items → 30 days

---

## Що робити якщо Defender знаходить загрозу

```powershell
# Переглянути знайдені загрози
Get-MpThreat | Select-Object ThreatName, CategoryID, InitialDetectionTime

# Видалити карантин файли
Remove-MpThreat

# Відновити файл з карантину (якщо хибне спрацювання)
Get-MpThreat | Where-Object { $_.ThreatName -like "*FalsePositive*" } |
  Restore-MpThreat
```

---

## Підсумок

Мінімальне налаштування: увімкни **Захист від програм-вимагачів** (контрольований доступ до папок) і **PUA Protection**. Вони вимкнені за замовчуванням але суттєво підвищують захист. Виключення додавай тільки для конкретних папок, не для цілих дисків.
