---
title: "Як увімкнути і захистити Remote Desktop (RDP) в Windows 10 і 11"
date: "2026-08-10"
publishDate: "2027-06-01"
description: "Увімкнення Remote Desktop в Windows, налаштування NLA автентифікації, зміна порту RDP, обмеження доступу і вирішення проблем підключення."
tags: ["windows", "rdp", "remote", "безпека", "адміністрування", "powershell"]
readTime: 4
translatesEn: "how-to-configure-windows-remote-desktop"
---

Remote Desktop дозволяє керувати Windows ПК з будь-якого місця. Ось як увімкнути безпечно.

---

## Увімкнути RDP

```powershell
Set-ItemProperty "HKLM:\System\CurrentControlSet\Control\Terminal Server" `
  -Name "fDenyTSConnections" -Value 0 -Type DWord

Enable-NetFirewallRule -DisplayGroup "Remote Desktop"
```

Або: `Win + I` → **Система** → **Віддалений робочий стіл** → Увімкнути

---

## Вимагати NLA автентифікацію

```powershell
Set-ItemProperty "HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" `
  -Name "UserAuthentication" -Value 1 -Type DWord
```

---

## Змінити порт RDP (з 3389)

```powershell
$newPort = 33891
Set-ItemProperty "HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" `
  -Name "PortNumber" -Value $newPort -Type DWord

New-NetFirewallRule -DisplayName "RDP Custom Port" `
  -Direction Inbound -Protocol TCP -LocalPort $newPort -Action Allow

Restart-Service TermService -Force
```

---

## Обмежити доступ

```powershell
Add-LocalGroupMember -Group "Remote Desktop Users" -Member "Username"
Get-LocalGroupMember -Group "Remote Desktop Users"
```

---

## Підключитись

```powershell
mstsc /v:192.168.1.50
mstsc /v:192.168.1.50:33891  # з кастомним портом
```

---

## Часті питання

### "Your credentials did not work" — як виправити?

Перевір: формат імені (`COMPUTERNAME\Username`), чи не заблокований акаунт, чи не прострочений пароль, чи є в групі Remote Desktop Users.

### Чи безпечно відкривати RDP в інтернет?

Ні напряму на порту 3389 — атаки брутфорсом постійні. Варіанти: VPN і потім RDP через тунель, або зміна порту + NLA + сильний пароль + блокування акаунту.

---

## Резюме

Увімкнення через реєстр + правило брандмауера. Завжди NLA. Змінюй порт з 3389. Обмеж групою Remote Desktop Users. Вимикай коли не потрібен.
