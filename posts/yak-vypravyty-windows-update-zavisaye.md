---
title: "Windows Update завис на 0%: як виправити швидко"
date: "2026-05-17"
publishDate: "2026-05-17"
description: "Windows Update завис на 0%, не завантажується або гальмує при встановленні? Покрокове виправлення: очистити кеш, перезапустити служби, DISM і SFC."
tags: ["windows", "windows-update", "помилки", "відновлення"]
readTime: 5
translatesEn: "how-to-fix-windows-update-stuck"
---

Зависання Windows Update — одна з найпоширеніших проблем Windows. Ось системний підхід що вирішує її в більшості випадків.

---

## Швидке виправлення

```powershell
# Перезапустити служби Windows Update
Stop-Service wuauserv, bits, cryptsvc -Force
Start-Service wuauserv, bits, cryptsvc
```

Потім знову відкрий Windows Update і перевір. Якщо не допомогло — читай далі.

---

## Крок 1: Запустити засіб усунення неполадок

`Win + I` → **Система** → **Усунення неполадок** → **Інші засоби** → **Windows Update** → **Запустити**

---

## Крок 2: Очистити кеш оновлень (найефективніше)

```powershell
# Зупинити служби
Stop-Service wuauserv, bits, cryptsvc -Force

# Видалити завантажені файли оновлень
Remove-Item "C:\Windows\SoftwareDistribution\*" -Recurse -Force -EA 0
Remove-Item "C:\Windows\System32\catroot2\*" -Recurse -Force -EA 0

# Запустити служби
Start-Service wuauserv, bits, cryptsvc

Write-Host "Готово. Перевір Windows Update."
```

---

## Крок 3: Відновити системні файли

```cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
```

Запусти від адміністратора. Спочатку DISM потім SFC. Перезавантаж після завершення.

---

## Крок 4: Перевірити вільне місце

Для оновлень потрібно мінімум 10-20 ГБ:

```powershell
Get-PSDrive C | Select-Object @{n='Вільно ГБ';e={[math]::Round($_.Free/1GB,1)}}
```

---

## Крок 5: Завантажити оновлення вручну

Якщо конкретне оновлення постійно не встановлюється:

1. Зайди на `catalog.update.microsoft.com`
2. Введи номер KB (наприклад `KB5055523`)
3. Завантаж і запусти `.msu` файл вручну

---

## Часті питання

### Скільки чекати якщо Update завис?

До 4 годин для великого Feature Update. Якщо більше 4 годин без прогресу і диск не активний — це зависання. Можна безпечно перезавантажити і почати з кроку 2.

### Чи безпечно видаляти папку SoftwareDistribution?

Так. Це тільки кеш завантажених оновлень. Windows завантажить їх знову при наступній перевірці. Встановлені оновлення при цьому не видаляються.

### Після очищення кешу оновлення знову зависли — що робити?

Перейди до Кроку 3 — DISM і SFC. Якщо і це не допомагає — завантаж оновлення вручну з Microsoft Update Catalog.

---

## Резюме

Порядок дій: перезапуск служб → очистити SoftwareDistribution → DISM і SFC → перевірити місце → вручну з catalog.update.microsoft.com. Очищення `SoftwareDistribution` вирішує 80% проблем із зависанням.

> 🔍 Якщо бачиш код помилки — [Декодер помилок Windows](/tools/windows-error-decoder) розшифрує що він означає.
