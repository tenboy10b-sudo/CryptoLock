---
title: "Як дізнатись версію і збірку Windows 10 і 11"
date: "2026-04-02"
publishDate: "2026-04-02"
description: "Кілька способів перевірити точну версію, збірку і видання Windows: через winver, системну інформацію, PowerShell і CMD."
tags: ["windows", "діагностика", "інструменти", "налаштування"]
readTime: 3
---

Версія Windows потрібна при встановленні драйверів, зверненні в підтримку або перевірці сумісності програм. Ось всі способи її дізнатись.

---

## Найшвидший спосіб: winver

`Win + R` → `winver` → Enter

Показує:
- Видання (Windows 10 Home / Pro, Windows 11 Home / Pro)
- Версія (наприклад 22H2 або 23H2)
- Номер збірки (наприклад 22621.2861)

---

## Через Параметри

`Win + I` → **Система** → **Про систему** → прокрути вниз до **Специфікації Windows**:

- **Видання**: Windows 10 або Windows 11, Home або Pro
- **Версія**: 22H2, 23H2 тощо
- **Встановлено**: дата встановлення
- **Збірка ОС**: точний номер збірки

---

## Через PowerShell

```powershell
# Вся інформація про систему
Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, OsBuildNumber

# Тільки версія
(Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion").DisplayVersion

# Збірка
(Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion").CurrentBuild

# Повна інформація одним рядком
"Windows $((Get-WmiObject Win32_OperatingSystem).Caption) Build $((Get-WmiObject Win32_OperatingSystem).BuildNumber)"
```

---

## Через CMD

```cmd
winver
ver
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"
```

---

## Розшифровка версій Windows 11

| Версія | Назва | Дата виходу |
|--------|-------|------------|
| 21H2 | Перший реліз | Жовтень 2021 |
| 22H2 | Windows 11 2022 Update | Вересень 2022 |
| 23H2 | Windows 11 2023 Update | Жовтень 2023 |
| 24H2 | Windows 11 2024 Update | Жовтень 2024 |

---

## Перевірити чи встановлені останні оновлення

```powershell
# Останні встановлені оновлення
Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 5 HotFixID, Description, InstalledOn
```

---

## Резюме

Для швидкої перевірки: `Win + R` → `winver`. Для скриптів: `(Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion").DisplayVersion`. Версія у форматі 22H2/23H2 — це рік і пів року виходу.
