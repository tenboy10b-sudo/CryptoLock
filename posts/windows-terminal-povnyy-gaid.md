---
title: "Windows Terminal: налаштування, профілі і корисні функції"
date: "2026-06-06"
publishDate: "2026-06-06"
description: "Повний гайд по Windows Terminal: встановлення, налаштування вигляду, кілька профілів CMD і PowerShell, вкладки, роздільний екран і гарячі клавіші."
tags: ["windows", "powershell", "cmd", "інструменти", "налаштування"]
readTime: 6
---

Windows Terminal — сучасна заміна старому CMD і PowerShell. Підтримує вкладки, кілька профілів, розділення екрана і повністю налаштовується. Стандартний інструмент у Windows 11.

---

## Встановлення

**Windows 11:** встановлений за замовчуванням.

**Windows 10:** 

`Win + S` → **Microsoft Store** → шукай **Windows Terminal** → Встановити

Або через PowerShell:
```powershell
winget install Microsoft.WindowsTerminal
```

---

## Відкрити від адміністратора

Правою кнопкою на **Пуск** → **Windows Terminal (адміністратор)**

Або: `Win + X` → **Windows Terminal (адміністратор)**

---

## Основні гарячі клавіші

| Дія | Клавіші |
|-----|---------|
| Нова вкладка | `Ctrl + Shift + T` |
| Нова вкладка з профілем | `Ctrl + Shift + 1/2/3...` |
| Закрити вкладку | `Ctrl + Shift + W` |
| Переключити вкладку | `Ctrl + Tab` / `Ctrl + Shift + Tab` |
| Розділити вертикально | `Alt + Shift + +` |
| Розділити горизонтально | `Alt + Shift + -` |
| Збільшити шрифт | `Ctrl + +` |
| Пошук | `Ctrl + Shift + F` |
| Копіювати виділене | `Ctrl + C` |
| Вставити | `Ctrl + V` |

---

## Налаштування зовнішнього вигляду

`Ctrl + ,` (кома) — відкрити налаштування

Або: стрілка вниз у заголовку вкладок → **Параметри**

### Змінити тему

**Параметри** → **Вигляд** → **Тема програми** → Light, Dark або System.

### Змінити шрифт і розмір

**Параметри** → вибери профіль (PowerShell або CMD) → **Вигляд** → **Шрифт**:
- Рекомендовані: `Cascadia Code`, `JetBrains Mono`, `FiraCode` (з лігатурами)
- Встанови один з Nerd Fonts для іконок: nerdfonts.com

### Прозорість

**Параметри** → профіль → **Вигляд** → **Непрозорість фону** → 70-90% для ефекту скла.

### Кольорова схема

**Параметри** → **Кольорові схеми** → є вбудовані: One Half Dark, Tango Dark, Solarized.

Або додай власну — клікни **Додати нову**.

---

## Налаштування через settings.json

Для просунутих налаштувань — `Ctrl + ,` → лівий нижній кут → **Відкрити файл JSON**.

Корисні параметри:

```json
{
  "defaultProfile": "{PowerShell GUID}",
  "copyOnSelect": true,
  "copyFormatting": false,
  "profiles": {
    "defaults": {
      "font": {
        "face": "Cascadia Code",
        "size": 12
      },
      "opacity": 85,
      "useAcrylic": true,
      "colorScheme": "One Half Dark",
      "padding": "8"
    },
    "list": [
      {
        "name": "PowerShell",
        "commandline": "pwsh.exe",
        "startingDirectory": "%USERPROFILE%"
      },
      {
        "name": "CMD",
        "commandline": "cmd.exe",
        "startingDirectory": "%USERPROFILE%"
      },
      {
        "name": "WSL Ubuntu",
        "commandline": "wsl.exe -d Ubuntu",
        "startingDirectory": "~"
      }
    ]
  }
}
```

---

## Профілі — кілька середовищ у вкладках

Terminal автоматично знаходить встановлені середовища: PowerShell 5, PowerShell 7, CMD, WSL.

**Додати SSH-профіль** для швидкого підключення до сервера:

```json
{
  "name": "Production Server",
  "commandline": "ssh user@192.168.1.100",
  "icon": "🖥️"
}
```

**Додати Azure Cloud Shell:**

```json
{
  "name": "Azure Cloud Shell",
  "commandline": "az"
}
```

---

## Розділення екрана (Panes)

Корисно для одночасного моніторингу кількох сесій.

- `Alt + Shift + =` — розділити вертикально
- `Alt + Shift + -` — розділити горизонтально
- `Alt + ←/→/↑/↓` — переключатись між панелями
- `Ctrl + Shift + W` — закрити поточну панель

---

## Quake Mode — термінал що випадає зверху

Термінал як у Linux — натисни клавішу і він з'являється зверху екрана.

**Параметри** → **Запуск** → **Launch mode** → **Focus** або встанови глобальне гарячу клавішу:

```json
{
  "actions": [
    {
      "command": "quakeMode",
      "keys": "win+`"
    }
  ]
}
```

Тепер `Win + ~` відкриває і закриває Terminal зверху.

---

## Підсумок

Windows Terminal — обов'язковий інструмент для будь-кого хто регулярно працює з командним рядком. Вкладки, профілі і розділення екрана заощаджують час. Встанови Cascadia Code або JetBrains Mono і налаштуй прозорість — отримаєш зручний і красивий термінал.
