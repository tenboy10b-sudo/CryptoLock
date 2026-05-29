---
title: "Як перевірити безпеку свого Windows ПК за 10 хвилин"
date: "2026-05-04"
publishDate: "2026-05-04"
description: "Швидка перевірка безпеки Windows: антивірус, брандмауер, оновлення, паролі, автозавантаження і відкриті порти. Скрипт PowerShell і ручні перевірки."
tags: ["windows", "безпека", "діагностика", "інструменти"]
readTime: 5
---

Ця перевірка займає 10 хвилин і покриває основні вектори атак на домашній і корпоративний ПК.

---

## 1. Антивірус активний і свіжий

```powershell
$def = Get-MpComputerStatus
Write-Host "Defender: $(if($def.RealTimeProtectionEnabled){'✅ Увімкнений'}else{'❌ ВИМКНЕНИЙ'})"
Write-Host "Підписи: $($def.AntivirusSignatureAge) днів тому $(if($def.AntivirusSignatureAge -le 1){'✅'}else{'⚠️ Оновити'})"
```

Норма: увімкнений, підписи не старше 1-2 днів.

---

## 2. Брандмауер активний

```powershell
Get-NetFirewallProfile | Select-Object Name, @{n='Стан';e={if($_.Enabled){'✅ Увімкнений'}else{'❌ ВИМКНЕНИЙ'}}}
```

Всі три профілі (Domain, Private, Public) мають бути увімкнені.

---

## 3. Windows оновлений

```powershell
$lastUpdate = (Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 1).InstalledOn
$days = ((Get-Date) - $lastUpdate).Days
Write-Host "Останнє оновлення: $($lastUpdate.ToString('dd.MM.yyyy')) ($days днів тому) $(if($days -le 30){'✅'}else{'⚠️'})"
```

---

## 4. Немає зайвих адміністраторів

```powershell
$admins = Get-LocalGroupMember -Group "Administrators"
Write-Host "Адміністратори ($($admins.Count)):"
$admins | ForEach-Object { Write-Host "  - $($_.Name)" }
```

Має бути тільки твій акаунт. Незнайомі — видалити.

---

## 5. Підозрілий автозапуск

```powershell
$runKeys = @(
  "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run",
  "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"
)
foreach ($key in $runKeys) {
  Get-ItemProperty $key -EA 0 | Get-Member -MemberType NoteProperty |
    Where-Object {$_.Name -notmatch '^PS'} |
    ForEach-Object { Write-Host "  $($_.Name): $((Get-ItemProperty $key).$($_.Name))" }
}
```

Перевір кожен запис — незнайоме ім'я або шлях в `%TEMP%` підозрілий.

---

## 6. Відкриті порти назовні

```powershell
Get-NetTCPConnection -State Listen |
  Where-Object {$_.LocalAddress -eq '0.0.0.0'} |
  Select-Object LocalPort, @{n='Процес';e={(Get-Process -Id $_.OwningProcess -EA 0).Name}} |
  Sort-Object LocalPort
```

Знайомі порти: 135, 445, 3389 (якщо RDP потрібен). Незнайомі — перевірити.

---

## 7. Bitlocker на ноутбуці

```powershell
$bl = Get-BitLockerVolume -MountPoint C: -EA 0
Write-Host "BitLocker: $(if($bl.ProtectionStatus -eq 'On'){'✅ Увімкнений'}else{'⚠️ Вимкнений — критично для ноутбука'})"
```

---

## 8. Підозрілі процеси

```powershell
Get-Process | Where-Object {
  $_.Path -like "*\Temp\*" -or
  $_.Path -like "*\AppData\Local\Temp\*" -or
  ($_.Path -and $_.Path -notlike "*\Windows\*" -and $_.Path -notlike "*\Program Files*")
} | Select-Object Name, Path | Sort-Object Name
```

---

## Повний скрипт одним запуском

```powershell
Write-Host "=== Перевірка безпеки ===" -ForegroundColor Cyan

# Defender
$def = Get-MpComputerStatus
Write-Host "[$(if($def.RealTimeProtectionEnabled){'✅'}else{'❌'})] Defender: $(if($def.RealTimeProtectionEnabled){'Активний'}else{'ВИМКНЕНИЙ'})"

# Firewall
$fw = (Get-NetFirewallProfile | Where-Object {!$_.Enabled}).Count
Write-Host "[$(if($fw -eq 0){'✅'}else{'❌'})] Брандмауер: $(if($fw -eq 0){'Всі профілі увімкнені'}else{"$fw профіль(і) вимкнені"})"

# Updates
$days = ((Get-Date) - (Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 1).InstalledOn).Days
Write-Host "[$(if($days -le 30){'✅'}else{'⚠️'})] Оновлення: $days днів тому"

# BitLocker
$bl = (Get-BitLockerVolume -MountPoint C: -EA 0).ProtectionStatus
Write-Host "[$(if($bl -eq 'On'){'✅'}else{'⚠️'})] BitLocker: $(if($bl -eq 'On'){'Увімкнений'}else{'Вимкнений'})"

# Admins
$adminsCount = (Get-LocalGroupMember -Group "Administrators").Count
Write-Host "[$(if($adminsCount -le 2){'✅'}else{'⚠️'})] Адміністраторів: $adminsCount"

Write-Host "`nДля глибшого аудиту → cryptolockua.com/tools/auditshield" -ForegroundColor Blue
```

---

## Резюме

5 хвилин і PowerShell скрипт вище покриє основні ризики. Для детальнішого аудиту по 22 напрямках — [AuditShield](/tools/auditshield) видає повний HTML-звіт з оцінкою ризику.
