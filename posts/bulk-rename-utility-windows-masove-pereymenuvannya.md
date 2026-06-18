---
title: "Bulk Rename Utility: масове перейменування файлів на Windows"
date: "2026-06-18"
publishDate: "2026-09-18"
updated: "2026-06-18"
description: "Як встановити Bulk Rename Utility і масово перейменовувати файли на Windows. Додавання номерів, зміна розширень, видалення символів, регулярні вирази і PowerShell альтернативи."
tags: ["windows", "bulk-rename", "файли", "інструменти", "автоматизація"]
readTime: 6
translatesEn: "bulk-rename-utility-windows-guide"
---

Bulk Rename Utility — безкоштовна програма для масового перейменування сотень файлів за кілька кліків. Корисна для фотографів, відеографів і всіх хто працює з великими колекціями файлів.

---

## Встановлення

Завантаж з [bulkrenameutility.co.uk](https://www.bulkrenameutility.co.uk/Download.php) — є портативна версія без встановлення.

```powershell
winget install TGRMNSoftware.BulkRenameUtility
```

---

## Інтерфейс

Bulk Rename Utility виглядає складно — багато полів. Але більшість операцій використовують тільки кілька секцій:

- **Вгорі** — навігатор папок і список файлів
- **Внизу** — панелі перейменування (A-S)
- **Знизу праворуч** — попередній перегляд нових імен

**Важливо:** натисни **"Rename"** тільки після перевірки попереднього перегляду.

---

## Типові сценарії

### 1. Пронумерувати файли

Додати порядковий номер до назви:

```
Секція C (Numbering):
Start: 001
Incr: 1
Pad: 3 (001, 002, 003...)
Format: {NAME} ({NUM})
```

Результат: `photo.jpg` → `photo (001).jpg`

### 2. Видалити зайві символи з назви

```
Секція E (Remove):
First n chars: 4    ← видалити перші 4 символи
Last n chars: 0
```

Або видалити конкретний текст:
```
Секція D (Replace):
Replace: "IMG_"
With: ""
```

### 3. Змінити регістр

```
Секція I (Case):
□ Upper    — ВЕЛИКІ ЛІТЕРИ
□ Lower    — маленькі літери
□ Title    — Кожне Слово З Великої
□ Sentence — Перше слово з великої
```

### 4. Додати текст до назви

```
Секція B (Add):
Prefix: "2026_"     ← додати на початку
Suffix: "_backup"   ← додати в кінці
```

Результат: `photo.jpg` → `2026_photo_backup.jpg`

### 5. Замінити пробіли на підкреслення

```
Секція D (Replace):
Replace: " "
With: "_"
□ RegEx off
```

### 6. Перейменувати за датою файлу

```
Секція A (Name):
New Name: (залиш порожнім)

Секція J (Append Folder Name):
або

Секція K (Numbering) → вибери Date Modified
Format: {YYYY}{MM}{DD}_{HH}{MM}
```

---

## Регулярні вирази

Увімкни **RegEx** в секції D для складніших замін:

```regex
# Видалити цифри з назви
\d+ → (пусто)

# Залишити тільки перші 10 символів
^(.{10}).* → $1

# Замінити кілька пробілів на один
\s+ → _

# Видалити все після дужки
\s*\(.*\) → (пусто)
```

---

## PowerShell — альтернатива без програм

Для простих операцій PowerShell швидший:

```powershell
# Додати префікс до всіх jpg
Get-ChildItem *.jpg | Rename-Item -NewName { "2026_" + $_.Name }

# Замінити пробіли на підкреслення
Get-ChildItem *.mp4 | Rename-Item -NewName { $_.Name -replace ' ', '_' }

# Пронумерувати файли
$i = 1
Get-ChildItem *.jpg | Sort-Object Name | ForEach-Object {
    Rename-Item $_ -NewName ("photo_{0:D3}.jpg" -f $i++)
}

# Змінити розширення .jpeg на .jpg
Get-ChildItem *.jpeg | Rename-Item -NewName { $_.Name -replace '\.jpeg$', '.jpg' }

# Видалити перші 4 символи з назви
Get-ChildItem *.mp3 | Rename-Item -NewName { $_.Name.Substring(4) }
```

---

## Зміна розширень файлів

```
Секція G (Extension):
New Ext: jpg    ← нове розширення (без крапки)
```

Наприклад `.jpeg` → `.jpg` або `.TXT` → `.txt`

---

## Фільтрація файлів

Перед перейменуванням відфільтруй що хочеш перейменувати:

```
Filter: *.jpg      ← тільки JPG файли
□ Subfolders       ← включити підпапки
□ Files only       ← тільки файли (не папки)
```

---

## Скасувати перейменування

```
Edit → Undo (Ctrl+Z)
```

Bulk Rename Utility зберігає журнал — можна відмінити останнє перейменування.

---

## Резюме

| Задача | Секція |
|--------|--------|
| Додати номери | C (Numbering) |
| Видалити текст | D (Replace) або E (Remove) |
| Додати префікс/суфікс | B (Add) |
| Змінити регістр | I (Case) |
| Змінити розширення | G (Extension) |
| Складні операції | D (Replace) + RegEx |
| Без програм | PowerShell Rename-Item |
