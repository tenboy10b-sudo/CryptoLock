---
title: "Як керувати оновленнями Windows: відкласти, вибрати або вимкнути"
date: "2026-08-04"
publishDate: "2026-08-04"
description: "Управління оновленнями Windows 10 і 11: як відкласти оновлення, вибрати час встановлення, вимкнути автоматичне перезавантаження і налаштувати через GPO."
tags: ["windows", "оновлення", "windows-update", "налаштування", "адміністрування"]
readTime: 5
---

Windows Update перезавантажує ПК в невідповідний момент або встановлює оновлення без попередження? Ось як взяти контроль в свої руки.

---

## Налаштувати активні години

Активні години — час коли Windows не буде перезавантажувати ПК для оновлень.

`Параметри` → `Windows Update` → `Додаткові параметри` → **Активні години**:
- Вибери діапазон часу коли ти за ПК (наприклад 8:00–23:00)
- Windows буде встановлювати оновлення поза цим часом

---

## Відкласти оновлення

`Параметри` → `Windows Update` → `Додаткові параметри`:
- **Призупинити оновлення** → вибери до якої дати (максимум 5 тижнів)

Або через PowerShell:

```powershell
# Призупинити оновлення на 2 тижні
$pauseDate = (Get-Date).AddDays(14).ToString("yyyy-MM-ddTHH:mm:ssZ")
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings" `
  -Name "PauseUpdatesExpiryTime" -Value $pauseDate -Type String
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings" `
  -Name "PauseFeatureUpdatesStartTime" -Value (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ") -Type String
```

---

## Вибрати що встановлювати

`Параметри` → `Windows Update` → `Додаткові параметри`:
- **Отримувати оновлення для інших продуктів Microsoft** → увімкни щоб оновлювався Office
- **Завантажувати оновлення через обмежені підключення** → вимкни для економії трафіку

---

## Вимкнути автоматичне перезавантаження

```powershell
# Через реєстр — не перезавантажуватись автоматично якщо є активні користувачі
$wuPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU"
New-Item $wuPath -Force | Out-Null
Set-ItemProperty $wuPath -Name "NoAutoRebootWithLoggedOnUsers" -Value 1 -Type DWord
Set-ItemProperty $wuPath -Name "AUPowerManagement" -Value 0 -Type DWord
```

---

## Зупинити службу Windows Update тимчасово

```powershell
# Зупинити і вимкнути (тимчасово, наприклад на час важливої роботи)
Stop-Service -Name wuauserv -Force
Set-Service -Name wuauserv -StartupType Disabled

# Повернути назад
Set-Service -Name wuauserv -StartupType Automatic
Start-Service -Name wuauserv
```

---

## Налаштування через GPO (для організацій)

`gpedit.msc` → **Computer Configuration** → **Administrative Templates** → **Windows Components** → **Windows Update** → **Manage end user experience**:

- **Configure Automatic Updates** → Enabled → вибери:
  - `2` — Notify before download
  - `3` — Auto download, notify before install
  - `4` — Auto download and schedule (вкажи день і час)
  - `5` — Allow local admin to control

- **No auto-restart with logged on users** → Enabled — не перезавантажувати якщо є активні користувачі

---

## Перевірити і встановити конкретне оновлення вручну

```powershell
# Список доступних оновлень
$updateSession = New-Object -ComObject Microsoft.Update.Session
$updateSearcher = $updateSession.CreateUpdateSearcher()
$updates = $updateSearcher.Search("IsInstalled=0")
$updates.Updates | Select-Object Title, MsrcSeverity

# Встановити конкретне оновлення за KB номером
# Завантаж з catalog.update.microsoft.com
# Або через PSWindowsUpdate модуль:
Install-Module PSWindowsUpdate -Force
Get-WUInstall -KBArticleID "KB5034441" -AcceptAll
```

---

## Переглянути журнал встановлених оновлень

`Параметри` → `Windows Update` → `Переглянути журнал оновлень`

```powershell
# Через PowerShell
Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 20 HotFixID, Description, InstalledOn
```

---

## Видалити проблемне оновлення

`Параметри` → `Windows Update` → `Переглянути журнал оновлень` → **Видалити оновлення** → знайди і видали.

```cmd
rem Через командний рядок
wusa /uninstall /kb:5034441 /quiet /norestart
```

---

## Підсумок

Налаштуй **Активні години** щоб Windows не перезавантажувалась в робочий час — це найважливіше. **Призупини оновлення** якщо потрібно стабільне середовище. Для організацій — GPO з `Configure Automatic Updates = 4` і фіксованим розкладом (наприклад вівторок о 3:00 ночі після Microsoft Patch Tuesday).
