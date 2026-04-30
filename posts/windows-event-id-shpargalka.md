---
title: "Важливі Event ID Windows: шпаргалка для адміністратора"
date: "2026-09-19"
publishDate: "2026-09-19"
description: "Найважливіші коди подій Windows Event Log для безпеки і адміністрування: входи, блокування, зміна груп, аудит і PowerShell команди для їх пошуку."
tags: ["адміністрування", "безпека", "windows", "powershell", "моніторинг"]
readTime: 6
---

Event ID — унікальний код кожного типу події в Windows Event Log. Знаючи потрібні коди можна швидко знайти що відбулось у системі.

---

## Безпека — Security Log

| Event ID | Подія |
|----------|-------|
| 4624 | Успішний вхід |
| 4625 | Невдала спроба входу |
| 4634 | Вихід з системи |
| 4647 | Ініційований вихід |
| 4648 | Вхід з явними credentials |
| 4672 | Вхід з привілеями адміна |
| 4720 | Створено акаунт користувача |
| 4722 | Акаунт розблокований |
| 4723 | Зміна пароля (самостійно) |
| 4724 | Зміна пароля адміном |
| 4725 | Акаунт вимкнено |
| 4726 | Акаунт видалено |
| 4728 | Додано в глобальну групу |
| 4732 | Додано в локальну групу |
| 4740 | Акаунт заблоковано |
| 4756 | Додано в Universal групу |
| 4771 | Kerberos pre-auth failed |
| 4776 | NTLM автентифікація |

---

## Система — System Log

| Event ID | Подія |
|----------|-------|
| 6005 | Служба EventLog запустилась (старт ОС) |
| 6006 | Служба EventLog зупинилась (коректне вимкнення) |
| 6008 | Некоректне завершення роботи |
| 41 | Система перезавантажилась без коректного вимкнення |
| 1074 | Ініційоване вимкнення або перезавантаження |
| 7036 | Служба змінила стан |
| 7040 | Тип запуску служби змінено |

---

## PowerShell — PowerShell/Operational

| Event ID | Подія |
|----------|-------|
| 4103 | Виконання модуля (Module Logging) |
| 4104 | ScriptBlock виконання |
| 400 | Запуск PowerShell сесії |
| 403 | Завершення PowerShell сесії |

---

## Практичні запити

```powershell
# Невдалі входи за останню добу
Get-WinEvent -FilterHashtable @{
    LogName = 'Security'; Id = 4625
    StartTime = (Get-Date).AddHours(-24)
} | Select-Object TimeCreated,
    @{N="Account";E={$_.Properties[5].Value}},
    @{N="IP";E={$_.Properties[19].Value}} |
  Format-Table -AutoSize

# Заблоковані акаунти
Get-WinEvent -FilterHashtable @{
    LogName = 'Security'; Id = 4740
    StartTime = (Get-Date).AddDays(-7)
} | Select-Object TimeCreated, Message

# Хто коли входив успішно
Get-WinEvent -FilterHashtable @{
    LogName = 'Security'; Id = 4624
    StartTime = (Get-Date).Date
} | Where-Object { $_.Properties[5].Value -notmatch 'SYSTEM|LOCAL|ANONYMOUS' } |
  Select-Object TimeCreated,
    @{N="User";E={$_.Properties[5].Value}},
    @{N="LogonType";E={$_.Properties[8].Value}} |
  Format-Table -AutoSize

# Некоректні вимкнення за останній місяць
Get-WinEvent -FilterHashtable @{
    LogName = 'System'; Id = 41, 6008
    StartTime = (Get-Date).AddDays(-30)
} | Select-Object TimeCreated, Id, Message | Format-List

# Зміни в групах AD/локальних
Get-WinEvent -FilterHashtable @{
    LogName = 'Security'; Id = 4728, 4732, 4756
    StartTime = (Get-Date).AddDays(-7)
} | Select-Object TimeCreated, Message
```

---

## Налаштувати алерт на конкретний Event ID

```powershell
# Задача що виконується при появі Event ID 4740 (блокування акаунту)
$trigger = New-ScheduledTaskTrigger -AtStartup  # або через Event trigger

# Через wevtutil підписка
wevtutil ss /c:C:\EventSubscription.xml

# Або простіше — через Event Viewer:
# Знайди подію → правою → "Прив'язати задачу до цієї події"
```

---

## Логонтип (Logon Type) для 4624

| Тип | Значення |
|-----|---------|
| 2 | Інтерактивний (фізичний вхід) |
| 3 | Мережевий (наприклад net use) |
| 4 | Batch (планувальник) |
| 5 | Служба |
| 7 | Розблокування екрану |
| 10 | Remote Interactive (RDP) |
| 11 | Cached credentials |

---

## Підсумок

4624/4625 — входи. 4740 — блокування. 41/6008 — аварійні вимкнення. 4728/4732 — зміни груп. `Get-WinEvent -FilterHashtable @{LogName='Security'; Id=XXXX}` — найшвидший спосіб знайти потрібні події.
