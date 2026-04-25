---
title: "Як встановити Node.js на Windows і налаштувати npm"
date: "2026-08-03"
publishDate: "2026-08-03"
description: "Встановлення Node.js на Windows через офіційний сайт і nvm-windows: управління версіями, npm налаштування, вирішення помилок EACCES і PATH."
tags: ["windows", "інструменти", "налаштування", "cmd", "powershell"]
readTime: 5
---

Node.js — середовище виконання JavaScript поза браузером. Потрібне для React, Vue, Angular, Next.js та більшості сучасних веб-проектів.

---

## Спосіб 1: Офіційний сайт (найпростіший)

1. Зайди на **nodejs.org**
2. Завантаж **LTS версію** (не Current — вона для тих хто хоче нові функції)
3. Запусти інсталятор → **Next** → **Next** → встанови

При встановленні можна додатково встановити засоби компіляції для нативних модулів — постав галочку якщо плануєш використовувати пакети з нативним кодом.

```cmd
rem Перевірити встановлення
node --version
npm --version
```

---

## Спосіб 2: winget

```powershell
# LTS версія
winget install OpenJS.NodeJS.LTS

# Поточна версія
winget install OpenJS.NodeJS
```

---

## Спосіб 3: nvm-windows (рекомендовано для розробників)

nvm (Node Version Manager) дозволяє мати кілька версій Node.js і перемикатись між ними.

1. Завантаж **nvm-windows** з github.com/coreybutler/nvm-windows → Releases → `nvm-setup.exe`
2. Встанови
3. Відкрий новий термінал (важливо!) і:

```powershell
# Встановити конкретну версію
nvm install 20.11.0
nvm install 18.19.0

# Перемкнутись на версію
nvm use 20.11.0

# Поточна активна версія
nvm current

# Список встановлених версій
nvm list

# Список доступних для встановлення
nvm list available
```

---

## Налаштування npm

```cmd
rem Переглянути конфігурацію npm
npm config list

rem Змінити папку для глобальних пакетів (щоб не потрібні права адміна)
npm config set prefix "C:\Users\ІМ'Я\npm-global"

rem Додати до PATH (один раз, якщо змінив prefix)
rem Додай C:\Users\ІМ'Я\npm-global до змінної PATH в Параметрах системи

rem Встановити пакет глобально
npm install -g typescript
npm install -g nodemon
npm install -g create-react-app

rem Список глобально встановлених пакетів
npm list -g --depth=0
```

---

## Основні команди npm

```cmd
rem Ініціалізувати новий проект
npm init -y

rem Встановити всі залежності з package.json
npm install

rem Встановити пакет і додати в dependencies
npm install express

rem Встановити в devDependencies
npm install --save-dev typescript

rem Видалити пакет
npm uninstall express

rem Оновити всі пакети
npm update

rem Запустити скрипт з package.json
npm run build
npm start

rem Перевірити на вразливості
npm audit
npm audit fix
```

---

## Типові проблеми

### `node` або `npm` не розпізнається

Перезапусти термінал після встановлення. Якщо не допомогло — перевір PATH:

```powershell
# Де встановлений Node
where.exe node

# Переглянути PATH
$env:PATH -split ";"
```

### Помилка EACCES при встановленні глобальних пакетів

Запусти термінал від адміністратора або зміни prefix на папку без потреби в правах:

```cmd
npm config set prefix "%APPDATA%\npm"
```

### Помилка `node_modules` занадто довгі шляхи

Windows має обмеження на довжину шляху (260 символів). Увімкни довгі шляхи:

```powershell
# Через реєстр
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
  -Name "LongPathsEnabled" -Value 1 -Type DWord
```

### `npm install` зависає

```cmd
rem Очистити кеш npm
npm cache clean --force

rem Спробувати з іншим реєстром
npm install --registry https://registry.npmjs.org
```

---

## Підсумок

Для початку — встанови LTS з nodejs.org. Для роботи з кількома проектами на різних версіях — nvm-windows. Якщо встановлення глобальних пакетів вимагає права адміна — зміни `npm config set prefix` на папку в домашньому каталозі.
