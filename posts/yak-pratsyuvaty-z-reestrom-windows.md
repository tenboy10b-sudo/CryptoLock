---
title: "Редактор реєстру Windows: як безпечно редагувати реєстр"
date: "2025-11-25"
publishDate: "2025-11-25"
description: "Як відкрити реєстр Windows, знайти потрібний ключ, змінити значення і зробити резервну копію. Основні кущі реєстру і команди PowerShell для роботи з реєстром."
tags: ["windows", "реєстр", "налаштування", "інструменти"]
readTime: 5
---

Реєстр Windows — централізована база даних налаштувань системи і програм. Більшість користувачів ніколи його не відкривають — і правильно роблять. Але іноді без нього не обійтись.

---

## Відкрити редактор реєстру

`Win + R` → `regedit` → Enter → підтверди UAC.

Або: `Win + S` → **Редактор реєстру**

---

## Структура реєстру

| Куща | Скорочення | Що зберігає |
|------|-----------|-------------|
| HKEY_LOCAL_MACHINE | HKLM | Налаштування системи і програм для всіх користувачів |
| HKEY_CURRENT_USER | HKCU | Налаштування поточного користувача |
| HKEY_CLASSES_ROOT | HKCR | Асоціації файлів і COM об'єкти |
| HKEY_USERS | HKU | Профілі всіх користувачів |
| HKEY_CURRENT_CONFIG | HKCC | Поточна конфігурація обладнання |

Більшість твіків — в **HKCU** (для поточного користувача) або **HKLM** (для всієї системи).

---

## Перш ніж редагувати: зроби бекап

**Бекап всього реєстру:**
`Файл` → `Експортувати` → вибери **Всі** → збережи як `.reg` файл.

**Бекап конкретного ключа:**
Перейди до потрібного ключа → `Файл` → `Експортувати` → вибери **Вибрана гілка`.

Для відновлення: двічі клікни на `.reg` файл.

---

## Типи значень реєстру

| Тип | Що зберігає | Приклад |
|-----|------------|---------|
| REG_DWORD | Число (32 біт) | 0 або 1 для вмк/вимк |
| REG_SZ | Рядок тексту | Шлях до файлу |
| REG_EXPAND_SZ | Рядок зі змінними | `%SystemRoot%\system32` |
| REG_BINARY | Двійкові дані | Ключі шифрування |
| REG_MULTI_SZ | Кілька рядків | Список значень |

---

## Навігація і пошук

Перейди до ключа вставивши шлях в адресний рядок вгорі (Windows 10+):
```
HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer
```

Пошук: `Ctrl + F` → введи назву ключа, значення або дані.

---

## Редагування через PowerShell

```powershell
# Прочитати значення
Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" `
  -Name "Hidden"

# Змінити значення (показати приховані файли)
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" `
  -Name "Hidden" -Value 1 -Type DWord

# Створити новий ключ
New-Item -Path "HKCU:\Software\MyApp" -Force

# Створити нове значення
New-ItemProperty -Path "HKCU:\Software\MyApp" `
  -Name "Setting" -Value "enabled" -PropertyType String

# Видалити значення
Remove-ItemProperty -Path "HKCU:\Software\MyApp" -Name "Setting"

# Видалити ключ
Remove-Item -Path "HKCU:\Software\MyApp" -Recurse
```

---

## Корисні шляхи реєстру

```
# Автозавантаження (поточний користувач)
HKCU\Software\Microsoft\Windows\CurrentVersion\Run

# Автозавантаження (всі користувачі)
HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run

# Асоціації файлів
HKCU\Software\Classes

# Налаштування провідника
HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced

# Групові політики (застосовані через реєстр)
HKLM\SOFTWARE\Policies\Microsoft\Windows
```

---

## Застереження

- **Не видаляй невідомі ключі** — це може зламати систему або програми
- **Завжди роби бекап** перед змінами
- **HKLM вимагає прав адміністратора** для запису
- Зміни набирають чинності після перезавантаження або перезапуску Провідника

---

## Резюме

Реєстр — потужний інструмент але потребує обережності. Для більшості завдань достатньо PowerShell (`Set-ItemProperty`, `Get-ItemProperty`). Завжди роби експорт перед змінами — відновлення займає секунди, а поломка може коштувати годин.
