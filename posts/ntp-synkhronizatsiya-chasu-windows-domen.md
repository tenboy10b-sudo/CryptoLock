---
title: "Синхронізація часу в Windows і домені Active Directory: NTP налаштування"
date: "2026-06-10"
publishDate: "2026-06-10"
description: "Налаштування NTP синхронізації часу в Windows, виправлення помилок часу в домені Active Directory, w32tm команди і налаштування ієрархії часу для корпоративної мережі."
tags: ["адміністрування", "windows", "мережа", "cmd", "powershell"]
readTime: 6
---

Неправильний час у Windows — причина багатьох несподіваних проблем: Kerberos-аутентифікація в домені перестає працювати якщо розбіжність більше 5 хвилин, SSL-сертифікати видають помилки, логи подій стають незіставними.

---

## Перевірити поточний стан синхронізації

```cmd
w32tm /query /status
```

Показує: джерело часу, останню синхронізацію, зміщення (offset). Якщо offset більше 5 секунд — щось не так.

```cmd
rem Детальна інформація про NTP-джерело
w32tm /query /source

rem Конфігурація служби часу
w32tm /query /configuration
```

---

## Синхронізувати час одразу

```cmd
rem Примусова синхронізація
w32tm /resync /force

rem Якщо не допомогло — перереєстрація служби
net stop w32tm
w32tm /unregister
w32tm /register
net start w32tm
w32tm /resync
```

---

## Налаштувати NTP-сервер для робочої станції

```cmd
rem Вказати зовнішній NTP сервер (для ПК поза доменом)
w32tm /config /manualpeerlist:"time.windows.com,0x9 pool.ntp.org,0x9" /syncfromflags:manual /reliable:YES /update

net stop w32tm
net start w32tm
w32tm /resync
```

Прапорці після кому:
- `0x1` — використовувати SymmetricActive режим
- `0x8` — клієнтський режим (рекомендовано)
- `0x9` = `0x1 + 0x8`

Надійні публічні NTP сервери:
- `time.windows.com` — Microsoft
- `pool.ntp.org` — глобальний пул
- `time.google.com` — Google
- `time.cloudflare.com` — Cloudflare

---

## Ієрархія часу в домені Active Directory

AD використовує чітку ієрархію:

```
Зовнішній NTP (time.windows.com)
         ↓
PDC Emulator (FSMO-роль, Stratum 2)
         ↓
Контролери домену (Stratum 3)
         ↓
Учасники домену (Stratum 4)
```

**Всі учасники домену синхронізуються з контролером домену автоматично.** Не потрібно налаштовувати NTP на кожному ПК окремо.

Якщо час збився на учаснику домену:
```cmd
net stop w32tm
net start w32tm
w32tm /resync /nowait
```

---

## Налаштувати PDC Emulator на зовнішній NTP

PDC Emulator — єдиний DC який має синхронізуватись із зовнішнім джерелом. Знайди PDC:

```cmd
netdom query fsmo
```

На PDC Emulator виконай:

```cmd
w32tm /config /manualpeerlist:"time.windows.com,0x9 pool.ntp.org,0x9" /syncfromflags:manual /reliable:YES /update

net stop w32tm
net start w32tm
w32tm /resync /force
```

Перевір що PDC Emulator синхронізується коректно:

```cmd
w32tm /monitor /computers:pdc-hostname
```

---

## Налаштувати інші DC для синхронізації з PDC

На інших контролерах домену (не PDC):

```cmd
w32tm /config /syncfromflags:domhier /reliable:NO /update
net stop w32tm
net start w32tm
w32tm /resync
```

`domhier` — синхронізуватись відповідно до ієрархії домену (тобто з PDC).

---

## Діагностика проблем

```cmd
rem Перевірити синхронізацію між машинами в домені
w32tm /monitor /computers:dc01,dc02,workstation01

rem Тест NTP-сервера
w32tm /stripchart /computer:time.windows.com /samples:5 /dataonly

rem Журнал подій служби часу
Get-WinEvent -FilterHashtable @{LogName='System'; ProviderName='Microsoft-Windows-Time-Service'} |
  Select-Object TimeCreated, Id, Message | Format-List
```

Через PowerShell — масова перевірка всіх DC:

```powershell
$dcs = Get-ADDomainController -Filter *
foreach ($dc in $dcs) {
    $result = w32tm /monitor /computers:$($dc.Name) 2>&1
    Write-Output "=== $($dc.Name) ==="
    Write-Output $result
}
```

---

## Типові помилки

### "Служба W32Time не запущена"

```cmd
sc start w32tm
rem або
net start w32tm
```

Якщо не запускається:
```cmd
w32tm /unregister
w32tm /register
net start w32tm
```

### Kerberos помилка "Clock skew too great"

Розбіжність часу між клієнтом і DC більше 5 хвилин. Виправ час на клієнті:

```cmd
net time \\dc01 /set /yes
w32tm /resync /force
```

### Час постійно збивається після перезавантаження

Можлива причина: розряджений акумулятор BIOS (CMOS-батарейка). Замінити — маленька кругла батарейка CR2032 на материнській платі.

---

## Підсумок

В домені: лише PDC Emulator налаштовується на зовнішній NTP, решта беруть час автоматично. Для перевірки — `w32tm /query /status` і `w32tm /monitor`. Помилка Kerberos через час — `w32tm /resync /force` на клієнті.
