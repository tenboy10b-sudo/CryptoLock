---
title: "Як налаштувати автозапуск програм через реєстр Windows"
date: "2026-04-02"
description: "Де зберігається автозавантаження в реєстрі, як додати або видалити запис вручну і через PowerShell. Всі ключі реєстру для автозапуску."
tags: ["реєстр", "автозавантаження", "оптимізація", "windows"]
readTime: 5
---

Реєстр Windows зберігає записи автозапуску в кількох місцях. Знаючи їх — можна точно контролювати що запускається при старті системи.

## Основні ключі реєстру для автозапуску

### Для поточного користувача
```
HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\Run
HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce
```

### Для всіх користувачів (потрібні права адміна)
```
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Run
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\RunServices
```

**Різниця між Run і RunOnce:**
- `Run` — виконується при кожному вході
- `RunOnce` — виконується один раз і запис видаляється

---

## Переглянути автозапуск через regedit

`Win + R` → `regedit` → перейди по одному з шляхів вище.

Праворуч побачиш список програм у форматі:
- **Ім'я:** назва запису (довільна)
- **Тип:** REG_SZ
- **Значення:** шлях до виконуваного файлу

---

## Додати програму в автозапуск через реєстр

```cmd
reg add "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /v "MyApp" /t REG_SZ /d "C:\Program Files\MyApp\app.exe" /f
```

Для всіх користувачів:
```cmd
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /v "MyApp" /t REG_SZ /d "C:\Program Files\MyApp\app.exe" /f
```

---

## Видалити запис автозапуску

```cmd
reg delete "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /v "MyApp" /f
```

---

## Через PowerShell — переглянути всі записи

```powershell
# Автозапуск поточного користувача
Get-ItemProperty "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"

# Автозапуск системний
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"
```

---

## Через PowerShell — додати і видалити

```powershell
# Додати
Set-ItemProperty "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -Name "MyApp" -Value "C:\Apps\myapp.exe"

# Видалити
Remove-ItemProperty "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -Name "MyApp"
```

---

## Інші місця автозапуску

Реєстр — не єдине місце. Програми також можуть запускатись через:

- **Папка автозапуску:** `C:\Users\ім'я\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup`
- **Системна папка:** `C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup`
- **Планувальник завдань:** `taskschd.msc`
- **Служби:** `services.msc`

Для повного контролю автозапуску використовуй **Autoruns** від Microsoft Sysinternals — він показує всі точки автозапуску одночасно.

> Також дивись: [Як вимкнути автозавантаження Windows](/yak-vymknuty-avtozavantazhennya)
