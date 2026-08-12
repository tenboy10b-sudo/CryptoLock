---
title: "Python на Windows 10 і 11: встановлення, налаштування і перші кроки"
date: "2026-06-10"
publishDate: "2026-09-30"
updated: "2026-06-10"
description: "Як встановити Python на Windows 10 і 11, налаштувати PATH, встановити pip пакети і virtual environment. VS Code для Python. Вирішення помилок 'python is not recognized'."
tags: ["windows", "python", "розробка", "інструменти", "програмування"]
readTime: 8
translatesEn: "how-to-install-python-windows-10-11"
---

Python — найпопулярніша мова програмування для автоматизації, аналізу даних і веб-розробки. Встановлення на Windows займає 5 хвилин, але є нюанси які заощадять тобі години налагодження.

---

## Крок 1 — Завантаження Python

1. Відкрий [python.org/downloads](https://www.python.org/downloads/)
2. Натисни велику жовту кнопку **"Download Python 3.x.x"**
3. Завантажиться інсталятор для Windows (`.exe`, ~25 МБ)

> Завжди завантажуй останню стабільну версію Python 3. Python 2 застарів і не підтримується.

---

## Крок 2 — Встановлення

1. Запусти інсталятор
2. **Обов'язково** постав галочку **"Add Python to PATH"** внизу вікна
3. Натисни **"Install Now"**

### Що означає "Add to PATH"
Без цього Python не буде доступний з командного рядка — доведеться вводити повний шлях типу `C:\Python312\python.exe`. З PATH — просто `python`.

### Перевірити встановлення

```powershell
python --version
# Python 3.12.4

pip --version
# pip 24.0 from C:\Users\...\pip (python 3.12)
```

Якщо команда не знайдена — перечитай кроки нижче.

---

## Виправлення "python is not recognized"

Найчастіша помилка після встановлення:

```
'python' is not recognized as an internal or external command
```

**Рішення 1 — додати PATH вручну:**

```powershell
# Знайти де встановлений Python
where python
# або
Get-Command python -ErrorAction SilentlyContinue

# Додати в PATH через PowerShell (замін шлях на свій)
$pythonPath = "C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python312"
$pipPath    = "$pythonPath\Scripts"
[Environment]::SetEnvironmentVariable("PATH", 
    $env:PATH + ";$pythonPath;$pipPath", "User")
```

**Рішення 2 — перевстановити з галочкою Add to PATH**

**Рішення 3 — через winget:**
```powershell
winget install Python.Python.3.12
```

---

## pip — менеджер пакетів Python

pip встановлює бібліотеки і інструменти:

```powershell
# Встановити пакет
pip install requests

# Встановити конкретну версію
pip install requests==2.31.0

# Оновити пакет
pip install --upgrade requests

# Видалити пакет
pip uninstall requests

# Список встановлених пакетів
pip list

# Зберегти список залежностей
pip freeze > requirements.txt

# Встановити всі залежності з файлу
pip install -r requirements.txt
```

---

## Virtual Environment (venv)

Virtual environment — ізольоване середовище для кожного проекту. Запобігає конфліктам між версіями пакетів різних проектів.

```powershell
# Створити venv в папці проекту
python -m venv venv

# Активувати (Windows)
.\venv\Scripts\activate

# Тепер pip встановлює тільки в цей venv
pip install flask

# Деактивувати
deactivate
```

**Як зрозуміти що venv активований:**
В рядку терміналу з'явиться `(venv)` перед шляхом:
```
(venv) C:\Projects\myapp>
```

> Завжди використовуй venv для кожного нового проекту — це хороша практика.

---

## VS Code для Python

Visual Studio Code — найкращий безкоштовний редактор для Python на Windows.

1. Встанови VS Code з [code.visualstudio.com](https://code.visualstudio.com)
2. Встанови розширення Python:
   - `Ctrl+Shift+X` → пошук "Python" → Microsoft Python extension
3. Відкрий папку проекту: `Ctrl+K Ctrl+O`
4. Вибери інтерпретатор: `Ctrl+Shift+P` → "Python: Select Interpreter"

**Корисні розширення для Python:**
- **Python** (Microsoft) — обов'язково
- **Pylance** — автодоповнення і аналіз коду
- **Black Formatter** — автоформатування
- **Jupyter** — якщо працюєш з notebook

---

## Перша програма на Python

Створи файл `hello.py`:

```python
# hello.py
name = input("Як тебе звати? ")
print(f"Привіт, {name}!")

# Робота з числами
numbers = [1, 2, 3, 4, 5]
print(f"Сума: {sum(numbers)}")
print(f"Середнє: {sum(numbers) / len(numbers)}")
```

Запуск:
```powershell
python hello.py
```

---

## Корисні бібліотеки для початку

```powershell
# HTTP запити
pip install requests

# Робота з Excel
pip install openpyxl

# Автоматизація браузера
pip install selenium

# Аналіз даних
pip install pandas numpy

# Веб-фреймворк
pip install flask

# GUI додатки
pip install tkinter  # вбудовано в Python
```

---

## Python у PowerShell — автоматизація Windows

Python чудово інтегрується з Windows для автоматизації:

```python
import os
import subprocess
import shutil
from pathlib import Path

# Список файлів в папці
for file in Path("C:/Users").iterdir():
    print(file.name)

# Запустити команду Windows
result = subprocess.run(["ipconfig"], capture_output=True, text=True)
print(result.stdout)

# Копіювати файл
shutil.copy("source.txt", "destination.txt")

# Отримати змінні середовища
print(os.environ.get("USERNAME"))
print(os.environ.get("COMPUTERNAME"))
```

---

## Часті питання

### Яку версію Python встановити?
Завжди останню стабільну Python 3. На сьогодні Python 3.12+.

### Python 2 чи Python 3?
Тільки Python 3. Python 2 офіційно завершив підтримку в 2020 році.

### Де зберігаються встановлені пакети?
```powershell
pip show requests  # покаже Location: ...
# Зазвичай: C:\Users\[user]\AppData\Local\Programs\Python\Python312\Lib\site-packages
```

### Як запустити .py файл подвійним кліком?
Після встановлення Python `.py` файли асоційовані з Python. Правою кнопкою → "Відкрити за допомогою" → Python.

---

## Резюме

| Крок | Дія |
|------|-----|
| 1 | python.org → Download Python 3.x |
| 2 | Встановити з галочкою "Add to PATH" |
| 3 | Перевірити: `python --version` |
| 4 | Для проекту: `python -m venv venv` → активувати |
| 5 | Редактор: VS Code + Python extension |
