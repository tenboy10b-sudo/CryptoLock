---
title: "Як робити скріншоти в Windows 10 і 11: Snipping Tool і гарячі клавіші"
date: "2026-06-11"
publishDate: "2026-06-11"
description: "Скріншоти в Windows через гарячі клавіші, Snipping Tool і Snip & Sketch. Весь екран, вікно, область або скролінг з анотаціями."
tags: ["windows", "скріншоти", "продуктивність", "поради", "інструменти"]
readTime: 3
translatesEn: "how-to-use-windows-snipping-tool"
---

Windows має кілька способів робити скріншоти. Ось найшвидші.

---

## Гарячі клавіші

| Комбінація | Що знімає |
|-----------|----------|
| `PrtScn` | Весь екран → буфер |
| `Win + PrtScn` | Весь екран → Зображення\Знімки екрана |
| `Alt + PrtScn` | Активне вікно → буфер |
| `Win + Shift + S` | Вибір області → буфер |

---

## Win + Shift + S (найкращий метод)

`Win + Shift + S` → вверху з'являється панель:
- **Прямокутник** — виділи область
- **Довільна форма** — намалюй контур
- **Вікно** — клікни вікно
- **Весь екран**

Після захвату → натисни сповіщення → **анотації, обрізка або поширення**

---

## Snipping Tool (вбудований)

```powershell
Start-Process SnippingTool
```

**Нове в Windows 11:**
- Запис відео (`Win + Shift + R`)
- Розпізнавання тексту (OCR)
- Затримка 1-5 секунд

---

## Скріншот через PowerShell

```powershell
Add-Type -AssemblyName System.Windows.Forms, System.Drawing
$screen = [System.Windows.Forms.Screen]::PrimaryScreen
$bitmap = New-Object System.Drawing.Bitmap($screen.Bounds.Width, $screen.Bounds.Height)
$g = [System.Drawing.Graphics]::FromImage($bitmap)
$g.CopyFromScreen($screen.Bounds.Location, [System.Drawing.Point]::Empty, $screen.Bounds.Size)
$bitmap.Save("C:\Screenshots\screenshot_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss').png")
```

---

## Скролінг скріншотів

Windows не підтримує скролінг нативно. Встанови ShareX:

```powershell
winget install ShareX.ShareX
```

---

## Часті питання

### Як зробити скріншот випадаючого меню?

Використай Snipping Tool → **Створити** → **Затримка** → 3-5 секунд → відкрий меню → захоплення.

### Скріншоти Win+PrtScn розмиті?

Масштабування дисплея — причина. При 150-200% скріншоти у нативній роздільній здатності здаються меншими при перегляді на 100%. Якість нормальна.

---

## Резюме

Найшвидше: `Win + Shift + S` для виділення з анотацією. Авто-збереження: `Win + PrtScn`. Скролінг: ShareX. Відео: Snipping Tool або Xbox Game Bar (`Win + G`).
