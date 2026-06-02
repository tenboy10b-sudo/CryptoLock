---
title: "Як налаштувати DNS сервер Windows: зони, записи і PowerShell"
date: "2026-07-14"
publishDate: "2026-07-14"
description: "Встановлення і налаштування ролі DNS Windows Server. Зони прямого і зворотного пошуку, записи A, CNAME, MX, пересилачі і управління через PowerShell."
tags: ["windows", "dns", "сервер", "мережа", "адміністрування", "powershell"]
readTime: 5
translatesEn: "how-to-configure-windows-server-dns-role"
---

DNS сервер Windows — основа Active Directory і внутрішньої роздільної здатності імен.

---

## Встановити роль DNS

```powershell
Install-WindowsFeature DNS -IncludeManagementTools
Start-Service DNS
Set-Service DNS -StartupType Automatic
```

---

## Створити зону прямого пошуку

```powershell
Add-DnsServerPrimaryZone -Name "company.local" `
  -ReplicationScope "Domain" -DynamicUpdate Secure

Get-DnsServerZone | Select-Object ZoneName, ZoneType
```

---

## Додати DNS записи

```powershell
# A запис (хост → IP)
Add-DnsServerResourceRecordA -ZoneName "company.local" `
  -Name "webserver" -IPv4Address "192.168.1.20"

# CNAME (псевдонім)
Add-DnsServerResourceRecordCName -ZoneName "company.local" `
  -Name "www" -HostNameAlias "webserver.company.local"

# MX (пошта)
Add-DnsServerResourceRecordMX -ZoneName "company.local" `
  -Name "@" -MailExchange "mail.company.local" -Preference 10

# TXT (SPF)
Add-DnsServerResourceRecordTxt -ZoneName "company.local" `
  -Name "@" -DescriptiveText "v=spf1 ip4:192.168.1.0/24 ~all"
```

---

## Переглянути і видалити записи

```powershell
Get-DnsServerResourceRecord -ZoneName "company.local" -RRType "A"

Remove-DnsServerResourceRecord -ZoneName "company.local" `
  -Name "webserver" -RRType "A" -RecordData "192.168.1.20" -Force
```

---

## Налаштувати пересилачі

```powershell
Add-DnsServerForwarder -IPAddress "1.1.1.1"
Add-DnsServerForwarder -IPAddress "8.8.8.8"
Get-DnsServerForwarder
```

---

## Тест роздільної здатності

```powershell
Resolve-DnsName "webserver.company.local" -Server "192.168.1.10"
```

---

## Часті питання

### Різниця між пересилачами і кореневими підказками?

Пересилачі відправляють невідомі запити на конкретні DNS сервери (1.1.1.1). Коренева підказка вирішує запити ідучи від кореневих серверів вниз. Пересилачі швидші для корпоративних середовищ.

### Як мігрувати DNS зони на інший сервер?

Експорт: `Export-DnsServerZone -ZoneName "company.local" -Filename "company.local.dns"`. Імпорт: `Add-DnsServerPrimaryZone -Name "company.local" -ZoneFile "company.local.dns"`.

---

## Резюме

`Install-WindowsFeature DNS`. Зони через `Add-DnsServerPrimaryZone`. Записи через `Add-DnsServerResourceRecord*`. Пересилачі для інтернет роздільної здатності. Умовні пересилачі для гібридних хмар.
