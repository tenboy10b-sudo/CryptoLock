---
title: "PnPUtil: управління драйверами Windows з командного рядка"
date: "2026-05-10"
publishDate: "2026-05-10"
description: "Як використовувати PnPUtil для встановлення, видалення і перегляду драйверів Windows: importer, export і усунення конфліктів через командний рядок."
tags: ["windows", "драйвери", "cmd", "адміністрування", "інструменти"]
readTime: 4
---

PnPUtil — вбудована утиліта Windows для управління драйверами без GUI. Корисна для адміністраторів і при розгортанні.

---

## Основні команди

```cmd
rem Список всіх встановлених драйверів у сховищі
pnputil /enum-drivers

rem Додати драйвер у сховище
pnputil /add-driver "C:\Drivers\printer.inf"

rem Додати і встановити
pnputil /add-driver "C:\Drivers\printer.inf" /install

rem Видалити драйвер зі сховища
pnputil /delete-driver oem5.inf

rem Видалити примусово (навіть якщо використовується)
pnputil /delete-driver oem5.inf /force

rem Список підключених пристроїв
pnputil /enum-devices

rem Оновити конкретний пристрій
pnputil /scan-devices
```

---

## Через PowerShell

```powershell
# Список встановлених INF пакетів
Get-WindowsDriver -Online | Select-Object Driver, OriginalFileName, Version, Date

# Додати драйвер
Add-WindowsDriver -Online -Driver "C:\Drivers\network.inf"

# Видалити драйвер
Remove-WindowsDriver -Online -Driver "oem5.inf"

# Експортувати всі драйвери
Export-WindowsDriver -Online -Destination "C:\DriversBackup"
```

---

## Підсумок

`pnputil /add-driver file.inf /install` — встановити драйвер. `pnputil /enum-drivers` — переглянути всі. `Export-WindowsDriver` — зберегти всі драйвери перед переустановкою системи.
