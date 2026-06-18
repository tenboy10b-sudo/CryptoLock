---
title: "Process Explorer і System Informer: розширений менеджер процесів для Windows"
date: "2026-06-18"
publishDate: "2026-09-24"
updated: "2026-06-18"
description: "Як використовувати Process Explorer від Sysinternals і System Informer для аналізу процесів Windows. Знайти який процес використовує файл, перевірити підозрілі процеси і замінити стандартний диспетчер."
tags: ["windows", "process-explorer", "sysinternals", "діагностика", "безпека", "інструменти"]
readTime: 7
translatesEn: "process-explorer-system-informer-windows-guide"
---

Process Explorer від Microsoft Sysinternals — розширена версія Диспетчера завдань. Показує дерево процесів, DLL які вони завантажили, відкриті файли і дескриптори. System Informer — його відкритий аналог з ще більшими можливостями.

---

## Process Explorer vs Диспетчер завдань

| | Диспетчер завдань | Process Explorer |
|-|------------------|-----------------|
| Дерево процесів | ❌ | ✅ |
| DLL і хендли | ❌ | ✅ |
| Пошук файлу в процесах | ❌ | ✅ |
| Перевірка через VirusTotal | ❌ | ✅ |
| GPU навантаження | ✅ | ✅ |
| Підсвічування процесів | ❌ | ✅ |

---

## Завантаження

**Process Explorer (Microsoft):**
```powershell
winget install Microsoft.Sysinternals.ProcessExplorer
```
Або з [learn.microsoft.com/sysinternals/downloads/process-explorer](https://learn.microsoft.com/en-us/sysinternals/downloads/process-explorer)

**System Informer (відкритий код):**
```powershell
winget install winsiderss.systeminformer
```
Або з [systeminformer.com](https://systeminformer.com)

---

## Дерево процесів

На відміну від стандартного Диспетчера завдань Process Explorer показує **батьківсько-дочірні відносини** між процесами:

```
explorer.exe
  └── chrome.exe
        ├── chrome.exe (renderer)
        ├── chrome.exe (gpu)
        └── chrome.exe (extension)
  └── notepad.exe
```

**Кольорове підсвічування:**
| Колір | Значення |
|-------|---------|
| 🟣 Фіолетовий | Упакований процес (може бути підозрілим) |
| 🔵 Синій | Процес запущений від системи |
| 🟡 Жовтий | Процес запущений від вашого облікового запису |
| 🔴 Червоний | Процес завершується |
| 🟢 Зелений | Новий процес (щойно запущений) |

---

## Знайти який процес використовує файл або папку

Одна з найкорисніших функцій — коли Windows каже "файл використовується іншою програмою":

```
Find → Find Handle or DLL (Ctrl+F)
→ Введи назву файлу або папки
→ Process Explorer знайде який процес тримає файл
```

Потім ПКМ на процесі → **Close Handle** — примусово звільнити файл.

---

## Перевірка процесів через VirusTotal

Process Explorer може перевірити кожен процес через VirusTotal:

```
Options → VirusTotal.com → Check VirusTotal.com
```

Колонка **VirusTotal** покаже скільки антивірусів вважають процес шкідливим. `0/72` — чисто. `5/72` — підозріло.

---

## Заміна стандартного Диспетчера завдань

```
Options → Replace Task Manager
```

Тепер `Ctrl+Shift+Esc` і `Ctrl+Alt+Del → Task Manager` відкриватиме Process Explorer.

---

## Детальна інформація про процес

Подвійний клік на процесі → вікно з деталями:

**Image (виконуваний файл):**
- Повний шлях до .exe
- Цифровий підпис (Verified/Not verified)
- Опис і компанія

**Performance:**
- Графіки CPU, RAM, I/O в реальному часі

**Threads:**
- Список потоків і їх стек

**DLLs:**
- Всі DLL завантажені процесом
- Шляхи до файлів

**Handles:**
- Всі відкриті файли, реєстр, мережеві з'єднання

---

## Підозрілі ознаки процесу

На що звертати увагу при аналізі:

🔴 **Тривога:**
- Процес без цифрового підпису (Not Verified)
- Запущений з `%TEMP%` або `%APPDATA%`
- Назва схожа на системний процес але з помилкою (svchost32.exe, explorers.exe)
- Висока мережева активність в незнайомого процесу

✅ **Норма:**
- Microsoft або відомий виробник, Verified підпис
- Запущений з `C:\Windows\System32` або `C:\Program Files`

---

## System Informer — розширені можливості

System Informer (колишній Process Hacker) має додаткові функції:

**Network (мережа):**
- Показує всі мережеві з'єднання кожного процесу
- IP адреси, порти, стан з'єднань

**Disk (диск):**
- Які процеси читають/пишуть диск і як активно

**Kernel Modules:**
- Список завантажених драйверів ядра

**Services:**
- Управління службами Windows

```
View → System Information → повна статистика системи
```

---

## Корисні команди із командного рядка

```powershell
# Sysinternals Handle — знайти який процес тримає файл (CLI версія)
handle.exe "C:\path\to\file.txt"

# Завершити процес за назвою
Stop-Process -Name "chrome" -Force

# Список процесів з батьківськими ID
Get-CimInstance Win32_Process |
    Select-Object Name, ProcessId, ParentProcessId, ExecutablePath |
    Sort-Object ProcessId
```

---

## Резюме

| Задача | Де в Process Explorer |
|--------|----------------------|
| Знайти процес що блокує файл | Find → Find Handle (Ctrl+F) |
| Перевірити підозрілий процес | Колонка VirusTotal |
| Замінити Диспетчер завдань | Options → Replace Task Manager |
| Дерево процесів | Головне вікно |
| Деталі DLL і файлів | Подвійний клік на процесі |
