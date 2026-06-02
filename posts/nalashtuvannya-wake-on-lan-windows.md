---
title: "Як налаштувати Wake-on-LAN в Windows 10 і 11"
date: "2026-07-21"
publishDate: "2026-07-21"
description: "Налаштування Wake-on-LAN для віддаленого включення ПК через мережу. Увімкнення в BIOS і Windows, надсилання magic packet і виправлення проблем WoL."
tags: ["windows", "wake-on-lan", "мережа", "remote", "адміністрування"]
readTime: 4
translatesEn: "how-to-use-windows-wake-on-lan"
---

Wake-on-LAN дозволяє включити ПК дистанційно надіславши "magic packet" через мережу.

---

## Крок 1: Увімкнути в BIOS

BIOS → **Power Management** → **Wake on LAN** → **Enabled**

---

## Крок 2: Увімкнути в Windows

```powershell
# Увімкнути Wake on Magic Packet
Set-NetAdapterAdvancedProperty -Name "Ethernet" `
  -DisplayName "Wake on Magic Packet" -DisplayValue "Enabled"

# Перевірити
Get-NetAdapterAdvancedProperty -Name "Ethernet" |
  Where-Object {$_.DisplayName -like "*Wake*"}
```

---

## Дізнатись MAC адресу

```powershell
# На цільовому ПК
(Get-NetAdapter | Where-Object {$_.Status -eq "Up"}).MacAddress

# З ARP кешу (після пінгу цільового ПК)
arp -a | findstr "192.168.1.50"
```

---

## Надіслати Magic Packet

```powershell
function Send-WakeOnLan {
  param([string]$MacAddress, [string]$BroadcastAddress = "255.255.255.255", [int]$Port = 9)
  
  $mac = $MacAddress -replace "[:\-\.]",""
  $packet = [byte[]](,0xFF * 6) + ($mac -split "(.{2})" | Where-Object {$_} |
    ForEach-Object {[Convert]::ToByte($_, 16)}) * 16
  
  $udp = New-Object Net.Sockets.UdpClient
  $udp.Connect($BroadcastAddress, $Port)
  $udp.EnableBroadcast = $true
  $udp.Send($packet, $packet.Length) | Out-Null
  $udp.Close()
  Write-Host "Magic packet надіслано на $MacAddress"
}

Send-WakeOnLan -MacAddress "AA-BB-CC-DD-EE-FF"
```

---

## Fast Startup і WoL

```powershell
# Вимкнути Fast Startup якщо WoL не працює після вимкнення
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Power" `
  -Name "HiberbootEnabled" -Value 0 -Type DWord
```

---

## Часті питання

### WoL працює зі сну але не з вимкнення?

Fast Startup — найпоширеніша причина. Вимкни через PowerShell вище. Також перевір в BIOS S5 WoL (Deep Sleep WoL).

### ПК включається сам вночі — як зупинити?

```powershell
powercfg /lastwake   # що останнє включало
powercfg /waketimers # активні таймери пробудження
```

---

## Резюме

Спочатку BIOS (обов'язково). Magic Packet в Windows адаптері. Fast Startup вимкнути для надійного WoL після вимкнення. MAC через `Get-NetAdapter`. Magic packet через PowerShell функцію.
