---
title: "Як налаштувати резервне копіювання Windows через вбудовані засоби"
date: "2025-05-15"
description: "Резервне копіювання через File History, Backup and Restore і robocopy. Автоматичне бекапування важливих файлів без стороннього ПЗ."
tags: ["відновлення", "резервне-копіювання", "windows", "оптимізація"]
readTime: 6
---

Резервне копіювання — єдиний надійний захист від втрати даних. Windows має кілька вбудованих інструментів для цього.

## File History — автоматичний бекап файлів

Найпростіший спосіб. Автоматично зберігає версії файлів з ваших папок.

**Налаштування:**
`Win + I` → **System** → **Storage** → **Advanced storage settings** → **Backup options** (Windows 11).

Або: `Win + S` → **File History** → **Turn on**.

**Що потрібно:**
- Зовнішній диск або мережева папка
- Достатньо місця (залежить від розміру файлів і кількості версій)

**Що зберігає:** Desktop, Documents, Downloads, Music, Pictures, Videos.

**Як відновити файл:** правий клік на файл → **Restore previous versions** → вибери версію.

---

## Windows Backup and Restore (Windows 7)

Старіший але потужніший інструмент. Може зробити образ всього диска.

`Win + S` → **Backup and Restore (Windows 7)** → **Set up backup** → вибери диск → налаштуй розклад.

**Create a system image** — повний образ системного розділу. Дозволяє відновити систему повністю на інший диск.

---

## robocopy — скриптове резервне копіювання

Найгнучкіший варіант для автоматизації.

**Базовий бекап папки:**
```cmd
robocopy C:\Documents D:\Backup\Documents /MIR /Z /LOG:D:\backup.log
```

- `/MIR` — дзеркало: копіює нові, оновлює змінені, видаляє видалені
- `/Z` — режим відновлення (продовжує при перерві)
- `/LOG` — зберігає лог

**Бекап тільки нових і змінених файлів:**
```cmd
robocopy C:\Documents D:\Backup\Documents /E /XO /LOG:D:\backup.log
```

- `/E` — включає порожні підпапки
- `/XO` — пропускає старіші файли

---

## Автоматичний бекап через Task Scheduler

```powershell
$action = New-ScheduledTaskAction -Execute "robocopy.exe" `
  -Argument "C:\Users\%USERNAME%\Documents D:\Backup\Documents /MIR /Z /LOG:D:\backup.log"
$trigger = New-ScheduledTaskTrigger -Daily -At "23:30"
Register-ScheduledTask -TaskName "Daily Backup" -Action $action -Trigger $trigger -RunLevel Highest
```

---

## Точка відновлення системи

Зберігає стан системних файлів і реєстру (не особисті файли).

**Створити точку відновлення:**
```cmd
checkpoint-computer -Description "Before major changes" -RestorePointType MODIFY_SETTINGS
```

Або: `Win + S` → **Create a restore point** → **Create** → введи назву.

**Відновити:**
`Win + S` → **System Restore** → вибери точку → далі.

---

## Рекомендована стратегія бекапу (правило 3-2-1)

- **3** копії даних
- **2** різних носії (наприклад HDD + хмара)
- **1** копія зберігається поза домом (хмара, офіс)

Мінімальний варіант для домашнього використання:
1. File History на зовнішній диск
2. Важливі документи в OneDrive або Google Drive

> Також дивись: [Як скинути Windows до заводських налаштувань](/yak-skynute-windows-do-zavodskykh)
