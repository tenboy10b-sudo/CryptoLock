---
title: "Hyper-V розширено: знімки, ресурси і автоматизація через PowerShell"
date: "2026-07-23"
publishDate: "2026-07-23"
description: "Розширена конфігурація Hyper-V: знімки стану, налаштування ресурсів VM, вкладена віртуалізація, динамічна пам'ять і автоматизація через PowerShell."
tags: ["windows", "hyper-v", "віртуалізація", "powershell", "адміністрування"]
readTime: 4
translatesEn: "how-to-configure-windows-hyper-v-advanced"
---

Крім базового створення VM, Hyper-V має потужні функції для управління ресурсами і автоматизації.

---

## Управління знімками (Checkpoints)

```powershell
Checkpoint-VM -VMName "TestVM" -SnapshotName "Перед оновленням $(Get-Date -Format 'yyyy-MM-dd')"
Get-VMCheckpoint -VMName "TestVM" | Select-Object Name, CreationTime
Restore-VMCheckpoint -VMName "TestVM" -Name "Перед оновленням 2026-06-18" -Confirm:$false
Remove-VMCheckpoint -VMName "TestVM" -Name "Перед оновленням 2026-06-18"
```

---

## Налаштування ресурсів VM

```powershell
# CPU
Set-VMProcessor -VMName "TestVM" -Count 4 -Maximum 50

# Динамічна пам'ять
Set-VMMemory -VMName "TestVM" `
  -DynamicMemoryEnabled $true `
  -MinimumBytes 512MB -StartupBytes 2GB -MaximumBytes 8GB

# Змінити розмір диску
Resize-VHD -Path "C:\VMs\TestVM.vhdx" -SizeBytes 100GB
```

---

## Вкладена віртуалізація

```powershell
# VM має бути вимкнена
Stop-VM -VMName "TestVM"
Set-VMProcessor -VMName "TestVM" -ExposeVirtualizationExtensions $true
Start-VM -VMName "TestVM"
```

---

## Автоматизація

```powershell
# Статус всіх VM
Get-VM | Select-Object Name, State, CPUUsage, MemoryAssigned | Format-Table

# Запустити всі зупинені VM
Get-VM | Where-Object {$_.State -eq "Off"} | Start-VM
```

---

## Часті питання

### Різниця між Standard і Production знімками?

Standard = знімок стану пам'яті. Production = VSS резервна копія (узгоджена на рівні застосунків). Використовуй Production для баз даних і серверів що запущені.

### VM не запускається після відновлення знімка?

Перевір чи є .avhdx файл диска відмінностей і чи він правильно пов'язаний. Hyper-V Manager → Параметри → перевір всі шляхи до дисків.

---

## Резюме

Production checkpoints для запущених VM. Динамічна пам'ять з мін/макс межами. Вкладена віртуалізація для контейнерів. Автоматичні знімки через Планувальник. Integration Services увімкнені і оновлені.
