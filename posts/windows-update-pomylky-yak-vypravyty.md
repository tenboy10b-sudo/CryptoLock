---
title: "Помилки Windows Update: коди помилок і як їх виправити"
date: "2026-05-31"
publishDate: "2026-05-31"
description: "Windows Update не встановлює оновлення і видає помилку — розбираємо найпоширеніші коди: 0x80070005, 0x800705b4, 0x80240034 та інші. Покрокові рішення."
tags: ["windows", "оновлення", "windows-update", "відновлення", "діагностика"]
readTime: 7
---

Windows Update завис, видає помилку або оновлення завантажуються але не встановлюються — це одна з найчастіших причин звернень у технічну підтримку. Більшість проблем вирішується кількома командами.

---

## Універсальне рішення для більшості помилок

Спочатку спробуй цей набір команд — він вирішує ~70% проблем з Update:

Відкрий **CMD від адміністратора** і виконай по черзі:

```cmd
net stop wuauserv
net stop cryptSvc
net stop bits
net stop msiserver

ren C:\Windows\SoftwareDistribution SoftwareDistribution.old
ren C:\Windows\System32\catroot2 catroot2.old

net start wuauserv
net start cryptSvc
net start bits
net start msiserver
```

Після цього перезавантаж і спробуй знову.

**Що робить цей скрипт:** зупиняє служби Update, перейменовує папки кешу (Windows створить нові чисті), перезапускає служби.

---

## Засіб усунення несправностей Windows Update

`Пуск` → `Параметри` → `Оновлення та безпека` → `Усунення несправностей` → **Додаткові засоби усунення несправностей** → **Windows Update** → **Запустити засіб усунення несправностей**

Або через PowerShell:

```powershell
msdt.exe /id WindowsUpdateDiagnostic
```

---

## Найпоширеніші коди помилок

### 0x80070005 — Відмовлено в доступі

Проблема з правами доступу до файлів оновлення.

```cmd
# Скинути права на папку SoftwareDistribution
icacls C:\Windows\SoftwareDistribution /reset /T /C
icacls C:\Windows\System32\catroot2 /reset /T /C
```

Також перевір що Windows Defender або сторонній антивірус не блокує оновлення.

---

### 0x800705b4 — Час очікування минув

Служба оновлень не відповідає.

```cmd
# Перезапустити всі служби Update
sc stop wuauserv
sc stop bits
sc stop dosvc
sc start dosvc
sc start bits
sc start wuauserv
```

---

### 0x80240034 — Оновлення не знайдено або пошкоджене

```powershell
# Скинути компоненти Windows Update повністю
Stop-Service wuauserv, bits, cryptsvc, msiserver -Force
Remove-Item C:\Windows\SoftwareDistribution -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item C:\Windows\System32\catroot2 -Recurse -Force -ErrorAction SilentlyContinue
Start-Service wuauserv, bits, cryptsvc, msiserver
```

---

### 0x8024402f — Проблема з підключенням до сервера

Перевір інтернет-з'єднання і DNS:

```cmd
ipconfig /flushdns
netsh winsock reset
netsh int ip reset
```

Якщо використовуєш проксі — перевір налаштування: `Параметри` → `Мережа` → `Проксі`.

---

### 0x80070020 — Файл використовується іншим процесом

```cmd
# Перевірити який процес тримає файл
handle.exe C:\Windows\SoftwareDistribution
```

Зазвичай вирішується простим перезавантаженням.

---

### 0xc1900223 — Помилка завантаження

Проблема з CDN Microsoft. Спробуй:

1. Перезавантаж роутер
2. Тимчасово вимкни VPN якщо є
3. Зміни DNS на `8.8.8.8`: [Як змінити DNS](/yak-zminyty-dns-windows)
4. Спробуй через кілька годин — проблема може бути на боці Microsoft

---

### 0x80073712 — Пошкоджені системні файли

```cmd
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow
```

Детальніше: [SFC і DISM — відновлення системних файлів](/sfc-dism-vidnovlennya-systemnykh-fayliv)

---

## Якщо оновлення завантажується але не встановлюється

**Перевір місце на диску** — потрібно мінімум 10–20 ГБ вільного:

[Як почистити диск C](/yak-pochystyty-dysk-c)

**Перевір цілісність системи:**

```cmd
DISM /Online /Cleanup-Image /CheckHealth
DISM /Online /Cleanup-Image /ScanHealth
DISM /Online /Cleanup-Image /RestoreHealth
```

---

## Встановити оновлення вручну

Якщо конкретне оновлення не встановлюється автоматично:

1. Запиши номер оновлення (наприклад `KB5034441`)
2. Зайди на **catalog.update.microsoft.com**
3. Знайди оновлення за номером KB
4. Завантаж і встанови вручну

---

## Перевірка журналу помилок Update

```powershell
# Переглянути помилки Windows Update за останні 7 днів
Get-WinEvent -FilterHashtable @{
  LogName = 'System'
  ProviderName = 'Microsoft-Windows-WindowsUpdateClient'
  Level = 2
  StartTime = (Get-Date).AddDays(-7)
} | Select-Object TimeCreated, Message | Format-List
```

---

## Підсумок

Для більшості помилок: очисти кеш Update (скрипт вгорі) → запусти засіб усунення несправностей → `DISM + sfc`. Якщо конкретний код — знайди його в таблиці і застосуй рішення. Допомагає у 90% випадків без перевстановлення Windows.
