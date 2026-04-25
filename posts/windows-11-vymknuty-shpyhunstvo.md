---
title: "Як вимкнути шпигунство Windows 11: конфіденційність і телеметрія"
date: "2026-07-18"
publishDate: "2026-07-18"
description: "Повне вимкнення телеметрії, слідкування і збору даних в Windows 11: через Параметри, реєстр, PowerShell і hosts файл. Що безпечно вимикати а що ні."
tags: ["windows", "приватність", "налаштування", "безпека", "оптимізація"]
readTime: 6
---

Windows 11 збирає дані про використання системи, програм і навіть набраний текст. Більшість цього можна вимкнути — ось повний список.

---

## 1. Параметри конфіденційності — базове

`Параметри` → `Конфіденційність і безпека` → пройди кожен розділ:

**Загальне:**
- Вимкни **Рекламний ідентифікатор**
- Вимкни **Відстеження мови**
- Вимкни **Персоналізований вміст**

**Діагностика і відгуки:**
- Діагностичні дані → **Обов'язкові** (мінімум)
- Вимкни **Покращення рукопису та набору**
- Вимкни **Налаштовані можливості**
- Вимкни **Надсилання відгуків** або встанови рідше

**Журнал активності:**
- Вимкни **Зберігати журнал активності**
- Натисни **Очистити журнал активності**

**Дозволи програм** — перевір кожен розділ (Камера, Мікрофон, Геолокація, Контакти тощо) і вимкни доступ для програм яким він не потрібен.

---

## 2. Вимкнути телеметрію через реєстр

```powershell
# Мінімальна телеметрія (0 = Off, але тільки Enterprise/Server)
# Для Home/Pro мінімум = 1 (Security and Basic)
$telPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection"
New-Item $telPath -Force | Out-Null
Set-ItemProperty $telPath -Name "AllowTelemetry" -Value 0 -Type DWord

# Вимкнути Connected User Experiences (служба телеметрії)
Set-ItemProperty $telPath -Name "DisableOneSettingsDownloads" -Value 1 -Type DWord

# Вимкнути Customer Experience Improvement Program
$sqmPath = "HKLM:\SOFTWARE\Policies\Microsoft\SQMClient\Windows"
New-Item $sqmPath -Force | Out-Null
Set-ItemProperty $sqmPath -Name "CEIPEnable" -Value 0 -Type DWord
```

---

## 3. Вимкнути служби телеметрії

```powershell
$telServices = @(
    "DiagTrack",          # Connected User Experiences and Telemetry
    "dmwappushservice",   # WAP Push Message Routing
    "SysMain",            # Superfetch (телеметрія використання)
    "WSearch"             # Windows Search (індексує і відправляє дані)
)

foreach ($svc in $telServices) {
    $s = Get-Service -Name $svc -ErrorAction SilentlyContinue
    if ($s) {
        Stop-Service $svc -Force -ErrorAction SilentlyContinue
        Set-Service $svc -StartupType Disabled
        Write-Output "Вимкнено: $svc"
    }
}
```

> **Увага:** `WSearch` вимикає пошук у меню Пуск. `SysMain` може сповільнити завантаження програм на HDD.

---

## 4. Заблокувати сервери телеметрії через hosts

```powershell
$hostsPath = "C:\Windows\System32\drivers\etc\hosts"

$telemetryHosts = @(
    "vortex.data.microsoft.com",
    "vortex-win.data.microsoft.com",
    "telecommand.telemetry.microsoft.com",
    "telemetry.microsoft.com",
    "watson.telemetry.microsoft.com",
    "watson.ppe.telemetry.microsoft.com",
    "redir.metaservices.microsoft.com",
    "choice.microsoft.com",
    "df.telemetry.microsoft.com",
    "reports.wes.df.telemetry.microsoft.com"
)

$entries = $telemetryHosts | ForEach-Object { "0.0.0.0 $_" }
Add-Content -Path $hostsPath -Value ($entries -join "`n")

# Очистити DNS кеш
ipconfig /flushdns
Write-Output "✓ Сервери телеметрії заблоковані"
```

---

## 5. Вимкнути Cortana і хмарний пошук

```powershell
# Вимкнути Cortana
$cortanaPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Windows Search"
New-Item $cortanaPath -Force | Out-Null
Set-ItemProperty $cortanaPath -Name "AllowCortana" -Value 0 -Type DWord

# Вимкнути пошук в інтернеті через меню Пуск
Set-ItemProperty $cortanaPath -Name "DisableWebSearch" -Value 1 -Type DWord
Set-ItemProperty $cortanaPath -Name "ConnectedSearchUseWeb" -Value 0 -Type DWord
```

---

## 6. Вимкнути Cloud Clipboard і синхронізацію

`Параметри` → `Система` → `Буфер обміну` → вимкни **Синхронізацію в хмарі**

```powershell
Set-ItemProperty "HKCU:\SOFTWARE\Microsoft\Clipboard" -Name "EnableCloudClipboard" -Value 0 -Type DWord
```

---

## 7. Вимкнути автоматичне надсилання зразків у Defender

`Безпека Windows` → `Захист від вірусів` → `Параметри захисту від вірусів` → **Автоматичне надсилання зразків** → вимкни

```powershell
Set-MpPreference -SubmitSamplesConsent NeverSend
```

---

## Що НЕ варто вимикати

- **Windows Update** — оновлення безпеки критичні
- **Windows Defender / Security Center** — антивірусний захист
- **EventLog** — потрібен для діагностики
- **Firewall** — брандмауер
- Сервіси пов'язані з друком, мережею, звуком

---

## Перевірити що вимкнено

```powershell
# Перевірити статус DiagTrack
Get-Service DiagTrack | Select-Object Status, StartType

# Перевірити телеметрію в реєстрі
Get-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows\DataCollection" -Name AllowTelemetry
```

---

## Підсумок

Найважливіші кроки: `Параметри` → Конфіденційність → вимкни рекламний ідентифікатор і журнал активності. Зупини службу `DiagTrack`. Заблокуй сервери телеметрії через hosts. Разом це суттєво зменшує обсяг даних що відправляються Microsoft без шкоди для роботи системи.
