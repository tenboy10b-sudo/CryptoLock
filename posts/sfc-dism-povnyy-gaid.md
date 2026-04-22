---
title: "Як перевірити цілісність системних файлів SFC і DISM: детальний гайд"
date: "2026-04-12"
description: "Повний гайд по SFC /scannow і DISM /RestoreHealth: коли запускати, в якому порядку, як читати результати і що робити якщо не допомогло."
tags: ["sfc", "dism", "відновлення", "cmd"]
readTime: 6
---

SFC і DISM — два вбудованих інструменти для відновлення пошкоджених файлів Windows. Їх часто плутають або використовують неправильно. Розберемо повністю.

## Коли використовувати SFC і DISM

Запускай якщо:
- Windows нестабільна, часті вильоти або синій екран
- Системні програми не відкриваються
- `chkdsk` не знайшов проблем але система гальмує
- Після видалення вірусу

---

## Правильний порядок запуску

**Завжди спочатку DISM, потім SFC.**

Причина: SFC відновлює файли з локального кешу (`C:\Windows\WinSxS`). Якщо кеш теж пошкоджений — SFC відновить файли знову пошкодженими. DISM спочатку відновлює сам кеш з Windows Update або ISO.

---

## Крок 1: DISM

Відкрий CMD від адміністратора.

**Перевірка без виправлень:**
```cmd
DISM /Online /Cleanup-Image /CheckHealth
```
Займає 30 секунд.

**Сканування (детальніше):**
```cmd
DISM /Online /Cleanup-Image /ScanHealth
```
Займає 5–15 хвилин.

**Відновлення (завантажує з Windows Update):**
```cmd
DISM /Online /Cleanup-Image /RestoreHealth
```
Займає 15–30 хвилин. Потрібен інтернет.

---

## DISM без інтернету — з ISO

Якщо інтернету немає або Windows Update не працює:

1. Підключи або змонтуй ISO Windows тієї ж версії
2. Знайди файл `install.wim` (зазвичай у папці `sources`)

```cmd
DISM /Online /Cleanup-Image /RestoreHealth /Source:D:\sources\install.wim /LimitAccess
```

`/LimitAccess` — не використовувати Windows Update, тільки ISO.

---

## Крок 2: SFC після DISM

```cmd
sfc /scannow
```

Займає 10–30 хвилин. **Не закривай вікно.**

**Результати:**
| Повідомлення | Дія |
|---|---|
| `Windows Resource Protection did not find any integrity violations` | Все добре |
| `Windows Resource Protection found corrupt files and successfully repaired them` | Виправлено — перезавантаж |
| `Windows Resource Protection found corrupt files but was unable to fix some of them` | Дивись логи |

---

## Якщо SFC не зміг виправити

**Крок 1.** Подивись лог:
```cmd
findstr /c:"[SR]" %windir%\Logs\CBS\CBS.log > "%userprofile%\Desktop\sfc_log.txt"
```

Відкрий `sfc_log.txt` на робочому столі — там будуть деталі яких файлів не вдалось відновити.

**Крок 2.** Спробуй запустити SFC в безпечному режимі — там менше процесів займають файли.

**Крок 3.** Якщо конкретний файл не відновлюється — можна вручну скопіювати його з іншого ПК з такою ж версією Windows.

---

## Автономний SFC при завантаженні

Якщо Windows взагалі не запускається:

З середовища відновлення (Recovery Environment):
```cmd
sfc /scannow /offbootdir=C:\ /offwindir=C:\Windows
```

---

## Перевірка без адміна (обмежений режим)

```cmd
sfc /verifyonly
```

Тільки перевіряє — не виправляє. Не потребує перезавантаження для диска C:.

> Також дивись: [SFC і DISM: відновлення пошкоджених системних файлів](/sfc-dism-vidnovlennya-systemnykh-fayliv)
