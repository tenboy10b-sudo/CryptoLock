---
title: "Як налаштувати автоматичне блокування екрана через GPO"
date: "2025-04-26"
description: "Встановлення таймауту блокування екрана і заставки для всіх користувачів через Group Policy в Windows 10 і 11."
tags: ["gpo", "групова-політика", "безпека", "облікові-записи"]
readTime: 4
---

Автоматичне блокування — обов'язкова вимога безпеки на корпоративних ПК. Через GPO можна задати однаковий таймаут для всіх.

## Налаштування через GPO

**Крок 1.** `gpedit.msc` → перейди:
```
User Configuration
  → Administrative Templates
    → Control Panel
      → Personalization
```

**Крок 2.** Відкрий **Enable screen saver** → **Enabled** → OK.

**Крок 3.** Відкрий **Password protect the screen saver** → **Enabled** → OK.

**Крок 4.** Відкрий **Screen saver timeout** → **Enabled** → встанови час в секундах:
- 300 = 5 хвилин
- 600 = 10 хвилин
- 900 = 15 хвилин (рекомендовано для офісу)

---

## Заборонити користувачу змінювати таймаут

```
User Configuration
  → Administrative Templates
    → Control Panel
      → Personalization
```

Увімкни **Prevent changing screen saver** → користувач не зможе змінити або вимкнути заставку.

---

## Налаштування через реєстр

```cmd
reg add "HKCU\Control Panel\Desktop" /v ScreenSaveTimeOut /t REG_SZ /d "600" /f
reg add "HKCU\Control Panel\Desktop" /v ScreenSaverIsSecure /t REG_SZ /d "1" /f
reg add "HKCU\Control Panel\Desktop" /v ScreenSaveActive /t REG_SZ /d "1" /f
```

---

## Окреме блокування через інактивність (Interactive Logon)

Більш надійний спосіб — блокування через параметр безпеки:

`gpedit.msc` → перейди:
```
Computer Configuration
  → Windows Settings
    → Security Settings
      → Local Policies
        → Security Options
```

Знайди **Interactive logon: Machine inactivity limit** → встанови кількість секунд (наприклад `600` = 10 хвилин).

Це надійніше ніж заставка — блокує навіть якщо заставка вимкнена користувачем.

---

## Швидке блокування вручну

Комбінація `Win + L` блокує екран миттєво. Навчи користувачів використовувати її щоразу при відході від ПК.

> Також дивись: [Як заблокувати обліковий запис користувача в Windows](/yak-zablokuvaty-oblikovyy-zapys)
