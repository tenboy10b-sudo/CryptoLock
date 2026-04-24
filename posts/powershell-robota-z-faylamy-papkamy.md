---
title: "PowerShell: робота з файлами і папками — команди з прикладами"
date: "2026-05-11"
publishDate: "2026-05-11"
description: "Основні команди PowerShell для роботи з файлами і папками: створення, копіювання, переміщення, видалення, пошук і масові операції з прикладами."
tags: ["powershell", "інструменти", "адміністрування", "cmd"]
readTime: 7
---

PowerShell значно потужніший за CMD при роботі з файлами і папками. Розберемо основні команди які реально використовуються в адмініструванні.

---

## Навігація

```powershell
# Поточна папка
Get-Location
pwd  # коротка форма

# Перейти в папку
Set-Location C:\Windows\System32
cd C:\Users  # коротка форма

# На рівень вище
cd ..

# Список файлів і папок
Get-ChildItem
ls   # або dir — всі три варіанти працюють

# Список з деталями
Get-ChildItem | Format-Table Name, Length, LastWriteTime

# Показати приховані файли
Get-ChildItem -Force
```

---

## Створення файлів і папок

```powershell
# Створити папку
New-Item -ItemType Directory -Path "C:\MyFolder"
mkdir C:\MyFolder  # коротка форма

# Створити кілька вкладених папок одразу
New-Item -ItemType Directory -Path "C:\Projects\2026\Reports" -Force

# Створити файл
New-Item -ItemType File -Path "C:\MyFolder\log.txt"

# Створити файл з текстом
"Початковий вміст" | Out-File "C:\MyFolder\log.txt"
Set-Content "C:\MyFolder\log.txt" "Текст файлу"
```

---

## Читання файлів

```powershell
# Прочитати файл
Get-Content "C:\MyFolder\log.txt"
cat "C:\log.txt"  # коротка форма

# Перші 10 рядків
Get-Content "C:\log.txt" -TotalCount 10

# Останні 20 рядків (як tail в Linux)
Get-Content "C:\log.txt" -Tail 20

# Знайти рядки що містять слово "Error"
Get-Content "C:\log.txt" | Select-String "Error"

# Порахувати кількість рядків
(Get-Content "C:\log.txt").Count
```

---

## Копіювання і переміщення

```powershell
# Копіювати файл
Copy-Item "C:\source\file.txt" "C:\destination\"
cp "C:\source\file.txt" "C:\destination\"

# Копіювати папку з вмістом
Copy-Item "C:\Source" "C:\Destination" -Recurse

# Копіювати всі .log файли
Copy-Item "C:\Logs\*.log" "D:\Backup\"

# Перемістити файл
Move-Item "C:\source\file.txt" "C:\destination\"
mv "C:\old.txt" "C:\new.txt"  # також перейменовує

# Перейменувати
Rename-Item "C:\MyFolder\old.txt" "new.txt"
```

---

## Видалення

```powershell
# Видалити файл
Remove-Item "C:\MyFolder\file.txt"
del "C:\file.txt"  # коротка форма

# Видалити папку з вмістом
Remove-Item "C:\MyFolder" -Recurse

# Видалити без підтвердження
Remove-Item "C:\MyFolder" -Recurse -Force

# Видалити всі .tmp файли в папці
Remove-Item "C:\Temp\*.tmp"

# Видалити файли старіші 30 днів
Get-ChildItem "C:\Logs" -File |
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } |
  Remove-Item
```

---

## Пошук файлів

```powershell
# Знайти всі .log файли на диску C
Get-ChildItem -Path C:\ -Filter "*.log" -Recurse -ErrorAction SilentlyContinue

# Знайти файли більші за 100 МБ
Get-ChildItem -Path C:\ -Recurse -ErrorAction SilentlyContinue |
  Where-Object { $_.Length -gt 100MB }

# Знайти файли змінені сьогодні
Get-ChildItem -Path C:\Users -Recurse |
  Where-Object { $_.LastWriteTime -gt (Get-Date).Date }

# Знайти файли що містять текст
Select-String -Path "C:\Logs\*.log" -Pattern "Critical Error"
```

---

## Масові операції з файлами

```powershell
# Перейменувати всі файли — додати префікс
Get-ChildItem "C:\Photos\*.jpg" | 
  Rename-Item -NewName { "2026_" + $_.Name }

# Скопіювати структуру папок без файлів
Get-ChildItem "C:\Source" -Recurse -Directory |
  ForEach-Object {
    $dest = $_.FullName -replace "C:\\Source", "D:\\Backup"
    New-Item -ItemType Directory -Path $dest -Force
  }

# Отримати розмір папки
Get-ChildItem "C:\Windows" -Recurse -ErrorAction SilentlyContinue |
  Measure-Object -Property Length -Sum |
  Select-Object @{Name="SizeGB"; Expression={[math]::Round($_.Sum/1GB, 2)}}
```

---

## Права доступу до файлів

```powershell
# Переглянути права доступу
Get-Acl "C:\MyFolder" | Format-List

# Надати права користувачу
$acl = Get-Acl "C:\MyFolder"
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
  "domain\username", "FullControl", "Allow"
)
$acl.SetAccessRule($rule)
Set-Acl "C:\MyFolder" $acl
```

Детальніше про права доступу: [Права доступу до файлів і папок](/prava-dostupu-fayly-papky)

---

## Корисні однорядкові скрипти

```powershell
# Знайти і видалити порожні папки
Get-ChildItem -Path "C:\Temp" -Recurse -Directory |
  Where-Object { (Get-ChildItem $_.FullName).Count -eq 0 } |
  Remove-Item

# Список 10 найбільших файлів на диску C
Get-ChildItem C:\ -Recurse -ErrorAction SilentlyContinue |
  Sort-Object Length -Descending |
  Select-Object FullName, @{Name="MB"; Expression={[math]::Round($_.Length/1MB,1)}} |
  Select-Object -First 10

# Порахувати файли по розширенню
Get-ChildItem "C:\Users" -Recurse -File -ErrorAction SilentlyContinue |
  Group-Object Extension |
  Sort-Object Count -Descending |
  Select-Object -First 10
```

---

## Підсумок

PowerShell дозволяє виконувати за секунди те що руками зайняло б години. Найкорисніші команди для щоденної роботи: `Get-ChildItem`, `Copy-Item`, `Remove-Item` з фільтрами і `Where-Object` для умовного відбору.

Більше команд: [PowerShell для адміністратора — топ-20](/powershell-komandy-administratora)
