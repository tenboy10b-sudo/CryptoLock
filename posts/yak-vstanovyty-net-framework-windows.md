---
title: "Як встановити .NET Framework 3.5 і .NET 8 на Windows 10 і 11"
date: "2026-06-16"
publishDate: "2026-06-16"
description: "Встановлення .NET Framework 3.5 і сучасного .NET 6/7/8 на Windows. Виправлення помилок встановлення, перевірка версій і відновлення пошкодженого .NET."
tags: ["windows", "dotnet", "помилки", "встановлення", "адміністрування"]
readTime: 4
translatesEn: "how-to-install-net-framework-windows"
---

Багато застосунків і ігор вимагають .NET Framework або сучасний .NET. Ось як встановити будь-яку версію.

---

## Перевірити встановлені версії

```powershell
# .NET Framework
Get-ChildItem "HKLM:\SOFTWARE\Microsoft\NET Framework Setup\NDP" -Recurse |
  Get-ItemProperty -Name Version -EA 0 |
  Where-Object {$_.PSChildName -match "^(?!S)\p{L}"} |
  Select-Object PSChildName, Version

# Сучасний .NET
dotnet --list-runtimes
dotnet --version
```

---

## Встановити .NET Framework 3.5

```powershell
# Через Windows Features
Enable-WindowsOptionalFeature -Online -FeatureName "NetFx3" -All

# Через DISM
DISM /Online /Enable-Feature /FeatureName:NetFx3 /All
```

---

## Встановити .NET 3.5 без інтернету

```cmd
rem Підключи ISO Windows і запусти (замінити D: на букву диску)
DISM /Online /Enable-Feature /FeatureName:NetFx3 /All /LimitAccess /Source:D:\sources\sxs
```

---

## Встановити сучасний .NET (6, 8, 9)

```powershell
winget install Microsoft.DotNet.Runtime.8
winget install Microsoft.DotNet.DesktopRuntime.8  # для WinForms/WPF
winget install Microsoft.DotNet.SDK.8              # для розробки
```

---

## Виправити помилки встановлення

```powershell
# Помилка 0x800F0954 — не може завантажити
DISM /Online /Enable-Feature /FeatureName:NetFx3 /All /LimitAccess /Source:C:\Windows\WinSxS

# Помилка 0x80070643 — загальна помилка
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
# Потім повторити встановлення
```

---

## Часті питання

### Який .NET потрібен: 3.5, 4.8 чи .NET 8?

Старі застосунки (до 2015): зазвичай .NET Framework 3.5 або 4.x. Windows поставляється з 4.8. Сучасні вказують версію в повідомленні про помилку.

### Помилка "Для цього застосунку потрібен .NET X.X"?

Завантаж точну версію з dotnet.microsoft.com/download. Для 3.5 — використай Windows Features (optionalfeatures).

---

## Резюме

Версії: `dotnet --list-runtimes` і реєстр. .NET 3.5: `Enable-WindowsOptionalFeature` або DISM. Сучасний .NET: winget. Помилка 0x800F0954: `/Source:D:\sources\sxs`. Відновлення: DISM + SFC.
