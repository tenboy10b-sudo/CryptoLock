---
title: "Скріншот в Windows: всі способи зробити знімок екрана"
date: "2026-04-24"
publishDate: "2026-04-24"
description: "Як зробити скріншот в Windows 10 і 11: Print Screen, Win+Shift+S, Snipping Tool, Game Bar і автоматичне збереження. Порівняння всіх способів."
tags: ["windows", "інструменти", "персоналізація", "налаштування"]
readTime: 4
---

Windows має кілька вбудованих способів зробити знімок екрана — від простого `PrintScreen` до виділення конкретної області. Ось всі варіанти.

---

## Win + Shift + S — найзручніший спосіб

Відкриває панель вибору: область, вікно, весь екран або вільна форма. Скріншот копіюється в буфер обміну — вставляй куди потрібно.

Натисни `Win + Shift + S` → вибери область → `Ctrl + V` для вставки.

---

## PrintScreen — весь екран у буфер

`PrtSc` — копіює весь екран у буфер обміну. Вставляй у Paint, Word або будь-який графічний редактор.

`Alt + PrtSc` — тільки активне вікно.

---

## Win + PrintScreen — автоматичне збереження

`Win + PrtSc` — зберігає скріншот автоматично у папку:
`C:\Users\ІМ'Я\Pictures\Screenshots`

Екран миготить — значить збережено.

---

## Snipping Tool — вбудований інструмент

`Win + S` → **Snipping Tool** → запусти.

Або `Win + Shift + S` і натисни **Відкрити у Snipping Tool** у сповіщенні.

Можливості:
- Виділення прямокутника, вільної форми, вікна або всього екрана
- Затримка перед знімком (для меню що зникають)
- Анотації — стрілки, текст, підсвічення
- Збереження у PNG, JPG або GIF

---

## Game Bar — скріншоти та відео

`Win + G` — відкриває Game Bar (навіть поза іграми).

`Win + Alt + PrtSc` — скріншот через Game Bar. Зберігається у `C:\Users\ІМ'Я\Videos\Captures`.

`Win + Alt + R` — почати/зупинити запис екрана.

---

## Командний рядок і PowerShell

```powershell
# Зробити скріншот через PowerShell і зберегти
Add-Type -AssemblyName System.Windows.Forms
$screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bitmap = New-Object System.Drawing.Bitmap $screen.Width, $screen.Height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($screen.Location, [System.Drawing.Point]::Empty, $screen.Size)
$bitmap.Save("C:\screenshot.png")
Write-Output "Збережено: C:\screenshot.png"
```

---

## Порівняння способів

| Спосіб | Результат | Редагування |
|--------|-----------|------------|
| `Win + Shift + S` | Буфер → файл | Так (Snipping Tool) |
| `Win + PrtSc` | Файл (Pictures) | Ні |
| `PrtSc` | Тільки буфер | Вставити в редактор |
| Snipping Tool | Файл за вибором | Так |
| Game Bar | Файл (Videos) | Ні |

---

## Підсумок

`Win + Shift + S` — найзручніший для більшості задач: вибираєш область, зберігаєш або вставляєш одразу. `Win + PrtSc` — якщо потрібне автоматичне збереження всього екрана. Snipping Tool — для анотацій і затримки.
