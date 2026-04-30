---
title: "DHCP резервування IP за MAC-адресою: налаштування і управління"
date: "2026-09-16"
publishDate: "2026-09-16"
description: "Як зарезервувати постійний IP для пристрою в DHCP сервері Windows Server: через консоль і PowerShell, масовий імпорт резервацій і моніторинг оренд."
tags: ["адміністрування", "мережа", "windows", "powershell"]
readTime: 5
---

DHCP резервування дозволяє конкретному пристрою завжди отримувати один і той самий IP — зручніше ніж статичний IP безпосередньо на пристрої, і управляється централізовано.

---

## Навіщо резервування замість статичного IP

- Налаштування централізоване на сервері — не треба заходити на кожен пристрій
- При заміні мережевої карти достатньо оновити MAC в DHCP
- Пристрій отримує також правильний DNS, шлюз і інші DHCP опції
- Зручно для принтерів, IP-камер, сканерів

---

## Знайти MAC-адресу пристрою

```cmd
rem На Windows пристрої
ipconfig /all | findstr "Physical"

rem Через DHCP сервер (якщо пристрій вже підключений)
Get-DhcpServerv4Lease -ScopeId 192.168.1.0 |
  Where-Object { $_.HostName -like "*printer*" } |
  Select-Object IPAddress, ClientId, HostName
```

---

## Додати резервування через PowerShell

```powershell
# Один пристрій
Add-DhcpServerv4Reservation `
  -ScopeId 192.168.1.0 `
  -IPAddress 192.168.1.50 `
  -ClientId "00-1A-2B-3C-4D-5E" `
  -Name "HP-Printer-Floor1" `
  -Description "HP LaserJet MFP — 1 поверх"

# Переглянути всі резервації в scope
Get-DhcpServerv4Reservation -ScopeId 192.168.1.0 |
  Select-Object IPAddress, ClientId, Name, Description |
  Sort-Object IPAddress |
  Format-Table -AutoSize

# Видалити резервацію
Remove-DhcpServerv4Reservation -ScopeId 192.168.1.0 -IPAddress 192.168.1.50
```

---

## Масовий імпорт резервацій з CSV

Файл `reservations.csv`:
```
IP,MAC,Name,Description
192.168.1.50,00-1A-2B-3C-4D-5E,HP-Printer-1F,HP LaserJet 1 поверх
192.168.1.51,00-1A-2B-3C-4D-5F,Xerox-Printer-2F,Xerox 2 поверх
192.168.1.52,AA-BB-CC-DD-EE-FF,IP-Camera-Hall,Камера в холі
```

```powershell
Import-Csv "C:\reservations.csv" | ForEach-Object {
    Add-DhcpServerv4Reservation `
      -ScopeId 192.168.1.0 `
      -IPAddress $_.IP `
      -ClientId $_.MAC `
      -Name $_.Name `
      -Description $_.Description
    Write-Output "✓ $($_.Name): $($_.IP)"
}
```

---

## Конвертувати активну оренду в резервацію

```powershell
# Знайти оренду і одразу зарезервувати той самий IP
$lease = Get-DhcpServerv4Lease -ScopeId 192.168.1.0 |
  Where-Object { $_.HostName -eq "PRINTER01" }

if ($lease) {
    Add-DhcpServerv4Reservation `
      -ScopeId 192.168.1.0 `
      -IPAddress $lease.IPAddress `
      -ClientId $lease.ClientId `
      -Name $lease.HostName
    Write-Output "Зарезервовано: $($lease.IPAddress) для $($lease.HostName)"
}
```

---

## Звіт по всіх резерваціях всіх scope

```powershell
Get-DhcpServerv4Scope | ForEach-Object {
    $scope = $_
    Get-DhcpServerv4Reservation -ScopeId $scope.ScopeId -ErrorAction SilentlyContinue |
      Add-Member -MemberType NoteProperty -Name Scope -Value $scope.Name -PassThru
} |
  Select-Object Scope, IPAddress, ClientId, Name |
  Export-Csv "C:\Reports\dhcp-reservations.csv" -Encoding UTF8 -NoTypeInformation
```

---

## Підсумок

`Add-DhcpServerv4Reservation -ScopeId ... -IPAddress ... -ClientId MAC` — додати резервацію. `Get-DhcpServerv4Lease` — знайти MAC активного пристрою. `Import-Csv` + цикл — масовий імпорт для десятків пристроїв. Використовуй резервації для всіх мережевих принтерів, камер і серверів замість статичних IP.
