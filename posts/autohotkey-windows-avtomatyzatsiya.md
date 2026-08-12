---
title: "AutoHotkey на Windows: автоматизація, гарячі клавіші і макроси"
date: "2026-06-15"
publishDate: "2026-08-31"
updated: "2026-06-15"
description: "Як встановити AutoHotkey і написати перші скрипти для автоматизації Windows. Гарячі клавіші, текстові макроси, автозаповнення, управління вікнами і мишею."
tags: ["windows", "autohotkey", "автоматизація", "інструменти", "скрипти"]
readTime: 8
translatesEn: "autohotkey-windows-automation-guide"
---

AutoHotkey (AHK) — безкоштовна мова скриптів для автоматизації Windows. Призначай гарячі клавіші, автоматизуй повторювані дії, створюй макроси — без знань програмування.

---

## Встановлення

1. Завантаж з [autohotkey.com](https://www.autohotkey.com) → **Download**
2. Вибери **AutoHotkey v2** (актуальна версія)
3. Встанови

```powershell
winget install AutoHotkey.AutoHotkey
```

**Перший скрипт:**
1. Правою кнопкою на робочому столі → **"Створити"** → **"AutoHotkey Script"**
2. Відкрий файл в блокноті
3. Напиши код → збережи → двічі клікни щоб запустити

---

## Базовий синтаксис AHK v2

```autohotkey
; Це коментар

; Гаряча клавіша: Win+N відкриває Notepad
#n:: Run "notepad.exe"

; Ctrl+Shift+T показує повідомлення
^+t:: MsgBox "Привіт!"

; F1 відкриває сайт
F1:: Run "https://cryptolockua.com"
```

**Модифікатори:**
| Символ | Клавіша |
|--------|---------|
| `#` | Win |
| `^` | Ctrl |
| `!` | Alt |
| `+` | Shift |
| `&` | Комбінація двох клавіш |

---

## Текстові макроси (Hotstrings)

Автозаміна тексту при введенні — дуже корисно для часто вживаних фраз:

```autohotkey
; Введи "@@" → автоматично замінить на email
::@@::miy@email.com

; Введи "addr" → розгорне в повну адресу
::addr::вул. Хрещатик 1, Київ, 01001

; Введи "dt" → вставить поточну дату
::ddt::
{
    FormatTime, today,, dd.MM.yyyy
    SendText today
}

; Введи "привт" → виправить на "привіт"
::привт::привіт
```

---

## Управління вікнами

```autohotkey
; Win+стрілки — переміщення вікна між моніторами
#+Right::
{
    WinGetPos &x, &y, &w, &h, "A"
    WinMove x + 1920, y, w, h, "A"
}

; Ctrl+Alt+M — мінімізувати поточне вікно
^!m:: WinMinimize "A"

; Ctrl+Alt+F — зробити вікно поверх всіх
^!f::
{
    hwnd := WinGetID("A")
    WinSetAlwaysOnTop -1, hwnd
}

; Win+Q — закрити поточне вікно
#q:: WinClose "A"
```

---

## Автоматизація мишею і клавіатурою

```autohotkey
; Клік в певну точку екрану
Click 100, 200

; Рух миші
MouseMove 500, 300, 10  ; X, Y, швидкість

; Введення тексту
SendText "Привіт, це автоматичний текст!"

; Натиснути клавішу
Send "{Enter}"
Send "{Tab}"
Send "^c"  ; Ctrl+C

; Затримка між діями (мілісекунди)
Sleep 1000
```

---

## Практичні приклади

### Автозапуск програм при старті Windows

```autohotkey
; Запустити кілька програм разом
#Requires AutoHotkey v2.0
Run "C:\Program Files\Telegram Desktop\Telegram.exe"
Sleep 500
Run "C:\Program Files\Microsoft VS Code\Code.exe"
```

Збережи як `startup.ahk` і додай в автозапуск:
```powershell
# Додати в автозапуск
$ahkPath = "C:\Users\$env:USERNAME\Desktop\startup.ahk"
$startupPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
Copy-Item $ahkPath $startupPath
```

### Скріншот і відправка в буфер

```autohotkey
; PrintScreen — скріншот активного вікна в буфер
PrintScreen::
{
    Send "!{PrintScreen}"
    Sleep 100
    MsgBox "Скріншот скопійовано!"
}
```

### Блокування клавіатури (наприклад при прибиранні)

```autohotkey
; Ctrl+Alt+L — заблокувати клавіатуру на 10 секунд
^!l::
{
    BlockInput "On"
    Sleep 10000
    BlockInput "Off"
}
```

### Автоматичне заповнення форм

```autohotkey
; F2 — заповнити форму логін/пароль
F2::
{
    Send "mylogin{Tab}mypassword{Enter}"
}
```

---

## Запуск скрипта при старті Windows

1. `Win + R` → `shell:startup`
2. Скопіюй `.ahk` файл в цю папку
3. Скрипт запускатиметься автоматично

---

## Компіляція в .exe

AHK скрипт можна скомпілювати в `.exe` щоб запускати без встановленого AutoHotkey:

```
ПКМ на .ahk файл → Compile Script
```

Або через меню: AutoHotkey → Compile → вибери .ahk файл.

---

## Корисні ресурси

- Документація: [autohotkey.com/docs/v2](https://www.autohotkey.com/docs/v2/)
- Каталог скриптів: [autohotkey.com/scripts](https://www.autohotkey.com/scripts/)
- Форум: [autohotkey.com/boards](https://www.autohotkey.com/boards/)

---

## Часті питання

### AHK скрипт не запускається
Перевір що встановлений AutoHotkey v2 і файл має розширення `.ahk`.

### Як зупинити запущений скрипт
ПКМ на іконку AHK в треї → **"Exit"**.

### Чи безпечний AutoHotkey?
Так — відкритий код, існує з 2003 року. Антивіруси іноді реагують на скомпільовані `.exe` через механізм автоматизації.

---

## Резюме

| Задача | Код |
|--------|-----|
| Гаряча клавіша | `^+t:: MsgBox "текст"` |
| Текстовий макрос | `::скор::повний текст` |
| Відкрити програму | `#n:: Run "notepad.exe"` |
| Автозапуск | Скопіювати в `shell:startup` |
| Компіляція в exe | ПКМ на файл → Compile Script |
