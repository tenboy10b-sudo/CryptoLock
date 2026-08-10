---
title: "100% використання RAM в Windows 10 і 11: причини і як звільнити пам'ять"
date: "2026-06-18"
publishDate: "2026-08-20"
updated: "2026-06-18"
description: "Чому Windows з'їдає всю оперативну пам'ять і як це виправити. Знайти який процес використовує RAM, вимкнути зайві служби, налаштувати підкачку і прискорити роботу."
tags: ["windows", "ram", "пам'ять", "продуктивність", "оптимізація", "діагностика"]
readTime: 7
translatesEn: "windows-high-memory-usage-fix"
---

Windows використовує весь доступний RAM — це нормально, ОС кешує дані для швидшого доступу. Але якщо пам'яті не вистачає і система починає використовувати підкачку (pagefile) — все різко сповільнюється.

---

## Скільки RAM потрібно в 2026

| Сценарій | Мінімум | Рекомендовано |
|---------|---------|--------------|
| Базова робота (браузер, офіс) | 4 ГБ | 8 ГБ |
| Робота + кілька програм | 8 ГБ | 16 ГБ |
| Ігри | 8 ГБ | 16 ГБ |
| Розробка, відеомонтаж | 16 ГБ | 32 ГБ |

---

## Крок 1 — Перевірити використання RAM

```powershell
# Поточне використання
$os = Get-CimInstance Win32_OperatingSystem
$used = [math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory)/1MB, 1)
$total = [math]::Round($os.TotalVisibleMemorySize/1MB, 1)
$pct = [math]::Round($used/$total*100, 0)
Write-Host "RAM: $used ГБ / $total ГБ ($pct%)"

# Чи використовується підкачка
$swap = [math]::Round(($os.TotalVirtualMemorySize - $os.FreeVirtualMemory - $os.TotalVisibleMemorySize + $os.FreePhysicalMemory)/1MB, 1)
Write-Host "Підкачка використовується: $swap ГБ"
```

---

## Крок 2 — Знайти що їсть RAM

```powershell
# Топ-10 процесів за використанням RAM
Get-Process | Sort-Object WorkingSet64 -Descending |
    Select-Object Name, Id,
        @{N='RAM_MB';E={[math]::Round($_.WorkingSet64/1MB,0)}} |
    Select-Object -First 10 | Format-Table
```

**Типові "пожирачі" RAM:**

| Процес | Нормально | Багато |
|--------|---------|--------|
| chrome.exe | 500-2000 МБ | > 4 ГБ |
| firefox.exe | 400-1500 МБ | > 3 ГБ |
| Code.exe (VS Code) | 300-800 МБ | > 2 ГБ |
| explorer.exe | 50-200 МБ | > 500 МБ |
| svchost.exe | 10-300 МБ | > 1 ГБ |

---

## Крок 3 — Виправлення для Chrome

Chrome славиться великим споживанням пам'яті:

**В Chrome:**
```
chrome://settings → Система → Продуктивність пам'яті
→ Увімкнути заощадження пам'яті
→ Режим економії пам'яті
```

**Закрити неактивні вкладки:**
Розширення **"OneTab"** — згортає всі вкладки в список, звільняє 80% пам'яті Chrome.

**Вимкнути зайві розширення:**
```
chrome://extensions → вимкни невикористовувані
```

---

## Крок 4 — Служби що їдять RAM

```powershell
# Служби що використовують більше 100 МБ
Get-Service | Where-Object {$_.Status -eq 'Running'} |
    ForEach-Object {
        $proc = Get-Process -Name $_.Name -ErrorAction SilentlyContinue
        if ($proc) {
            [PSCustomObject]@{
                Service = $_.Name
                RAM_MB = [math]::Round(($proc | Measure-Object WorkingSet64 -Sum).Sum/1MB, 0)
            }
        }
    } | Sort-Object RAM_MB -Descending | Select-Object -First 10
```

**Безпечно вимкнути:**
```powershell
# SysMain (Superfetch) — кешує програми, але їсть RAM на старих системах
Stop-Service SysMain -Force
Set-Service SysMain -StartupType Disabled

# Connected User Experiences (телеметрія)
Stop-Service DiagTrack -Force
Set-Service DiagTrack -StartupType Disabled
```

---

## Крок 5 — Налаштування підкачки

Якщо RAM постійно на межі — правильна підкачка допоможе:

```
Win+R → sysdm.cpl → Додатково → Параметри (Швидкодія) →
Розширені → Змінити (підкачка)
```

**Рекомендовані налаштування:**
- Вимкни "Автоматично"
- Вибери диск C:
- Встанови фіксований розмір:
  - Вихідний розмір: RAM × 1.5 (наприклад 8 ГБ × 1.5 = 12288 МБ)
  - Максимум: RAM × 2 (16384 МБ)

**Важливо:** підкачку краще мати на SSD — підкачка на HDD катастрофічно повільна.

---

## Крок 6 — Вимкнути автозапуск програм що їдять RAM

```powershell
# Програми в автозапуску і їх поточне використання RAM
Get-CimInstance Win32_StartupCommand | ForEach-Object {
    $name = $_.Name -replace '\.exe.*$', '' -replace '"', ''
    $proc = Get-Process -Name $name -ErrorAction SilentlyContinue
    if ($proc) {
        [PSCustomObject]@{
            Name = $_.Name
            RAM_MB = [math]::Round(($proc | Measure-Object WorkingSet64 -Sum).Sum/1MB,0)
        }
    }
} | Sort-Object RAM_MB -Descending
```

---

## Крок 7 — Memory Compression

Windows 10/11 стискає неактивні сторінки пам'яті в RAM замість запису на диск. Перевір:

```powershell
# Статистика стиснення пам'яті
Get-MMAgent | Select-Object MemoryCompression

# Увімкнути якщо вимкнено
Enable-MMAgent -MemoryCompression
```

---

## Скільки RAM насправді використовується

Диспетчер завдань показує "In Use" — це не тривожно:

| Показник | Значення |
|---------|---------|
| **In Use** | Активно використовується |
| **Standby** | Кеш — звільниться якщо потрібно |
| **Modified** | Чекає запису на диск |
| **Available** | Вільна пам'ять |

Справжня проблема — коли **Available** близько до 0 і система йде в підкачку.

---

## Чи можна додати RAM фізично

```powershell
# Детальна інформація про встановлену RAM і слоти
Get-WmiObject Win32_PhysicalMemory |
  Select-Object BankLabel, Capacity, Speed, Manufacturer |
  ForEach-Object {
    [PSCustomObject]@{
      Слот = $_.BankLabel
      "ГБ" = [math]::Round($_.Capacity/1GB)
      "МГц" = $_.Speed
      Виробник = $_.Manufacturer
    }
  } | Format-Table -AutoSize

# Максимальний підтримуваний обсяг
(Get-WmiObject Win32_PhysicalMemoryArray).MaxCapacity / 1MB
```

Або: `Ctrl + Shift + Esc` → Продуктивність → Пам'ять → **Слоти, що використовуються** покаже скільки зайнято і чи є вільні.

**Що купувати:** тип DDR4/DDR5 (залежно від материнської плати), частота — відповідна підтримуваній платою, обсяг — краще 2×8 ГБ ніж 1×16 ГБ (dual channel швидший за single). Перевір сумісність на сайті виробника ноутбука або через CPU-Z.

---

## Резюме

| Причина | Рішення |
|---------|---------|
| Chrome їсть RAM | Режим заощадження + OneTab |
| Багато вкладок | Закрити або OneTab |
| SysMain | Stop-Service SysMain |
| Мало RAM фізично | Докупи планку (8-16 ГБ) |
| Підкачка на HDD | Перенести підкачку на SSD |
| Зайвий автозапуск | Вимкнути в Диспетчері завдань |
