---
title: "PowerShell pipeline: обробка потоків даних і фільтрація"
date: "2026-08-09"
publishDate: "2026-08-09"
description: "Ефективна робота з pipeline в PowerShell: оператори Where-Object, Select-Object, ForEach-Object, Group-Object і Sort-Object для обробки великих обсягів даних."
tags: ["powershell", "адміністрування", "windows", "інструменти", "автоматизація"]
readTime: 4
---

Pipeline (`|`) — основна концепція PowerShell. Кожна команда передає об'єкти наступній.

---

## Основні оператори

```powershell
# Where-Object — фільтрація
Get-Process | Where-Object { $_.CPU -gt 10 }
Get-Service | Where-Object { $_.Status -eq "Stopped" }

# Select-Object — вибрати колонки
Get-Process | Select-Object Name, CPU, WorkingSet

# Sort-Object — сортування
Get-Process | Sort-Object CPU -Descending

# Group-Object — групування
Get-Service | Group-Object Status

# Measure-Object — підрахунок
Get-ChildItem C:\ | Measure-Object Length -Sum -Average
```

---

## Скорочений синтаксис

```powershell
# ? — скорочення для Where-Object
Get-Process | ? { $_.CPU -gt 5 }

# % — скорочення для ForEach-Object
Get-Process | % { Write-Output "$($_.Name): $([math]::Round($_.CPU))%" }
```

---

## Обчислювані властивості

```powershell
# Додати нову колонку з обчисленням
Get-Process | Select-Object Name,
  @{Name="RAM MB"; Expression={[math]::Round($_.WorkingSet/1MB)}} |
  Sort-Object "RAM MB" -Descending |
  Select-Object -First 10
```

---

## Обробка файлів

```powershell
# Знайти великі файли
Get-ChildItem C:\Users -Recurse -File |
  Where-Object { $_.Length -gt 100MB } |
  Select-Object FullName,
    @{N="Size MB";E={[math]::Round($_.Length/1MB,1)}} |
  Sort-Object "Size MB" -Descending
```

---

## Підсумок

`Where-Object` → `Select-Object` → `Sort-Object` — базовий pipeline. `@{N="..."; E={...}}` — обчислювані колонки. `Group-Object` — агрегація. `Measure-Object -Sum` — підсумки.
