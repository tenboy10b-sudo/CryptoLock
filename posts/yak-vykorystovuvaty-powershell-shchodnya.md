---
title: "PowerShell для повсякденних задач: 10 команд що заощаджують час"
date: "2026-12-07"
publishDate: "2026-12-07"
description: "Практичні PowerShell команди для щоденного використання: перевірка мережі, диску, процесів, служб і безпеки. Копіюй і запускай."
tags: ["windows", "powershell", "інструменти", "адміністрування"]
translatesEn: "how-to-use-powershell-for-daily-windows-tasks"
readTime: 5
---

PowerShell вже встановлений на кожному Windows 10/11. Ось команди які реально корисні щодня — без зайвої теорії.

---

## 1. Перевірити що гальмує мережу

```powershell
# Активні підключення з іменами процесів
Get-NetTCPConnection -State Established |
  Select-Object LocalPort, RemoteAddress,
    @{n='Процес';e={(Get-Process -Id $_.OwningProcess -EA 0).Name}} |
  Sort-Object Процес | Format-Table
```

---

## 2. Знайти що з'їдає місце на диску

```powershell
# Топ 10 великих файлів
Get-ChildItem C:\ -Recurse -EA 0 |
  Where-Object {$_.Length -gt 200MB} |
  Sort-Object Length -Descending |
  Select-Object -First 10 FullName, @{n='MB';e={[math]::Round($_.Length/1MB,0)}}
```

---

## 3. Перевірити що запускається при старті

```powershell
Get-ItemProperty "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" |
  Select-Object * -ExcludeProperty PS*
```

---

## 4. Список всіх відкритих портів

```powershell
Get-NetTCPConnection -State Listen |
  Select-Object LocalPort,
    @{n='Процес';e={(Get-Process -Id $_.OwningProcess -EA 0).Name}} |
  Sort-Object LocalPort | Format-Table
```

---

## 5. Швидкий аудит безпеки

```powershell
$d = Get-MpComputerStatus
$fw = (Get-NetFirewallProfile | Where-Object {!$_.Enabled}).Count
Write-Host "Defender: $(if($d.RealTimeProtectionEnabled){'✅'}else{'❌'})"
Write-Host "Підписи: $($d.AntivirusSignatureAge) днів тому"
Write-Host "Брандмауер: $(if($fw -eq 0){'✅ всі увімкнені'}else{"❌ $fw профіль(і) вимкнені"})"
Write-Host "BitLocker: $((Get-BitLockerVolume -MountPoint C: -EA 0).ProtectionStatus)"
```

---

## 6. Стан і вільне місце дисків

```powershell
Get-PSDrive -PSProvider FileSystem |
  Select-Object Name,
    @{n='Вільно ГБ';e={[math]::Round($_.Free/1GB,1)}},
    @{n='Зайнято ГБ';e={[math]::Round($_.Used/1GB,1)}}
```

---

## 7. Перезапустити проблемну службу

```powershell
# Замінити "ServiceName" на ім'я служби
Restart-Service -Name "wuauserv" -Force
Get-Service "wuauserv" | Select-Object Name, Status
```

---

## 8. Очистити DNS кеш і оновити IP

```powershell
Clear-DnsClientCache
ipconfig /release
ipconfig /renew
Write-Host "Готово. Новий IP: $((Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.PrefixOrigin -eq 'Dhcp'}).IPAddress)"
```

---

## 9. Знайти процес що займає порт

```powershell
$port = 8080  # змінити на потрібний порт
$conn = Get-NetTCPConnection -LocalPort $port -EA 0
if ($conn) {
  $proc = Get-Process -Id $conn.OwningProcess -EA 0
  Write-Host "Порт $port займає: $($proc.Name) (PID: $($proc.Id))"
} else {
  Write-Host "Порт $port вільний"
}
```

---

## 10. Перевірити підозрілі процеси

```powershell
# Процеси що запущені з Temp або AppData
Get-Process | Where-Object {
  $_.Path -like "*\Temp\*" -or $_.Path -like "*\AppData\Local\Temp\*"
} | Select-Object Name, Id, Path
```

---

## ⚡ Більше команд

Шукаєш команду для конкретної задачі?

**[→ PowerShell і CMD довідник](/tools/powershell-commands)** — 40+ команд з пошуком за задачею. Введи "мережа", "диск", "безпека" і одразу отримай готову команду.

---

## Резюме

PowerShell запускається через `Win + X` → Windows Terminal (Admin) або пошук. Всі команди вище протестовані на Windows 10 і 11. Для більшого вибору команд — [довідник](/tools/powershell-commands).
