---
title: "Захист від програм-вимагачів: Controlled Folder Access в Windows"
date: "2026-07-01"
publishDate: "2026-07-01"
description: "Увімкнення і налаштування Controlled Folder Access для захисту від ransomware. Дозвіл довірених застосунків, захищені папки і моніторинг заблокованих спроб."
tags: ["windows", "windows-defender", "ransomware", "безпека", "powershell"]
readTime: 4
translatesEn: "how-to-configure-windows-defender-exclusion-paths"
---

Controlled Folder Access блокує неавторизованим застосункам зміну захищених папок — головний захист від шифрування файлів ransomware.

---

## Увімкнути

```powershell
Set-MpPreference -EnableControlledFolderAccess Enabled

# Перевірити (1 = увімкнено, 2 = аудит)
(Get-MpPreference).EnableControlledFolderAccess
```

Або: **Безпека Windows** → **Захист від вірусів** → **Захист від програм-вимагачів** → **Контрольований доступ до папок**

---

## Режим аудиту (тест без блокування)

```powershell
Set-MpPreference -EnableControlledFolderAccess AuditMode
```

Запусти на тиждень, перевір що блокується, потім увімкни повністю.

---

## Додати захищені папки

```powershell
Add-MpPreference -ControlledFolderAccessProtectedFolders "C:\Projects"
Add-MpPreference -ControlledFolderAccessProtectedFolders "D:\Work\Contracts"

(Get-MpPreference).ControlledFolderAccessProtectedFolders
```

---

## Дозволити довірені застосунки

```powershell
Add-MpPreference -ControlledFolderAccessAllowedApplications "C:\Program Files\MyApp\app.exe"

(Get-MpPreference).ControlledFolderAccessAllowedApplications
```

---

## Моніторинг заблокованих спроб

```powershell
# Event ID 1123 = заблоковано, 1124 = аудит
Get-WinEvent -FilterHashtable @{
  LogName='Microsoft-Windows-Windows Defender/Operational'; Id=1123,1124
} -MaxEvents 20 -EA 0 |
  Select-Object TimeCreated, @{n='App';e={$_.Properties[1].Value}},
    @{n='Folder';e={$_.Properties[2].Value}}
```

---

## Часті питання

### Застосунок перестав працювати після увімкнення — як виправити?

Додай до дозволених: `Add-MpPreference -ControlledFolderAccessAllowedApplications "C:\Path\App.exe"`. Перевір Event 1123 для підтвердження.

### CFA захищає зовнішні диски і NAS?

Переважно локальні папки. Мережеві ресурси можна додати вручну але захист може бути обмеженим. Для NAS — увімкни версіонування безпосередньо на пристрої.

---

## Резюме

`Set-MpPreference -EnableControlledFolderAccess Enabled`. Починай з режиму аудиту. Додавай папки через `Add-MpPreference`. Дозволяй довірені застосунки. Моніторинг Event 1123.
