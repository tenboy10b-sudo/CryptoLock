---
title: "Як додати виключення Windows Defender не вимикаючи захист"
date: "2026-08-08"
publishDate: "2027-06-01"
description: "Додавання виключень Windows Defender для файлів, папок, процесів і розширень без відключення антивірусного захисту. Управління через PowerShell і GPO."
tags: ["windows", "windows-defender", "безпека", "powershell", "адміністрування"]
readTime: 3
translatesEn: "how-to-configure-windows-defender-exclusions"
---

Іноді легітимні програми викликають хибні спрацювання Defender. Виключення дозволяють їм працювати без повного вимкнення захисту.

---

## Переглянути поточні виключення

```powershell
$prefs = Get-MpPreference
$prefs.ExclusionPath
$prefs.ExclusionProcess
$prefs.ExclusionExtension
```

---

## Додати виключення

```powershell
# Папка
Add-MpPreference -ExclusionPath "C:\DevTools"

# Конкретний файл
Add-MpPreference -ExclusionPath "C:\Tools\nmap.exe"

# За процесом
Add-MpPreference -ExclusionProcess "python.exe"
Add-MpPreference -ExclusionProcess "node.exe"

# За розширенням
Add-MpPreference -ExclusionExtension ".log"
```

---

## Видалити виключення

```powershell
Remove-MpPreference -ExclusionPath "C:\DevTools"
Remove-MpPreference -ExclusionProcess "python.exe"
```

---

## Що безпечно виключати

✅ Конкретні інструменти розробника (`C:\Python`, `C:\nodejs`)
✅ Вихідні папки збірки (`bin\`, `dist\`)
✅ Файли дисків VM (`*.vhdx`) на не-системних дисках

❌ `C:\Windows\System32` або весь `C:\Windows`
❌ `%TEMP%` або `%APPDATA%` — улюблені місця малваре
❌ Папки завантажень браузера

---

## Часті питання

### Чи робить виключення ПК менш захищеним?

Так — для конкретного шляху або процесу. Малваре в виключеній папці не буде скановане. Тримай виключення мінімальними — один exe безпечніший ніж ціла папка.

### Defender повторно виявляє файл який я виключив?

Файл може бути в іншому місці ніж шлях виключення. Перевір точний шлях у сповіщенні. Також переконайся що виключення збереглось: `(Get-MpPreference).ExclusionPath`.

---

## Резюме

`Add-MpPreference` для точних виключень. Виключення за процесом краще ніж за папкою. Ніколи не виключай системні папки. Переглядай виключення щомісяця.
