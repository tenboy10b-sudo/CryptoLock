---
title: "Як встановити Python на Windows і налаштувати середовище розробки"
date: "2026-07-10"
publishDate: "2026-07-10"
description: "Встановлення Python на Windows 10 і 11: через офіційний сайт і winget, налаштування PATH, pip, virtualenv і VS Code для роботи з Python."
tags: ["windows", "інструменти", "налаштування", "cmd", "powershell"]
readTime: 6
---

Python — одна з найпопулярніших мов програмування. Встановити на Windows просто, але є нюанси з PATH і середовищами що варто знати з початку.

---

## Спосіб 1: Через офіційний сайт (рекомендовано)

1. Зайди на **python.org/downloads**
2. Натисни **Download Python 3.x.x** (остання стабільна версія)
3. Запусти інсталятор
4. **Обов'язково** постав галочку **"Add Python to PATH"** внизу
5. Натисни **Install Now**

---

## Спосіб 2: Через winget

```powershell
# Встановити останню версію Python
winget install Python.Python.3.12

# Перевірити доступні версії
winget search Python.Python
```

---

## Перевірити установку

```cmd
python --version
pip --version
```

Якщо команда `python` не знайдена — PATH не налаштований. Перевстанови з галочкою "Add to PATH" або додай вручну:

```powershell
# Знайти де встановлений Python
where python

# Додати до PATH вручну (замінити на свій шлях)
[Environment]::SetEnvironmentVariable(
    "PATH",
    "$env:PATH;C:\Users\ІМ'Я\AppData\Local\Programs\Python\Python312\;C:\Users\ІМ'Я\AppData\Local\Programs\Python\Python312\Scripts\",
    "User"
)
```

Після цього перезапусти термінал.

---

## pip — менеджер пакетів

```cmd
rem Встановити пакет
pip install requests

rem Встановити конкретну версію
pip install django==4.2

rem Список встановлених пакетів
pip list

rem Оновити pip
python -m pip install --upgrade pip

rem Встановити з файлу requirements.txt
pip install -r requirements.txt

rem Зберегти список пакетів
pip freeze > requirements.txt
```

---

## Віртуальне середовище (venv)

Кожен проект повинен мати своє окреме середовище — щоб пакети різних проектів не конфліктували.

```cmd
rem Створити virtualenv у папці проекту
python -m venv venv

rem Активувати (Windows CMD)
venv\Scripts\activate

rem Активувати (PowerShell)
venv\Scripts\Activate.ps1

rem Деактивувати
deactivate
```

Після активації — в терміналі з'явиться `(venv)`. Тепер `pip install` встановлює пакети тільки для цього проекту.

---

## VS Code для Python

1. Встанови **VS Code**: code.visualstudio.com
2. Встанови розширення **Python** (від Microsoft) в VS Code
3. `Ctrl + Shift + P` → **Python: Select Interpreter** → вибери свою версію Python або venv

Корисні розширення:
- **Pylance** — підказки і перевірка типів
- **Ruff** — швидкий лінтер
- **Jupyter** — для notebook файлів

---

## Запустити Python скрипт

```cmd
rem Запустити файл
python script.py

rem Інтерактивна консоль
python

rem Виконати однорядковий код
python -c "print('Hello, Windows!')"
```

---

## Типові проблеми

### `python` не розпізнається

```cmd
rem Спробуй py замість python
py --version
py script.py
```

Windows має `py.exe` — лаунчер що знаходить Python навіть якщо PATH не налаштований.

### PowerShell блокує Activate.ps1

```powershell
# Дозволити виконання локальних скриптів
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Конфлікт кількох версій Python

```cmd
rem Запустити конкретну версію
py -3.11 script.py
py -3.12 script.py

rem Список встановлених версій
py -0
```

---

## Підсумок

Встанови з python.org з галочкою "Add to PATH". Для кожного проекту — `python -m venv venv` і активуй його. VS Code + розширення Python — найзручніше середовище на Windows.
