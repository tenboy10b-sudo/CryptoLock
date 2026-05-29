---
title: "Розширений пошук файлів в Windows: оператори і фільтри"
date: "2026-03-12"
publishDate: "2026-03-12"
description: "Як знайти будь-який файл в Windows за допомогою розширених операторів пошуку: фільтри по даті, розміру, типу файлу і вмісту. Пошук через Провідник і PowerShell."
tags: ["windows", "інструменти", "налаштування", "продуктивність"]
readTime: 4
---

Стандартний пошук Windows знаходить файли за назвою, але мало хто знає про розширені оператори що дозволяють шукати за датою, розміром, типом і навіть вмістом.

---

## Базовий пошук у Провіднику

Відкрий Провідник → натисни на рядок пошуку вгорі → введи запит.

Windows шукає в поточній папці і всіх підпапках.

---

## Оператори пошуку

```
name:звіт              - файли з "звіт" в назві
ext:pdf                - тільки PDF файли
kind:document          - документи (Word, PDF, txt)
kind:picture           - зображення
kind:video             - відео
kind:music             - аудіо
size:>10MB             - файли більше 10 МБ
size:<1KB              - файли менше 1 КБ
date:>01.01.2026       - змінені після 1 січня 2026
date:last week         - змінені за останній тиждень
modified:today         - змінені сьогодні
created:yesterday      - створені вчора
```

**Комбінування:**
```
ext:docx date:>01.03.2026
name:звіт size:>1MB
```

---

## Пошук по вмісту файлів

Провідник за замовчуванням шукає тільки в іменах. Для пошуку по вмісту:

`Win + I` → **Конфіденційність і безпека** → **Пошук Windows** → **Розширений режим індексування** → увімкни і додай потрібні папки.

Або в Провіднику: **Вигляд** → **Параметри** → **Пошук** → **Завжди шукати імена файлів і вміст**.

---

## Пошук через PowerShell

```powershell
# Знайти файли за назвою
Get-ChildItem "C:\Users" -Recurse -Filter "*.pdf" -ErrorAction SilentlyContinue

# Знайти файли більше 100 МБ
Get-ChildItem "C:\" -Recurse -ErrorAction SilentlyContinue |
  Where-Object {$_.Length -gt 100MB} |
  Select-Object FullName, @{n='MB';e={[math]::Round($_.Length/1MB,0)}} |
  Sort-Object MB -Descending | Select-Object -First 20

# Знайти файли змінені за останній тиждень
Get-ChildItem "C:\Users\$env:USERNAME" -Recurse -ErrorAction SilentlyContinue |
  Where-Object {$_.LastWriteTime -gt (Get-Date).AddDays(-7)} |
  Select-Object FullName, LastWriteTime | Sort-Object LastWriteTime -Descending

# Знайти файли що містять текст (txt, log, csv)
Get-ChildItem "C:\Logs" -Filter "*.log" |
  Select-String -Pattern "ERROR" |
  Select-Object Path, LineNumber, Line
```

---

## Пошук через Everything (стороннє ПЗ)

Вбудований пошук Windows повільний на великих дисках. **Everything** від voidtools миттєво знаходить будь-який файл:

- Завантаж з [voidtools.com](https://www.voidtools.com) — безкоштовно
- Індексує диск за секунди
- Пошук по назві — результати з'являються при введенні

Підтримує регулярні вирази і розширені фільтри.

---

## Пошук дублікатів файлів

```powershell
# Знайти дублікати по розміру і імені
Get-ChildItem "C:\Photos" -Recurse -ErrorAction SilentlyContinue |
  Group-Object Name, Length |
  Where-Object {$_.Count -gt 1} |
  ForEach-Object {$_.Group | Select-Object FullName, Length}
```

---

## Резюме

Для простого пошуку: Провідник + оператори (ext:pdf, size:>10MB, date:today). Для пошуку по вмісту: увімкни розширене індексування. Для великих дисків і миттєвого пошуку: Everything. Для скриптів і автоматизації: PowerShell `Get-ChildItem` з фільтрами.
