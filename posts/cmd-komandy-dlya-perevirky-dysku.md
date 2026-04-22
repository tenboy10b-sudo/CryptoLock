---
title: "CMD команди для перевірки диска: повний список"
date: "2026-04-04"
description: "Всі корисні CMD команди для діагностики, перевірки і відновлення диска: chkdsk, diskpart, wmic, fsutil з прикладами і поясненнями."
tags: ["cmd", "диск", "chkdsk", "інструменти"]
readTime: 7
---

Командний рядок має потужний набір інструментів для роботи з дисками — від базової перевірки до детальної діагностики. Ось повний список з поясненнями.

## chkdsk — перевірка файлової системи

Найголовніша команда для роботи з дисками.

```cmd
chkdsk C:
```
Базова перевірка без виправлень — тільки звіт.

```cmd
chkdsk C: /f
```
Виправляє помилки файлової системи. Для диска C: потрібне перезавантаження.

```cmd
chkdsk C: /r
```
Знаходить погані сектори і відновлює дані. Займає 30–90 хвилин.

```cmd
chkdsk C: /scan
```
Онлайн-сканування без перезавантаження (Windows 8+).

```cmd
chkdsk C: /spotfix
```
Швидке виправлення тільки знайдених проблем.

| Ключ | Що робить |
|---|---|
| `/f` | Виправляє помилки ФС |
| `/r` | Перевіряє погані сектори |
| `/x` | Відключає диск перед перевіркою |
| `/scan` | Онлайн-перевірка |
| `/spotfix` | Точкове виправлення |

---

## diskpart — управління розділами

Запуск:
```cmd
diskpart
```

Корисні команди всередині diskpart:

```
list disk          — список всіх дисків
list volume        — список розділів
select disk 0      — вибрати диск 0
select volume 2    — вибрати розділ 2
detail disk        — деталі про диск
detail volume      — деталі про розділ
```

---

## wmic — інформація про диск

```cmd
wmic diskdrive get model,size,status
```
Модель, розмір і статус всіх дисків.

```cmd
wmic diskdrive get model,serialnumber
```
Серійні номери дисків.

```cmd
wmic logicaldisk get name,size,freespace
```
Розміри і вільне місце на всіх логічних дисках.

---

## fsutil — розширена діагностика

```cmd
fsutil fsinfo drives
```
Список всіх дисків у системі.

```cmd
fsutil volume diskfree C:
```
Вільне місце на диску C:.

```cmd
fsutil dirty query C:
```
Перевіряє чи позначений диск як "брудний" (потребує chkdsk).

---

## PowerShell альтернативи

```powershell
Get-PhysicalDisk | Select FriendlyName, OperationalStatus, HealthStatus
```
Стан фізичних дисків.

```powershell
Get-Disk | Select Number, FriendlyName, Size, PartitionStyle
```
Список дисків з деталями.

```powershell
Repair-Volume -DriveLetter C -Scan
```
Сканування без перезавантаження.

---

## Типові сценарії використання

**ПК гальмує, диск 100%:**
```cmd
chkdsk C: /scan
```

**Підозра на погані сектори:**
```cmd
chkdsk C: /f /r
```
Потім перезавантаж.

**Дізнатись скільки місця на всіх дисках:**
```cmd
wmic logicaldisk get name,size,freespace
```

**Перевірити чи потрібен chkdsk:**
```cmd
fsutil dirty query C:
```
Якщо повертає `is Dirty` — запусти `chkdsk /f`.

> Також дивись: [Як перевірити диск на помилки в Windows](/perevirka-dysku-na-pomylky-chkdsk)
