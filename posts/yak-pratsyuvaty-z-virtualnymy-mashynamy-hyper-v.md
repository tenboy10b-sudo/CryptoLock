---
title: "Hyper-V: знімки, клонування і управління віртуальними машинами"
date: "2026-09-03"
publishDate: "2026-09-03"
description: "Управління VM в Hyper-V: створення знімків стану, клонування, міграція і управління ресурсами через PowerShell. Практичні сценарії для тестового середовища."
tags: ["windows", "адміністрування", "налаштування", "powershell", "безпека"]
readTime: 7
---

Знімки (snapshots) і клонування VM — ключові функції Hyper-V для тестування і резервного копіювання. Ось як ефективно ними користуватись.

---

## Знімки стану (Checkpoints)

Знімок фіксує стан VM на певний момент. Можна відкотитись якщо щось пішло не так.

### Через GUI

Hyper-V Manager → клікни правою на VM → **Checkpoint** → введи ім'я.

### Через PowerShell

```powershell
# Створити знімок
Checkpoint-VM -Name "TestVM" -SnapshotName "Before Windows Update"

# Список знімків
Get-VMSnapshot -VMName "TestVM" | Select-Object Name, CreationTime, ParentSnapshotName

# Відкотитись до знімку
$snapshot = Get-VMSnapshot -VMName "TestVM" -Name "Before Windows Update"
Restore-VMSnapshot -VMSnapshot $snapshot -Confirm:$false

# Видалити знімок (звільнить місце)
Remove-VMSnapshot -VMName "TestVM" -Name "Before Windows Update"

# Видалити всі знімки
Remove-VMSnapshot -VMName "TestVM" -IncludeAllChildSnapshots
```

---

## Типи знімків

**Production Checkpoints (рекомендовано)** — використовує Volume Shadow Copy. Безпечний для VM з відкритими базами даних.

**Standard Checkpoints** — "заморожує" стан пам'яті. Може спричинити проблеми з транзакціями БД.

```powershell
# Встановити тип знімків
Set-VM -Name "TestVM" -CheckpointType Production
# або: Standard, ProductionOnly, Disabled
```

---

## Клонування VM

В Hyper-V немає прямого клонування — копіюємо VHDX файли.

```powershell
# Зупинити VM
Stop-VM -Name "SourceVM" -Force

# Скопіювати диск
$sourceVHD = "C:\VMs\SourceVM\SourceVM.vhdx"
$destVHD = "C:\VMs\ClonedVM\ClonedVM.vhdx"

Copy-Item $sourceVHD $destVHD

# Створити нову VM з скопійованим диском
New-VM -Name "ClonedVM" `
  -MemoryStartupBytes 2GB `
  -Generation 2 `
  -VHDPath $destVHD `
  -SwitchName "External Switch"

# Запустити нову VM
Start-VM -Name "ClonedVM"
```

---

## Управління ресурсами VM

```powershell
# Змінити кількість процесорів
Set-VMProcessor -VMName "TestVM" -Count 4

# Змінити RAM
Set-VMMemory -VMName "TestVM" -StartupBytes 4GB

# Динамічна пам'ять
Set-VMMemory -VMName "TestVM" `
  -DynamicMemoryEnabled $true `
  -MinimumBytes 1GB `
  -StartupBytes 2GB `
  -MaximumBytes 8GB

# Встановити пріоритет ресурсів CPU
Set-VMProcessor -VMName "TestVM" -RelativeWeight 200  # 100 = стандарт

# Обмежити пропускну здатність мережі
Set-VMNetworkAdapter -VMName "TestVM" -MaximumBandwidth 100000000  # 100 Мбіт
```

---

## Моніторинг VM

```powershell
# Статус всіх VM
Get-VM | Select-Object Name, State, CPUUsage, MemoryAssigned, Uptime

# Детальний стан конкретної VM
Get-VM -Name "TestVM" | Select-Object *

# Використання ресурсів в реальному часі
while ($true) {
    Get-VM | Select-Object Name, State, CPUUsage,
        @{N="RAM GB";E={[math]::Round($_.MemoryAssigned/1GB,1)}} |
        Format-Table -AutoSize
    Start-Sleep 5
    Clear-Host
}

# Лог подій Hyper-V
Get-WinEvent -LogName "Microsoft-Windows-Hyper-V-Worker-Operational" |
  Select-Object TimeCreated, Message | Select-Object -First 20
```

---

## Експорт і імпорт VM

```powershell
# Зупинити і експортувати VM (разом з дисками і конфігурацією)
Stop-VM -Name "TestVM" -Force
Export-VM -Name "TestVM" -Path "D:\VMExports"

# Імпортувати на іншому хості
Import-VM -Path "D:\VMExports\TestVM\Virtual Machines\*.vmcx" -Copy `
  -GenerateNewId `
  -VirtualMachinePath "C:\VMs" `
  -VhdDestinationPath "C:\VMs\TestVM"
```

---

## Інтеграційні служби

```powershell
# Переглянути стан Integration Services
Get-VMIntegrationService -VMName "TestVM"

# Увімкнути Guest Services (дозволяє копіювати файли між хостом і VM)
Enable-VMIntegrationService -VMName "TestVM" -Name "Guest Service Interface"

# Скопіювати файл у VM (без мережі)
Copy-VMFile -Name "TestVM" -SourcePath "C:\script.ps1" `
  -DestinationPath "C:\Users\Administrator\script.ps1" `
  -CreateFullPath -FileSource Host
```

---

## Підсумок

`Checkpoint-VM` → тест → `Restore-VMSnapshot` якщо не вийшло. Для клонування — копіювати VHDX і створити нову VM. `Export-VM` / `Import-VM` — перенести VM між хостами зі всіма налаштуваннями. `Set-VMMemory -DynamicMemoryEnabled` — економить RAM на хості при кількох VM.
