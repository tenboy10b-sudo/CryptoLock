---
title: "Windows Terminal: сучасний термінал для PowerShell, CMD і WSL на Windows"
date: "2026-06-18"
publishDate: "2026-09-27"
updated: "2026-06-18"
description: "Як встановити і налаштувати Windows Terminal на Windows 10 і 11. Вкладки, профілі, теми, шрифти, гарячі клавіші і налаштування через settings.json."
tags: ["windows", "windows-terminal", "термінал", "powershell", "інструменти", "розробка"]
readTime: 7
translatesEn: "windows-terminal-setup-guide"
---

Windows Terminal — сучасний термінал від Microsoft що замінює старі cmd.exe і PowerShell вікна. Вкладки, GPU прискорення, підтримка Unicode, кастомізація — все в одному.

---

## Встановлення

```powershell
winget install Microsoft.WindowsTerminal
```
Або через Microsoft Store → **"Windows Terminal"**.

Windows 11 — вже встановлений за замовчуванням.

---

## Основні можливості

- **Вкладки** — кілька терміналів в одному вікні
- **Панелі** — розділити вікно на кілька панелей
- **Профілі** — PowerShell, CMD, WSL Ubuntu, Git Bash і будь-які інші
- **GPU рендеринг** — чіткий текст і швидкий скролінг
- **Підтримка Unicode** — кирилиця, емодзі, іконки
- **Прозорість і розмиття** (acrylic background)

---

## Гарячі клавіші

| Клавіша | Дія |
|---------|-----|
| `Ctrl+Shift+T` | Нова вкладка |
| `Ctrl+Shift+D` | Дублювати вкладку |
| `Ctrl+Tab` | Наступна вкладка |
| `Ctrl+Shift+W` | Закрити вкладку |
| `Alt+Shift++` | Розділити вертикально |
| `Alt+Shift+-` | Розділити горизонтально |
| `Alt+стрілки` | Переключитись між панелями |
| `Ctrl+Shift+F` | Пошук у терміналі |
| `Ctrl+,` | Відкрити налаштування |
| `F11` | Повноекранний режим |

---

## Налаштування профілів

```
Ctrl+, → Profiles → Add new profile
```

Або через `settings.json`:

```json
{
    "profiles": {
        "list": [
            {
                "name": "PowerShell",
                "commandline": "pwsh.exe",
                "startingDirectory": "%USERPROFILE%",
                "icon": "ms-appx:///ProfileIcons/pwsh.png"
            },
            {
                "name": "Ubuntu",
                "source": "Windows.Terminal.Wsl"
            },
            {
                "name": "Git Bash",
                "commandline": "C:\\Program Files\\Git\\bin\\bash.exe",
                "icon": "C:\\Program Files\\Git\\mingw64\\share\\git\\git-for-windows.ico"
            }
        ]
    }
}
```

---

## Теми і зовнішній вигляд

### Вбудовані теми

```
Ctrl+, → Appearance → Color scheme
```

Вбудовані: **One Half Dark**, **Solarized Dark**, **Tango Dark**, **Campbell**

### Популярні сторонні теми

Завантаж з [windowsterminalthemes.dev](https://windowsterminalthemes.dev):

1. Вибери тему → **"Get theme"**
2. Скопіюй JSON
3. Встав в `settings.json` → розділ `schemes`

### Шрифт з іконками (Nerd Fonts)

Для красивого prompt з іконками встанови Nerd Font:

1. Завантаж з [nerdfonts.com](https://www.nerdfonts.com) — рекомендую **JetBrains Mono Nerd Font**
2. Встанови шрифт
3. В налаштуваннях профілю:

```json
{
    "font": {
        "face": "JetBrainsMono Nerd Font",
        "size": 12
    }
}
```

---

## settings.json — повне налаштування

Відкрий через `Ctrl+,` → іконка JSON внизу ліворуч.

```json
{
    "$help": "https://aka.ms/terminal-documentation",
    "defaultProfile": "{PowerShell GUID}",
    "copyOnSelect": false,
    "copyFormatting": "none",

    "profiles": {
        "defaults": {
            "font": { "face": "JetBrains Mono", "size": 12 },
            "opacity": 95,
            "useAcrylic": true,
            "scrollbarState": "hidden",
            "bellStyle": "none",
            "cursorShape": "bar"
        }
    },

    "keybindings": [
        { "command": "closePane", "keys": "ctrl+w" },
        { "command": "splitPane", "keys": "ctrl+shift+e", "args": { "split": "right" } }
    ]
}
```

---

## Oh My Posh — красивий prompt

Oh My Posh додає інформативний і красивий рядок запрошення:

```powershell
# Встановити Oh My Posh
winget install JanDeDobbeleer.OhMyPosh

# Додати в профіль PowerShell
notepad $PROFILE

# Вставити рядок:
oh-my-posh init pwsh --config "$env:POSH_THEMES_PATH\atomic.omp.json" | Invoke-Expression
```

Теми Oh My Posh: [ohmyposh.dev/docs/themes](https://ohmyposh.dev/docs/themes)

---

## Quake Mode — термінал, що падає зверху

```json
{
    "keybindings": [
        {
            "command": { "action": "globalSummon", "monitor": "any" },
            "keys": "ctrl+`"
        }
    ]
}
```

`Ctrl+`` ` — термінал падає зверху екрану і ховається.

---

## Резюме

| Задача | Рішення |
|--------|---------|
| Встановити | `winget install Microsoft.WindowsTerminal` |
| Нова вкладка | Ctrl+Shift+T |
| Розділити панель | Alt+Shift+= або Alt+Shift+- |
| Налаштування | Ctrl+, або settings.json |
| Тема | windowsterminalthemes.dev |
| Красивий prompt | Oh My Posh |
