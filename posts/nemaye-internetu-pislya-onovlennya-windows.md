---
title: "Немає інтернету після оновлення Windows: як виправити"
date: "2027-02-04"
publishDate: "2026-08-24"
description: "Виправлення втрати інтернету після оновлення Windows 10 і 11. Скидання TCP/IP, відкат драйвера, видалення оновлення, виправлення Winsock і DNS."
tags: ["windows", "мережа", "windows-update", "помилки", "налаштування"]
readTime: 4
translatesEn: "how-to-fix-no-internet-after-windows-update"
---

Оновлення Windows іноді ламає мережеве підключення. Ось як відновити без перевстановлення.

---

## Швидке виправлення

```powershell
# Скинути мережевий стек
netsh winsock reset
netsh int ip reset
ipconfig /flushdns
ipconfig /release
ipconfig /renew
```

Перезавантажись і перевір.

---

## Перевірити стан адаптера

```powershell
Get-NetAdapter | Select-Object Name, Status, LinkSpeed
```

Якщо `Disabled` — увімкни:
```powershell
Enable-NetAdapter -Name "Ethernet" -Confirm:$false
```

---

## Відкотити драйвер мережі

Оновлення могло замінити робочий драйвер несумісним:

`Win + X` → Диспетчер пристроїв → Мережеві адаптери → ПКМ → Властивості → **Драйвер** → **Відкотити**

---

## Видалити проблемне оновлення

```powershell
Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 5
wusa /uninstall /kb:5055523 /quiet /norestart
```

---

## Виправити DNS

```powershell
$adapter = (Get-NetAdapter | Where-Object {$_.Status -eq "Up"}).Name
Set-DnsClientServerAddress -InterfaceAlias $adapter -ServerAddresses ("1.1.1.1", "8.8.8.8")
```

---

## Часті питання

### Wi-Fi адаптер зник з Диспетчера пристроїв?

Оновлення могло видалити драйвер. Диспетчер пристроїв → Вигляд → Показати приховані пристрої. Якщо є — увімкни. Якщо немає — завантаж драйвер з сайту виробника ноутбука.

### Інтернет є але тільки на деяких сайтах?

Скоріш за все проблема DNS. Встанови 1.1.1.1 і 8.8.8.8, очисти кеш: `Clear-DnsClientCache`.

---

## Резюме

Порядок: скинути Winsock/IP → відкотити драйвер → видалити оновлення → ручний DNS. Більшість проблем після оновлення вирішує `netsh winsock reset` + відкат драйвера + перезавантаження.
