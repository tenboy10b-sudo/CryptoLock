---
title: "Як зробити скріншот в Windows 10 і 11: всі способи"
date: "2026-05-24"
publishDate: "2026-05-24"
description: "Як зробити скріншот екрана в Windows через Print Screen, Snipping Tool, Win+Shift+S і PowerShell. Де зберігаються файли і як скопіювати в буфер обміну."
tags: ["windows", "інструменти", "налаштування", "продуктивність"]
readTime: 3
---

В Windows є кілька способів зробити скріншот — від простого `Print Screen` до гнучкого Snipping Tool.

---

## Швидкі гарячі клавіші

| Клавіші | Що робить |
|---------|----------|
| `Print Screen` | Весь екран → буфер обміну |
| `Win + Print Screen` | Весь екран → файл в Pictures\Screenshots |
| `Alt + Print Screen` | Активне вікно → буфер обміну |
| `Win + Shift + S` | Вибрати область → буфер обміну |
| `Win + G` | Xbox Game Bar (для ігор) |

---

## Snipping Tool — найзручніший спосіб

`Win + Shift + S` відкриває панель вибору:
- **Прямокутна область** — виділи потрібну зону
- **Вільна форма** — намалюй будь-яку форму
- **Вікно** — клікни на вікно
- **Весь екран** — весь монітор

Після захоплення — натисни сповіщення щоб відредагувати і зберегти.

Або відкрий повний Snipping Tool: `Win + S` → введи "Snipping Tool"

---

## Де зберігаються скріншоти

```powershell
# Папка зі скріншотами
explorer "$env:USERPROFILE\Pictures\Screenshots"

# Останній скріншот
Get-ChildItem "$env:USERPROFILE\Pictures\Screenshots" |
  Sort-Object LastWriteTime -Descending | Select-Object -First 1 FullName
```

`Win + Print Screen` автоматично зберігає в `C:\Users\Ім'я\Pictures\Screenshots`.

---

## Скріншот через PowerShell

```powershell
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.Screen]::PrimaryScreen | ForEach-Object {
  $bmp = New-Object System.Drawing.Bitmap($_.Bounds.Width, $_.Bounds.Height)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.CopyFromScreen($_.Bounds.Location, [System.Drawing.Point]::Empty, $_.Bounds.Size)
  $bmp.Save("$env:USERPROFILE\Desktop\screenshot.png")
}
Write-Host "Збережено на робочому столі"
```

---

## Резюме

`Win + Shift + S` — найшвидший спосіб для будь-якої частини екрана. `Win + Print Screen` — автоматичне збереження файлу. Snipping Tool — для редагування перед збереженням.
