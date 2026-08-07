---
title: "CPU-Z і GPU-Z на Windows: детальна інформація про залізо ПК"
date: "2026-06-18"
publishDate: "2027-06-01"
updated: "2026-06-18"
description: "Як використовувати CPU-Z і GPU-Z для перегляду детальної інформації про процесор, відеокарту і оперативну пам'ять на Windows. Порівняння CPU, стрес-тест і розуміння показників."
tags: ["windows", "cpu-z", "gpu-z", "залізо", "діагностика", "інструменти"]
readTime: 6
translatesEn: "cpu-z-gpu-z-windows-hardware-info-guide"
---

CPU-Z і GPU-Z — найпопулярніші безкоштовні утиліти для детальної інформації про залізо ПК. Процесор, відеокарта, оперативна пам'ять — все в одному місці.

---

## CPU-Z — детальна інформація про процесор

### Встановлення

```powershell
winget install CPUID.CPU-Z
```
Або з [cpuid.com/softwares/cpu-z.html](https://www.cpuid.com/softwares/cpu-z.html) — є портативна версія.

### Вкладки CPU-Z

**CPU (Процесор):**
- **Name** — повна назва процесора
- **Code Name** — кодова назва архітектури (Alder Lake, Zen 4 тощо)
- **Cores / Threads** — кількість ядер і потоків
- **Base Clock** — базова частота
- **Boost Clock** — максимальна частота турбо-буст
- **TDP** — тепловий пакет у ватах

**Caches:**
- L1, L2, L3 кеш — розміри і асоціативність
- Важливо для порівняння продуктивності

**Mainboard (Материнська плата):**
- Виробник і модель материнської плати
- Версія BIOS і дата
- Версія чипсету

**Memory (Оперативна пам'ять):**
- Тип (DDR4/DDR5)
- Розмір і кількість каналів
- **DRAM Frequency** — реальна частота (половина від XMP/DOCP)
- **CAS Latency, tRCD, tRP** — тайминги

**SPD:**
- Детальна інформація про кожну плашку RAM
- Підтримувані профілі XMP/EXPO

### Стрес-тест CPU-Z

```
Tools → Bench → Stress CPU
```

Навантажує процесор для перевірки стабільності та охолодження. Стеж за температурою через HWiNFO одночасно.

---

## GPU-Z — детальна інформація про відеокарту

### Встановлення

```powershell
winget install TechPowerUp.GPU-Z
```
Або з [techpowerup.com/gpuz](https://www.techpowerup.com/gpuz/).

### Основні показники GPU-Z

**Graphics Card:**
- **Name** — повна назва GPU
- **GPU** — назва чипа (AD104, Navi 31 тощо)
- **Revision** — ревізія GPU
- **Technology** — техпроцес (5nm, 7nm)
- **Die Size** — площа кристала
- **Transistors** — кількість транзисторів
- **BIOS Version** — версія BIOS відеокарти

**Memory:**
- **Memory Type** — GDDR6, GDDR6X, HBM
- **Memory Size** — обсяг VRAM
- **Memory Bus** — шина (128-bit, 256-bit, 384-bit)
- **Bandwidth** — пропускна здатність пам'яті

**Clock Speeds:**
- **GPU Clock** — базова частота ядра
- **Boost Clock** — максимальна частота
- **Default Clock** — частота за замовчуванням

**Compute:**
- **Pixel Fillrate** — продуктивність в піксельних операціях
- **Texture Fillrate** — продуктивність текстур
- **FP32 Performance** — обчислювальна потужність (TFLOPS)

### Вкладка Sensors (датчики)

```
GPU-Z → Sensors tab
```

Показує в реальному часі:
- Температура GPU і VRAM
- Навантаження GPU %
- Частота ядра і пам'яті
- Споживання енергії
- Швидкість вентиляторів

**Запис датчиків в лог:**
```
Continue refreshing this screen → Start Logging
```

---

## Практичне використання

### Перевірити чи оригінальна відеокарта

GPU-Z показує точні характеристики чипа. Порівняй з офіційними специфікаціями на сайті NVIDIA/AMD. Підроблені або перемарковані карти будуть відрізнятись.

### Дізнатись параметри RAM для покупки другої плашки

CPU-Z → SPD → вибери Slot 1 → побачиш виробника, модель і параметри. Купуй таку саму або сумісну.

### Перевірити чи увімкнений XMP/DOCP

CPU-Z → Memory → DRAM Frequency:
- **800 МГц** = DDR4-1600 (XMP вимкнений)
- **1600 МГц** = DDR4-3200 (XMP увімкнений)

Якщо XMP вимкнений і RAM повільніша ніж повинна:
```
BIOS → AI Tweaker або Overclocking → XMP/EXPO Profile → Profile 1
```

---

## Альтернативи

| Утиліта | Призначення |
|---------|------------|
| **Speccy** (Piriform) | Загальна інформація про систему |
| **HWiNFO** | Детальний моніторинг датчиків |
| **AIDA64** | Розширена діагностика (платна) |
| **msinfo32** | Вбудований в Windows (базовий) |

```powershell
# Вбудована команда Windows для інформації про систему
msinfo32

# Через PowerShell
Get-CimInstance Win32_Processor | Select-Object Name, NumberOfCores, MaxClockSpeed
Get-CimInstance Win32_VideoController | Select-Object Name, AdapterRAM, DriverVersion
Get-CimInstance Win32_PhysicalMemory | Select-Object Manufacturer, Capacity, Speed
```

---

## Резюме

| Потреба | Утиліта | Де знайти |
|---------|---------|----------|
| Інформація про CPU | CPU-Z → CPU вкладка | cpuid.com |
| Тайминги RAM | CPU-Z → Memory/SPD | cpuid.com |
| Інформація про GPU | GPU-Z → Graphics Card | techpowerup.com |
| Датчики GPU | GPU-Z → Sensors | techpowerup.com |
| Стрес-тест CPU | CPU-Z → Tools → Bench | — |
