---
title: "Управління службами Windows: запуск, зупинка і налаштування"
date: "2026-05-16"
publishDate: "2026-05-16"
description: "Як запускати, зупиняти і налаштовувати служби Windows через services.msc і PowerShell. Які служби можна безпечно вимкнути і як виправити помилки служб."
tags: ["windows", "служби", "адміністрування", "powershell", "оптимізація"]
readTime: 5
translatesEn: "how-to-manage-windows-services"
---

Windows запускає десятки фонових служб. Управління ними допомагає виправляти помилки, прискорювати систему і підвищувати безпеку.

---

## Відкрити менеджер служб

`Win + R` → `services.msc`

---

## Запустити, зупинити, перезапустити службу

**Через GUI:** ПКМ на службі → Запустити / Зупинити / Перезапустити

**PowerShell:**

```powershell
# Запустити
Start-Service -Name "wuauserv"    # Windows Update
Start-Service -Name "Spooler"     # Диспетчер друку

# Зупинити
Stop-Service -Name "wuauserv" -Force

# Перезапустити
Restart-Service -Name "wuauserv" -Force

# Перевірити статус
Get-Service "wuauserv" | Select-Object Name, Status, StartType
```

---

## Змінити тип запуску

```powershell
# Автоматично — запускається разом з Windows
Set-Service -Name "wuauserv" -StartupType Automatic

# Вручну — тільки коли потрібно
Set-Service -Name "Fax" -StartupType Manual

# Вимкнено — ніколи не запускається
Set-Service -Name "RemoteRegistry" -StartupType Disabled
```

---

## Служби які можна безпечно вимкнути на домашньому ПК

```powershell
$toDisable = @(
  "Fax",            # Факс
  "RemoteRegistry", # Реєстр (ризик безпеки)
  "XblGameSave",    # Xbox Game Save
  "XblAuthManager", # Xbox Auth
  "XboxNetApiSvc",  # Xbox Network
  "lfsvc",          # Геолокація
  "MapsBroker"      # Карти
)

foreach ($svc in $toDisable) {
  Stop-Service $svc -Force -EA 0
  Set-Service $svc -StartupType Disabled -EA 0
  Write-Host "Вимкнено: $svc"
}
```

---

## Переглянути всі служби

```powershell
# Всі служби за статусом
Get-Service | Sort-Object Status -Descending | Format-Table Name, Status, StartType

# Автозапуск служби що не запущені (потенційна проблема)
Get-Service | Where-Object {$_.Status -eq "Stopped" -and $_.StartType -eq "Automatic"} |
  Select-Object Name, DisplayName
```

---

## Виправити помилку "Службу не вдалося запустити"

```powershell
# Перевірити журнал помилок служб
Get-WinEvent -FilterHashtable @{LogName='System'; Level=1,2} -MaxEvents 20 |
  Where-Object {$_.Message -like "*служб*" -or $_.Message -like "*service*"} |
  Select-Object TimeCreated, Message | Format-List
```

Типові виправлення:
- `sfc /scannow` — відновлює пошкоджені файли служб
- `DISM /Online /Cleanup-Image /RestoreHealth` — відновлює образ Windows

---

## Часті питання

### Як дізнатись яка служба гальмує завантаження?

`Win + R` → `msconfig` → **Служби** → поклич запуск з увімкненими і вимкненими службами по черзі для ізоляції проблемної.

### Чи безпечно вимикати служби Windows?

Вимикай тільки з таблиці вище або якщо точно знаєш що служба не потрібна. Невірне вимкнення може зламати функції Windows.

### Що робити якщо служба постійно падає?

Перевір Event Viewer (eventvwr.msc) → Windows Logs → System → знайди помилки з ім'ям служби. Зазвичай причина — пошкоджений файл або конфлікт залежностей.

---

## Резюме

`services.msc` для GUI. `Get-Service` і `Set-Service` в PowerShell. Безпечно вимикати: Fax, RemoteRegistry, Xbox служби. При помилках — перевір Event Viewer і запусти `sfc /scannow`.
