---
title: "VS Code на Windows: встановлення, налаштування і топ розширень для розробників"
date: "2027-01-08"
publishDate: "2027-01-08"
updated: "2026-09-29"
description: "Як встановити Visual Studio Code на Windows 10 і 11. Налаштування теми, шрифту, автозбереження. Топ розширень для Python, JavaScript, PHP. Гарячі клавіші VS Code."
tags: ["windows", "vscode", "розробка", "інструменти", "програмування"]
readTime: 8
translatesEn: "vscode-windows-setup-extensions-guide"
---

Visual Studio Code — найпопулярніший редактор коду у світі. Безкоштовний, відкритий код, підтримує сотні мов програмування. Ось як налаштувати його правильно з нуля.

---

## Встановлення

1. Завантаж з [code.visualstudio.com](https://code.visualstudio.com)
2. Вибери **System Installer** (для всіх користувачів) або **User Installer**
3. При встановленні постав галочки:
   - ✅ Add "Open with Code" to context menu (file)
   - ✅ Add "Open with Code" to context menu (directory)
   - ✅ Register Code as editor for supported file types

```powershell
winget install Microsoft.VisualStudioCode
```

---

## Перше налаштування

### Тема оформлення
`Ctrl+K Ctrl+T` → вибери тему

Популярні теми:
- **One Dark Pro** — класична темна
- **GitHub Dark** — від GitHub
- **Dracula** — популярна темна
- **Catppuccin** — пастельна

### Шрифт з лігатурами
```json
// settings.json (Ctrl+Shift+P → Open User Settings JSON)
{
  "editor.fontFamily": "JetBrains Mono, Fira Code, Consolas",
  "editor.fontLigatures": true,
  "editor.fontSize": 14,
  "editor.lineHeight": 1.6
}
```

**JetBrains Mono** — безкоштовний моноширинний шрифт з лігатурами. Завантаж з [jetbrains.com/lp/mono](https://www.jetbrains.com/lp/mono/).

### Автозбереження
```json
{
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000
}
```

---

## Корисні налаштування

```json
{
  // Показувати пробіли і таби
  "editor.renderWhitespace": "boundary",
  
  // Підсвічувати поточний рядок
  "editor.renderLineHighlight": "all",
  
  // Мінімап (прев'ю коду справа)
  "editor.minimap.enabled": false,
  
  // Відносна нумерація рядків
  "editor.lineNumbers": "relative",
  
  // Word wrap
  "editor.wordWrap": "on",
  
  // Форматувати при збереженні
  "editor.formatOnSave": true,
  
  // Розмір табуляції
  "editor.tabSize": 2,
  
  // Браузер файлів — компактний режим
  "explorer.compactFolders": false,
  
  // Термінал
  "terminal.integrated.defaultProfile.windows": "PowerShell"
}
```

---

## Топ розширень

### Загальні (обов'язково)

**GitLens** — розширена робота з Git прямо в редакторі. Показує хто і коли змінив кожен рядок.
```
ext install eamodio.gitlens
```

**Prettier** — автоформатування коду (JS, CSS, HTML, JSON, Markdown).
```
ext install esbenp.prettier-vscode
```

**Error Lens** — підсвічує помилки прямо в рядку коду.
```
ext install usernamehw.errorlens
```

**Path Intellisense** — автодоповнення шляхів до файлів.
```
ext install christian-kohler.path-intellisense
```

**Todo Tree** — знаходить всі TODO і FIXME коментарі в проекті.
```
ext install gruntfuggly.todo-tree
```

### Python
```
ext install ms-python.python
ext install ms-python.pylance
ext install ms-python.black-formatter
```

### JavaScript / TypeScript
```
ext install dbaeumer.vscode-eslint
ext install esbenp.prettier-vscode
ext install formulahendry.auto-rename-tag
```

### PHP
```
ext install bmewburn.vscode-intelephense-client
ext install DEVSENSE.phptools-vscode
```

### Docker
```
ext install ms-azuretools.vscode-docker
```

### Markdown
```
ext install yzhang.markdown-all-in-one
ext install DavidAnson.vscode-markdownlint
```

---

## Гарячі клавіші

| Клавіша | Дія |
|---------|-----|
| `Ctrl+P` | Швидко відкрити файл |
| `Ctrl+Shift+P` | Палітра команд |
| `Ctrl+`` ` | Відкрити термінал |
| `Ctrl+B` | Показати/сховати sidebar |
| `Ctrl+Shift+E` | Explorer |
| `Ctrl+Shift+G` | Source Control (Git) |
| `Ctrl+Shift+X` | Extensions |
| `Ctrl+/` | Закоментувати рядок |
| `Alt+↑/↓` | Перемістити рядок |
| `Shift+Alt+↑/↓` | Скопіювати рядок |
| `Ctrl+D` | Виділити наступне входження |
| `Ctrl+Shift+L` | Виділити всі входження |
| `F2` | Перейменувати символ |
| `F12` | Перейти до визначення |
| `Ctrl+Z` | Відмінити |
| `Ctrl+Shift+Z` | Повторити |

---

## Workspace і проекти

```powershell
# Відкрити папку в VS Code з командного рядка
code C:\Projects\myapp

# Відкрити поточну папку
code .

# Відкрити конкретний файл
code index.js
```

**Multi-root workspace** — відкрити кілька папок в одному вікні:
```
File → Add Folder to Workspace
```

---

## Синхронізація налаштувань

VS Code синхронізує налаштування між пристроями через GitHub або Microsoft акаунт:

```
Ctrl+Shift+P → Settings Sync: Turn On
```

Синхронізує: налаштування, розширення, клавіші, сніпети, UI стан.

---

## Вирішення проблем

### VS Code гальмує на великих файлах
```json
{
  "editor.largeFileOptimizations": true,
  "files.maxMemoryForLargeFilesMB": 4096
}
```

### Термінал не відкривається
```json
{
  "terminal.integrated.defaultProfile.windows": "Command Prompt"
}
```

### Розширення конфліктують
Вимкни розширення по одному: Extensions → знайди розширення → Disable.

---

## Резюме

| Задача | Дія |
|--------|-----|
| Встановити | code.visualstudio.com або `winget install vscode` |
| Тема | Ctrl+K Ctrl+T |
| Налаштування | Ctrl+, або settings.json |
| Розширення | Ctrl+Shift+X |
| Відкрити папку | `code .` в терміналі |
| Синхронізація | Settings Sync через GitHub акаунт |
