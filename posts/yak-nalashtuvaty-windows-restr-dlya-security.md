---
title: "Корисні ключі реєстру Windows для безпеки і налаштування"
date: "2026-05-02"
publishDate: "2026-05-02"
description: "Практичні ключі реєстру Windows що підвищують безпеку і дозволяють налаштувати поведінку системи. Зміни що не доступні через стандартний інтерфейс."
tags: ["windows", "реєстр", "безпека", "налаштування"]
readTime: 5
---

Деякі важливі налаштування Windows доступні тільки через реєстр. Ось корисні ключі згруповані за призначенням.

---

## Безпека

```powershell
# Вимкнути автозапуск USB
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Explorer" `
  -Name "NoDriveTypeAutoRun" -Value 255 -Type DWord

# Вимкнути LLMNR (вектор атаки MITM в мережі)
New-Item -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient" -Force | Out-Null
Set-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Microsoft\Windows NT\DNSClient" `
  -Name "EnableMulticast" -Value 0 -Type DWord

# Вимкнути NetBIOS over TCP/IP для всіх адаптерів
Get-WmiObject Win32_NetworkAdapterConfiguration -Filter "IPEnabled=TRUE" |
  ForEach-Object { $_.SetTcpipNetbios(2) }  # 2 = Disable

# Вимкнути SMBv1 (застарілий, небезпечний протокол)
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\LanmanServer\Parameters" `
  -Name "SMB1" -Value 0 -Type DWord

# Вимкнути Remote Registry
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\RemoteRegistry" `
  -Name "Start" -Value 4 -Type DWord
```

---

## Продуктивність

```powershell
# Прискорити меню Start (зменшити затримку)
Set-ItemProperty -Path "HKCU:\Control Panel\Desktop" -Name "MenuShowDelay" -Value "100"

# Вимкнути програми-помічники при першому запуску
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\ContentDeliveryManager" `
  -Name "SilentInstalledAppsEnabled" -Value 0 -Type DWord

# Збільшити кількість потоків NTFS (для серверів і NAS)
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Executive" `
  -Name "AdditionalCriticalWorkerThreads" -Value 8 -Type DWord

# Пріоритет програм над фоновими службами
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\PriorityControl" `
  -Name "Win32PrioritySeparation" -Value 38 -Type DWord  # 38 = програми, 18 = збалансований
```

---

## Провідник файлів

```powershell
# Показати прихований шлях у заголовку вікна
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\CabinetState" `
  -Name "FullPath" -Value 1 -Type DWord

# Розкрити до поточної папки в лівій панелі
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" `
  -Name "NavPaneExpandToCurrentFolder" -Value 1 -Type DWord

# Відкривати Провідник до Цього ПК
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" `
  -Name "LaunchTo" -Value 1 -Type DWord  # 1 = This PC, 2 = Quick Access
```

---

## Приватність

```powershell
# Вимкнути рекламний ідентифікатор
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\AdvertisingInfo" `
  -Name "Enabled" -Value 0 -Type DWord

# Вимкнути відстеження запусків програм
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" `
  -Name "Start_TrackProgs" -Value 0 -Type DWord

# Вимкнути збір даних про введення
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Input\TIPC" `
  -Name "Enabled" -Value 0 -Type DWord -ErrorAction SilentlyContinue
```

---

## Мережа

```powershell
# Зменшити час очікування TCP
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" `
  -Name "TcpMaxDataRetransmissions" -Value 3 -Type DWord

# Збільшити розмір буферу TCP
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters" `
  -Name "GlobalMaxTcpWindowSize" -Value 65535 -Type DWord

# Вимкнути IPv6 якщо не потрібен
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip6\Parameters" `
  -Name "DisabledComponents" -Value 0xFF -Type DWord
```

---

## Резервне копіювання реєстру

Перед внесенням змін — завжди роби резервну копію:

```powershell
# Зберегти всю гілку
reg export "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer" `
  "C:\Backup\Explorer_backup.reg"

# Відновити
reg import "C:\Backup\Explorer_backup.reg"
```

Або: `Win + R` → `regedit` → правий клік на потрібній гілці → **Експортувати**.

---


---

## 🛡️ Перевір безпеку свого ПК

Хочеш знати чи немає витоків даних, зайвих служб або підозрілих програм на твоєму ПК?

**[→ AuditShield](/tools/auditshield)** — аудит Windows по 22 напрямках за 10 хвилин. HTML-звіт з оцінкою ризику. Є безкоштовне демо.


## Резюме

Найважливіші зміни для безпеки: вимкни автозапуск USB, SMBv1, LLMNR і Remote Registry. Для продуктивності: зменши MenuShowDelay і встанови пріоритет програм. Завжди роби резервну копію гілки реєстру перед змінами.
