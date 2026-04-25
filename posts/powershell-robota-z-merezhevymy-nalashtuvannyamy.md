---
title: "PowerShell: управління мережевими налаштуваннями Windows"
date: "2026-07-21"
publishDate: "2026-07-21"
description: "Управління мережею через PowerShell: налаштування IP адреси, DNS, шлюзу, перевірка підключення, управління Wi-Fi профілями і мережевими адаптерами."
tags: ["powershell", "мережа", "адміністрування", "windows", "wifi"]
readTime: 6
---

PowerShell дозволяє повністю автоматизувати мережеві налаштування — від зміни IP до управління Wi-Fi профілями на сотнях ПК одразу.

---

## Перегляд мережевих адаптерів

```powershell
# Всі адаптери
Get-NetAdapter | Select-Object Name, Status, LinkSpeed, MacAddress, InterfaceDescription

# Тільки активні
Get-NetAdapter | Where-Object { $_.Status -eq "Up" }

# Детальна інформація
Get-NetIPConfiguration | Select-Object InterfaceAlias, IPv4Address, IPv4DefaultGateway, DNSServer
```

---

## Налаштування статичного IP

```powershell
$adapter = "Ethernet"

# Видалити існуючий IP
Remove-NetIPAddress -InterfaceAlias $adapter -Confirm:$false -ErrorAction SilentlyContinue
Remove-NetRoute -InterfaceAlias $adapter -Confirm:$false -ErrorAction SilentlyContinue

# Встановити статичний IP
New-NetIPAddress `
  -InterfaceAlias $adapter `
  -IPAddress "192.168.1.100" `
  -PrefixLength 24 `
  -DefaultGateway "192.168.1.1"

# Встановити DNS
Set-DnsClientServerAddress `
  -InterfaceAlias $adapter `
  -ServerAddresses "192.168.1.10", "8.8.8.8"
```

---

## Повернутись на DHCP

```powershell
$adapter = "Ethernet"

Set-NetIPInterface -InterfaceAlias $adapter -Dhcp Enabled
Set-DnsClientServerAddress -InterfaceAlias $adapter -ResetServerAddresses

# Перезапустити адаптер щоб отримати IP
Restart-NetAdapter -Name $adapter
```

---

## Управління DNS

```powershell
# Переглянути поточні DNS сервери
Get-DnsClientServerAddress | Select-Object InterfaceAlias, ServerAddresses

# Встановити DNS
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses "1.1.1.1", "1.0.0.1"

# Очистити DNS кеш
Clear-DnsClientCache

# Переглянути DNS кеш
Get-DnsClientCache | Select-Object Name, Data | Format-Table

# Перевірити DNS резолвинг
Resolve-DnsName "google.com"
Resolve-DnsName "google.com" -Server "8.8.8.8"  # через конкретний сервер
```

---

## Перевірка підключення

```powershell
# Ping
Test-Connection -ComputerName "google.com" -Count 4

# Перевірити конкретний порт (замість telnet)
Test-NetConnection -ComputerName "192.168.1.1" -Port 80
Test-NetConnection -ComputerName "server.company.local" -Port 3389  # RDP

# Трасування маршруту
Test-NetConnection -ComputerName "google.com" -TraceRoute

# Швидка перевірка без деталей
(Test-NetConnection "google.com").TcpTestSucceeded
```

---

## Управління Wi-Fi

```powershell
# Список збережених Wi-Fi профілів
netsh wlan show profiles

# Показати пароль від мережі
netsh wlan show profile name="Назва_мережі" key=clear

# Підключитись до мережі
netsh wlan connect name="Назва_мережі"

# Відключитись
netsh wlan disconnect

# Видалити збережений профіль
netsh wlan delete profile name="Стара_мережа"

# Список доступних мереж
netsh wlan show networks mode=bssid

# Вимкнути Wi-Fi адаптер
Disable-NetAdapter -Name "Wi-Fi" -Confirm:$false

# Увімкнути
Enable-NetAdapter -Name "Wi-Fi" -Confirm:$false
```

---

## Налаштування брандмауера для адаптера

```powershell
# Встановити профіль мережі (Private, Public, Domain)
Set-NetConnectionProfile -InterfaceAlias "Wi-Fi" -NetworkCategory Private

# Переглянути поточний профіль
Get-NetConnectionProfile | Select-Object InterfaceAlias, NetworkCategory
```

---

## Масове налаштування на кількох ПК

```powershell
$computers = @("PC-001", "PC-002", "PC-003")
$cred = Get-Credential

Invoke-Command -ComputerName $computers -Credential $cred -ScriptBlock {
    # Встановити DNS на кожному ПК
    Set-DnsClientServerAddress `
        -InterfaceAlias (Get-NetAdapter | Where-Object { $_.Status -eq "Up" }).Name `
        -ServerAddresses "192.168.1.10", "192.168.1.11"

    Clear-DnsClientCache
    Write-Output "$env:COMPUTERNAME: DNS оновлено"
}
```

---

## Статистика трафіку

```powershell
# Кількість переданих і отриманих даних по адаптерам
Get-NetAdapterStatistics | Select-Object Name,
    @{N="Sent MB";     E={[math]::Round($_.SentBytes/1MB, 2)}},
    @{N="Received MB"; E={[math]::Round($_.ReceivedBytes/1MB, 2)}}

# Скинути статистику
Set-NetAdapterStatistics -Name "Ethernet" -ResetStatistics
```

---

## Підсумок

`Get-NetIPConfiguration` — поточні налаштування. `New-NetIPAddress` — статичний IP. `Set-DnsClientServerAddress` — DNS. `Test-NetConnection -Port` — перевірити порт. `netsh wlan show profile key=clear` — пароль Wi-Fi. `Invoke-Command` — застосувати на всіх ПК домену одразу.
