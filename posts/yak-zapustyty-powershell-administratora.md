---
title: "Як запустити PowerShell від імені адміністратора Windows"
date: "2026-09-15"
publishDate: "2026-09-15"
description: "Запуск PowerShell від адміністратора в Windows 10 і 11. Всі способи: гарячі клавіші, правий клік, Диспетчер завдань і автоматичне підвищення прав у скриптах."
tags: ["windows", "powershell", "адміністрування", "безпека", "автоматизація"]
readTime: 3
translatesEn: "how-to-run-powershell-as-administrator"
---

Багато команд PowerShell вимагають прав адміністратора. Ось всі способи відкрити піднятий сеанс.

---

## Спосіб 1: Гаряча клавіша (найшвидше)

`Win + X` → **Термінал (адміністратор)**

Або: `Win + S` → введи `powershell` → натисни `Ctrl + Shift + Enter`

---

## Спосіб 2: З меню Пуск

ПКМ на кнопці **Пуск** → **Термінал (адміністратор)**

---

## Спосіб 3: Через Диспетчер завдань

`Ctrl + Shift + Esc` → **Файл** → **Запустити нове завдання** → `powershell` → відмітити **Створити з правами адміністратора**

---

## Перевірити чи є права адміністратора

```powershell
([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]"Administrator")
# True = є права адміністратора
```

---

## Автопідвищення прав у скрипті

Додай на початок будь-якого `.ps1`:

```powershell
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]"Administrator")) {
  Start-Process PowerShell -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
  Exit
}
# Тут твій код — запускається з правами адміністратора
```

---

## Налаштувати ExecutionPolicy

```powershell
# Дозволити локальні скрипти
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Перевірити поточну політику
Get-ExecutionPolicy -List
```

---

## Часті питання

### Чому команди не працюють навіть в адмін PowerShell?

Деякі команди вимагають що вікно PowerShell запущено напряму як Admin. Також перевір ExecutionPolicy через `Get-ExecutionPolicy`.

### Чи можна завжди відкривати PowerShell від адміна?

Так — ПКМ на ярлику → Властивості → Додатково → **Запускати від імені адміністратора**. Але UAC буде запитуватись при кожному відкритті.

---

## Резюме

Найшвидше: `Win + X` → Термінал (адміністратор). З пошуку: `powershell` + `Ctrl+Shift+Enter`. Перевірка прав: `IsInRole("Administrator")`. Автопідвищення у скриптах — сніппет вище.
