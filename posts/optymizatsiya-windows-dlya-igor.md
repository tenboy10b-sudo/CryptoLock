---
title: "Як налаштувати Windows 10 і 11 для ігор у 2026 році"
date: "2026-07-10"
publishDate: "2026-07-10"
description: "Оптимізація Windows для ігор. Game Mode, план живлення, налаштування GPU, зменшення input lag, вимкнення фонових процесів і максимум FPS."
tags: ["windows", "ігри", "продуктивність", "оптимізація", "gpu"]
readTime: 5
translatesEn: "how-to-configure-windows-10-for-gaming"
---

Windows має десятки налаштувань що впливають на ігрову продуктивність. Ось що дійсно важливо.

---

## Game Mode

```powershell
Set-ItemProperty "HKCU:\SOFTWARE\Microsoft\GameBar" -Name "AutoGameModeEnabled" -Value 1 -Type DWord
```

Або: `Win + I` → **Ігри** → **Ігровий режим** → Увімкнено

---

## План живлення для ігор

```powershell
# Ultimate Performance (прибирає стани простою CPU)
powercfg /duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61
powercfg /setactive e9a42b02-d5df-448d-aa00-03f14749eb61
```

---

## Вимкнути Xbox Game Bar (якщо не використовуєш)

```powershell
Set-ItemProperty "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\GameDVR" `
  -Name "AppCaptureEnabled" -Value 0 -Type DWord
```

---

## Hardware Accelerated GPU Scheduling (HAGS)

```powershell
# Увімкнути (Windows 11 + сучасний GPU)
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\GraphicsDrivers" `
  -Name "HwSchMode" -Value 2 -Type DWord
```

---

## Вимкнути фонові процеси

```powershell
Stop-Service DiagTrack -Force -EA 0
Set-Service DiagTrack -StartupType Disabled -EA 0
Stop-Service SysMain -Force
Set-Service SysMain -StartupType Disabled
```

---

## Налаштування GPU (NVIDIA)

В NVIDIA Control Panel:
- **Режим управління живленням** → Максимальна продуктивність
- **Режим малої затримки** → Ультра (для змагальних ігор)
- **Вертикальна синхронізація** → Вимк (використовуй G-Sync замість)

---

## Часті питання

### Чи покращує вимкнення Xbox Game Bar FPS?

Незначно — 1-3% в деяких іграх. Більший виграш від вимкнення фонового запису. Не варто якщо активно використовуєш кліпи/скріншоти.

### Повноекранний чи Безрамковий режим?

Повноекранний: мінімальна затримка вводу. Безрамковий: зручніший Alt+Tab але трохи вища затримка. Для змагальних — Повноекранний.

---

## Резюме

Game Mode і Ultimate Performance. Оновлені GPU драйвери. Вимкни Game Bar якщо не потрібен. HAGS на підтримуваному залізі. Вимкни DiagTrack і SysMain. Драйвери GPU мають найбільший вплив на FPS.
