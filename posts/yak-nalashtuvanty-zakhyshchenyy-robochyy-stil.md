---
title: "Як налаштувати безпечне робоче середовище в Windows для чутливих даних"
date: "2026-08-25"
publishDate: "2026-08-25"
description: "Налаштування захищеного робочого місця в Windows: шифрування диска, захист від витоку даних, контроль буфера обміну, обмеження знімків екрана і DLP."
tags: ["безпека", "windows", "захист", "шифрування", "адміністрування"]
readTime: 6
---

Якщо ти працюєш з конфіденційними даними клієнтів, медичними записами або фінансовими документами — стандартних налаштувань Windows недостатньо. Ось що потрібно додатково.

---

## 1. Шифрування диска BitLocker

Перший і найважливіший захід — якщо ноутбук вкрадуть, дані залишаться недоступними.

```powershell
# Перевірити статус BitLocker
Get-BitLockerVolume -MountPoint C: | Select-Object MountPoint, EncryptionMethod, ProtectionStatus

# Увімкнути з TPM
Enable-BitLocker -MountPoint "C:" -EncryptionMethod XtsAes256 -TpmProtector

# Зберегти ключ відновлення
Backup-BitLockerKeyProtector -MountPoint "C:" -KeyProtectorId (Get-BitLockerVolume C:).KeyProtector[0].KeyProtectorId
```

Детальніше: [Як зашифрувати диск BitLocker](/yak-zashyfruvaty-dysk-bitlocker)

---

## 2. Шифрування знімного носія

Флешки і зовнішні диски з даними — окреме шифрування.

Детальніше: [BitLocker To Go для флешок](/yak-zashyfruvaty-fleshku-bitlocker-to-go)

---

## 3. Захист буфера обміну

Буфер обміну в Windows 11 має хмарну синхронізацію — це ризик витоку.

```powershell
# Вимкнути хмарну синхронізацію буфера
Set-ItemProperty "HKCU:\SOFTWARE\Microsoft\Clipboard" `
  -Name "EnableCloudClipboard" -Value 0 -Type DWord

# Вимкнути буфер обміну з історією якщо не потрібен
Set-ItemProperty "HKCU:\SOFTWARE\Microsoft\Clipboard" `
  -Name "EnableClipboardHistory" -Value 0 -Type DWord
```

---

## 4. Захист від знімків екрана

Для додатків що показують чутливі дані:

```powershell
# Через GPO — заборонити знімки екрана для всіх
# Computer Configuration → Administrative Templates → Windows Components
# → Portable Device → Prevent Screen Capture

# Через реєстр
New-Item "HKLM:\SOFTWARE\Policies\Microsoft\Windows\PersonalizationCSP" -Force | Out-Null
Set-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows\PersonalizationCSP" `
  -Name "PreventScreenCapture" -Value 1 -Type DWord
```

---

## 5. Автоматичне блокування і тайм-аут сесії

```powershell
# Блокування через 5 хвилин неактивності
$regPath = "HKCU:\Control Panel\Desktop"
Set-ItemProperty $regPath -Name "ScreenSaveActive" -Value "1"
Set-ItemProperty $regPath -Name "ScreenSaveTimeOut" -Value "300"
Set-ItemProperty $regPath -Name "ScreenSaverIsSecure" -Value "1"

# Заставка — порожній екран (найшвидша)
Set-ItemProperty $regPath -Name "SCRNSAVE.EXE" -Value "scrnsave.scr"
```

Детальніше: [Автоматичне блокування екрана](/avto-blokuvannya-ekranu-gpo)

---

## 6. Заборона копіювання на USB

Для середовищ де дані не повинні покидати ПК:

Детальніше: [Групова політика — заборона USB](/grupova-polityka-zaborona-usb)

---

## 7. Захищений браузер для веб-роботи

```powershell
# Запустити Chrome в режимі інкогніто без розширень
Start-Process "chrome.exe" -ArgumentList "--incognito --disable-extensions --no-sandbox"

# Edge в режимі InPrivate
Start-Process "msedge.exe" -ArgumentList "--inprivate"
```

---

## 8. Шифрування чутливих файлів (EFS)

Encrypting File System — шифрування на рівні файлів для NTFS.

```powershell
# Зашифрувати папку з документами
cipher /e /s:"C:\ConfidentialDocs"

# Переглянути зашифровані файли
cipher /u /n
```

> EFS прив'язаний до облікового запису. При його видаленні — доступ до файлів буде втрачено без резервної копії сертифіката.

---

## 9. Аудит доступу до чутливих папок

```powershell
# Увімкнути аудит доступу до папки
$acl = Get-Acl "C:\ConfidentialDocs"
$audit = New-Object System.Security.AccessControl.FileSystemAuditRule(
    "Everyone",
    "Read,Write,Delete",
    "ContainerInherit,ObjectInherit",
    "None",
    "Success,Failure"
)
$acl.SetAuditRule($audit)
Set-Acl "C:\ConfidentialDocs" $acl

# Переглядати спроби доступу
Get-WinEvent -FilterHashtable @{
    LogName = 'Security'
    Id = 4663
    StartTime = (Get-Date).AddDays(-1)
} | Select-Object TimeCreated, Message | Format-List
```

---

## 10. Windows Defender Application Control (WDAC)

Дозволяє запускати тільки довірені програми:

```powershell
# Перевірити поточну політику
Get-CIPolicy -FilePath "C:\Windows\System32\CodeIntegrity\SiPolicy.p7b"
```

Налаштування WDAC — складний процес, рекомендується через Microsoft SCCM або Intune в корпоративному середовищі.

---

## Підсумок

Мінімальний захист для чутливих даних: BitLocker → автоблокування через 5 хв → вимкнути хмарний буфер обміну → заборона USB якщо потрібно → аудит доступу до папок з чутливими документами. Ці 5 заходів закривають більшість векторів витоку даних на рівні робочої станції.
