---
title: "Керування Windows Update: пауза, розклад і відкладення через GPO"
date: "2027-01-20"
publishDate: "2027-01-20"
description: "Як контролювати Windows Update: поставити на паузу, налаштувати активні години, відкласти функціональні оновлення через GPO і PowerShell."
tags: ["windows", "windows-update", "групова-політика", "адміністрування", "powershell"]
readTime: 4
translatesEn: "how-to-configure-windows-update-policies"
---

Windows Update може бути нав'язливим без налаштування. Ось як взяти контроль не вимикаючи патчі безпеки.

---

## Поставити на паузу (швидко)

`Win + I` → **Windows Update** → **Призупинити оновлення** → вибери тривалість (1-5 тижнів)

---

## Активні години (без перезавантаження вдень)

`Win + I` → **Windows Update** → **Додаткові параметри** → **Активні години**

```powershell
# Активні години з 8 до 22
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings" `
  -Name "ActiveHoursStart" -Value 8 -Type DWord
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\WindowsUpdate\UX\Settings" `
  -Name "ActiveHoursEnd" -Value 22 -Type DWord
```

---

## Відкласти функціональні оновлення (GPO)

```powershell
$wuPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate"
New-Item -Path $wuPath -Force | Out-Null

# Відкласти feature updates на 365 днів
Set-ItemProperty $wuPath "DeferFeatureUpdates" -Value 1 -Type DWord
Set-ItemProperty $wuPath "DeferFeatureUpdatesPeriodInDays" -Value 365 -Type DWord

# Відкласти патчі безпеки на 7 днів
Set-ItemProperty $wuPath "DeferQualityUpdates" -Value 1 -Type DWord
Set-ItemProperty $wuPath "DeferQualityUpdatesPeriodInDays" -Value 7 -Type DWord
```

---

## Встановлення вночі без перезавантаження

```powershell
$auPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU"
New-Item -Path $auPath -Force | Out-Null
Set-ItemProperty $auPath "AUOptions" -Value 4 -Type DWord
Set-ItemProperty $auPath "ScheduledInstallTime" -Value 3 -Type DWord  # 3:00
Set-ItemProperty $auPath "NoAutoRebootWithLoggedOnUsers" -Value 1 -Type DWord
```

---

## Видалити проблемне оновлення

```powershell
# Замінити номер KB на потрібний
wusa /uninstall /kb:5053656 /quiet /norestart
```

---

## Часті питання

### Чи безпечно відкладати патчі безпеки?

На 7 днів — так. Це дає Microsoft час виявити проблеми. Більше 30 днів — ризик зростає.

### Windows 11 ігнорує мої GPO налаштування оновлень?

Windows 11 Home ігнорує більшість GPO і реєстрових налаштувань оновлень. Pro і Enterprise поважають їх.

---

## Резюме

Пауза через Параметри для швидкого результату. Активні години — щоб не перезавантажувалось вдень. GPO `DeferFeatureUpdates` — залишатись на стабільній версії. `NoAutoRebootWithLoggedOnUsers` — не перезавантажуватись з увімкненим користувачем.
