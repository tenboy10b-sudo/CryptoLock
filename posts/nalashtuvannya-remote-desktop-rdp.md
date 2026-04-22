---
title: "Як налаштувати Remote Desktop (RDP) в Windows 10 і 11"
date: "2025-05-14"
description: "Увімкнення і налаштування Remote Desktop Protocol в Windows: через Settings, PowerShell і через GPO. Безпечне підключення до ПК віддалено."
tags: ["rdp", "мережа", "windows", "адміністрування"]
readTime: 6
---

Remote Desktop дозволяє підключатись до ПК віддалено — з іншого комп'ютера, ноутбука або телефону. Розберемо як налаштувати правильно і безпечно.

## Увімкнути RDP через Settings

**Windows 11:**
`Win + I` → **System** → **Remote Desktop** → перемикач **Remote Desktop** → Enable.

**Windows 10:**
`Win + I` → **System** → **Remote Desktop** → **Enable Remote Desktop** → Confirm.

> RDP доступний тільки на **Windows Pro**, **Enterprise** і **Education**. На Windows Home — тільки підключатись, не приймати з'єднання.

---

## Через командний рядок

```cmd
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 0 /f
netsh advfirewall firewall set rule group="Remote Desktop" new enable=Yes
```

Або через PowerShell:
```powershell
Set-ItemProperty -Path "HKLM:\System\CurrentControlSet\Control\Terminal Server" -Name "fDenyTSConnections" -Value 0
Enable-NetFirewallRule -DisplayGroup "Remote Desktop"
```

---

## Через GPO

`gpedit.msc` → перейди:
```
Computer Configuration
  → Administrative Templates
    → Windows Components
      → Remote Desktop Services
        → Remote Desktop Session Host
          → Connections
```

**Allow users to connect remotely by using Remote Desktop Services** → **Enabled**.

---

## Хто може підключатись

За замовчуванням — тільки адміністратори. Щоб додати інших користувачів:

`Win + X` → **System** → **Remote Desktop** → **Select users** → Add → введи ім'я → OK.

Або через CMD:
```cmd
net localgroup "Remote Desktop Users" username /add
```

---

## Підключитись до іншого ПК

`Win + R` → `mstsc` → введи IP або ім'я ПК → Connect → введи логін і пароль.

Або через PowerShell:
```powershell
mstsc /v:192.168.1.100
```

---

## Налаштування безпеки RDP

**Змінити порт (замість стандартного 3389):**
```cmd
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" /v PortNumber /t REG_DWORD /d 33890 /f
```

Після зміни порту перезапусти службу і оновлюй правило брандмауера.

**Увімкнути Network Level Authentication (NLA) — обов'язково:**
```cmd
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" /v UserAuthentication /t REG_DWORD /d 1 /f
```

NLA вимагає автентифікацію до відкриття сесії — захищає від brute force атак.

---

## Перевірити поточні підключення

```cmd
query session
```

Або:
```powershell
Get-Process | Where-Object {$_.Name -eq "mstsc"}
```

---

## Відключити RDP коли не потрібен

```cmd
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 1 /f
netsh advfirewall firewall set rule group="Remote Desktop" new enable=No
```

> Не тримай RDP відкритим якщо не використовуєш — порт 3389 постійно сканують боти.
