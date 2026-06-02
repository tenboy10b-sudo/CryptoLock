---
title: "Як створити і керувати спільними папками Windows через PowerShell"
date: "2026-06-03"
publishDate: "2026-06-03"
description: "Створення і управління мережевими папками Windows через PowerShell і GUI. Налаштування прав доступу, SMB параметрів і моніторинг підключень."
tags: ["windows", "мережа", "спільні-папки", "smb", "адміністрування", "powershell"]
readTime: 4
translatesEn: "how-to-configure-windows-network-shares"
---

Спільні мережеві папки дозволяють доступ до файлів з інших ПК. PowerShell дає повний контроль.

---

## Список спільних папок

```powershell
# Всі папки крім системних
Get-SmbShare | Where-Object {-not $_.Special} |
  Select-Object Name, Path, CurrentUsers

# Активні підключення
Get-SmbSession | Select-Object ClientComputerName, ClientUserName
```

---

## Створити спільну папку

```powershell
New-SmbShare -Name "SharedFiles" -Path "C:\Shared" `
  -ReadAccess "Domain\Users" `
  -FullAccess "Administrators"

# Прихована папка (не видна при перегляді)
New-SmbShare -Name "HiddenShare$" -Path "C:\Hidden" `
  -FullAccess "Administrators"
```

---

## Права доступу

```powershell
Get-SmbShareAccess -Name "SharedFiles"

Grant-SmbShareAccess -Name "SharedFiles" -AccountName "Domain\User" `
  -AccessRight Read -Force

Revoke-SmbShareAccess -Name "SharedFiles" -AccountName "Domain\User" -Force
```

---

## Безпека SMB

```powershell
# Вимкнути небезпечний SMB1
Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol -NoRestart

# Увімкнути підпис SMB
Set-SmbServerConfiguration -RequireSecuritySignature $true -Force
```

---

## Видалити папку

```powershell
Remove-SmbShare -Name "SharedFiles" -Force
```

---

## Часті питання

### Різниця між правами спільного доступу і NTFS?

Права спільного доступу — тільки для мережевого доступу. NTFS — для локального і мережевого. Рекомендація: спільний доступ = Full Control для всіх, обмеження тільки через NTFS.

### Як відкрити спільну папку з іншого ПК?

У Провіднику: `\\НазваСервера\НазваПапки` в адресному рядку. Або підключити як мережевий диск.

---

## Резюме

`New-SmbShare` для створення. `Grant/Revoke-SmbShareAccess` для прав. Вимикай SMB1. Моніторинг через `Get-SmbSession`. Права спільного доступу + NTFS — діє більш обмежувальне.
