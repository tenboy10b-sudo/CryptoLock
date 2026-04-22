---
title: "Як вимкнути telemetry і збір даних в Windows 10 і 11"
date: "2026-04-01"
description: "Вимкнення телеметрії, діагностичних даних і стеження Windows через Settings, GPO і реєстр для захисту приватності."
tags: ["приватність", "windows", "безпека", "реєстр"]
readTime: 6
---

Windows за замовчуванням збирає багато даних про використання системи. Ось як мінімізувати цей збір.

## Що збирає Windows

- Дані про помилки і вильоти програм
- Статистику використання програм
- Введений текст (для покращення автозаповнення)
- Дані голосового асистента Cortana
- Інформацію про встановлене ПЗ

---

## Спосіб 1: Через Settings

**Windows 11:**
`Win + I` → **Privacy & security** → **Diagnostics & feedback**:
- **Diagnostic data** → **Required only** (мінімум)
- **Improve inking & typing** → Off
- **Tailored experiences** → Off
- **View diagnostic data** → увімкни щоб бачити що збирається

`Win + I` → **Privacy & security** → **General**:
- Всі перемикачі → Off

---

## Спосіб 2: Через GPO

`gpedit.msc` → перейди:
```
Computer Configuration
  → Administrative Templates
    → Windows Components
      → Data Collection and Preview Builds
```

**Allow Diagnostic Data** → **Enabled** → вибери **0 - Security [Enterprise Only]** або **1 - Basic**.

Значення `0` повністю вимикає телеметрію (тільки на Enterprise).

---

## Спосіб 3: Через реєстр

```cmd
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f
```

---

## Вимкнути службу телеметрії

```cmd
sc config DiagTrack start= disabled
sc stop DiagTrack
sc config dmwappushservice start= disabled
sc stop dmwappushservice
```

---

## Заблокувати сервери телеметрії через hosts

Додай в `C:\Windows\System32\drivers\etc\hosts`:
```
0.0.0.0 vortex.data.microsoft.com
0.0.0.0 settings-win.data.microsoft.com
0.0.0.0 telemetry.microsoft.com
0.0.0.0 watson.telemetry.microsoft.com
```

---

## Вимкнути рекламний ID

`Win + I` → **Privacy & security** → **General** → **Let apps show me personalized ads** → Off.

Або через реєстр:
```cmd
reg add "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\AdvertisingInfo" /v Enabled /t REG_DWORD /d 0 /f
```

---

## Важлива порада

Повністю вимкнути телеметрію на Home і Pro версіях Windows технічно неможливо — Microsoft зберігає мінімальний збір навіть при значенні 0. Enterprise версія дозволяє повне вимкнення.

Для максимальної приватності також вимкни:
- Cortana
- Windows Search online results
- Activity History (`Win + I` → Privacy → Activity history → вимкни)
