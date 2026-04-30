---
title: "Performance Monitor в Windows: моніторинг і аналіз продуктивності"
date: "2026-09-10"
publishDate: "2026-09-10"
description: "Як використовувати Performance Monitor (perfmon) в Windows для аналізу CPU, RAM, диску і мережі: лічильники, Data Collector Sets, звіти і автоматичні сповіщення."
tags: ["windows", "моніторинг", "діагностика", "адміністрування", "продуктивність"]
readTime: 6
---

Performance Monitor — вбудований інструмент Windows для детального аналізу продуктивності системи. Потужніший за Диспетчер завдань, але менш відомий.

---

## Відкрити

```cmd
perfmon
```

Або: `Win + R` → `perfmon.exe`

---

## Реальний час — основний екран

При відкритті показується **% Processor Time** в реальному часі. Щоб додати інші лічильники:

1. Натисни зелену кнопку **+** на панелі інструментів
2. Вибери групу (наприклад **Memory**, **PhysicalDisk**, **Network Interface**)
3. Вибери конкретний лічильник → **Add** → **OK**

---

## Найкорисніші лічильники

```powershell
# Перегляд доступних лічильників через PowerShell
Get-Counter -ListSet * | Select-Object CounterSetName | Sort-Object CounterSetName
```

**CPU:**
- `\Processor(_Total)\% Processor Time` — загальне завантаження
- `\Processor(*)\% Processor Time` — по кожному ядру
- `\System\Processor Queue Length` — черга до процесора (> 2 = проблема)

**Пам'ять:**
- `\Memory\Available MBytes` — вільна RAM
- `\Memory\Pages/sec` — підкачка (> 20 = RAM не вистачає)
- `\Memory\% Committed Bytes In Use` — використання

**Диск:**
- `\PhysicalDisk(*)\% Disk Time` — завантаженість диска
- `\PhysicalDisk(*)\Avg. Disk Queue Length` — черга (> 2 = диск вузьке місце)
- `\PhysicalDisk(*)\Disk Bytes/sec` — пропускна здатність

**Мережа:**
- `\Network Interface(*)\Bytes Total/sec`
- `\Network Interface(*)\Current Bandwidth`

---

## Data Collector Sets — запис даних за розкладом

Дозволяє записувати метрики протягом часу і переглянути їх потім.

```
perfmon → Data Collector Sets → User Defined → правою → New → Data Collector Set
→ Create manually → Performance counter data collector
→ Додай потрібні лічильники → вкажи інтервал (наприклад 30 секунд)
→ Розклад: запускати щодня о певний час
```

---

## Через PowerShell

```powershell
# Разовий зріз поточних значень
Get-Counter '\Processor(_Total)\% Processor Time',
             '\Memory\Available MBytes',
             '\PhysicalDisk(_Total)\% Disk Time'

# Моніторинг кожні 5 секунд протягом 1 хвилини
Get-Counter '\Processor(_Total)\% Processor Time' `
  -SampleInterval 5 -MaxSamples 12 |
  ForEach-Object {
    $val = [math]::Round($_.CounterSamples[0].CookedValue, 1)
    Write-Output "$(Get-Date -Format 'HH:mm:ss') — CPU: $val%"
  }

# Записати в CSV для аналізу
Get-Counter '\Processor(_Total)\% Processor Time',
             '\Memory\Available MBytes' `
  -SampleInterval 10 -MaxSamples 60 |
  Export-Counter -Path "C:\Logs\perflog.csv" -FileFormat CSV
```

---

## Alerts — сповіщення при перевищенні порогу

```
perfmon → Data Collector Sets → User Defined → New → Data Collector Set
→ Create manually → Performance Counter Alert
→ Додай лічильник (наприклад Memory\Available MBytes)
→ Alert when value is: Below 500 (МБ)
→ Task: запусти скрипт або надішли повідомлення
```

Або через PowerShell:

```powershell
# Моніторинг і сповіщення при низькій RAM
while ($true) {
    $ram = (Get-Counter '\Memory\Available MBytes').CounterSamples[0].CookedValue
    if ($ram -lt 500) {
        Write-Warning "$(Get-Date): Мало RAM! Доступно: $([math]::Round($ram)) МБ"
        # Тут можна додати відправку email або запис в EventLog
    }
    Start-Sleep 30
}
```

---

## Reports — аналіз зібраних даних

Після того як Data Collector Set зупинено:

```
perfmon → Reports → User Defined → вибери набір → відкрий .blg файл
```

Або через PowerShell:

```powershell
# Читати дані з .blg файлу
$data = Import-Counter "C:\Logs\perflog.blg"
$data.CounterSamples |
  Select-Object Timestamp,
    @{N="Counter";E={$_.Path.Split('\')[-1]}},
    CookedValue |
  Format-Table -AutoSize
```

---

## Reliability Monitor — журнал стабільності

Окремий інструмент що показує коли і що ламалось:

```cmd
perfmon /rel
```

Або: `Панель керування` → **Безпека і обслуговування** → **Надійність**.

Показує графік стабільності по днях з позначками збоїв програм, Windows і обладнання.

---

## Підсумок

`perfmon` → зелений **+** → додай лічильники RAM, CPU, Disk. `Get-Counter` в PowerShell — для швидкого разового зрізу або моніторингу в скриптах. `Data Collector Sets` — для запису даних за розкладом і аналізу проблем що виникають не постійно. `perfmon /rel` — журнал стабільності для діагностики минулих збоїв.
