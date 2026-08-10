---
title: "Diskpart: управління дисками і розділами через командний рядок"
date: "2025-11-08"
publishDate: "2025-11-08"
description: "Команди diskpart для роботи з дисками і розділами Windows: створення, видалення, форматування, розширення розділів, очищення диска і виправлення помилок."
tags: ["cmd", "диск", "windows", "адміністрування", "інструменти"]
readTime: 7
translatesEn: "how-to-configure-windows-disk-management"
---

Diskpart — потужна консольна утиліта Windows для управління дисками, розділами і томами. Дозволяє робити все те що є в графічному "Керуванні дисками" але швидше, точніше і через скрипти.

> **Увага:** diskpart вносить незворотні зміни. Неправильна команда може знищити дані. Завжди перевіряй який диск або розділ вибрано перед виконанням деструктивних команд.

---

## Через PowerShell (альтернатива diskpart)

Ті самі операції можна робити через PowerShell-командлети — зручніше для скриптів:

```powershell
# Переглянути диски і розділи
Get-Disk | Select-Object Number, FriendlyName, Size, PartitionStyle, HealthStatus
Get-Partition | Select-Object DiskNumber, DriveLetter, Size, Type
Get-Volume | Select-Object DriveLetter, FileSystemLabel, Size, SizeRemaining

# Ініціалізувати новий диск
Initialize-Disk -Number 1 -PartitionStyle GPT

# Створити і відформатувати розділ
New-Partition -DiskNumber 1 -UseMaximumSize -AssignDriveLetter |
  Format-Volume -FileSystem NTFS -NewFileSystemLabel "Data" -Confirm:$false

# Розширити розділ до максимуму
$maxSize = (Get-PartitionSupportedSize -DiskNumber 1 -PartitionNumber 2).SizeMax
Resize-Partition -DiskNumber 1 -PartitionNumber 2 -Size $maxSize
```

### GPT vs MBR

GPT підтримує диски більше 2 ТБ і необмежену кількість розділів, обов'язковий для UEFI-завантаження. Використовуй GPT для всіх сучасних систем.

### Конвертувати MBR в GPT без втрати даних

```powershell
# Перевірити чи можлива конвертація
MBR2GPT /validate /disk:1

# Конвертувати (з Windows PE, або /allowFullOS для робочої системи)
MBR2GPT /convert /disk:1 /allowFullOS
```

---

## Запуск diskpart

Відкрий **CMD від адміністратора**:

```cmd
diskpart
```

З'явиться інтерактивна консоль `DISKPART>`.

---

## Перегляд дисків і розділів

```cmd
rem Список всіх дисків
list disk

rem Список всіх томів (з буквами дисків)
list volume

rem Після вибору диска — список його розділів
list partition
```

Приклад виводу `list disk`:
```
  Disk ###  Status         Size     Free
  --------  -------------  -------  -------
  Disk 0    Online          476 GB      0 B
  Disk 1    Online          931 GB   931 GB
```

---

## Вибір об'єкта

Перед будь-якою операцією треба вибрати диск, розділ або том:

```cmd
rem Вибрати диск 0
select disk 0

rem Вибрати розділ 2 (після вибору диска)
select partition 2

rem Вибрати том за буквою
select volume C
```

Після вибору команда `detail disk` / `detail partition` / `detail volume` покаже деталі.

---

## Очистити диск повністю

```cmd
select disk 1
clean
```

`clean` — видаляє всі розділи і дані з вибраного диска. Використовуй для підготовки нового диска або повного стирання перед продажем.

```cmd
rem Безпечне стирання (перезаписує нулями — займає довше)
clean all
```

---

## Створення розділів

```cmd
rem Вибрати диск
select disk 1

rem Конвертувати в GPT (для дисків > 2 ТБ або UEFI)
convert gpt

rem Або в MBR (для старих систем)
convert mbr

rem Створити основний розділ на весь диск
create partition primary

rem Створити розділ заданого розміру (МБ)
create partition primary size=51200

rem Відформатувати в NTFS і призначити букву
format fs=ntfs quick label="Data"
assign letter=D
```

---

## Розширити або зменшити розділ

```cmd
rem Вибрати том C
select volume C

rem Розширити на весь доступний простір
extend

rem Розширити на конкретний розмір (МБ)
extend size=10240

rem Зменшити на 20 ГБ (звільнити 20480 МБ)
shrink desired=20480
```

---

## Видалити розділ

```cmd
select disk 0
select partition 3

rem Видалити розділ
delete partition

rem Видалити системний або захищений розділ примусово
delete partition override
```

---

## Позначити розділ активним (для завантаження)

```cmd
select disk 0
select partition 1
active
```

Потрібно для MBR-дисків щоб позначити завантажувальний розділ.

---

## Приховати або показати розділ

```cmd
rem Приховати розділ (прибрати букву диска)
select volume D
remove letter=D

rem Призначити букву знову
assign letter=D
```

---

## Корисні скрипти diskpart

### Підготувати USB-флешку для завантаження Windows

```cmd
diskpart
list disk
select disk 1          <- номер USB-флешки, перевір двічі!
clean
create partition primary
select partition 1
active
format fs=fat32 quick
assign
exit
```

### Підготувати новий жорсткий диск (GPT + NTFS)

```cmd
diskpart
select disk 1
clean
convert gpt
create partition primary
format fs=ntfs quick label="Storage"
assign letter=E
exit
```

### Скрипт для автоматизації (файл .txt)

Збережи команди у файл `setup-disk.txt`:
```
select disk 1
clean
convert gpt
create partition primary
format fs=ntfs quick
assign letter=E
exit
```

Виконай:
```cmd
diskpart /s setup-disk.txt
```

---

## Виправлення типових помилок

### "Недостатньо місця для цієї операції"

При розширенні розділу — вільне місце має бути **одразу після** розділу на диску. Якщо між ними є інший розділ — розшир через Керування дисками або видали проміжний розділ.

### "Diskpart encountered an error: Access is denied"

Запусти CMD строго від адміністратора. Якщо диск використовується системою — перезавантажся і спробуй з середовища відновлення.

### Випадково видалив не той розділ

Не записуй нічого на диск. Одразу скористайся безкоштовним TestDisk: `winget install CGSecurity.TestDisk` — він може відновити видалену таблицю розділів.

### Не вдається видалити розділ

```cmd
select partition 2
delete partition override
```

Параметр `override` ігнорує захист розділу.

---

## Підсумок

Найбільш використовувані команди: `list disk` → `select disk N` → `clean` для очищення, `shrink/extend` для зміни розміру, `format` і `assign` для налаштування нового розділу. Завжди перевіряй номер диска через `list disk` перш ніж виконати `clean`.

---

## ⚡ Шукаєш потрібну команду?

**[→ PowerShell і CMD довідник](/tools/powershell-commands)** — 40+ команд з пошуком за задачею. Введи "мережа", "диск" або "безпека" і одразу отримай готову команду.

