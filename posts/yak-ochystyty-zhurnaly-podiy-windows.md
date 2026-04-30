---
title: "Як очистити журнали подій Windows і налаштувати їх розмір"
date: "2026-09-11"
publishDate: "2026-09-11"
description: "Очищення журналів подій Windows через Event Viewer і PowerShell, налаштування максимального розміру лога і автоматична архівація перед очищенням."
tags: ["windows", "адміністрування", "cmd", "powershell", "діагностика"]
readTime: 5
---

Журнали подій Windows з часом займають сотні мегабайт. При переповненні важливі події можуть перезаписуватись або журнал повністю перестає записувати. Ось як налаштувати.

---

## Переглянути розмір журналів

```powershell
# Розмір всіх журналів
Get-WinEvent -ListLog * |
  Where-Object { $_.RecordCount -gt 0 } |
  Select-Object LogName,
    @{N="Size MB";E={[math]::Round($_.FileSize/1MB, 1)}},
    RecordCount,
    MaximumSizeInBytes |
  Sort-Object "Size MB" -Descending |
  Format-Table -AutoSize
```

---

## Очистити журнал через Event Viewer

`Win + R` → `eventvwr.msc` → розгорни потрібний журнал (System, Application, Security) → правою кнопкою → **Очистити журнал**.

З'явиться питання: **Зберегти і очистити** (рекомендовано) або **Очистити**.

---

## Очистити через командний рядок

```cmd
rem Очистити журнал System
wevtutil cl System

rem Очистити Application
wevtutil cl Application

rem Очистити Security (потрібні права адміністратора)
wevtutil cl Security

rem Список всіх журналів
wevtutil el
```

---

## Очистити через PowerShell

```powershell
# Очистити один журнал
Clear-EventLog -LogName System
Clear-EventLog -LogName Application

# Зберегти і очистити — спочатку архів
$date = Get-Date -Format "yyyyMMdd"
wevtutil epl System "C:\EventLogs\System-$date.evtx"
Clear-EventLog -LogName System
Write-Output "System лог збережено і очищено"

# Очистити всі стандартні журнали
$logs = @("Application", "System", "Security",
          "Microsoft-Windows-PowerShell/Operational")
foreach ($log in $logs) {
    try {
        wevtutil epl $log "C:\EventLogs\$($log.Replace('/','-'))-$date.evtx" 2>$null
        wevtutil cl $log
        Write-Output "✓ $log очищено"
    } catch {
        Write-Warning "✗ $log — помилка: $($_.Exception.Message)"
    }
}
```

---

## Налаштувати максимальний розмір журналу

### Через Event Viewer

Правою на журнал → **Властивості** → **Максимальний розмір журналу**.

Рекомендовані розміри:
- **System:** 64–128 МБ
- **Application:** 64 МБ
- **Security:** 128–512 МБ (аудит потребує більше)

### Через PowerShell

```powershell
# Встановити розмір 128 МБ для System
$log = New-Object System.Diagnostics.EventLog("System")
$log.MaximumKilobytes = 131072  # 128 МБ = 131072 КБ

# Або через wevtutil
wevtutil sl System /ms:134217728  # розмір в байтах (128 МБ)
wevtutil sl Application /ms:67108864  # 64 МБ
wevtutil sl Security /ms:268435456  # 256 МБ
```

---

## Поведінка при переповненні

```powershell
# Переглянути поточну поведінку
wevtutil gl System | findstr "retention"

# Варіанти:
# OverwriteAsNeeded (0) — перезаписувати старі події (за замовчуванням)
# OverwriteOlder (1) — перезаписувати події старші N днів
# DoNotOverwrite (2) — зупинити запис при переповненні

# Встановити перезапис подій старших 30 днів
wevtutil sl System /rt:false /ab:false

# Через PowerShell для Security лога
Limit-EventLog -LogName Security -OverflowAction OverwriteOlder -RetentionDays 90
```

---

## Автоматичне очищення за розкладом

Додай в Task Scheduler скрипт очищення:

```powershell
# cleanup-logs.ps1
$archivePath = "C:\EventLogs\Archive"
New-Item $archivePath -ItemType Directory -Force | Out-Null
$date = Get-Date -Format "yyyyMMdd-HHmm"

# Архівувати і очистити якщо розмір > 50 МБ
$logs = @("System", "Application")
foreach ($log in $logs) {
    $size = (Get-WinEvent -ListLog $log).FileSize / 1MB
    if ($size -gt 50) {
        wevtutil epl $log "$archivePath\$log-$date.evtx"
        wevtutil cl $log
        Write-Output "$(Get-Date): $log ($([math]::Round($size,1)) МБ) очищено"
    }
}

# Видалити архіви старші 90 днів
Get-ChildItem $archivePath -Filter "*.evtx" |
  Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-90) } |
  Remove-Item -Force
```

---

## Підсумок

`wevtutil cl System` — швидке очищення. `wevtutil epl System backup.evtx` — архівувати перед очищенням. `wevtutil sl System /ms:134217728` — встановити розмір 128 МБ. Для Security лога встановлюй більший розмір і довший retention якщо проводиш аудит.
