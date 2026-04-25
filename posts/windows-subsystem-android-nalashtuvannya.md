---
title: "Windows Subsystem for Android: запуск Android-додатків на Windows 11"
date: "2026-08-18"
publishDate: "2026-08-18"
description: "Як встановити Windows Subsystem for Android на Windows 11 і запускати мобільні додатки. Встановлення APK без Google Play і налаштування продуктивності."
tags: ["windows", "налаштування", "інструменти", "оптимізація"]
readTime: 5
---

Windows Subsystem for Android (WSA) дозволяє запускати Android-додатки прямо на Windows 11 як звичайні програми. Корисно для мобільних ігор, додатків без Windows-версії або тестування.

---

## Системні вимоги

- Windows 11 (версія 22H2 і вище)
- Процесор з підтримкою віртуалізації (Intel VT-x або AMD-V)
- 8 ГБ RAM (рекомендується 16 ГБ)
- SSD диск
- Увімкнена віртуалізація в BIOS

---

## Встановлення WSA

### Спосіб 1: Через Microsoft Store

`Win + S` → **Windows Subsystem for Android** → **Встановити**

Або встанови **Amazon Appstore** — WSA встановиться автоматично як залежність.

### Спосіб 2: Через PowerShell (якщо Store недоступний)

```powershell
# Завантажити WSA пакет (msixbundle) з store.rg-adguard.net
# Введи "MicrosoftCorporationII.WindowsSubsystemForAndroid" і завантаж останню версію

# Встановити
Add-AppxPackage -Path "C:\Downloads\WSA.msixbundle" -ForceApplicationShutdown
```

---

## Перший запуск і налаштування

`Win + S` → **Windows Subsystem for Android Settings** → запусти і налаштуй:

- **Subsystem Resources** → **Continuous** — WSA завжди запущена (швидший запуск додатків, більше RAM)
- **Subsystem Resources** → **As needed** — запускається тільки при потребі (економія ресурсів)

Увімкни **Developer mode** якщо хочеш встановлювати APK файли.

---

## Встановити Android додатки

### Через Amazon Appstore

Лише обмежений вибір додатків. Для більшого вибору — APK.

### Встановлення APK (Android Package) через ADB

```powershell
# Переконайся що Developer Mode увімкнений у WSA Settings

# Завантаж Platform Tools (ADB) з developer.android.com
# Розпакуй, наприклад, у C:\adb

# Підключитись до WSA
C:\adb\adb.exe connect 127.0.0.1:58526

# Встановити APK
C:\adb\adb.exe install "C:\Downloads\app.apk"

# Список встановлених пакетів
C:\adb\adb.exe shell pm list packages

# Видалити додаток
C:\adb\adb.exe uninstall com.example.app
```

Після встановлення через ADB — додаток з'явиться в меню Пуск як звичайна програма.

---

## Де брати APK файли

Надійні джерела:
- **APKMirror** (apkmirror.com) — дзеркало офіційних APK від відомих розробників
- **F-Droid** (f-droid.org) — відкрите ПЗ для Android
- **APKPure** — обережно, перевіряй SHA256 перед встановленням

**Ніколи не завантажуй APK** з випадкових сайтів, торентів або через рекламні банери.

---

## Налаштування продуктивності

```powershell
# Переглянути поточні налаштування WSA
Get-AppxPackage *WindowsSubsystemForAndroid*

# Вивільнити пам'ять якщо WSA гальмує
wsl --shutdown  # для WSL (не WSA, але звільняє RAM)
```

В налаштуваннях WSA:
- **GPU** → увімкни для кращої графіки в іграх
- **Experimental features** → за бажанням

---

## Типові проблеми

### WSA не запускається — помилка віртуалізації

Перевір в BIOS що Intel VT-x або AMD-V увімкнені.

```powershell
# Перевірити чи підтримується віртуалізація
(Get-CimInstance Win32_Processor).VirtualizationFirmwareEnabled
```

### Додатки запускаються повільно

Встанови ресурси на **Continuous** в налаштуваннях WSA.

### ADB не підключається

```powershell
# Перевірити що WSA запущена
Get-Process "WsaClient" -ErrorAction SilentlyContinue

# Перезапустити підключення ADB
C:\adb\adb.exe kill-server
C:\adb\adb.exe connect 127.0.0.1:58526
```

---

## Обмеження WSA

- Google Play не підтримується (тільки Amazon Appstore або APK)
- Не всі додатки працюють (особливо ті що вимагають Google Services)
- Камера, NFC і деякі сенсори недоступні
- Ігри з анти-чит захистом зазвичай не запускаються

---

## Підсумок

WSA дозволяє запускати багато Android додатків на Windows 11 без телефону. Для встановлення APK через ADB: увімкни Developer Mode → підключись через `adb connect 127.0.0.1:58526` → `adb install app.apk`. Додатки після встановлення видно в меню Пуск як звичайні програми.
