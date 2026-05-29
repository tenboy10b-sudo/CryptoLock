---
title: "Як додати виключення у Windows Defender: файли, папки і процеси"
date: "2026-05-25"
publishDate: "2026-05-25"
description: "Додати виключення у Windows Defender для файлів, папок, процесів і розширень. Виправити хибні спрацьовування без вимкнення захисту."
tags: ["windows", "windows-defender", "безпека", "антивірус", "powershell"]
readTime: 4
translatesEn: "how-to-configure-windows-defender-exclusions"
---

Виключення дозволяють Windows Defender пропускати певні файли або процеси при скануванні. Використовуй для виправлення хибних спрацьовувань.

---

## Через Параметри

`Win + I` → **Безпека Windows** → **Захист від вірусів** → **Параметри захисту** → **Виключення** → **Додати**

Типи виключень: Файл, Папка, Тип файлу, Процес.

---

## Через PowerShell

```powershell
# Виключити папку
Add-MpPreference -ExclusionPath "C:\DevTools"

# Виключити процес
Add-MpPreference -ExclusionProcess "node.exe"
Add-MpPreference -ExclusionProcess "python.exe"

# Виключити розширення
Add-MpPreference -ExclusionExtension ".log"
```

---

## Переглянути виключення

```powershell
$prefs = Get-MpPreference
$prefs.ExclusionPath
$prefs.ExclusionProcess
$prefs.ExclusionExtension
```

---

## Видалити виключення

```powershell
Remove-MpPreference -ExclusionPath "C:\DevTools"
Remove-MpPreference -ExclusionProcess "node.exe"
```

---

## Популярні виключення для розробки

```powershell
# Node.js
Add-MpPreference -ExclusionPath "$env:USERPROFILE\node_modules"
Add-MpPreference -ExclusionProcess "node.exe"

# Python
Add-MpPreference -ExclusionProcess "python.exe"

# VM диски
Add-MpPreference -ExclusionExtension ".vhdx"
Add-MpPreference -ExclusionExtension ".vmdk"
```

---

## Що НЕ треба виключати

- Весь системний диск або папку Windows
- Тимчасові папки (`%TEMP%`)
- Папку завантажень
- Папки браузерів

---

## Часті питання

### Виключення знижують безпеку?

Мінімально якщо зроблено правильно. Виключати конкретний процес набагато безпечніше ніж цілу папку.

### Захисник постійно блокує потрібний файл — що робити?

Спочатку перевір файл на virustotal.com. Якщо підтверджено чистий — додай виключення для конкретного файлу а не папки.

---

## Резюме

Додати: `Add-MpPreference`. Переглянути: `Get-MpPreference`. Видалити: `Remove-MpPreference`. Виключай процеси а не папки — безпечніше.
