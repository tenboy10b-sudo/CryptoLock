---
title: "DS4Windows: як підключити геймпад PS4 і PS5 до Windows 10 і 11"
date: "2026-10-23"
publishDate: "2026-10-23"
updated: "2026-09-07"
description: "Як налаштувати DS4Windows для геймпада DualShock 4 і DualSense на Windows. Підключення через USB і Bluetooth, налаштування кнопок, вирішення проблем з розпізнаванням."
tags: ["windows", "геймпад", "ігри", "ds4windows", "bluetooth"]
readTime: 6
translatesEn: "ds4windows-ps4-ps5-controller-windows-guide"
---

DS4Windows — безкоштовна програма яка дозволяє використовувати геймпад PlayStation 4 і 5 на Windows як Xbox контролер. Більшість ігор на ПК підтримують тільки Xbox — DS4Windows вирішує цю проблему.

---

## Що потрібно

- Геймпад DualShock 4 (PS4) або DualSense (PS5)
- USB кабель або Bluetooth адаптер
- Windows 10/11 64-bit

---

## Крок 1 — Встановлення DS4Windows

1. Завантаж з [GitHub: Ryochan7/DS4Windows](https://github.com/Ryochan7/DS4Windows/releases)
2. Розпакуй архів в будь-яку папку (портативна програма)
3. Запусти `DS4Windows.exe`
4. При першому запуску майстер попросить встановити **ViGEmBus** — драйвер віртуального контролера → **"Install"**

> **Увага:** завантажуй тільки з офіційного GitHub. Є підроблені сайти з вірусами.

---

## Крок 2 — Підключення геймпада

### Через USB
1. Підключи геймпад кабелем USB-C (PS5) або microUSB (PS4)
2. DS4Windows автоматично визначить контролер
3. Зелений індикатор в програмі — все працює

### Через Bluetooth

**PS4 DualShock 4:**
1. Утримуй `PS + Share` (~3 сек) — індикатор почне швидко блимати
2. Windows → Налаштування → Bluetooth → знайди **"Wireless Controller"** → підключи

**PS5 DualSense:**
1. Утримуй `PS + Кнопка Create` (~3 сек)
2. Знайди **"DualSense Wireless Controller"** в Bluetooth пристроях

---

## Крок 3 — Налаштування профілю

```
DS4Windows → Profiles → Edit (Default)
```

### Перемикання режимів
- **"Emulate Xbox 360 Controller"** — для ігор що не підтримують PS контролери (Steam ігри, більшість PC ігор)
- **"Use DS4 directly"** — для ігор з нативною підтримкою PS

### Кнопки і чутливість
- **L2/R2 Deadzone** — зміна мертвої зони тригерів
- **Left/Right Stick Deadzone** — мертва зона стіків
- **Remap buttons** — перепризначення кнопок

### Тачпад
Тачпад DualShock 4 можна використовувати як мишу:
```
Edit Profile → Other → Use touchpad as mouse → увімкни
```

---

## Налаштування для Steam

Steam має вбудовану підтримку PS контролерів. Якщо використовуєш Steam:

```
Steam → Налаштування → Контролер → Загальні налаштування контролера
→ Підтримка конфігурації PlayStation
```

В цьому режимі DS4Windows може не знадобитись — Steam сам обробляє контролер.

**Конфлікт Steam і DS4Windows:**
Якщо обидва активні одночасно — може бути подвійний ввід. Рішення:
- Або вимкни підтримку PS в Steam
- Або вимкни DS4Windows при грі в Steam ігри

---

## Підсвічування і вібрація

```
Edit Profile → Light Bar
```
- Вибери колір підсвічування
- Налаштуй яскравість
- Увімкни/вимкни пульсацію при зарядці

```
Edit Profile → Rumble
```
- Heavy/Light Motor — сила вібрації

---

## Вирішення проблем

### Геймпад не визначається
1. Перевстанови ViGEmBus: DS4Windows → Settings → Controller → Install ViGEmBus
2. Перевір Device Manager — помилки в "Human Interface Devices"
3. Спробуй інший USB порт або кабель

### Подвійний ввід (рухи реєструються двічі)
Конфлікт з Steam. Вимкни в Steam:
```
Steam → Settings → Controller → Desktop Configuration → деактивуй PS підтримку
```

### Bluetooth відключається
- Перевір чи не вимкнено Bluetooth в автономному режимі Windows
- Оновіть драйвер Bluetooth адаптера
- Зарядіть геймпад (нижче 10% — нестабільне з'єднання)

### "Controller not detected" після оновлення Windows
Перевстанови DS4Windows і ViGEmBus — Windows Update іноді видаляє сторонні драйвери.

---

## Автозапуск DS4Windows

```
DS4Windows → Settings → General → Launch DS4Windows on Startup
```

---

## Резюме

| Крок | Дія |
|------|-----|
| 1 | Завантажити DS4Windows з GitHub |
| 2 | Встановити ViGEmBus при першому запуску |
| 3 | Підключити геймпад USB або Bluetooth |
| 4 | Вибрати профіль "Emulate Xbox 360" |
| 5 | Steam: вимкнути подвійну підтримку PS |
