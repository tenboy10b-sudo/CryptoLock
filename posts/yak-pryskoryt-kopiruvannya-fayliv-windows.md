---
title: "Чому повільно копіюються файли в Windows і як це прискорити"
date: "2026-08-15"
publishDate: "2026-08-15"
description: "Копіювання файлів гальмує в Windows — причини і рішення: Robocopy замість стандартного копіювання, налаштування буфера, проблеми з USB і мережею."
tags: ["windows", "оптимізація", "диск", "мережа", "інструменти"]
readTime: 5
---

Копіювання великих файлів в Windows іноді займає набагато більше часу ніж мало б. Є кілька причин і простих рішень.

---

## Чому стандартне копіювання повільне

- **Windows Explorer копіює по одному файлу** — при тисячах дрібних файлів накладні витрати величезні
- **Підрахунок розміру перед копіюванням** — провідник рахує всі файли перш ніж почати
- **Антивірус** — сканує кожен файл при копіюванні
- **Фрагментований HDD** — хаотичне зчитування
- **USB 2.0 замість USB 3.0** — різниця в 10 разів

---

## Спосіб 1: Robocopy — значно швидше за Explorer

```cmd
rem Базове копіювання
robocopy C:\Source D:\Destination /E /MT:8 /R:1 /W:1

rem /E — всі підпапки
rem /MT:8 — 8 паралельних потоків
rem /R:1 — 1 спроба при помилці
rem /W:1 — чекати 1 секунду
```

`/MT:8` — восьмипотокове копіювання, в 3–5 разів швидше за стандартний Провідник особливо при тисячах дрібних файлів.

Детальніше: [Robocopy — синхронізація і резервне копіювання](/robocopy-synkhronizatsiya-papok-windows)

---

## Спосіб 2: TeraCopy — заміна стандартного копіювання

TeraCopy — безкоштовна програма що замінює вбудоване копіювання Windows:

- Перевіряє CRC після копіювання
- Пропускає помилкові файли і продовжує
- Пауза і відновлення
- Черга копіювань

Завантаж з codesector.com/teracopy

---

## Спосіб 3: Вимкнути антивірус при великих копіюваннях

Антивірус сканує кожен файл — це суттєво уповільнює копіювання великих обсягів.

**Тимчасово** додай папку призначення до виключень Defender:

```powershell
Add-MpPreference -ExclusionPath "D:\LargeCopy"
# Після завершення видали виключення
Remove-MpPreference -ExclusionPath "D:\LargeCopy"
```

---

## Спосіб 4: Перевірити USB порт і кабель

```powershell
# Переглянути чи USB пристрій підключений на 3.0
Get-PnpDevice | Where-Object { $_.Class -eq "DiskDrive" } |
  Select-Object FriendlyName, InstanceId
```

USB 3.0 порти зазвичай позначені синім кольором. Якщо підключив до чорного (USB 2.0) — швидкість буде 30–40 МБ/с замість 100–400 МБ/с.

---

## Спосіб 5: Оптимізація для великих файлів через реєстр

```powershell
# Збільшити буфер для мережевих файлових операцій
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Services\LanmanWorkstation\Parameters" `
  -Name "FileInfoCacheEntriesMax" -Value 1024 -Type DWord
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Services\LanmanWorkstation\Parameters" `
  -Name "DirectoryCacheEntriesMax" -Value 1024 -Type DWord
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Services\LanmanWorkstation\Parameters" `
  -Name "FileNotFoundCacheEntriesMax" -Value 1024 -Type DWord
```

---

## Мережеве копіювання гальмує

```powershell
# Увімкнути Jumbo Frames якщо свіч підтримує (підвищує пропускну здатність)
Set-NetAdapterAdvancedProperty -Name "Ethernet" -DisplayName "Jumbo Packet" -DisplayValue "9014"

# Перевірити SMB версію (SMBv3 набагато швидший за SMBv1)
Get-SmbServerConfiguration | Select-Object EnableSMB1Protocol, EnableSMB2Protocol

# Вимкнути SMBv1 якщо увімкнений
Set-SmbServerConfiguration -EnableSMB1Protocol $false -Force
```

---

## Перевірити швидкість диска

```powershell
# Тест швидкості запису (створить тимчасовий файл 1 ГБ)
$file = "C:\speedtest.tmp"
$sw = [System.Diagnostics.Stopwatch]::StartNew()
[System.IO.File]::WriteAllBytes($file, (New-Object byte[] 1073741824))
$sw.Stop()
$speed = [math]::Round(1024 / $sw.Elapsed.TotalSeconds)
Remove-Item $file
Write-Output "Швидкість запису: $speed МБ/с"
```

---

## Підсумок

`robocopy /MT:8` — найпростіший і найефективніший спосіб прискорити копіювання великої кількості файлів. USB 3.0 (синій порт) дає в 10 разів більшу швидкість. Тимчасове виключення папки з антивірусу при масовому копіюванні прискорює в 2–3 рази.
