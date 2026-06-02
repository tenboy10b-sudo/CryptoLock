---
title: "Як виправити помилки Print Spooler і проблеми з друком в Windows"
date: "2026-06-15"
publishDate: "2026-06-15"
description: "Виправлення помилок Print Spooler Windows: служба не запускається, зависаючі завдання, падіння спулера. Очищення черги, перезапуск і перевстановлення драйверів."
tags: ["windows", "принтер", "spooler", "помилки", "відновлення"]
readTime: 4
translatesEn: "how-to-fix-windows-print-spooler"
---

Print Spooler керує чергою друку. Якщо він падає або зависає — нічого не друкується. Ось як виправити кожен варіант.

---

## Перевірити статус

```powershell
Get-Service Spooler | Select-Object Name, Status, StartType
```

---

## Виправлення 1: Перезапустити Spooler

```powershell
Restart-Service Spooler -Force
```

---

## Виправлення 2: Очистити зависаючу чергу

```powershell
Stop-Service Spooler -Force
Start-Sleep 2
Remove-Item "C:\Windows\System32\spool\PRINTERS\*" -Force -EA 0
Start-Service Spooler
Write-Host "Черга очищена і Spooler перезапущено"
```

---

## Виправлення 3: Spooler постійно падає

```powershell
# Перевірити на пошкоджені файли
sfc /scannow

# Видалити всі сторонні драйвери
Get-PrinterDriver | Where-Object {$_.Manufacturer -ne "Microsoft"} |
  ForEach-Object { Remove-PrinterDriver -Name $_.Name -EA 0 }

Restart-Service Spooler -Force
```

---

## Автоперезапуск при збої

```powershell
sc.exe failure Spooler reset= 86400 actions= restart/5000/restart/5000/restart/5000
```

---

## Часті питання

### Spooler постійно падає щодня — як вирішити назавжди?

Зазвичай пошкоджений сторонній драйвер принтера. Видали всі не-Microsoft драйвери (скрипт вище), перезавантажся і перевстанови тільки потрібні з офіційного сайту виробника.

### Очистив чергу але вона знову наповнилась?

Застосунок продовжує надсилати завдання друку. Перевір всі відкриті застосунки — Office, PDF переглядачі, браузери — на відкриті діалоги друку.

---

## Резюме

Зависла черга: зупини Spooler → видали PRINTERS → запусти. Падіння: перевір журнал на помилки spoolsv.exe, видали пошкоджені драйвери. Автоперезапуск через `sc.exe failure`. Перевстановлення драйверів для постійного виправлення.
