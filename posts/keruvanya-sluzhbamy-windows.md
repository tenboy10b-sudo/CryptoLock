---
title: "Як керувати службами Windows через CMD і PowerShell"
date: "2026-04-06"
description: "Запуск, зупинка, перезапуск і зміна типу запуску служб Windows через sc, net start і PowerShell. Корисні служби для вимкнення."
tags: ["cmd", "powershell", "інструменти", "оптимізація"]
readTime: 5
---

Служби Windows — фонові процеси які завантажуються разом з системою. Вимкнення непотрібних зменшує завантаження RAM і прискорює старт.

## Переглянути всі служби

```cmd
sc query type= all state= all
```

Або коротший варіант:
```cmd
net start
```
Показує тільки запущені служби.

---

## Основні команди sc

```cmd
sc start "ServiceName"       — запустити
sc stop "ServiceName"        — зупинити
sc query "ServiceName"       — статус
sc config "ServiceName" start= auto      — автоматичний старт
sc config "ServiceName" start= demand    — вручну
sc config "ServiceName" start= disabled  — вимкнено
```

> Увага: між `start=` і значенням обов'язково є пробіл.

---

## Через net start / net stop

```cmd
net start wuauserv        — запустити Windows Update
net stop wuauserv         — зупинити Windows Update
```

Простіший синтаксис але менше можливостей ніж sc.

---

## Через PowerShell

```powershell
# Список всіх служб
Get-Service | Select-Object Name, DisplayName, Status, StartType

# Запущені служби
Get-Service | Where-Object {$_.Status -eq "Running"}

# Зупинити службу
Stop-Service -Name "wuauserv" -Force

# Запустити
Start-Service -Name "wuauserv"

# Перезапустити
Restart-Service -Name "Spooler"

# Змінити тип запуску
Set-Service -Name "wuauserv" -StartupType Disabled
```

---

## Служби які можна безпечно вимкнути

| Служба | Ім'я | Що вимкнути |
|---|---|---|
| Факс | Fax | Якщо не використовуєш факс |
| Служба дистанційного реєстру | RemoteRegistry | Для більшості домашніх ПК |
| Маршрутизація і віддалений доступ | RemoteAccess | Якщо не налаштовуєш маршрутизатор |
| Windows Search | WSearch | Якщо не потрібен пошук |
| SysMain (Superfetch) | SysMain | На SSD-дисках |
| Диспетчер друку | Spooler | Якщо немає принтера |
| Xbox Live | XblAuthManager, XblGameSave | Якщо не граєш у Xbox |

---

## Знайти службу по опису

```powershell
Get-Service | Where-Object {$_.DisplayName -like "*Update*"} | Select-Object Name, DisplayName, Status
```

---

## Перезапустити зависшу службу автоматично

Через sc можна налаштувати автоматичний перезапуск при збої:

```cmd
sc failure "Spooler" reset= 60 actions= restart/5000/restart/10000/restart/30000
```

- `reset= 60` — скидати лічильник через 60 секунд
- `actions= restart/5000` — перезапустити через 5 секунд після збою

---

## Відновити стандартні налаштування служби

Якщо після змін щось пішло не так:

```cmd
sc config "ServiceName" start= demand
sc start "ServiceName"
```

Або через `services.msc` встанови стандартний тип запуску вручну.
