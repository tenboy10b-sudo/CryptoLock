---
title: "Редактор реєстру Windows: що це і як безпечно з ним працювати"
date: "2026-07-04"
publishDate: "2026-07-04"
description: "Основи роботи з реєстром Windows: структура, пошук і редагування ключів, резервне копіювання і відновлення, типові налаштування через regedit."
tags: ["windows", "реєстр", "налаштування", "адміністрування", "інструменти"]
readTime: 6
---

Реєстр Windows — центральна база даних налаштувань системи і програм. Зміна реєстру дозволяє тонко налаштувати Windows, але неправильні зміни можуть зламати систему. Ось як працювати безпечно.

---

## Відкрити редактор реєстру

`Win + R` → `regedit` → **Так** (підтвердити UAC)

---

## Структура реєстру

П'ять кореневих розділів:

| Розділ | Скорочення | Що містить |
|--------|-----------|-----------|
| HKEY_LOCAL_MACHINE | HKLM | Налаштування системи для всіх користувачів |
| HKEY_CURRENT_USER | HKCU | Налаштування поточного користувача |
| HKEY_CLASSES_ROOT | HKCR | Асоціації файлів і COM-об'єкти |
| HKEY_USERS | HKU | Профілі всіх користувачів |
| HKEY_CURRENT_CONFIG | HKCC | Поточна конфігурація обладнання |

**Найчастіше використовуєш:**
- `HKLM\SOFTWARE` — налаштування програм для всіх
- `HKCU\SOFTWARE` — налаштування програм для тебе
- `HKLM\SYSTEM\CurrentControlSet` — налаштування системи
- `HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run` — автозапуск

---

## Типи значень

| Тип | Позначення | Для чого |
|-----|-----------|---------|
| String | REG_SZ | Текст |
| DWORD (32-bit) | REG_DWORD | Число (найчастіший) |
| QWORD (64-bit) | REG_QWORD | Велике число |
| Expandable String | REG_EXPAND_SZ | Текст зі змінними (%PATH%) |
| Binary | REG_BINARY | Двійкові дані |
| Multi-String | REG_MULTI_SZ | Кілька рядків |

---

## Швидка навігація

В адресному рядку regedit вставляй повний шлях:

```
HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\Run
```

`Ctrl + F` — пошук по реєстру (повільно, шукає все).

---

## Резервна копія перед змінами — обов'язково

```
Файл → Експорт → вибери All (весь реєстр) або вибраний розділ → збережи .reg файл
```

Або через CMD:
```cmd
reg export HKLM\SOFTWARE\MyApp C:\backup-myapp.reg
```

**Відновити:**
Двічі клікни на .reg файл → **Так** → значення відновлено.

---

## Практичні налаштування через regedit

### Показати розширення файлів

```
HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Advanced
→ HideFileExt → змінити на 0
```

### Вимкнути автоматичне перезавантаження після оновлень

```
HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU
→ NoAutoRebootWithLoggedOnUsers → DWORD → 1
```

### Додати програму в автозапуск

```
HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\Run
→ Правою кнопкою → Новий → Рядковий параметр
→ Ім'я: назва програми
→ Значення: "C:\path\to\program.exe"
```

### Вимкнути Cortana

```
HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows\Windows Search
→ AllowCortana → DWORD → 0
```

### Змінити розташування папок користувача

```
HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders
→ Personal (Документи) → змінити шлях
```

---

## Пошук і видалення слідів видаленої програми

Після видалення програми в реєстрі залишаються сліди:

`Ctrl + F` → введи назву програми → **Знайти далі** → видаляй знайдені ключі (F3 — наступний результат).

> Видаляй тільки ключі що явно відносяться до видаленої програми.

---

## Команди reg.exe (без GUI)

```cmd
rem Читати значення
reg query "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"

rem Записати значення
reg add "HKCU\SOFTWARE\MyApp" /v "Setting" /t REG_DWORD /d 1 /f

rem Видалити значення
reg delete "HKCU\SOFTWARE\MyApp" /v "Setting" /f

rem Видалити весь ключ
reg delete "HKCU\SOFTWARE\MyApp" /f

rem Експортувати
reg export "HKCU\SOFTWARE\MyApp" C:\backup.reg

rem Імпортувати
reg import C:\backup.reg

rem Порівняти два ключі
reg compare "HKCU\SOFTWARE\MyApp" "HKLM\SOFTWARE\MyApp"
```

---

## Заборонити доступ до реєстру для інших користувачів

```
HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System
→ DisableRegistryTools → DWORD → 1
```

Або через GPO: [Права доступу і обмеження через GPO](/gpo-obmezhennya-dlya-koristuvachiv-domenu)

---

## Підсумок

Перед будь-якою зміною — **Файл → Експорт** потрібного розділу. Частіше потрібні: `HKCU\SOFTWARE` (налаштування для тебе) і `HKLM\SOFTWARE` (для всіх). `reg query/add/delete` — для скриптів. Після помилки — двічі клікни на збережений .reg файл щоб відновити.
