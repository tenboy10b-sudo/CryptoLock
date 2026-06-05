---
title: "Як виправити синхронізацію часу Windows і налаштувати NTP сервер"
date: "2026-08-12"
publishDate: "2026-08-12"
description: "Виправлення синхронізації годинника Windows і налаштування NTP сервера. Примусова синхронізація, власний NTP, виправлення помилок W32tm."
tags: ["windows", "ntp", "синхронізація-часу", "адміністрування", "powershell"]
readTime: 3
translatesEn: "how-to-configure-windows-time-sync"
---

Неправильний системний час ламає SSL сертифікати, Kerberos автентифікацію і заплановані завдання.

---

## Примусова синхронізація

```powershell
Stop-Service w32tm -Force
Start-Service w32tm
w32tm /resync /force
w32tm /query /status
```

---

## Налаштувати NTP сервер

```powershell
w32tm /config /manualpeerlist:"time.cloudflare.com,0x8 pool.ntp.org,0x8" `
  /syncfromflags:manual /reliable:YES /update

Restart-Service w32tm
w32tm /query /configuration
```

---

## Виправити помилки

```powershell
# Помилка 0x800705B4 — таймаут
w32tm /config /manualpeerlist:"time.windows.com,0x8" /update
w32tm /resync /force

# Перереєструвати службу
w32tm /unregister
w32tm /register
Start-Service w32tm
```

---

## Встановити часовий пояс

```powershell
Set-TimeZone -Id "FLE Standard Time"  # Україна/Київ
Get-TimeZone
```

---

## Часті питання

### Годинник губить час після перезавантаження?

Зазвичай розряджена батарея CMOS (кругла батарейка на материнській платі, ~$2). Після заміни встанови час в BIOS.

### Синхронізація не вдається в корпоративній мережі?

Брандмауери часто блокують UDP порт 123 (NTP). Синхронізуйся з внутрішнього контролера домену або корпоративного NTP сервера.

---

## Резюме

`w32tm /resync /force` для примусової синхронізації. `w32tm /config /manualpeerlist` для NTP. `time.cloudflare.com` або `pool.ntp.org` — надійні сервери. ПК в домені синхронізуються з DC автоматично.
