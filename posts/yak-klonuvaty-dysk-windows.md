---
title: "Як клонувати диск Windows на новий SSD без перевстановлення"
date: "2026-09-07"
publishDate: "2026-09-07"
description: "Клонування системного диска Windows на новий SSD або HDD через Macrium Reflect Free і Clonezilla: покрокова інструкція без втрати даних і перевстановлення системи."
tags: ["windows", "диск", "відновлення", "інструменти", "оптимізація"]
readTime: 6
---

Купив новий SSD і хочеш перенести Windows без перевстановлення? Клонування диска копіює все — систему, програми, файли і налаштування — на новий диск за 30–60 хвилин.

---

## Що потрібно

- Новий SSD або HDD (рівний або більший за зайняте місце на старому)
- USB-перехідник SATA-USB або другий слот у ноутбуці/ПК
- Macrium Reflect Free (безкоштовно) або Clonezilla

---

## Спосіб 1: Macrium Reflect Free (найпростіший)

### Встановлення

Завантаж з macrium.com → безкоштовна версія → встанови.

### Клонування

1. Підключи новий SSD через USB-перехідник або встав у другий слот
2. Відкрий Macrium Reflect → вкладка **Clone this disk**
3. Вибери **Source disk** — поточний системний диск
4. Натисни **Select a disk to clone to** → вибери новий SSD
5. Перевір що всі розділи відображені (EFI, System Reserved, C:)
6. Натисни **Cloned Partition Properties** → якщо новий диск більший — розшир розділ C
7. Натисни **Finish** → **Run this backup now**

Процес займає 20–60 хвилин залежно від обсягу даних.

---

## Спосіб 2: Windows вбудоване резервне копіювання + відновлення

```powershell
# Створити системний образ на новий диск
# (менш зручно ніж Macrium але безкоштовно і без програм)
wbAdmin start backup -backupTarget:E: -include:C: -allCritical -quiet
```

Для відновлення — завантажся з інсталяційного USB → Відновлення системи → Відновлення образу.

---

## Спосіб 3: Robocopy (тільки файли, без системи)

Якщо потрібно перенести тільки дані, а Windows встановити заново:

```powershell
robocopy C:\Users\UserName D:\Backup\UserName /MIR /COPYALL /R:3 /W:5
```

Детальніше: [Robocopy — синхронізація папок](/robocopy-synkhronizatsiya-papok-windows)

---

## Після клонування — що зробити

### 1. Встановити новий SSD основним завантажувальним

Зайди в BIOS (`Del`, `F2` або `F12` при старті) → Boot → вибери новий SSD першим у списку.

### 2. Оптимізувати SSD

```powershell
# Перевірити чи TRIM увімкнений
fsutil behavior query DisableDeleteNotify

# 0 = TRIM увімкнений (добре)
# 1 = TRIM вимкнений — увімкни:
fsutil behavior set DisableDeleteNotify 0
```

### 3. Перевірити вирівнювання розділів

```cmd
msinfo32
rem System Summary → Storage → Disks → Partition Starting Offset
rem Має бути кратним 4096 для SSD
```

### 4. Перевірити активацію Windows

```cmd
slmgr /xpr
```

При клонуванні на інше залізо Windows може потребувати повторної активації.

---

## Типові проблеми

### Після клонування Windows не завантажується

Не вибраний правильний диск у BIOS або не перенесений EFI розділ.

```cmd
rem Відновити завантажувач (з інсталяційного USB → командний рядок)
bootrec /fixmbr
bootrec /fixboot
bootrec /rebuildbcd
```

Детальніше: [Відновлення завантажувача Windows](/vidnovlennya-zavantazhuvach-windows)

### Клонування зупинилось через bad sectors

```cmd
rem Перевірити диск перед клонуванням
chkdsk C: /f /r
```

Macrium Reflect має опцію **Ignore bad sectors** — дозволяє клонувати навіть пошкоджений диск (деякі дані можуть бути втрачені).

### Розділ C менший ніж фізичний диск після клонування

При клонуванні на більший диск розділ може не розширитись автоматично.

```cmd
diskpart
select disk 0
select partition 3
extend
exit
```

---

## Підсумок

Macrium Reflect Free → Clone this disk → вибери старий і новий диск → розшир розділ якщо потрібно → Finish. Після клонування — змінити порядок завантаження в BIOS. `fsutil behavior query DisableDeleteNotify` → перевірити TRIM на новому SSD.
