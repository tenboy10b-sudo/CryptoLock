---
title: "Оптимізація Windows для ігор: повний гайд для ПК і ноутбука"
date: "2026-03-10"
updated: "2026-07-22"
publishDate: "2026-03-10"
description: "Налаштування Windows 10 і 11 для максимального FPS: план живлення, Game Mode, HAGS, GPU-панель NVIDIA/AMD, XMP для RAM, мережева оптимізація, і окремо — для ігрових ноутбуків."
tags: ["windows", "ігри", "оптимізація", "продуктивність", "обладнання", "gpu"]
translatesEn: "how-to-configure-windows-10-for-gaming"
readTime: 10
---

Windows за замовчуванням балансує між продуктивністю і економією ресурсів — не налаштований для ігор з коробки. Ці кроки дають +10-30% FPS без апгрейду заліза.

---

## 1. План живлення — Висока продуктивність

Найважливіший крок. Збалансований план обмежує частоту процесора в спокої і не завжди встигає підняти її під навантаженням.

```powershell
# Висока продуктивність
powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c

# Ultimate Performance — прибирає стани простою CPU повністю (краще для стаціонарного ПК)
powercfg /duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61
powercfg /setactive e9a42b02-d5df-448d-aa00-03f14749eb61
```

**На ноутбуці:** розблокуй повну продуктивність через фірмову утиліту — ASUS Armoury Crate, Lenovo Vantage, MSI Center, Dell G-Series → обери Performance/Turbo режим. Без цього план живлення Windows сам по собі не розблоковує повну потужність на багатьох ігрових ноутбуках.

---

## 2. Game Mode

`Win + I` → **Ігри** → **Режим гри** → увімкни.

Пріоритизує CPU/GPU ресурси для гри, пригнічує фонові оновлення Windows і сповіщення під час гри.

```powershell
Set-ItemProperty "HKCU:\SOFTWARE\Microsoft\GameBar" -Name "AutoGameModeEnabled" -Value 1 -Type DWord
```

---

## 3. Hardware-Accelerated GPU Scheduling (HAGS)

Знижує затримку рендерингу між CPU і GPU.

`Параметри` → `Система` → `Дисплей` → `Графіка` → **Змінити параметри графіки за замовчуванням** → увімкни **Планування GPU з апаратним прискоренням** → перезавантаж.

Потребує GPU від 2019 року (NVIDIA RTX/GTX 10xx+, AMD RX 5000+) і Windows 10 2004+.

```powershell
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\GraphicsDrivers" -Name "HwSchMode" -Value 2 -Type DWord
```

---

## 4. Вимкнути Xbox Game Bar і DVR

Game Bar споживає ресурси навіть коли не записуєш.

`Параметри` → `Ігри` → **Xbox Game Bar** → вимкни. `Параметри` → `Ігри` → **Записи** → **Записувати у фоні** → вимкни.

```powershell
Set-ItemProperty "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\GameDVR" -Name "AppCaptureEnabled" -Value 0 -Type DWord
```

Якщо потрібен вбудований FPS-лічильник чи запис кліпів — залиш увімкненим, сам по собі він легкий (вплив ~1-3% FPS).

---

## 5. Налаштування GPU-панелі

### NVIDIA Control Panel

Правою кнопкою на робочому столі → **NVIDIA Control Panel** → **Manage 3D Settings** → **Global Settings**:
- **Power management mode** → Prefer maximum performance
- **Low Latency Mode** → Ultra (для змагальних онлайн-ігор, де важлива затримка вводу)
- **Vertical Sync** → Вимкнено (використовуй G-Sync замість, якщо є монітор з підтримкою)
- **Texture filtering - Quality** → High performance

### AMD Radeon Software

**Gaming** → **Global Graphics**:
- **Radeon Anti-Lag** → увімкни
- **Power Tuning** → Performance
- **V-Sync** → вимкни, якщо використовуєш FreeSync

### Вибір дискретної GPU (ноутбуки з двома відеокартами)

На ноутбуках з інтегрованою + дискретною GPU переконайся, що ігри використовують саме дискретну:

`Параметри` → `Система` → `Дисплей` → `Графіка` → обери гру зі списку → **Параметри** → **Висока продуктивність** (дискретна GPU).

---

## 6. Вимкнути фонові процеси перед грою

```powershell
# Що зараз їсть RAM/CPU
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 15 Name, @{n='RAM(MB)';e={[math]::Round($_.WorkingSet/1MB,0)}}

# Зупинити конкретний процес
Stop-Process -Name "Discord" -Force

# Фонові служби, що можна вимкнути
Stop-Service DiagTrack -Force -EA 0
Set-Service DiagTrack -StartupType Disabled -EA 0
Stop-Service SysMain -Force
Set-Service SysMain -StartupType Disabled
```

> **SysMain — тільки на SSD.** На HDD він прискорює завантаження програм, вимикати не варто.

**Найбільші пожирачі ресурсів під час гри:** Discord з відеопотоком (знизь якість або вимкни відео), Chrome з багатьма вкладками, OneDrive/хмарна синхронізація, Windows Update (відклади на час сесії).

### Підвищити пріоритет процесу гри

```powershell
$game = Get-Process -Name "game_exe_name"
$game.PriorityClass = "High"
```

Або через Диспетчер завдань: `Ctrl+Shift+Esc` → **Деталі** → знайди гру → ПКМ → **Встановити пріоритет** → **Вище середнього**.

---

## 7. XMP/EXPO для оперативної пам'яті

Легко пропустити, але дає реальний приріст: більшість RAM за замовчуванням працює на базовій частоті (наприклад 2133 МГц) замість заявлених 3200-6000 МГц, поки не увімкнеш профіль розгону в BIOS.

Увійди в BIOS → знайди **XMP** (Intel-системи) або **EXPO/DOCP** (AMD) → увімкни → збережи.

**Різниця в іграх: +5-15% FPS** залежно від гри і чутливості до пропускної здатності пам'яті.

---

## 8. Мережева оптимізація для онлайн-ігор

```powershell
# Вимкнути Nagle Algorithm — знижує затримку в мережевих іграх
New-Item "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces" -Force | Out-Null
# Знайди GUID свого мережевого адаптера і встанови:
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces\{GUID}" -Name "TcpAckFrequency" -Value 1 -Type DWord
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces\{GUID}" -Name "TCPNoDelay" -Value 1 -Type DWord
```

Простіше і надійніше: **підключайся кабелем замість Wi-Fi** — пінг стабільніший і нижчий, це дає більше за будь-яке налаштування реєстру.

---

## 9. Оновити DirectX і Visual C++

Більшість ігор вимагають актуальні DirectX Runtime і Visual C++ Redistributables — їхня відсутність чи застарілість часто спричиняє краші при запуску, не пов'язані з продуктивністю напряму, але типова причина "гра не запускається взагалі":

- **DirectX End-User Runtime** — microsoft.com, пошук "DirectX End-User Runtime Web Installer"
- **Visual C++ All-in-One** — github.com/abbodi1406/vcredist (пакет усіх версій одразу)

---

## 10. Файл підкачки (якщо менше 16 ГБ RAM)

`sysdm.cpl` → Додатково → Параметри (Продуктивність) → Додатково → Змінити → зніми автоматичне керування → **Особливий розмір**: початковий — 1.5× RAM у МБ, максимальний — 3× RAM у МБ.

---

## 11. Вимкнути прозорість і анімації

Невеликий, але реальний виграш на слабших системах:

`Параметри` → `Персоналізація` → `Кольори` → вимкни **Ефекти прозорості**

`sysdm.cpl` → Додатково → Параметри (Швидкодія) → **Налаштувати для найкращої швидкодії**

---

## 12. Перевірити температуру під навантаженням

Якщо FPS нестабільний і падає через кілька хвилин гри — причина, ймовірно, перегрів (thermal throttling).

Встанови **HWiNFO64**, пограй 15-30 хвилин, перевір **Maximum** температури: CPU має бути нижче 90°C, GPU — нижче 85°C. Вище — почисти від пилу і заміни термопасту.

Детальніше: [Температура CPU і GPU — повний гайд](/yak-pereviryt-temperaturu-protsesora-windows)

---

## Часті питання

### Чи покращує вимкнення Xbox Game Bar FPS?

Незначно — 1-3% в більшості ігор. Більший виграш дає вимкнення фонового відеозапису (Game DVR), а не самого Game Bar. Не варто вимикати повністю, якщо активно користуєшся кліпами чи скріншотами.

### Повноекранний чи Безрамковий (Borderless) режим?

**Повноекранний (Fullscreen)** — мінімальна затримка вводу, обирай для змагальних ігор. **Безрамковий (Borderless)** — зручніший Alt+Tab і другий монітор, але трохи вища затримка. Для казуальних ігор різниця майже непомітна.

---

## Підсумок

**Топ-5 змін з найбільшим ефектом:** план живлення Висока продуктивність → увімкни XMP/EXPO в BIOS → Game Mode + HAGS → налаштуй NVIDIA/AMD панель на максимальну продуктивність → закрий фонові програми перед грою. Разом дають +15-30% FPS без жодного апгрейду заліза. Якщо FPS все одно нестабільний — перевір температури, це найчастіша прихована причина.
