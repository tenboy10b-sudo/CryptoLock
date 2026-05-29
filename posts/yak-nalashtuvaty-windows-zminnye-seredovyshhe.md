---
title: "Змінні середовища Windows: як переглянути і налаштувати PATH"
date: "2026-04-30"
publishDate: "2026-04-30"
description: "Що таке змінні середовища Windows, як додати шлях до PATH, редагувати через Параметри і PowerShell, і чому PATH важливий для розробників і адміністраторів."
tags: ["windows", "налаштування", "розробка", "адміністрування"]
readTime: 4
---

Змінні середовища зберігають налаштування системи і програм. Найважливіша — PATH що визначає де Windows шукає виконувані програми.

---

## Переглянути змінні середовища

**Графічно:**
`Win + R` → `sysdm.cpl` → **Додатково** → **Змінні середовища**

Два розділи:
- **Змінні користувача** — тільки для поточного облікового запису
- **Системні змінні** — для всіх користувачів

**Через PowerShell:**
```powershell
# Всі змінні
Get-ChildItem Env: | Sort-Object Name

# Конкретна змінна
$env:PATH
$env:USERPROFILE
$env:TEMP
$env:SystemRoot

# Показати PATH рядками
$env:PATH -split ";"
```

---

## Найважливіші змінні

| Змінна | Значення |
|--------|---------|
| `%PATH%` | Шляхи пошуку програм |
| `%USERPROFILE%` | `C:\Users\Ім'я` |
| `%APPDATA%` | `C:\Users\Ім'я\AppData\Roaming` |
| `%LOCALAPPDATA%` | `C:\Users\Ім'я\AppData\Local` |
| `%TEMP%` | Тимчасові файли |
| `%SystemRoot%` | `C:\Windows` |
| `%COMPUTERNAME%` | Ім'я ПК |
| `%USERNAME%` | Поточний користувач |

---

## Додати шлях до PATH

Потрібно якщо встановив програму (Python, Node, Git) і термінал її не знаходить.

**Графічно:**
`sysdm.cpl` → **Змінні середовища** → в **Системних змінних** знайди **Path** → **Редагувати** → **Створити** → введи шлях → OK.

**Через PowerShell (поточна сесія):**
```powershell
$env:PATH += ";C:\NewTool\bin"
```

**Постійно (системний PATH):**
```powershell
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
$newPath = "$currentPath;C:\NewTool\bin"
[Environment]::SetEnvironmentVariable("PATH", $newPath, "Machine")
```

**Для поточного користувача:**
```powershell
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
$newPath = "$currentPath;C:\MyScript"
[Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
```

Перезапусти термінал щоб зміни набрали чинності.

---

## Створити власну змінну

```powershell
# Тимчасово (тільки поточна сесія)
$env:MY_API_KEY = "abc123"

# Постійно для користувача
[Environment]::SetEnvironmentVariable("MY_API_KEY", "abc123", "User")

# Постійно для системи (потребує адміна)
[Environment]::SetEnvironmentVariable("MY_API_KEY", "abc123", "Machine")
```

---

## Видалити змінну

```powershell
# Видалити змінну користувача
[Environment]::SetEnvironmentVariable("MY_API_KEY", $null, "User")

# Видалити з PATH (конкретний шлях)
$path = [Environment]::GetEnvironmentVariable("PATH", "Machine")
$newPath = ($path -split ";") | Where-Object {$_ -ne "C:\OldTool\bin"} | Join-String -Separator ";"
[Environment]::SetEnvironmentVariable("PATH", $newPath, "Machine")
```

---

## Перевірити чи програма в PATH

```powershell
# Знайти де знаходиться команда
where.exe python
where.exe node
where.exe git

# Або через PowerShell
Get-Command python | Select-Object Name, Source
```

---

## Типові проблеми

**"python не є внутрішньою або зовнішньою командою":**
Python не додано до PATH при встановленні. При встановленні Python поставив галочку **Add Python to PATH** або додай вручну (`C:\Users\Ім'я\AppData\Local\Programs\Python\Python312\`).

**Зміна PATH не діє:**
Перезапусти термінал або `refreshenv` якщо встановлений Chocolatey.

---

## Резюме

PATH — список папок де Windows шукає програми при введенні команди. Додай шлях через `sysdm.cpl` або PowerShell `SetEnvironmentVariable`. Перезапусти термінал після змін. Для перевірки: `where.exe програма` або `Get-Command програма`.
