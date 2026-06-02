---
title: "Як правильно налаштувати файл підкачки Windows (Virtual Memory)"
date: "2026-07-08"
publishDate: "2026-07-08"
description: "Налаштування розміру і розташування файлу підкачки Windows. Автоматичний vs ручний режим, перенос на інший диск і виправлення помилки низької віртуальної пам'яті."
tags: ["windows", "файл-підкачки", "продуктивність", "пам'ять", "оптимізація"]
readTime: 4
translatesEn: "how-to-configure-windows-pagefile"
---

Файл підкачки розширює RAM на диск — коли фізична пам'ять заповнюється, Windows переміщує неактивні сторінки туди.

---

## Перевірити поточні налаштування

```powershell
Get-WmiObject Win32_PageFileSetting | Select-Object Name, InitialSize, MaximumSize
Get-WmiObject Win32_PageFileUsage | Select-Object Name, CurrentUsage, PeakUsage
```

---

## Автоматичний режим (рекомендовано)

```powershell
$cs = Get-WmiObject Win32_ComputerSystem
$cs.AutomaticManagedPagefile = $true
$cs.Put()
```

---

## Ручне налаштування

```powershell
# Вимкнути автоматичний режим
$cs = Get-WmiObject Win32_ComputerSystem
$cs.AutomaticManagedPagefile = $false
$cs.Put()

# Видалити поточний файл підкачки
Get-WmiObject Win32_PageFileSetting | ForEach-Object { $_.Delete() }

# Створити новий з фіксованим розміром
$pf = ([WMIClass]"Win32_PageFileSetting").CreateInstance()
$pf.Name = "C:\pagefile.sys"
$pf.InitialSize = 4096   # 4 ГБ
$pf.MaximumSize = 8192   # 8 ГБ
$pf.Put()
```

---

## Рекомендовані розміри

| RAM | Мінімум | Максимум |
|-----|---------|---------|
| 4 ГБ | 4 ГБ | 8 ГБ |
| 8 ГБ | 4 ГБ | 8 ГБ |
| 16 ГБ | 4 ГБ | 8 ГБ |
| 32+ ГБ | 2 ГБ | 4 ГБ |

---

## Часті питання

### Чи виснажує файл підкачки на SSD диск?

Сучасні SSD розраховані на сотні ТБ запису. Типовий файл підкачки записує 1-10 ГБ/день — мізерно. Не переміщуй заради збереження SSD.

### Файл підкачки 20 ГБ — це забагато?

Великий файл підкачки вказує на нестачу RAM — система сильно покладається на віртуальну пам'ять. Додай фізичну RAM замість збільшення файлу підкачки.

---

## Резюме

Автоматичний режим підходить більшості. Для контролю: вимкни авто, встанови початковий = RAM × 0.5, максимум = RAM × 1.5. Ніколи не вимикай якщо менше 32 ГБ RAM.
