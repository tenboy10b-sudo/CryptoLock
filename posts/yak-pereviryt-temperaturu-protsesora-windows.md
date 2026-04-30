---
title: "Як перевірити температуру процесора і відеокарти в Windows"
date: "2026-08-28"
publishDate: "2026-08-28"
description: "Як переглянути температуру CPU і GPU в Windows через вбудовані засоби, HWiNFO64, MSI Afterburner і PowerShell. Норми температур і що робити при перегріві."
tags: ["windows", "діагностика", "обладнання", "продуктивність", "моніторинг"]
readTime: 5
---

Перегрів — одна з найчастіших причин зависань, BSOD і раптових вимкнень. Windows 11 показує температуру процесора в Диспетчері завдань, але для повного аналізу потрібні окремі програми.

---

## Вбудовані засоби Windows

### Диспетчер завдань (тільки CPU, Windows 11)

`Ctrl + Shift + Esc` → **Продуктивність** → **CPU** — внизу показує температуру процесора.

> Доступно тільки в Windows 11. Windows 10 температуру не показує.

### PowerShell (CPU — обмежено)

```powershell
# Температура через WMI (не на всіх системах)
Get-WmiObject MSAcpi_ThermalZoneTemperature -Namespace root/wmi |
  Select-Object @{N="Temp C";E={($_.CurrentTemperature - 2732) / 10}}
```

---

## HWiNFO64 — найповніший безкоштовний моніторинг

Найкращий інструмент для моніторингу температур. Показує температуру кожного ядра CPU, GPU, VRAM, материнської плати, дисків.

1. Завантаж з hwinfo.com → Portable версія (не потрібно встановлювати)
2. Запусти → натисни **Run** → потім **Sensors Only**
3. Шукай секцію CPU і GPU в списку сенсорів

---

## MSI Afterburner — для відеокарти і OSD

Для геймерів — показує температури прямо на екрані під час гри (OSD — On-Screen Display).

1. Завантаж з msi.com/Landing/afterburner (безкоштовно)
2. Встанови → в налаштуваннях вкладка **Monitoring** → додай Temperature GPU в OSD
3. Тепер в іграх у куті показується температура GPU

---

## Норми температур

| Компонент | Норма (спокій) | Норма (навантаження) | Критично |
|-----------|---------------|---------------------|---------|
| CPU Intel/AMD | 30–50°C | 70–85°C | >95°C |
| GPU | 30–45°C | 70–85°C | >90°C |
| SSD NVMe | 30–50°C | 60–70°C | >80°C |
| HDD | 25–40°C | 40–50°C | >55°C |

---

## Що робити при перегріві

### Крок 1: Перевір вентилятори

Відкрий корпус і перевір що всі вентилятори обертаються. Вентилятор CPU і GPU — обов'язково.

### Крок 2: Продув від пилу

Пил у радіаторах — найчастіша причина перегріву після 2-3 років використання. Балончик зі стисненим повітрям або пилосос з насадкою.

### Крок 3: Замінити термопасту

На CPU і GPU термопаста висихає через 3-5 років. Після заміни температура знижується на 10-20°C.

### Крок 4: Перевірити налаштування вентиляторів

```powershell
# Переглянути швидкість вентиляторів через WMI
Get-WmiObject Win32_Fan | Select-Object Name, DesiredSpeed, Status
```

Або через BIOS: шукай **Fan Control**, **Smart Fan** або **Q-Fan** — налаштуй профіль "Performance" замість "Silent".

### Крок 5: Обмежити TDP процесора (тимчасово)

```powershell
# Обмежити максимальну потужність процесора до 80%
powercfg /setacvalueindex SCHEME_CURRENT SUB_PROCESSOR PROCTHROTTLEMAX 80
powercfg /setactive SCHEME_CURRENT
```

---

## Моніторинг температури в реальному часі через PowerShell

```powershell
# Моніторинг кожні 2 секунди (через Open Hardware Monitor COM інтерфейс)
# Потребує встановленого Open Hardware Monitor
while ($true) {
    $temp = Get-WmiObject MSAcpi_ThermalZoneTemperature -Namespace root/wmi -ErrorAction SilentlyContinue
    if ($temp) {
        $celsius = ($temp.CurrentTemperature - 2732) / 10
        Write-Output "$(Get-Date -Format 'HH:mm:ss') — CPU: $celsius°C"
    }
    Start-Sleep 2
}
```

---

## Підсумок

HWiNFO64 — запусти, вибери "Sensors Only" і одразу бачиш всі температури. Норма CPU під навантаженням — до 85°C, GPU — до 85°C. Вище 90°C — чисти від пилу і міняй термопасту. Диспетчер завдань Windows 11 показує температуру CPU без додаткових програм.
