---
title: "WiFi не підключається в Windows 10 і 11: причини і покрокове виправлення"
date: "2026-06-18"
publishDate: "2027-06-01"
updated: "2026-06-18"
description: "Що робити якщо WiFi не підключається або відключається в Windows 10 і 11. Скидання мережевих налаштувань, оновлення драйверів WiFi, виправлення помилок підключення."
tags: ["windows", "wifi", "мережа", "інтернет", "виправлення"]
readTime: 8
translatesEn: "wifi-not-connecting-windows-fix"
---

WiFi не підключається — одна з найпоширеніших проблем Windows. Причини різні: від простого "забув пароль" до пошкодженого драйвера. Ось систематичне вирішення.

---

## Швидка діагностика

```powershell
# Статус WiFi адаптера
Get-NetAdapter | Where-Object {$_.PhysicalMediaType -like '*802.11*'} |
    Select-Object Name, Status, LinkSpeed

# Поточні мережеві підключення
Get-NetConnectionProfile

# Перевірити DNS і шлюз
Get-NetIPConfiguration | Where-Object {$_.IPv4DefaultGateway}
```

---

## Крок 1 — Перезапустити адаптер

```powershell
# Вимкнути і увімкнути WiFi адаптер
$wifi = Get-NetAdapter | Where-Object {$_.PhysicalMediaType -like '*802.11*'}
Disable-NetAdapter -Name $wifi.Name -Confirm:$false
Start-Sleep 3
Enable-NetAdapter -Name $wifi.Name
```

Або вручну:
```
Диспетчер пристроїв → Мережеві адаптери → WiFi адаптер → ПКМ → Вимкнути → Увімкнути
```

---

## Крок 2 — Скинути мережеві налаштування

```powershell
# Скинути TCP/IP і Winsock
netsh winsock reset
netsh int ip reset
netsh int ipv4 reset
netsh int ipv6 reset

# Скинути DNS кеш
ipconfig /flushdns
ipconfig /release
ipconfig /renew
```

Після виконання — **перезавантаж ПК**.

---

## Крок 3 — Забути і перепідключитись до мережі

```powershell
# Показати збережені WiFi мережі
netsh wlan show profiles

# Видалити конкретну мережу (замінити WiFi_Name)
netsh wlan delete profile name="WiFi_Name"

# Видалити всі збережені мережі
netsh wlan delete profile name=* i=*
```

Після цього підключись до WiFi знову вручну і введи пароль.

---

## Крок 4 — Оновити драйвер WiFi

```powershell
# Знайти поточний драйвер
Get-WmiObject Win32_PnPSignedDriver |
    Where-Object {$_.DeviceName -like '*WiFi*' -or $_.DeviceName -like '*Wireless*'} |
    Select-Object DeviceName, DriverVersion, DriverDate
```

**Оновити:**
1. Диспетчер пристроїв → Мережеві адаптери → WiFi адаптер
2. ПКМ → Оновити драйвер → Автоматичний пошук

Або завантаж драйвер вручну з сайту виробника ноутбука/материнської плати.

---

## Крок 5 — Перевірити налаштування енергозбереження

Windows може вимикати WiFi для економії енергії:

```powershell
# Вимкнути управління живленням для WiFi адаптера
$wifi = Get-NetAdapter | Where-Object {$_.PhysicalMediaType -like '*802.11*'}
$powerMgmt = Get-WmiObject -Class MSPower_DeviceEnable -Namespace root\wmi |
    Where-Object {$_.InstanceName -like "*$($wifi.InterfaceDescription)*"}
$powerMgmt.Enable = $false
$powerMgmt.Put()
```

Або вручну:
```
Диспетчер пристроїв → WiFi адаптер → Властивості →
Управління живленням → зніми галочку "Дозволити вимкнення для економії енергії"
```

---

## Крок 6 — Перевірити службу WLAN AutoConfig

```powershell
# Перевірити статус служби
Get-Service WlanSvc

# Перезапустити
Restart-Service WlanSvc

# Якщо вимкнена — увімкнути
Set-Service WlanSvc -StartupType Automatic
Start-Service WlanSvc
```

---

## Типові помилки і рішення

### "Не вдається підключитись до цієї мережі"

```powershell
# Видалити профіль мережі
netsh wlan delete profile name="НАЗВА_МЕРЕЖІ"
# Підключись знову вручну
```

### "Обмежено" або "Без доступу до інтернету"

```powershell
# Отримати IP автоматично
Set-NetIPInterface -InterfaceAlias "Wi-Fi" -Dhcp Enabled
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ResetServerAddresses

# Або встанови Google DNS
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses ("8.8.8.8","8.8.4.4")
```

### WiFi зникає після сну

```powershell
# Вимкнути selective suspend для USB WiFi адаптерів
powercfg /setacvalueindex SCHEME_CURRENT 2a737441-1930-4402-8d77-b2bebba308a3 48e6b7a6-50f5-4782-a5d4-53bb8f07e226 0
powercfg /setactive SCHEME_CURRENT
```

### Не бачить 5 ГГц мережу

Перевір підтримку діапазону:
```powershell
netsh wlan show drivers | Select-String "Radio types"
# Має бути: 802.11a/n/ac або 802.11ax
```

---

## Засіб усунення неполадок мережі

```powershell
# Запустити вбудований troubleshooter
msdt.exe /id NetworkDiagnosticsNetworkAdapter
```

---

## Скидання мережі (Windows 10/11)

Якщо нічого не допомогло — повне скидання:

```
Win + I → Мережа та Інтернет → Стан → Скидання мережі
```

Або PowerShell:
```powershell
# Повне скидання всіх мережевих налаштувань
netsh winsock reset catalog
netsh int ipv4 reset reset.log
netsh int ipv6 reset reset.log
ipconfig /flushdns
# Перезавантаж після цього
```

---

## Резюме

| Проблема | Рішення |
|---------|---------|
| Не підключається | Забути мережу → підключитись знову |
| "Без доступу до інтернету" | DNS на 8.8.8.8, ipconfig /renew |
| Зникає після сну | Вимкнути управління живленням |
| Не бачить мережу | Оновити драйвер WiFi |
| Нічого не допомагає | Скидання мережі в Параметрах |
