---
title: "Windows PowerToys: повний гайд по всіх інструментах 2026"
date: "2026-05-14"
publishDate: "2026-05-14"
description: "Повний посібник по Microsoft PowerToys для Windows. FancyZones, PowerToys Run, Color Picker, Text Extractor, File Locksmith та інші — що роблять і як використовувати."
tags: ["windows", "powertoys", "продуктивність", "інструменти", "microsoft"]
readTime: 5
translatesEn: "how-to-use-windows-powertoys"
---

PowerToys — безкоштовний набір інструментів від Microsoft що додає можливості які мали бути вбудовані в Windows.

---

## Встановити PowerToys

```powershell
winget install Microsoft.PowerToys
```

---

## FancyZones — менеджер вікон

Ділить екран на кастомні зони прив'язки. Утримуй `Shift` при перетягуванні вікна щоб привязати до зони.

**Налаштування:** PowerToys → FancyZones → Редактор макетів

Найкраще для ультраширокого монітора і роботи з кількома вікнами.

---

## PowerToys Run — швидкий запуск

`Alt + Space` — відкрити швидкий лаунчер:
- Назва застосунку для запуску
- `>` для команд оболонки
- `=` для калькулятора (`= 2^10` → 1024)

---

## Keyboard Manager — переназначення клавіш

PowerToys → Keyboard Manager → переназначити клавішу або скорочення.

Приклад: `Caps Lock` → `Ctrl`, або власні скорочення для конкретних застосунків.

---

## Color Picker

`Win + Shift + C` — вибрати колір з будь-якого місця екрану. Показує HEX, RGB, HSL. Клік — копіює.

---

## Text Extractor (OCR)

`Win + Shift + T` → виділи прямокутник з текстом на екрані (зображення, відео, PDF) → текст копіюється в буфер.

---

## File Locksmith

ПКМ на файлі → **Що використовує цей файл?** Показує який процес заблокував файл — зручно при помилці "файл використовується".

---

## Image Resizer

ПКМ на зображенні → **Змінити розмір за допомогою Image Resizer**. Пакетна зміна розміру без редактора.

---

## Hosts File Editor

Зручний GUI для редагування `hosts` файлу без трюків з Notepad і адміністратором.

---

## Always on Top

`Win + Ctrl + T` — закріпити будь-яке вікно поверх всіх інших.

---

## Часті питання

### PowerToys гальмує Windows?

Мінімально — запускається як tray застосунок з низьким навантаженням. Вимкни окремі інструменти що не використовуєш.

### PowerToys безпечний?

Так, офіційний проект Microsoft з відкритим кодом на GitHub.

---

## Резюме

Встановити: `winget install Microsoft.PowerToys`. Основне: FancyZones, PowerToys Run, Text Extractor, File Locksmith. Оновлюється автоматично через winget або Microsoft Store.
