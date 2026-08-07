---
title: "Встановлення драйверів Windows 10 і 11: покрокова інструкція для всіх пристроїв"
date: "2026-06-08"
publishDate: "2027-06-01"
updated: "2026-06-08"
description: "Як встановити драйвери на Windows 10 і 11 після чистої інсталяції. Автоматичне оновлення, ручне встановлення, пошук драйверів по ID пристрою. Вирішення конфліктів."
tags: ["windows", "драйвери", "встановлення", "обладнання", "налаштування"]
readTime: 7
translatesEn: "how-to-install-drivers-windows-10-11"
---

Після чистої установки Windows деякі пристрої можуть не працювати: звук зник, Wi-Fi не підключається, відеокарта показує низьку роздільну здатність. Причина — відсутні драйвери.

---

## Спосіб 1 — Автоматично через Windows Update (найпростіший)

Windows 11 і 10 вміють встановлювати більшість драйверів автоматично.

```
Win + I → Windows Update → Перевірити наявність оновлень
```

Також перевір додаткові оновлення:
```
Windows Update → Додаткові параметри → Необов'язкові оновлення → Оновлення драйверів
```

**Що встановлюється автоматично:** чіпсет, мережа, базові аудіо та відео драйвери.

**Що НЕ встановлюється:** спеціальні драйвери відеокарт (NVIDIA/AMD), принтери, специфічне обладнання.

---

## Спосіб 2 — Диспетчер пристроїв

Знайди пристрої без драйверів:

```
Win + X → Диспетчер пристроїв
```

Пристрої з проблемами позначені жовтим знаком оклику `⚠️`.

### Автоматичний пошук
1. Правою кнопкою на пристрій → **"Оновити драйвер"**
2. **"Автоматичний пошук драйверів"**
3. Windows шукає в Windows Update

### Пошук по ID пристрою (якщо автоматично не знайшло)

1. Правою кнопкою → **"Властивості"** → вкладка **"Відомості"**
2. В списку вибери **"ІД обладнання"**
3. Скопіюй перший рядок (наприклад `PCI\VEN_10DE&DEV_2204`)
4. Встав в пошук на [devicehunt.com](https://devicehunt.com) або [pcilookup.com](https://www.pcilookup.com)
5. Знайди виробника → завантаж з офіційного сайту

---

## Спосіб 3 — Офіційні сайти виробників

Найнадійніший спосіб — завантажити з офіційного сайту виробника.

### Відеокарти

**NVIDIA:**
1. [nvidia.com/drivers](https://www.nvidia.com/drivers) або через GeForce Experience
2. Вибери серію карти → завантаж

```powershell
# Дізнатись модель відеокарти
Get-WmiObject Win32_VideoController | Select-Object Name, DriverVersion
```

**AMD:**
1. [amd.com/support](https://www.amd.com/support)
2. Вибери продукт → завантаж Adrenalin

**Intel (інтегрована):
1. [intel.com/content/www/us/en/support.html](https://www.intel.com/content/www/us/en/support.html)
2. Або скористайся Intel Driver & Support Assistant

### Ноутбуки (найпростіший варіант)

Для ноутбуків — іди на сайт виробника по моделі:

| Виробник | Сайт | Де знайти модель |
|---------|------|-----------------|
| ASUS | asus.com/ua/support | Наклейка знизу або `msinfo32` |
| Lenovo | support.lenovo.com | Наклейка або Lenovo Vantage |
| HP | support.hp.com | Наклейка або HP Support Assistant |
| Dell | dell.com/support | Наклейка або Dell SupportAssist |
| Acer | acer.com/ua/uk/support | Наклейка знизу |

```powershell
# Модель комп'ютера
Get-WmiObject Win32_ComputerSystem | Select-Object Manufacturer, Model
```

### Чіпсет і материнська плата

```powershell
# Дізнатись материнську плату
Get-WmiObject Win32_BaseBoard | Select-Object Manufacturer, Product
```

Іди на сайт виробника материнської плати (ASUS, MSI, Gigabyte, ASRock) і завантаж драйвер чіпсету.

---

## Спосіб 4 — PowerShell перевірка і встановлення

```powershell
# Всі пристрої з помилками
Get-PnpDevice | Where-Object {$_.Status -eq 'Error'} | 
  Select-Object FriendlyName, InstanceId

# Пристрої без драйверів
Get-PnpDevice | Where-Object {$_.Status -eq 'Unknown'} |
  Select-Object FriendlyName, InstanceId

# Оновити конкретний драйвер через Windows Update
$device = Get-PnpDevice -FriendlyName "Ethernet Controller"
Update-PnpDevice -InstanceId $device.InstanceId -Confirm:$false
```

---

## Порядок встановлення драйверів після чистої установки

Важливо встановлювати в правильному порядку:

1. **Чіпсет** — основа, без нього інші можуть не працювати
2. **Відеокарта** — NVIDIA/AMD/Intel
3. **Мережа** — LAN і Wi-Fi
4. **Аудіо** — Realtek або Conexant
5. **Інше** — принтери, веб-камери, спеціальне обладнання

---

## Вирішення проблем

### Драйвер встановлено але пристрій не працює

```powershell
# Перезапустити пристрій
Disable-PnpDevice -InstanceId "PCI\VEN_..." -Confirm:$false
Enable-PnpDevice  -InstanceId "PCI\VEN_..." -Confirm:$false

# Або через Диспетчер пристроїв
# ПКМ → Вимкнути → Включити
```

### Конфлікт драйверів — "Пристрій не може запуститись (код 10)"

```cmd
# Видалити проблемний драйвер
pnputil /delete-driver [назва .inf файлу] /uninstall /force
```

Перезавантаж → встанови заново.

### BSOD після встановлення драйвера

Завантажся в безпечному режимі (F8 при старті або `Win + I → Відновлення → Розширений запуск`) і видали нещодавно встановлений драйвер.

```powershell
# Переглянути нещодавно встановлені драйвери
Get-WinEvent -LogName System | 
  Where-Object {$_.Id -eq 7045} |
  Select-Object TimeCreated, Message |
  Sort-Object TimeCreated -Descending |
  Select-Object -First 10
```

---

## Часті питання

### Чи можна встановити всі драйвери одним інструментом?
Є утиліти на зразок Driver Booster — але вони часто встановлюють застарілі або несумісні версії. Рекомендую офіційні сайти.

### Чи потрібно постійно оновлювати драйвери?
Ні — якщо пристрій працює стабільно, оновлення може нашкодити. Оновлюй тільки якщо є проблеми або для нового ігрового контенту (відеокарти).

### Як відкотити драйвер до попередньої версії?
`Диспетчер пристроїв → Властивості → Драйвер → Відкотити драйвер`

---

## Резюме

| Тип пристрою | Де брати драйвер |
|-------------|-----------------|
| Відеокарта NVIDIA | nvidia.com/drivers |
| Відеокарта AMD | amd.com/support |
| Ноутбук | Сайт виробника по моделі |
| Невідомий пристрій | ID пристрою → devicehunt.com |
| Більшість пристроїв | Windows Update → Необов'язкові оновлення |
