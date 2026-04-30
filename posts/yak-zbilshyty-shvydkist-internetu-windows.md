---
title: "Інтернет повільний в Windows: як збільшити швидкість підключення"
date: "2026-04-26"
publishDate: "2026-04-26"
description: "Чому інтернет повільний в Windows і як прискорити: DNS на Cloudflare, вимкнення обмежень Windows Update, перевірка паразитного трафіку і налаштування адаптера."
tags: ["мережа", "windows", "оптимізація", "wifi", "налаштування"]
readTime: 5
---

Провайдер дає 100 Мбіт але реально отримуєш 30? Або Wi-Fi показує сигнал але сайти відкриваються повільно? Ось де шукати причину.

---

## Крок 1: Виміряй реальну швидкість

Спочатку — базова лінія. Зайди на **fast.com** або **speedtest.net** і виміряй швидкість.

Важливо:
- Виміряй по кабелю і через Wi-Fi окремо
- Якщо по кабелю швидко а Wi-Fi повільно — проблема в бездротовому зв'язку
- Якщо обидва повільно — проблема в налаштуваннях Windows або у провайдера

---

## Крок 2: Швидкий DNS сервер

DNS — перший крок при відкритті будь-якого сайту. Повільний DNS = повільне завантаження навіть при швидкому інтернеті.

```powershell
# Змінити DNS на швидкі сервери Cloudflare
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" `
  -ServerAddresses "1.1.1.1", "1.0.0.1"

# Або Google
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" `
  -ServerAddresses "8.8.8.8", "8.8.4.4"

# Очистити старий DNS кеш
ipconfig /flushdns
```

Детальніше: [Як змінити DNS в Windows](/yak-zminyty-dns-windows)

---

## Крок 3: Вимкнути обмеження пропускної здатності Windows

Windows Update резервує до 20% пропускної здатності для фонових завантажень.

`Параметри` → `Windows Update` → `Додаткові параметри` → **Оптимізація доставки** → **Додаткові параметри**:
- **Абсолютна пропускна здатність** → зніми обмеження або встанови 0%

---

## Крок 4: Перевірити паразитний трафік

```powershell
# Хто з'їдає трафік прямо зараз
Get-NetAdapterStatistics | Select-Object Name, ReceivedBytes, SentBytes

# Процеси з мережевою активністю
Get-NetTCPConnection -State Established |
  Select-Object RemoteAddress, RemotePort,
    @{N="Process";E={(Get-Process -Id $_.OwningProcess -EA SilentlyContinue).Name}} |
  Where-Object { $_.Process -ne $null } |
  Sort-Object Process | Format-Table -AutoSize
```

---

## Крок 5: Налаштувати мережевий адаптер

```powershell
# Переглянути налаштування адаптера
Get-NetAdapterAdvancedProperty -Name "Ethernet" |
  Select-Object DisplayName, DisplayValue | Format-Table -AutoSize

# Вимкнути ECO режим (знижує продуктивність)
Set-NetAdapterAdvancedProperty -Name "Ethernet" `
  -DisplayName "Energy Efficient Ethernet" -DisplayValue "Disabled"

# Вимкнути Interrupt Moderation (знижує затримку)
Set-NetAdapterAdvancedProperty -Name "Ethernet" `
  -DisplayName "Interrupt Moderation" -DisplayValue "Disabled"
```

---

## Крок 6: Wi-Fi оптимізація

- Підключись по кабелю якщо можливо — стабільніше і швидше
- Зміни канал Wi-Fi на роутері (1, 6 або 11 для 2.4 ГГц)
- Переключись на 5 ГГц якщо роутер підтримує — менше перешкод
- Встанови правильний регіон в налаштуваннях Wi-Fi адаптера

```powershell
# Вимкнути Wi-Fi Sense і автопідключення до відкритих мереж
Set-ItemProperty "HKLM:\SOFTWARE\Microsoft\WcmSvc\wifinetworkmanager\config" `
  -Name "AutoConnectAllowedOEM" -Value 0 -Type DWord
```

---

## Крок 7: QoS резервування

Windows резервує 20% пропускної здатності для QoS. На домашньому ПК це можна вимкнути.

`Win + R` → `gpedit.msc` → **Конфігурація комп'ютера** → **Адміністративні шаблони** → **Мережа** → **Планувальник пакетів QoS** → **Обмежити резервовану пропускну здатність** → **Увімкнено** → **Пропускна здатність (%): 0**.

---

## Підсумок

DNS на 1.1.1.1 + вимкнути обмеження Windows Update + перевірити паразитний трафік — три кроки що найчастіше дають результат. Якщо Wi-Fi повільний — спробуй кабель: якщо кабель швидкий, проблема в бездротовому з'єднанні.
