---
title: "Як налаштувати DHCP сервер на Windows Server"
date: "2026-07-13"
updated: "2026-08-13"
publishDate: "2026-07-13"
description: "Встановлення і налаштування ролі DHCP Windows Server. Скопи, резервування, failover, опції PXE/NTP, журнал і типові проблеми через PowerShell."
tags: ["windows", "dhcp", "мережа", "сервер", "адміністрування", "powershell"]
readTime: 8
translatesEn: "how-to-configure-windows-dhcp-server"
---

Windows Server має повноцінну роль DHCP сервера. Ось як встановити і керувати нею через PowerShell.

---

## Встановити роль DHCP

```powershell
Install-WindowsFeature DHCP -IncludeManagementTools

# Авторизувати в Active Directory
Add-DhcpServerInDC -DnsName "DHCPServer.domain.com" -IPAddress 192.168.1.10
```

---

## Створити скоп

```powershell
Add-DhcpServerv4Scope -Name "Office LAN" `
  -StartRange "192.168.1.100" -EndRange "192.168.1.200" `
  -SubnetMask "255.255.255.0" -State Active `
  -LeaseDuration "8.00:00:00"

# Параметри скопу (шлюз, DNS)
Set-DhcpServerv4OptionValue -ScopeId "192.168.1.0" `
  -Router "192.168.1.1" -DnsServer "192.168.1.2","8.8.8.8"
```

---

## Виключити діапазон (для статичних IP)

```powershell
Add-DhcpServerv4ExclusionRange -ScopeId "192.168.1.0" `
  -StartRange "192.168.1.1" -EndRange "192.168.1.50"
```

---

## Резервування IP (завжди один і той самий для пристрою)

```powershell
Add-DhcpServerv4Reservation -ScopeId "192.168.1.0" `
  -IPAddress "192.168.1.50" `
  -ClientId "AA-BB-CC-DD-EE-FF" `
  -Name "Printer-1"

Get-DhcpServerv4Reservation -ScopeId "192.168.1.0"
```

---

## Активні лізинги

```powershell
Get-DhcpServerv4Lease -ScopeId "192.168.1.0" |
  Select-Object IPAddress, ClientId, HostName, LeaseExpiryTime
```

---

## Резервна копія і відновлення

```powershell
Backup-DhcpServer -Path "C:\DHCP-Backup"
Restore-DhcpServer -Path "C:\DHCP-Backup"
```

---

## DHCP Failover (відмовостійкість)

```powershell
Add-DhcpServerv4Failover -Name "DHCP-Failover" `
  -PartnerServer "dhcp-server2.company.local" `
  -ScopeId "192.168.1.0" -Mode LoadBalance -LoadBalancePercent 50 `
  -SharedSecret "SecureSharedSecret123!"
```

---

## Додаткові опції DHCP (NTP, PXE boot)

```powershell
# NTP сервер (опція 042)
Set-DhcpServerv4OptionValue -ScopeId "192.168.1.0" -OptionId 42 -Value "192.168.1.10"

# TFTP сервер для PXE boot (опція 066)
Set-DhcpServerv4OptionValue -ScopeId "192.168.1.0" -OptionId 66 -Value "192.168.1.10"

# Bootfile для PXE (опція 067)
Set-DhcpServerv4OptionValue -ScopeId "192.168.1.0" -OptionId 67 -Value "pxelinux.0"
```

---

## Журнал DHCP

```powershell
Get-WinEvent -FilterHashtable @{
  LogName = 'Microsoft-Windows-DHCP Server Events/Operational'
  StartTime = (Get-Date).AddHours(-24)
} | Select-Object TimeCreated, Id, Message | Format-List
```

---

## Типові проблеми

**"DHCP Server not authorized"** — авторизуй в AD (`Add-DhcpServerInDC`) і перезапусти `Restart-Service DHCPServer`.

**Scope вичерпано** — перевір `Get-DhcpServerv4ScopeStatistics`, розшир діапазон або зменш час оренди.

**Клієнт отримує 169.254.x.x** — DHCP сервер недоступний. Перевір: `Get-Service DHCPServer`, scope активний, брандмауер не блокує UDP 67/68.

---

## Часті питання

### Потрібен Windows Server чи Windows 10 підійде?

Windows 10/11 не має повноцінної ролі DHCP. Для домашніх лабораторій — DHCP роутера. Для продакшн — Windows Server або pfSense.

### Як знайти пристрій за IP?

```powershell
Get-DhcpServerv4Lease -ScopeId "192.168.1.0" | Where-Object {$_.IPAddress -eq "192.168.1.105"}
```

---

## Резюме

`Install-WindowsFeature DHCP`. Скоп через `Add-DhcpServerv4Scope`. Параметри через `Set-DhcpServerv4OptionValue`. Резервування для принтерів і серверів. Лізинги через `Get-DhcpServerv4Lease`. Failover для відмовостійкості. Резервна копія через `Backup-DhcpServer`.
