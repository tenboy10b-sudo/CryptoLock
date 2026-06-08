---
title: "Windows Update: як оновити, вимкнути або виправити помилки оновлення"
date: "2026-06-08"
publishDate: "2026-08-04"
updated: "2026-06-08"
description: "Як оновити Windows 10 і 11, відкласти або повністю вимкнути автоматичні оновлення. Вирішення помилок Windows Update: 0x80070422, 0x8024402C, зависання на 0%."
tags: ["windows", "оновлення", "windows-update", "налаштування"]
readTime: 7
translatesEn: "windows-update-how-to-update-disable-fix-errors"
---

Windows Update — автоматичне оновлення системи. Іноді оновлення ламає щось що працювало, іноді завантаження зависає на 0%, іноді просто хочеш контролювати коли оновлюватись. Ось все що потрібно знати.

---

## Як оновити Windows вручну

```
Win + I → Windows Update → Перевірити наявність оновлень
```

Або через PowerShell:
```powershell
# Встановити модуль якщо немає
Install-Module PSWindowsUpdate -Force

# Перевірити доступні оновлення
Get-WindowsUpdate

# Встановити всі оновлення
Install-WindowsUpdate -AcceptAll -AutoReboot
```

---

## Як відкласти оновлення

### Windows 11 / Windows 10 Pro

```
Win + I → Windows Update → Додаткові параметри → Призупинити оновлення
```

Можна відкласти на 1–5 тижнів.

### Через реєстр (на будь-якій редакції)

```powershell
# Відкласти оновлення якості на 30 днів
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU" `
  -Name "DeferQualityUpdates" -Value 1

Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU" `
  -Name "DeferQualityUpdatesPeriodInDays" -Value 30
```

---

## Як вимкнути автоматичні оновлення

> ⚠️ Повне вимкнення оновлень — ризик безпеки. Рекомендую відкладати, а не вимикати.

### Спосіб 1 — Служба Windows Update

```powershell
# Зупинити і вимкнути службу
Stop-Service wuauserv
Set-Service wuauserv -StartupType Disabled

# Увімкнути назад
Set-Service wuauserv -StartupType Automatic
Start-Service wuauserv
```

### Спосіб 2 — Групова політика (Windows Pro/Enterprise)

```
Win + R → gpedit.msc
Конфігурація комп'ютера → Адміністративні шаблони → 
Компоненти Windows → Windows Update → 
"Налаштувати автоматичне оновлення" → Вимкнено
```

### Спосіб 3 — Metered Connection (лайфхак)

Позначити Wi-Fi як вимірюване підключення — Windows не завантажуватиме великі оновлення:

```
Win + I → Мережа та Інтернет → Wi-Fi → [назва мережі] → 
Вимірюване підключення → Увімкнути
```

---

## Вирішення помилок Windows Update

### Помилка 0x80070422 — служба не запущена

```powershell
# Запустити всі необхідні служби
$services = @('wuauserv','cryptsvc','bits','msiserver')
foreach ($s in $services) {
    Set-Service $s -StartupType Automatic
    Start-Service $s -ErrorAction SilentlyContinue
}
```

### Помилка 0x8024402C — немає підключення до сервера

```cmd
# Скинути налаштування проксі
netsh winhttp reset proxy

# Скинути Winsock
netsh winsock reset
netsh int ip reset

# Перезавантажити
shutdown /r /t 0
```

### Оновлення зависло на 0% або не встановлюється

```powershell
# Зупинити служби
Stop-Service wuauserv, bits, cryptsvc -Force

# Очистити кеш оновлень
Remove-Item C:\Windows\SoftwareDistribution\* -Recurse -Force
Remove-Item C:\Windows\System32\catroot2\* -Recurse -Force -ErrorAction SilentlyContinue

# Запустити служби
Start-Service wuauserv, bits, cryptsvc
```

Потім спробуй оновлення знову.

### Засіб усунення неполадок Windows Update

```cmd
# Автоматичне виправлення проблем з оновленням
msdt.exe /id WindowsUpdateDiagnostic
```

### Помилка 0x80073712 — пошкоджені компоненти

```cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
```

---

## Як відкотити проблемне оновлення

### Через журнал оновлень

```
Win + I → Windows Update → Журнал оновлень → Видалити оновлення
```

### Через PowerShell

```powershell
# Знайти нещодавні оновлення
Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object HotFixID, InstalledOn -First 10

# Видалити конкретне
wusa /uninstall /kb:5034441 /quiet /norestart
```

### Відкотити великий апгрейд (Feature Update)

Доступно 10 днів після встановлення:
```
Win + I → Система → Відновлення → Повернутись до попередньої версії
```

---

## Налаштування часу активності (щоб не перезавантажувало під час роботи)

```
Win + I → Windows Update → Додаткові параметри → Час активності
```

Встанови години коли ПК не повинен перезавантажуватись для оновлень.

```powershell
# Через реєстр — активний час з 8:00 до 22:00
$path = "HKLM:\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings"
Set-ItemProperty $path -Name "ActiveHoursStart" -Value 8
Set-ItemProperty $path -Name "ActiveHoursEnd" -Value 22
```

---

## Часті питання

### Чи обов'язково встановлювати всі оновлення?
Оновлення безпеки — так, бажано. Великі Feature Updates — можна відкласти на 1–3 місяці поки Microsoft не виправить баги.

### Чому оновлення займає так багато часу?
Великі оновлення (Feature Updates) можуть займати 1–2 години. Це нормально. Не вимикай ПК під час процесу.

### Що робити якщо після оновлення не запускається програма?
Перевір журнал подій:
```powershell
Get-EventLog -LogName Application -EntryType Error -Newest 20 |
  Select-Object TimeGenerated, Source, Message
```

---

## Резюме

| Задача | Рішення |
|--------|---------|
| Перевірити оновлення | Win+I → Windows Update |
| Відкласти на тиждень | Windows Update → Призупинити |
| Вимкнути автооновлення | Служба wuauserv → Disabled |
| Помилка 0x80070422 | Запустити служби wuauserv, bits |
| Оновлення зависло | Очистити SoftwareDistribution |
| Відкотити оновлення | Журнал оновлень → Видалити |
