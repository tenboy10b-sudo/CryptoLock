---
title: "Кеш Windows: що це, де знаходиться і як правильно очистити"
date: "2026-08-21"
publishDate: "2026-08-21"
description: "Що таке кеш в Windows, де він зберігається і як безпечно очистити: DNS кеш, кеш браузера, кеш Windows Update, тимчасові файли і кеш ескізів."
tags: ["windows", "очищення", "оптимізація", "інструменти", "cmd"]
readTime: 5
---

Кеш — тимчасові файли що прискорюють роботу системи. Але з часом він накопичується і займає гігабайти. Ось де він знаходиться і як очистити кожен тип.

---

## 1. DNS кеш — записи про сайти

Windows зберігає DNS відповіді щоб не запитувати сервер повторно. Іноді застарілі записи спричиняють проблеми з доступом до сайтів.

```cmd
rem Переглянути кеш
ipconfig /displaydns

rem Очистити
ipconfig /flushdns
```

Детальніше: [Очищення DNS кешу](/ochyschennya-dns-keshu-windows)

---

## 2. Кеш Windows Update — завантажені оновлення

Після встановлення оновлень файли залишаються в папці:
```
C:\Windows\SoftwareDistribution\Download
```

Очищення:

```cmd
net stop wuauserv
rd /s /q C:\Windows\SoftwareDistribution\Download
net start wuauserv
```

Або через **Очищення диска** → **Очистити системні файли** → постав галочку **Тимчасові файли Windows Update**.

---

## 3. Кеш ескізів (Thumbnail Cache)

Windows зберігає мініатюри зображень. Займає до кількох сотень МБ.

```cmd
rem Зупинити Explorer
taskkill /f /im explorer.exe

rem Видалити кеш ескізів
del /f /s /q "%LocalAppData%\Microsoft\Windows\Explorer\thumbcache_*.db"

rem Запустити Explorer
start explorer.exe
```

Або через **Очищення диска** → **Ескізи**.

---

## 4. Кеш магазину Microsoft Store

```powershell
# Очистити кеш Store
wsreset.exe
```

Команда відкриє порожнє вікно на кілька секунд і закриється — кеш очищено.

---

## 5. Тимчасові файли (Temp)

```powershell
# Очистити тимчасові папки
Remove-Item "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "C:\Windows\Temp\*" -Recurse -Force -ErrorAction SilentlyContinue
```

Або: `Win + R` → `%temp%` → `Ctrl + A` → `Delete`.

---

## 6. Prefetch — кеш запуску програм

```cmd
rem Очистити Prefetch (Windows відновить автоматично)
del /f /q C:\Windows\Prefetch\*
```

> Prefetch прискорює запуск програм. Після очищення перший запуск буде повільнішим — система відновить кеш.

---

## 7. Кеш шрифтів

Якщо шрифти відображаються некоректно — очисти кеш шрифтів:

```cmd
net stop "Windows Font Cache Service"
del /f /q "%WinDir%\ServiceProfiles\LocalService\AppData\Local\FontCache*"
net start "Windows Font Cache Service"
```

---

## Комплексне очищення одним інструментом

`Win + S` → **Очищення диска** → вибери диск C → **Очистити системні файли** → постав всі галочки → OK.

Або через PowerShell для автоматизації:

```powershell
# Запустити очищення диска в тихому режимі
$sageset = 1
Start-Process cleanmgr -ArgumentList "/sagerun:$sageset" -Wait
```

---

## Підсумок

DNS кеш — `ipconfig /flushdns`. Windows Update кеш — зупини службу, видали папку Download, запусти. Тимчасові файли — `%temp%` і `C:\Windows\Temp`. Для швидкого комплексного очищення — Очищення диска з системними файлами.
