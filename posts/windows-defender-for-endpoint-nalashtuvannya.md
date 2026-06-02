---
title: "Microsoft Defender for Endpoint (ATP): налаштування і підключення пристроїв"
date: "2026-08-05"
publishDate: "2026-08-05"
description: "Налаштування Microsoft Defender for Endpoint для розширеного виявлення загроз. Підключення пристроїв, перевірка стану і розслідування інцидентів."
tags: ["windows", "windows-defender", "atp", "безпека", "адміністрування"]
readTime: 4
translatesEn: "how-to-configure-windows-defender-atp"
---

Defender for Endpoint забезпечує корпоративне виявлення загроз понад стандартний Defender — поведінковий аналіз і EDR.

---

## Що додає Defender for Endpoint

Стандартний Defender: виявлення за сигнатурами + хмарна евристика

Defender for Endpoint додає:
- **EDR** — виявлення і розслідування атак в реальному часі
- **Threat & Vulnerability Management** — інвентаризація вразливостей
- **ASR правила** — блокування технік атак
- **Автоматичне розслідування** — автовідповідь на інциденти
- **Advanced Hunting** — запити 6-місячної поведінкової історії через KQL

---

## Перевірити статус

```powershell
# Чи підключений пристрій
$sense = Get-Service -Name "Sense" -EA 0
if ($sense) { Write-Host "Defender for Endpoint: $($sense.Status)" }

# Статус підключення
$status = Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows Advanced Threat Protection\Status" -EA 0
if ($status) { Write-Host "Підключено: $($status.OnboardingState)" }
```

---

## Підключити через скрипт

```powershell
# Завантаж пакет підключення з порталу Microsoft 365 Defender:
# security.microsoft.com → Settings → Endpoints → Onboarding

# Запусти скрипт від адміністратора
& "C:\Downloads\WindowsDefenderATPOnboardingScript.cmd"

# Перевір через 5-10 хвилин
Get-Service Sense | Select-Object Status
```

---

## Advanced Hunting (KQL)

Портал Microsoft 365 Defender → Advanced Hunting:

```kql
// Всі запуски PowerShell за 24 години
DeviceProcessEvents
| where Timestamp > ago(24h)
| where ProcessVersionInfoProductName == "Windows PowerShell"
| project Timestamp, DeviceName, ProcessCommandLine, AccountName
| order by Timestamp desc
```

---

## Часті питання

### Defender for Endpoint доступний без Microsoft 365?

Так — окремо (P1/P2) або в складі Microsoft 365 Business Premium, E3/E5.

### Скільки часу до появи пристрою в порталі?

5-30 хвилин. Якщо після 30 хвилин відсутній — перевір чи запущена служба Sense і чи є підключення до інтернету.

---

## Резюме

Стандартний Defender для більшості загроз. Defender for Endpoint для підприємства — EDR, Advanced Hunting і автовідповідь. Підключення через скрипт або GPO. `Get-Service Sense` для перевірки статусу.
