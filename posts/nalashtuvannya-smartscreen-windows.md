---
title: "Як налаштувати Windows Defender SmartScreen в Windows 10 і 11"
date: "2026-06-21"
publishDate: "2026-06-21"
description: "Налаштування Windows Defender SmartScreen для захисту від фішингу і малваре. Керування SmartScreen для Edge, застосунків і Провідника через Параметри і GPO."
tags: ["windows", "smartscreen", "безпека", "windows-defender", "powershell"]
readTime: 3
translatesEn: "how-to-configure-windows-defender-smartscreen"
---

SmartScreen перевіряє файли і веб-сайти проти бази загроз Microsoft. Блокує відомий малваре і попереджає про підозрілі завантаження.

---

## Налаштування через Параметри

`Win + I` → **Безпека Windows** → **Керування застосунками та браузером**

Три окремих налаштування:
- **Перевіряти застосунки і файли** — для exe файлів
- **SmartScreen для Microsoft Edge** — захист при перегляді
- **SmartScreen для Microsoft Store** — для UWP застосунків

---

## Через реєстр

```powershell
# Попереджувати (рекомендовано)
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer" `
  -Name "SmartScreenEnabled" -Value "Warn" -Type String

# Блокувати (найбезпечніше)
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer" `
  -Name "SmartScreenEnabled" -Value "RequireAdmin" -Type String
```

---

## Розблокувати довірений файл

```powershell
# Розблокувати конкретний файл
Unblock-File -Path "C:\Downloads\TrustedApp.exe"

# Розблокувати всі файли в папці
Get-ChildItem "C:\Downloads" | Unblock-File
```

Або: ПКМ на файлі → **Властивості** → відмітити **Розблокувати** → OK

---

## Перевірити чому SmartScreen блокує

SmartScreen використовує Zone.Identifier — позначку для завантажених файлів:

```powershell
Get-Content "C:\Downloads\app.exe" -Stream Zone.Identifier
# ZoneId=3 = Інтернет (запускає SmartScreen)
```

---

## Часті питання

### Як назавжди дозволити довірений файл?

ПКМ → Властивості → Розблокувати. Або `Unblock-File`. Це видаляє Zone.Identifier що запускає SmartScreen.

### SmartScreen відправляє мої файли в Microsoft?

Ні — тільки криптографічний хеш (не вміст). Microsoft порівнює хеш зі своєю базою даних.

---

## Резюме

Налаштування в Безпека Windows → Керування застосунками. GPO для корпоративних середовищ. `Unblock-File` для довірених файлів. SmartScreen використовує Zone.Identifier. Залишай на рівні Попередження або Блокування.
