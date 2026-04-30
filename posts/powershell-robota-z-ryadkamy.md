---
title: "PowerShell: робота з рядками і текстом — методи і практичні приклади"
date: "2026-09-12"
publishDate: "2026-09-12"
description: "Робота з рядками в PowerShell: розбиття, з'єднання, пошук, заміна, форматування і регулярні вирази. Практичні приклади для обробки текстових даних."
tags: ["powershell", "інструменти", "адміністрування", "windows", "автоматизація"]
readTime: 6
---

Рядки — основа більшості PowerShell скриптів: парсинг логів, форматування виводу, обробка конфігурацій. Ось найважливіші методи.

---

## Базові операції

```powershell
$str = "Hello, Windows!"

# Довжина
$str.Length  # 16

# Верхній і нижній регістр
$str.ToUpper()  # HELLO, WINDOWS!
$str.ToLower()  # hello, windows!

# Обрізати пробіли
"  text  ".Trim()       # "text"
"  text  ".TrimStart()  # "text  "
"  text  ".TrimEnd()    # "  text"

# Перевірити чи містить підрядок
$str.Contains("Windows")  # True

# Починається / закінчується
$str.StartsWith("Hello")  # True
$str.EndsWith("!")        # True

# Індекс входження
$str.IndexOf("Windows")  # 7
```

---

## Розбиття рядка

```powershell
# Split за символом
"один,два,три".Split(",")
# один
# два
# три

# Split за кількома символами
"a;b,c|d".Split(";,|")

# Split з обмеженням кількості частин
"a:b:c:d".Split(":", 2)
# a
# b:c:d

# Split за словом
"це є текст".Split(" ")

# Розбити рядок на масив символів
[char[]]"abc"
```

---

## З'єднання рядків

```powershell
# Конкатенація
"Hello" + " " + "World"

# Інтерполяція (рекомендовано)
$name = "Windows"
"Hello, $name!"

# Join масиву в рядок
@("один", "два", "три") -join ", "  # один, два, три
@("a", "b", "c") -join "`n"  # кожен з нового рядка

# Format
"Сервер: {0}, Порт: {1}" -f "localhost", 3389
```

---

## Пошук і заміна

```powershell
$text = "Windows 10 і Windows 11"

# Проста заміна (всіх входжень)
$text.Replace("Windows", "Microsoft Windows")

# Заміна без урахування регістру
$text -replace "windows", "WINDOWS"

# Regex заміна
"tel: 050-123-4567" -replace "\d{3}-\d{3}-\d{4}", "XXX-XXX-XXXX"

# Видалити всі цифри
"abc123def456" -replace "\d", ""  # abcdef

# Заміна в файлі
(Get-Content "config.txt") -replace "old_value", "new_value" |
  Set-Content "config.txt"
```

---

## Регулярні вирази

```powershell
# Перевірити відповідність
"192.168.1.100" -match "^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$"  # True

# Витягти групи
"User: john, Age: 30" -match "User: (\w+), Age: (\d+)"
$matches[1]  # john
$matches[2]  # 30

# Знайти всі входження
$log = "Error 404 at 10:30, Error 500 at 11:45"
[regex]::Matches($log, "Error \d+") | ForEach-Object { $_.Value }
# Error 404
# Error 500

# Витягти IP адреси з тексту
$text = "Hosts: 192.168.1.1 and 10.0.0.5"
[regex]::Matches($text, "\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}") |
  Select-Object -ExpandProperty Value
```

---

## Форматування рядків

```powershell
# Число з певною кількістю знаків
"{0:N2}" -f 3.14159  # 3,14
"{0:F4}" -f 3.14159  # 3,1416

# Вирівнювання в таблиці
"{0,-20} {1,10}" -f "Назва", "Значення"
"{0,-20} {1,10}" -f "CPU", "45%"

# Дата
"{0:dd.MM.yyyy}" -f (Get-Date)  # 09.09.2026
"{0:HH:mm:ss}" -f (Get-Date)    # 14:30:00

# Розмір файлу
function Format-Size($bytes) {
    switch ($bytes) {
        { $_ -ge 1GB } { return "{0:N1} ГБ" -f ($_ / 1GB) }
        { $_ -ge 1MB } { return "{0:N1} МБ" -f ($_ / 1MB) }
        { $_ -ge 1KB } { return "{0:N1} КБ" -f ($_ / 1KB) }
        default        { return "$_ Б" }
    }
}
Format-Size 1536000  # 1,5 МБ
```

---

## Практичний приклад: парсинг лог файлу

```powershell
# Витягти IP адреси і коди помилок з IIS лога
Get-Content "C:\inetpub\logs\access.log" |
  Where-Object { $_ -match " 5\d{2} " } |  # тільки 5xx помилки
  ForEach-Object {
    if ($_ -match "^(\S+).*? (\d{3}) ") {
        [PSCustomObject]@{
            IP     = $matches[1]
            Status = $matches[2]
            Line   = $_
        }
    }
  } |
  Group-Object IP |
  Sort-Object Count -Descending |
  Select-Object Name, Count |
  Format-Table -AutoSize
```

---

## Here-String — багаторядковий текст

```powershell
# Багаторядковий рядок з інтерполяцією
$server = "SRV-01"
$message = @"
Сервер: $server
Дата: $(Get-Date -Format 'dd.MM.yyyy')
Статус: OK
"@

# Без інтерполяції (все буквально)
$config = @'
server=localhost
port=3389
timeout=30
'@
```

---

## Підсумок

`-split` і `-join` — розбити і з'єднати. `-replace` з regex — потужна заміна. `-match` — перевірка і витягування груп через `$matches`. `"{0:формат}" -f значення` — форматування чисел і дат. Here-String `@"..."@` — зручно для конфігураційних файлів і шаблонів.
