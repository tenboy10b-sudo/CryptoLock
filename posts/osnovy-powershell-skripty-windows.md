---
title: "Основи PowerShell скриптів для адміністраторів Windows"
date: "2026-07-16"
publishDate: "2026-07-16"
description: "Основи написання PowerShell скриптів для Windows адміністраторів. Змінні, умови, цикли, функції, обробка помилок і безпечний запуск скриптів."
tags: ["windows", "powershell", "скрипти", "автоматизація", "адміністрування"]
readTime: 5
translatesEn: "how-to-use-powershell-scripting-basics"
---

PowerShell скрипти автоматизують повторювані задачі. Ось все що потрібно від копіювання команд до написання скриптів для багаторазового використання.

---

## Змінні і типи даних

```powershell
$name = "Windows Admin"
$count = 42
$servers = @("PC01", "PC02", "PC03")

$config = @{
  Server = "192.168.1.10"
  Port   = 443
  SSL    = $true
}
$config.Server  # 192.168.1.10
```

---

## Умови

```powershell
$cpu = (Get-CimInstance Win32_Processor).LoadPercentage

if ($cpu -gt 90) {
  Write-Warning "CPU критичний: $cpu%"
} elseif ($cpu -gt 70) {
  Write-Host "CPU високий: $cpu%" -ForegroundColor Yellow
} else {
  Write-Host "CPU нормальний: $cpu%" -ForegroundColor Green
}
```

---

## Цикли

```powershell
# ForEach-Object (конвеєр)
Get-Service | Where-Object {$_.Status -eq "Stopped"} |
  ForEach-Object { Write-Host "Зупинено: $($_.Name)" }

# foreach (колекції)
foreach ($pc in @("PC01", "PC02", "PC03")) {
  Test-NetConnection $pc -Port 3389 -EA 0
}
```

---

## Функції

```powershell
function Get-DiskInfo {
  param([string]$DriveLetter = "C")
  
  $drive = Get-PSDrive $DriveLetter
  $freeGB = [math]::Round($drive.Free/1GB, 1)
  $usedGB = [math]::Round($drive.Used/1GB, 1)
  
  return [PSCustomObject]@{
    Диск   = $DriveLetter
    ВільноГБ = $freeGB
    ВикористаноГБ = $usedGB
  }
}

$info = Get-DiskInfo "C"
if (($info.ВільноГБ / ($info.ВільноГБ + $info.ВикористаноГБ)) -lt 0.1) {
  Write-Warning "Мало місця на $($info.Диск)!"
}
```

---

## Обробка помилок

```powershell
try {
  $result = Get-Content "C:\Missing\file.txt" -ErrorAction Stop
}
catch [System.IO.FileNotFoundException] {
  Write-Warning "Файл не знайдено"
}
catch {
  Write-Error "Несподівана помилка: $($_.Exception.Message)"
}
finally {
  Write-Host "Завжди виконується"
}
```

---

## Часті питання

### Write-Host vs Write-Output — різниця?

`Write-Host` пише напряму в консоль — не можна передати в конвеєр. `Write-Output` записує в конвеєр — можна захопити і перенаправити. Використовуй `Write-Output` в функціях, `Write-Host` для повідомлень користувачу.

### Скрипт працює інтерактивно але не в планувальнику — чому?

Перевір: 1) ExecutionPolicy для SYSTEM акаунту, 2) відносні шляхи (використовуй `$PSScriptRoot`), 3) модулі не завантажені, 4) потрібні credentials.

---

## Резюме

Змінні: `$name`. Масиви: `@()`. Хештаблиці: `@{}`. Цикли: `foreach` для колекцій, `ForEach-Object` для конвеєра. Функції з `param()`. Обробка помилок через `try/catch`. `-ErrorAction Stop` щоб помилки були перехоплювані.
