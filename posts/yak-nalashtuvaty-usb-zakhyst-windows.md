---
title: "Захист від USB загроз в Windows: як заблокувати невідомі пристрої"
date: "2026-09-01"
publishDate: "2026-09-01"
description: "Як захистити Windows від шкідливих USB пристроїв: вимкнути автозапуск, заблокувати підключення нових USB через GPO і обмежити доступ до знімних носіїв."
tags: ["windows", "безпека", "usb", "групова-політика"]
readTime: 4
---

USB загрози — реальна проблема: заражені флешки, апаратні кейлоггери, BadUSB атаки. Ось як захиститись.

---

## Вимкнути автозапуск USB

Автозапуск — найстаріший вектор USB атак. Вимикається за 30 секунд.

```powershell
# Вимкнути AutoRun для всіх дисків
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer" `
  -Name "NoDriveTypeAutoRun" -Value 255 -Type DWord
```

Або через GPO: `gpedit.msc` → **Конфігурація комп'ютера** → **Адміністративні шаблони** → **Компоненти Windows** → **Політики автозапуску** → **Вимкнути автозапуск** → **Увімкнено** → **Всі диски**.

---

## Заблокувати підключення нових USB пристроїв

Дозволяє тільки вже підключені пристрої, нові — не розпізнаються.

`gpedit.msc` → **Конфігурація комп'ютера** → **Адміністративні шаблони** → **Система** → **Встановлення пристроїв** → **Обмеження встановлення пристроїв** → **Заборонити встановлення знімних пристроїв** → **Увімкнено**.

---

## Заборонити запис на USB (тільки читання)

```powershell
# Тільки читання з USB накопичувачів
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\StorageDevicePolicies" `
  -Name "WriteProtect" -Value 1 -Type DWord
```

Якщо ключ не існує:
```powershell
New-Item -Path "HKLM:\SYSTEM\CurrentControlSet\Control\StorageDevicePolicies" -Force
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\StorageDevicePolicies" `
  -Name "WriteProtect" -Value 1 -Type DWord
```

---

## Повністю вимкнути USB сховище через GPO

`gpedit.msc` → **Конфігурація комп'ютера** → **Адміністративні шаблони** → **Система** → **Доступ до знімних носіїв**:

- **Знімні диски: Заборонити читання** → Увімкнено
- **Знімні диски: Заборонити запис** → Увімкнено

Або для поточного користувача через **Конфігурація користувача**.

---

## Windows Defender і USB загрози

Windows Defender автоматично сканує підключені USB пристрої. Переконайся що він активний:

```powershell
# Перевірити статус захисту в реальному часі
Get-MpComputerStatus | Select-Object RealTimeProtectionEnabled

# Примусово просканувати конкретний диск
Start-MpScan -ScanType CustomScan -ScanPath "E:\"
```

---

## Білий список USB пристроїв (корпоративне)

Для бізнес середовища — дозволити тільки конкретні пристрої по Hardware ID:

`gpedit.msc` → **Встановлення пристроїв** → **Дозволити встановлення пристроїв відповідно до ідентифікаторів пристроїв**

Додай Hardware ID дозволених флешок (знайди в Диспетчері пристроїв → Властивості → Деталі → Ідентифікатори обладнання).

---

## Перевірити підключені USB пристрої

```powershell
# Поточні USB пристрої
Get-WmiObject Win32_USBHub | Select-Object Name, DeviceID

# Всі USB пристрої що підключались (з реєстру)
Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Enum\USBSTOR\*\*" |
  Select-Object FriendlyName, @{n='LastConnected';e={$_.Properties.LastConnectedTime}} -ErrorAction SilentlyContinue
```

---

## Резюме

Мінімум: вимкни автозапуск через реєстр або GPO. Для підвищеної безпеки: заборони запис на знімні носії. Для корпоративного середовища: білий список пристроїв через GPO. Завжди скануй невідомі флешки перед відкриттям файлів.
