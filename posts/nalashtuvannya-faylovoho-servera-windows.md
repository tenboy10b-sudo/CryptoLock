---
title: "Як налаштувати файловий сервер Windows з квотами і контролем доступу"
date: "2026-07-26"
publishDate: "2026-07-26"
description: "Налаштування файлового сервера Windows з правами NTFS, спільним доступом, дисковими квотами, DFS просторами імен і блокуванням типів файлів через FSRM."
tags: ["windows", "файловий-сервер", "ntfs", "shares", "адміністрування", "powershell"]
readTime: 5
translatesEn: "how-to-configure-windows-file-server"
---

Правильно налаштований файловий сервер контролює доступ, обмежує місце і аудитує активність.

---

## Встановити роль файлового сервера

```powershell
Install-WindowsFeature FS-FileServer, FS-Resource-Manager -IncludeManagementTools
Start-Service SrmSvc
```

---

## Налаштувати спільний доступ з правами

Рекомендація: Спільний доступ = Full Control для Authenticated Users, обмеження через NTFS.

```powershell
$sharePath = "D:\Shares\Finance"
New-Item $sharePath -ItemType Directory -Force
New-SmbShare -Name "Finance" -Path $sharePath -FullAccess "Authenticated Users"

# NTFS права (тут реальне обмеження)
$acl = Get-Acl $sharePath
$acl.SetAccessRuleProtection($true, $false)
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
  "DOMAIN\Finance-Users", "Modify", "ContainerInherit,ObjectInherit", "None", "Allow"
)
$acl.AddAccessRule($rule)
Set-Acl $sharePath $acl
```

---

## Дискові квоти (FSRM)

```powershell
# М'яка квота (попередження)
New-FsrmQuotaTemplate -Name "10GB Попередження" -Size 10GB -SoftLimit $true
New-FsrmQuota -Path "D:\Shares\Finance" -Template "10GB Попередження"

# Переглянути використання
Get-FsrmQuota | Select-Object Path,
  @{n='ВикористаноГБ';e={[math]::Round($_.Usage/1GB,2)}},
  @{n='Використано%';e={[math]::Round($_.Usage/$_.Size*100)}}
```

---

## Блокування типів файлів

```powershell
New-FsrmFileScreenTemplate -Name "Блокування EXE і медіа" `
  -IncludeGroup @("Executable Files", "Audio and Video Files")

New-FsrmFileScreen -Path "D:\Shares\Finance" -Template "Блокування EXE і медіа"
```

---

## DFS простір імен

```powershell
Install-WindowsFeature FS-DFS-Namespace -IncludeManagementTools

New-DfsnRoot -Path "\\domain.com\Shares" -Type DomainV2 `
  -TargetPath "\\FileServer1\Shares"

New-DfsnFolder -Path "\\domain.com\Shares\Finance" -TargetPath "\\FileServer1\Finance"
```

---

## Часті питання

### Спільний доступ чи NTFS для контролю?

Обидва, але покладайся на NTFS. Встанови спільний доступ на Full Control для Authenticated Users і контролюй все через NTFS. Так права діють і локально і по мережі.

### Коли використовувати DFS замість звичайного Share?

DFS коли: кілька файлових серверів, аварійне відновлення, об'єднання шерів з кількох серверів під один простір імен.

---

## Резюме

FS-FileServer + FS-Resource-Manager. Share = Full Control, обмеження через NTFS. FSRM квоти. Блокування типів файлів. DFS для прозорого доступу. Аудит видалень через журнал безпеки.
