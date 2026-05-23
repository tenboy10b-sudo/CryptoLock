---
title: "Синій екран смерті Windows 11 після оновлення: як виправити у 2025-2026"
date: "2026-05-22"
publishDate: "2026-05-22"
description: "Windows 11 24H2 показує синій екран після оновлення KB5055523 або KB5053656? Покрокове виправлення BSOD: 0x18B, SECURE_KERNEL_ERROR, UNSUPPORTED_PROCESSOR та інших."
tags: ["windows", "bsod", "помилки", "windows-11", "відновлення"]
readTime: 7
---

Оновлення Windows 11 24H2 за березень-квітень 2026 року спричинили хвилю BSOD на мільйонах ПК. Microsoft визнала проблему і випустила екстрений патч — але не всі отримали його автоматично. Ось що робити прямо зараз.

---

## Які BSOD найчастіше виникають після оновлень 2025-2026

| Код помилки | Назва | Причина |
|-------------|-------|---------|
| `0x0000018B` | SECURE_KERNEL_ERROR | Конфлікт оновлень KB5053656 / KB5055523 |
| `0x000000C5` | DRIVER_CORRUPTED_EXPOOL | Пошкоджений драйвер після оновлення |
| `0xC000021A` | SYSTEM_PROCESS_TERMINATED | Критичний системний процес впав |
| `0x0000007E` | SYSTEM_THREAD_EXCEPTION | Несумісний драйвер |
| `UNSUPPORTED_PROCESSOR` | — | Конфлікт з материнськими платами MSI/Intel |

---

## Крок 1: Перевір чи є для тебе Known Issue Rollback

Microsoft випустила KIR (Known Issue Rollback) — автоматичний відкат проблемного оновлення. Він застосовується сам, але може зайняти до 24 годин.

```powershell
# Перевір версію і дату останнього оновлення
(Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion").DisplayVersion
Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 3 HotFixID, InstalledOn
```

Якщо ПК взагалі не завантажується — переходь одразу до Кроку 3.

---

## Крок 2: Видалити проблемне оновлення (якщо Windows завантажується)

```powershell
# Переглянути останні оновлення
Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 5 HotFixID, InstalledOn

# Видалити конкретне оновлення (замінити KB-номер)
wusa /uninstall /kb:5055523 /quiet /norestart

# Або через Settings
# Win+I → Windows Update → Update history → Uninstall updates
```

Після видалення перезавантаж і перевір стабільність.

---

## Крок 3: Якщо Windows не завантажується — Recovery Mode

**При старті ПК натискай F8 або перервати завантаження 3 рази підряд.**

Автоматичне відновлення → **Усунення несправностей** → **Розширені параметри**:

### Варіант А: Видалити оновлення через Recovery
**Uninstall Updates** → **Uninstall latest quality update**

### Варіант Б: Відновлення системи
**System Restore** → вибери точку до появи BSOD

### Варіант В: Безпечний режим
**Startup Settings** → F4 (Safe Mode) або F5 (Safe Mode with Networking)

В безпечному режимі:
```powershell
# Видалити оновлення в безпечному режимі
dism /image:C:\ /get-packages | findstr KB5055523
dism /image:C:\ /remove-package /packagename:Package_for_RollupFix~...
```

---

## Крок 4: Відновити системні файли

```powershell
# Запусти від адміністратора після завантаження
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
```

Перезавантаж після завершення.

---

## Крок 5: Оновити або відкотити драйвери

BSOD часто спричинені конфліктом оновлення з драйвером відеокарти або чіпсета:

```powershell
# Знайти проблемні драйвери
Get-WinEvent -FilterHashtable @{LogName='System'; Id=7034,7023} -MaxEvents 10 |
  Select-Object TimeCreated, Message

# Перевірити Device Manager на помилки
Get-PnpDevice | Where-Object {$_.Status -ne 'OK'} | Select-Object Name, Status, Class
```

**NVIDIA/AMD**: завантаж останній драйвер з сайту виробника (не через Windows Update).

**MSI материнські плати** + Intel 12/13 Gen: оновити BIOS до останньої версії з сайту MSI.

---

## Крок 6: Аналіз файлу дампу (для досвідчених)

Windows зберігає файл дампу при BSOD:

```powershell
# Знайти файли мінідампу
Get-ChildItem "C:\Windows\Minidump" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 5

# Переглянути тип BSOD з логів
Get-WinEvent -FilterHashtable @{LogName='System'; Id=41} -MaxEvents 3 |
  Select-Object TimeCreated, @{n='BugCheckCode';e={$_.Properties[0].Value}}
```

Event ID 41 → BugCheckCode 0x18B = підтверджений SECURE_KERNEL_ERROR від оновлення.

---

## Крок 7: Якщо нічого не допомогло — Reset Windows

```powershell
# Через PowerShell (якщо доступний)
systemreset --factoryreset
```

Або: **Win+I → Система → Відновлення → Скинути ПК → Cloud download**

Cloud download завантажить чистий образ від Microsoft — гарантовано без проблем від оновлення.

---

## 🔍 Не знаєш що означає твій код помилки?

**[→ Декодер помилок Windows](/tools/windows-error-decoder)** — введи код BSOD (наприклад `0x0000018B` або `0xC000021A`) і дізнайся що він означає та покрокове виправлення.

---

## Як запобігти в майбутньому

```powershell
# Відкласти оновлення на 14 днів (дати час виявити баги)
$path = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU"
New-Item -Path $path -Force | Out-Null
Set-ItemProperty -Path $path -Name "DeferQualityUpdatesPeriodInDays" -Value 14 -Type DWord

# Або через Settings:
# Win+I → Windows Update → Advanced options → Pause updates
```

---

## Резюме

**Якщо Windows завантажується:** видали проблемне оновлення через `wusa /uninstall /kb:НОМЕР`. **Якщо ні:** Recovery Mode → Uninstall latest quality update. Після відновлення: `DISM /RestoreHealth` + `sfc /scannow`. Код помилки невідомий — [Декодер помилок](/tools/windows-error-decoder).
