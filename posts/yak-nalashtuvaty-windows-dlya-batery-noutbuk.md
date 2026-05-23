---
title: "Як перевірити здоров'я батареї ноутбука в Windows"
date: "2026-11-10"
publishDate: "2026-11-10"
description: "Детальний звіт про стан батареї ноутбука через powercfg /batteryreport. Як читати звіт, розуміти знос і коли пора міняти батарею."
tags: ["windows", "обладнання", "діагностика", "ноутбук"]
readTime: 4
---

Windows може згенерувати детальний звіт про батарею що показує її реальну ємність порівняно з заводською і прогнозований ресурс.

---

## Створити звіт про батарею

```powershell
powercfg /batteryreport
start "$env:USERPROFILE\battery-report.html"
```

Відкриє HTML-файл у браузері.

---

## Як читати звіт

**Battery information** (вгорі):
- **Design Capacity** — заводська ємність (мВт·г)
- **Full Charge Capacity** — поточна максимальна ємність
- **Cycle Count** — кількість циклів заряду

Порівняй Design Capacity і Full Charge Capacity:
```
Design:     64000 mWh
Full Charge: 51200 mWh
Знос: (64000-51200)/64000 = 20%
```

**80% і більше від заводської** — батарея в нормі.
**Менше 80%** — помітний знос, час задуматись про заміну.
**Менше 60%** — пора міняти.

---

## Recent Usage (остання активність)

Графік показує рівень заряду і споживання за останній тиждень. Звертай увагу на:
- Колонки **Drain** (розряд) — середнє мВт споживання
- Різкі скачки = щось активно споживало батарею

---

## Battery Capacity History (графік зносу)

Показує як змінювалась повна ємність з часом. Чим довше батарея у використанні — тим нижча Full Charge Capacity.

---

## Через PowerShell

```powershell
# Базова інформація
Get-WmiObject Win32_Battery | Select-Object `
  Name,
  @{n='DesignCapacity(mWh)';e={$_.DesignCapacity}},
  @{n='FullCapacity(mWh)';e={$_.FullChargeCapacity}},
  EstimatedChargeRemaining,
  BatteryStatus

# Розрахувати знос
$bat = Get-WmiObject Win32_Battery
if ($bat.DesignCapacity) {
  $wear = [math]::Round((1 - $bat.FullChargeCapacity/$bat.DesignCapacity) * 100, 1)
  Write-Host "Battery wear: $wear%"
  Write-Host "Health: $([math]::Round($bat.FullChargeCapacity/$bat.DesignCapacity*100,1))%"
}
```

---

## Як продовжити ресурс батареї

**Уникай крайностей заряду:**
Тримай батарею між 20-80% — це найбільше впливає на довговічність. Постійна зарядка до 100% прискорює знос.

Деякі ноутбуки (Lenovo, Dell, ASUS) мають функцію обмеження заряду до 80% в BIOS або фірмовому ПЗ.

**Зберігання:**
Якщо не використовуєш ноутбук кілька тижнів — заряди до 50% і виключи. Зберігання на 100% або 0% шкодить батареї.

---

## Коди статусу батареї

```powershell
# BatteryStatus значення
# 1 = Розряджається
# 2 = Підключена до мережі
# 3 = Повністю заряджена
# 4 = Низький заряд
# 5 = Критично низький
# 6 = Заряджається
(Get-WmiObject Win32_Battery).BatteryStatus
```

---


---

## 🛡️ Перевір безпеку свого ПК

Хочеш знати чи немає витоків даних, зайвих служб або підозрілих програм на твоєму ПК?

**[→ AuditShield](/tools/auditshield)** — аудит Windows по 22 напрямках за 10 хвилин. HTML-звіт з оцінкою ризику. Є безкоштовне демо.


## Резюме

`powercfg /batteryreport` → відкрий HTML звіт → дивись Design Capacity vs Full Charge Capacity. Знос > 20% — нормально для 2+ років. Знос > 40% — батарею варто замінити. Для максимального ресурсу тримай заряд між 20-80%.
