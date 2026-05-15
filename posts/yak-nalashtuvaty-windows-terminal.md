---
title: "Windows Terminal: налаштування і корисні функції"
date: "2026-09-23"
publishDate: "2026-09-23"
description: "Як налаштувати Windows Terminal: вкладки, розділені панелі, кастомні профілі, шрифти і гарячі клавіші. Заміна старого CMD і PowerShell вікна."
tags: ["windows", "інструменти", "powershell", "налаштування"]
readTime: 4
---

Windows Terminal — сучасна заміна старого CMD і PowerShell з вкладками, розділенням екрана і налаштуванням зовнішнього вигляду.

---

## Встановлення

**Windows 11**: вже встановлений. Шукай **Термінал** в меню Пуск.

**Windows 10:**
```powershell
winget install Microsoft.WindowsTerminal
```

**Зробити терміналом за замовчуванням:**
`Win + I` → **Система** → **Для розробників** → **Термінал** → **Windows Terminal**

---

## Основні гарячі клавіші

| Клавіші | Дія |
|---------|-----|
| `Ctrl + Shift + T` | Нова вкладка |
| `Ctrl + Shift + W` | Закрити вкладку |
| `Ctrl + Tab` | Наступна вкладка |
| `Alt + Shift + -` | Розділити горизонтально |
| `Alt + Shift + +` | Розділити вертикально |
| `Alt + Стрілки` | Перемикатись між панелями |
| `Ctrl + Shift + F` | Пошук в терміналі |
| `F11` | Повноекранний режим |

---

## Відкрити термінал в потрібній папці

Правий клік на папці в Провіднику → **Відкрити в терміналі**

---

## Налаштування через settings.json

`Ctrl + ,` → іконка JSON у правому верхньому куті:

```json
{
  "defaultProfile": "{powerShell-guid}",
  "profiles": {
    "defaults": {
      "font": { "face": "Cascadia Code", "size": 12 },
      "opacity": 90,
      "useAcrylic": true
    }
  }
}
```

---

## Додати SSH профіль

```json
{
  "name": "Мій сервер",
  "commandline": "ssh user@192.168.1.100",
  "icon": "🖥️",
  "startingDirectory": "%USERPROFILE%"
}
```

Тепер підключення до сервера одним кліком із випадаючого меню.

---

## Встановити PowerShell 7

Старий **Windows PowerShell 5** і новий **PowerShell 7** — різні програми. PowerShell 7 швидший і має більше функцій:

```powershell
winget install Microsoft.PowerShell
```

Після встановлення: Параметри Terminal → **Запуск** → **Профіль за замовчуванням** → вибери **PowerShell** (новий, не Windows PowerShell).

---

## Режим Quake (термінал зверху)

Термінал що з'являється натисканням гарячої клавіші з будь-якого вікна.

В settings.json додай дію:
```json
{ "command": "quakeMode", "keys": "win+`" }
```

`Win + \`` — показати/сховати термінал зверху.

---

## Резюме

Встанови через `winget install Microsoft.WindowsTerminal`. Зроби терміналом за замовчуванням в Параметрах розробника. Додай SSH профілі для швидкого підключення. `Alt + Shift + -/+` для розділення екрана між кількома сесіями.
