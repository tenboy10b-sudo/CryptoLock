---
title: "Посилення безпеки Windows 10 і 11: повний чеклист 2026"
date: "2026-06-05"
publishDate: "2026-06-05"
description: "Повний чеклист посилення безпеки Windows 2026. Акаунти, Defender, брандмауер, SMB, UAC, аудит і швидка перевірка поточного стану через PowerShell."
tags: ["windows", "безпека", "hardening", "powershell", "адміністрування"]
readTime: 5
translatesEn: "how-to-harden-windows-security"
---

Правильно захищений Windows ПК набагато складніше зламати. Чеклист за пріоритетами.

---

## Безпека акаунтів

```powershell
# Вимкнути Guest
Disable-LocalUser -Name "Guest"

# Перейменувати вбудований Administrator
Rename-LocalUser -Name "Administrator" -NewName "LocalAdmin2026"

# Акаунти без паролів
Get-LocalUser | Where-Object {$_.PasswordRequired -eq $false -and $_.Enabled -eq $true}

# Блокування після 5 невдалих спроб
net accounts /lockoutthreshold:5 /lockoutduration:30
```

---

## Windows Defender

```powershell
# Перевірити всі захисти
Get-MpComputerStatus | Select-Object RealTimeProtectionEnabled, BehaviorMonitorEnabled,
  AntispywareEnabled, AntivirusEnabled

# Увімкнути захист від програм-вимагачів
Set-MpPreference -EnableControlledFolderAccess Enabled

# Увімкнути мережевий захист
Set-MpPreference -EnableNetworkProtection Enabled
```

---

## Брандмауер

```powershell
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
Set-NetFirewallProfile -Profile Public -DefaultInboundAction Block
```

---

## Зменшити поверхню атаки

```powershell
# Вимкнути SMB1 (вектор атак WannaCry і подібних)
Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol -NoRestart

# Вимкнути автозапуск USB
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer" `
  -Name "NoDriveTypeAutoRun" -Value 255 -Type DWord

# Вимкнути RemoteRegistry
Set-Service RemoteRegistry -StartupType Disabled
Stop-Service RemoteRegistry -Force
```

---

## Швидка перевірка безпеки

```powershell
$checks = @{
  "Guest вимкнений"       = -not (Get-LocalUser "Guest").Enabled
  "Брандмауер активний"   = (Get-NetFirewallProfile | Where-Object {-not $_.Enabled}).Count -eq 0
  "SMB1 вимкнений"        = (Get-WindowsOptionalFeature -Online -FeatureName SMB1Protocol).State -eq "Disabled"
  "Defender активний"     = (Get-MpComputerStatus).RealTimeProtectionEnabled
  "Автозапуск вимкнений"  = (Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer" -EA 0).NoDriveTypeAutoRun -eq 255
}

$checks.GetEnumerator() | ForEach-Object {
  Write-Host "$(if($_.Value){'✅'}else{'❌'}) $($_.Key)"
}
```

---

## Часті питання

### Defender достатній чи потрібен сторонній антивірус?

Для більшості домашніх — так. З хмарним захистом Defender стабільно показує 99%+ у тестах AV-TEST. Сторонні антивіруси часто додають навантаження без суттєвої переваги.

### Як дізнатись чи ПК скомпрометований?

Ознаки: несподіваний мережевий трафік, невідомі процеси з CPU, нові акаунти, змінені записи автозавантаження, вимкнений антивірус.

---

## Резюме

Пріоритет: Defender увімкнений → брандмауер → SMB1 вимкнений → Guest вимкнений → UAC максимальний → аудит увімкнений → автозапуск вимкнений. Запусти скрипт перевірки щоб побачити поточний стан.
