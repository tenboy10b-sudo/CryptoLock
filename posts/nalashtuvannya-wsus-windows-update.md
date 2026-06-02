---
title: "Як налаштувати WSUS для централізованого управління оновленнями Windows"
date: "2026-07-24"
publishDate: "2026-07-24"
description: "Встановлення і налаштування WSUS для контролю оновлень Windows в мережі. Конфігурація клієнтів, затвердження оновлень і вирішення проблем синхронізації."
tags: ["windows", "wsus", "windows-update", "адміністрування", "powershell"]
readTime: 5
translatesEn: "how-to-configure-windows-update-wsus"
---

WSUS дозволяє контролювати які оновлення розгортаються на яких ПК — економить трафік і запобігає проблемним патчам.

---

## Встановити WSUS

```powershell
Install-WindowsFeature UpdateServices -IncludeManagementTools

# Конфігурація після встановлення
& "C:\Program Files\Update Services\Tools\wsusutil.exe" postinstall `
  CONTENT_DIR="D:\WSUS"
```

---

## Налаштування клієнтів через GPO

`gpedit.msc` → `Конфігурація комп'ютера` → `Windows Update`

- **Вказати інтранет-розташування служби оновлень** → `http://WSUSServer:8530`
- **Настроїти автоматичне оновлення** → 4
- **Увімкнути клієнтське визначення цільового призначення** → назва групи

```powershell
# Або через реєстр
$wuPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate"
New-Item -Path "$wuPath\AU" -Force | Out-Null
Set-ItemProperty "$wuPath\AU" -Name "UseWUServer" -Value 1 -Type DWord
Set-ItemProperty $wuPath -Name "WUServer" -Value "http://WSUSServer:8530"
Restart-Service wuauserv -Force
```

---

## Затвердити або відхилити оновлення

```powershell
# Отримати WSUS сервер
$wsus = Get-WsusServer -Name "WSUSServer" -PortNumber 8530

# Відхилити проблемне оновлення
$problematic = $wsus.SearchUpdates("KB5055523") | Select-Object -First 1
$problematic.Decline()
```

---

## Обслуговування WSUS

```powershell
# Запустити очищення застарілих оновлень
$cleanupScope = New-Object Microsoft.UpdateServices.Administration.CleanupScope
$cleanupScope.DeclineExpiredUpdates = $true
$cleanupScope.CleanupUnneededContentFiles = $true
$cleanupResult = $wsus.GetCleanupManager().PerformCleanup($cleanupScope)
Write-Host "Звільнено: $([math]::Round($cleanupResult.DiskSpaceFreed/1MB)) МБ"
```

---

## Часті питання

### Скільки місця потрібно для WSUS?

Мінімум 40 ГБ для контенту. З кількома продуктами і мовами — 100-500 ГБ. Запускай очищення щомісяця.

### Клієнти не з'являються в WSUS?

Після GPO: `gpupdate /force` на клієнті, потім `wuauclt /detectnow`. До 20 хвилин очікування. Перевір реєстр `HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate`.

---

## Резюме

Встановлення ролі + postinstall. GPO для вказання WSUS клієнтам. Групи для поетапного розгортання. Затвердження спочатку для тесту, потім продакшн. Щомісячне очищення.
