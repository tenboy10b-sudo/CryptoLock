---
title: "PowerShell: управління службами Windows — запуск, зупинка, моніторинг"
date: "2025-12-05"
publishDate: "2025-12-05"
description: "Управління службами Windows через services.msc і PowerShell: Get-Service, Start-Service, Set-Service, автовідновлення при збоях, створення власних служб, пошук завислих служб, масове управління в домені."
tags: ["powershell", "адміністрування", "windows", "інструменти", "служби"]
readTime: 8
translatesEn: "how-to-manage-windows-services-powershell"
---

Служби Windows — фонові процеси що забезпечують роботу системи і програм. PowerShell дає повний контроль над ними: від перевірки статусу до масового управління в домені. Для одиничного випадку є і GUI: `Win + R` → `services.msc`.

---

## Основні команди

```powershell
# Список всіх служб
Get-Service

# Тільки запущені
Get-Service | Where-Object { $_.Status -eq "Running" }

# Тільки зупинені
Get-Service | Where-Object { $_.Status -eq "Stopped" }

# Знайти службу за іменем або описом
Get-Service -Name "wuauserv"          # Windows Update
Get-Service -DisplayName "Windows*"   # всі служби Windows

# Детальна інформація про службу
Get-Service -Name "spooler" | Select-Object *
```

---

## Запуск, зупинка, перезапуск

```powershell
# Запустити
Start-Service -Name "spooler"

# Зупинити
Stop-Service -Name "spooler"

# Зупинити примусово (якщо не зупиняється)
Stop-Service -Name "spooler" -Force

# Перезапустити
Restart-Service -Name "spooler"

# Пауза і продовження (якщо служба підтримує)
Suspend-Service -Name "spooler"
Resume-Service -Name "spooler"
```

---

## Змінити тип запуску

```powershell
# Автоматичний запуск
Set-Service -Name "wuauserv" -StartupType Automatic

# Автоматичний із затримкою (не гальмує запуск системи)
Set-Service -Name "wuauserv" -StartupType AutomaticDelayedStart

# Ручний запуск
Set-Service -Name "wuauserv" -StartupType Manual

# Вимкнути службу
Set-Service -Name "wuauserv" -StartupType Disabled
```

---

## Автовідновлення при збої

Замість monitoring-скрипта (нижче) для критичних служб краще налаштувати автоматичний перезапуск на рівні самої служби:

```powershell
sc.exe failure "Spooler" reset= 86400 actions= restart/5000/restart/10000/restart/30000
```

Це каже Windows: якщо служба впаде — перезапустити через 5с, вдруге через 10с, втретє через 30с, і скинути лічильник збоїв через добу (`reset= 86400`).

---

## Створити і видалити власну службу

```powershell
# Створити
New-Service -Name "MyMonitor" `
  -BinaryPathName "C:\Tools\monitor.exe" `
  -DisplayName "My Monitoring Service" `
  -StartupType Automatic

Start-Service "MyMonitor"

# Видалити
Stop-Service "MyMonitor" -Force
Remove-Service -Name "MyMonitor"
```

---

## Практичні скрипти

### Знайти служби що впали (stopped але мали бути running)

```powershell
# Служби з автозапуском але зупинені — підозрілі кандидати на проблему
Get-WmiObject Win32_Service |
  Where-Object { $_.StartMode -eq "Auto" -and $_.State -eq "Stopped" } |
  Select-Object Name, DisplayName, StartMode, State |
  Format-Table -AutoSize
```

### Перезапустити завислу службу і записати в лог

```powershell
$serviceName = "spooler"
$logFile = "C:\Logs\services.log"

$service = Get-Service -Name $serviceName
if ($service.Status -ne "Running") {
    Start-Service -Name $serviceName
    "$(Get-Date) - $serviceName was $($service.Status), restarted" |
        Out-File $logFile -Append
}
```

### Масово перезапустити кілька служб

```powershell
$services = @("spooler", "wuauserv", "bits", "cryptsvc")
foreach ($s in $services) {
    try {
        Restart-Service -Name $s -Force -ErrorAction Stop
        Write-Output "✓ $s перезапущено"
    } catch {
        Write-Output "✗ $s помилка: $($_.Exception.Message)"
    }
}
```

### Зупинити всі залежні служби і перезапустити

```powershell
# Зупинити службу і всі що від неї залежать
$service = "wuauserv"
Get-Service -Name $service -DependentServices |
  Stop-Service -Force
Stop-Service -Name $service -Force

# Запустити назад
Start-Service -Name $service
Get-Service -Name $service -DependentServices |
  Where-Object { $_.StartType -ne "Disabled" } |
  Start-Service
```

---

## Управління службами на віддалених ПК

```powershell
# Статус служби на віддаленому ПК
Get-Service -Name "spooler" -ComputerName "PC-001"

# Перезапустити на кількох ПК
$computers = @("PC-001", "PC-002", "PC-003")
Invoke-Command -ComputerName $computers -ScriptBlock {
    Restart-Service -Name "spooler" -Force
}

# Статус служби на всіх ПК в OU домену
$computers = Get-ADComputer -Filter * -SearchBase "OU=Workstations,DC=company,DC=local" |
    Select-Object -ExpandProperty Name

foreach ($pc in $computers) {
    $status = (Get-Service -Name "wuauserv" -ComputerName $pc -ErrorAction SilentlyContinue).Status
    Write-Output "$pc : $status"
}
```

---

## Моніторинг служб у реальному часі

```powershell
# Стежити за службою кожні 30 секунд і перезапускати якщо впала
$serviceName = "MyImportantService"
while ($true) {
    $svc = Get-Service -Name $serviceName
    if ($svc.Status -ne "Running") {
        Write-Output "$(Get-Date): $serviceName впала, перезапускаю..."
        Start-Service -Name $serviceName
        Write-EventLog -LogName Application -Source "ServiceMonitor" `
            -EventId 1001 -EntryType Warning `
            -Message "$serviceName was stopped and restarted"
    }
    Start-Sleep -Seconds 30
}
```

---

## Корисні служби — що вмикати і вимикати

**Можна вимкнути якщо не використовуєш (домашній ПК):**
- `TabletInputService` — введення з планшета (якщо немає сенсорного екрана)
- `Fax` — факс
- `WSearch` — індексування пошуку (уповільнює якщо HDD, вмикай тільки на SSD)
- `XblGameSave`, `XblAuthManager`, `XboxNetApiSvc` — сервіси Xbox (якщо не граєш)
- `RemoteRegistry` — віддалений доступ до реєстру (ризик безпеки, не потрібен вдома)
- `lfsvc` — геолокація
- `MapsBroker` — оффлайн-карти

```powershell
$toDisable = @("Fax", "RemoteRegistry", "XblGameSave", "XblAuthManager", "XboxNetApiSvc", "lfsvc", "MapsBroker")
foreach ($svc in $toDisable) {
  Stop-Service $svc -Force -EA 0
  Set-Service $svc -StartupType Disabled -EA 0
  Write-Host "Вимкнено: $svc"
}
```

**Не вимикай:**
- `wuauserv` — Windows Update (безпека)
- `WinDefend` — Windows Defender
- `EventLog` — журнал подій
- `RpcSs` — RPC (зламає систему)

---

## Служба не запускається — діагностика

```powershell
# Перевірити журнал помилок служб
Get-WinEvent -FilterHashtable @{LogName='System'; Level=1,2} -MaxEvents 20 |
  Where-Object {$_.Message -like "*служб*" -or $_.Message -like "*service*"} |
  Select-Object TimeCreated, Message | Format-List
```

Якщо причина не в конкретній залежності, а щось на рівні системних файлів:
- `sfc /scannow` — відновлює пошкоджені файли служб
- `DISM /Online /Cleanup-Image /RestoreHealth` — відновлює образ Windows

Якщо підозра що якась служба уповільнює завантаження — `Win + R` → `msconfig` → вкладка **Служби** → вмикай/вимикай по черзі, перезавантажуючись між спробами, щоб ізолювати винуватця.

---

## Підсумок

`Get-Service | Where-Object { $_.StartType -eq "Automatic" -and $_.Status -ne "Running" }` — швидка діагностика проблемних служб. `Restart-Service -Name "ім'я" -Force` — перезапуск. `Set-Service -StartupType Disabled` — вимкнути назавжди. `sc.exe failure` — автовідновлення критичної служби після падіння. `Invoke-Command -ComputerName` — управління на всіх ПК домену одразу. При помилках запуску — `sfc /scannow`, `DISM /RestoreHealth` і Event Viewer.

---

## ⚡ Шукаєш потрібну команду?

**[→ PowerShell і CMD довідник](/tools/powershell-commands)** — 40+ команд з пошуком за задачею. Введи "мережа", "диск" або "безпека" і одразу отримай готову команду.

