---
title: "Як увімкнути і налаштувати Remote Desktop (RDP) в Windows 10 і 11"
date: "2026-05-15"
publishDate: "2026-05-15"
description: "Як увімкнути Remote Desktop в Windows, підключитись з іншого ПК, змінити порт RDP і обмежити доступ через брандмауер. Команди PowerShell і налаштування безпеки."
tags: ["windows", "rdp", "мережа", "безпека", "адміністрування"]
readTime: 5
translatesEn: "how-to-configure-windows-remote-desktop"
---

Remote Desktop дозволяє керувати Windows ПК віддалено з іншого комп'ютера або ноутбука. Ось як увімкнути, підключитись і захистити доступ.

---

## Увімкнути Remote Desktop

**Через Параметри:**

`Win + I` → **Система** → **Віддалений робочий стіл** → перемикач **Увімкнути** → **Підтвердити**

**Через PowerShell:**

```powershell
# Увімкнути RDP
Set-ItemProperty -Path "HKLM:\System\CurrentControlSet\Control\Terminal Server" `
  -Name "fDenyTSConnections" -Value 0

# Відкрити в брандмауері
Enable-NetFirewallRule -DisplayGroup "Remote Desktop"

# Перевірити (0 = увімкнено)
(Get-ItemProperty "HKLM:\System\CurrentControlSet\Control\Terminal Server").fDenyTSConnections
```

---

## Підключитись до іншого ПК

`Win + R` → `mstsc` → введи IP адресу → Підключити → введи логін і пароль

```cmd
rem Командний рядок
mstsc /v:192.168.1.100
mstsc /v:192.168.1.100 /fullscreen
```

---

## Дізнатись IP адресу ПК для підключення

```powershell
# На ПК до якого підключаємось
Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object {$_.PrefixOrigin -ne "WellKnown"} |
  Select-Object IPAddress, InterfaceAlias
```

---

## Хто може підключатись

За замовчуванням — тільки адміністратори. Щоб додати звичайного користувача:

`Win + I` → **Система** → **Віддалений робочий стіл** → **Користувачі віддаленого робочого столу** → **Додати**

```powershell
Add-LocalGroupMember -Group "Remote Desktop Users" -Member "ім'я_користувача"
```

---

## Змінити порт RDP (безпека)

Стандартний порт 3389 постійно сканують зловмисники. Зміна зменшує кількість атак:

```powershell
# Змінити на порт 3390
Set-ItemProperty `
  -Path "HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" `
  -Name "PortNumber" -Value 3390

# Оновити правило брандмауера
New-NetFirewallRule -DisplayName "RDP 3390" -Direction Inbound `
  -Protocol TCP -LocalPort 3390 -Action Allow

# Перезапустити службу
Restart-Service TermService -Force
```

---

## Обмежити доступ за IP

```powershell
# Дозволити RDP тільки з локальної мережі
New-NetFirewallRule -DisplayName "RDP локальна мережа" `
  -Direction Inbound -Protocol TCP -LocalPort 3389 `
  -RemoteAddress "192.168.1.0/24" -Action Allow
```

---

## Увімкнути через GPO

`gpedit.msc` →

```
Computer Configuration → Administrative Templates →
Windows Components → Remote Desktop Services →
Remote Desktop Session Host → Connections
```

**Allow users to connect remotely by using Remote Desktop Services** → **Enabled**.

---

## Перевірити активні сеанси

```cmd
query session
```

Або:
```powershell
Get-Process | Where-Object {$_.Name -eq "mstsc"}
```

---

## Вимкнути RDP коли не потрібен

```powershell
Set-ItemProperty -Path "HKLM:\System\CurrentControlSet\Control\Terminal Server" `
  -Name "fDenyTSConnections" -Value 1
Disable-NetFirewallRule -DisplayGroup "Remote Desktop"
```

---

## Часті питання

### Чому не можу підключитись хоча RDP увімкнено?

Перевір брандмауер — порт 3389 має бути відкритий. Також переконайся що обліковий запис є в групі "Remote Desktop Users" і не вимкнений.

### Чи можна підключитись через інтернет?

Так, але потрібно налаштувати port forwarding на роутері (3389 → IP ПК). Безпечніше — використовувати VPN і підключатись через локальну мережу.

### Скільки одночасних підключень підтримує Windows 11?

Windows 10/11 Home і Pro — тільки 1 підключення одночасно. Для кількох підключень потрібен Windows Server.

### RDP доступний на Windows Home?

Ні, приймати підключення можна тільки на Pro/Enterprise/Education. На Home можна лише підключатись до інших ПК як клієнт.

### "Your credentials did not work" — як виправити?

Перевір формат імені (`COMPUTERNAME\Username`), чи не заблокований акаунт, чи не прострочений пароль, і чи є користувач у групі Remote Desktop Users.

### Чи безпечно відкривати RDP напряму в інтернет?

Ні, на порту 3389 постійні атаки брутфорсом. Безпечніше — VPN і підключення через тунель, або мінімум: зміна порту + NLA + сильний пароль + блокування акаунту після невдалих спроб.

---

## Резюме

Увімкнути: `fDenyTSConnections = 0` + відкрити в брандмауері. Підключитись: `mstsc /v:IP`. Для безпеки: змінити порт з 3389, обмежити по IP. Вимикай RDP коли не використовуєш.
