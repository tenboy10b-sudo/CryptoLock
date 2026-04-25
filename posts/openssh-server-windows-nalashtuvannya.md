---
title: "OpenSSH сервер на Windows: встановлення і налаштування"
date: "2026-06-19"
publishDate: "2026-06-19"
description: "Як встановити і налаштувати OpenSSH сервер на Windows 10 і 11: підключення через термінал, автентифікація по ключах, налаштування sshd_config і безпека."
tags: ["windows", "мережа", "адміністрування", "безпека", "powershell"]
readTime: 7
---

OpenSSH вбудований у Windows 10 і 11 — можна підключатись до Windows через термінал так само як до Linux сервера. Корисно для адміністрування, автоматизації і безпечного доступу.

---

## Встановлення OpenSSH

```powershell
# Перевірити чи встановлений
Get-WindowsCapability -Online | Where-Object { $_.Name -like "OpenSSH*" }

# Встановити клієнт і сервер
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
```

Або через **Параметри** → **Програми** → **Додаткові функції** → **Додати функцію** → знайди OpenSSH Server і OpenSSH Client.

---

## Запустити і увімкнути автозапуск

```powershell
# Запустити службу
Start-Service sshd

# Увімкнути автозапуск
Set-Service -Name sshd -StartupType Automatic

# Перевірити статус
Get-Service sshd
```

---

## Відкрити порт у брандмауері

При встановленні правило створюється автоматично. Якщо ні:

```powershell
New-NetFirewallRule `
  -Name "OpenSSH-Server-In-TCP" `
  -DisplayName "OpenSSH Server (sshd)" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 22 `
  -Action Allow
```

---

## Підключення до Windows через SSH

З будь-якого пристрою (Linux, macOS, інший Windows):

```bash
# За іменем користувача і IP
ssh username@192.168.1.100

# За іменем ПК в мережі
ssh username@DESKTOP-ABC123

# Для Microsoft акаунту (email як логін)
ssh user@example.com@192.168.1.100
```

За замовчуванням відкривається **cmd.exe**. Щоб відкривалось PowerShell:

```powershell
# Змінити shell за замовчуванням на PowerShell
New-ItemProperty -Path "HKLM:\SOFTWARE\OpenSSH" `
  -Name DefaultShell `
  -Value "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" `
  -PropertyType String -Force

# Або PowerShell 7
New-ItemProperty -Path "HKLM:\SOFTWARE\OpenSSH" `
  -Name DefaultShell `
  -Value "C:\Program Files\PowerShell\7\pwsh.exe" `
  -PropertyType String -Force
```

---

## Автентифікація по ключах (без пароля)

Безпечніше і зручніше ніж пароль.

### На клієнті — згенерувати ключ

```bash
ssh-keygen -t ed25519 -C "my-windows-server"
# Ключі збережуться в ~/.ssh/id_ed25519 і ~/.ssh/id_ed25519.pub
```

### Скопіювати публічний ключ на Windows сервер

**Для звичайного користувача:**

```powershell
# На Windows сервері — створити папку .ssh
New-Item -ItemType Directory -Path "C:\Users\username\.ssh" -Force

# Вставити вміст id_ed25519.pub у файл authorized_keys
"ssh-ed25519 AAAAC3Nz..." | Out-File "C:\Users\username\.ssh\authorized_keys" -Encoding utf8
```

**Для адміністраторів** — ключі зберігаються в іншому місці:

```powershell
# Для членів групи Administrators
"ssh-ed25519 AAAAC3Nz..." | Out-File "C:\ProgramData\ssh\administrators_authorized_keys" -Encoding utf8

# Встановити правильні права на файл
icacls "C:\ProgramData\ssh\administrators_authorized_keys" /inheritance:r /grant "Administrators:F" /grant "SYSTEM:F"
```

---

## Налаштування sshd_config

Конфігураційний файл: `C:\ProgramData\ssh\sshd_config`

```
# Змінити порт (підвищує безпеку, ускладнює сканування)
Port 2222

# Заборонити вхід root/адміністратора напряму
PermitRootLogin no

# Дозволити тільки автентифікацію по ключах
PasswordAuthentication no
PubkeyAuthentication yes

# Дозволити тільки конкретних користувачів
AllowUsers john mary adminuser

# Максимум спроб автентифікації
MaxAuthTries 3

# Таймаут неактивної сесії (секунди)
ClientAliveInterval 300
ClientAliveCountMax 2
```

Після зміни конфігурації:

```powershell
Restart-Service sshd
```

---

## Корисні команди через SSH

```powershell
# Виконати команду на віддаленому ПК без інтерактивної сесії
ssh username@192.168.1.100 "Get-Process | Select-Object Name, CPU | Sort-Object CPU -Descending | Select -First 5"

# Скопіювати файл на Windows (SCP)
scp C:\local\file.txt username@192.168.1.100:C:\remote\

# Скопіювати файл з Windows
scp username@192.168.1.100:C:\remote\file.txt C:\local\

# Тунель — прокинути порт через SSH
ssh -L 3389:localhost:3389 username@192.168.1.100
# Тепер RDP на localhost:3389 йде через зашифрований тунель
```

---

## Захист SSH від брутфорсу

```powershell
# Встановити fail2ban-аналог для Windows — IPBan
# Автоматично блокує IP після невдалих спроб входу
# Завантаж з github.com/DigitalRuby/IPBan

# Або вручну через брандмауер — заблокувати IP після 5 невдач
# (через подію EventID 4625 в Security лозі)

# Перевірити невдалі спроби SSH входу
Get-WinEvent -FilterHashtable @{
    LogName = 'Security'
    Id = 4625
    StartTime = (Get-Date).AddHours(-24)
} | Select-Object TimeCreated, Message | Select-Object -First 20
```

---

## Підсумок

OpenSSH на Windows встановлюється одною командою `Add-WindowsCapability`. Для безпеки: увімкни автентифікацію по ключах, вимкни `PasswordAuthentication`, зміни порт з 22 на нестандартний. SSH-тунель дозволяє безпечно прокидати RDP через зашифрований канал.
