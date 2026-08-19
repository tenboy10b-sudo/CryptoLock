---
title: "Everything: миттєвий пошук файлів на Windows — встановлення і налаштування"
date: "2026-10-27"
publishDate: "2026-10-27"
updated: "2026-09-08"
description: "Як встановити Everything для миттєвого пошуку файлів на Windows 10 і 11. Пошук за назвою, розміром, датою, регулярні вирази, HTTP сервер і інтеграція з іншими програмами."
tags: ["windows", "everything", "пошук", "файли", "інструменти"]
readTime: 6
translatesEn: "everything-search-windows-guide"
---

Everything від voidtools шукає файли миттєво — буквально за 0.1 секунди знаходить будь-який файл на диску. Стандартний пошук Windows порівняно з ним — черепаха.

---

## Чому Everything такий швидкий

Windows Search індексує вміст файлів — це повільно. Everything індексує тільки **імена файлів і шляхи** з MFT (Master File Table) NTFS. MFT читається напряму без сканування кожного файлу — тому перша індексація займає 2-5 секунд, а не годинами.

**Обмеження:** працює тільки з NTFS дисками. FAT32 і exFAT не підтримуються.

---

## Встановлення

```powershell
winget install voidtools.Everything
```
Або з [voidtools.com](https://www.voidtools.com/downloads/) — є портативна версія.

При першому запуску Everything запитає права адміністратора для читання MFT. Дай дозвіл — без цього індексація не працює.

---

## Базовий пошук

Просто відкрий Everything (`Win + Alt + F` за замовчуванням або через меню Пуск) і починай друкувати.

**Приклади:**
```
photo           → всі файли зі словом "photo"
*.pdf           → всі PDF файли на всіх дисках
budget 2026     → файли що містять обидва слова
"project plan"  → точна фраза
```

---

## Синтаксис пошуку

### Оператори

| Оператор | Приклад | Результат |
|---------|---------|-----------|
| `space` | `work report` | обидва слова |
| `\|` | `*.jpg \| *.png` | або jpg або png |
| `!` | `*.txt !temp` | .txt без слова temp |
| `"..."` | `"annual report"` | точна фраза |

### Фільтри

```
size:>100mb          → файли більше 100 МБ
size:10mb..50mb      → від 10 до 50 МБ
dm:today             → змінені сьогодні
dm:thisweek          → змінені цього тижня
dc:2026              → створені в 2026
ext:mp4,mkv,avi      → відеофайли
path:C:\Users        → тільки в папці Users
```

### Регулярні вирази

```
Tools → Options → Indexes → Enable regex
```

```regex
^backup.*\.zip$      → файли backup*.zip
\d{4}-\d{2}-\d{2}   → файли з датою в назві
```

---

## Гарячі клавіші

| Клавіша | Дія |
|---------|-----|
| `Win + Alt + F` | Відкрити Everything |
| `Enter` | Відкрити файл |
| `Ctrl + Enter` | Відкрити папку що містить файл |
| `Ctrl + C` | Скопіювати шлях |
| `Shift + Enter` | Відкрити від адміністратора |
| `Tab` | Перемикання між панелями |

**Змінити гарячу клавішу:**
```
Tools → Options → General → Keyboard shortcut
```

---

## Фільтри і закладки

### Вбудовані фільтри (ліва панель)
- **Audio** — музичні файли
- **Compressed** — архіви
- **Document** — документи
- **Executable** — програми
- **Picture** — зображення
- **Video** — відео

### Створити власний фільтр
```
Search → Create filter → вкажи маску і назву
```
Наприклад фільтр "Великі файли": `size:>500mb`

---

## HTTP сервер — пошук з іншого пристрою

Everything може надавати веб-інтерфейс для пошуку з телефону або іншого ПК:

```
Tools → Options → HTTP Server → Enable HTTP server
Port: 8080
```

Відкрий `http://IP_комп'ютера:8080` з будь-якого браузера в мережі.

---

## Everything CLI

```powershell
# Знайти файл з командного рядка
es.exe *.log

# Знайти великі файли
es.exe -size +104857600 -sort size-descending

# Отримати результати в текстовий файл
es.exe *.pdf > pdf_list.txt

# Підрахувати кількість файлів певного типу
(es.exe *.mp4).Count
```

---

## Інтеграція з іншими програмами

### Everything + PowerToys Run

PowerToys Run може шукати через Everything:
```
PowerToys → PowerToys Run → Plugins → Everything → Enable
```

### Everything + Total Commander

Everything SDK доступний для плагінів Total Commander.

### Everything + Listary

Listary використовує Everything для швидкого пошуку.

---

## Часті питання

### Everything не знаходить файли на USB флешці
USB використовує FAT32/exFAT — Everything їх не підтримує. Для USB використовуй звичайний пошук або конвертуй в NTFS.

### Як виключити папки з індексу
```
Tools → Options → Indexes → Exclude → Add Folder
```
Наприклад виключи `C:\Windows\System32` щоб зменшити кількість результатів.

### Everything показує видалені файли
Натисни `F5` для оновлення індексу.

---

## Everything vs Windows Search vs Agent Ransack

| | Everything | Windows Search | Agent Ransack |
|-|-----------|---------------|---------------|
| Швидкість пошуку | ⚡ Миттєво | Повільно | Середня |
| Пошук по вмісту | ❌ | ✅ | ✅ |
| Regex | ✅ | ❌ | ✅ |
| FAT32/exFAT | ❌ | ✅ | ✅ |
| Безкоштовно | ✅ | ✅ | ✅ |

---

## Резюме

| Задача | Команда/Дія |
|--------|------------|
| Знайти файл | Відкрити → друкувати назву |
| Великі файли | `size:>500mb` |
| Файли за типом | `ext:pdf,docx` |
| Змінені сьогодні | `dm:today` |
| Пошук з телефону | Tools → HTTP Server |
| Відкрити папку | Ctrl+Enter |
