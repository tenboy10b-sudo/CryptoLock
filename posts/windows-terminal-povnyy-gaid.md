---
title: "Windows Terminal: повний гайд по налаштуванню, профілях і темах"
date: "2025-11-07"
updated: "2026-07-21"
publishDate: "2025-11-07"
description: "Повний гайд по Windows Terminal: встановлення, профілі PowerShell/CMD/WSL/SSH, теми і Nerd Fonts, settings.json, Oh My Posh, гарячі клавіші і розділення екрана."
tags: ["windows", "windows-terminal", "powershell", "cmd", "інструменти", "налаштування", "розробка"]
translatesEn: "windows-terminal-setup-guide"
readTime: 9
---

Windows Terminal — сучасна заміна старому CMD і PowerShell вікну: вкладки, кілька профілів в одному вікні, GPU-прискорення рендерингу, підтримка Unicode (кирилиця, емодзі, іконки) і повна кастомізація. Стандартний термінал у Windows 11.

---

## Встановлення

**Windows 11:** вже встановлений за замовчуванням.

**Windows 10:**
```powershell
winget install Microsoft.WindowsTerminal
```
Або через Microsoft Store — пошук "Windows Terminal".

### Зробити терміналом за замовчуванням

Щоб PowerShell і CMD завжди відкривались саме в Windows Terminal:

`Win + I` → **Система** → **Для розробників** → **Термінал** → вибери **Windows Terminal**.

### Відкрити від адміністратора

Правою кнопкою на **Пуск** → **Windows Terminal (адміністратор)**, або `Win + X` → те саме.

Щоб конкретний профіль завжди запускався з правами адміна: Налаштування → вибери профіль → увімкни **Запускати від імені адміністратора**.

### Відкрити в конкретній папці

Правий клік на папці в Провіднику → **Відкрити в терміналі** — одразу в потрібному робочому каталозі, без `cd`.

---

## Гарячі клавіші

| Дія | Клавіші |
|---|---|
| Нова вкладка | `Ctrl + Shift + T` |
| Нова вкладка з профілем | `Ctrl + Shift + 1/2/3...` |
| Дублювати вкладку | `Ctrl + Shift + D` |
| Закрити вкладку | `Ctrl + Shift + W` |
| Наступна / попередня вкладка | `Ctrl + Tab` / `Ctrl + Shift + Tab` |
| Розділити вертикально | `Alt + Shift + +` |
| Розділити горизонтально | `Alt + Shift + -` |
| Перемикатись між панелями | `Alt + стрілки` |
| Пошук у терміналі | `Ctrl + Shift + F` |
| Збільшити шрифт | `Ctrl + +` |
| Відкрити налаштування | `Ctrl + ,` |
| Повноекранний режим | `F11` |

---

## Профілі — кілька середовищ в одному вікні

Terminal автоматично знаходить встановлені середовища: PowerShell 5, PowerShell 7, CMD, WSL.

> **PowerShell 5 vs PowerShell 7 — це різні програми.** Windows PowerShell (5.1) вбудований, PowerShell 7 — новіший, швидший, з більшою кількістю функцій, встановлюється окремо:
> ```powershell
> winget install Microsoft.PowerShell
> ```
> Після встановлення онови профіль за замовчуванням: Налаштування → Запуск → **Профіль за замовчуванням** → обери новий **PowerShell** (не Windows PowerShell).

### Додати власні профілі через settings.json

`Ctrl + ,` → іконка JSON внизу зліва (або **Profiles → Add new profile** через GUI):

```json
{
  "profiles": {
    "list": [
      {
        "name": "PowerShell",
        "commandline": "pwsh.exe",
        "startingDirectory": "%USERPROFILE%"
      },
      {
        "name": "Ubuntu",
        "source": "Windows.Terminal.Wsl"
      },
      {
        "name": "Git Bash",
        "commandline": "C:\\Program Files\\Git\\bin\\bash.exe",
        "icon": "C:\\Program Files\\Git\\mingw64\\share\\git\\git-for-windows.ico"
      },
      {
        "name": "Production Server",
        "commandline": "ssh user@192.168.1.100",
        "icon": "🖥️"
      }
    ]
  }
}
```

SSH-профіль — зручно для швидкого підключення до сервера одним кліком із випадаючого меню, без набору команди щоразу.

---

## Розділення екрана (Panes)

Корисно для одночасного моніторингу кількох сесій:

- `Alt + Shift + +` — розділити вертикально
- `Alt + Shift + -` — розділити горизонтально
- `Alt + стрілки` — перемикатись між панелями
- `Ctrl + Shift + W` — закрити поточну панель

---

## Теми і зовнішній вигляд

### Вбудовані кольорові схеми

`Ctrl + ,` → **Кольорові схеми** → One Half Dark, Solarized Dark, Tango Dark, Campbell та інші.

### Сторонні теми

[windowsterminalthemes.dev](https://windowsterminalthemes.dev) — вибери тему → **Get theme** → скопіюй JSON → встав в `settings.json` у розділ `schemes`.

### Шрифт з іконками (Nerd Fonts)

Для красивого prompt з іконками (особливо в парі з Oh My Posh нижче):

1. Завантаж [nerdfonts.com](https://www.nerdfonts.com) — рекомендовано **JetBrains Mono Nerd Font** або **Cascadia Code**
2. Встанови шрифт у системі
3. У профілі:
```json
{ "font": { "face": "JetBrainsMono Nerd Font", "size": 12 } }
```

### Прозорість

Налаштування → профіль → **Непрозорість фону** → 70-90% для ефекту скла (`useAcrylic: true` в JSON).

---

## Повний приклад settings.json

```json
{
  "defaultProfile": "{PowerShell GUID}",
  "copyOnSelect": false,
  "copyFormatting": "none",
  "profiles": {
    "defaults": {
      "font": { "face": "JetBrains Mono", "size": 12 },
      "opacity": 90,
      "useAcrylic": true,
      "colorScheme": "One Half Dark",
      "scrollbarState": "hidden",
      "bellStyle": "none",
      "cursorShape": "bar",
      "padding": "8"
    }
  },
  "keybindings": [
    { "command": "closePane", "keys": "ctrl+w" },
    { "command": "splitPane", "keys": "ctrl+shift+e", "args": { "split": "right" } }
  ]
}
```

---

## Oh My Posh — красивий і інформативний prompt

Oh My Posh показує в командному рядку гілку git, статус, шлях та іншу корисну інформацію замість голого `C:\>`:

```powershell
# Встановити
winget install JanDeDobbeleer.OhMyPosh

# Додати в профіль PowerShell (створить файл якщо його немає)
notepad $PROFILE

# Вставити в файл профілю:
oh-my-posh init pwsh --config "$env:POSH_THEMES_PATH\atomic.omp.json" | Invoke-Expression
```

Каталог тем: [ohmyposh.dev/docs/themes](https://ohmyposh.dev/docs/themes) — заміни `atomic.omp.json` на назву обраної теми.

---

## Quake Mode — термінал, що випадає зверху

Термінал з'являється й ховається натисканням однієї гарячої клавіші з будь-якого вікна, як у Linux-середовищах.

Додай дію в `settings.json`:
```json
{
  "keybindings": [
    { "command": { "action": "globalSummon", "monitor": "any" }, "keys": "win+`" }
  ]
}
```

Після цього `Win + ~` відкриває і закриває Terminal зверху екрана.

---

## Резюме

| Задача | Рішення |
|---|---|
| Встановити | `winget install Microsoft.WindowsTerminal` |
| Зробити терміналом за замовчуванням | Параметри → Для розробників → Термінал |
| Нова вкладка / розділити панель | `Ctrl+Shift+T` / `Alt+Shift+=` або `Alt+Shift+-` |
| Профілі (SSH, WSL, Git Bash) | `settings.json` → `profiles.list` |
| Тема | windowsterminalthemes.dev |
| Красивий prompt | Oh My Posh |
| Термінал зверху за гарячою клавішею | Quake Mode через `globalSummon` |

---

## ⚡ Шукаєш потрібну команду?

**[→ PowerShell і CMD довідник](/tools/powershell-commands)** — 40+ команд з пошуком за задачею. Введи "мережа", "диск" або "безпека" і одразу отримай готову команду.
