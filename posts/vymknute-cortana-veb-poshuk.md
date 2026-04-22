---
title: "Як вимкнути Cortana і пошук в інтернеті з панелі задач"
date: "2025-05-13"
description: "Вимкнення Cortana і веб-пошуку в Windows 10 і 11 через Settings, GPO і реєстр. Як прискорити пошук по файлах."
tags: ["windows", "оптимізація", "приватність", "gpo"]
readTime: 4
---

Cortana і веб-пошук у рядку пошуку панелі задач уповільнюють систему і надсилають запити в Microsoft. Ось як це вимкнути.

## Windows 11: вимкнути веб-пошук

**Через Settings:**
`Win + I` → **Privacy & security** → **Search permissions** → **Cloud content search** → вимкни **Microsoft account** і **Work or school account**.

**Через реєстр:**
```cmd
reg add "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Search" /v BingSearchEnabled /t REG_DWORD /d 0 /f
reg add "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Search" /v CortanaConsent /t REG_DWORD /d 0 /f
```

---

## Windows 10: вимкнути Cortana

**Через GPO:**
`gpedit.msc` → перейди:
```
Computer Configuration
  → Administrative Templates
    → Windows Components
      → Search
```

**Allow Cortana** → **Disabled**.

**Allow search and Cortana to use location** → **Disabled**.

**Do not allow web search** → **Enabled**.

---

## Через реєстр (обидві версії)

```cmd
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\Windows Search" /v AllowCortana /t REG_DWORD /d 0 /f
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\Windows Search" /v DisableWebSearch /t REG_DWORD /d 1 /f
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\Windows Search" /v ConnectedSearchUseWeb /t REG_DWORD /d 0 /f
```

---

## Вимкнути службу пошуку (якщо не потрібен зовсім)

Якщо пошук по файлах теж не потрібен — вимкни службу Windows Search:

```cmd
sc config WSearch start= disabled
sc stop WSearch
```

Це звільнить RAM і знизить завантаження диска. Пошук через Провідник стане повільнішим але все одно працюватиме.

---

## Вимкнути індексування для конкретних папок

Якщо хочеш залишити пошук але не індексувати певні папки:

`Win + S` → **Indexing Options** → **Modify** → зніми галочки з непотрібних папок.

---

## Прискорити пошук без індексування

Якщо вимкнув індексування — пошук через Everything (voidtools.com) буде набагато швидшим. Це безкоштовна утиліта яка будує власний індекс за секунди.

---

## Результат після вимкнення

- Знижується використання RAM на 100–200 МБ
- Зменшується завантаження диска (немає постійного індексування)
- Запити не надсилаються в Bing/Microsoft
