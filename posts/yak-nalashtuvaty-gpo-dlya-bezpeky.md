---
title: "Групова політика для домашнього ПК: корисні налаштування безпеки"
date: "2026-05-26"
publishDate: "2026-05-26"
description: "Корисні налаштування Group Policy для домашнього або офісного ПК: обмеження USB, блокування CMD, автоблокування екрана, контроль оновлень і захист від шкідливого ПЗ."
tags: ["windows", "групова-політика", "безпека", "gpo"]
readTime: 5
---

Редактор групової політики (`gpedit.msc`) доступний у Windows Pro і дозволяє тонко налаштувати поведінку системи. Ось найкорисніші налаштування безпеки для окремого ПК.

---

## Відкрити редактор

`Win + R` → `gpedit.msc`

Доступно тільки в Windows 10/11 **Pro, Enterprise, Education**. На Home — недоступно.

---

## Автоблокування екрана

**Computer Configuration** → **Windows Settings** → **Security Settings** → **Local Policies** → **Security Options**:

- **Interactive logon: Machine inactivity limit** → встанови 300 (5 хвилин)

Або через **User Configuration** → **Administrative Templates** → **Control Panel** → **Personalization**:
- **Enable screen saver** → Enabled
- **Screen saver timeout** → 300 секунд
- **Password protect the screen saver** → Enabled

---

## Заборона запуску CMD і PowerShell

Корисно для спільних ПК або дитячих акаунтів.

**User Configuration** → **Administrative Templates** → **System**:
- **Prevent access to the command prompt** → Enabled → також вибери "Yes" для вимкнення cmd в скриптах

**User Configuration** → **Administrative Templates** → **Windows Components** → **Windows PowerShell**:
- **Turn on Script Execution** → Enabled → **Allow only signed scripts**

---

## Блокування USB-накопичувачів

**Computer Configuration** → **Administrative Templates** → **System** → **Removable Storage Access**:
- **Removable Disks: Deny read access** → Enabled (заборона читання)
- **Removable Disks: Deny write access** → Enabled (заборона запису)

Для заборони тільки нових пристроїв залишаючи вже використовувані:

**Computer Configuration** → **Administrative Templates** → **System** → **Device Installation** → **Device Installation Restrictions** → **Prevent installation of removable devices** → Enabled

---

## Контроль запуску програм

**User Configuration** → **Administrative Templates** → **System**:
- **Don't run specified Windows applications** → Enabled → додай назви exe файлів

Або для повного контролю використовуй AppLocker (**Computer Configuration** → **Windows Settings** → **Security Settings** → **Application Control Policies** → **AppLocker**).

---

## Вимкнення автозапуску

**Computer Configuration** → **Administrative Templates** → **Windows Components** → **AutoPlay Policies**:
- **Turn off AutoPlay** → Enabled → **All drives**

---

## Налаштування паролів

**Computer Configuration** → **Windows Settings** → **Security Settings** → **Account Policies** → **Password Policy**:

| Параметр | Рекомендоване значення |
|----------|----------------------|
| Мінімальна довжина пароля | 12 символів |
| Складність пароля | Увімкнено |
| Максимальний термін дії | 90 днів |
| Мінімальний термін дії | 1 день |
| Журнал паролів | 5 паролів |

---

## Блокування після невдалих спроб входу

**Computer Configuration** → **Windows Settings** → **Security Settings** → **Account Policies** → **Account Lockout Policy**:

- **Account lockout threshold** → 5 спроб
- **Account lockout duration** → 15 хвилин
- **Reset account lockout counter after** → 15 хвилин

---

## Застосувати зміни негайно

```cmd
gpupdate /force
```

Перезавантаження не потрібне для більшості налаштувань.

---

## Резюме

Для домашнього ПК: увімкни автоблокування екрана, налаштуй політику паролів і заблокуй автозапуск з USB. Для спільного ПК додай заборону CMD і обмеження на USB-накопичувачі. `gpupdate /force` застосовує зміни без перезавантаження.
