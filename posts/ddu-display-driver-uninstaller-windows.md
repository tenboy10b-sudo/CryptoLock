---
title: "DDU (Display Driver Uninstaller): повне видалення драйверів відеокарти на Windows"
date: "2026-06-18"
publishDate: "2027-06-01"
updated: "2026-06-18"
description: "Як використовувати DDU для повного видалення драйверів NVIDIA, AMD або Intel на Windows. Покрокова інструкція через Safe Mode, коли потрібен DDU і як встановити чисті драйвери після."
tags: ["windows", "ddu", "драйвери", "nvidia", "amd", "інструменти"]
readTime: 6
translatesEn: "ddu-display-driver-uninstaller-windows-guide"
---

DDU (Display Driver Uninstaller) повністю видаляє драйвери відеокарти разом з усіма залишками — реєстром, папками і службами. Потрібен коли звичайне видалення не допомагає або хочеш чисту установку нових драйверів.

---

## Коли потрібен DDU

- Артефакти, чорний екран або краші після оновлення драйвера
- Переходиш з NVIDIA на AMD (або навпаки)
- Встановлюєш нові драйвери і хочеш чисту базу
- Драйвер не встановлюється через конфлікт зі старим
- Проблеми після оновлення Windows

---

## Завантаження

Тільки з офіційного сайту: [guru3d.com/files-details/display-driver-uninstaller-download](https://www.guru3d.com/files-details/display-driver-uninstaller-download.html)

DDU — портативна програма, встановлення не потрібне. Розпакуй в будь-яку папку.

---

## Крок 1 — Завантажити нові драйвери заздалегідь

Перед видаленням завантаж нові драйвери щоб вони були готові офлайн:

- **NVIDIA:** [nvidia.com/drivers](https://www.nvidia.com/Download/index.aspx)
- **AMD:** [amd.com/drivers](https://www.amd.com/en/support)
- **Intel:** [intel.com/download-center](https://www.intel.com/content/www/us/en/download-center/home.html)

---

## Крок 2 — Завантажитись в Safe Mode

DDU рекомендує запускати в Safe Mode щоб Windows не заважала видаленню:

**Спосіб 1 — через Параметри:**
```
Win + I → Система → Відновлення → Розширений запуск → Перезавантажити зараз
→ Усунення неполадок → Додаткові параметри → Параметри завантаження → Перезавантажити
→ F4 (Safe Mode) або F5 (Safe Mode with Networking)
```

**Спосіб 2 — швидко:**
```powershell
# Перезавантажити в Safe Mode одноразово
bcdedit /set {current} safeboot minimal
shutdown /r /t 0
```

Після роботи DDU — повернути нормальне завантаження:
```powershell
bcdedit /deletevalue {current} safeboot
```

---

## Крок 3 — Запустити DDU

1. Запусти `Display Driver Uninstaller.exe`
2. В правій панелі **"Select device type"** → вибери **GPU**
3. **"Select device"** → вибери виробника (NVIDIA / AMD / Intel)
4. Натисни **"Clean and restart"**

**Кнопки:**
| Кнопка | Що робить |
|--------|----------|
| **Clean and restart** | Видаляє і перезавантажує — рекомендовано |
| **Clean and do NOT restart** | Видаляє без перезавантаження |
| **Clean and shutdown** | Для зміни відеокарти (треба вимкнути ПК) |

---

## Крок 4 — Встановити нові драйвери

Після перезавантаження Windows буде з базовим VGA драйвером. Встанови завчасно завантажені драйвери.

**Для NVIDIA** — рекомендую **NV Clean Install** замість стандартного інсталятора:
```powershell
winget install Techpowerup.NVCleanInstall
```
Дозволяє встановити тільки потрібні компоненти без GeForce Experience, Telemetry тощо.

---

## Налаштування DDU

```
Options (верхній рядок):
```

| Опція | Рекомендація |
|-------|-------------|
| Remove C++ redistributables | ❌ Вимкнути — можуть потребуватись іншим ПЗ |
| Remove Physx | ✅ Увімкнути для NVIDIA |
| Remove NVIDIA Broadcast | ✅ якщо не використовуєш |
| Remove AMD ReLive | ✅ якщо не використовуєш |

---

## Видалення аудіо драйверів GPU

Разом з відео DDU може видалити HDMI аудіо драйвери GPU:

```
Select device type → Audio
Select device → NVIDIA High Definition Audio / AMD Audio
Clean and restart
```

---

## Без Safe Mode — чи можна?

Так, але не рекомендовано. Windows може заблокувати деякі файли в звичайному режимі. DDU попередить якщо Safe Mode не активний — можна продовжити на свій ризик.

---

## Резюме

```
1. Завантажити нові драйвери (офлайн)
2. Завантажитись в Safe Mode
3. Запустити DDU → GPU → Clean and restart
4. Встановити нові драйвери
```

| Ситуація | Рішення |
|---------|---------|
| Артефакти після оновлення | DDU → чиста установка |
| Перехід NVIDIA → AMD | DDU обов'язково |
| Нові драйвери без проблем | DDU опціонально |
| Не хочеш Safe Mode | DDU в звичайному режимі (ризикованіше) |
