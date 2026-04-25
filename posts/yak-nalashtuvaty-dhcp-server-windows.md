---
title: "DHCP сервер на Windows Server: встановлення і налаштування"
date: "2026-07-12"
publishDate: "2026-07-12"
description: "Встановлення і налаштування DHCP сервера на Windows Server: створення scope, резервування IP за MAC-адресою, опції DHCP і моніторинг через PowerShell."
tags: ["адміністрування", "мережа", "windows", "powershell"]
readTime: 7
---

DHCP сервер автоматично видає IP-адреси пристроям у мережі. Правильно налаштований DHCP — основа стабільної корпоративної мережі.

---

## Встановлення ролі DHCP

```powershell
# Встановити роль DHCP сервера
Install-WindowsFeature -Name DHCP -IncludeManagementTools

# Авторизувати DHCP сервер у домені Active Directory
Add-DhcpServerInDC -DnsName "dhcp-server.company.local" -IPAddress 192.168.1.10

# Перевірити авторизацію
Get-DhcpServerInDC
```

---

## Створити Scope (діапазон адрес)

```powershell
# Створити основний scope
Add-DhcpServerv4Scope `
  -Name "Office Network" `
  -StartRange 192.168.1.100 `
  -EndRange 192.168.1.200 `
  -SubnetMask 255.255.255.0 `
  -Description "Основна офісна мережа" `
  -State Active

# Встановити опції scope — шлюз і DNS
Set-DhcpServerv4OptionValue `
  -ScopeId 192.168.1.0 `
  -Router 192.168.1.1 `
  -DnsServer 192.168.1.10, 8.8.8.8 `
  -DnsDomain "company.local"

# Встановити час оренди (lease) — 8 днів
Set-DhcpServerv4Scope `
  -ScopeId 192.168.1.0 `
  -LeaseDuration (New-TimeSpan -Days 8)

# Виключити діапазон (статичні IP)
Add-DhcpServerv4ExclusionRange `
  -ScopeId 192.168.1.0 `
  -StartRange 192.168.1.1 `
  -EndRange 192.168.1.50
```

---

## Резервування IP за MAC-адресою

Конкретний пристрій завжди отримує один і той самий IP.

```powershell
# Дізнатись MAC-адресу пристрою
# На пристрої: ipconfig /all → Physical Address

# Зарезервувати IP для конкретного MAC
Add-DhcpServerv4Reservation `
  -ScopeId 192.168.1.0 `
  -IPAddress 192.168.1.101 `
  -ClientId "00-1A-2B-3C-4D-5E" `
  -Description "HP Printer Floor 2" `
  -Name "hp-printer-2"

# Переглянути всі резервації
Get-DhcpServerv4Reservation -ScopeId 192.168.1.0 |
  Select-Object IPAddress, ClientId, Name, Description |
  Format-Table -AutoSize

# Видалити резервацію
Remove-DhcpServerv4Reservation -ScopeId 192.168.1.0 -IPAddress 192.168.1.101
```

---

## Моніторинг і статистика

```powershell
# Статистика scope — скільки адрес видано
Get-DhcpServerv4ScopeStatistics -ScopeId 192.168.1.0

# Всі активні оренди
Get-DhcpServerv4Lease -ScopeId 192.168.1.0 |
  Select-Object IPAddress, ClientId, HostName, LeaseExpiryTime, AddressState |
  Format-Table -AutoSize

# Знайти оренду за IP
Get-DhcpServerv4Lease -ScopeId 192.168.1.0 -IPAddress 192.168.1.105

# Знайти за hostname
Get-DhcpServerv4Lease -ScopeId 192.168.1.0 |
  Where-Object { $_.HostName -like "*printer*" }

# Загальна статистика сервера
Get-DhcpServerv4Statistics
```

---

## Налаштування DHCP Failover (відмовостійкість)

```powershell
# Налаштувати failover між двома DHCP серверами
Add-DhcpServerv4Failover `
  -Name "DHCP-Failover" `
  -PartnerServer "dhcp-server2.company.local" `
  -ScopeId 192.168.1.0 `
  -Mode LoadBalance `
  -LoadBalancePercent 50 `
  -SharedSecret "SecureSharedSecret123!"
```

---

## Налаштування DHCP опцій

```powershell
# Переглянути всі доступні опції
Get-DhcpServerv4OptionDefinition

# Встановити NTP сервер (опція 042)
Set-DhcpServerv4OptionValue -ScopeId 192.168.1.0 -OptionId 42 -Value "192.168.1.10"

# TFTP сервер для PXE boot (опція 066)
Set-DhcpServerv4OptionValue -ScopeId 192.168.1.0 -OptionId 66 -Value "192.168.1.10"

# Bootfile для PXE (опція 067)
Set-DhcpServerv4OptionValue -ScopeId 192.168.1.0 -OptionId 67 -Value "pxelinux.0"
```

---

## Журнал DHCP

```powershell
# Знайти коли пристрій отримав IP (з лог файлів)
$logPath = "C:\Windows\System32\dhcp"
Get-ChildItem $logPath -Filter "DhcpSrvLog-*.log" |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1 |
  Get-Content |
  Where-Object { $_ -match "192.168.1.105" }
```

Або перевір через Event Viewer:

```powershell
Get-WinEvent -FilterHashtable @{
  LogName = 'Microsoft-Windows-DHCP Server Events/Operational'
  StartTime = (Get-Date).AddHours(-24)
} | Select-Object TimeCreated, Id, Message | Format-List
```

---

## Типові проблеми

### "DHCP Server not authorized"

```powershell
# Авторизувати в AD
Add-DhcpServerInDC -DnsName "dhcp-server.company.local" -IPAddress 192.168.1.10
Restart-Service DHCPServer
```

### Scope вичерпано (немає вільних адрес)

```powershell
# Переглянути статистику
Get-DhcpServerv4ScopeStatistics -ScopeId 192.168.1.0

# Розширити діапазон
Set-DhcpServerv4Scope -ScopeId 192.168.1.0 -EndRange 192.168.1.250

# Або зменшити час оренди щоб звільнились адреси
Set-DhcpServerv4Scope -ScopeId 192.168.1.0 -LeaseDuration (New-TimeSpan -Days 1)
```

### Клієнт отримує 169.254.x.x замість нормального IP

Клієнт не може дістатись DHCP сервера. Перевір:
- DHCP сервер запущений: `Get-Service DHCPServer`
- Scope активний: `Get-DhcpServerv4Scope`
- Брандмауер не блокує UDP 67/68

---

## Підсумок

`Add-DhcpServerv4Scope` — створити діапазон. `Set-DhcpServerv4OptionValue` — шлюз і DNS. `Add-DhcpServerv4Reservation` — закріпити IP за MAC. `Get-DhcpServerv4Lease` — переглянути хто що отримав. Failover між двома серверами — для відмовостійкості в критичних мережах.
