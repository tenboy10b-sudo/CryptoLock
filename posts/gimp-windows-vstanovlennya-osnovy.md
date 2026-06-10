---
title: "GIMP на Windows: встановлення, основи і порівняння з Photoshop"
date: "2026-06-10"
publishDate: "2026-08-28"
updated: "2026-06-10"
description: "Як встановити GIMP на Windows 10 і 11 і почати редагувати фото. Основні інструменти, шари, виправлення кольорів. Чим GIMP відрізняється від Photoshop і де скачати плагіни."
tags: ["windows", "gimp", "фото", "графіка", "інструменти"]
readTime: 7
translatesEn: "gimp-windows-installation-beginners-guide"
---

GIMP — безкоштовний редактор зображень з відкритим кодом. Повноцінна альтернатива Photoshop для тих хто не хоче платити $600/рік. Ось як встановити і почати роботу.

---

## GIMP vs Photoshop

| | GIMP | Photoshop |
|-|------|----------|
| Ціна | Безкоштовно | $600/рік |
| Відкритий код | ✅ | ❌ |
| Шари | ✅ | ✅ |
| RAW файли | ✅ (через плагін) | ✅ |
| Розширення файлів | .xcf (рідний), PNG, JPG, PSD | .psd, PNG, JPG |
| Крива навчання | Середня | Середня |
| Плагіни | ✅ (Script-Fu, Python) | ✅ |

---

## Встановлення

1. Завантаж з [gimp.org/downloads](https://www.gimp.org/downloads/) → **Windows installer**
2. Запусти інсталятор → встанови
3. Перший запуск займає 10–30 сек (ініціалізація)

```powershell
# Або через winget
winget install GIMP.GIMP
```

---

## Інтерфейс GIMP

Після запуску відкриються три вікна:
- **Toolbox** — інструменти (зліва)
- **Canvas** — полотно (центр)
- **Layers/Channels** — шари (справа)

**Перейти в однооконний режим (як Photoshop):**
```
Windows → Single-Window Mode
```

---

## Основні інструменти

| Інструмент | Клавіша | Призначення |
|-----------|---------|------------|
| Move | M | Переміщення шарів |
| Crop | Shift+C | Обрізка |
| Scale | Shift+T | Масштабування |
| Selection (Rect) | R | Прямокутне виділення |
| Selection (Free) | F | Вільне виділення |
| Fuzzy Select | U | Виділення по кольору |
| Pencil | N | Олівець |
| Paintbrush | P | Пензель |
| Eraser | Shift+E | Гумка |
| Clone | C | Клонування (ретуш) |
| Color Picker | O | Піпетка |
| Text | T | Текст |

---

## Базові операції

### Відкрити і зберегти

```
File → Open (Ctrl+O)  — відкрити файл
File → Export As (Ctrl+Shift+E)  — зберегти як JPG/PNG
File → Save (Ctrl+S)  — зберегти в GIMP форматі .xcf
```

> Ctrl+S зберігає тільки в .xcf. Для JPG/PNG використовуй Export As.

### Змінити розмір зображення

```
Image → Scale Image → вкажи нові розміри → Scale
```

### Обрізати зображення

```
Image → Canvas Size → нові розміри → Resize
```
Або інструмент Crop (Shift+C) — намалюй область.

### Виправити яскравість і контраст

```
Colors → Brightness-Contrast
Colors → Curves  (точніший контроль)
Colors → Levels
```

---

## Шари (Layers)

Шари — основа редагування в GIMP:

```
File → Open as Layers — додати файл як новий шар
Layer → New Layer — створити порожній шар
```

**Режими шарів** (як в Photoshop):
- Normal, Multiply, Screen, Overlay — стандартні
- Opacity — прозорість шару (0–100%)

---

## Видалення фону

### Простий фон (однотонний):

1. Відкрий зображення
2. Додай альфа-канал: `Layer → Transparency → Add Alpha Channel`
3. Вибери **Fuzzy Select** (U) → клікни на фон
4. Delete → фон видалено

### Складний фон:

```
Filters → Foreground Select
```
Або використовуй **Free Select** (F) для ручного обведення.

---

## Корисні плагіни і розширення

### GIMP Plugin Registry
Офіційний репозиторій плагінів: [registry.gimp.org](http://registry.gimp.org)

### G'MIC — набір фільтрів
Понад 500 ефектів для фото:
1. Завантаж з [gmic.eu](https://gmic.eu/download.html)
2. Скопіюй в `C:\Users\[user]\AppData\Roaming\GIMP\2.10\plug-ins`

### Photoshop плагіни (.8bf)
GIMP підтримує деякі Photoshop плагіни:
```
Edit → Preferences → Folders → Plug-ins → додай папку з .8bf файлами
```

---

## Гарячі клавіші GIMP vs Photoshop

| Дія | GIMP | Photoshop |
|-----|------|----------|
| Undo | Ctrl+Z | Ctrl+Z |
| Zoom in | + | Ctrl++ |
| Zoom out | - | Ctrl+- |
| Fit to window | Shift+Ctrl+E | Ctrl+0 |
| Flatten image | Image → Flatten | Ctrl+Shift+E |
| New layer | Ctrl+Shift+N | Ctrl+Shift+N |

---

## Резюме

| Завдання | Де в GIMP |
|---------|----------|
| Відкрити файл | File → Open |
| Зберегти JPG/PNG | File → Export As |
| Змінити розмір | Image → Scale Image |
| Яскравість | Colors → Brightness-Contrast |
| Видалити фон | Layer → Add Alpha → Fuzzy Select → Delete |
| Шари | Windows → Dockable Dialogs → Layers |
