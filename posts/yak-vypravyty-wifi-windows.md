---
title: "Як виправити Wi-Fi в Windows 10 і 11: повний гайд"
date: "2027-02-09"
publishDate: "2027-06-01"
description: "Виправлення Wi-Fi в Windows 10 і 11. Діагностика, скидання адаптера, оновлення драйверів, виправлення DNS і помилок автентифікації."
tags: ["windows", "wifi", "мережа", "помилки", "драйвери"]
readTime: 5
translatesEn: "how-to-troubleshoot-wifi-windows"
---

Проблеми Wi-Fi в Windows — від відсутнього адаптера до підключено але немає інтернету. Ось системний підхід.

---

## Діагностика

```powershell
# Статус адаптера
Get-NetAdapter | Where-Object {$_.Name -like "*Wi*"} |
  Select-Object Name, Status, LinkSpeed

# Тест підключення
Test-NetConnection -ComputerName "8.8.8.8"
Test-NetConnection -ComputerName "google.com"
```

---

## Виправлення 1: Вимкнути і увімкнути Wi-Fi

```powershell
$adapter = (Get-NetAdapter | Where-Object {$_.Name -like "*Wi*"}).Name
Disable-NetAdapter -Name $adapter -Confirm:$false
Start-Sleep 3
Enable-NetAdapter -Name $adapter -Confirm:$false
```

---

## Виправлення 2: Скинути мережевий стек

```powershell
netsh winsock reset
netsh int ip reset
ipconfig /flushdns
ipconfig /release
ipconfig /renew
Restart-Computer
```

---

## Виправлення 3: Забути і перепідключитись

```powershell
# Список профілів Wi-Fi
netsh wlan show profiles

# Видалити профіль
netsh wlan delete profile name="НазваМережі"
```

Потім підключись заново з паролем.

---

## Виправлення 4: Оновити драйвер

`Win + X` → Диспетчер пристроїв → Мережеві адаптери → ПКМ на Wi-Fi → **Видалити пристрій** → перезавантажити

Завантаж свіжий драйвер з сайту виробника ноутбука.

---

## Виправлення 5: Підключено але немає інтернету

```powershell
# Встановити DNS вручну
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses ("1.1.1.1", "1.0.0.1")

# Перевірити DNS
Resolve-DnsName google.com -Server 1.1.1.1
```

---

## Виправлення 6: Помилка "Не вдається підключитись до цієї мережі"

```powershell
# Видалити збережений профіль
netsh wlan delete profile name="НазваМережі"
```

---

## Виправлення 7: Керування живленням адаптера

Диспетчер пристроїв → Wi-Fi → Властивості → **Управління живленням** → зняти "Дозволити вимкнення пристрою для економії енергії"

---

## Часті питання

### Wi-Fi підключено але не працює тільки на одному сайті?

Це DNS або блокування конкретного сайту — не загальна проблема Wi-Fi. Спробуй `nslookup site.com`.

### Wi-Fi постійно відключається кожні кілька хвилин?

Перевір керування живленням (Виправлення 7). Також перевір налаштування роутера — DHCP lease time і band steering між 2.4/5 ГГц.

---

## Резюме

Діагностика через `Test-NetConnection`. Вимкнути/увімкнути → скинути стек → забути і перепідключити → оновити драйвер → ручний DNS. Для помилок автентифікації — видали збережений профіль.
