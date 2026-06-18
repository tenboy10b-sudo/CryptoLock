---
title: "Notepad++ на Windows: встановлення, налаштування і корисні функції"
date: "2026-06-15"
publishDate: "2026-09-13"
updated: "2026-06-15"
description: "Як встановити Notepad++ і налаштувати для роботи з кодом і текстом. Теми, плагіни, підсвічування синтаксису, макроси, порівняння файлів і масова заміна тексту."
tags: ["windows", "notepad++", "редактор", "інструменти", "програмування"]
readTime: 6
translatesEn: "notepad-plus-plus-windows-guide"
---

Notepad++ — легкий безкоштовний редактор коду і тексту для Windows. Замінює стандартний Блокнот і підходить для редагування конфігів, скриптів, логів і коду.

---

## Встановлення

```powershell
winget install Notepad++.Notepad++
```
Або з [notepad-plus-plus.org](https://notepad-plus-plus.org/downloads/).

---

## Основні переваги над стандартним Блокнотом

- Підсвічування синтаксису для 80+ мов
- Вкладки — кілька файлів одночасно
- Пошук і заміна з регулярними виразами
- Макроси — записати і повторити дії
- Плагіни — порівняння файлів, FTP, конвертація
- Без реклами, без телеметрії

---

## Налаштування після встановлення

### Тема оформлення
```
Settings → Style Configurator → Select theme
```
Популярні темні теми: **Dracula**, **Monokai**, **Deep Black**

### Шрифт
```
Settings → Style Configurator → Global Styles → Default Style → Font name
```
Рекомендовано: **JetBrains Mono**, **Consolas**, **Fira Code**

### Кодування UTF-8 за замовчуванням
```
Settings → Preferences → New Document → Encoding → UTF-8
```

### Показати пробіли і таби
```
View → Show Symbol → Show Whitespace and TAB
```

---

## Пошук і заміна

`Ctrl+H` — відкрити діалог пошуку і заміни

**Режими пошуку:**
| Режим | Опис |
|-------|------|
| Normal | Звичайний текстовий пошук |
| Extended | Підтримка `\n`, `\t`, `\r` |
| Regular expression | Регулярні вирази |

**Корисні regex приклади:**
```
# Видалити порожні рядки
^\s*\n → (замінити нічим)

# Видалити пробіли в кінці рядків
\s+$ → (замінити нічим)

# Знайти IP адреси
\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}

# Замінити всі крапки комою
\. → ,
```

### Пошук у кількох файлах
```
Search → Find in Files (Ctrl+Shift+F)
```
Вкажи папку і маску файлів (`*.log`, `*.txt`).

---

## Корисні гарячі клавіші

| Клавіша | Дія |
|---------|-----|
| `Ctrl+D` | Дублювати рядок |
| `Ctrl+L` | Видалити рядок |
| `Ctrl+Shift+↑/↓` | Перемістити рядок |
| `Alt+Shift+стрілки` | Вертикальне виділення |
| `Ctrl+Q` | Закоментувати рядок |
| `Ctrl+/` | Розкоментувати |
| `Ctrl+G` | Перейти до рядка |
| `F5` | Запустити програму/скрипт |
| `Ctrl+Alt+F` | Складання коду (Folding) |

---

## Плагіни

### Встановити плагін
```
Plugins → Plugins Admin → знайди плагін → Install
```

### Топ плагіни

**Compare** — порівняння двох файлів пліч-о-пліч:
```
Plugins → Compare → Compare (Alt+D)
```

**NppFTP** — редагування файлів напряму на FTP/SFTP сервері

**JSON Viewer** — форматування і перегляд JSON

**XML Tools** — форматування XML

**Converter** — конвертація кодувань і форматів

---

## Макроси

Записати повторювані дії і відтворити:

1. `Macro → Start Recording`
2. Виконай потрібні дії (пошук, заміна, форматування)
3. `Macro → Stop Recording`
4. `Macro → Playback` — відтворити один раз
5. `Macro → Run a Macro Multiple Times` — повторити N разів або для всіх рядків

### Зберегти макрос
```
Macro → Save Current Recorded Macro → вкажи назву і гарячу клавішу
```

---

## Мовна асоціація файлів

Щоб Notepad++ автоматично відкривав певні типи файлів:
```
Settings → Preferences → File Association → вибери розширення → Add
```

---

## Notepad++ як редактор Git

```powershell
# Встановити Notepad++ як редактор для Git
git config --global core.editor "'C:/Program Files/Notepad++/notepad++.exe' -multiInst -notabbar -nosession -noPlugin"
```

---

## Резюме

| Задача | Рішення |
|--------|---------|
| Темна тема | Settings → Style Configurator → Dracula |
| Масова заміна regex | Ctrl+H → Regular expression |
| Порівняти файли | Plugins → Compare |
| Макрос | Macro → Start/Stop Recording |
| Пошук у файлах | Ctrl+Shift+F |
